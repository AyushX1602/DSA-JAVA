import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusIcon, CurrencyDollarIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { api } from '../../services/api';
import ChartWrapper from '../../components/trip/ChartWrapper';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Navbar from '../../components/common/Navbar';
import { format } from 'date-fns';

const BudgetPage = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    type: 'Accommodation',
    amount: '',
    date: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripData, expenseData] = await Promise.all([
        api.getTripById(id),
        api.getExpenses(id)
      ]);
      setTrip(tripData);
      setExpenses(expenseData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    try {
      const newExpense = await api.addExpense(id, {
        ...expenseFormData,
        amount: parseFloat(expenseFormData.amount)
      });
      setExpenses(prev => [...prev, newExpense]);
      setShowAddExpenseModal(false);
      resetExpenseForm();
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  const resetExpenseForm = () => {
    setExpenseFormData({
      type: 'Accommodation',
      amount: '',
      date: '',
      description: ''
    });
  };

  const calculateTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    const categories = {};
    expenses.forEach(expense => {
      if (categories[expense.type]) {
        categories[expense.type] += expense.amount;
      } else {
        categories[expense.type] = expense.amount;
      }
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value
    }));
  };

  const getMonthlyExpenses = () => {
    const months = {};
    expenses.forEach(expense => {
      const month = format(new Date(expense.date), 'MMM');
      if (months[month]) {
        months[month] += expense.amount;
      } else {
        months[month] = expense.amount;
      }
    });
    
    return Object.entries(months).map(([name, value]) => ({
      name,
      value
    }));
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
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

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-red-900 mb-2">Trip Not Found</h1>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalExpenses = calculateTotalExpenses();
  const budgetRemaining = (trip.totalBudget || 0) - totalExpenses;
  const budgetProgress = trip.totalBudget ? (totalExpenses / trip.totalBudget) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Budget Management
          </h1>
          <p className="text-gray-600">
            Track expenses and manage the budget for <strong>{trip.name}</strong>
          </p>
        </motion.div>

        {/* Budget Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Total Budget */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(trip.totalBudget || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${
                budgetProgress > 90 ? 'bg-red-100' : budgetProgress > 70 ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <CurrencyDollarIcon className={`h-6 w-6 ${
                  budgetProgress > 90 ? 'text-red-600' : budgetProgress > 70 ? 'text-yellow-600' : 'text-green-600'
                }`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalExpenses.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Remaining */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${
                budgetRemaining < 0 ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <CurrencyDollarIcon className={`h-6 w-6 ${
                  budgetRemaining < 0 ? 'text-red-600' : 'text-gray-600'
                }`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {budgetRemaining < 0 ? 'Over Budget' : 'Remaining'}
                </p>
                <p className={`text-2xl font-bold ${
                  budgetRemaining < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {budgetRemaining < 0 ? '-' : ''}${Math.abs(budgetRemaining).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Budget Progress Bar */}
        {trip.totalBudget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Budget Progress</h3>
              <span className="text-sm text-gray-600">{Math.round(budgetProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  budgetProgress > 100 
                    ? 'bg-red-500' 
                    : budgetProgress > 80 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetProgress, 100)}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* Charts and Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Expense by Category Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ChartWrapper
              type="pie"
              data={getExpensesByCategory()}
              title="Expenses by Category"
            />
          </motion.div>

          {/* Monthly Spending Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ChartWrapper
              type="bar"
              data={getMonthlyExpenses()}
              title="Monthly Spending"
            />
          </motion.div>
        </div>

        {/* Expenses List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Expenses
              </h3>
              <Button
                onClick={() => setShowAddExpenseModal(true)}
                className="flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Expense</span>
              </Button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {expenses.length > 0 ? (
              expenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <CurrencyDollarIcon className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {expense.type}
                            </p>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {formatDate(expense.date)}
                            </span>
                          </div>
                          {expense.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {expense.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <p className="text-lg font-semibold text-gray-900">
                        ${expense.amount.toLocaleString()}
                      </p>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <TrashIcon className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center">
                <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No expenses recorded yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start tracking your trip expenses to stay within budget.
                </p>
                <Button onClick={() => setShowAddExpenseModal(true)}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add First Expense
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        title="Add New Expense"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={expenseFormData.type}
                onChange={(e) => setExpenseFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              >
                <option value="Accommodation">Accommodation</option>
                <option value="Food">Food & Dining</option>
                <option value="Transportation">Transportation</option>
                <option value="Activities">Activities</option>
                <option value="Shopping">Shopping</option>
                <option value="Emergency">Emergency</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <FormInput
              label="Amount"
              type="number"
              value={expenseFormData.amount}
              onChange={(e) => setExpenseFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="100"
              required
            />
          </div>
          <FormInput
            label="Date"
            type="date"
            value={expenseFormData.date}
            onChange={(e) => setExpenseFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={expenseFormData.description}
              onChange={(e) => setExpenseFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Additional details about this expense..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddExpenseModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExpense}>
              Add Expense
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BudgetPage;