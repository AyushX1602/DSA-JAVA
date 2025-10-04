import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle,
  Info,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Badge } from './badge';

const SimpleNotificationCenter = ({ isOpen, onClose, unreadCount = 0 }) => {
  // Mock notifications for demonstration
  const [notifications] = useState([
    {
      id: 1,
      type: 'pickup_created',
      title: 'Pickup Request Created',
      message: 'Your plastic waste pickup request has been created successfully.',
      priority: 'normal',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
    {
      id: 2,
      type: 'system_announcement',
      title: 'Notification System Active',
      message: 'Your notification system is working correctly. You will receive updates about your pickup requests here.',
      priority: 'low',
      isRead: false,
      createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    }
  ]);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'pickup_created':
      case 'pickup_completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pickup_cancelled':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'pickup_en_route':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  // Format time ago
  const timeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[500px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto space-y-3 mt-4">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                !notification.isRead ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Priority dot */}
                <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(notification.priority)}`}></div>
                
                {/* Notification icon */}
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {timeAgo(notification.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Info message */}
          <div className="text-center py-4 border-t">
            <div className="bg-blue-50 rounded-lg p-4">
              <Info className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-blue-800 mb-1">
                Notification System Ready
              </h3>
              <p className="text-xs text-blue-600">
                You'll receive real-time notifications here when your pickup requests are processed.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleNotificationCenter;
