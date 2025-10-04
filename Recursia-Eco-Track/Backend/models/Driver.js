const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema({
  // Personal Information (inherits from User but specialized for drivers)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driverId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  // Vehicle Information
  vehicle: {
    type: {
      type: String,
      enum: ['truck', 'van', 'motorcycle', 'bicycle', 'electric-vehicle'],
      required: true
    },
    licensePlate: {
      type: String,
      required: true,
      uppercase: true
    },
    model: String,
    year: Number,
    capacity: {
      weight: { type: Number, required: true }, // in kg
      volume: { type: Number, required: true }  // in cubic meters
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'],
      default: 'diesel'
    },
    registrationExpiry: Date,
    insuranceExpiry: Date,
    lastMaintenance: Date
  },

  // Driver Status & Availability
  status: {
    type: String,
    enum: ['online', 'offline', 'busy', 'break', 'emergency'],
    default: 'offline'
  },
  
  // Real-time Location & Movement
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: String,
    heading: { type: Number, default: 0 }, // Direction in degrees (0-360)
    speed: { type: Number, default: 0 },   // Speed in km/h
    accuracy: { type: Number, default: 0 }, // GPS accuracy in meters
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },

  // Work Schedule & Availability
  workSchedule: {
    monday: { start: String, end: String, available: { type: Boolean, default: true } },
    tuesday: { start: String, end: String, available: { type: Boolean, default: true } },
    wednesday: { start: String, end: String, available: { type: Boolean, default: true } },
    thursday: { start: String, end: String, available: { type: Boolean, default: true } },
    friday: { start: String, end: String, available: { type: Boolean, default: true } },
    saturday: { start: String, end: String, available: { type: Boolean, default: false } },
    sunday: { start: String, end: String, available: { type: Boolean, default: false } }
  },

  // Current Assignment & Route
  currentAssignments: [{
    pickup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pickup'
    },
    assignedAt: { type: Date, default: Date.now },
    estimatedCompletion: Date,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    }
  }],

  // Performance & Statistics
  performance: {
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    totalRatings: { type: Number, default: 0 },
    totalPickups: { type: Number, default: 0 },
    completedPickups: { type: Number, default: 0 },
    cancelledPickups: { type: Number, default: 0 },
    averageCompletionTime: { type: Number, default: 0 }, // in minutes
    totalDistanceCovered: { type: Number, default: 0 }, // in km
    fuelEfficiency: { type: Number, default: 0 }, // km per liter
    onTimePercentage: { type: Number, default: 100 },
    
    // Daily/Weekly/Monthly stats
    today: {
      pickups: { type: Number, default: 0 },
      distance: { type: Number, default: 0 },
      workingHours: { type: Number, default: 0 },
      earnings: { type: Number, default: 0 }
    },
    thisWeek: {
      pickups: { type: Number, default: 0 },
      distance: { type: Number, default: 0 },
      workingHours: { type: Number, default: 0 },
      earnings: { type: Number, default: 0 }
    },
    thisMonth: {
      pickups: { type: Number, default: 0 },
      distance: { type: Number, default: 0 },
      workingHours: { type: Number, default: 0 },
      earnings: { type: Number, default: 0 }
    }
  },

  // License & Certifications
  licensing: {
    driverLicense: {
      number: String,
      class: String,
      expiryDate: Date,
      verified: { type: Boolean, default: false }
    },
    wastHandlingCertificate: {
      number: String,
      expiryDate: Date,
      verified: { type: Boolean, default: false }
    },
    backgroundCheck: {
      completed: { type: Boolean, default: false },
      completedDate: Date,
      status: {
        type: String,
        enum: ['pending', 'passed', 'failed'],
        default: 'pending'
      }
    }
  },

  // Emergency & Communication
  emergency: {
    contactName: String,
    contactPhone: String,
    contactRelation: String,
    medicalInfo: String,
    allergies: [String]
  },

  // Route History & Tracking
  routeHistory: [{
    date: { type: Date, default: Date.now },
    startLocation: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    },
    endLocation: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    },
    totalDistance: Number,
    totalTime: Number,
    pickupsCompleted: Number,
    fuelConsumed: Number
  }],

  // Notifications & Preferences
  preferences: {
    notifications: {
      newAssignment: { type: Boolean, default: true },
      routeUpdates: { type: Boolean, default: true },
      emergencyAlerts: { type: Boolean, default: true },
      performanceReports: { type: Boolean, default: true }
    },
    workingRadius: { type: Number, default: 50 }, // km from base location
    maxPickupsPerDay: { type: Number, default: 20 },
    preferredWasteTypes: [{
      type: String,
      enum: ['organic', 'plastic', 'paper', 'electronic', 'hazardous', 'general']
    }]
  },

  // Account Status
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  suspensionReason: String,
  suspensionExpiry: Date,
  
  // Timestamps
  lastActiveAt: { type: Date, default: Date.now },
  shiftStartTime: Date,
  shiftEndTime: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
