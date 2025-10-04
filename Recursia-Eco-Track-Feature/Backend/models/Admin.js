const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  // Personal Information
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
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[(]?[\d\s\-\(\)]{10,}$/, 'Please provide a valid phone number']
  },
  
  // Admin Identification
  adminId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Role & Permissions
  role: {
    type: String,
    enum: ['super-admin', 'admin', 'manager', 'supervisor', 'operator'],
    default: 'admin'
  },
  department: {
    type: String,
    enum: ['operations', 'customer-service', 'analytics', 'finance', 'hr', 'it', 'management'],
    required: true
  },
  
  // Granular Permissions
  permissions: {
    // User Management
    users: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      suspend: { type: Boolean, default: false }
    },
    
    // Driver Management
    drivers: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      assign: { type: Boolean, default: true },
      track: { type: Boolean, default: true }
    },
    
    // Pickup Management
    pickups: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: true },
      edit: { type: Boolean, default: true },
      cancel: { type: Boolean, default: true },
      reassign: { type: Boolean, default: true },
      pricing: { type: Boolean, default: false }
    },
    
    // Analytics & Reports
    analytics: {
      view: { type: Boolean, default: true },
      export: { type: Boolean, default: false },
      advanced: { type: Boolean, default: false }
    },
    
    // System Administration
    system: {
      settings: { type: Boolean, default: false },
      users: { type: Boolean, default: false },
      backup: { type: Boolean, default: false },
      logs: { type: Boolean, default: false },
      maintenance: { type: Boolean, default: false }
    },
    
    // Financial
    finance: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      reports: { type: Boolean, default: false },
      refunds: { type: Boolean, default: false }
    },
    
    // Emergency Controls
    emergency: {
      alerts: { type: Boolean, default: true },
      broadcast: { type: Boolean, default: false },
      shutdown: { type: Boolean, default: false }
    }
  },
  
  // Access Control
  accessLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  territories: [{
    type: String, // City, region, or zone codes
    description: String
  }],
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' },
    timezone: { type: String, default: 'UTC' }
  },
  
  // Profile Information
  profile: {
    avatar: String,
    title: String, // Job title
    bio: String,
    dateOfBirth: Date,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'USA' }
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    }
  },
  
  // Activity Tracking
  activity: {
    lastLogin: Date,
    lastAction: Date,
    totalLogins: { type: Number, default: 0 },
    sessionsToday: { type: Number, default: 0 },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    ipAddresses: [String],
    userAgents: [String]
  },
  
  // Performance Metrics
  performance: {
    ticketsResolved: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 }, // in minutes
    customerSatisfaction: { type: Number, default: 0 }, // 1-5 rating
    tasksCompleted: { type: Number, default: 0 },
    
    // Monthly statistics
    thisMonth: {
      logins: { type: Number, default: 0 },
      actionsPerformed: { type: Number, default: 0 },
      pickupsManaged: { type: Number, default: 0 },
      issuesResolved: { type: Number, default: 0 }
    }
  },
  
  // Notifications & Preferences
  notifications: {
    email: {
      enabled: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ['immediate', 'hourly', 'daily', 'weekly'],
        default: 'immediate'
      },
      types: {
        emergency: { type: Boolean, default: true },
        pickupAlerts: { type: Boolean, default: true },
        systemUpdates: { type: Boolean, default: true },
        reports: { type: Boolean, default: false }
      }
    },
    sms: {
      enabled: { type: Boolean, default: false },
      emergency: { type: Boolean, default: true }
    },
    push: {
      enabled: { type: Boolean, default: true },
      types: {
        emergency: { type: Boolean, default: true },
        assignments: { type: Boolean, default: true },
        updates: { type: Boolean, default: false }
      }
    }
  },
  
  // Dashboard Preferences
  dashboard: {
    layout: {
      type: String,
      enum: ['default', 'compact', 'detailed'],
      default: 'default'
    },
    defaultView: {
      type: String,
      enum: ['overview', 'pickups', 'drivers', 'analytics'],
      default: 'overview'
    },
    widgets: [{
      type: String,
      position: Number,
      size: String,
      visible: { type: Boolean, default: true }
    }],
    autoRefresh: {
      enabled: { type: Boolean, default: true },
      interval: { type: Number, default: 30 } // seconds
    }
  },
  
  // Security & Compliance
  security: {
    twoFactorAuth: {
      enabled: { type: Boolean, default: false },
      method: {
        type: String,
        enum: ['sms', 'email', 'authenticator'],
        default: 'sms'
      },
      secret: String,
      backupCodes: [String]
    },
    passwordHistory: [String], // Hashed previous passwords
    lastPasswordChange: Date,
    mustChangePassword: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 480 }, // minutes
    allowedIPs: [String], // IP whitelist if needed
    
    // Compliance tracking
    compliance: {
      trainingCompleted: Date,
      certifications: [{
        name: String,
        issuer: String,
        issuedDate: Date,
        expiryDate: Date,
        verified: { type: Boolean, default: false }
      }],
      backgroundCheck: {
        completed: { type: Boolean, default: false },
        completedDate: Date,
        level: String
      }
    }
  },
  
  // Audit Trail
  auditLog: [{
    action: String,
    details: Object,
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    result: {
      type: String,
      enum: ['success', 'failure', 'warning']
    }
  }],
  
  // Account Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  
  // Employment Information
  employment: {
    startDate: Date,
    endDate: Date,
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    salary: {
      amount: Number,
      currency: { type: String, default: 'USD' },
      frequency: {
        type: String,
        enum: ['hourly', 'monthly', 'annually'],
        default: 'annually'
      }
    },
    workLocation: String,
    workType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'temporary'],
      default: 'full-time'
    }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
