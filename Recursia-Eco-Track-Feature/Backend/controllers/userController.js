const User = require('../models/User');
const Pickup = require('../models/Pickup');
const Driver = require('../models/Driver');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { assignNearestDriver } = require('../services/pickupService');
const { calculateETA } = require('../services/etaService');

// Helper functions for time slot conversion
const getTimeSlotStart = (slot) => {
  const timeSlots = {
    'morning': '08:00',
    'afternoon': '13:00',
    'evening': '17:00'
  };
  return timeSlots[slot] || '08:00';
};

const getTimeSlotEnd = (slot) => {
  const timeSlots = {
    'morning': '12:00',
    'afternoon': '17:00',
    'evening': '20:00'
  };
  return timeSlots[slot] || '12:00';
};

// @desc    Create a new pickup request
// @route   POST /api/users/pickup/request
// @access  Private (User)
const createPickupRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      pickupLocation,
      wasteDetails,
      preferredDate,
      preferredTimeSlot,
      specialInstructions
    } = req.body;

    // Create new pickup request
    const pickup = new Pickup({
      user: req.user.id,
      pickupLocation: {
        type: 'Point',
        coordinates: [pickupLocation.longitude, pickupLocation.latitude],
        address: pickupLocation.address,
        landmark: pickupLocation.landmark,
        instructions: specialInstructions
      },
      wasteDetails: {
        type: wasteDetails.type,
        subType: wasteDetails.subType,
        estimatedWeight: wasteDetails.estimatedWeight || 1,
        estimatedVolume: wasteDetails.estimatedVolume,
        description: wasteDetails.description,
        images: req.body.imageUrl ? [req.body.imageUrl] : [],
        specialHandling: wasteDetails.specialHandling
      },
      scheduling: {
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTimeSlot: preferredTimeSlot ? {
          start: getTimeSlotStart(preferredTimeSlot),
          end: getTimeSlotEnd(preferredTimeSlot)
        } : {
          start: null,
          end: null
        }
      },
      priority: wasteDetails.type === 'e-waste' ? 'high' : 'normal'
    });

    await pickup.save();

    // Update user's pickup requests array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { pickupRequests: pickup._id }
    });

    // Try to auto-assign a driver
    try {
      const assignedDriver = await assignNearestDriver(pickup._id);
      if (assignedDriver) {
        logger.info(`Pickup ${pickup.pickupId} auto-assigned to driver ${assignedDriver.driverId}`);
      }
    } catch (assignError) {
      logger.warn(`Could not auto-assign driver for pickup ${pickup.pickupId}: ${assignError.message}`);
    }

    // Populate pickup data for response
    await pickup.populate('user', 'name phone email');

    // Emit real-time update to admin dashboard
    const io = req.app.get('io');
    io.to('admin-room').emit('new-pickup-request', {
      pickup: pickup,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Pickup request created successfully',
      data: {
        pickup: pickup,
        estimatedAssignment: '5-15 minutes'
      }
    });

  } catch (error) {
    logger.error('Error creating pickup request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pickup request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get user's pickup requests
// @route   GET /api/users/pickups
// @access  Private (User)
const getUserPickups = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { user: req.user.id };
    if (status) query.status = status;

    const pickups = await Pickup.find(query)
      .populate('driver', 'driverId user vehicle.licensePlate')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      })
      .sort({ 'scheduling.requestedAt': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pickup.countDocuments(query);

    res.json({
      success: true,
      data: {
        pickups,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching user pickups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pickup requests'
    });
  }
};

// @desc    Get specific pickup details
// @route   GET /api/users/pickup/:id
// @access  Private (User)
const getPickupDetails = async (req, res) => {
  try {
    const pickup = await Pickup.findOne({
      _id: req.params.id,
      user: req.user.id
    })
      .populate('driver', 'driverId user vehicle performance.rating')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      });

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup request not found'
      });
    }

    // Calculate live ETA if pickup is assigned and en-route
    if (pickup.driver && ['assigned', 'en-route'].includes(pickup.status)) {
      try {
        const updatedETA = await calculateETA(pickup._id);
        if (updatedETA.success) {
          pickup.eta = updatedETA.eta;
        }
      } catch (etaError) {
        logger.warn(`Failed to update ETA for pickup ${pickup.pickupId}: ${etaError.message}`);
      }
    }

    res.json({
      success: true,
      data: { pickup }
    });

  } catch (error) {
    logger.error('Error fetching pickup details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pickup details'
    });
  }
};

