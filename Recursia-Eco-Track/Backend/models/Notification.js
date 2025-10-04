const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Notification ID
  notificationId: {
    type: String,
    unique: true,
    uppercase: true
  },

  // Target user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Notification details
  type: {
    type: String,
    enum: [
      'pickup_created',
      'pickup_assigned', 
      'pickup_en_route',
      'pickup_arrived',
      'pickup_completed',
      'pickup_cancelled',
      'pickup_missed',
      'driver_assigned',
      'driver_location_update',
      'system_announcement',
      'promotion',
      'reminder',
      'fraud_alert'
    ],
    required: true
  },

  title: {
    type: String,
    required: true,
    maxLength: 100
  },

  message: {
    type: String,
    required: true,
    maxLength: 500
  },

  // Priority level
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },

  // Related data
  relatedPickup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pickup'
  },

  relatedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },

  // Additional data payload
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Status
  isRead: {
    type: Boolean,
    default: false
  },

  readAt: {
    type: Date
  },

  // Actions
  actionRequired: {
    type: Boolean,
    default: false
  },

  actionUrl: {
    type: String
  },

  actionText: {
    type: String
  },

  // Delivery
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  },

  deliveryStatus: {
    inApp: { 
      sent: { type: Boolean, default: true },
      sentAt: { type: Date, default: Date.now }
    },
    email: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date }
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date }
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date }
    }
  },

  // Expiry
  expiresAt: {
    type: Date
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate notification ID before saving
notificationSchema.pre('save', function(next) {
  if (!this.notificationId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.notificationId = `NOT${timestamp}${random}`.toUpperCase();
  }
  this.updatedAt = new Date();
  next();
});

// Indexes for performance
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create notification
notificationSchema.statics.createNotification = async function({
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
  actionText = null,
  channels = { inApp: true },
  expiresAt = null
}) {
  try {
    const notification = new this({
      user: userId,
      type,
      title,
      message,
      priority,
      relatedPickup,
      relatedDriver,
      metadata,
      actionRequired,
      actionUrl,
      actionText,
      channels,
      expiresAt
    });

    return await notification.save();
  } catch (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

// Instance method to get display data
notificationSchema.methods.getDisplayData = function() {
  return {
    id: this._id,
    notificationId: this.notificationId,
    type: this.type,
    title: this.title,
    message: this.message,
    priority: this.priority,
    isRead: this.isRead,
    actionRequired: this.actionRequired,
    actionUrl: this.actionUrl,
    actionText: this.actionText,
    createdAt: this.createdAt,
    metadata: this.metadata,
    relatedPickup: this.relatedPickup,
    relatedDriver: this.relatedDriver
  };
};

module.exports = mongoose.model('Notification', notificationSchema);
