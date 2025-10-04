import React, { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Play,
  Navigation2,
  Bell,
  ToggleLeft,
  ToggleRight,
  Phone,
  MessageSquare,
  Camera,
  Star,
  Crosshair
} from 'lucide-react';
import DashboardTopbar from '../components/DashboardTopbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import Sidebar from '../components/Sidebar';
import { userAtom, isAuthenticatedAtom } from '../store/authAtoms';
import { driverAPI, etaAPI } from '../services/api';
import useGeolocation from '../hooks/useGeolocation';
import socketService from '../services/socket';
import mapboxService from '../services/mapbox';
import toast from 'react-hot-toast';

const DriverDashboard = () => {
  const [driverStatus, setDriverStatus] = useState('available');
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [assignedPickups, setAssignedPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 40.7128,
    lng: -74.0060,
    address: '123 Main St, New York, NY'
  });
  const [etaUpdates, setEtaUpdates] = useState({});
  const [locationTracking, setLocationTracking] = useState(false);

  // Jotai atoms
  const [user] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  // Geolocation hook for driver tracking
  const { 
    location, 
    error: locationError, 
    loading: locationLoading, 
    watchPosition,
    getCurrentPosition,
    hasLocation 
  } = useGeolocation({ immediate: false });

  // Load assigned pickups from API
  const loadAssignedPickups = useCallback(async () => {
    console.log('� loadAssignedPickups STARTED');
    console.log('�🔍 loadAssignedPickups called - isAuthenticated:', isAuthenticated);
    console.log('🔍 Current driver:', user);
    
    if (!isAuthenticated) {
      console.log('❌ Driver not authenticated, skipping pickup load');
      return;
    }
    
    try {
      setLoading(true);
      console.log('📡 Making API call to getAssignedPickups...');
      
      const response = await driverAPI.getAssignedPickups();
      console.log('✅ API Response received:', response);
      console.log('📦 Response status:', response?.status);
      console.log('📦 Response data:', response.data);
      console.log('📦 Response data type:', typeof response.data);
      console.log('📦 Response data keys:', response.data ? Object.keys(response.data) : 'no data');
      console.log('📦 Response data pickups:', response.data?.data?.pickups);
      console.log('📦 Response data pickups type:', typeof response.data?.data?.pickups);
      
      // Handle both response.data.pickups and response.data.data.pickups
      let pickupsData = null;
      if (response.data?.data?.pickups) {
        pickupsData = response.data.data.pickups;
        console.log('🎯 Using nested structure: response.data.data.pickups');
      } else if (response.data?.pickups) {
        pickupsData = response.data.pickups;
        console.log('🎯 Using flat structure: response.data.pickups');
      } else {
        console.log('🎯 No pickups found in either structure');
      }
      
      console.log('📊 Final pickupsData:', pickupsData);
      console.log('📊 pickupsData type:', typeof pickupsData);
      console.log('📊 pickupsData isArray:', Array.isArray(pickupsData));
      
      if (pickupsData && Array.isArray(pickupsData)) {
        console.log('📝 Setting assigned pickups:', pickupsData);
        console.log('📊 Number of assigned pickups:', pickupsData.length);
        setAssignedPickups(pickupsData);
      } else {
        console.log('⚠️ No assigned pickups data in response');
        console.log('🔍 Available response structure:', Object.keys(response.data || {}));
        setAssignedPickups([]);
      }
    } catch (error) {
      console.error('❌ Error loading assigned pickups:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      toast.error('Failed to load assigned pickups');
    } finally {
      setLoading(false);
      console.log('🏁 loadAssignedPickups completed');
    }
  }, [isAuthenticated, user]);

  // Load pickups on component mount
  useEffect(() => {
    console.log('🚀 DriverDashboard mounted - calling loadAssignedPickups');
    loadAssignedPickups();
  }, [loadAssignedPickups]);

  // Additional debug useEffect for driver authentication
  useEffect(() => {
    console.log('🔍 Driver Authentication state changed:', { 
      isAuthenticated, 
      driver: user?.email || 'No driver',
      driverId: user?._id || 'No ID',
      driverStatus 
    });
  }, [isAuthenticated, user, driverStatus]);

  // Debug logging for driver state
  console.log('🔍 Driver Dashboard State Debug:', {
    isAuthenticated,
    driver: user?.name || 'No driver',
    assignedPickupsCount: assignedPickups.length,
    driverStatus,
    loading,
    assignedPickupsArray: assignedPickups
  });

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'new_assignment',
      title: 'New Pickup Assigned',
      message: 'Electronic waste pickup at 321 Elm Road',
      time: '2 mins ago',
      priority: 'high'
    },
    {
      id: 2,
      type: 'route_update',
      title: 'Route Optimized',
      message: 'Your route has been updated for efficiency',
      time: '15 mins ago',
      priority: 'normal'
    },
    {
      id: 3,
      type: 'fraud_alert',
      title: 'Fraud Alert',
      message: 'Suspicious activity detected at Oak Street location',
      time: '1 hour ago',
      priority: 'urgent'
    }
  ];

  // Sidebar navigation items
  const sidebarItems = [
    { path: '/driver', icon: MapPin, label: 'Live Map' },
    { path: '/driver/pickups', icon: Clock, label: 'My Pickups' },
    { path: '/driver/notifications', icon: Bell, label: 'Notifications', badge: notifications.length },
    { path: '/driver/profile', icon: Star, label: 'Performance' }
  ];

  // Calculate ETA using Mapbox (memoized to prevent re-renders)
  const calculateAndUpdateETA = useCallback(async (pickupId, driverCoords, pickupCoords) => {
    try {
      const etaResult = await mapboxService.calculateETA(driverCoords, pickupCoords);
      
      if (etaResult.success) {
        setEtaUpdates(prev => ({
          ...prev,
          [pickupId]: etaResult.eta
        }));
        
        // Emit ETA update via socket
        socketService.emitETARequest(pickupId, driverCoords, pickupCoords);
      }
    } catch (error) {
      console.error('ETA calculation failed:', error);
    }
  }, []); // No dependencies needed

  // Initialize socket connection and location tracking
  useEffect(() => {
    socketService.connect();
    
    // Listen for ETA updates
    socketService.onETAUpdate((data) => {
      setEtaUpdates(prev => ({
        ...prev,
        [data.pickupId]: data.eta
      }));
    });

    return () => {
      socketService.stopLocationTracking();
      socketService.disconnect();
    };
  }, []);

  // Update current location when geolocation changes
  useEffect(() => {
    if (location.latitude && location.longitude) {
      const newLocation = {
        lat: location.latitude,
        lng: location.longitude,
        address: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
      };
      
      setCurrentLocation(newLocation);
      
      // Emit location update via socket if tracking is enabled
      if (locationTracking && driverStatus === 'available') {
        socketService.emitLocationUpdate(location);
      }
    }
  }, [location.latitude, location.longitude, locationTracking, driverStatus]);

  // Separate effect to handle ETA calculations when location changes
  useEffect(() => {
    if (location.latitude && location.longitude && locationTracking) {
      // Calculate ETA for assigned pickups
      assignedPickups.forEach(pickup => {
        if (pickup.status === 'assigned' || pickup.status === 'in-route') {
          calculateAndUpdateETA(pickup.id, [location.longitude, location.latitude], [pickup.coordinates.lng, pickup.coordinates.lat]);
        }
      });
    }
  }, [location.latitude, location.longitude, locationTracking, calculateAndUpdateETA]); // Include memoized function

  // Toggle location tracking
  const toggleLocationTracking = () => {
    if (!locationTracking) {
      // Start tracking
      const cleanupWatch = watchPosition();
      socketService.startLocationTracking(10000); // 10 seconds interval
      setLocationTracking(true);
      toast.success('Live location tracking enabled');
      
      return cleanupWatch;
    } else {
      // Stop tracking
      socketService.stopLocationTracking();
      setLocationTracking(false);
      toast.success('Live location tracking disabled');
    }
  };

  const handleAcceptPickup = async (pickupId) => {
    const pickup = assignedPickups.find(p => p.id === pickupId);
    if (pickup && hasLocation) {
      // Calculate initial ETA
      await calculateAndUpdateETA(
        pickupId, 
        [location.longitude, location.latitude], 
        [pickup.coordinates.lng, pickup.coordinates.lat]
      );
      
      toast.success(`Accepted pickup for ${pickup.customerName}`);
    }
  };

  const handleStartRoute = (pickupId) => {
    const pickup = assignedPickups.find(p => p.id === pickupId);
    if (pickup) {
      // In real app, this would open navigation app or start in-app routing
      const mapUrl = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${pickup.coordinates.lat},${pickup.coordinates.lng}`;
      window.open(mapUrl, '_blank');
      
      toast.success('Route started - navigation opened');
    }
  };

  const handleCompletePickup = (pickupId) => {
    console.log(`Completed pickup ${pickupId}`);
    toast.success('Pickup marked as completed!');
    // In real app, this would update pickup status
  };

  return (
    <div className="min-h-screen">
      {/* Dashboard Topbar */}
      <DashboardTopbar />
      
      {/* Sidebar */}
      <Sidebar items={sidebarItems} className="w-64 h-screen fixed left-0 top-16 z-50" />
      
      {/* Main Content - Full Width with sidebar offset */}
      <div className="pt-16 pl-16">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">
                Driver Dashboard
              </h1>
              <p className="text-gray-800 font-bold text-lg">
                Current location: {currentLocation.address}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Location Tracking Toggle */}
              <div className="flex items-center space-x-3">
                <span className="font-bold text-gray-900">
                  Live Tracking
                </span>
                <button
                  onClick={toggleLocationTracking}
                  className={`transition-colors ${
                    locationTracking ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {locationTracking ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>

              {/* Driver Status Toggle */}
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-gray-700">
                  {driverStatus === 'available' ? 'Available' : 'Busy'}
                </span>
                <button
                  onClick={() => setDriverStatus(prev => prev === 'available' ? 'busy' : 'available')}
                  className="text-primary-500 hover:text-primary-600 transition-colors"
                >
                  {driverStatus === 'available' ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>
              
              {/* Get Current Location Button */}
              <Button
                variant="neutral"
                size="sm"
                onClick={getCurrentPosition}
                disabled={locationLoading}
                className="flex items-center space-x-2"
              >
                <Crosshair className="w-4 h-4" />
                <span>Update Location</span>
              </Button>
              
              {/* Notifications */}
              <Button
                variant="neutral"
                onClick={() => setShowNotifications(true)}
                className="relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000000] bg-cyan-100">
              <CardContent className="text-center pt-6">
                <div className="text-2xl font-black text-gray-900 mb-2">
                  {assignedPickups.length}
                </div>
                <div className="text-sm font-bold text-gray-800">Assigned Pickups</div>
              </CardContent>
            </Card>
            
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000000] bg-lime-100">
              <CardContent className="text-center pt-6">
                <div className="text-2xl font-black text-gray-900 mb-2">
                  8
                </div>
                <div className="text-sm font-bold text-gray-800">Completed Today</div>
              </CardContent>
            </Card>
            
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000000] bg-yellow-100">
              <CardContent className="text-center pt-6">
                <div className="text-2xl font-black text-gray-900 mb-2">
                  4.8
                </div>
                <div className="text-sm font-bold text-gray-800">Rating</div>
              </CardContent>
            </Card>
            
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000000] bg-pink-100">
              <CardContent className="text-center pt-6">
                <div className="text-2xl font-black text-gray-900 mb-2">
                  32
                </div>
                <div className="text-sm font-bold text-gray-800">Miles Driven</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Live Map */}
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000000] bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-extra-bold text-gray-900 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-primary-500" />
                  Live Location & Routes
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {/* Live Location Status */}
                {locationTracking && hasLocation && (
                  <div className="bg-green-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-bold text-green-800">
                        Live tracking active
                      </span>
                    </div>
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </p>
                  </div>
                )}

                {locationError && (
                  <div className="bg-red-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-bold text-red-800">
                        Location Error
                      </span>
                    </div>
                    <p className="text-xs text-red-600 font-semibold mt-1">
                      {locationError.message}
                    </p>
                  </div>
                )}

                {/* Interactive Map */}
                <div className="h-80 bg-gray-100 rounded-lg border-2 border-gray-200 mb-4 flex items-center justify-center">
                  <p className="text-gray-500 font-semibold">Map Component Placeholder</p>
                </div>
                
                <div className="space-y-2">
                  {assignedPickups.slice(0, 2).map((pickup) => (
                    <div key={pickup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          pickup.priority === 'urgent' ? 'bg-red-500' : 
                          pickup.priority === 'high' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <div>
                          <div className="font-bold text-sm text-gray-900">{pickup.address}</div>
                          <div className="text-xs text-gray-600 font-medium">{pickup.distance} • {pickup.estimatedTime}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="neutral">
                        <Navigation className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Assigned Pickups */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-extra-bold text-gray-900 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-primary-500" />
                  Assigned Pickups
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {assignedPickups.map((pickup) => (
                  <motion.div
                    key={pickup.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-extra-bold text-gray-900">{pickup.wasteType}</h4>
                          <Badge variant={pickup.priority === 'normal' ? 'neutral' : 'default'}>
                            {pickup.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 font-semibold flex items-center mb-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {pickup.address}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          Customer: {pickup.customerName} • Requested: {pickup.requestTime}
                        </p>
                      </div>
                      <Badge variant={pickup.status === 'assigned' ? 'neutral' : 'default'}>
                        {pickup.status.replace('-', ' ')}
                      </Badge>
                    </div>

                    {/* ETA Display */}
                    {(pickup.eta || etaUpdates[pickup.id]) && (pickup.status === 'assigned' || pickup.status === 'in-route') && (
                      <div className="bg-green-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Navigation className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-extra-bold text-green-800">
                              ETA: {(etaUpdates[pickup.id] || pickup.eta).text}
                            </span>
                          </div>
                          <span className="text-xs text-green-600 font-semibold">
                            {pickup.distance}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* AI Prediction */}
                    <div className="bg-primary-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span className="text-xs font-bold text-primary-700">
                          AI Analysis ({pickup.confidence}% confidence)
                        </span>
                      </div>
                      <p className="text-sm text-primary-800 font-semibold">
                        {pickup.aiPrediction}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {pickup.status === 'assigned' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptPickup(pickup.id)}
                            className="flex items-center space-x-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Accept</span>
                          </Button>
                          <Button
                            variant="neutral"
                            size="sm"
                            onClick={() => handleStartRoute(pickup.id)}
                            className="flex items-center space-x-1"
                          >
                            <Navigation2 className="w-4 h-4" />
                            <span>Route</span>
                          </Button>
                        </>
                      )}
                      
                      {pickup.status === 'in-route' && (
                        <Button
                          onClick={() => handleCompletePickup(pickup.id)}
                          className="flex items-center space-x-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Complete</span>
                        </Button>
                      )}
                      
                      <Button
                        variant="neutral"
                        size="sm"
                        onClick={() => {
                          setSelectedPickup(pickup);
                          setShowDetailsModal(true);
                        }}
                        className="flex items-center space-x-1"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Details</span>
                      </Button>
                      
                      <Button
                        variant="neutral"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Call</span>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pickup Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pickup Details</DialogTitle>
          </DialogHeader>
          
          {selectedPickup && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-extra-bold text-gray-900 mb-2">
                  {selectedPickup.wasteType}
                </h3>
                <Badge variant={selectedPickup.status === 'assigned' ? 'neutral' : 'default'}>
                  {selectedPickup.status.replace('-', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-extra-bold text-gray-900 mb-2">Location & Customer</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Address:</span>
                      <span className="font-bold">{selectedPickup.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Customer:</span>
                      <span className="font-bold">{selectedPickup.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Phone:</span>
                      <span className="font-bold">{selectedPickup.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Distance:</span>
                      <span className="font-bold">{selectedPickup.distance}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-extra-bold text-gray-900 mb-2">AI Analysis</h4>
                  <div className="bg-primary-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span className="text-sm font-bold text-primary-700">
                        Confidence: {selectedPickup.confidence}%
                      </span>
                    </div>
                    <p className="text-sm text-primary-800 font-semibold">
                      {selectedPickup.aiPrediction}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="neutral"
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Customer</span>
                </Button>
                <Button
                  variant="neutral"
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Message</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notifications Modal */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notification.priority === 'urgent' ? 'bg-red-500' :
                    notification.priority === 'high' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <h4 className="font-extra-bold text-gray-900 mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 font-semibold mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverDashboard;
