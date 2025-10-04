const express = require('express');
const { body } = require('express-validator');
const {
  createPickupRequest,
  getUserPickups,
  getPickupDetails,
  cancelPickupRequest,
  ratePickup,
  getUserProfile,
  updateUserProfile,
  trackPickup
} = require('../controllers/userController');
const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
  getNotificationSettings
} = require('../controllers/notificationController');
const { auth, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const createPickupValidation = [
  body('pickupLocation.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  body('pickupLocation.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  body('pickupLocation.address')
    .notEmpty()
    .withMessage('Pickup address is required')
    .isLength({ max: 255 })
    .withMessage('Address is too long'),
  body('wasteDetails.type')
    .isIn(['organic', 'plastic', 'paper', 'electronic', 'hazardous', 'general', 'mixed'])
    .withMessage('Invalid waste type'),
  body('wasteDetails.estimatedWeight')
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Estimated weight must be between 0.1 and 1000 kg'),
  body('wasteDetails.estimatedVolume')
    .optional()
    .isFloat({ min: 0.1, max: 500 })
    .withMessage('Estimated volume must be between 0.1 and 500 liters'),
  body('wasteDetails.description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description is too long'),
  body('preferredDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid preferred date format'),
  body('preferredTimeSlot')
    .optional()
    .isIn(['morning', 'afternoon', 'evening'])
    .withMessage('Invalid time slot'),
  body('specialInstructions')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special instructions are too long')
];

const cancelPickupValidation = [
  body('reason')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Cancellation reason is too long')
];

const ratePickupValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comments')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comments are too long'),
  body('serviceQuality')
    .optional()
    .isIn(['excellent', 'good', 'average', 'poor'])
    .withMessage('Invalid service quality rating')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('profile.preferences.communicationMethod')
    .optional()
    .isIn(['email', 'sms', 'push', 'call'])
    .withMessage('Invalid communication method'),
  body('profile.preferences.notificationTypes')
    .optional()
    .isArray()
    .withMessage('Notification types must be an array'),
  body('currentLocation.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  body('currentLocation.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required')
];

// All routes require authentication and user role
router.use(auth);
router.use(authorize('user'));

// Pickup management routes
router.post('/pickup/request', createPickupValidation, createPickupRequest);
router.get('/pickups', getUserPickups);
router.get('/pickup/:id', getPickupDetails);
router.put('/pickup/:id/cancel', cancelPickupValidation, cancelPickupRequest);
router.put('/pickup/:id/rate', ratePickupValidation, ratePickup);
router.get('/pickup/:id/track', trackPickup);


// Profile management routes
router.get('/profile', getUserProfile);
router.put('/profile', updateProfileValidation, updateUserProfile);

// Notification management routes
router.get('/notifications', getUserNotifications);
router.patch('/notifications/:id/read', markNotificationAsRead);
router.patch('/notifications/read-all', markAllNotificationsAsRead);
router.delete('/notifications/:id', deleteNotification);
router.delete('/notifications/cleanup', deleteReadNotifications);
router.get('/notifications/settings', getNotificationSettings);

module.exports = router;