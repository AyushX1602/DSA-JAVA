import React, { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Upload, 
  MapPin, 
  Camera, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Eye,
  Calendar,
  Filter,
  Navigation,
  Crosshair
} from 'lucide-react';
import DashboardTopbar from '../components/DashboardTopbar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { userAtom, isAuthenticatedAtom } from '../store/authAtoms';
import { pickupAPI, aiAPI } from '../services/api';
import useGeolocation from '../hooks/useGeolocation';
import mapboxService from '../services/mapbox';
import MapPicker from '../components/ui/map-picker';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRequest, setNewRequest] = useState({
    address: '',
    coordinates: null,
    description: '',
    wasteType: '',
    urgency: 'normal',
    image: null
  });
  
  // Debug: Log newRequest changes
  useEffect(() => {
    console.log('📋 newRequest state updated:', newRequest);
  }, [newRequest]);

  // Jotai atoms
  const [user] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  
  // URL params for deep linking to new request modal
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Geolocation hook for auto-location detection
  const { 
    location, 
    error: locationError, 
    loading: locationLoading, 
    getCurrentPosition,
    getAddressFromCoords,
    hasLocation 
  } = useGeolocation({ immediate: false });

  // Load user pickups from API
  const loadPickups = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await pickupAPI.getUserPickups();
      
      if (response.data && response.data.data && response.data.data.pickups) {
        setPickups(response.data.data.pickups);
      } else {
        setPickups([]);
      }
    } catch (error) {
      console.error('Error loading pickups:', error);
      toast.error('Failed to load pickup requests');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load pickups on component mount
  useEffect(() => {
    loadPickups();
  }, [loadPickups]);

  // Check for 'new=true' query parameter and open modal
  useEffect(() => {
    const shouldOpenModal = searchParams.get('new') === 'true';
    if (shouldOpenModal) {
      setShowRequestModal(true);
      // Clean up the URL by removing the query parameter
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('new');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredRequests = filter === 'all' ? pickups : 
    pickups.filter(req => req.status === filter);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started');
    console.log('📋 Current newRequest state:', newRequest);
    
    // Enhanced validation
    if (!newRequest.wasteType) {
      console.log('❌ Validation failed: Missing waste type');
      toast.error('Please select a waste type');
      return;
    }
    
    if (!newRequest.address || newRequest.address.trim() === '') {
      console.log('❌ Validation failed: Missing address');
      toast.error('Please provide a pickup address');
      return;
    }

    // Clean up address - remove emojis and special characters that might cause validation issues
    let cleanAddress = newRequest.address;
    if (cleanAddress.includes('📍')) {
      cleanAddress = cleanAddress.replace('📍', '').trim();
    }
    if (cleanAddress.startsWith('Coordinates:')) {
      const [lng, lat] = newRequest.coordinates;
      cleanAddress = `Location ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
    // Ensure address is not empty after cleaning
    if (!cleanAddress || cleanAddress.trim() === '') {
      const [lng, lat] = newRequest.coordinates;
      cleanAddress = `Pickup Location ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    if (!newRequest.coordinates || newRequest.coordinates.length !== 2) {
      console.log('❌ Validation failed: Missing or invalid coordinates');
      console.log('Coordinates:', newRequest.coordinates);
      toast.error('Please select a location on the map or use GPS');
      return;
    }

    // Check if coordinates are valid numbers
    const [lng, lat] = newRequest.coordinates;
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.log('❌ Validation failed: Invalid coordinate values');
      console.log('Latitude:', lat, 'Longitude:', lng);
      toast.error('Invalid location coordinates. Please select a valid location.');
      return;
    }

    console.log('✅ All validation passed, proceeding with submission');


    setIsSubmitting(true);
    
    // Show loading toast
    const loadingToast = toast.loading('🚛 Submitting your pickup request...');
    
    try {
      const requestData = {
        pickupLocation: {
          latitude: parseFloat(newRequest.coordinates[1]),
          longitude: parseFloat(newRequest.coordinates[0]),
          address: cleanAddress // Use cleaned address
        },
        wasteDetails: {
          type: newRequest.wasteType,
          estimatedWeight: 10.0, // Must be float between 0.1-1000
          description: newRequest.description || ''
        },
        specialInstructions: newRequest.description || ''
      };

      // Add AI classification if image is provided
      if (newRequest.image) {
        try {
          const aiResponse = await aiAPI.classifyWaste(newRequest.image);
          if (aiResponse.data && aiResponse.data.prediction) {
            requestData.aiPrediction = aiResponse.data.prediction;
          }
        } catch (error) {
          console.error('AI classification failed:', error);
          // Continue without AI prediction
        }
      }

      console.log('📤 Sending API request with data:', requestData);
      
      const response = await pickupAPI.createRequest(requestData);
      console.log('📥 Received API response:', response);
      console.log('📦 Response data structure:', response.data);
      
      if (response.data && response.data.data && response.data.data.pickup) {
        console.log('🎯 Success: Pickup created successfully');
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success('🎉 Pickup request submitted successfully!', {
          duration: 4000
        });
        
        // Close modal and reset form
        setShowRequestModal(false);
          setNewRequest({
            address: '',
            coordinates: null,
            description: '',
            wasteType: '',
            urgency: 'normal',
            image: null
          });
        
        // Reload pickups to show the new request
        console.log('🔄 Reloading pickups...');
        await loadPickups();
        console.log('✅ Pickup submission completed successfully');
      } else {
        console.log('❌ Unexpected response structure:', response.data);
        toast.dismiss(loadingToast);
        toast.error('Unexpected response from server. Please try again.');
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      console.error('Error submitting pickup request:', error);
      if (error.response?.data) {
        console.error('Backend validation errors:', error.response.data);
      }
      
      // Enhanced error handling
      let errorMessage = 'Failed to submit pickup request';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors array
        const validationErrors = error.response.data.errors;
        errorMessage = `Validation errors: ${validationErrors.map(e => e.msg).join(', ')}`;
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in again to submit a request';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid request data. Please check all fields and try again.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewRequest(prev => ({ ...prev, image: file }));
    }
  };

  // Auto-detect location when modal opens
  useEffect(() => {
    if (showRequestModal && !newRequest.coordinates) {
      handleAutoDetectLocation();
    }
  }, [showRequestModal]);

  const handleAutoDetectLocation = async () => {
    try {
      getCurrentPosition();
    } catch (error) {
      console.error('Auto-location detection failed:', error);
      toast.error('Could not detect location automatically. Please select on map or enter manually.');
    }
  };

  // Update address when GPS location is detected
  useEffect(() => {
    if (location.latitude && location.longitude) {
      const coords = [location.longitude, location.latitude];
      setNewRequest(prev => ({ 
        ...prev, 
        coordinates: coords,
        address: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
      }));

      // Get human-readable address
      getAddressFromCoords(location.latitude, location.longitude)
        .then(address => {
          setNewRequest(prev => ({ ...prev, address }));
          toast.success('📍 Location detected successfully!');
        })
        .catch(err => {
          console.error('Error getting address:', err);
          toast.error('Failed to get address for this location');
        });
    }
  }, [location.latitude, location.longitude, getAddressFromCoords]);

  const handleLocationSelect = useCallback(async (coordinates) => {
    const [lng, lat] = coordinates;
    
    // Update coordinates immediately
    setNewRequest(prev => ({ 
      ...prev, 
      coordinates,
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` // Temporary coordinate display
    }));

    try {
      // Get human-readable address
      const address = await getAddressFromCoords(lat, lng);
      setNewRequest(prev => ({ ...prev, address }));
    } catch (error) {
      console.error('Error getting address:', error);
      // Keep coordinate display if address lookup fails
      setNewRequest(prev => ({ 
        ...prev, 
        address: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
      }));
    }
  }, [getAddressFromCoords]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'requested': return Clock;
      case 'assigned': return MapPin;
      case 'en-route': return Navigation;
      case 'arrived': return MapPin;
      case 'in-progress': return Clock;
      case 'completed': return CheckCircle;
      case 'cancelled': return AlertTriangle;
      case 'missed': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <div className="min-h-screen">
      <DashboardTopbar />
      
      <div className="pt-16 pl-16 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-extra-bold text-gray-900 mb-2">
              My Pickup Requests
            </h1>
            <p className="text-gray-600 font-semibold">
              Manage your waste pickup requests and track their status
            </p>
          </div>
          
          <Button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center space-x-2 mt-4 sm:mt-0"
          >
            <Plus className="w-5 h-5" />
            <span>New Request</span>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="text-center pt-6">
              <div className="text-2xl font-extra-bold text-primary-500 mb-2">
                {pickups.length}
              </div>
              <div className="text-sm font-bold text-gray-600">Total Requests</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center pt-6">
              <div className="text-2xl font-extra-bold text-green-500 mb-2">
                {pickups.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-sm font-bold text-gray-600">Completed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center pt-6">
              <div className="text-2xl font-extra-bold text-yellow-500 mb-2">
                {pickups.filter(r => ['assigned', 'en-route', 'arrived', 'in-progress'].includes(r.status)).length}
              </div>
              <div className="text-sm font-bold text-gray-600">Active</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center pt-6">
              <div className="text-2xl font-extra-bold text-blue-500 mb-2">
                {pickups.filter(r => r.status === 'requested').length}
              </div>
              <div className="text-sm font-bold text-gray-600">Pending</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Filter by status:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'requested', 'assigned', 'en-route', 'arrived', 'in-progress', 'completed', 'cancelled', 'missed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                  filter === status
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Pickup Requests List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((pickup) => {
            const StatusIcon = getStatusIcon(pickup.status);
            
            
            return (
              <motion.div
                key={pickup._id || pickup.id || pickup.pickupId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                    {/* Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-extra-bold text-gray-900 mb-1">
                            {pickup.wasteDetails?.type || 'Unknown Waste Type'}
                          </h3>
                          <p className="text-xs text-gray-500 font-semibold mb-1">
                            ID: {pickup.pickupId || pickup._id || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600 font-semibold flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {pickup.pickupLocation?.address || 'No address'}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            pickup.status === 'completed' ? 'default' :
                            pickup.status === 'cancelled' || pickup.status === 'missed' ? 'destructive' :
                            ['assigned', 'en-route', 'arrived', 'in-progress'].includes(pickup.status) ? 'secondary' :
                            'outline'
                          }
                          className={
                            pickup.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                            pickup.status === 'cancelled' || pickup.status === 'missed' ? 'bg-red-100 text-red-800 border-red-200' :
                            ['assigned', 'en-route', 'arrived', 'in-progress'].includes(pickup.status) ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-blue-100 text-blue-800 border-blue-200'
                          }
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {pickup.status?.replace('-', ' ') || 'pending'}
                        </Badge>
                      </div>

                      {/* AI Prediction */}
                      {pickup.aiAnalysis?.wasteClassification && (
                        <div className="bg-primary-50 rounded-lg p-3 mb-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            <span className="text-xs font-bold text-primary-700">
                              AI Prediction ({Math.round(pickup.aiAnalysis.wasteClassification.confidence * 100)}% confidence)
                            </span>
                          </div>
                          <p className="text-sm text-primary-800 font-semibold">
                            {pickup.aiAnalysis.wasteClassification.predicted}
                          </p>
                        </div>
                      )}

                      {/* ETA Display */}
                      {pickup.eta && pickup.eta.estimatedArrival && (pickup.status === 'en-route' || pickup.status === 'assigned') && (
                        <div className="bg-green-50 rounded-lg p-2 mb-3">
                          <div className="flex items-center space-x-2">
                            <Navigation className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-extra-bold text-green-800">
                              ETA: {new Date(pickup.eta.estimatedArrival).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-green-600 font-semibold mt-1">
                            Driver is on the way!
                          </p>
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Requested: {new Date(pickup.scheduling?.requestedAt || pickup.createdAt).toLocaleDateString()}
                        </span>
                        {pickup.status === 'missed' && (
                          <Button
                            variant="neutral"
                            size="sm"
                            className="text-xs"
                          >
                            Report Missed
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                    {/* View Details Button */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Button
                        variant="neutral"
                        size="sm"
                        onClick={() => {
                          setSelectedPickup(pickup);
                          setShowDetailsModal(true);
                        }}
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredRequests.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MapPin className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-extra-bold text-gray-900 mb-2">
                No requests found
              </h3>
              <p className="text-gray-600 font-semibold">
                {filter === 'all' 
                  ? 'You haven\'t made any pickup requests yet.'
                  : `No requests with status "${filter}" found.`
                }
              </p>
              <div className="mt-4 text-xs text-gray-400">
                Total pickups in state: {pickups.length} | Current filter: {filter}
              </div>
            </CardContent>
          </Card>
        )}
        
        {loading && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading pickup requests...</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Request Modal */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request New Pickup</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitRequest} className="space-y-6">
            {/* Location Section */}
            <div>
              <Label className="block text-sm font-bold text-gray-700 mb-2">
                Pickup Location
              </Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Input
                    value={newRequest.address}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, address: e.target.value }))}
                    placeholder={locationLoading ? "Detecting location..." : "Address will auto-fill or enter manually"}
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="neutral"
                    size="sm"
                    onClick={handleAutoDetectLocation}
                    disabled={locationLoading}
                    className="flex items-center space-x-1"
                  >
                    <Crosshair className="w-4 h-4" />
                    <span>GPS</span>
                  </Button>
                </div>
                
                {newRequest.coordinates && (
                  <div className="bg-primary-50 rounded-lg p-3">
                    <p className="text-xs font-bold text-primary-700 mb-1">
                      ✅ Location Selected
                    </p>
                    <p className="text-sm font-bold text-primary-800">
                      {newRequest.coordinates[1].toFixed(6)}, {newRequest.coordinates[0].toFixed(6)}
                    </p>
                  </div>
                )}

                {locationError && (
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs font-bold text-red-700 mb-1">
                      ⚠️ Location Error
                    </p>
                    <p className="text-sm font-semibold text-red-800">
                      {locationError.message}
                    </p>
                  </div>
                )}

                {/* Interactive Map */}
                <div className="mt-4">
                  <p className="text-xs font-bold text-gray-700 mb-2">
                    Adjust pin location on map (optional):
                  </p>
                  <MapPicker
                    coordinates={newRequest.coordinates || [-74.006, 40.7128]}
                    onLocationChange={handleLocationSelect}
                    height={240}
                    zoom={newRequest.coordinates && hasLocation ? 16 : newRequest.coordinates ? 15 : 13}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-bold text-gray-700 mb-2">
                Upload Waste Image
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Upload an image for AI waste classification
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button type="button" variant="neutral" size="sm">
                    Choose Image
                  </Button>
                </label>
                {newRequest.image && (
                  <p className="text-xs text-primary-600 font-semibold mt-2">
                    {newRequest.image.name}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label className="block text-sm font-bold text-gray-700 mb-2">
                Waste Type *
              </Label>
              <select
                value={newRequest.wasteType}
                onChange={(e) => setNewRequest(prev => ({ ...prev, wasteType: e.target.value }))}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-semibold focus:border-primary-500 focus:outline-none"
              >
                <option value="">Select waste type</option>
                <option value="organic">Organic Waste</option>
                <option value="plastic">Plastic & Bottles</option>
                <option value="paper">Paper & Cardboard</option>
                <option value="electronic">Electronic Waste</option>
                <option value="hazardous">Hazardous Materials</option>
                <option value="general">General Waste</option>
                <option value="mixed">Mixed Waste</option>
              </select>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={newRequest.description}
                onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about the waste"
              />
            </div>

            <div>
              <Label className="block text-sm font-bold text-gray-700 mb-2">
                Urgency Level
              </Label>
              <select
                value={newRequest.urgency}
                onChange={(e) => setNewRequest(prev => ({ ...prev, urgency: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-semibold focus:border-primary-500 focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>


            <div className="flex space-x-4">
              <Button
                type="button"
                variant="neutral"
                onClick={() => setShowRequestModal(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !newRequest.wasteType || !newRequest.coordinates}
                onClick={() => {
                  console.log('🔴 Submit button clicked! Form will submit...');
                  console.log('🔍 Button state check:');
                  console.log('  - isSubmitting:', isSubmitting);
                  console.log('  - wasteType:', newRequest.wasteType);
                  console.log('  - coordinates:', newRequest.coordinates);
                  console.log('  - button disabled:', isSubmitting || !newRequest.wasteType || !newRequest.coordinates);
                }}
                className="flex-1 relative"
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>Submit Request</span>
                    <span>🚛</span>
                  </span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pickup Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedPickup && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-extra-bold text-gray-900 mb-2">
                  {selectedPickup.wasteDetails?.type || 'Unknown Waste Type'}
                </h3>
                <Badge variant={selectedPickup.status === 'requested' || selectedPickup.status === 'missed' ? 'neutral' : 'default'}>
                  {selectedPickup.status.replace('-', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-extra-bold text-gray-900 mb-2">Request Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Address:</span>
                      <span className="font-bold">{selectedPickup.pickupLocation?.address || 'No address'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Requested:</span>
                      <span className="font-bold">{new Date(selectedPickup.scheduling?.requestedAt || selectedPickup.createdAt).toLocaleDateString()}</span>
                    </div>
                    {selectedPickup.scheduling?.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-semibold">Completed:</span>
                        <span className="font-bold">{new Date(selectedPickup.scheduling.completedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-extra-bold text-gray-900 mb-2">AI Analysis</h4>
                  {selectedPickup.aiAnalysis?.wasteClassification ? (
                    <div className="bg-primary-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span className="text-sm font-bold text-primary-700">
                          Confidence: {Math.round(selectedPickup.aiAnalysis.wasteClassification.confidence * 100)}%
                        </span>
                      </div>
                      <p className="text-sm text-primary-800 font-semibold">
                        {selectedPickup.aiAnalysis.wasteClassification.predicted}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 font-semibold">
                        No AI analysis available
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedPickup.driver && (
                <div>
                  <h4 className="font-extra-bold text-gray-900 mb-2">Driver Information</h4>
                  <p className="text-sm font-semibold text-gray-600">
                    Assigned to: <span className="font-bold text-gray-900">{selectedPickup.driver.user?.name || 'Unknown Driver'}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