adminSchema.index({ role: 1, status: 1 });
adminSchema.index({ department: 1 });
adminSchema.index({ 'activity.lastLogin': -1 });

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual to check if account is locked
adminSchema.virtual('isLocked').get(function() {
  return !!(this.activity.lockUntil && this.activity.lockUntil > Date.now());
});

// Virtual to check if password needs changing
adminSchema.virtual('passwordExpired').get(function() {
  if (!this.security.lastPasswordChange) return true;
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  return this.security.lastPasswordChange < ninetyDaysAgo;
});

// Auto-generate admin ID before saving
adminSchema.pre('save', function(next) {
  if (!this.adminId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 3);
    this.adminId = `ADM${timestamp}${random}`.toUpperCase();
  }
  next();
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Store old password in history
    if (this.password && this.isModified('password') && !this.isNew) {
      this.security.passwordHistory.push(this.password);
      // Keep only last 5 passwords
      if (this.security.passwordHistory.length > 5) {
        this.security.passwordHistory = this.security.passwordHistory.slice(-5);
      }
    }
    
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.security.lastPasswordChange = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Instance Methods

// Compare password
adminSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update last login
adminSchema.methods.updateLastLogin = function(ipAddress, userAgent) {
  this.activity.lastLogin = new Date();
  this.activity.totalLogins += 1;
  this.activity.sessionsToday += 1;
  
  // Track IP addresses (keep last 10)
  if (ipAddress && !this.activity.ipAddresses.includes(ipAddress)) {
    this.activity.ipAddresses.push(ipAddress);
    if (this.activity.ipAddresses.length > 10) {
      this.activity.ipAddresses.shift();
    }
  }
  
  // Track user agents (keep last 5)
  if (userAgent && !this.activity.userAgents.includes(userAgent)) {
    this.activity.userAgents.push(userAgent);
    if (this.activity.userAgents.length > 5) {
      this.activity.userAgents.shift();
    }
  }
  
  return this.save();
};

// Log admin action for audit trail
adminSchema.methods.logAction = function(action, details, result = 'success', ipAddress, userAgent) {
  this.auditLog.push({
    action,
    details,
    result,
    ipAddress,
    userAgent,
    timestamp: new Date()
  });
  
  this.activity.lastAction = new Date();
  
  // Keep only last 1000 audit entries
  if (this.auditLog.length > 1000) {
    this.auditLog = this.auditLog.slice(-1000);
  }
  
  return this.save();
};

// Check specific permission
adminSchema.methods.hasPermission = function(category, action) {
  if (this.role === 'super-admin') return true;
  
  try {
    return this.permissions[category][action] === true;
  } catch (error) {
    return false;
  }
};

// Check access level
adminSchema.methods.hasAccessLevel = function(requiredLevel) {
  return this.accessLevel >= requiredLevel;
};

// Handle failed login attempts
adminSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.activity.lockUntil && this.activity.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'activity.lockUntil': 1 },
      $set: { 'activity.loginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'activity.loginAttempts': 1 } };
  
  // Lock account after 5 failed attempts for 1 hour
  if (this.activity.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { 'activity.lockUntil': Date.now() + 60 * 60 * 1000 }; // 1 hour
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { 'activity.loginAttempts': 1, 'activity.lockUntil': 1 }
  });
};

// Get admin activity summary
adminSchema.methods.getActivitySummary = function() {
  return {
    totalLogins: this.activity.totalLogins,
    lastLogin: this.activity.lastLogin,
    sessionsToday: this.activity.sessionsToday,
    pickupsManaged: this.performance.thisMonth.pickupsManaged,
    issuesResolved: this.performance.thisMonth.issuesResolved,
    averageResponseTime: this.performance.averageResponseTime,
    accountAge: Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)) // days
  };
};

// Static Methods

// Find admins by role and department
adminSchema.statics.findByRole = function(role, department = null) {
  const query = { role, status: 'active' };
  if (department) query.department = department;
  return this.find(query).select('-password -security.passwordHistory');
};

// Find available admins for emergency response
adminSchema.statics.findAvailableForEmergency = function() {
  return this.find({
    status: 'active',
    'permissions.emergency.alerts': true,
    'notifications.push.enabled': true,
    'notifications.push.types.emergency': true
  }).select('name email phone adminId role');
};

// Reset daily session counts (run daily via cron job)
adminSchema.statics.resetDailySessions = function() {
  return this.updateMany({}, { $set: { 'activity.sessionsToday': 0 } });
};

module.exports = mongoose.model('Admin', adminSchema);