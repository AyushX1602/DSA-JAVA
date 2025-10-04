const Pickup = require('../models/Pickup');
const Driver = require('../models/Driver');
const { calculateDistanceAndTime } = require('../services/mapbox');
const logger = require('../utils/logger');

// @desc    Calculate ETA for a pickup
// @route   GET /api/eta/:pickupId
// @access  Private
const calculateETA = async (req, res) => {
  try {
    const { pickupId } = req.params;

    const pickup = await Pickup.findById(pickupId)
      .populate('driver', 'currentLocation driverId');

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    if (!pickup.driver) {
      return res.status(400).json({
        success: false,
        message: 'No driver assigned to this pickup'
      });
    }

    const driverLocation = pickup.driver.currentLocation;
    if (!driverLocation.coordinates || driverLocation.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Driver location not available'
      });
    }

    const pickupLocation = pickup.pickupLocation;
    if (!pickupLocation.coordinates || pickupLocation.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Pickup location not available'
      });
    }

    // Calculate route using Mapbox
    const routeData = await calculateDistanceAndTime(
      driverLocation.coordinates, // [lng, lat]
      pickupLocation.coordinates  // [lng, lat]
    );

    if (!routeData.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate route',
        error: routeData.error
      });
    }

    // Add buffer time based on traffic and pickup complexity
    const bufferMinutes = calculateBufferTime(pickup);
    const totalDuration = routeData.duration + bufferMinutes;

    // Calculate ETA
    const estimatedArrival = new Date(Date.now() + totalDuration * 60 * 1000);
    
    // Update pickup with new ETA
    pickup.eta = {
      estimatedArrival,
      distance: routeData.distance,
      duration: totalDuration,
      route: routeData.route,
      lastUpdated: new Date(),
      confidence: calculateConfidence(routeData, pickup)
    };

    await pickup.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${pickup.user}`).emit('eta-updated', {
      pickupId: pickup.pickupId,
      eta: pickup.eta,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'ETA calculated successfully',
      data: {
        eta: pickup.eta,
        driverLocation: {
          coordinates: driverLocation.coordinates,
          updatedAt: driverLocation.updatedAt
        }
      }
    });

  } catch (error) {
    logger.error('Error calculating ETA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate ETA',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update ETA for all active pickups of a driver
// @route   PUT /api/eta/driver/:driverId/update-all
// @access  Private
const updateDriverETAs = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Get all active pickups for this driver
    const activePickups = await Pickup.find({
      driver: driverId,
      status: { $in: ['assigned', 'en-route', 'arrived'] }
    });

    if (activePickups.length === 0) {
      return res.json({
        success: true,
        message: 'No active pickups to update',
        data: { updatedPickups: 0 }
      });
    }

    const updatedPickups = [];
    const driverLocation = driver.currentLocation;

    if (!driverLocation.coordinates || driverLocation.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Driver location not available'
      });
    }

    // Update ETA for each active pickup
    for (const pickup of activePickups) {
      try {
        const routeData = await calculateDistanceAndTime(
          driverLocation.coordinates,
          pickup.pickupLocation.coordinates
        );

        if (routeData.success) {
          const bufferMinutes = calculateBufferTime(pickup);
          const totalDuration = routeData.duration + bufferMinutes;
          const estimatedArrival = new Date(Date.now() + totalDuration * 60 * 1000);
          
          pickup.eta = {
            estimatedArrival,
            distance: routeData.distance,
            duration: totalDuration,
            route: routeData.route,
            lastUpdated: new Date(),
            confidence: calculateConfidence(routeData, pickup)
          };

          await pickup.save();
          updatedPickups.push(pickup.pickupId);

          // Emit real-time update
          const io = req.app.get('io');
          io.to(`user-${pickup.user}`).emit('eta-updated', {
            pickupId: pickup.pickupId,
            eta: pickup.eta,
            timestamp: new Date()
          });
        }
      } catch (pickupError) {
        logger.warn(`Failed to update ETA for pickup ${pickup.pickupId}: ${pickupError.message}`);
      }
    }

    res.json({
      success: true,
      message: 'ETAs updated successfully',
      data: {
        updatedPickups: updatedPickups.length,
        pickupIds: updatedPickups
      }
    });

  } catch (error) {
    logger.error('Error updating driver ETAs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ETAs'
    });
  }
};

// @desc    Get route details between driver and pickup location
// @route   GET /api/eta/route/:pickupId
// @access  Private
const getRouteDetails = async (req, res) => {
  try {
    const { pickupId } = req.params;

    const pickup = await Pickup.findById(pickupId)
      .populate('driver', 'currentLocation driverId user')
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

    if (!pickup.driver) {
      return res.status(400).json({
        success: false,
        message: 'No driver assigned to this pickup'
      });
    }

    const driverLocation = pickup.driver.currentLocation;
    const pickupLocation = pickup.pickupLocation;

    // Get detailed route information
    const routeData = await calculateDistanceAndTime(
      driverLocation.coordinates,
      pickupLocation.coordinates,
      { includeSteps: true, includeGeometry: true }
    );

    if (!routeData.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get route details',
        error: routeData.error
      });
    }

    // Calculate traffic-adjusted timing
    const currentTime = new Date();
    const trafficMultiplier = getTrafficMultiplier(currentTime);
    const adjustedDuration = routeData.duration * trafficMultiplier;
    const bufferMinutes = calculateBufferTime(pickup);
    const totalDuration = adjustedDuration + bufferMinutes;

    const routeDetails = {
      origin: {
        coordinates: driverLocation.coordinates,
        address: 'Driver Current Location'
      },
      destination: {
        coordinates: pickupLocation.coordinates,
        address: pickupLocation.address
      },
      route: {
        distance: routeData.distance,
        duration: totalDuration,
        geometry: routeData.geometry,
        steps: routeData.steps
      },
      timing: {
        estimatedArrival: new Date(Date.now() + totalDuration * 60 * 1000),
        baseDuration: routeData.duration,
        trafficDelay: adjustedDuration - routeData.duration,
        bufferTime: bufferMinutes,
        confidence: calculateConfidence(routeData, pickup)
      },
      driver: {
        name: pickup.driver.user.name,
        phone: pickup.driver.user.phone,
        currentLocation: driverLocation,
        lastLocationUpdate: driverLocation.updatedAt
      }
    };

    res.json({
      success: true,
      data: { routeDetails }
    });

  } catch (error) {
    logger.error('Error getting route details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get route details'
    });
  }
};

// @desc    Get ETA history for a pickup
// @route   GET /api/eta/:pickupId/history
// @access  Private
const getETAHistory = async (req, res) => {
  try {
    const { pickupId } = req.params;

    const pickup = await Pickup.findById(pickupId);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Get ETA updates from status history and communications
    const etaHistory = [];

    // Extract ETA updates from status history
    pickup.statusHistory.forEach(status => {
      if (status.eta) {
        etaHistory.push({
          timestamp: status.timestamp,
          eta: status.eta,
          trigger: `Status change to ${status.status}`,
          accuracy: status.eta.confidence || 'unknown'
        });
      }
    });

    // Extract ETA updates from communications
    pickup.communications.forEach(comm => {
      if (comm.metadata && comm.metadata.eta) {
        etaHistory.push({
          timestamp: comm.timestamp,
          eta: comm.metadata.eta,
          trigger: 'Location update',
          accuracy: comm.metadata.eta.confidence || 'unknown'
        });
      }
    });

    // Sort by timestamp
    etaHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Calculate accuracy metrics
    const now = new Date();
    const actualArrival = pickup.scheduling.arrivedAt || pickup.scheduling.completedAt;
    
    let accuracyMetrics = null;
    if (actualArrival && etaHistory.length > 0) {
      const finalETA = etaHistory[etaHistory.length - 1];
      const estimatedTime = new Date(finalETA.eta.estimatedArrival);
      const actualTime = new Date(actualArrival);
      const differenceMinutes = Math.abs(actualTime - estimatedTime) / (1000 * 60);
      
      accuracyMetrics = {
        estimatedArrival: estimatedTime,
        actualArrival: actualTime,
        differenceMinutes: Math.round(differenceMinutes),
        wasEarly: actualTime < estimatedTime,
        accuracy: differenceMinutes <= 10 ? 'high' : differenceMinutes <= 30 ? 'medium' : 'low'
      };
    }

    res.json({
      success: true,
      data: {
        pickupId: pickup.pickupId,
        currentStatus: pickup.status,
        etaHistory,
        accuracyMetrics,
        totalUpdates: etaHistory.length
      }
    });

  } catch (error) {
    logger.error('Error getting ETA history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ETA history'
    });
  }
};

// Helper function to calculate buffer time based on pickup complexity
function calculateBufferTime(pickup) {
  let bufferMinutes = 5; // Base buffer

  // Add time based on waste type
  switch (pickup.wasteDetails.type) {
    case 'hazardous':
      bufferMinutes += 10;
      break;
    case 'electronic':
      bufferMinutes += 5;
      break;
    case 'organic':
      bufferMinutes += 2;
      break;
    default:
      bufferMinutes += 3;
  }

  // Add time based on estimated volume
  if (pickup.wasteDetails.estimatedVolume > 50) {
    bufferMinutes += 5;
  }

  // Add time based on special handling requirements
  if (pickup.wasteDetails.specialHandling && pickup.wasteDetails.specialHandling.length > 0) {
    bufferMinutes += 8;
  }

  // Add time for first-time users
  if (pickup.user.statistics?.totalPickups === 0) {
    bufferMinutes += 5;
  }

  return bufferMinutes;
}

// Helper function to calculate confidence level
function calculateConfidence(routeData, pickup) {
  let confidence = 0.8; // Base confidence

  // Reduce confidence based on distance
  if (routeData.distance > 20) {
    confidence -= 0.1;
  }

  // Reduce confidence for complex waste types
  if (['hazardous', 'electronic'].includes(pickup.wasteDetails.type)) {
    confidence -= 0.1;
  }

  // Reduce confidence during peak hours
  const hour = new Date().getHours();
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    confidence -= 0.15;
  }

  // Increase confidence for short distances
  if (routeData.distance < 5) {
    confidence += 0.1;
  }

  return Math.max(0.5, Math.min(0.95, confidence));
}

// Helper function to get traffic multiplier based on time
function getTrafficMultiplier(currentTime) {
  const hour = currentTime.getHours();
  const dayOfWeek = currentTime.getDay();

  // Weekend traffic is generally lighter
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 1.1;
  }

  // Peak hours multiplier
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    return 1.4;
  }

  // Lunch hour
  if (hour >= 12 && hour <= 13) {
    return 1.2;
  }

  // Off-peak hours
  return 1.0;
}

module.exports = {
  calculateETA,
  updateDriverETAs,
  getRouteDetails,
  getETAHistory
};