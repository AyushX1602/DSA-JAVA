const express = require('express');
const { body } = require('express-validator');
const {
  getAdminDashboard,
  getUsers,
  getDrivers,
  getPickups,
  assignPickup,
  updateUserStatus,
  createDriver,
  getSystemAnalytics
} = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const assignPickupValidation = [
  body('driverId')
    .isMongoId()
    .withMessage('Valid driver ID is required')
];

const updateUserStatusValidation = [
  body('status')
    .isIn(['active', 'suspended', 'inactive'])
    .withMessage('Invalid user status')
];

const createDriverValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('vehicle.type')
    .isIn(['truck', 'van', 'car', 'motorcycle'])
    .withMessage('Invalid vehicle type'),
  body('vehicle.licensePlate')
    .notEmpty()
    .withMessage('License plate is required')
    .isLength({ min: 3, max: 15 })
    .withMessage('License plate must be between 3 and 15 characters'),
  body('vehicle.model')
    .notEmpty()
    .withMessage('Vehicle model is required')
    .isLength({ max: 50 })
    .withMessage('Vehicle model is too long'),
  body('vehicle.capacity')
    .isFloat({ min: 1, max: 10000 })
    .withMessage('Vehicle capacity must be between 1 and 10000 kg'),
  body('workingHours')
    .optional()
    .isObject()
    .withMessage('Working hours must be an object')
];

// All routes require authentication and admin role
router.use(auth);
router.use(authorize('admin'));

// Dashboard and analytics
router.get('/dashboard', getAdminDashboard);
router.get('/analytics', getSystemAnalytics);

// User management
router.get('/users', getUsers);
router.put('/user/:id/status', updateUserStatusValidation, updateUserStatus);

// Driver management
router.get('/drivers', getDrivers);
router.post('/drivers', createDriverValidation, createDriver);

// Pickup management
router.get('/pickups', getPickups);
router.put('/pickup/:id/assign', assignPickupValidation, assignPickup);

module.exports = router;