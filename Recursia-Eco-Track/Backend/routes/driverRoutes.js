const express = require('express');
const { body } = require('express-validator');
const {
  getDriverDashboard,
  updateAvailability,
  updateLocation,
  acceptPickup,
  updatePickupStatus,
  getDriverPickups,
  getDriverAnalytics,
  reportIssue
} = require('../controllers/driverController');
const { auth, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const updateAvailabilityValidation = [
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  body('workingHours')
    .optional()
    .isObject()
    .withMessage('Working hours must be an object'),
  body('breakDuration')
    .optional()
    .isInt({ min: 0, max: 480 })
    .withMessage('Break duration must be between 0 and 480 minutes')
];

const updateLocationValidation = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  body('heading')
    .optional()
    .isFloat({ min: 0, max: 360 })
    .withMessage('Heading must be between 0 and 360 degrees'),
  body('speed')
    .optional()
    .isFloat({ min: 0, max: 200 })
    .withMessage('Speed must be between 0 and 200 km/h')
];

const updatePickupStatusValidation = [
  body('status')
    .isIn(['en-route', 'arrived', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid pickup status'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes are too long'),
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  body('photos.*')
    .optional()
    .isURL()
    .withMessage('Each photo must be a valid URL')
];

const reportIssueValidation = [
  body('pickupId')
    .isMongoId()
    .withMessage('Valid pickup ID is required'),
  body('issueType')
    .isIn(['access_denied', 'wrong_location', 'safety_concern', 'waste_mismatch', 'equipment_failure', 'customer_unavailable', 'other'])
    .withMessage('Invalid issue type'),
  body('description')
    .notEmpty()
    .withMessage('Issue description is required')
    .isLength({ max: 1000 })
    .withMessage('Description is too long'),
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  body('photos.*')
    .optional()
    .isURL()
    .withMessage('Each photo must be a valid URL')
];

// All routes require authentication and driver role
router.use(auth);
router.use(authorize('driver'));

// Dashboard and profile routes
router.get('/dashboard', getDriverDashboard);
router.get('/pickups', getDriverPickups);
router.get('/analytics', getDriverAnalytics);

// Availability and location routes
router.put('/availability', updateAvailabilityValidation, updateAvailability);
router.put('/location', updateLocationValidation, updateLocation);

// Pickup management routes
router.put('/pickup/:id/accept', acceptPickup);
router.put('/pickup/:id/status', updatePickupStatusValidation, updatePickupStatus);

// Issue reporting
router.post('/report-issue', reportIssueValidation, reportIssue);

module.exports = router;