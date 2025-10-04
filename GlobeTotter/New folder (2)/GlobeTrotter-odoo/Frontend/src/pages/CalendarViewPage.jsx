import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import TopBar from '../components/common/TopBar';
import Sidebar from '../components/common/Sidebar';

const CalendarViewPage = () => {
  const { trips } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month'); // month, week, day
  const [tripsThisMonth, setTripsThisMonth] = useState([]);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthTrips = trips.filter(trip => {
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      
      // Check if trip overlaps with current month
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      
      return (startDate <= monthEnd && endDate >= monthStart);
    });
    
    setTripsThisMonth(monthTrips);
  }, [currentDate, trips]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getTripsForDate = (date) => {
    if (!date) return [];
    
    return tripsThisMonth.filter(trip => {
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      const checkDate = new Date(date);
      
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTripStatusColor = (status) => {
    switch (status) {
      case 'ongoing': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-purple-500';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <Sidebar />
      
      <div className="ml-16 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Travel Calendar</h1>
            <p className="text-gray-600">View your trips on a monthly calendar</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={goToToday}
                className="flex items-center space-x-2"
              >
                <CalendarIcon className="h-4 w-4" />
                <span>Today</span>
              </Button>
              
              <Link to="/trips/create">
                <Button size="sm" className="flex items-center space-x-2">
                  <PlusIcon className="h-4 w-4" />
                  <span>New Trip</span>
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Calendar Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    
                    <h2 className="text-2xl font-bold">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-white/75 text-sm">Trips this month</p>
                    <p className="text-2xl font-bold">{tripsThisMonth.length}</p>
                  </div>
                </div>
              </div>

              {/* Week Days Header */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {weekDays.map((day) => (
                  <div key={day} className="p-4 text-center font-medium text-gray-600 bg-gray-50">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {days.map((day, index) => {
                  const tripsForDay = day ? getTripsForDate(day) : [];
                  const isToday = day && day.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate && day && day.toDateString() === selectedDate.toDateString();
                  
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: day ? 1.02 : 1 }}
                      className={`min-h-[120px] border-b border-r border-gray-200 p-2 cursor-pointer transition-all ${
                        !day ? 'bg-gray-50' : ''
                      } ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'bg-purple-50 ring-2 ring-purple-500' : ''} ${
                        day ? 'hover:bg-gray-50' : ''
                      }`}
                      onClick={() => day && setSelectedDate(day)}
                    >
                      {day && (
                        <div className="h-full flex flex-col">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium ${
                              isToday ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center' 
                              : 'text-gray-900'
                            }`}>
                              {day.getDate()}
                            </span>
                            {tripsForDay.length > 0 && (
                              <span className="bg-purple-100 text-purple-800 text-xs px-1 rounded">
                                {tripsForDay.length}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            {tripsForDay.slice(0, 3).map((trip) => (
                              <div
                                key={trip.id}
                                className="text-xs p-1 rounded truncate bg-white border border-gray-200 hover:shadow-sm transition-shadow"
                                title={trip.name}
                              >
                                <div className="flex items-center space-x-1">
                                  <div className={`w-2 h-2 rounded-full ${getTripStatusColor(trip.status)}`} />
                                  <span className="truncate">{trip.name}</span>
                                </div>
                              </div>
                            ))}
                            {tripsForDay.length > 3 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{tripsForDay.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Info */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {formatDate(selectedDate)}
                </h3>
                
                <div className="space-y-3">
                  {getTripsForDate(selectedDate).map((trip) => (
                    <div key={trip.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${getTripStatusColor(trip.status)}`} />
                            <h4 className="font-medium text-gray-900">{trip.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center mb-2">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {trip.destination}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <Link to={`/trips/${trip.id}`} className="flex-1">
                          <Button size="sm" variant="secondary" className="w-full flex items-center justify-center">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link to={`/trips/${trip.id}/build-itinerary`} className="flex-1">
                          <Button size="sm" className="w-full flex items-center justify-center">
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  
                  {getTripsForDate(selectedDate).length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No trips on this date</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* This Month's Trips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ListBulletIcon className="h-5 w-5 mr-2" />
                This Month's Trips
              </h3>
              
              <div className="space-y-3">
                {tripsThisMonth.map((trip) => (
                  <Link key={trip.id} to={`/trips/${trip.id}`}>
                    <div className="p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${getTripStatusColor(trip.status)}`} />
                        <h4 className="font-medium text-gray-900 truncate">{trip.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{trip.destination}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
                
                {tripsThisMonth.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No trips this month</p>
                    <Link to="/trips/create">
                      <Button size="sm" className="mt-3">Plan a Trip</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Trip Status Legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Legend</h3>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-700">Ongoing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-700">Upcoming</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                  <span className="text-sm text-gray-700">Completed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm text-gray-700">Planning</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Trips</span>
                  <span className="font-semibold">{trips.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold">{tripsThisMonth.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Upcoming</span>
                  <span className="font-semibold">
                    {trips.filter(t => t.status === 'upcoming').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold">
                    {trips.filter(t => t.status === 'completed').length}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarViewPage;
