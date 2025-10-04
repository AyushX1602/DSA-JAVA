const express = require('express');
const {
  calculateETA,
  updateDriverETAs,
  getRouteDetails,
  getETAHistory
} = require('../controllers/etaController');
const { auth } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(auth);

// ETA calculation and management routes
router.get('/:pickupId', calculateETA);
router.put('/driver/:driverId/update-all', updateDriverETAs);
router.get('/route/:pickupId', getRouteDetails);
router.get('/:pickupId/history', getETAHistory);

module.exports = router;