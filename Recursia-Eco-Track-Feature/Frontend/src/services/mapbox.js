// Mapbox service for maps, geocoding, and directions

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
const BASE_URL = 'https://api.mapbox.com';

class MapboxService {
  constructor() {
    this.token = MAPBOX_TOKEN;
    this.initialized = !!MAPBOX_TOKEN;
    
    if (!this.initialized && import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.info('ℹ️ Mapbox not configured - using fallback location services. Get your free token at: https://account.mapbox.com/access-tokens/');
    }
  }

  // Check if service is properly configured
  isConfigured() {
    return this.initialized;
  }

  // Geocoding: Convert address to coordinates
  async geocodeAddress(query) {
    if (!this.initialized) {
      throw new Error('Mapbox not configured');
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `${BASE_URL}/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${this.token}&limit=5`
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        results: data.features.map(feature => ({
          id: feature.id,
          place_name: feature.place_name,
          center: feature.center, // [lng, lat]
          bbox: feature.bbox,
          relevance: feature.relevance
        }))
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Reverse Geocoding: Convert coordinates to address
  async reverseGeocode(longitude, latitude) {
    if (!this.initialized) {
      throw new Error('Mapbox not configured');
    }

    try {
      const response = await fetch(
        `${BASE_URL}/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${this.token}&types=address`
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        address: data.features.length > 0 ? data.features[0].place_name : 'Address not found',
        features: data.features
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        success: false,
        error: error.message,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      };
    }
  }

  // Directions: Get route between two points
  async getDirections(origin, destination, profile = 'driving') {
    if (!this.initialized) {
      throw new Error('Mapbox not configured');
    }

    try {
      // origin and destination should be [lng, lat] arrays
      const originStr = `${origin[0]},${origin[1]}`;
      const destinationStr = `${destination[0]},${destination[1]}`;
      
      const response = await fetch(
        `${BASE_URL}/directions/v5/mapbox/${profile}/${originStr};${destinationStr}?access_token=${this.token}&geometries=geojson&steps=true&overview=full`
      );

      if (!response.ok) {
        throw new Error(`Directions failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        return {
          success: true,
          route: {
            distance: route.distance, // meters
            duration: route.duration, // seconds
            geometry: route.geometry,
            steps: route.legs[0]?.steps || [],
            // Calculated values
            distanceKm: (route.distance / 1000).toFixed(1),
            durationMinutes: Math.round(route.duration / 60),
            durationText: this.formatDuration(route.duration)
          }
        };
      } else {
        throw new Error('No route found');
      }
    } catch (error) {
      console.error('Directions error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Calculate ETA (Estimated Time of Arrival)
  async calculateETA(driverLocation, pickupLocation) {
    if (!this.initialized) {
      // Fallback calculation without Mapbox
      const distance = this.calculateStraightLineDistance(
        driverLocation[1], driverLocation[0],
        pickupLocation[1], pickupLocation[0]
      );
      
      // Assume average speed of 30 km/h in city
      const etaMinutes = Math.round((distance / 30) * 60);
      
      return {
        success: true,
        eta: {
          minutes: etaMinutes,
          text: `${etaMinutes} min (estimated)`,
          distance: `${distance.toFixed(1)} km`,
          method: 'straight_line'
        }
      };
    }

    try {
      const directions = await this.getDirections(driverLocation, pickupLocation);
      
      if (directions.success) {
        return {
          success: true,
          eta: {
            minutes: directions.route.durationMinutes,
            text: directions.route.durationText,
            distance: `${directions.route.distanceKm} km`,
            method: 'mapbox_directions'
          }
        };
      } else {
        throw new Error(directions.error);
      }
    } catch (error) {
      console.error('ETA calculation error:', error);
      
      // Fallback to straight-line calculation
      const distance = this.calculateStraightLineDistance(
        driverLocation[1], driverLocation[0],
        pickupLocation[1], pickupLocation[0]
      );
      
      const etaMinutes = Math.round((distance / 30) * 60);
      
      return {
        success: true,
        eta: {
          minutes: etaMinutes,
          text: `${etaMinutes} min (estimated)`,
          distance: `${distance.toFixed(1)} km`,
          method: 'fallback',
          error: error.message
        }
      };
    }
  }

  // Calculate straight-line distance between two points (fallback)
  calculateStraightLineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Format duration in seconds to readable text
  formatDuration(seconds) {
    const minutes = Math.round(seconds / 60);
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  }

  // Get map style URL
  getMapStyleUrl(style = 'streets-v11') {
    return `mapbox://styles/mapbox/${style}`;
  }

  // Generate static map URL
  getStaticMapUrl(options = {}) {
    const {
      longitude,
      latitude,
      zoom = 14,
      width = 400,
      height = 300,
      markers = [],
      style = 'streets-v11'
    } = options;

    if (!this.initialized) {
      return null;
    }

    let url = `${BASE_URL}/styles/v1/mapbox/${style}/static/`;
    
    // Add markers
    if (markers.length > 0) {
      const markerString = markers.map(marker => {
        const { lng, lat, color = 'red', size = 'medium' } = marker;
        return `pin-${size}-${color}(${lng},${lat})`;
      }).join(',');
      url += `${markerString}/`;
    }
    
    url += `${longitude},${latitude},${zoom}/${width}x${height}@2x?access_token=${this.token}`;
    
    return url;
  }

  // Batch geocoding for multiple addresses
  async batchGeocode(addresses) {
    const results = await Promise.allSettled(
      addresses.map(address => this.geocodeAddress(address))
    );

    return results.map((result, index) => ({
      address: addresses[index],
      success: result.status === 'fulfilled' && result.value.success,
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : 
             (result.value?.success === false ? result.value.error : null)
    }));
  }

  // Get optimized route for multiple stops (for driver route optimization)
  async getOptimizedRoute(stops, origin = null) {
    if (!this.initialized) {
      throw new Error('Mapbox not configured');
    }

    if (stops.length < 2) {
      throw new Error('At least 2 stops required for route optimization');
    }

    try {
      // Format coordinates for Mapbox Optimization API
      let coordinates = stops.map(stop => `${stop[0]},${stop[1]}`).join(';');
      
      if (origin) {
        coordinates = `${origin[0]},${origin[1]};${coordinates}`;
      }

      const response = await fetch(
        `${BASE_URL}/optimized-trips/v1/mapbox/driving/${coordinates}?access_token=${this.token}&source=first&destination=any&roundtrip=false`
      );

      if (!response.ok) {
        throw new Error(`Route optimization failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        optimizedRoute: data.trips[0],
        waypoints: data.waypoints
      };
    } catch (error) {
      console.error('Route optimization error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const mapboxService = new MapboxService();

export default mapboxService;
