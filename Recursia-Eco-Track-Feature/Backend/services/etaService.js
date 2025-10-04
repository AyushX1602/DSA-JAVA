const Pickup = require('../models/Pickup');
const Driver = require('../models/Driver');
const { calculateDistanceAndTime } = require('./mapbox');
const logger = require('../utils/logger');

/**
 * Calculate ETA for a specific pickup
 * @param {string} pickupId - Pickup ID
 * @returns {Object} - ETA calculation result
 */
const calculateETA = async (pickupId) => {
  try {
    const pickup = await Pickup.findById(pickupId)
      .populate('driver', 'currentLocation driverId');

    if (!pickup) {
      throw new Error('Pickup not found');
    }

    if (!pickup.driver) {
      throw new Error('No driver assigned to pickup');
    }

    const driverLocation = pickup.driver.currentLocation;
    const pickupLocation = pickup.pickupLocation;

    // Validate locations
    if (!driverLocation.coordinates || !pickupLocation.coordinates) {
      throw new Error('Driver or pickup location coordinates missing');
    }

    // Calculate route
    const routeData = await calculateDistanceAndTime(
      driverLocation.coordinates,
      pickupLocation.coordinates
    );

    if (!routeData.success) {
      throw new Error('Failed to calculate route');
    }

    // Calculate buffer time based on pickup complexity
    const bufferMinutes = calculateBufferTime(pickup);
    
    // Adjust for traffic if available
    const finalDuration = routeData.durationWithTraffic || routeData.duration;
    const totalDuration = finalDuration + bufferMinutes;

    // Calculate ETA
    const estimatedArrival = new Date(Date.now() + totalDuration * 60 * 1000);
    
    // Update pickup with new ETA
    pickup.eta = {
      estimatedArrival,
      distance: routeData.distance,
      duration: totalDuration,
      route: routeData.geometry,
      lastUpdated: new Date(),
      confidence: calculateConfidence(routeData, pickup),
      trafficDelay: routeData.trafficDelay || 0,
      bufferTime: bufferMinutes
    };

    await pickup.save();

    logger.info(`ETA calculated for pickup ${pickup.pickupId}`, {
      distance: routeData.distance,
      duration: totalDuration,
      eta: estimatedArrival
    });

    return {
      success: true,
      eta: pickup.eta,
      routeData
    };

  } catch (error) {
    logger.error(`Error calculating ETA for pickup ${pickupId}:`, error);
    throw error;
  }
};

/**
 * Update ETA for a pickup when driver location changes
 * @param {string} pickupId - Pickup ID
 * @returns {Object} - Updated ETA result
 */
