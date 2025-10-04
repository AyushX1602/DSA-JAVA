import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PlusIcon,
  TrashIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TruckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Navbar from '../../components/common/Navbar';

const BuildItineraryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trips, updateTrip, fetchBusRoutes, addNotification } = useApp();
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [showAddDay, setShowAddDay] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(null);
  const [busRoutes, setBusRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrip();
  }, [id, trips]);

  const loadTrip = () => {
    const foundTrip = trips.find(t => t.id === parseInt(id));
    if (foundTrip) {
      setTrip(foundTrip);
      setItinerary(foundTrip.itinerary || []);
    }
    setLoading(false);
  };

  const addDay = () => {
    const newDay = {
      id: Date.now(),
      day: itinerary.length + 1,
      location: '',
      activities: [],
      budget: 0,
      transportation: null
    };
    setItinerary([...itinerary, newDay]);
    setShowAddDay(false);
  };

  const updateDay = (dayId, updates) => {
    setItinerary(prev => prev.map(day => 
      day.id === dayId ? { ...day, ...updates } : day
    ));
  };

  const removeDay = (dayId) => {
    setItinerary(prev => prev.filter(day => day.id !== dayId));
  };

  const addActivity = (dayId, activity) => {
    setItinerary(prev => prev.map(day => 
      day.id === dayId 
        ? { ...day, activities: [...day.activities, { id: Date.now(), ...activity }] }
        : day
    ));
    setShowAddActivity(null);
  };

  const removeActivity = (dayId, activityId) => {
    setItinerary(prev => prev.map(day => 
      day.id === dayId 
        ? { ...day, activities: day.activities.filter(a => a.id !== activityId) }
        : day
    ));
  };

  const searchBusRoutes = async (from, to) => {
    const routes = await fetchBusRoutes(from, to);
    setBusRoutes(routes);
  };

  const saveItinerary = async () => {
    try {
      const updatedTrip = await updateTrip(trip.id, { itinerary });
      addNotification('Itinerary saved successfully!', 'success');
      navigate(`/trips/${trip.id}/itinerary`);
    } catch (error) {
      addNotification('Failed to save itinerary', 'error');
    }
  };

  const ActivityForm = ({ onAdd, onCancel }) => {
    const [activityData, setActivityData] = useState({
      name: '',
      time: '',
      duration: '',
      cost: '',
      notes: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onAdd(activityData);
      setActivityData({ name: '', time: '', duration: '', cost: '', notes: '' });
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-gray-200 rounded-lg p-4 mt-4"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Activity name"
              value={activityData.name}
              onChange={(e) => setActivityData(prev => ({ ...prev, name: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <input
              type="time"
              value={activityData.time}
              onChange={(e) => setActivityData(prev => ({ ...prev, time: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Duration (e.g., 2 hours)"
              value={activityData.duration}
              onChange={(e) => setActivityData(prev => ({ ...prev, duration: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Cost ($)"
              value={activityData.cost}
              onChange={(e) => setActivityData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <textarea
            placeholder="Notes (optional)"
            value={activityData.notes}
            onChange={(e) => setActivityData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
          />
          <div className="flex space-x-2">
            <Button type="submit" size="sm">Add Activity</Button>
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    );
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Build Itinerary: {trip.name}
              </h1>
              <p className="text-gray-600">
                Plan your daily activities and manage your budget
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => navigate(`/trips/${trip.id}`)}
              >
                Cancel
              </Button>
              <Button onClick={saveItinerary}>
                Save Itinerary
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Trip Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">
                  {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Destination</p>
                <p className="font-semibold">{trip.destination}</p>
              </div>
            </div>
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="font-semibold">
                  ${itinerary.reduce((total, day) => total + (day.budget || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Itinerary Days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <AnimatePresence>
            {itinerary.map((day, index) => (
              <motion.div
                key={day.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Day Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/20 rounded-full px-3 py-1">
                        <span className="font-semibold">Day {day.day}</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Location (e.g., Paris, France)"
                        value={day.location}
                        onChange={(e) => updateDay(day.id, { location: e.target.value })}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/70 focus:bg-white/20 focus:outline-none"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-sm opacity-75">Daily Budget</p>
                        <input
                          type="number"
                          placeholder="0"
                          value={day.budget || ''}
                          onChange={(e) => updateDay(day.id, { budget: parseFloat(e.target.value) || 0 })}
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-right w-24 focus:bg-white/20 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => removeDay(day.id)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Activities */}
                <div className="p-6">
                  <div className="space-y-4">
                    {day.activities.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <ClockIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium">{activity.time || 'No time set'}</span>
                            </div>
                            <h4 className="font-semibold text-gray-900">{activity.name}</h4>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            {activity.duration && (
                              <span>{activity.duration}</span>
                            )}
                            {activity.cost && (
                              <span className="flex items-center">
                                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                ${activity.cost}
                              </span>
                            )}
                            {activity.notes && (
                              <span className="text-gray-500">{activity.notes}</span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeActivity(day.id, activity.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add Activity */}
                  <AnimatePresence>
                    {showAddActivity === day.id ? (
                      <ActivityForm
                        onAdd={(activity) => addActivity(day.id, activity)}
                        onCancel={() => setShowAddActivity(null)}
                      />
                    ) : (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowAddActivity(day.id)}
                        className="w-full mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                      >
                        <PlusIcon className="h-5 w-5 mx-auto mb-1" />
                        <span>Add Activity</span>
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Transportation */}
                  {index < itinerary.length - 1 && day.location && itinerary[index + 1].location && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center space-x-2 mb-4">
                        <TruckIcon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          Transportation to {itinerary[index + 1].location}
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => searchBusRoutes(day.location, itinerary[index + 1].location)}
                        >
                          Search Routes
                        </Button>
                      </div>
                      
                      {busRoutes.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {busRoutes.map((route) => (
                            <div
                              key={route.id}
                              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium">{route.operator}</span>
                                <span className="text-lg font-bold text-green-600">${route.price}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>{route.departure} → {route.arrival}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Day Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {showAddDay ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <p className="text-gray-600 mb-4">Add a new day to your itinerary</p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={addDay}>Add Day</Button>
                  <Button variant="secondary" onClick={() => setShowAddDay(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddDay(true)}
                className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                <PlusIcon className="h-8 w-8 mx-auto mb-2" />
                <span className="text-lg font-medium">Add New Day</span>
              </button>
            )}
          </motion.div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Button size="lg" onClick={saveItinerary} className="px-8">
            Save & View Itinerary
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default BuildItineraryPage;
