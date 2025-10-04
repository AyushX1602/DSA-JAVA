import { useState, useEffect, useCallback } from 'react';

const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Default options
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
    ...options
  };

  useEffect(() => {
    // Check if geolocation is supported
    setIsSupported('geolocation' in navigator);
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!isSupported) {
      setError(new Error('Geolocation is not supported by this browser'));
      return;
    }

    setLoading(true);
    setError(null);

    const success = (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      setLocation({
        latitude,
        longitude,
        accuracy,
        timestamp: position.timestamp
      });
      setLoading(false);
    };

    const errorCallback = (err) => {
      let errorMessage = 'Unknown location error';
      
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user. Please enable location permissions.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable. Please check your GPS/network.';
          break;
        case err.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again.';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      
      setError(new Error(errorMessage));
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(success, errorCallback, defaultOptions);
  }, [isSupported, defaultOptions]);

  const watchPosition = useCallback(() => {
    if (!isSupported) {
      setError(new Error('Geolocation is not supported by this browser'));
      return null;
    }

    setLoading(true);
    setError(null);

    const success = (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      setLocation({
        latitude,
        longitude,
        accuracy,
        timestamp: position.timestamp
      });
      setLoading(false);
    };

    const errorCallback = (err) => {
      let errorMessage = 'Unknown location error';
      
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location permissions.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Location unavailable. Please check GPS/network.';
          break;
        case err.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      
      setError(new Error(errorMessage));
      setLoading(false);
    };

    const watchId = navigator.geolocation.watchPosition(
      success, 
      errorCallback, 
      defaultOptions
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isSupported, defaultOptions]);

  // Auto-get location on mount if requested
  useEffect(() => {
    if (options.immediate && isSupported) {
      getCurrentPosition();
    }
  }, [getCurrentPosition, isSupported, options.immediate]);

  // Format location for display
  const formatLocation = (decimals = 6) => {
    if (!location.latitude || !location.longitude) {
      return null;
    }
    
    return {
      latitude: Number(location.latitude.toFixed(decimals)),
      longitude: Number(location.longitude.toFixed(decimals)),
      display: `${location.latitude.toFixed(decimals)}, ${location.longitude.toFixed(decimals)}`,
      accuracy: location.accuracy ? `±${Math.round(location.accuracy)}m` : null
    };
  };

  // Get readable address from coordinates (reverse geocoding)
  const getAddressFromCoords = useCallback(async (lat, lng) => {
    try {
      // Using Mapbox Geocoding API for reverse geocoding
      const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      
      if (!mapboxToken) {
        // Only log in debug mode to reduce console noise
        if (import.meta.env.VITE_DEBUG_MODE === 'true') {
          console.info('ℹ️ Using coordinates as address (Mapbox not configured)');
        }
        return `📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=address`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
      
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }, []); // No dependencies needed for this function

  return {
    location,
    error,
    loading,
    isSupported,
    getCurrentPosition,
    watchPosition,
    formatLocation,
    getAddressFromCoords,
    hasLocation: !!(location.latitude && location.longitude)
  };
};

export default useGeolocation;
