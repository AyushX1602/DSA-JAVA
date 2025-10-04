const Driver = require('../models/Driver');
const Pickup = require('../models/Pickup');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { calculateETA, updateETAForPickup } = require('../services/etaService');
const { updateSocketLocation } = require('../services/socketService');

// @desc    Get driver dashboard data
// @route   GET /api/drivers/dashboard
// @access  Private (Driver)
const getDriverDashboard = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id })
      .populate('user', 'name email phone')
      .populate({
        path: 'currentAssignments.pickup',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    // Get today's completed pickups
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPickups = await Pickup.find({
      driver: driver._id,
      'scheduling.completedAt': {
        $gte: today,
        $lt: tomorrow
      }
    }).select('pickupId wasteDetails scheduling.completedAt');

    // Calculate daily earnings (assuming basic rate structure)
    const dailyEarnings = todayPickups.length * 50; // Base rate per pickup

    // Get performance statistics
    const performanceStats = {
      todayPickups: todayPickups.length,
      totalPickups: driver.performance.totalPickups,
      rating: driver.performance.rating,
      completionRate: driver.performance.completionRate,
      onTimeRate: driver.performance.onTimeRate,
      dailyEarnings
    };

    // Get current work status
    const workStatus = {
      isAvailable: driver.availability.isAvailable,
      workingHours: driver.availability.workingHours,
      currentShift: driver.availability.currentShift,
      lastLocationUpdate: driver.currentLocation.updatedAt
    };

    res.json({
      success: true,
      data: {
        driver,
        currentAssignments: driver.currentAssignments,
        performanceStats,
        workStatus,
        todayPickups
      }
    });

  } catch (error) {
    logger.error('Error fetching driver dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

// @desc    Update driver availability
// @route   PUT /api/drivers/availability
// @access  Private (Driver)
const updateAvailability = async (req, res) => {
  try {
    const { isAvailable, workingHours, breakDuration } = req.body;

    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    // Update availability
    const updates = {};
    if (typeof isAvailable === 'boolean') {
      updates['availability.isAvailable'] = isAvailable;
      
      if (isAvailable) {
        updates['availability.shiftStartTime'] = new Date();
        updates['availability.currentShift.start'] = new Date();
        updates['availability.currentShift.status'] = 'active';
      } else {
        updates['availability.shiftEndTime'] = new Date();
        updates['availability.currentShift.end'] = new Date();
        updates['availability.currentShift.status'] = 'ended';
        
        // Calculate shift duration
        if (driver.availability.currentShift.start) {
          const shiftDuration = Date.now() - driver.availability.currentShift.start.getTime();
          updates['availability.currentShift.duration'] = Math.round(shiftDuration / (1000 * 60)); // in minutes
        }
      }
    }

    if (workingHours) {
      updates['availability.workingHours'] = workingHours;
    }

    if (breakDuration) {
      updates['availability.currentShift.breakDuration'] = breakDuration;
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      driver._id,
      updates,
      { new: true }
    );

    // Emit real-time update to admin
    const io = req.app.get('io');
    io.to('admin-room').emit('driver-availability-changed', {
      driverId: driver.driverId,
      isAvailable,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: {
        availability: updatedDriver.availability
      }
    });

  } catch (error) {
    logger.error('Error updating driver availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability'
    });
  }
};

// @desc    Update driver location
// @route   PUT /api/drivers/location
// @access  Private (Driver)
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, heading, speed } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    // Update location
    await driver.updateLocation(longitude, latitude, heading, speed);

    // Update ETAs for assigned pickups
    for (const assignment of driver.currentAssignments) {
      if (['assigned', 'en-route'].includes(assignment.status)) {
        try {
          await updateETAForPickup(assignment.pickup);
        } catch (etaError) {
          logger.warn(`Failed to update ETA for pickup ${assignment.pickup}: ${etaError.message}`);
        }
      }
    }

    // Emit real-time location update
    await updateSocketLocation(driver._id, { latitude, longitude, heading, speed });

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        currentLocation: driver.currentLocation
      }
    });

  } catch (error) {
    logger.error('Error updating driver location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location'
    });
  }
};

