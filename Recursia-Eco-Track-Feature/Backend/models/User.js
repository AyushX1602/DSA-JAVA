const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[(]?[\d\s\-\(\)]{10,}$/, 'Please provide a valid phone number']
  },
  role: {
    type: String,
    enum: ['user', 'driver', 'admin'],
    default: 'user'
  },
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
    address: {
      type: String,
      default: ''
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  profile: {
    avatar: {
      type: String,
      default: ''
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true }
      },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' }
    }
  },
  pickupRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pickup'
  }],
  statistics: {
    totalPickups: { type: Number, default: 0 },
    completedPickups: { type: Number, default: 0 },
    cancelledPickups: { type: Number, default: 0 },
    totalWasteCollected: { type: Number, default: 0 }, // in kg
    carbonFootprintSaved: { type: Number, default: 0 }, // in kg CO2
    lastPickupDate: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  verificationTokens: {
    email: String,
    phone: String,
    passwordReset: String,
    passwordResetExpires: Date
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create geospatial index for location-based queries
userSchema.index({ 'currentLocation': '2dsphere' });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1, status: 1 });

// Virtual for full name formatting
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual to check if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update location timestamp when coordinates change
userSchema.pre('save', function(next) {
  if (this.isModified('currentLocation.coordinates')) {
    this.currentLocation.lastUpdated = new Date();
  }
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update user statistics
userSchema.methods.updatePickupStats = function(pickupData) {
  this.statistics.totalPickups += 1;
  
  if (pickupData.status === 'completed') {
    this.statistics.completedPickups += 1;
    this.statistics.lastPickupDate = new Date();
    
    if (pickupData.wasteWeight) {
      this.statistics.totalWasteCollected += pickupData.wasteWeight;
      // Estimate carbon footprint saved (rough calculation)
      this.statistics.carbonFootprintSaved += pickupData.wasteWeight * 0.5;
    }
  } else if (pickupData.status === 'cancelled') {
    this.statistics.cancelledPickups += 1;
  }
  
  return this.save();
};

// Handle login attempts and account locking
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Update last login timestamp
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Get nearby users within specified radius (in meters)
userSchema.statics.findNearby = function(longitude, latitude, maxDistance = 5000) {
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
    status: 'active'
  });
};

// Get user activity summary
userSchema.methods.getActivitySummary = function() {
  return {
    totalPickups: this.statistics.totalPickups,
    completedPickups: this.statistics.completedPickups,
    completionRate: this.statistics.totalPickups > 0 
      ? (this.statistics.completedPickups / this.statistics.totalPickups * 100).toFixed(1)
      : 0,
    totalWasteCollected: this.statistics.totalWasteCollected,
    carbonFootprintSaved: this.statistics.carbonFootprintSaved,
    lastPickupDate: this.statistics.lastPickupDate,
    memberSince: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);