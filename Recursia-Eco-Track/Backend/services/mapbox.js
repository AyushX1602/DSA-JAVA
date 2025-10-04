const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Calculate distance and time between two coordinates using Mapbox Directions API
 * @param {Array} origin - [longitude, latitude] of origin
 * @param {Array} destination - [longitude, latitude] of destination
 * @param {Object} options - Additional options for the request
 * @returns {Object} - Route data including distance, duration, and route geometry
 */
const calculateDistanceAndTime = async (origin, destination, options = {}) => {
  try {
    const {
      includeSteps = false,
      includeGeometry = false,
      profile = 'driving-traffic'
    } = options;

    // Validate coordinates
    if (!Array.isArray(origin) || origin.length !== 2 ||
        !Array.isArray(destination) || destination.length !== 2) {
      throw new Error('Invalid coordinates provided');
    }

    // Validate longitude/latitude ranges
    if (Math.abs(origin[0]) > 180 || Math.abs(origin[1]) > 90 ||
        Math.abs(destination[0]) > 180 || Math.abs(destination[1]) > 90) {
      throw new Error('Coordinates out of valid range');
    }

    const coordinates = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
    
    // Build URL parameters
    const params = new URLSearchParams({
      access_token: process.env.MAPBOX_ACCESS_TOKEN,
      geometries: 'geojson',
      overview: 'full',
      annotations: 'duration,distance,speed'
    });

    if (includeSteps) {
      params.append('steps', 'true');
    }

    if (includeGeometry) {
      params.append('geometries', 'geojson');
    }

    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?${params}`;

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'EcoTrack/1.0.0'
      }
    });

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error('No route found between the specified coordinates');
    }

    const route = response.data.routes[0];
    
    // Extract route data
    const routeData = {
      distance: Math.round(route.distance / 1000 * 100) / 100, // Convert to km, round to 2 decimals
      duration: Math.round(route.duration / 60), // Convert to minutes
      geometry: includeGeometry ? route.geometry : null,
      steps: includeSteps ? route.legs[0]?.steps || [] : null,
      waypoints: response.data.waypoints
    };

    // Add traffic information if available
    if (route.duration_traffic) {
      routeData.durationWithTraffic = Math.round(route.duration_traffic / 60);
      routeData.trafficDelay = routeData.durationWithTraffic - routeData.duration;
    }

    logger.info(`Route calculated: ${routeData.distance}km, ${routeData.duration}min`, {
      origin,
      destination,
      profile
    });

    return {
      success: true,
      ...routeData
    };

  } catch (error) {
    logger.error('Error calculating route:', {
      error: error.message,
      origin,
      destination,
      stack: error.stack
    });

    // Handle specific Mapbox errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      if (status === 401) {
        throw new Error('Invalid Mapbox access token');
      } else if (status === 422) {
        throw new Error('Invalid coordinates or route not possible');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded for Mapbox API');
      }

      throw new Error(`Mapbox API error: ${message}`);
    }

    throw new Error(`Route calculation failed: ${error.message}`);
  }
};

/**
 * Get coordinates from an address using Mapbox Geocoding API
 * @param {string} address - Address to geocode
 * @returns {Object} - Geocoding result with coordinates
 */
const geocodeAddress = async (address) => {
  try {
    if (!address || typeof address !== 'string') {
      throw new Error('Valid address string is required');
    }

    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json`;

    const params = new URLSearchParams({
      access_token: process.env.MAPBOX_ACCESS_TOKEN,
      limit: 5,
      types: 'address,poi'
    });

    const response = await axios.get(`${url}?${params}`, {
      timeout: 8000,
      headers: {
        'User-Agent': 'EcoTrack/1.0.0'
      }
    });

    if (!response.data.features || response.data.features.length === 0) {
      throw new Error('No results found for the provided address');
    }

    const results = response.data.features.map(feature => ({
      coordinates: feature.center, // [longitude, latitude]
      formattedAddress: feature.place_name,
      relevance: feature.relevance,
      context: feature.context || []
    }));

    logger.info(`Geocoded address: ${address}`, {
      resultCount: results.length,
      topResult: results[0]?.formattedAddress
    });

    return {
      success: true,
      results
    };

  } catch (error) {
    logger.error('Error geocoding address:', {
      error: error.message,
      address,
      stack: error.stack
    });

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      if (status === 401) {
        throw new Error('Invalid Mapbox access token');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded for Mapbox API');
      }

      throw new Error(`Mapbox Geocoding API error: ${message}`);
    }

    throw new Error(`Geocoding failed: ${error.message}`);
  }
};

/**
 * Reverse geocode coordinates to get address
 * @param {Array} coordinates - [longitude, latitude]
 * @returns {Object} - Reverse geocoding result
 */
