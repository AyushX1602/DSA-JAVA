import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPinIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const TripCard = ({ trip, showOwner = false }) => {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <Link to={`/trips/${trip.id}`}>
        {/* Cover Image */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={trip.coverImage || 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&w=800'} 
            alt={trip.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Public/Private Badge */}
          <div className="absolute top-3 right-3">
            <span className={`
              px-2 py-1 text-xs font-medium rounded-full
              ${trip.isPublic 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
              }
            `}>
              {trip.isPublic ? 'Public' : 'Private'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {trip.name}
          </h3>
          
          {trip.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {trip.description}
            </p>
          )}

          {/* Trip Info */}
          <div className="space-y-2 mb-4">
            {/* Destinations */}
            {trip.destinations && trip.destinations.length > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span className="line-clamp-1">
                  {trip.destinations.slice(0, 3).join(', ')}
                  {trip.destinations.length > 3 && ` +${trip.destinations.length - 3} more`}
                </span>
              </div>
            )}

            {/* Dates */}
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
              <span>
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </span>
            </div>

            {/* Budget */}
            {trip.totalBudget && (
              <div className="flex items-center text-sm text-gray-600">
                <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span>${trip.totalBudget.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Owner (for public trips) */}
          {showOwner && trip.owner && (
            <div className="flex items-center text-sm text-gray-500 border-t pt-3">
              <img 
                src={trip.owner.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'} 
                alt={trip.owner.name}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span>by {trip.owner.name}</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default TripCard;