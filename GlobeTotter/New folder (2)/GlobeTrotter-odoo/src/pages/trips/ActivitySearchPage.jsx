import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  TagIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  FunnelIcon,
  HeartIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Navbar from '../../components/common/Navbar';

const ActivitySearchPage = () => {
  const { activities, hotels, fetchWeather } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favoriteActivities, setFavoriteActivities] = useState(new Set());
  const [activeTab, setActiveTab] = useState('activities');
  const [weatherData, setWeatherData] = useState(null);

  const categories = [
    'All Categories',
    'Sightseeing',
    'Food & Dining',
    'Culture',
    'Adventure',
    'Shopping',
    'Nightlife',
    'Tours',
    'Museums',
    'Parks & Nature'
  ];

  const cities = [
    'All Cities',
    'Paris',
    'Tokyo',
    'London',
    'New York',
    'Rome',
    'Barcelona',
    'Amsterdam',
    'Berlin',
    'Prague',
    'Vienna'
  ];

  useEffect(() => {
    filterResults();
  }, [searchTerm, selectedCity, selectedCategory, priceRange, activities, hotels]);

  useEffect(() => {
    if (selectedCity && selectedCity !== 'All Cities') {
      loadWeatherData();
    }
  }, [selectedCity]);

  const filterResults = () => {
    // Filter activities
    let filteredActs = activities.filter(activity => {
      const matchesSearch = !searchTerm || 
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCity = !selectedCity || selectedCity === 'All Cities' || 
        activity.city === selectedCity;
      
      const matchesCategory = !selectedCategory || selectedCategory === 'All Categories' || 
        activity.category === selectedCategory;
      
      const matchesPrice = activity.price >= priceRange[0] && activity.price <= priceRange[1];
      
      return matchesSearch && matchesCity && matchesCategory && matchesPrice;
    });

    // Filter hotels
    let filteredHtls = hotels.filter(hotel => {
      const matchesSearch = !searchTerm || 
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCity = !selectedCity || selectedCity === 'All Cities' || 
        hotel.city === selectedCity;
      
      const matchesPrice = hotel.pricePerNight >= priceRange[0] && hotel.pricePerNight <= priceRange[1];
      
      return matchesSearch && matchesCity && matchesPrice;
    });

    setFilteredActivities(filteredActs);
    setFilteredHotels(filteredHtls);
  };

  const loadWeatherData = async () => {
    setLoading(true);
    try {
      const weather = await fetchWeather(selectedCity);
      setWeatherData(weather);
    } catch (error) {
      console.error('Failed to load weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (activityId) => {
    const newFavorites = new Set(favoriteActivities);
    if (newFavorites.has(activityId)) {
      newFavorites.delete(activityId);
    } else {
      newFavorites.add(activityId);
    }
    setFavoriteActivities(newFavorites);
  };

  const ActivityCard = ({ activity }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={activity.image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400'}
          alt={activity.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <button
            onClick={() => toggleFavorite(activity.id)}
            className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
          >
            {favoriteActivities.has(activity.id) ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
            {activity.category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.name}</h3>
        
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>{activity.city}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{activity.duration}</span>
          </div>
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
            <span>{activity.rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-900 font-semibold">
            <CurrencyDollarIcon className="h-5 w-5 mr-1" />
            <span>${activity.price}</span>
          </div>
          <Button size="sm" className="flex items-center space-x-1">
            <PlusIcon className="h-4 w-4" />
            <span>Add to Trip</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const HotelCard = ({ hotel }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <div className="flex items-center bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            <StarIcon className="h-3 w-3 mr-1" />
            <span>{hotel.rating}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{hotel.name}</h3>
        
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>{hotel.city}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {hotel.amenities?.map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-gray-900 font-semibold">
            <span className="text-lg">${hotel.pricePerNight}</span>
            <span className="text-sm text-gray-600">/night</span>
          </div>
          <Button size="sm" variant="secondary">
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Activities & Hotels
          </h1>
          <p className="text-gray-600">
            Find amazing things to do and places to stay for your trip
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price ($)
              </label>
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">
                $0 - ${priceRange[1]}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Weather Info */}
        {weatherData && selectedCity !== 'All Cities' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-8 text-white"
          >
            <h3 className="text-lg font-semibold mb-4">Weather in {selectedCity}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {weatherData.forecast?.map((day, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm opacity-90">{day.day}</p>
                  <div className="text-2xl my-2">{day.icon}</div>
                  <p className="text-lg font-semibold">{day.temp}°C</p>
                  <p className="text-xs opacity-75">{day.condition}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex space-x-4 mb-8"
        >
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'activities'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Activities ({filteredActivities.length})
          </button>
          <button
            onClick={() => setActiveTab('hotels')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'hotels'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Hotels ({filteredHotels.length})
          </button>
        </motion.div>

        {/* Results */}
        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {activeTab === 'activities' ? (
              filteredActivities.length === 0 ? (
                <div className="text-center py-12">
                  <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No activities found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search criteria or filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ActivityCard activity={activity} />
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              filteredHotels.length === 0 ? (
                <div className="text-center py-12">
                  <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hotels found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search criteria or filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHotels.map((hotel, index) => (
                    <motion.div
                      key={hotel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <HotelCard hotel={hotel} />
                    </motion.div>
                  ))}
                </div>
              )
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ActivitySearchPage;
