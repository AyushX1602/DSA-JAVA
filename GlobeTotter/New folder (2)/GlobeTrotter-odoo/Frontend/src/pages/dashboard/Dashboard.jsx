import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PlusIcon, MapIcon, CalendarIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';
import TripCard from '../../components/trip/TripCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TopBar from '../../components/common/TopBar';
import Sidebar from '../../components/common/Sidebar';

const Dashboard = () => {
  const { user, trips, loading } = useApp();
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalDestinations: 0,
    averageBudget: 0,
    upcomingTrips: 0
  });

  useEffect(() => {
    if (trips.length > 0) {
      calculateStats();
    }
  }, [trips]);

  const calculateStats = () => {
    const now = new Date();
    const destinations = new Set();
    let totalBudget = 0;
    let upcomingCount = 0;

    trips.forEach(trip => {
      // Count unique destinations
      if (trip.destinations) {
        trip.destinations.forEach(dest => destinations.add(dest));
      }
      
      // Sum budgets
      if (trip.totalBudget) {
        totalBudget += trip.totalBudget;
      }
      
      // Count upcoming trips
      if (new Date(trip.startDate) > now) {
        upcomingCount++;
      }
    });

    setStats({
      totalTrips: trips.length,
      totalDestinations: destinations.size,
      averageBudget: trips.length > 0 ? Math.round(totalBudget / trips.length) : 0,
      upcomingTrips: upcomingCount
    });
  };

  const recentTrips = trips.slice(0, 6);

  const statCards = [
    {
      icon: MapIcon,
      title: 'Total Trips',
      value: stats.totalTrips,
      color: 'text-primary-600'
    },
    {
      icon: UserGroupIcon,
      title: 'Destinations',
      value: stats.totalDestinations,
      color: 'text-secondary-600'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Avg Budget',
      value: `$${stats.averageBudget.toLocaleString()}`,
      color: 'text-accent-600'
    },
    {
      icon: CalendarIcon,
      title: 'Upcoming',
      value: stats.upcomingTrips,
      color: 'text-green-600'
    }
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <Sidebar />
      
      <div className="ml-16 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}! ✈️
            </h1>
            <p className="text-gray-600">
              Ready to plan your next adventure? Here's what's happening with your trips.
            </p>
          </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-gray-100 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* My Trips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Trips</h2>
            <Link to="/trips/new">
              <Button className="flex items-center space-x-2">
                <PlusIcon className="h-5 w-5" />
                <span>Create New Trip</span>
              </Button>
            </Link>
          </div>

          {trips.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-12 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No trips yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start planning your first adventure! Create a trip to organize destinations, 
                activities, and budgets all in one place.
              </p>
              <Link to="/trips/new">
                <Button>
                  <span>Create Your First Trip</span>
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTrips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <TripCard trip={trip} />
                </motion.div>
              ))}
            </div>
          )}

          {trips.length > 6 && (
            <div className="text-center mt-8">
              <Link to="/trips">
                <Button variant="secondary">View All Trips</Button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-8 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Ready for your next adventure?
              </h3>
              <p className="text-blue-100 mb-4 md:mb-0">
                Create a new trip and start planning your perfect itinerary.
              </p>
            </div>
            <div className="flex space-x-4">
              <Link to="/trips/new">
                <Button className="bg-white text-primary-600 hover:bg-gray-100">
                  Plan New Trip
                </Button>
              </Link>
              <Link to="/browse">
                <Button variant="secondary" className="border-white text-white hover:bg-white/10">
                  Browse Inspiration
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

