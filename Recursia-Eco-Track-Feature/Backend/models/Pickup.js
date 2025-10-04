const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  pickupId: {
    type: String,
    required: false,
    unique: true,
    uppercase: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  status: {
    type: String,
    enum: ['requested', 'assigned', 'en-route', 'arrived', 'in-progress', 'completed', 'cancelled', 'missed'],
    default: 'requested'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true
    },
    landmark: String,
    instructions: String,
    floor: String,
    building: String
  },
  wasteDetails: {
    type: {
      type: String,
      enum: ['organic', 'paper', 'plastic', 'e-waste', 'metal', 'general'],
      required: true
    },
    subType: String,
    estimatedWeight: { type: Number, default: 0 },
    actualWeight: { type: Number, default: 0 },
    estimatedVolume: { type: Number, default: 0 },
    actualVolume: { type: Number, default: 0 },
    description: String,
    images: [String],
    specialHandling: {
      required: { type: Boolean, default: false },
      instructions: String,
      equipment: [String]
    }
  },
  scheduling: {
    requestedAt: {
      type: Date,
      default: Date.now
    },
    preferredDate: Date,
    preferredTimeSlot: {
      start: { type: String, default: null },
      end: { type: String, default: null }
    },
    assignedAt: Date,
    driverArrivedAt: Date,
    pickupStartedAt: Date,
    completedAt: Date,
    estimatedDuration: { type: Number, default: 30 }, // in minutes
    actualDuration: Number // calculated from pickupStartedAt to completedAt
  },
  
  // ETA & Route Information
  eta: {
    estimatedArrival: Date,
    durationMinutes: Number,
    durationSeconds: Number,
    distanceMeters: Number,
    lastUpdated: Date,
    confidence: { type: Number, default: 0.95 }, // AI confidence level
    method: {
      type: String,
      enum: ['mapbox_directions', 'google_maps', 'manual_estimate'],
      default: 'mapbox_directions'
    }
  },
  
  // Route & Navigation
  route: {
    geometry: {
      type: Object, // GeoJSON geometry
      default: null
    },
    distance: Number, // total distance in meters
    duration: Number, // total duration in seconds
    steps: [Object], // Turn-by-turn directions
    lastCalculated: Date
  },
  
  // Payment & Billing
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'digital_wallet', 'subscription', 'free'],
      default: 'cash'
    },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  
  // Quality & Rating
  feedback: {
    userRating: { type: Number, min: 1, max: 5 },
    driverRating: { type: Number, min: 1, max: 5 },
    userComments: String,
    driverComments: String,
    serviceQuality: {
      punctuality: { type: Number, min: 1, max: 5 },
      professionalism: { type: Number, min: 1, max: 5 },
      wasteHandling: { type: Number, min: 1, max: 5 }
    },
    images: [String], // Post-pickup verification images
    ratedAt: Date
  },
  
  // AI & Analytics
  aiAnalysis: {
    wasteClassification: {
      predicted: String,
      confidence: Number,
      alternatives: [{ type: String, confidence: Number }]
    },
    fraudDetection: {
      score: { type: Number, default: 0 },
      flags: [String],
      verified: { type: Boolean, default: true }
    },
    optimizationSuggestions: [String],
    carbonFootprint: {
      saved: Number, // kg CO2 equivalent
      calculation: String
    }
  },
  
  // Communication & Updates
  communications: [{
    type: {
      type: String,
      enum: ['sms', 'email', 'push', 'call', 'chat']
    },
    message: String,
    sentAt: { type: Date, default: Date.now },
    sentBy: {
      type: String,
      enum: ['user', 'driver', 'admin', 'system']
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    }
  }],
  
  // Status History & Tracking
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: {
      type: String,
      enum: ['user', 'driver', 'admin', 'system']
    },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    },
    notes: String
  }],
  
  // Special Circumstances
  specialCircumstances: {
    isEmergency: { type: Boolean, default: false },
    isRecurring: { type: Boolean, default: false },
    recurringPattern: String, // e.g., "weekly", "bi-weekly", "monthly"
    parentPickup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pickup'
    },
    weatherImpact: {
      affected: { type: Boolean, default: false },
      condition: String,
      delay: Number // minutes
    }
  },
  
  // Administrative
  notes: {
    user: String,
    driver: String,
    admin: String,
    system: [String]
  },
  tags: [String], // For categorization and filtering
  internalId: String, // For integration with legacy systems
  
  // Cancellation Information
  cancellation: {
    reason: String,
    cancelledBy: {
      type: String,
      enum: ['user', 'driver', 'admin', 'system']
    },
    cancelledAt: Date,
    refundIssued: { type: Boolean, default: false },
    refundAmount: Number
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
pickupSchema.index({ 'pickupLocation': '2dsphere' });
pickupSchema.index({ user: 1, status: 1 });
pickupSchema.index({ driver: 1, status: 1 });
pickupSchema.index({ status: 1, 'scheduling.requestedAt': -1 });
pickupSchema.index({ 'scheduling.preferredDate': 1, status: 1 });
pickupSchema.index({ 'wasteDetails.type': 1 });
pickupSchema.index({ priority: 1, status: 1 });
pickupSchema.index({ createdAt: -1 });

// Virtual for pickup age in hours
pickupSchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.scheduling.requestedAt) / (1000 * 60 * 60));
});