// @desc    Cancel pickup request
// @route   PUT /api/users/pickup/:id/cancel
// @access  Private (User)
const cancelPickupRequest = async (req, res) => {
  try {
    const { reason } = req.body;

    const pickup = await Pickup.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup request not found'
      });
    }

    // Check if pickup can be cancelled
    if (['completed', 'cancelled'].includes(pickup.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel pickup that is already ${pickup.status}`
      });
    }

    // If pickup was in progress, check if driver is already on the way
    if (pickup.status === 'en-route' || pickup.status === 'arrived') {
      // Allow cancellation but notify driver
      const io = req.app.get('io');
      if (pickup.driver) {
        io.to(`driver-${pickup.driver._id}`).emit('pickup-cancelled', {
          pickupId: pickup.pickupId,
          reason: reason || 'User cancellation',
          timestamp: new Date()
        });
      }
    }

    // Update pickup status
    await pickup.updateStatus('cancelled', 'user', reason);
    pickup.cancellation = {
      reason: reason || 'User cancellation',
      cancelledBy: 'user',
      cancelledAt: new Date()
    };
    await pickup.save();

    // Remove assignment from driver if assigned
    if (pickup.driver) {
      await Driver.findByIdAndUpdate(pickup.driver, {
        $pull: { currentAssignments: { pickup: pickup._id } }
      });
    }

    // Update user statistics
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'statistics.cancelledPickups': 1 }
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to('admin-room').emit('pickup-cancelled', {
      pickupId: pickup.pickupId,
      userId: req.user.id,
      reason,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Pickup request cancelled successfully',
      data: { pickup }
    });

  } catch (error) {
    logger.error('Error cancelling pickup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel pickup request'
    });
  }
};

// @desc    Rate completed pickup
// @route   PUT /api/users/pickup/:id/rate
// @access  Private (User)
const ratePickup = async (req, res) => {
  try {
    const { rating, comments, serviceQuality } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const pickup = await Pickup.findOne({
      _id: req.params.id,
      user: req.user.id,
      status: 'completed'
    }).populate('driver');

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Completed pickup not found'
      });
    }

    // Check if already rated
    if (pickup.feedback.userRating) {
      return res.status(400).json({
        success: false,
        message: 'Pickup has already been rated'
      });
    }

    // Update pickup feedback
    pickup.feedback = {
      userRating: rating,
      userComments: comments,
      serviceQuality: serviceQuality,
      ratedAt: new Date()
    };
    await pickup.save();

    // Update driver rating if driver exists
    if (pickup.driver) {
      await pickup.driver.updateRating(rating);
    }

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: { pickup }
    });

  } catch (error) {
    logger.error('Error rating pickup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating'
    });
  }
};

// @desc    Get user profile and statistics
// @route   GET /api/users/profile
// @access  Private (User)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent pickup activity
    const recentPickups = await Pickup.find({ user: req.user.id })
      .sort({ 'scheduling.requestedAt': -1 })
      .limit(5)
      .select('pickupId status wasteDetails.type scheduling.requestedAt');

    // Calculate additional statistics
    const activitySummary = user.getActivitySummary();

    res.json({
      success: true,
      data: {
        user,
        recentPickups,
        activitySummary
      }
    });

  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (User)
const updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const allowedUpdates = ['name', 'phone', 'profile', 'currentLocation'];
    const updates = {};

    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// @desc    Track pickup in real-time
// @route   GET /api/users/pickup/:id/track
// @access  Private (User)
const trackPickup = async (req, res) => {
  try {
    const pickup = await Pickup.findOne({
      _id: req.params.id,
      user: req.user.id
    })
      .populate('driver', 'currentLocation driverId user vehicle')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      });

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Return tracking information
    const trackingData = {
      pickup: {
        id: pickup._id,
        pickupId: pickup.pickupId,
        status: pickup.status,
        eta: pickup.eta,
        pickupLocation: pickup.pickupLocation
      },
      driver: pickup.driver ? {
        name: pickup.driver.user.name,
        phone: pickup.driver.user.phone,
        vehiclePlate: pickup.driver.vehicle.licensePlate,
        currentLocation: pickup.driver.currentLocation,
        rating: pickup.driver.performance.rating
      } : null,
      statusHistory: pickup.statusHistory.slice(-5), // Last 5 status updates
      communications: pickup.communications.slice(-10) // Last 10 communications
    };

    res.json({
      success: true,
      data: trackingData
    });

  } catch (error) {
    logger.error('Error tracking pickup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track pickup'
    });
  }
};

module.exports = {
  createPickupRequest,
  getUserPickups,
  getPickupDetails,
  cancelPickupRequest,
  ratePickup,
  getUserProfile,
  updateUserProfile,
  trackPickup
};