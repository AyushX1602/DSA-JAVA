const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Pickup = require('../models/Pickup');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { assignNearestDriver } = require('../services/pickupService');
const { createNotification } = require('../controllers/notificationController');

const router = express.Router();

// Validation rules for pickup request
const pickupValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('pickupLocation')
    .notEmpty()
    .withMessage('Pickup location is required'),
  body('imageUrl')
    .isURL()
    .withMessage('Valid image URL is required'),
  body('status')
    .optional()
    .isIn(['pending', 'requested'])
    .withMessage('Invalid status')
];

// @desc    Create a new pickup request (simplified endpoint as per requirements)
// @route   POST /api/pickup
// @access  Private
const createSimplePickupRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { userId, pickupLocation, imageUrl, status = 'pending' } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create simplified pickup request based on requirements
    const pickup = new Pickup({
      user: userId,
      pickupLocation: {
        type: 'Point',
        coordinates: [0, 0], // Default coordinates, can be enhanced later
        address: typeof pickupLocation === 'string' ? pickupLocation : pickupLocation.address || 'Location provided',
        landmark: typeof pickupLocation === 'object' ? pickupLocation.landmark : '',
        instructions: typeof pickupLocation === 'object' ? pickupLocation.instructions : ''
      },
      wasteDetails: {
        type: 'general', // Default type
        description: 'Pickup request via image upload',
        images: [imageUrl] // Store the Cloudinary image URL
      },
      status: status === 'pending' ? 'requested' : status // Map 'pending' to 'requested' as per model
    });

    await pickup.save();

    // Update user's pickup requests array
    await User.findByIdAndUpdate(userId, {
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

    // Create notification for user
    try {
      await createNotification({
        userId: userId,
        type: 'pickup_created',
        title: 'Pickup Request Created',
        message: 'Your waste pickup request has been created successfully.',
        priority: 'normal',
        relatedPickup: pickup._id,
        actionRequired: false,
        metadata: {
          pickupId: pickup.pickupId,
          imageUrl: imageUrl
        }
      });
    } catch (notificationError) {
      logger.warn('Failed to create notification for pickup creation:', notificationError);
      // Don't fail the pickup creation if notification fails
    }

    // Emit real-time update to admin dashboard
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('new-pickup-request', {
        pickup: pickup,
        user: pickup.user,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Pickup request created successfully',
      data: {
        pickup: {
          id: pickup._id,
          pickupId: pickup.pickupId,
          status: pickup.status,
          pickupLocation: pickup.pickupLocation,
          imageUrl: imageUrl,
          createdAt: pickup.scheduling.requestedAt,
          user: pickup.user
        }
      }
    });

  } catch (error) {
    logger.error('Error creating pickup request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// POST /api/pickup - Create pickup request
router.post('/', pickupValidation, createSimplePickupRequest);

module.exports = router;