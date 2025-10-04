const { validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');
const { emitToUser } = require('../services/socketService');

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private (User)
const getUserNotifications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      unreadOnly = false,
      type = null,
      priority = null 
    } = req.query;

    // Build query
    const query = { user: req.user.id };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (priority) {
      query.priority = priority;
    }

    // Get notifications
    const notifications = await Notification.find(query)
      .populate('relatedPickup', 'pickupId status')
      .populate('relatedDriver', 'driverId user')
      .populate({
        path: 'relatedDriver',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id, 
      isRead: false 
    });

    res.json({
      success: true,
      data: {
        notifications: notifications.map(n => n.getDisplayData()),
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
          totalItems: total
        },
        unreadCount
      }
    });

  } catch (error) {
    logger.error('Error fetching user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/users/notifications/:id/read
// @access  Private (User)
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    // Emit socket event for real-time update
    emitToUser(req.user.id, 'notificationRead', {
      notificationId: notification._id,
      readAt: notification.readAt
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notification: notification.getDisplayData()
      }
    });

  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/users/notifications/read-all
// @access  Private (User)
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { 
        isRead: true, 
        readAt: new Date(),
        updatedAt: new Date() 
      }
    );

    // Emit socket event for real-time update
    emitToUser(req.user.id, 'allNotificationsRead', {
      readCount: result.modifiedCount,
      readAt: new Date()
    });

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      data: {
        readCount: result.modifiedCount
      }
    });

  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/users/notifications/:id
// @access  Private (User)
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Emit socket event for real-time update
    emitToUser(req.user.id, 'notificationDeleted', {
      notificationId: notification._id
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

// @desc    Delete all read notifications
// @route   DELETE /api/users/notifications/cleanup
// @access  Private (User)
const deleteReadNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      user: req.user.id,
      isRead: true
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} read notifications`,
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    logger.error('Error deleting read notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete read notifications'
    });
  }
};

// @desc    Get notification settings
// @route   GET /api/users/notifications/settings
// @access  Private (User)
const getNotificationSettings = async (req, res) => {
  try {
    // For now, return default settings
    // This can be extended to store user preferences in User model
    const settings = {
      channels: {
        inApp: true,
        email: req.user.email ? true : false,
        sms: req.user.phone ? false : false,
        push: false
      },
      types: {
        pickup_updates: true,
        driver_updates: true,
        system_announcements: true,
        promotions: false,
        reminders: true
      },
      schedule: {
        enabled: false,
        startTime: '09:00',
        endTime: '18:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }
    };

    res.json({
      success: true,
      data: { settings }
    });

  } catch (error) {
    logger.error('Error fetching notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification settings'
    });
  }
};

// Helper function to create and send notification
const createNotification = async ({
  userId,
  type,
  title,
  message,
  priority = 'normal',
  relatedPickup = null,
  relatedDriver = null,
  metadata = {},
  actionRequired = false,
  actionUrl = null,
  actionText = null
}) => {
  try {
    const notification = await Notification.createNotification({
      userId,
      type,
      title,
      message,
      priority,
      relatedPickup,
      relatedDriver,
      metadata,
      actionRequired,
      actionUrl,
      actionText
    });

    // Emit real-time notification
    emitToUser(userId, 'newNotification', {
      notification: notification.getDisplayData()
    });

    return notification;

  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

// Export helper function for use in other controllers
module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
  getNotificationSettings,
  createNotification
};
