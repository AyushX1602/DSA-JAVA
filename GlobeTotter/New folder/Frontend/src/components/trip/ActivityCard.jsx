import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, CurrencyDollarIcon, TagIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Button from '../common/Button';

const ActivityCard = ({ 
  activity, 
  onEdit, 
  onDelete, 
  isReadOnly = false 
}) => {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, h:mm a');
    } catch {
      return dateString;
    }
  };

  const categoryColors = {
    'Sightseeing': 'bg-blue-100 text-blue-800',
    'Food': 'bg-red-100 text-red-800',
    'Culture': 'bg-purple-100 text-purple-800',
    'Adventure': 'bg-green-100 text-green-800',
    'Shopping': 'bg-yellow-100 text-yellow-800',
    'Nightlife': 'bg-pink-100 text-pink-800',
    'Transportation': 'bg-gray-100 text-gray-800',
    'Accommodation': 'bg-indigo-100 text-indigo-800',
    'Other': 'bg-gray-100 text-gray-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Activity Name */}
          <h4 className="font-medium text-gray-900 mb-2">
            {activity.name}
          </h4>

          {/* Activity Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
            {/* Category */}
            {activity.category && (
              <div className="flex items-center space-x-1">
                <TagIcon className="h-4 w-4" />
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    categoryColors[activity.category] || categoryColors['Other']
                  }`}
                >
                  {activity.category}
                </span>
              </div>
            )}

            {/* Cost */}
            {activity.cost && (
              <div className="flex items-center space-x-1">
                <CurrencyDollarIcon className="h-4 w-4" />
                <span>${activity.cost.toLocaleString()}</span>
              </div>
            )}

            {/* Date/Time */}
            {activity.date && (
              <div className="flex items-center space-x-1">
                <CalendarIcon className="h-4 w-4" />
                <span>{formatDate(activity.date)}</span>
              </div>
            )}

            {/* Duration */}
            {activity.duration && (
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-4 w-4" />
                <span>{activity.duration} hours</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!isReadOnly && (
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(activity)}
              className="text-xs"
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(activity.id)}
              className="text-xs"
            >
              Delete
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ActivityCard;