// @desc    Accept pickup assignment
// @route   PUT /api/drivers/pickup/:id/accept
// @access  Private (Driver)
const acceptPickup = async (req, res) => {
  try {
    const pickupId = req.params.id;
    
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    const pickup = await Pickup.findById(pickupId)
      .populate('user', 'name phone');

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Check if pickup is still available for assignment
    if (pickup.status !== 'pending' && pickup.status !== 'assigned') {
      return res.status(400).json({
        success: false,
        message: 'Pickup is no longer available for assignment'
      });
    }

    // Check if driver is available
    if (!driver.availability.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Driver is not available for assignments'
      });
    }

    // Accept the assignment
    await pickup.updateStatus('assigned', 'system', `Accepted by driver ${driver.driverId}`);
    pickup.driver = driver._id;
    pickup.assignedAt = new Date();
    await pickup.save();

    // Add to driver's assignments
    await driver.acceptAssignment(pickupId);

    // Calculate initial ETA
    try {
      await calculateETA(pickupId);
    } catch (etaError) {
      logger.warn(`Failed to calculate initial ETA for pickup ${pickup.pickupId}: ${etaError.message}`);
    }

    // Emit real-time updates
    const io = req.app.get('io');
    
    // Notify user
    io.to(`user-${pickup.user._id}`).emit('pickup-assigned', {
      pickupId: pickup.pickupId,
      driver: {
        name: driver.user.name,
        phone: driver.user.phone,
        vehicle: driver.vehicle.licensePlate,
        rating: driver.performance.rating
      },
      eta: pickup.eta,
      timestamp: new Date()
    });

    // Notify admin
    io.to('admin-room').emit('pickup-assigned', {
      pickupId: pickup.pickupId,
      driverId: driver.driverId,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Pickup accepted successfully',
      data: {
        pickup: pickup,
        assignment: driver.currentAssignments.find(a => a.pickup.toString() === pickupId)
      }
    });

  } catch (error) {
    logger.error('Error accepting pickup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept pickup'
    });
  }
};