const updateETAForPickup = async (pickupId) => {
  try {
    const pickup = await Pickup.findById(pickupId)
      .populate('driver', 'currentLocation');

    if (!pickup || !pickup.driver) {
      logger.warn(`Cannot update ETA: pickup ${pickupId} not found or no driver assigned`);
      return { success: false, message: 'Pickup or driver not found' };
    }

    // Only update ETA for active pickups
    if (!['assigned', 'en-route', 'arrived'].includes(pickup.status)) {
      return { success: false, message: 'Pickup status does not require ETA updates' };
    }

    // Check if enough time has passed since last update (avoid too frequent updates)
    const lastUpdate = pickup.eta?.lastUpdated;
    if (lastUpdate && (Date.now() - lastUpdate.getTime()) < 60000) { // 1 minute threshold
      return { success: false, message: 'ETA updated too recently' };
    }

    return await calculateETA(pickupId);

  } catch (error) {
    logger.error(`Error updating ETA for pickup ${pickupId}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Update ETAs for all active pickups of a driver
 * @param {string} driverId - Driver ID
 * @returns {Object} - Bulk update result
 */
const updateDriverETAs = async (driverId) => {
  try {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new Error('Driver not found');
    }

    // Get all active pickups for this driver
    const activePickups = await Pickup.find({
      driver: driverId,
      status: { $in: ['assigned', 'en-route', 'arrived'] }
    });

    if (activePickups.length === 0) {
      return {
        success: true,
        message: 'No active pickups to update',
        updatedCount: 0
      };
    }

    const results = {
      updated: [],
      failed: [],
      skipped: []
    };

    // Update ETA for each pickup
    for (const pickup of activePickups) {
      try {
        const result = await updateETAForPickup(pickup._id);
        if (result.success) {
          results.updated.push(pickup.pickupId);
        } else {
          results.skipped.push({ pickupId: pickup.pickupId, reason: result.message });
        }
      } catch (error) {
        results.failed.push({ pickupId: pickup.pickupId, error: error.message });
        logger.warn(`Failed to update ETA for pickup ${pickup.pickupId}:`, error);
      }
    }

    logger.info(`Driver ${driver.driverId} ETA updates completed`, {
      updated: results.updated.length,
      failed: results.failed.length,
      skipped: results.skipped.length
    });

    return {
      success: true,
      updatedCount: results.updated.length,
      results
    };

  } catch (error) {
    logger.error(`Error updating driver ETAs for ${driverId}:`, error);
    throw error;
  }
};

/**
 * Calculate buffer time based on pickup complexity
 * @param {Object} pickup - Pickup document
 * @returns {number} - Buffer time in minutes
 */
const calculateBufferTime = (pickup) => {
  let bufferMinutes = 5; // Base buffer

  // Add time based on waste type complexity
  const wasteTypeBuffers = {
    'hazardous': 15,
    'electronic': 10,
    'recyclable': 5,
    'organic': 3,
    'mixed': 8
  };

  bufferMinutes += wasteTypeBuffers[pickup.wasteDetails.type] || 5;

  // Add time based on estimated volume
  if (pickup.wasteDetails.estimatedVolume) {
    if (pickup.wasteDetails.estimatedVolume > 100) {
      bufferMinutes += 10;
    } else if (pickup.wasteDetails.estimatedVolume > 50) {
      bufferMinutes += 5;
    }
  }

  // Add time based on estimated weight
  if (pickup.wasteDetails.estimatedWeight > 50) {
    bufferMinutes += 8;
  } else if (pickup.wasteDetails.estimatedWeight > 20) {
    bufferMinutes += 5;
  }

  // Add time for special handling requirements
  if (pickup.wasteDetails.specialHandling && pickup.wasteDetails.specialHandling.length > 0) {
    bufferMinutes += 10;
  }

  // Add time for high priority pickups (extra care required)
  if (pickup.priority === 'high') {
    bufferMinutes += 5;
  }

  // Add time based on location complexity (if special instructions provided)
  if (pickup.pickupLocation.instructions && pickup.pickupLocation.instructions.length > 50) {
    bufferMinutes += 5;
  }

  return Math.min(bufferMinutes, 30); // Cap at 30 minutes
};

/**
 * Calculate confidence level for ETA
 * @param {Object} routeData - Route calculation result from Mapbox
 * @param {Object} pickup - Pickup document
 * @returns {number} - Confidence level (0-1)
 */
const calculateConfidence = (routeData, pickup) => {
  let confidence = 0.85; // Base confidence

  // Reduce confidence based on distance (longer routes are less predictable)
  if (routeData.distance > 30) {
    confidence -= 0.15;
  } else if (routeData.distance > 15) {
    confidence -= 0.1;
  } else if (routeData.distance > 5) {
    confidence -= 0.05;
  }

  // Reduce confidence for complex waste types
  const complexWasteTypes = ['hazardous', 'electronic', 'mixed'];
  if (complexWasteTypes.includes(pickup.wasteDetails.type)) {
    confidence -= 0.1;
  }

  // Reduce confidence during peak traffic hours
  const hour = new Date().getHours();
  const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  if (isPeakHour) {
    confidence -= 0.15;
  }

  // Reduce confidence if there's significant traffic delay
  if (routeData.trafficDelay && routeData.trafficDelay > 10) {
    confidence -= 0.1;
  }

  // Reduce confidence for weekend traffic patterns
  const isWeekend = [0, 6].includes(new Date().getDay());
  if (isWeekend) {
    confidence -= 0.05;
  }

  // Increase confidence for short, simple routes
  if (routeData.distance < 3 && pickup.wasteDetails.type === 'organic') {
    confidence += 0.1;
  }

  // Increase confidence if route includes traffic data
  if (routeData.durationWithTraffic) {
    confidence += 0.05;
  }

  return Math.max(0.5, Math.min(0.95, confidence));
};

/**
 * Get ETA statistics for a driver or system-wide
 * @param {string} driverId - Optional driver ID for driver-specific stats
 * @param {Object} options - Options for date range, etc.
 * @returns {Object} - ETA accuracy statistics
 */
const getETAStatistics = async (driverId = null, options = {}) => {
  try {
    const { 
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date() 
    } = options;

    const query = {
      status: 'completed',
      'scheduling.completedAt': { $gte: startDate, $lte: endDate },
      'eta.estimatedArrival': { $exists: true }
    };

    if (driverId) {
      query.driver = driverId;
    }

    const completedPickups = await Pickup.find(query)
      .select('eta scheduling.arrivedAt scheduling.completedAt wasteDetails.type');

    if (completedPickups.length === 0) {
      return {
        success: true,
        statistics: {
          totalPickups: 0,
          accurateETAs: 0,
          averageDelay: 0,
          accuracyRate: 0
        }
      };
    }

    let totalDelay = 0;
    let accurateCount = 0;
    const delayThreshold = 10; // 10 minutes threshold for "accurate"

    const delays = completedPickups.map(pickup => {
      const estimatedTime = new Date(pickup.eta.estimatedArrival);
      const actualTime = new Date(pickup.scheduling.arrivedAt || pickup.scheduling.completedAt);
      const delayMinutes = (actualTime - estimatedTime) / (1000 * 60);
      
      totalDelay += Math.abs(delayMinutes);
      
      if (Math.abs(delayMinutes) <= delayThreshold) {
        accurateCount++;
      }
      
      return {
        pickupId: pickup._id,
        wasteType: pickup.wasteDetails.type,
        delayMinutes: Math.round(delayMinutes),
        wasAccurate: Math.abs(delayMinutes) <= delayThreshold
      };
    });

    const statistics = {
      totalPickups: completedPickups.length,
      accurateETAs: accurateCount,
      accuracyRate: (accurateCount / completedPickups.length) * 100,
      averageDelay: totalDelay / completedPickups.length,
      delayDistribution: {
        early: delays.filter(d => d.delayMinutes < -delayThreshold).length,
        onTime: delays.filter(d => Math.abs(d.delayMinutes) <= delayThreshold).length,
        late: delays.filter(d => d.delayMinutes > delayThreshold).length
      },
      wasteTypeAccuracy: {}
    };

    // Calculate accuracy by waste type
    const wasteTypes = [...new Set(delays.map(d => d.wasteType))];
    wasteTypes.forEach(type => {
      const typeDelays = delays.filter(d => d.wasteType === type);
      const typeAccurate = typeDelays.filter(d => d.wasAccurate).length;
      statistics.wasteTypeAccuracy[type] = {
        total: typeDelays.length,
        accurate: typeAccurate,
        rate: (typeAccurate / typeDelays.length) * 100
      };
    });

    logger.info('ETA statistics calculated', {
      driverId,
      totalPickups: statistics.totalPickups,
      accuracyRate: statistics.accuracyRate
    });

    return {
      success: true,
      statistics,
      period: { startDate, endDate }
    };

  } catch (error) {
    logger.error('Error calculating ETA statistics:', error);
    throw error;
  }
};

module.exports = {
  calculateETA,
  updateETAForPickup,
  updateDriverETAs,
  calculateBufferTime,
  calculateConfidence,
  getETAStatistics
};