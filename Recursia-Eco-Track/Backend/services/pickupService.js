const Pickup = require('../models/Pickup');
const Driver = require('../models/Driver');
const { calculateDistanceAndTime } = require('./mapbox');
const logger = require('../utils/logger');

/**
 * Find and assign the nearest available driver to a pickup
 * @param {string} pickupId - Pickup ID
 * @param {Object} options - Assignment options
 * @returns {Object} - Assignment result
 */
const assignNearestDriver = async (pickupId, options = {}) => {
  try {
    const { maxDistance = 50, preferredDriverTypes = [] } = options;

    const pickup = await Pickup.findById(pickupId);
    if (!pickup) {
      throw new Error('Pickup not found');
    }

    if (pickup.driver) {
      throw new Error('Pickup already has a driver assigned');
    }

    const pickupLocation = pickup.pickupLocation.coordinates;
    if (!pickupLocation || pickupLocation.length !== 2) {
      throw new Error('Invalid pickup location coordinates');
    }

    // Find available drivers
    const availableDrivers = await Driver.find({
      'availability.isAvailable': true,
      status: 'active',
      'currentLocation.coordinates': { $exists: true }
    }).populate('user', 'name phone');

    if (availableDrivers.length === 0) {
      throw new Error('No available drivers found');
    }

    // Calculate distances and find suitable drivers
    const driverCandidates = [];

    for (const driver of availableDrivers) {
      try {
        const driverLocation = driver.currentLocation.coordinates;
        if (!driverLocation || driverLocation.length !== 2) {
          continue;
        }

        // Calculate route to pickup location
        const routeData = await calculateDistanceAndTime(
          driverLocation,
          pickupLocation
        );

        if (routeData.success && routeData.distance <= maxDistance) {
          // Check driver suitability for waste type
          const suitabilityScore = calculateDriverSuitability(driver, pickup);
          
          driverCandidates.push({
            driver,
            distance: routeData.distance,
            duration: routeData.duration,
            suitabilityScore,
            overallScore: calculateOverallScore(routeData.distance, routeData.duration, suitabilityScore)
          });
        }
      } catch (routeError) {
        logger.warn(`Failed to calculate route for driver ${driver.driverId}:`, routeError);
        continue;
      }
    }

    if (driverCandidates.length === 0) {
      throw new Error(`No suitable drivers found within ${maxDistance}km radius`);
    }

    // Sort by overall score (lower is better)
    driverCandidates.sort((a, b) => a.overallScore - b.overallScore);

    // Apply driver type preferences if specified
    let selectedCandidate = driverCandidates[0];
    if (preferredDriverTypes.length > 0) {
      const preferredCandidate = driverCandidates.find(candidate => 
        preferredDriverTypes.includes(candidate.driver.vehicle.type)
      );
      if (preferredCandidate) {
        selectedCandidate = preferredCandidate;
      }
    }

    const selectedDriver = selectedCandidate.driver;

    // Assign the pickup to the selected driver
    await pickup.updateStatus('assigned', 'system', `Auto-assigned to nearest driver ${selectedDriver.driverId}`);
    pickup.driver = selectedDriver._id;
    pickup.assignedAt = new Date();
    await pickup.save();

    // Add assignment to driver
    await selectedDriver.acceptAssignment(pickupId);

    logger.info(`Pickup ${pickup.pickupId} assigned to driver ${selectedDriver.driverId}`, {
      distance: selectedCandidate.distance,
      duration: selectedCandidate.duration,
      suitabilityScore: selectedCandidate.suitabilityScore
    });

    return {
      success: true,
      assignedDriver: {
        id: selectedDriver._id,
        driverId: selectedDriver.driverId,
        name: selectedDriver.user.name,
        phone: selectedDriver.user.phone,
        vehicle: selectedDriver.vehicle,
        distance: selectedCandidate.distance,
        estimatedArrival: selectedCandidate.duration
      },
      alternativeDrivers: driverCandidates.slice(1, 4).map(candidate => ({
        driverId: candidate.driver.driverId,
        distance: candidate.distance,
        duration: candidate.duration
      }))
    };

  } catch (error) {
    logger.error(`Error assigning nearest driver for pickup ${pickupId}:`, error);
    throw error;
  }
};

/**
 * Reassign a pickup to a different driver
 * @param {string} pickupId - Pickup ID
 * @param {string} newDriverId - New driver ID
 * @param {string} reason - Reason for reassignment
 * @returns {Object} - Reassignment result
 */
