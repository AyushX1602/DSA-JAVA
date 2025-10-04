import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  PencilIcon,
  ShareIcon,
  PrinterIcon,
  TruckIcon,
  StarIcon,
  BuildingOfficeIcon,
  SunIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Navbar from '../../components/common/Navbar';

const ItineraryViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trips, hotels, fetchWeather, addNotification } = useApp();
  const [trip, setTrip] = useState(null);
  const [weatherData, setWeatherData] = useState({});
  const [hotelRecommendations, setHotelRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrip();
  }, [id, trips]);

  const loadTrip = async () => {
    const foundTrip = trips.find(t => t.id === parseInt(id));
    if (foundTrip) {
      setTrip(foundTrip);
      await loadAdditionalData(foundTrip);
    }
    setLoading(false);
  };

  const loadAdditionalData = async (tripData) => {
    // Load weather data for each location
    if (tripData.itinerary) {
      const locations = [...new Set(tripData.itinerary.map(day => day.location).filter(Boolean))];
      const weatherPromises = locations.map(async (location) => {
        const weather = await fetchWeather(location);
        return { location, weather };
      });
      
      const weatherResults = await Promise.all(weatherPromises);
      const weatherMap = {};
      weatherResults.forEach(({ location, weather }) => {
        weatherMap[location] = weather;
      });
      setWeatherData(weatherMap);
    }

    // Load hotel recommendations
    const relevantHotels = hotels.filter(hotel => 
      tripData.destination?.toLowerCase().includes(hotel.city?.toLowerCase())
    );
    setHotelRecommendations(relevantHotels.slice(0, 3));
  };

  const getTotalBudget = () => {
    if (!trip?.itinerary) return 0;
    return trip.itinerary.reduce((total, day) => {
      const dayBudget = day.activities?.reduce((dayTotal, activity) => 
        dayTotal + (activity.cost || 0), 0) || 0;
      return total + dayBudget;
    }, 0);
  };

  const shareItinerary = () => {
    const url = `${window.location.origin}/trips/${trip.id}`;
    navigator.clipboard.writeText(url);
    addNotification('Trip link copied to clipboard!', 'success');
  };

  const printItinerary = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h2>
            <Button onClick={() => navigate('/trips')}>Back to Trips</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.name}</h1>
              <p className="text-gray-600">{trip.destination}</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button
                variant="secondary"
                onClick={shareItinerary}
                className="flex items-center space-x-2"
              >
                <ShareIcon className="h-4 w-4" />
                <span>Share</span>
              </Button>
              <Button
                variant="secondary"
                onClick={printItinerary}
                className="flex items-center space-x-2"
              >
                <PrinterIcon className="h-4 w-4" />
                <span>Print</span>
              </Button>
              <Link to={`/trips/${trip.id}/build-itinerary`}>
                <Button className="flex items-center space-x-2">
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Trip Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center">
              <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">
                  {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Days</p>
                <p className="font-semibold">{trip.itinerary?.length || 0} days</p>
              </div>
            </div>
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="font-semibold">${getTotalBudget()}</p>
              </div>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-6 w-6 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold capitalize">{trip.status}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Itinerary */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {trip.itinerary?.map((day, index) => (
                <motion.div
                  key={day.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Day Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-white/20 rounded-full px-3 py-1">
                          <span className="font-semibold">Day {day.day}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{day.location}</h3>
                          {weatherData[day.location] && (
                            <div className="flex items-center space-x-2 mt-1">
                              <SunIcon className="h-4 w-4" />
                              <span className="text-sm">
                                {weatherData[day.location].current?.temp}°C, {weatherData[day.location].current?.condition}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm opacity-75">Daily Budget</p>
                        <p className="text-xl font-bold">
                          ${day.activities?.reduce((total, activity) => total + (activity.cost || 0), 0) || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="p-6">
                    {day.activities?.length > 0 ? (
                      <div className="space-y-4">
                        {day.activities.map((activity, actIndex) => (
                          <motion.div
                            key={activity.id || actIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + actIndex * 0.1 }}
                            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-shrink-0 w-16 text-center">
                              <div className="bg-white rounded-lg px-2 py-1 text-sm font-medium text-gray-700">
                                {activity.time || '--:--'}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{activity.name}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                {activity.duration && (
                                  <span className="flex items-center">
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                    {activity.duration}
                                  </span>
                                )}
                                {activity.cost && (
                                  <span className="flex items-center">
                                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                    ${activity.cost}
                                  </span>
                                )}
                              </div>
                              {activity.notes && (
                                <p className="text-sm text-gray-600 mt-2">{activity.notes}</p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No activities planned for this day</p>
                      </div>
                    )}

                    {/* Transportation */}
                    {index < (trip.itinerary?.length || 0) - 1 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center text-gray-600">
                          <TruckIcon className="h-5 w-5 mr-2" />
                          <span>
                            Travel to {trip.itinerary[index + 1]?.location}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )) || (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No itinerary yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start building your day-by-day itinerary
                  </p>
                  <Link to={`/trips/${trip.id}/build-itinerary`}>
                    <Button>Build Itinerary</Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Forecast */}
            {Object.keys(weatherData).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Forecast</h3>
                <div className="space-y-4">
                  {Object.entries(weatherData).map(([location, weather]) => (
                    <div key={location}>
                      <h4 className="font-medium text-gray-900 mb-2">{location}</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {weather.forecast?.slice(0, 3).map((day, index) => (
                          <div key={index} className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-lg mb-1">{day.icon}</div>
                            <p className="font-medium">{day.temp}°</p>
                            <p className="text-xs text-gray-600">{day.day}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Hotel Recommendations */}
            {hotelRecommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                  Hotel Recommendations
                </h3>
                <div className="space-y-4">
                  {hotelRecommendations.map((hotel) => (
                    <div key={hotel.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{hotel.name}</h4>
                          <div className="flex items-center mt-1">
                            <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm text-gray-600">{hotel.rating}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {hotel.amenities?.slice(0, 3).map((amenity, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-bold text-gray-900">
                            ${hotel.pricePerNight}
                          </p>
                          <p className="text-xs text-gray-600">/night</p>
                        </div>
                      </div>
                      <Button size="sm" variant="secondary" className="w-full mt-3">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Budget Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Summary</h3>
              <div className="space-y-3">
                {trip.itinerary?.map((day) => (
                  <div key={day.id} className="flex justify-between">
                    <span className="text-gray-600">Day {day.day}</span>
                    <span className="font-medium">
                      ${day.activities?.reduce((total, activity) => total + (activity.cost || 0), 0) || 0}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${getTotalBudget()}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryViewPage;
