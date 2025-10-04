import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  MapPinIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  PencilIcon, 
  TrashIcon,
  CloudIcon,
  BuildingOfficeIcon,
  TruckIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  XMarkIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import StopCard from '../../components/trip/StopCard';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Navbar from '../../components/common/Navbar';
import { format } from 'date-fns';

const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteTrip } = useApp();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [showEditStopModal, setShowEditStopModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showEditActivityModal, setShowEditActivityModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  
  // Form states
  const [stopFormData, setStopFormData] = useState({
    cityName: '',
    country: '',
    startDate: '',
    endDate: '',
    estimatedCost: ''
  });
  const [activityFormData, setActivityFormData] = useState({
    name: '',
    category: 'Sightseeing',
    cost: '',
    date: '',
    duration: ''
  });
  
  const [currentStop, setCurrentStop] = useState(null);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [currentStopId, setCurrentStopId] = useState(null);

  // Planning Assistant states
  const [showPlanningAssistant, setShowPlanningAssistant] = useState(false);
  const [planningRecommendations, setPlanningRecommendations] = useState({
    weather: null,
    hotels: [],
    transport: [],
    activities: [],
    loading: false
  });

  // Recommendation modal states
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [activeRecommendationTab, setActiveRecommendationTab] = useState('overview');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // UI states
  const [activeTab, setActiveTab] = useState('itinerary'); // itinerary, weather, hotels, activities, transport, budget
  const [showTripStats, setShowTripStats] = useState(true);

  useEffect(() => {
    loadTrip();
  }, [id]);

  // Auto-load recommendations when trip is loaded
  useEffect(() => {
    if (trip && trip.destination) {
      loadPlanningRecommendations();
    }
  }, [trip]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      console.log('Loading trip with ID:', id);
      const tripData = await api.getTripById(id);
      console.log('Trip loaded:', tripData);
      
      // Ensure stops array exists
      if (!tripData.stops) {
        tripData.stops = [];
      }
      
      setTrip(tripData);
    } catch (error) {
      console.error('Failed to load trip:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPlanningRecommendations = async () => {
    if (!trip) return;

    setPlanningRecommendations(prev => ({ ...prev, loading: true }));
    
    try {
      const destination = trip.destination || trip.destinations?.[0] || 'destination';
      
      const [weather, hotels, transport, activities] = await Promise.all([
        api.getWeatherRecommendations(destination, trip.startDate, trip.endDate),
        api.getHotelRecommendations(destination),
        api.getTransportRecommendations(destination),
        api.getActivityRecommendations(destination)
      ]);
      
      setPlanningRecommendations({
        weather,
        hotels,
        transport,
        activities,
        loading: false
      });
    } catch (error) {
      console.error('Failed to load planning recommendations:', error);
      setPlanningRecommendations(prev => ({ ...prev, loading: false }));
    }
  };

  const handleAddStop = async () => {
    // Validate form data
    if (!stopFormData.cityName.trim() || !stopFormData.country.trim() || 
        !stopFormData.startDate || !stopFormData.endDate) {
      alert('Please fill in all required fields (City, Country, Start Date, End Date)');
      return;
    }

    // Validate dates
    if (new Date(stopFormData.endDate) <= new Date(stopFormData.startDate)) {
      alert('End date must be after start date');
      return;
    }

    try {
      console.log('Adding stop:', stopFormData);
      const stopData = {
        ...stopFormData,
        estimatedCost: parseFloat(stopFormData.estimatedCost) || 0
      };
      const newStop = await api.addStop(id, stopData);
      console.log('Stop added successfully:', newStop);
      setTrip(prev => ({
        ...prev,
        stops: [...(prev.stops || []), newStop]
      }));
      setShowAddStopModal(false);
      resetStopForm();
    } catch (error) {
      console.error('Failed to add stop:', error);
      alert(`Failed to add stop: ${error.message}`);
    }
  };

  const handleEditStop = async () => {
    try {
      console.log('Editing stop:', currentStop.id, stopFormData);
      const updatedStop = await api.updateStop(id, currentStop.id, stopFormData);
      console.log('Stop updated successfully:', updatedStop);
      setTrip(prev => ({
        ...prev,
        stops: (prev.stops || []).map(stop => 
          stop.id === currentStop.id ? updatedStop : stop
        )
      }));
      setShowEditStopModal(false);
      resetStopForm();
    } catch (error) {
      console.error('Failed to update stop:', error);
      alert(`Failed to update stop: ${error.message}`);
    }
  };

  const handleDeleteStop = async (stopId) => {
    try {
      console.log('Deleting stop:', stopId);
      await api.deleteStop(id, stopId);
      console.log('Stop deleted successfully');
      setTrip(prev => ({
        ...prev,
        stops: (prev.stops || []).filter(stop => stop.id !== stopId)
      }));
    } catch (error) {
      console.error('Failed to delete stop:', error);
      alert(`Failed to delete stop: ${error.message}`);
    }
  };

  const handleAddActivity = async () => {
    try {
      console.log('Adding activity:', currentStopId, activityFormData);
      const newActivity = await api.addActivity(id, currentStopId, activityFormData);
      console.log('Activity added successfully:', newActivity);
      setTrip(prev => ({
        ...prev,
        stops: (prev.stops || []).map(stop =>
          stop.id === currentStopId
            ? { ...stop, activities: [...(stop.activities || []), newActivity] }
            : stop
        )
      }));
      setShowAddActivityModal(false);
      resetActivityForm();
    } catch (error) {
      console.error('Failed to add activity:', error);
      alert(`Failed to add activity: ${error.message}`);
    }
  };

  const handleEditActivity = async () => {
    try {
      const updatedActivity = await api.updateActivity(id, currentStopId, currentActivity.id, activityFormData);
      setTrip(prev => ({
        ...prev,
        stops: prev.stops.map(stop =>
          stop.id === currentStopId
            ? {
                ...stop,
                activities: stop.activities.map(activity =>
                  activity.id === currentActivity.id ? updatedActivity : activity
                )
              }
            : stop
        )
      }));
      setShowEditActivityModal(false);
      resetActivityForm();
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      const stopWithActivity = trip.stops.find(stop => 
        stop.activities.some(activity => activity.id === activityId)
      );
      
      if (stopWithActivity) {
        await api.deleteActivity(id, stopWithActivity.id, activityId);
        setTrip(prev => ({
          ...prev,
          stops: prev.stops.map(stop =>
            stop.id === stopWithActivity.id
              ? { ...stop, activities: stop.activities.filter(activity => activity.id !== activityId) }
              : stop
          )
        }));
      }
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  const handleDeleteTrip = async () => {
    try {
      await deleteTrip(id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete trip:', error);
    }
  };

  const resetStopForm = () => {
    setStopFormData({
      cityName: '',
      country: '',
      startDate: '',
      endDate: '',
      estimatedCost: ''
    });
    setCurrentStop(null);
  };

  const resetActivityForm = () => {
    setActivityFormData({
      name: '',
      category: 'Sightseeing',
      cost: '',
      date: '',
      duration: ''
    });
    setCurrentActivity(null);
    setCurrentStopId(null);
  };

  const openEditStopModal = (stop) => {
    setCurrentStop(stop);
    setStopFormData({
      cityName: stop.cityName,
      country: stop.country,
      startDate: stop.startDate,
      endDate: stop.endDate,
      estimatedCost: stop.estimatedCost?.toString() || ''
    });
    setShowEditStopModal(true);
  };

  const openAddActivityModal = (stopId) => {
    setCurrentStopId(stopId);
    setShowAddActivityModal(true);
  };

  const openEditActivityModal = (activity) => {
    const stop = trip.stops.find(stop => 
      stop.activities.some(act => act.id === activity.id)
    );
    
    setCurrentStopId(stop.id);
    setCurrentActivity(activity);
    setActivityFormData({
      name: activity.name,
      category: activity.category,
      cost: activity.cost?.toString() || '',
      date: activity.date || '',
      duration: activity.duration?.toString() || ''
    });
    setShowEditActivityModal(true);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-red-900 mb-2">Trip Not Found</h1>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Trip Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Cover Image with Gradient Overlay */}
          <div className="h-80 lg:h-96 relative">
            <img
              src={trip.coverImage || 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&w=1200'}
              alt={trip.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Trip Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
                <div className="text-white mb-6 lg:mb-0">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      trip.status === 'upcoming' ? 'bg-blue-500' : 
                      trip.status === 'ongoing' ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      {trip.status?.charAt(0).toUpperCase() + trip.status?.slice(1)}
                    </span>
                    {trip.isPublic && (
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-500">
                        Public
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                    {trip.name}
                  </h1>
                  
                  {trip.description && (
                    <p className="text-xl text-gray-200 mb-6 max-w-3xl leading-relaxed">
                      {trip.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-6 text-lg">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-6 w-6" />
                      <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                    </div>
                    
                    {trip.destinations && trip.destinations.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-6 w-6" />
                        <span>{trip.destinations.length} destinations</span>
                      </div>
                    )}
                    
                    {trip.totalBudget && (
                      <div className="flex items-center space-x-2">
                        <CurrencyDollarIcon className="h-6 w-6" />
                        <span>${trip.totalBudget.toLocaleString()} budget</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                  <Button
                    variant="secondary"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                    onClick={() => setShowRecommendationsModal(true)}
                  >
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    View Recommendations
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                  >
                    <ShareIcon className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                  >
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Edit Trip
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trip Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            <div className="flex space-x-2">
              {[
                { id: 'itinerary', label: 'Itinerary', icon: MapPinIcon },
                { id: 'weather', label: 'Weather', icon: CloudIcon },
                { id: 'hotels', label: 'Hotels', icon: BuildingOfficeIcon },
                { id: 'activities', label: 'Activities', icon: SparklesIcon },
                { id: 'transport', label: 'Transport', icon: TruckIcon },
                { id: 'budget', label: 'Budget & Expenses', icon: CurrencyDollarIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Primary Content */}
          <div className="lg:col-span-3">
            {activeTab === 'itinerary' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-900">Trip Itinerary</h2>
                  <Button
                    onClick={() => setShowAddStopModal(true)}
                    className="flex items-center space-x-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Stop</span>
                  </Button>
                </div>

                {trip.stops && trip.stops.length > 0 ? (
                  <div className="space-y-6">
                    {trip.stops.map((stop, index) => (
                      <motion.div
                        key={stop.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <StopCard
                          stop={stop}
                          onEditStop={openEditStopModal}
                          onDeleteStop={handleDeleteStop}
                          onAddActivity={openAddActivityModal}
                          onEditActivity={openEditActivityModal}
                          onDeleteActivity={handleDeleteActivity}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-16 text-center"
                  >
                    <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-medium text-gray-900 mb-4">
                      No stops planned yet
                    </h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      Add your first destination to start building your itinerary.
                    </p>
                    <Button 
                      onClick={() => setShowAddStopModal(true)}
                      size="lg"
                    >
                      <PlusIcon className="h-6 w-6 mr-3" />
                      Add First Stop
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'recommendations' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-bold text-gray-900">Travel Recommendations</h2>
                
                {planningRecommendations.loading ? (
                  <div className="flex items-center justify-center py-16">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Weather Forecast */}
                    {planningRecommendations.weather && (
                      <div className="bg-gradient-to-br from-blue-50 to-sky-100 rounded-2xl p-8 border border-blue-200">
                        <div className="flex items-center mb-6">
                          <CloudIcon className="h-8 w-8 text-blue-600 mr-4" />
                          <h3 className="text-2xl font-bold text-blue-900">Weather Forecast</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-blue-900 mb-2">
                              {planningRecommendations.weather.temperature}°C
                            </div>
                            <div className="text-lg text-blue-700 mb-4">
                              {planningRecommendations.weather.condition}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-semibold text-blue-800 mb-2">
                              {planningRecommendations.weather.humidity}%
                            </div>
                            <div className="text-blue-600">Humidity</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-semibold text-blue-800 mb-2">
                              {planningRecommendations.weather.windSpeed} km/h
                            </div>
                            <div className="text-blue-600">Wind Speed</div>
                          </div>
                        </div>
                        <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                          <p className="text-blue-800 font-medium">
                            💡 {planningRecommendations.weather.recommendation}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Hotels */}
                    {planningRecommendations.hotels.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center">
                            <BuildingOfficeIcon className="h-8 w-8 text-green-600 mr-4" />
                            <h3 className="text-2xl font-bold text-gray-900">Recommended Hotels</h3>
                          </div>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setActiveRecommendationTab('hotels');
                              setShowRecommendationsModal(true);
                            }}
                          >
                            View All
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {planningRecommendations.hotels.slice(0, 3).map((hotel) => (
                            <div 
                              key={hotel.id} 
                              className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                              onClick={() => setSelectedHotel(hotel)}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <h4 className="font-bold text-gray-900 text-lg">{hotel.name}</h4>
                                <div className="flex items-center">
                                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-sm text-gray-600 ml-1">{hotel.rating.toFixed(1)}</span>
                                </div>
                              </div>
                              <p className="text-gray-600 mb-4">{hotel.distance}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold text-green-600">${hotel.price}</span>
                                <span className="text-gray-500">/night</span>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-4">
                                {hotel.amenities.slice(0, 3).map((amenity, index) => (
                                  <span key={index} className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Activities */}
                    {planningRecommendations.activities.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center">
                            <SparklesIcon className="h-8 w-8 text-orange-600 mr-4" />
                            <h3 className="text-2xl font-bold text-gray-900">Recommended Activities</h3>
                          </div>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setActiveRecommendationTab('activities');
                              setShowRecommendationsModal(true);
                            }}
                          >
                            View All
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {planningRecommendations.activities.slice(0, 4).map((activity) => (
                            <div 
                              key={activity.id} 
                              className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                              onClick={() => setSelectedActivity(activity)}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-gray-900 text-lg">{activity.name}</h4>
                                <div className="flex items-center">
                                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-sm text-gray-600 ml-1">{activity.rating.toFixed(1)}</span>
                                </div>
                              </div>
                              <p className="text-gray-600 mb-4 text-sm">{activity.description}</p>
                              <div className="flex justify-between items-center">
                                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                                  {activity.category}
                                </span>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-orange-600">{activity.price}</div>
                                  <div className="text-xs text-gray-500">{activity.duration}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Transportation */}
                    {planningRecommendations.transport.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        <div className="flex items-center mb-6">
                          <TruckIcon className="h-8 w-8 text-purple-600 mr-4" />
                          <h3 className="text-2xl font-bold text-gray-900">Transportation Options</h3>
                        </div>
                        <div className="space-y-4">
                          {planningRecommendations.transport.map((transport) => (
                            <div key={transport.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 text-lg mb-2">{transport.route}</h4>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span className="flex items-center">
                                      <ClockIcon className="h-4 w-4 mr-1" />
                                      {transport.frequency}
                                    </span>
                                    <span>•</span>
                                    <span>{transport.duration}</span>
                                  </div>
                                  <p className="text-gray-600 mt-2">{transport.description}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-purple-600">{transport.price}</div>
                                  <div className="text-sm text-gray-500">{transport.type}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'weather' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-gray-900">Weather Forecast</h2>
                {planningRecommendations.weather ? (
                  <div className="bg-gradient-to-br from-blue-50 to-sky-100 rounded-2xl shadow-lg border border-blue-200 p-8">
                    <div className="text-center mb-8">
                      <div className="text-6xl font-bold text-blue-900 mb-4">
                        {planningRecommendations.weather.temperature}°C
                      </div>
                      <div className="text-2xl text-blue-700 mb-6">
                        {planningRecommendations.weather.condition}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-white bg-opacity-70 rounded-xl p-6 text-center">
                        <div className="text-lg text-blue-600 mb-2">Humidity</div>
                        <div className="text-3xl font-bold text-blue-900">
                          {planningRecommendations.weather.humidity}%
                        </div>
                      </div>
                      <div className="bg-white bg-opacity-70 rounded-xl p-6 text-center">
                        <div className="text-lg text-blue-600 mb-2">Wind Speed</div>
                        <div className="text-3xl font-bold text-blue-900">
                          {planningRecommendations.weather.windSpeed} km/h
                        </div>
                      </div>
                      <div className="bg-white bg-opacity-70 rounded-xl p-6 text-center">
                        <div className="text-lg text-blue-600 mb-2">Visibility</div>
                        <div className="text-3xl font-bold text-blue-900">Good</div>
                      </div>
                    </div>
                    
                    <div className="bg-white bg-opacity-90 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-blue-900 mb-4">Weather Recommendations</h3>
                      <p className="text-blue-800 text-lg leading-relaxed">
                        💡 {planningRecommendations.weather.recommendation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <p className="text-gray-600 text-center">Loading weather information...</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'hotels' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-gray-900">Hotel Recommendations</h2>
                {planningRecommendations.hotels.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {planningRecommendations.hotels.map((hotel) => (
                      <div key={hotel.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200">
                        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                          <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <BuildingOfficeIcon className="h-16 w-16 text-green-600" />
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">{hotel.name}</h3>
                            <div className="flex items-center">
                              <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">{hotel.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4">{hotel.distance}</p>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-2xl font-bold text-green-600">${hotel.price}</span>
                            <span className="text-gray-500">/night</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {hotel.amenities.map((amenity, index) => (
                              <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                {amenity}
                              </span>
                            ))}
                          </div>
                          <Button className="w-full">
                            Book Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <p className="text-gray-600 text-center">Loading hotel recommendations...</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'activities' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-gray-900">Activity Recommendations</h2>
                {planningRecommendations.activities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {planningRecommendations.activities.map((activity) => (
                      <div key={activity.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">{activity.name}</h3>
                            <div className="flex items-center mb-2">
                              <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">{activity.rating.toFixed(1)}</span>
                              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium ml-3">
                                {activity.category}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-orange-600">{activity.price}</div>
                            <div className="text-sm text-gray-500">{activity.duration}</div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-6 leading-relaxed">{activity.description}</p>
                        
                        <div className="flex space-x-3">
                          <Button className="flex-1">
                            Add to Itinerary
                          </Button>
                          <Button variant="secondary" className="flex-1">
                            Learn More
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <p className="text-gray-600 text-center">Loading activity recommendations...</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'transport' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-gray-900">Transportation Options</h2>
                {planningRecommendations.transport.length > 0 ? (
                  <div className="space-y-4">
                    {planningRecommendations.transport.map((transport) => (
                      <div key={transport.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">{transport.route}</h3>
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                              {transport.type}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">{transport.price}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-sm text-purple-600 mb-1">Frequency</div>
                            <div className="text-lg font-bold text-purple-900">{transport.frequency}</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-sm text-purple-600 mb-1">Duration</div>
                            <div className="text-lg font-bold text-purple-900">{transport.duration}</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-sm text-purple-600 mb-1">Comfort</div>
                            <div className="text-lg font-bold text-purple-900">High</div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button className="flex-1">
                            Book Tickets
                          </Button>
                          <Button variant="secondary" className="flex-1">
                            View Schedule
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <p className="text-gray-600 text-center">Loading transportation options...</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'budget' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-gray-900">Budget & Expenses</h2>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  <p className="text-gray-600 text-center py-12">
                    Budget tracking features coming soon...
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowRecommendationsModal(true)}
                >
                  <SparklesIcon className="h-5 w-5 mr-3 text-orange-500" />
                  View All Recommendations
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('budget')}
                >
                  <CurrencyDollarIcon className="h-5 w-5 mr-3 text-green-500" />
                  Manage Budget
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                >
                  <ShareIcon className="h-5 w-5 mr-3 text-blue-500" />
                  Share Trip
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                >
                  <BookmarkIcon className="h-5 w-5 mr-3 text-purple-500" />
                  Save to Favorites
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Comprehensive Recommendations Modal */}
      <Modal
        isOpen={showRecommendationsModal}
        onClose={() => setShowRecommendationsModal(false)}
        title="Travel Recommendations"
        size="full"
      >
        <div className="max-h-[80vh] overflow-y-auto">
          {/* Modal Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: SparklesIcon },
                { id: 'weather', label: 'Weather', icon: CloudIcon },
                { id: 'hotels', label: 'Hotels', icon: BuildingOfficeIcon },
                { id: 'activities', label: 'Activities', icon: SparklesIcon },
                { id: 'transport', label: 'Transport', icon: TruckIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRecommendationTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeRecommendationTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Modal Content */}
          <div className="space-y-6">
            {activeRecommendationTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Weather Summary */}
                {planningRecommendations.weather && (
                  <div className="bg-gradient-to-br from-blue-50 to-sky-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center mb-4">
                      <CloudIcon className="h-6 w-6 text-blue-600 mr-3" />
                      <h3 className="font-bold text-blue-900">Weather</h3>
                    </div>
                    <div className="text-3xl font-bold text-blue-900 mb-2">
                      {planningRecommendations.weather.temperature}°C
                    </div>
                    <div className="text-blue-700">{planningRecommendations.weather.condition}</div>
                    <button
                      onClick={() => setActiveRecommendationTab('weather')}
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Forecast →
                    </button>
                  </div>
                )}

                {/* Hotels Summary */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center mb-4">
                    <BuildingOfficeIcon className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="font-bold text-green-900">Hotels</h3>
                  </div>
                  <div className="text-3xl font-bold text-green-900 mb-2">
                    {planningRecommendations.hotels.length}
                  </div>
                  <div className="text-green-700">Available options</div>
                  <button
                    onClick={() => setActiveRecommendationTab('hotels')}
                    className="mt-4 text-green-600 hover:text-green-800 font-medium text-sm"
                  >
                    Browse Hotels →
                  </button>
                </div>

                {/* Activities Summary */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center mb-4">
                    <SparklesIcon className="h-6 w-6 text-orange-600 mr-3" />
                    <h3 className="font-bold text-orange-900">Activities</h3>
                  </div>
                  <div className="text-3xl font-bold text-orange-900 mb-2">
                    {planningRecommendations.activities.length}
                  </div>
                  <div className="text-orange-700">Experiences</div>
                  <button
                    onClick={() => setActiveRecommendationTab('activities')}
                    className="mt-4 text-orange-600 hover:text-orange-800 font-medium text-sm"
                  >
                    Explore Activities →
                  </button>
                </div>

                {/* Transport Summary */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center mb-4">
                    <TruckIcon className="h-6 w-6 text-purple-600 mr-3" />
                    <h3 className="font-bold text-purple-900">Transport</h3>
                  </div>
                  <div className="text-3xl font-bold text-purple-900 mb-2">
                    {planningRecommendations.transport.length}
                  </div>
                  <div className="text-purple-700">Transport options</div>
                  <button
                    onClick={() => setActiveRecommendationTab('transport')}
                    className="mt-4 text-purple-600 hover:text-purple-800 font-medium text-sm"
                  >
                    View Routes →
                  </button>
                </div>
              </div>
            )}

            {activeRecommendationTab === 'weather' && planningRecommendations.weather && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-sky-100 rounded-2xl p-8 border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-blue-900 mb-3">
                        {planningRecommendations.weather.temperature}°C
                      </div>
                      <div className="text-xl text-blue-700 mb-2">
                        {planningRecommendations.weather.condition}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-800 mb-3">
                        {planningRecommendations.weather.humidity}%
                      </div>
                      <div className="text-blue-600">Humidity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-800 mb-3">
                        {planningRecommendations.weather.windSpeed} km/h
                      </div>
                      <div className="text-blue-600">Wind Speed</div>
                    </div>
                  </div>
                  <div className="bg-blue-100 rounded-xl p-6">
                    <h4 className="font-bold text-blue-900 mb-3">💡 Weather Recommendation</h4>
                    <p className="text-blue-800 text-lg">
                      {planningRecommendations.weather.recommendation}
                    </p>
                  </div>
                </div>

                {/* 7-Day Forecast */}
                {planningRecommendations.weather.forecast && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">7-Day Forecast</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                      {planningRecommendations.weather.forecast.map((day, index) => (
                        <div key={index} className="text-center p-4 rounded-lg bg-gray-50">
                          <div className="font-medium text-gray-900 mb-2">
                            {format(new Date(day.date), 'MMM dd')}
                          </div>
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {day.temperature}°
                          </div>
                          <div className="text-sm text-gray-600">
                            {day.condition}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeRecommendationTab === 'hotels' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {planningRecommendations.hotels.map((hotel) => (
                  <div 
                    key={hotel.id} 
                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedHotel(hotel)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-gray-900 text-xl">{hotel.name}</h4>
                      <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                        <StarIcon className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                        <span className="text-sm font-medium text-yellow-800">{hotel.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span>{hotel.distance}</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="text-3xl font-bold text-green-600 mb-1">${hotel.price}</div>
                      <div className="text-gray-500">per night</div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">Amenities</h5>
                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.map((amenity, index) => (
                          <span key={index} className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-6" 
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to itinerary logic
                      }}
                    >
                      Add to Itinerary
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {activeRecommendationTab === 'activities' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {planningRecommendations.activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-gray-900 text-xl">{activity.name}</h4>
                      <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                        <StarIcon className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                        <span className="text-sm font-medium text-yellow-800">{activity.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">{activity.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{activity.price}</div>
                        <div className="text-gray-500 text-sm">Price</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{activity.duration}</div>
                        <div className="text-gray-500 text-sm">Duration</div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                        {activity.category}
                      </span>
                    </div>

                    {activity.highlights && (
                      <div className="mb-6">
                        <h5 className="font-medium text-gray-900 mb-3">Highlights</h5>
                        <div className="space-y-2">
                          {activity.highlights.slice(0, 3).map((highlight, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                              <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                              {highlight}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to itinerary logic
                      }}
                    >
                      Add to Itinerary
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {activeRecommendationTab === 'transport' && (
              <div className="space-y-6">
                {planningRecommendations.transport.map((transport) => (
                  <div key={transport.id} className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="font-bold text-gray-900 text-2xl">{transport.route}</h4>
                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                            {transport.type}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-gray-600">
                            <ClockIcon className="h-5 w-5 mr-2" />
                            <div>
                              <div className="font-medium">Frequency</div>
                              <div className="text-sm">{transport.frequency}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <ClockIcon className="h-5 w-5 mr-2" />
                            <div>
                              <div className="font-medium">Duration</div>
                              <div className="text-sm">{transport.duration}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                            <div>
                              <div className="font-medium">Price</div>
                              <div className="text-sm">{transport.price}</div>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 leading-relaxed">{transport.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Add Stop Modal */}
      <Modal
        isOpen={showAddStopModal}
        onClose={() => setShowAddStopModal(false)}
        title="Add New Stop"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="City"
              value={stopFormData.cityName}
              onChange={(e) => setStopFormData(prev => ({ ...prev, cityName: e.target.value }))}
              placeholder="Paris"
              required
            />
            <FormInput
              label="Country"
              value={stopFormData.country}
              onChange={(e) => setStopFormData(prev => ({ ...prev, country: e.target.value }))}
              placeholder="France"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Start Date"
              type="date"
              value={stopFormData.startDate}
              onChange={(e) => setStopFormData(prev => ({ ...prev, startDate: e.target.value }))}
              required
            />
            <FormInput
              label="End Date"
              type="date"
              value={stopFormData.endDate}
              onChange={(e) => setStopFormData(prev => ({ ...prev, endDate: e.target.value }))}
              required
            />
          </div>
          <FormInput
            label="Estimated Cost"
            type="number"
            value={stopFormData.estimatedCost}
            onChange={(e) => setStopFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
            placeholder="1000"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddStopModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStop}>
              Add Stop
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Stop Modal */}
      <Modal
        isOpen={showEditStopModal}
        onClose={() => setShowEditStopModal(false)}
        title="Edit Stop"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="City"
              value={stopFormData.cityName}
              onChange={(e) => setStopFormData(prev => ({ ...prev, cityName: e.target.value }))}
              placeholder="Paris"
              required
            />
            <FormInput
              label="Country"
              value={stopFormData.country}
              onChange={(e) => setStopFormData(prev => ({ ...prev, country: e.target.value }))}
              placeholder="France"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Start Date"
              type="date"
              value={stopFormData.startDate}
              onChange={(e) => setStopFormData(prev => ({ ...prev, startDate: e.target.value }))}
              required
            />
            <FormInput
              label="End Date"
              type="date"
              value={stopFormData.endDate}
              onChange={(e) => setStopFormData(prev => ({ ...prev, endDate: e.target.value }))}
              required
            />
          </div>
          <FormInput
            label="Estimated Cost"
            type="number"
            value={stopFormData.estimatedCost}
            onChange={(e) => setStopFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
            placeholder="1000"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowEditStopModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStop}>
              Update Stop
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Activity Modal */}
      <Modal
        isOpen={showAddActivityModal}
        onClose={() => setShowAddActivityModal(false)}
        title="Add New Activity"
      >
        <div className="space-y-4">
          <FormInput
            label="Activity Name"
            value={activityFormData.name}
            onChange={(e) => setActivityFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Eiffel Tower Visit"
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={activityFormData.category}
                onChange={(e) => setActivityFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              >
                <option value="Sightseeing">Sightseeing</option>
                <option value="Food">Food</option>
                <option value="Culture">Culture</option>
                <option value="Adventure">Adventure</option>
                <option value="Shopping">Shopping</option>
                <option value="Nightlife">Nightlife</option>
                <option value="Transportation">Transportation</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <FormInput
              label="Cost"
              type="number"
              value={activityFormData.cost}
              onChange={(e) => setActivityFormData(prev => ({ ...prev, cost: e.target.value }))}
              placeholder="50"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Date & Time"
              type="datetime-local"
              value={activityFormData.date}
              onChange={(e) => setActivityFormData(prev => ({ ...prev, date: e.target.value }))}
            />
            <FormInput
              label="Duration (hours)"
              type="number"
              value={activityFormData.duration}
              onChange={(e) => setActivityFormData(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="2"
              step="0.5"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddActivityModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddActivity}>
              Add Activity
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Activity Modal */}
      <Modal
        isOpen={showEditActivityModal}
        onClose={() => setShowEditActivityModal(false)}
        title="Edit Activity"
      >
        <div className="space-y-4">
          <FormInput
            label="Activity Name"
            value={activityFormData.name}
            onChange={(e) => setActivityFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Eiffel Tower Visit"
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={activityFormData.category}
                onChange={(e) => setActivityFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              >
                <option value="Sightseeing">Sightseeing</option>
                <option value="Food">Food</option>
                <option value="Culture">Culture</option>
                <option value="Adventure">Adventure</option>
                <option value="Shopping">Shopping</option>
                <option value="Nightlife">Nightlife</option>
                <option value="Transportation">Transportation</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <FormInput
              label="Cost"
              type="number"
              value={activityFormData.cost}
              onChange={(e) => setActivityFormData(prev => ({ ...prev, cost: e.target.value }))}
              placeholder="50"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Date & Time"
              type="datetime-local"
              value={activityFormData.date}
              onChange={(e) => setActivityFormData(prev => ({ ...prev, date: e.target.value }))}
            />
            <FormInput
              label="Duration (hours)"
              type="number"
              value={activityFormData.duration}
              onChange={(e) => setActivityFormData(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="2"
              step="0.5"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowEditActivityModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditActivity}>
              Update Activity
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        title="Delete Trip"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrashIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Are you sure you want to delete this trip?
          </h3>
          <p className="text-gray-600 mb-6">
            This action cannot be undone. All stops, activities, and data will be permanently deleted.
          </p>
          <div className="flex justify-center space-x-3">
            <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteTrip}>
              Delete Trip
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TripDetailPage;