driverSchema.index({ 'currentLocation': '2dsphere' });
driverSchema.index({ status: 1 });
driverSchema.index({ 'user': 1 });
driverSchema.index({ 'performance.rating': -1 });
driverSchema.index({ lastActiveAt: -1 });

// Virtual for current availability
driverSchema.virtual('isAvailable').get(function() {
  return this.status === 'online' && this.currentAssignments.length < this.preferences.maxPickupsPerDay;
});

// Virtual for current workload
driverSchema.virtual('currentWorkload').get(function() {
  return {
    activePickups: this.currentAssignments.length,
    maxCapacity: this.preferences.maxPickupsPerDay,
    loadPercentage: (this.currentAssignments.length / this.preferences.maxPickupsPerDay * 100).toFixed(1)
  };
});

// Update location and tracking data
driverSchema.methods.updateLocation = function(locationData) {
  const { latitude, longitude, heading, speed, accuracy } = locationData;
  
  this.currentLocation.coordinates = [longitude, latitude];
  this.currentLocation.heading = heading || 0;
  this.currentLocation.speed = speed || 0;
  this.currentLocation.accuracy = accuracy || 0;
  this.currentLocation.lastUpdated = new Date();
  this.lastActiveAt = new Date();
  
  return this.save();
};

// Assign pickup to driver
driverSchema.methods.assignPickup = function(pickupId, priority = 'normal') {
  // Check if already assigned
  const existingAssignment = this.currentAssignments.find(
    assignment => assignment.pickup.toString() === pickupId.toString()
  );
  
  if (existingAssignment) {
    throw new Error('Pickup already assigned to this driver');
  }
  
  // Check capacity
  if (this.currentAssignments.length >= this.preferences.maxPickupsPerDay) {
    throw new Error('Driver has reached maximum pickup capacity');
  }
  
  this.currentAssignments.push({
    pickup: pickupId,
    assignedAt: new Date(),
    priority
  });
  
  // Update status to busy if this is the first assignment
  if (this.currentAssignments.length === 1 && this.status === 'online') {
    this.status = 'busy';
  }
  
  return this.save();
};

// Complete pickup assignment
driverSchema.methods.completePickup = function(pickupId) {
  this.currentAssignments = this.currentAssignments.filter(
    assignment => assignment.pickup.toString() !== pickupId.toString()
  );
  
  // Update performance stats
  this.performance.completedPickups += 1;
  this.performance.totalPickups += 1;
  this.performance.today.pickups += 1;
  
  // Update status back to online if no more assignments
  if (this.currentAssignments.length === 0 && this.status === 'busy') {
    this.status = 'online';
  }
  
  return this.save();
};

// Update driver rating
driverSchema.methods.updateRating = function(newRating) {
  const totalPoints = (this.performance.rating * this.performance.totalRatings) + newRating;
  this.performance.totalRatings += 1;
  this.performance.rating = totalPoints / this.performance.totalRatings;
  
  return this.save();
};

// Check if driver is within working hours
driverSchema.methods.isWithinWorkingHours = function() {
  const now = new Date();
  const currentDay = now.toLocaleLowerCase(); // monday, tuesday, etc.
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todaySchedule = this.workSchedule[currentDay];
  
  if (!todaySchedule || !todaySchedule.available) {
    return false;
  }
  
  return currentTime >= todaySchedule.start && currentTime <= todaySchedule.end;
};

// Get nearby drivers within specified radius
driverSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000, status = 'online') {
  return this.find({
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    status: status,
    isActive: true
  }).populate('user', 'name phone email');
};

// Find available drivers for assignment
driverSchema.statics.findAvailableDrivers = function(longitude, latitude, wasteType) {
  return this.find({
    status: 'online',
    isActive: true,
    isVerified: true,
    $expr: { $lt: [{ $size: '$currentAssignments' }, '$preferences.maxPickupsPerDay'] },
    'preferences.preferredWasteTypes': { $in: [wasteType] },
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: 50000 // 50km radius
      }
    }
  }).populate('user', 'name phone email').sort({ 'performance.rating': -1 });
};

// Reset daily statistics (run daily via cron job)
driverSchema.statics.resetDailyStats = function() {
  return this.updateMany({}, {
    $set: {
      'performance.today.pickups': 0,
      'performance.today.distance': 0,
      'performance.today.workingHours': 0,
      'performance.today.earnings': 0
    }
  });
};

module.exports = mongoose.model('Driver', driverSchema);