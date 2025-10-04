import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon, MapPinIcon, CalendarIcon, CurrencyDollarIcon, PlusIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import ActivityCard from './ActivityCard';
import Button from '../common/Button';

const StopCard = ({ 
  stop, 
  onEditStop, 
  onDeleteStop, 
  onAddActivity, 
  onEditActivity, 
  onDeleteActivity,
  isReadOnly = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd');
    } catch {
      return dateString;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      {/* Stop Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {/* Stop Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <MapPinIcon className="h-5 w-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {stop.cityName}, {stop.country}
                </h3>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(stop.startDate)} - {formatDate(stop.endDate)}</span>
                </div>
                
                {stop.estimatedCost && (
                  <div className="flex items-center space-x-1">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    <span>${stop.estimatedCost.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isReadOnly && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditStop(stop)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDeleteStop(stop.id)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Activities List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4"
          >
            {/* Add Activity Button */}
            {!isReadOnly && (
              <div className="mb-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onAddActivity(stop.id)}
                  className="flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Activity</span>
                </Button>
              </div>
            )}

            {/* Activities */}
            {stop.activities && stop.activities.length > 0 ? (
              <div className="space-y-3">
                {stop.activities.map((activity, index) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onEdit={!isReadOnly ? onEditActivity : undefined}
                    onDelete={!isReadOnly ? onDeleteActivity : undefined}
                    isReadOnly={isReadOnly}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No activities planned yet</p>
                {!isReadOnly && (
                  <p className="text-sm">Add your first activity to get started!</p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StopCard;