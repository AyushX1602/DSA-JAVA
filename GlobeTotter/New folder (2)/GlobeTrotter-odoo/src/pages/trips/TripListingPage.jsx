import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  MapIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';
import TripCard from '../../components/trip/TripCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Navbar from '../../components/common/Navbar';

const TripListingPage = () => {
  const { trips, loading } = useApp();
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    filterAndSortTrips();
  }, [trips, activeFilter, searchTerm, sortBy]);

  const filterAndSortTrips = () => {
    let result = [...trips];

    // Filter by status
    if (activeFilter !== 'all') {
      result = result.filter(trip => trip.status === activeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      result = result.filter(trip => 
        trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort trips
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate);
        case 'oldest':
          return new Date(a.createdAt || a.startDate) - new Date(b.createdAt || b.startDate);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'budget':
          return (b.budget || 0) - (a.budget || 0);
        default:
          return 0;
      }
    });

    setFilteredTrips(result);
  };

  const getStatusCounts = () => {
    const counts = {
      all: trips.length,
      ongoing: 0,
      upcoming: 0,
      completed: 0
    };

    trips.forEach(trip => {
      if (trip.status) {
        counts[trip.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const filterTabs = [
    { 
      key: 'all', 
      label: 'All Trips', 
      count: statusCounts.all,
      icon: MapIcon,
      color: 'text-gray-600' 
    },
    { 
      key: 'ongoing', 
      label: 'Ongoing', 
      count: statusCounts.ongoing,
      icon: ClockIcon,
      color: 'text-green-600' 
    },
    { 
      key: 'upcoming', 
      label: 'Upcoming', 
      count: statusCounts.upcoming,
      icon: CalendarIcon,
      color: 'text-blue-600' 
    },
    { 
      key: 'completed', 
      label: 'Completed', 
      count: statusCounts.completed,
      icon: MapIcon,
      color: 'text-gray-500' 
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Trips</h1>
            <p className="text-gray-600">
              Manage and organize all your travel adventures
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link to="/trips/new">
              <Button className="flex items-center space-x-2">
                <PlusIcon className="h-5 w-5" />
                <span>Create New Trip</span>
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-wrap gap-4 mb-6">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                    activeFilter === tab.key
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                  <span className="bg-white px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips by name or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="budget">Highest Budget</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Trips Grid */}
        {filteredTrips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-12 text-center"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || activeFilter !== 'all' ? 'No trips found' : 'No trips yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || activeFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters.'
                : 'Start planning your first adventure! Create a trip to organize destinations, activities, and budgets all in one place.'
              }
            </p>
            {!searchTerm && activeFilter === 'all' && (
              <Link to="/trips/new">
                <Button>Create Your First Trip</Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <TripCard trip={trip} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Results Summary */}
        {filteredTrips.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center text-gray-600"
          >
            <p>
              Showing {filteredTrips.length} of {trips.length} trips
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TripListingPage;
