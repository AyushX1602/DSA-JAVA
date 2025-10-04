import React, { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
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
import cloudinaryService from '../services/cloudinary';
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
    image: null,
    imageUrl: null,
    imagePreview: null,
    aiPrediction: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Jotai atoms
  const [user] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  
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
    if (!isAuthenticated) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await pickupAPI.getUserPickups();
      
      // Handle both response.data.pickups and response.data.data.pickups
      let pickupsData = null;
      if (response.data?.data?.pickups) {
        pickupsData = response.data.data.pickups;
      } else if (response.data?.pickups) {
        pickupsData = response.data.pickups;
      }
      
      if (pickupsData && Array.isArray(pickupsData)) {
        setPickups(pickupsData);
      } else {
        setPickups([]);
      }
    } catch (error) {
      console.error('Error loading pickups:', error);
      toast.error('Failed to load pickup requests');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Load pickups on component mount
  useEffect(() => {
    loadPickups();
  }, [loadPickups]);

  const filteredRequests = filter === 'all' ? pickups : 
    pickups.filter(req => req.status === filter);



  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!newRequest.address || !newRequest.wasteType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const requestData = {
        pickupLocation: {
          latitude: newRequest.coordinates ? newRequest.coordinates[1] : null,
          longitude: newRequest.coordinates ? newRequest.coordinates[0] : null,
          address: newRequest.address
        },
        wasteDetails: {
          type: newRequest.wasteType,
          estimatedWeight: 10, // Default weight, could be made configurable
          description: newRequest.description
        },
        preferredTimeSlot: 'morning', // Default time slot
        specialInstructions: newRequest.description,
        imageUrl: newRequest.imageUrl // Include Cloudinary image URL
      };

      // Add AI classification if image is provided
      if (newRequest.image) {
        try {
          const aiResponse = await aiAPI.classifyWaste(newRequest.image);
          if (aiResponse.data && aiResponse.data.data && aiResponse.data.data.classification) {
            requestData.aiPrediction = {
              class: aiResponse.data.data.classification.predicted_class,
              confidence: aiResponse.data.data.classification.confidence,
              cloudinaryUrl: aiResponse.data.data.image.url
            };
          }
        } catch (error) {
          console.error('AI classification failed:', error);
          // Continue without AI prediction
        }
      }

      const response = await pickupAPI.createRequest(requestData);
      
      if (response.data && response.data.pickup) {
        toast.success('Pickup request submitted successfully!');
        setShowRequestModal(false);
        setNewRequest({
          address: '',
          coordinates: null,
          description: '',
          wasteType: '',
          urgency: 'normal',
          image: null,
          imageUrl: null,
          imagePreview: null,
          aiPrediction: null
        });
        
        // Reload pickups to show the new request
        await loadPickups();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit pickup request';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create image preview
      const imagePreview = URL.createObjectURL(file);
      setNewRequest(prev => ({ 
        ...prev, 
        image: file,
        imagePreview
      }));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload to Cloudinary (simplified for compatibility)
      const uploadResult = await cloudinaryService.uploadImage(file, {
        folder: 'ecotrack'
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadResult.success) {
        setNewRequest(prev => ({ 
          ...prev, 
          imageUrl: uploadResult.data.url
        }));
        toast.success('Image uploaded successfully!');
        
        // Auto-classify the image and set waste type
        try {
          toast.loading('Analyzing image with AI...', { id: 'ai-classification' });
          const aiResponse = await aiAPI.classifyWaste(file);
          if (aiResponse.data && aiResponse.data.data && aiResponse.data.data.classification) {
            const predictedClass = aiResponse.data.data.classification.predicted_class;
            const confidence = aiResponse.data.data.classification.confidence;
            
            // Map AI prediction to our waste types
            const wasteTypeMapping = {
              'organic': 'organic',
              'paper': 'paper',
              'cardboard': 'paper',
              'plastic': 'plastic',
              'electronics': 'e-waste',
              'electronic': 'e-waste',
              'metal': 'metal',
              'glass': 'general',
              'trash': 'general',
              'general': 'general'
            };
            
            const mappedType = wasteTypeMapping[predictedClass.toLowerCase()] || 'general';
            
            setNewRequest(prev => ({
              ...prev,
              wasteType: mappedType,
              aiPrediction: {
                class: predictedClass,
                confidence: confidence,
                cloudinaryUrl: uploadResult.data.url
              }
            }));
            
            toast.success(`AI detected: ${predictedClass} (${Math.round(confidence * 100)}% confidence)`, { id: 'ai-classification' });
          } else {
            toast.dismiss('ai-classification');
          }
        } catch (aiError) {
          toast.error('AI classification failed, please select waste type manually', { id: 'ai-classification' });
        }
      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }
    } catch (error) {
      toast.error('Failed to upload image. Please try again.');
      setNewRequest(prev => ({ 
        ...prev, 
        image: null,
        imagePreview: null,
        imageUrl: null,
        wasteType: '',
        aiPrediction: null
      }));
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
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
      toast.error('Could not detect location automatically. Please select on map or enter manually.');
    }
  };

  // Update address when location is detected
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
        })
        .catch(() => {
          // Address resolution failed, coordinates are still available
        });
    }
  }, [location.latitude, location.longitude]); // Only depend on the actual coordinates

  // Cleanup image preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (newRequest.imagePreview) {
        URL.revokeObjectURL(newRequest.imagePreview);
      }
    };
  }, [newRequest.imagePreview]);

  const handleLocationSelect = useCallback(async (coordinates) => {
    const [lng, lat] = coordinates;
    setNewRequest(prev => ({ 
      ...prev, 
      coordinates,
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }));

    try {
      const address = await getAddressFromCoords(lat, lng);
      setNewRequest(prev => ({ ...prev, address }));
    } catch (error) {
      // Address resolution failed, coordinates are still available
    }
  }, [getAddressFromCoords]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'requested': return Clock;
      case 'assigned': return MapPin;
      case 'in-progress': return MapPin;
      case 'completed': return CheckCircle;
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
                {pickups.filter(r => r.status === 'in-progress').length}
              </div>
              <div className="text-sm font-bold text-gray-600">In Progress</div>
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
        <div className="flex items-center space-x-4 mb-6">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex items-center space-x-2">
            {['all', 'requested', 'assigned', 'in-progress', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                  filter === status
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
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
                key={pickup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="relative">
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
                            {pickup.wasteType}
                          </h3>
                          <p className="text-sm text-gray-600 font-semibold flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {pickup.address}
                          </p>
                        </div>
                        <Badge variant={pickup.status === 'requested' || pickup.status === 'missed' ? 'neutral' : 'default'}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {pickup.status.replace('-', ' ')}
                        </Badge>
                      </div>

                      {/* AI Prediction */}
                      <div className="bg-primary-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <span className="text-xs font-bold text-primary-700">
                            AI Prediction ({pickup.confidence}% confidence)
                          </span>
                        </div>
                        <p className="text-sm text-primary-800 font-semibold">
                          {pickup.aiPrediction}
                        </p>
                      </div>

                      {/* ETA Display */}
                      {pickup.eta && (pickup.status === 'in-progress' || pickup.status === 'assigned') && (
                        <div className="bg-green-50 rounded-lg p-2 mb-3">
                          <div className="flex items-center space-x-2">
                            <Navigation className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-extra-bold text-green-800">
                              ETA: {pickup.eta.text}
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
                          Requested: {pickup.requestDate}
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
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredRequests.length === 0 && (
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
                      📍 Coordinates Detected
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

                {/* Interactive Map Placeholder */}
                <div className="mt-4">
                  <p className="text-xs font-bold text-gray-700 mb-2">
                    Adjust pin location on map (optional):
                  </p>
                  <div className="h-60 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                    <p className="text-gray-500 font-semibold">Map Component Placeholder</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-bold text-gray-700 mb-2">
                Upload Waste Image
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {newRequest.imagePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={newRequest.imagePreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    {isUploading && (
                      <div className="space-y-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{width: `${uploadProgress}%`}}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                      </div>
                    )}
                    {newRequest.imageUrl && (
                      <p className="text-xs text-green-600 font-semibold">
                        ✓ Image uploaded successfully
                      </p>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload-change"
                      disabled={isUploading}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      disabled={isUploading}
                      onClick={() => document.getElementById('image-upload-change').click()}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div>
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
                      disabled={isUploading}
                    />
                    <Button 
                      type="button" 
                      variant="neutral" 
                      size="sm" 
                      disabled={isUploading}
                      onClick={() => document.getElementById('image-upload').click()}
                    >
                      {isUploading ? 'Uploading...' : 'Choose Image'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="block text-sm font-bold text-gray-700 mb-2">
                Waste Type * {newRequest.aiPrediction && (
                  <span className="text-green-600 text-xs">
                    (AI Selected: {Math.round(newRequest.aiPrediction.confidence * 100)}% confidence)
                  </span>
                )}
              </Label>
              {newRequest.aiPrediction && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-bold text-green-800">
                      AI detected: {newRequest.aiPrediction.class} ({Math.round(newRequest.aiPrediction.confidence * 100)}% confidence)
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Category auto-selected. You can change it if needed.
                  </p>
                </div>
              )}
              <select
                value={newRequest.wasteType}
                onChange={(e) => setNewRequest(prev => ({ ...prev, wasteType: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-lg font-semibold focus:outline-none ${
                  newRequest.aiPrediction 
                    ? 'border-green-200 bg-green-50 focus:border-green-500' 
                    : 'border-gray-200 focus:border-primary-500'
                }`}
                required
              >
                <option value="">Select waste type</option>
                <option value="organic">Organic Waste</option>
                <option value="paper">Paper & Cardboard</option>
                <option value="plastic">Plastic Materials</option>
                <option value="e-waste">E-Waste (Electronics)</option>
                <option value="metal">Metal & Scrap</option>
                <option value="general">Trash (General Waste)</option>
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
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
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
                  {selectedPickup.wasteType}
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
                      <span className="font-bold">{selectedPickup.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Requested:</span>
                      <span className="font-bold">{selectedPickup.requestDate}</span>
                    </div>
                    {selectedPickup.completedDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-semibold">Completed:</span>
                        <span className="font-bold">{selectedPickup.completedDate}</span>
                      </div>
                    )}
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

              {selectedPickup.driverName && (
                <div>
                  <h4 className="font-extra-bold text-gray-900 mb-2">Driver Information</h4>
                  <p className="text-sm font-semibold text-gray-600">
                    Assigned to: <span className="font-bold text-gray-900">{selectedPickup.driverName}</span>
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