// @desc    Update pickup status
// @route   PUT /api/drivers/pickup/:id/status
// @access  Private (Driver)
const updatePickupStatus = async (req, res) => {
  try {
    const { status, notes, photos } = req.body;
    const pickupId = req.params.id;

    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    const pickup = await Pickup.findOne({
      _id: pickupId,
      driver: driver._id
    }).populate('user', 'name phone');

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found or not assigned to this driver'
      });
    }

    // Validate status transition
    const validTransitions = {
      'assigned': ['en-route', 'cancelled'],
      'en-route': ['arrived', 'cancelled'],
      'arrived': ['in-progress', 'cancelled'],
      'in-progress': ['completed']
    };

    if (!validTransitions[pickup.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${pickup.status} to ${status}`
      });
    }

    // Update pickup status
    await pickup.updateStatus(status, 'driver', notes);

    // Handle specific status updates
    switch (status) {
      case 'en-route':
        pickup.scheduling.enRouteAt = new Date();
        await updateETAForPickup(pickupId);
        break;
        
      case 'arrived':
        pickup.scheduling.arrivedAt = new Date();
        break;
        
      case 'in-progress':
        pickup.scheduling.inProgressAt = new Date();
        break;
        
      case 'completed':
        pickup.scheduling.completedAt = new Date();
        
        // Add photos if provided
        if (photos && photos.length > 0) {
          pickup.documentation.photos = photos;
        }
        
        // Update driver performance
        await driver.completePickup(pickupId);
        
        // Update user statistics
        await User.findByIdAndUpdate(pickup.user._id, {
          $inc: { 'statistics.completedPickups': 1 }
        });
        
        break;
    }

    await pickup.save();

    // Update driver assignment status
    await Driver.findByIdAndUpdate(driver._id, {
      $set: {
        'currentAssignments.$[elem].status': status,
        'currentAssignments.$[elem].updatedAt': new Date()
      }
    }, {
      arrayFilters: [{ 'elem.pickup': pickupId }]
    });

    // Emit real-time updates
    const io = req.app.get('io');
    
    // Notify user
    io.to(`user-${pickup.user._id}`).emit('pickup-status-updated', {
      pickupId: pickup.pickupId,
      status,
      eta: pickup.eta,
      driverLocation: driver.currentLocation,
      timestamp: new Date()
    });

    // Notify admin
    io.to('admin-room').emit('pickup-status-updated', {
      pickupId: pickup.pickupId,
      status,
      driverId: driver.driverId,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Pickup status updated successfully',
      data: { pickup }
    });

  } catch (error) {
    logger.error('Error updating pickup status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pickup status'
    });
  }
};

// @desc    Get driver's assigned pickups
// @route   GET /api/drivers/pickups
// @access  Private (Driver)
const getDriverPickups = async (req, res) => {
  try {
    const { status, date } = req.query;
    
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    const query = { driver: driver._id };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query['scheduling.requestedAt'] = {
        $gte: targetDate,
        $lt: nextDay
      };
    }

    const pickups = await Pickup.find(query)
      .populate('user', 'name phone profile')
      .sort({ 'scheduling.requestedAt': -1 });

    res.json({
      success: true,
      data: { pickups }
    });

  } catch (error) {
    logger.error('Error fetching driver pickups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pickups'
    });
  }
};

// @desc    Get driver performance analytics
// @route   GET /api/drivers/analytics
// @access  Private (Driver)
const getDriverAnalytics = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '24h':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
    }

    // Get pickups in the period
    const pickups = await Pickup.find({
      driver: driver._id,
      'scheduling.completedAt': { $gte: startDate, $lte: now }
    });

    // Calculate analytics
    const analytics = {
      totalPickups: pickups.length,
      completedOnTime: pickups.filter(p => {
        if (!p.eta || !p.scheduling.completedAt) return false;
        return p.scheduling.completedAt <= p.eta.estimatedArrival;
      }).length,
      averageRating: pickups.reduce((sum, p) => sum + (p.feedback.userRating || 0), 0) / (pickups.length || 1),
      totalEarnings: pickups.length * 50, // Basic calculation
      wasteTypesHandled: [...new Set(pickups.map(p => p.wasteDetails.type))],
      dailyBreakdown: {}
    };

    // Calculate daily breakdown
    for (let i = 0; i < (period === '24h' ? 24 : period === '7d' ? 7 : 30); i++) {
      const date = new Date(startDate);
      if (period === '24h') {
        date.setHours(date.getHours() + i);
      } else {
        date.setDate(date.getDate() + i);
      }
      
      const dayKey = period === '24h' ? 
        date.getHours().toString().padStart(2, '0') + ':00' :
        date.toISOString().split('T')[0];
      
      const dayPickups = pickups.filter(p => {
        const pickupDate = new Date(p.scheduling.completedAt);
        if (period === '24h') {
          return pickupDate.getHours() === date.getHours() && 
                 pickupDate.toDateString() === date.toDateString();
        } else {
          return pickupDate.toDateString() === date.toDateString();
        }
      });
      
      analytics.dailyBreakdown[dayKey] = {
        pickups: dayPickups.length,
        earnings: dayPickups.length * 50
      };
    }

    res.json({
      success: true,
      data: { analytics }
    });

  } catch (error) {
    logger.error('Error fetching driver analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

// @desc    Report an issue
// @route   POST /api/drivers/report-issue
// @access  Private (Driver)
const reportIssue = async (req, res) => {
  try {
    const { pickupId, issueType, description, photos } = req.body;
    
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    const pickup = await Pickup.findOne({
      _id: pickupId,
      driver: driver._id
    });

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Add issue to pickup communications
    const issueReport = {
      type: 'issue',
      from: 'driver',
      message: description,
      timestamp: new Date(),
      metadata: {
        issueType,
        photos: photos || []
      }
    };

    pickup.communications.push(issueReport);
    await pickup.save();

    // Emit to admin for immediate attention
    const io = req.app.get('io');
    io.to('admin-room').emit('driver-issue-reported', {
      pickupId: pickup.pickupId,
      driverId: driver.driverId,
      issueType,
      description,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Issue reported successfully',
      data: { issueReport }
    });

  } catch (error) {
    logger.error('Error reporting issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report issue'
    });
  }
};

module.exports = {
  getDriverDashboard,
  updateAvailability,
  updateLocation,
  acceptPickup,
  updatePickupStatus,
  getDriverPickups,
  getDriverAnalytics,
  reportIssue
};