const reassignPickup = async (pickupId, newDriverId, reason = 'Admin reassignment') => {
  try {
    const pickup = await Pickup.findById(pickupId)
      .populate('driver', 'driverId');

    if (!pickup) {
      throw new Error('Pickup not found');
    }

    const newDriver = await Driver.findById(newDriverId)
      .populate('user', 'name phone');

    if (!newDriver) {
      throw new Error('New driver not found');
    }

    if (!newDriver.availability.isAvailable) {
      throw new Error('New driver is not available');
    }

    const oldDriver = pickup.driver;

    // Remove from old driver if assigned
    if (oldDriver) {
      await Driver.findByIdAndUpdate(oldDriver._id, {
        $pull: { currentAssignments: { pickup: pickupId } }
      });
    }

    // Assign to new driver
    pickup.driver = newDriverId;
    pickup.assignedAt = new Date();
    await pickup.updateStatus('assigned', 'admin', reason);
    await pickup.save();

    // Add to new driver's assignments
    await newDriver.acceptAssignment(pickupId);

    logger.info(`Pickup ${pickup.pickupId} reassigned`, {
      from: oldDriver?.driverId || 'unassigned',
      to: newDriver.driverId,
      reason
    });

    return {
      success: true,
      message: 'Pickup reassigned successfully',
      assignment: {
        pickup: pickup.pickupId,
        oldDriver: oldDriver?.driverId || null,
        newDriver: newDriver.driverId,
        reason
      }
    };

  } catch (error) {
    logger.error(`Error reassigning pickup ${pickupId}:`, error);
    throw error;
  }
};

/**
 * Optimize routes for multiple pickups assigned to a driver
 * @param {string} driverId - Driver ID
 * @param {Array} pickupIds - Array of pickup IDs to optimize
 * @returns {Object} - Route optimization result
 */
const optimizeDriverRoute = async (driverId, pickupIds) => {
  try {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new Error('Driver not found');
    }

    const pickups = await Pickup.find({
      _id: { $in: pickupIds },
      driver: driverId,
      status: { $in: ['assigned', 'en-route'] }
    });

    if (pickups.length < 2) {
      throw new Error('At least 2 pickups required for route optimization');
    }

    const driverLocation = driver.currentLocation.coordinates;
    if (!driverLocation || driverLocation.length !== 2) {
      throw new Error('Driver location not available');
    }

    // Prepare coordinates for optimization
    const coordinates = [driverLocation]; // Start with driver location
    const pickupMap = new Map();

    pickups.forEach((pickup, index) => {
      const coords = pickup.pickupLocation.coordinates;
      if (coords && coords.length === 2) {
        coordinates.push(coords);
        pickupMap.set(index + 1, pickup); // +1 because driver location is at index 0
      }
    });

    if (coordinates.length < 3) { // Driver + at least 2 pickups
      throw new Error('Not enough valid pickup locations for optimization');
    }

    // Use Mapbox optimization (this would need the optimizeRoute function from mapbox service)
    const { optimizeRoute } = require('./mapbox');
    const optimizationResult = await optimizeRoute(coordinates, {
      source: 'first', // Start from driver location
      destination: 'any'
    });

    if (!optimizationResult.success) {
      throw new Error('Route optimization failed');
    }

    // Create optimized pickup sequence
    const optimizedSequence = [];
    optimizationResult.waypointOrder.slice(1).forEach(waypointIndex => { // Skip driver location
      const pickup = pickupMap.get(waypointIndex);
      if (pickup) {
        optimizedSequence.push({
          pickupId: pickup.pickupId,
          pickup: pickup._id,
          coordinates: pickup.pickupLocation.coordinates,
          address: pickup.pickupLocation.address,
          wasteType: pickup.wasteDetails.type,
          priority: pickup.priority
        });
      }
    });

    // Update driver's assignment order
    await Driver.findByIdAndUpdate(driverId, {
      $set: {
        'routeOptimization.currentRoute': optimizedSequence,
        'routeOptimization.optimizedAt': new Date(),
        'routeOptimization.totalDistance': optimizationResult.distance,
        'routeOptimization.estimatedDuration': optimizationResult.duration
      }
    });

    logger.info(`Route optimized for driver ${driver.driverId}`, {
      pickupCount: optimizedSequence.length,
      totalDistance: optimizationResult.distance,
      estimatedDuration: optimizationResult.duration
    });

    return {
      success: true,
      optimizedRoute: {
        driverId: driver.driverId,
        sequence: optimizedSequence,
        totalDistance: optimizationResult.distance,
        estimatedDuration: optimizationResult.duration,
        geometry: optimizationResult.geometry
      }
    };

  } catch (error) {
    logger.error(`Error optimizing route for driver ${driverId}:`, error);
    throw error;
  }
};

/**
 * Calculate driver suitability score for a pickup
 * @param {Object} driver - Driver document
 * @param {Object} pickup - Pickup document
 * @returns {number} - Suitability score (lower is better)
 */
