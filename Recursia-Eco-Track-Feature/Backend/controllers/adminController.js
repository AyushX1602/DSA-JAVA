const User = require('../models/User');
const Driver = require('../models/Driver');
const Pickup = require('../models/Pickup');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for admin user
    const admin = await Admin.findOne({ email }).populate('user');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if admin account is active
    if (!admin.permissions.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const payload = {
      user: {
        id: admin.user._id,
        role: 'admin',
        adminId: admin.adminId,
        permissions: admin.permissions.modules
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '24h'
    });

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          adminId: admin.adminId,
          user: {
            name: admin.user.name,
            email: admin.user.email
          },
          role: admin.role,
          permissions: admin.permissions
        }
      }
    });

  } catch (error) {
    logger.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// @desc    Get admin dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboard = async (req, res) => {
  try {
    // Get current date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - 7);
    const thisMonth = new Date(today);
    thisMonth.setMonth(today.getMonth() - 1);

    // Parallel data fetching
    const [
      totalUsers,
      totalDrivers,
      activeDrivers,
      todayPickups,
      weekPickups,
      monthPickups,
      pendingPickups,
      completedPickups,
      wasteStats
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Driver.countDocuments(),
      Driver.countDocuments({ 'availability.isAvailable': true }),
      Pickup.countDocuments({ 'scheduling.requestedAt': { $gte: today } }),
      Pickup.countDocuments({ 'scheduling.requestedAt': { $gte: thisWeek } }),
      Pickup.countDocuments({ 'scheduling.requestedAt': { $gte: thisMonth } }),
      Pickup.countDocuments({ status: 'pending' }),
      Pickup.countDocuments({ status: 'completed' }),
      Pickup.aggregate([
        {
          $group: {
            _id: '$wasteDetails.type',
            count: { $sum: 1 },
            totalWeight: { $sum: '$wasteDetails.estimatedWeight' }
          }
        }
      ])
    ]);

    // Recent activity
    const recentPickups = await Pickup.find()
      .populate('user', 'name')
      .populate('driver', 'driverId user', null, { populate: { path: 'user', select: 'name' } })
      .sort({ 'scheduling.requestedAt': -1 })
      .limit(10)
      .select('pickupId status wasteDetails.type scheduling.requestedAt user driver');

    // System performance metrics
    const performanceMetrics = {
      averageResponseTime: '4.2 minutes', // This would be calculated from actual data
      completionRate: completedPickups / (completedPickups + pendingPickups) * 100,
      driverUtilization: activeDrivers / totalDrivers * 100,
      systemUptime: '99.8%' // This would come from monitoring service
    };

    // Waste collection analytics
    const wasteAnalytics = wasteStats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        weight: stat.totalWeight || 0
      };
      return acc;
    }, {});

    const dashboardData = {
      overview: {
        totalUsers,
        totalDrivers,
        activeDrivers,
        todayPickups,
        weekPickups,
        monthPickups,
        pendingPickups,
        completedPickups
      },
      performanceMetrics,
      wasteAnalytics,
      recentActivity: recentPickups
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    logger.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Get pickup statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const pickupStats = await Pickup.aggregate([
          { $match: { user: user._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        const stats = pickupStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {});

        return {
          ...user.toObject(),
          pickupStats: stats
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// @desc    Get all drivers with details
// @route   GET /api/admin/drivers
// @access  Private (Admin)
const getDrivers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, availability, sortBy = 'createdAt' } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (availability === 'available') {
      query['availability.isAvailable'] = true;
    } else if (availability === 'unavailable') {
      query['availability.isAvailable'] = false;
    }

    const drivers = await Driver.find(query)
      .populate('user', 'name email phone status createdAt')
      .sort({ [sortBy]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Driver.countDocuments(query);

    // Get assignment statistics for each driver
    const driversWithStats = await Promise.all(
      drivers.map(async (driver) => {
        const assignmentStats = await Pickup.aggregate([
          { $match: { driver: driver._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        const stats = assignmentStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {});

        return {
          ...driver.toObject(),
          assignmentStats: stats
        };
      })
    );

    res.json({
      success: true,
      data: {
        drivers: driversWithStats,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drivers'
    });
  }
};

// @desc    Get all pickups with filters
// @route   GET /api/admin/pickups
// @access  Private (Admin)
const getPickups = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      wasteType,
      dateFrom,
      dateTo,
      priority,
      driverId,
      sortBy = 'scheduling.requestedAt'
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (wasteType) query['wasteDetails.type'] = wasteType;
    if (priority) query.priority = priority;
    if (driverId) query.driver = driverId;

    if (dateFrom || dateTo) {
      query['scheduling.requestedAt'] = {};
      if (dateFrom) query['scheduling.requestedAt'].$gte = new Date(dateFrom);
      if (dateTo) query['scheduling.requestedAt'].$lte = new Date(dateTo);
    }

    const pickups = await Pickup.find(query)
      .populate('user', 'name email phone')
      .populate({
        path: 'driver',
        select: 'driverId user vehicle',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      })
      .sort({ [sortBy]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pickup.countDocuments(query);

    res.json({
      success: true,
      data: {
        pickups,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching pickups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pickups'
    });
  }
};

// @desc    Manually assign pickup to driver
// @route   PUT /api/admin/pickup/:id/assign
// @access  Private (Admin)
const assignPickup = async (req, res) => {
  try {
    const { driverId } = req.body;
    const pickupId = req.params.id;

    const pickup = await Pickup.findById(pickupId);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    const driver = await Driver.findById(driverId).populate('user');
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Check if driver is available
    if (!driver.availability.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Driver is not available'
      });
    }

    // Assign pickup
    await pickup.updateStatus('assigned', 'admin', `Manually assigned by admin to driver ${driver.driverId}`);
    pickup.driver = driverId;
    pickup.assignedAt = new Date();
    await pickup.save();

    // Add to driver assignments
    await driver.acceptAssignment(pickupId);

    // Emit real-time updates
    const io = req.app.get('io');
    
    // Notify driver
    io.to(`driver-${driverId}`).emit('pickup-assigned', {
      pickupId: pickup.pickupId,
      pickup: pickup,
      timestamp: new Date()
    });

    // Notify user
    io.to(`user-${pickup.user}`).emit('pickup-assigned', {
      pickupId: pickup.pickupId,
      driver: {
        name: driver.user.name,
        phone: driver.user.phone,
        vehicle: driver.vehicle.licensePlate
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Pickup assigned successfully',
      data: { pickup }
    });

  } catch (error) {
    logger.error('Error assigning pickup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign pickup'
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/user/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: { user }
    });

  } catch (error) {
    logger.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// @desc    Create new driver account
// @route   POST /api/admin/drivers
// @access  Private (Admin)
const createDriver = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, phone, password, vehicle, workingHours } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user account
    const user = new User({
      name,
      email,
      phone,
      password,
      role: 'driver',
      status: 'active'
    });

    await user.save();

    // Create driver profile
    const driver = new Driver({
      user: user._id,
      vehicle: {
        type: vehicle.type,
        licensePlate: vehicle.licensePlate,
        model: vehicle.model,
        capacity: vehicle.capacity
      },
      availability: {
        workingHours: workingHours || {
          monday: { start: '08:00', end: '18:00', isWorking: true },
          tuesday: { start: '08:00', end: '18:00', isWorking: true },
          wednesday: { start: '08:00', end: '18:00', isWorking: true },
          thursday: { start: '08:00', end: '18:00', isWorking: true },
          friday: { start: '08:00', end: '18:00', isWorking: true },
          saturday: { start: '08:00', end: '14:00', isWorking: true },
          sunday: { start: '08:00', end: '14:00', isWorking: false }
        }
      }
    });

    await driver.save();

    // Populate driver data for response
    await driver.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: { driver }
    });

  } catch (error) {
    logger.error('Error creating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create driver'
    });
  }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getSystemAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
    }

    // Parallel analytics queries
    const [
      pickupTrends,
      wasteTypeAnalytics,
      driverPerformance,
      userGrowth,
      completionRates
    ] = await Promise.all([
      // Pickup trends over time
      Pickup.aggregate([
        {
          $match: {
            'scheduling.requestedAt': { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$scheduling.requestedAt' } },
              status: '$status'
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.date': 1 }
        }
      ]),

      // Waste type analytics
      Pickup.aggregate([
        {
          $match: {
            'scheduling.requestedAt': { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$wasteDetails.type',
            count: { $sum: 1 },
            totalWeight: { $sum: '$wasteDetails.estimatedWeight' },
            avgWeight: { $avg: '$wasteDetails.estimatedWeight' }
          }
        }
      ]),

      // Driver performance
      Driver.aggregate([
        {
          $lookup: {
            from: 'pickups',
            localField: '_id',
            foreignField: 'driver',
            as: 'pickups'
          }
        },
        {
          $project: {
            driverId: 1,
            'performance.rating': 1,
            'performance.totalPickups': 1,
            'performance.completionRate': 1,
            pickupsInPeriod: {
              $size: {
                $filter: {
                  input: '$pickups',
                  cond: { $gte: ['$$this.scheduling.requestedAt', startDate] }
                }
              }
            }
          }
        }
      ]),

      // User growth
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            role: 'user'
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            newUsers: { $sum: 1 }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]),

      // Completion rates by day
      Pickup.aggregate([
        {
          $match: {
            'scheduling.requestedAt': { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$scheduling.requestedAt' } },
            total: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            total: 1,
            completed: 1,
            completionRate: {
              $multiply: [
                { $divide: ['$completed', '$total'] },
                100
              ]
            }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ])
    ]);

    const analytics = {
      period,
      pickupTrends,
      wasteTypeAnalytics,
      driverPerformance,
      userGrowth,
      completionRates
    };

    res.json({
      success: true,
      data: { analytics }
    });

  } catch (error) {
    logger.error('Error fetching system analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

module.exports = {
  adminLogin,
  getAdminDashboard,
  getUsers,
  getDrivers,
  getPickups,
  assignPickup,
  updateUserStatus,
  createDriver,
  getSystemAnalytics
};