// Virtual for estimated completion time
pickupSchema.virtual('estimatedCompletion').get(function() {
  if (this.eta.estimatedArrival && this.scheduling.estimatedDuration) {
    return new Date(this.eta.estimatedArrival.getTime() + (this.scheduling.estimatedDuration * 60 * 1000));
  }
  return null;
});

// Virtual for current delay status
pickupSchema.virtual('isDelayed').get(function() {
  if (this.status === 'completed' || !this.eta.estimatedArrival) return false;
  return Date.now() > this.eta.estimatedArrival.getTime();
});

// Auto-generate pickup ID before saving
pickupSchema.pre('save', function(next) {
  if (!this.pickupId || this.pickupId === '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.pickupId = `PU${timestamp}${random}`.toUpperCase();
  }
  next();
});

// Update status history when status changes
pickupSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: 'system' // This should be set by the calling function
    });
  }
  next();
});

// Update timing fields based on status changes
pickupSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.isModified('status')) {
    switch (this.status) {
      case 'assigned':
        if (!this.scheduling.assignedAt) this.scheduling.assignedAt = now;
        break;
      case 'arrived':
        if (!this.scheduling.driverArrivedAt) this.scheduling.driverArrivedAt = now;
        break;
      case 'in-progress':
        if (!this.scheduling.pickupStartedAt) this.scheduling.pickupStartedAt = now;
        break;
      case 'completed':
        if (!this.scheduling.completedAt) {
          this.scheduling.completedAt = now;
          // Calculate actual duration
          if (this.scheduling.pickupStartedAt) {
            this.scheduling.actualDuration = Math.floor(
              (now - this.scheduling.pickupStartedAt) / (1000 * 60)
            );
          }
        }
        break;
    }
  }
  next();
});

// Instance methods

// Update pickup status with validation
pickupSchema.methods.updateStatus = function(newStatus, updatedBy = 'system', notes = '') {
  const validTransitions = {
    'requested': ['assigned', 'cancelled'],
    'assigned': ['en-route', 'cancelled'],
    'en-route': ['arrived', 'cancelled'],
    'arrived': ['in-progress', 'missed'],
    'in-progress': ['completed', 'cancelled'],
    'completed': [], // Terminal state
    'cancelled': [], // Terminal state
    'missed': ['assigned', 'cancelled']
  };
  
  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy,
    notes
  });
  
  return this.save();
};

// Update ETA information
pickupSchema.methods.updateETA = function(etaData) {
  this.eta = {
    ...this.eta,
    ...etaData,
    lastUpdated: new Date()
  };
  return this.save();
};

// Add communication record
pickupSchema.methods.addCommunication = function(type, message, sentBy = 'system') {
  this.communications.push({
    type,
    message,
    sentBy,
    sentAt: new Date()
  });
  return this.save();
};

// Calculate service metrics
pickupSchema.methods.getServiceMetrics = function() {
  const requestedAt = this.scheduling.requestedAt;
  const completedAt = this.scheduling.completedAt;
  
  if (!completedAt) return null;
  
  const totalServiceTime = Math.floor((completedAt - requestedAt) / (1000 * 60)); // minutes
  const onTime = this.eta.estimatedArrival ? completedAt <= this.eta.estimatedArrival : true;
  
  return {
    totalServiceTime,
    actualDuration: this.scheduling.actualDuration,
    onTime,
    delayMinutes: this.eta.estimatedArrival && !onTime 
      ? Math.floor((completedAt - this.eta.estimatedArrival) / (1000 * 60)) 
      : 0
  };
};

// Static methods

// Find pickups by location radius
pickupSchema.statics.findByLocation = function(longitude, latitude, radiusMeters = 5000, status = null) {
  const query = {
    pickupLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusMeters
      }
    }
  };
  
  if (status) query.status = status;
  
  return this.find(query).populate('user', 'name phone').populate('driver', 'driverId user');
};

// Get pickup analytics for date range
pickupSchema.statics.getAnalytics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        'scheduling.requestedAt': {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalPickups: { $sum: 1 },
        completedPickups: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelledPickups: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        avgServiceTime: { $avg: '$scheduling.actualDuration' },
        totalWasteCollected: { $sum: '$wasteDetails.actualWeight' },
        wasteTypes: { $push: '$wasteDetails.type' }
      }
    }
  ]);
};

// Find overdue pickups
pickupSchema.statics.findOverdue = function() {
  return this.find({
    status: { $in: ['requested', 'assigned', 'en-route'] },
    'eta.estimatedArrival': { $lt: new Date() }
  }).populate('user driver');
};

module.exports = mongoose.model('Pickup', pickupSchema);