const calculateDriverSuitability = (driver, pickup) => {
  let score = 0;

  // Vehicle capacity consideration
  const requiredCapacity = pickup.wasteDetails.estimatedWeight || 10;
  if (driver.vehicle.capacity < requiredCapacity) {
    score += 100; // Heavy penalty for insufficient capacity
  }

  // Vehicle type suitability for waste type
  const wasteTypeVehiclePreference = {
    'hazardous': ['truck'],
    'electronic': ['van', 'truck'],
    'organic': ['truck', 'van'],
    'recyclable': ['truck', 'van', 'car'],
    'mixed': ['truck', 'van']
  };

  const preferredVehicles = wasteTypeVehiclePreference[pickup.wasteDetails.type] || ['truck', 'van'];
  if (!preferredVehicles.includes(driver.vehicle.type)) {
    score += 20;
  }

  // Driver performance consideration
  if (driver.performance.rating < 4.0) {
    score += 10;
  }

  // Experience with waste type
  const experienceBonus = driver.performance.wasteTypeExperience?.[pickup.wasteDetails.type] || 0;
  score -= Math.min(experienceBonus * 2, 15); // Max 15 point bonus

  // Current workload
  const currentAssignments = driver.currentAssignments.length;
  score += currentAssignments * 5; // Penalty for being busy

  // Time of day consideration (driver's preferred working hours)
  const currentHour = new Date().getHours();
  const workingHours = driver.availability.workingHours;
  const today = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
  
  if (workingHours[today] && workingHours[today].isWorking) {
    const startHour = parseInt(workingHours[today].start.split(':')[0]);
    const endHour = parseInt(workingHours[today].end.split(':')[0]);
    
    if (currentHour < startHour || currentHour > endHour) {
      score += 25; // Penalty for outside working hours
    }
  }

  return Math.max(0, score);
};

/**
 * Calculate overall score combining distance, time, and suitability
 * @param {number} distance - Distance in km
 * @param {number} duration - Duration in minutes
 * @param {number} suitabilityScore - Driver suitability score
 * @returns {number} - Overall score (lower is better)
 */
const calculateOverallScore = (distance, duration, suitabilityScore) => {
  // Weighted combination of factors
  const distanceWeight = 0.4;
  const timeWeight = 0.3;
  const suitabilityWeight = 0.3;

  // Normalize distance (assuming max reasonable distance is 50km)
  const normalizedDistance = Math.min(distance / 50, 1) * 100;
  
  // Normalize time (assuming max reasonable time is 60 minutes)
  const normalizedTime = Math.min(duration / 60, 1) * 100;

  return (normalizedDistance * distanceWeight) + 
         (normalizedTime * timeWeight) + 
         (suitabilityScore * suitabilityWeight);
};

/**
 * Get pickup assignment statistics
 * @param {Object} options - Query options
 * @returns {Object} - Assignment statistics
 */
const getAssignmentStatistics = async (options = {}) => {
  try {
    const {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate = new Date(),
      driverId = null
    } = options;

    const matchQuery = {
      'scheduling.requestedAt': { $gte: startDate, $lte: endDate }
    };

    if (driverId) {
      matchQuery.driver = driverId;
    }

    const statistics = await Pickup.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalPickups: { $sum: 1 },
          autoAssigned: {
            $sum: {
              $cond: [
                { $regexMatch: { input: '$statusHistory.0.notes', regex: /auto-assigned/i } },
                1,
                0
              ]
            }
          },
          manuallyAssigned: {
            $sum: {
              $cond: [
                { $regexMatch: { input: '$statusHistory.0.notes', regex: /manually assigned/i } },
                1,
                0
              ]
            }
          },
          averageAssignmentTime: {
            $avg: {
              $subtract: ['$assignedAt', '$scheduling.requestedAt']
            }
          },
          completedPickups: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const result = statistics[0] || {
      totalPickups: 0,
      autoAssigned: 0,
      manuallyAssigned: 0,
      averageAssignmentTime: 0,
      completedPickups: 0
    };

    // Convert average assignment time from milliseconds to minutes
    result.averageAssignmentTimeMinutes = result.averageAssignmentTime ? 
      Math.round(result.averageAssignmentTime / (1000 * 60)) : 0;

    result.completionRate = result.totalPickups > 0 ? 
      (result.completedPickups / result.totalPickups) * 100 : 0;

    result.autoAssignmentRate = result.totalPickups > 0 ? 
      (result.autoAssigned / result.totalPickups) * 100 : 0;

    logger.info('Assignment statistics calculated', {
      period: { startDate, endDate },
      driverId,
      totalPickups: result.totalPickups
    });

    return {
      success: true,
      statistics: result,
      period: { startDate, endDate }
    };

  } catch (error) {
    logger.error('Error calculating assignment statistics:', error);
    throw error;
  }
};

module.exports = {
  assignNearestDriver,
  reassignPickup,
  optimizeDriverRoute,
  calculateDriverSuitability,
  calculateOverallScore,
  getAssignmentStatistics
};