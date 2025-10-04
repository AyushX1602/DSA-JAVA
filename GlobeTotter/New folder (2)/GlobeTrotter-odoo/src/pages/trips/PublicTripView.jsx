import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPinIcon, CalendarIcon, CurrencyDollarIcon, DocumentDuplicateIcon, ShareIcon, UserIcon } from '@heroicons/react/24/outline';
import { api } from '../../services/api';
import StopCard from '../../components/trip/StopCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { format } from 'date-fns';

const PublicTripView = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const tripData = await api.getTripById(id);
      // Only show if trip is public
      if (!tripData.isPublic) {
        throw new Error('This trip is not public');
      }
      setTrip(tripData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTrip = () => {
    // Mock copy functionality - would create a new trip based on this one
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    console.log('Trip copied! (Mock functionality)');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: trip.name,
        text: `Check out this amazing trip: ${trip.name}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Trip URL copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const calculateTripStats = () => {
    if (!trip || !trip.stops) return { totalActivities: 0, totalCost: 0, duration: 0 };
    
    const totalActivities = trip.stops.reduce((sum, stop) => sum + (stop.activities?.length || 0), 0);
    const totalCost = trip.stops.reduce((sum, stop) => sum + (stop.estimatedCost || 0), 0);
    const duration = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24));
    
    return { totalActivities, totalCost, duration };
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h1 className="text-2xl font-bold text-red-900 mb-2">Trip Not Available</h1>
              <p className="text-red-700 mb-4">{error}</p>
              <Link to="/">
                <Button>
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!trip) return null;

  const stats = calculateTripStats();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Trip Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8 rounded-xl overflow-hidden"
          >
            {/* Cover Image */}
            <div className="h-64 lg:h-96 relative">
              <img
                src={trip.coverImage || 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                alt={trip.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Trip Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
                  <div className="text-white mb-4 lg:mb-0">
                    <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-3">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Public Trip
                    </div>
                    
                    <h1 className="text-3xl lg:text-5xl font-bold mb-3">
                      {trip.name}
                    </h1>
                    
                    {trip.description && (
                      <p className="text-lg text-gray-200 mb-4 max-w-2xl">
                        {trip.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{trip.stops?.length || 0} stops</span>
                      </div>
                      
                      {stats.totalCost > 0 && (
                        <div className="flex items-center space-x-1">
                          <CurrencyDollarIcon className="h-4 w-4" />
                          <span>${stats.totalCost.toLocaleString()} estimated</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Button
                      onClick={handleCopyTrip}
                      className={`bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-200 ${
                        copied ? 'bg-green-500/80 border-green-400' : ''
                      }`}
                    >
                      <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                      {copied ? 'Copied!' : 'Copy This Trip'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleShare}
                      className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                    >
                      <ShareIcon className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trip Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {stats.duration}
              </div>
              <div className="text-sm text-gray-600">Days</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-secondary-600 mb-2">
                {trip.stops?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Destinations</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-accent-600 mb-2">
                {stats.totalActivities}
              </div>
              <div className="text-sm text-gray-600">Activities</div>
            </div>
          </motion.div>

          {/* Trip Itinerary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Trip Itinerary</h2>

                {trip.stops && trip.stops.length > 0 ? (
                  <div className="space-y-6">
                    {trip.stops.map((stop, index) => (
                      <motion.div
                        key={stop.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <StopCard
                          stop={stop}
                          isReadOnly={true}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
                    <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No detailed itinerary available
                    </h3>
                    <p className="text-gray-600">
                      This trip doesn't have a detailed itinerary yet.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trip Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Trip Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="font-medium">{stats.duration} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Destinations</span>
                    <span className="font-medium">{trip.stops?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Activities</span>
                    <span className="font-medium">{stats.totalActivities}</span>
                  </div>
                  {stats.totalCost > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Est. Cost</span>
                      <span className="font-medium">${stats.totalCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Destinations List */}
              {trip.stops && trip.stops.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Destinations
                  </h3>
                  <div className="space-y-3">
                    {trip.stops.map((stop, index) => (
                      <div key={stop.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-primary-600">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {stop.cityName}, {stop.country}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(stop.startDate), 'MMM dd')} - {format(new Date(stop.endDate), 'MMM dd')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-6 text-white text-center"
              >
                <h3 className="text-lg font-semibold mb-2">
                  Love this itinerary?
                </h3>
                <p className="text-sm text-blue-100 mb-4">
                  Copy this trip to your account and customize it for your own adventure.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={handleCopyTrip}
                    className={`w-full bg-white text-primary-600 hover:bg-gray-100 transition-all duration-200 ${
                      copied ? 'bg-green-100 text-green-800' : ''
                    }`}
                  >
                    <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                    {copied ? 'Copied to Your Account!' : 'Copy This Trip'}
                  </Button>
                  <Link to="/signup">
                    <Button
                      variant="secondary"
                      className="w-full border-white text-white hover:bg-white/10"
                    >
                      Sign Up to Plan Trips
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PublicTripView;