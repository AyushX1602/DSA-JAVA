import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  PlusIcon,
  XMarkIcon,
  CameraIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon, ShareIcon } from '@heroicons/react/24/solid';
import { useApp } from '../../context/AppContext';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ItineraryPage = () => {
  const { id } = useParams();
  const { trips, loading } = useApp();
  const [trip, setTrip] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'food',
    time: ''
  });
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    time: '',
    duration: '',
    cost: '',
    location: ''
  });

  useEffect(() => {
    if (trips.length > 0) {
      const foundTrip = trips.find(t => t.id === id);
      setTrip(foundTrip);
      // Mock expenses for demonstration
      setExpenses([
        { id: 1, description: 'Hotel Booking', amount: 120, category: 'accommodation', time: '09:00', day: 0 },
        { id: 2, description: 'Breakfast', amount: 25, category: 'food', time: '08:30', day: 0 },
        { id: 3, description: 'Museum Ticket', amount: 15, category: 'activity', time: '14:00', day: 0 },
        { id: 4, description: 'Lunch', amount: 35, category: 'food', time: '12:30', day: 1 },
        { id: 5, description: 'Taxi', amount: 18, category: 'transport', time: '16:00', day: 1 },
      ]);
    }
  }, [trips, id]);

  const getDayData = (dayIndex) => {
    if (!trip) return { activities: [], expenses: [] };
    
    const dayExpenses = expenses.filter(exp => exp.day === dayIndex);
    const mockActivities = [
      {
        id: 1,
        title: 'Morning Coffee & Breakfast',
        description: 'Start the day at a local café',
        time: '08:00',
        duration: '1h',
        cost: 25,
        location: 'Downtown Café',
        completed: true
      },
      {
        id: 2,
        title: 'City Walking Tour',
        description: 'Explore the historic city center',
        time: '10:00',
        duration: '3h',
        cost: 45,
        location: 'Historic District',
        completed: dayIndex < selectedDay
      },
      {
        id: 3,
        title: 'Lunch at Local Restaurant',
        description: 'Try authentic local cuisine',
        time: '13:30',
        duration: '1.5h',
        cost: 40,
        location: 'Traditional Restaurant',
        completed: false
      },
      {
        id: 4,
        title: 'Museum Visit',
        description: 'Explore art and history',
        time: '16:00',
        duration: '2h',
        cost: 20,
        location: 'National Museum',
        completed: false
      }
    ];
    
    return { activities: mockActivities, expenses: dayExpenses };
  };

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount) {
      const expense = {
        id: Date.now(),
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        day: selectedDay
      };
      setExpenses([...expenses, expense]);
      setNewExpense({ description: '', amount: '', category: 'food', time: '' });
      setShowExpenseModal(false);
    }
  };

  const getTripDays = () => {
    if (!trip) return [];
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = [];
    const current = new Date(start);
    
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: 'bg-orange-100 text-orange-800',
      transport: 'bg-blue-100 text-blue-800',
      accommodation: 'bg-purple-100 text-purple-800',
      activity: 'bg-green-100 text-green-800',
      shopping: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
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

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip not found</h1>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tripDays = getTripDays();
  const currentDayData = getDayData(selectedDay);
  const totalDayExpenses = currentDayData.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold mb-2"
            >
              {trip.name}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-blue-100 text-lg"
            >
              {trip.description}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 mt-4"
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                <span>{formatDate(new Date(trip.startDate))} - {formatDate(new Date(trip.endDate))}</span>
              </div>
              <div className="flex items-center gap-2">
                <CurrencyDollarIcon className="h-5 w-5" />
                <span>${trip.totalBudget?.toLocaleString()}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Day Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Days</h3>
              <div className="space-y-2">
                {tripDays.map((day, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDay(index)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      selectedDay === index
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">Day {index + 1}</div>
                    <div className={`text-sm ${selectedDay === index ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatDate(day)}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Day {selectedDay + 1} - {formatDate(tripDays[selectedDay])}
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowActivityModal(true)}
                    className="flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Activity
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowExpenseModal(true)}
                    className="flex items-center gap-2"
                  >
                    <CurrencyDollarIcon className="h-4 w-4" />
                    Add Expense
                  </Button>
                </div>
              </div>

              {/* Daily Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 mb-1">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span className="font-medium">Activities</span>
                  </div>
                  <div className="text-2xl font-bold text-green-800">
                    {currentDayData.activities.length}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700 mb-1">
                    <CurrencyDollarIcon className="h-5 w-5" />
                    <span className="font-medium">Expenses</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-800">
                    ${totalDayExpenses}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 text-purple-700 mb-1">
                    <ClockIcon className="h-5 w-5" />
                    <span className="font-medium">Duration</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-800">
                    8h
                  </div>
                </div>
              </div>

              {/* Glowing Timeline */}
              <div className="relative">
                {/* Glowing background line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-500 to-pink-400 opacity-60"></div>
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-500 to-pink-400 blur-sm"></div>
                
                <div className="space-y-6">
                  {currentDayData.activities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex items-start gap-6"
                    >
                      {/* Glowing timeline dot */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full ${
                          activity.completed 
                            ? 'bg-green-500 shadow-lg shadow-green-500/50' 
                            : 'bg-blue-500 shadow-lg shadow-blue-500/50'
                        } border-2 border-white`}></div>
                        <div className={`absolute inset-0 w-4 h-4 rounded-full ${
                          activity.completed ? 'bg-green-500' : 'bg-blue-500'
                        } blur-md opacity-40`}></div>
                      </div>

                      {/* Activity Card */}
                      <div className="flex-1 bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {activity.time}
                              </span>
                              <span className="text-sm text-gray-500">{activity.duration}</span>
                              {activity.completed && (
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                              {activity.title}
                            </h4>
                            <p className="text-gray-600 mb-3">{activity.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPinIcon className="h-4 w-4" />
                                {activity.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <CurrencyDollarIcon className="h-4 w-4" />
                                ${activity.cost}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button className="p-2 text-gray-400 hover:text-pink-500 transition-colors">
                              <HeartIcon className="h-5 w-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                              <ShareIcon className="h-5 w-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-green-500 transition-colors">
                              <CameraIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Expenses Section */}
              {currentDayData.expenses.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Expenses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentDayData.expenses.map((expense) => (
                      <motion.div
                        key={expense.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{expense.description}</h4>
                            <p className="text-sm text-gray-500">{expense.time}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">${expense.amount}</div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                              {expense.category}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Add Expense">
        <div className="space-y-4">
          <FormInput
            label="Description"
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            placeholder="e.g., Lunch at restaurant"
          />
          <FormInput
            label="Amount"
            type="number"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            placeholder="0.00"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            >
              <option value="food">Food & Drinks</option>
              <option value="transport">Transportation</option>
              <option value="accommodation">Accommodation</option>
              <option value="activity">Activities</option>
              <option value="shopping">Shopping</option>
              <option value="other">Other</option>
            </select>
          </div>
          <FormInput
            label="Time"
            type="time"
            value={newExpense.time}
            onChange={(e) => setNewExpense({ ...newExpense, time: e.target.value })}
          />
          <div className="flex gap-3 pt-4">
            <Button onClick={handleAddExpense} className="flex-1">
              Add Expense
            </Button>
            <Button variant="secondary" onClick={() => setShowExpenseModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Activity Modal */}
      <Modal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} title="Add Activity">
        <div className="space-y-4">
          <FormInput
            label="Activity Title"
            value={newActivity.title}
            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
            placeholder="e.g., Visit Eiffel Tower"
          />
          <FormInput
            label="Description"
            value={newActivity.description}
            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
            placeholder="Brief description of the activity"
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Time"
              type="time"
              value={newActivity.time}
              onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
            />
            <FormInput
              label="Duration"
              value={newActivity.duration}
              onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
              placeholder="e.g., 2h 30min"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Estimated Cost"
              type="number"
              value={newActivity.cost}
              onChange={(e) => setNewActivity({ ...newActivity, cost: e.target.value })}
              placeholder="0.00"
            />
            <FormInput
              label="Location"
              value={newActivity.location}
              onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
              placeholder="Address or venue name"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={() => setShowActivityModal(false)} className="flex-1">
              Add Activity
            </Button>
            <Button variant="secondary" onClick={() => setShowActivityModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ItineraryPage;
