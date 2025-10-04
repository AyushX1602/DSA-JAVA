import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  MoreVertical, 
  Check, 
  CheckCheck, 
  Trash2, 
  Settings,
  Circle,
  ExternalLink,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { notificationAPI } from '../../services/api';
import toast from 'react-hot-toast';

const NotificationCenter = ({ isOpen, onClose, unreadCount, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedType, setSelectedType] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load notifications
  const loadNotifications = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      
      const filters = {};
      if (filter === 'unread') filters.unreadOnly = 'true';
      if (selectedType !== 'all') filters.type = selectedType;

      const response = await notificationAPI.getUserNotifications(currentPage, 20, filters);
      
      if (response.data && response.data.data) {
        const newNotifications = response.data.data.notifications;
        
        if (reset) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        
        setHasMore(response.data.data.pagination.hasNext);
        if (reset) setPage(1);
        
        // Update unread count
        if (onUnreadCountChange) {
          onUnreadCountChange(response.data.data.unreadCount);
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page, filter, selectedType, onUnreadCountChange]);

  // Load notifications when component opens or filter changes
  useEffect(() => {
    if (isOpen) {
      loadNotifications(true);
    }
  }, [isOpen, filter, selectedType]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        )
      );
      
      if (onUnreadCountChange) {
        onUnreadCountChange(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await notificationAPI.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      );
      
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
      
      toast.success(`Marked ${response.data.data.readCount} notifications as read`);
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.isRead && onUnreadCountChange) {
        onUnreadCountChange(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type, priority) => {
    const iconProps = { className: "w-5 h-5" };
    
    switch (type) {
      case 'pickup_completed':
      case 'pickup_assigned':
        return <CheckCircle {...iconProps} className="w-5 h-5 text-green-500" />;
      case 'pickup_cancelled':
      case 'pickup_missed':
      case 'fraud_alert':
        return <AlertTriangle {...iconProps} className="w-5 h-5 text-red-500" />;
      case 'pickup_en_route':
      case 'pickup_arrived':
        return <Clock {...iconProps} className="w-5 h-5 text-blue-500" />;
      default:
        return <Info {...iconProps} className="w-5 h-5 text-gray-500" />;
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

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col">
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
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilter('all')}>
                    All notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('unread')}>
                    Unread only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('read')}>
                    Read only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogHeader>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto space-y-3 mt-4">
          <AnimatePresence>
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Priority dot */}
                  <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(notification.priority)}`}></div>
                  
                  {/* Notification icon */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
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
                          {!notification.isRead && (
                            <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notification.isRead && (
                            <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                              <Check className="w-4 h-4 mr-2" />
                              Mark as read
                            </DropdownMenuItem>
                          )}
                          {notification.actionUrl && (
                            <DropdownMenuItem asChild>
                              <a href={notification.actionUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                {notification.actionText || 'View'}
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Action button if present */}
                    {notification.actionRequired && notification.actionUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        asChild
                      >
                        <a href={notification.actionUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          {notification.actionText || 'Take Action'}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty state */}
          {filteredNotifications.length === 0 && !loading && (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No notifications</h3>
              <p className="text-gray-500">
                {filter === 'unread' ? "You're all caught up!" : "No notifications to show"}
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Load more */}
          {hasMore && !loading && filteredNotifications.length > 0 && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setPage(prev => prev + 1);
                loadNotifications(false);
              }}
            >
              Load more
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter;