const reverseGeocode = async (coordinates) => {
  try {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      throw new Error('Valid coordinates array [longitude, latitude] is required');
    }

    const [longitude, latitude] = coordinates;
    
    if (Math.abs(longitude) > 180 || Math.abs(latitude) > 90) {
      throw new Error('Coordinates out of valid range');
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`;

    const params = new URLSearchParams({
      access_token: process.env.MAPBOX_ACCESS_TOKEN,
      types: 'address,poi'
    });

    const response = await axios.get(`${url}?${params}`, {
      timeout: 8000,
      headers: {
        'User-Agent': 'EcoTrack/1.0.0'
      }
    });

    if (!response.data.features || response.data.features.length === 0) {
      throw new Error('No address found for the provided coordinates');
    }

    const feature = response.data.features[0];
    
    const result = {
      formattedAddress: feature.place_name,
      coordinates: feature.center,
      addressComponents: {
        streetNumber: null,
        streetName: null,
        neighborhood: null,
        city: null,
        region: null,
        country: null,
        postalCode: null
      }
    };

    // Extract address components from context
    if (feature.context) {
      feature.context.forEach(component => {
        const [type] = component.id.split('.');
        switch (type) {
          case 'neighborhood':
            result.addressComponents.neighborhood = component.text;
            break;
          case 'place':
            result.addressComponents.city = component.text;
            break;
          case 'region':
            result.addressComponents.region = component.text;
            break;
          case 'country':
            result.addressComponents.country = component.text;
            break;
          case 'postcode':
            result.addressComponents.postalCode = component.text;
            break;
        }
      });
    }

    // Extract street info from properties
    if (feature.properties) {
      result.addressComponents.streetNumber = feature.properties.address;
    }

    logger.info(`Reverse geocoded coordinates: [${longitude}, ${latitude}]`, {
      address: result.formattedAddress
    });

    return {
      success: true,
      result
    };

  } catch (error) {
    logger.error('Error reverse geocoding:', {
      error: error.message,
      coordinates,
      stack: error.stack
    });

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      if (status === 401) {
        throw new Error('Invalid Mapbox access token');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded for Mapbox API');
      }

      throw new Error(`Mapbox Reverse Geocoding API error: ${message}`);
    }

    throw new Error(`Reverse geocoding failed: ${error.message}`);
  }
};

/**
 * Get route optimization for multiple destinations
 * @param {Array} coordinates - Array of [longitude, latitude] arrays
 * @param {Object} options - Optimization options
 * @returns {Object} - Optimized route data
 */
const optimizeRoute = async (coordinates, options = {}) => {
  try {
    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      throw new Error('At least 2 coordinates are required for route optimization');
    }

    if (coordinates.length > 25) {
      throw new Error('Maximum 25 waypoints allowed for route optimization');
    }

    const {
      source = 'first',
      destination = 'last',
      profile = 'driving-traffic'
    } = options;

    const coordinateString = coordinates
      .map(coord => `${coord[0]},${coord[1]}`)
      .join(';');

    const params = new URLSearchParams({
      access_token: process.env.MAPBOX_ACCESS_TOKEN,
      source,
      destination,
      geometries: 'geojson',
      overview: 'full'
    });

    const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/${profile}/${coordinateString}?${params}`;

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'EcoTrack/1.0.0'
      }
    });

    if (!response.data.trips || response.data.trips.length === 0) {
      throw new Error('No optimized route found');
    }

    const trip = response.data.trips[0];
    
    const optimizedRoute = {
      distance: Math.round(trip.distance / 1000 * 100) / 100, // Convert to km
      duration: Math.round(trip.duration / 60), // Convert to minutes
      geometry: trip.geometry,
      waypoints: response.data.waypoints,
      waypointOrder: response.data.waypoints.map(wp => wp.waypoint_index)
    };

    logger.info(`Route optimized for ${coordinates.length} waypoints`, {
      distance: optimizedRoute.distance,
      duration: optimizedRoute.duration
    });

    return {
      success: true,
      ...optimizedRoute
    };

  } catch (error) {
    logger.error('Error optimizing route:', {
      error: error.message,
      coordinateCount: coordinates.length,
      stack: error.stack
    });

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      if (status === 401) {
        throw new Error('Invalid Mapbox access token');
      } else if (status === 422) {
        throw new Error('Invalid coordinates for route optimization');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded for Mapbox API');
      }

      throw new Error(`Mapbox Optimization API error: ${message}`);
    }

    throw new Error(`Route optimization failed: ${error.message}`);
  }
};

module.exports = {
  calculateDistanceAndTime,
  geocodeAddress,
  reverseGeocode,
  optimizeRoute
};