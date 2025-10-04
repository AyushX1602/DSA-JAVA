const axios = require('axios');
const logger = require('../utils/logger');

class MapboxClient {
  constructor() {
    this.accessToken = process.env.MAPBOX_ACCESS_TOKEN;
    this.baseURL = 'https://api.mapbox.com';
    
    if (!this.accessToken) {
      logger.warn('⚠️ Mapbox access token not found in environment variables');
    }
  }

  /**
   * Get directions between two points
   * @param {Object} origin - {longitude, latitude}
   * @param {Object} destination - {longitude, latitude}
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Directions response
   */
  async getDirections(origin, destination, options = {}) {
    try {
      const {
        profile = 'driving', // driving, walking, cycling, driving-traffic
        geometries = 'geojson',
        overview = 'full',
        steps = true,
        annotations = 'duration,distance,speed'
      } = options;

      const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
      
      const url = `${this.baseURL}/directions/v5/mapbox/${profile}/${coordinates}`;
      
      const params = {
        access_token: this.accessToken,
        geometries,
        overview,
        steps,
        annotations
      };

      const response = await axios.get(url, { params });
      
      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        
        return {
          success: true,
          duration: route.duration, // in seconds
          distance: route.distance, // in meters
          geometry: route.geometry,
          steps: route.legs[0]?.steps || [],
          eta: this.calculateETA(route.duration),
          route: route
        };
      } else {
        throw new Error('No routes found');
      }

    } catch (error) {
      logger.error('Mapbox Directions API error:', error.message);
      return {
        success: false,
        error: error.message,
        duration: null,
        distance: null,
        eta: null
      };
    }
  }

  /**
   * Get driving directions with real-time traffic
   * @param {Object} origin 
   * @param {Object} destination 
   * @returns {Promise<Object>}
   */
  async getDrivingDirections(origin, destination) {
    return this.getDirections(origin, destination, {
      profile: 'driving-traffic',
      annotations: 'duration,distance,speed,congestion'
    });
  }

  /**
   * Geocode an address to coordinates
   * @param {string} address 
   * @returns {Promise<Object>}
   */
  async geocodeAddress(address) {
    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `${this.baseURL}/geocoding/v5/mapbox.places/${encodedAddress}.json`;
      
      const params = {
        access_token: this.accessToken,
        limit: 1,
        types: 'address,poi'
      };

      const response = await axios.get(url, { params });
      
      if (response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        const [longitude, latitude] = feature.center;
        
        return {
          success: true,
          coordinates: { longitude, latitude },
          placeName: feature.place_name,
          address: feature.properties.address || '',
          confidence: feature.relevance
        };
      } else {
        throw new Error('Address not found');
      }

    } catch (error) {
      logger.error('Mapbox Geocoding API error:', error.message);
      return {
        success: false,
        error: error.message,
        coordinates: null
      };
    }
  }

  /**
   * Reverse geocode coordinates to address
   * @param {number} longitude 
   * @param {number} latitude 
   * @returns {Promise<Object>}
   */
  async reverseGeocode(longitude, latitude) {
    try {
      const url = `${this.baseURL}/geocoding/v5/mapbox.places/${longitude},${latitude}.json`;
      
      const params = {
        access_token: this.accessToken,
        types: 'address'
      };

      const response = await axios.get(url, { params });
      
      if (response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        
        return {
          success: true,
          address: feature.place_name,
          streetAddress: feature.properties.address || '',
          confidence: feature.relevance
        };
      } else {
        throw new Error('Address not found for coordinates');
      }

    } catch (error) {
      logger.error('Mapbox Reverse Geocoding API error:', error.message);
      return {
        success: false,
        error: error.message,
        address: null
      };
    }
  }

  /**
   * Calculate estimated arrival time
   * @param {number} durationInSeconds 
   * @returns {Object}
   */
  calculateETA(durationInSeconds) {
    const now = new Date();
    const eta = new Date(now.getTime() + (durationInSeconds * 1000));
    
    const minutes = Math.ceil(durationInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    let timeText = '';
    if (hours > 0) {
      timeText = `${hours}h ${remainingMinutes}m`;
    } else {
      timeText = `${minutes}m`;
    }
    
    return {
      estimatedArrival: eta,
      durationSeconds: durationInSeconds,
      durationMinutes: minutes,
      timeText: timeText,
      formattedTime: eta.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }

  /**
   * Calculate distance between two points (Haversine formula)
   * @param {Object} point1 - {latitude, longitude}
   * @param {Object} point2 - {latitude, longitude}
   * @returns {number} Distance in meters
   */
  calculateDistance(point1, point2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.latitude * Math.PI / 180;
    const φ2 = point2.latitude * Math.PI / 180;
    const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
    const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
}

module.exports = new MapboxClient();