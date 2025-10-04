import { useState, useEffect, useCallback } from 'react';
import mapboxService from '../services/mapbox';
import socketService from '../services/socket';

const useETA = (pickupId, driverLocation, pickupLocation) => {
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateETA = useCallback(async () => {
    if (!driverLocation || !pickupLocation) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await mapboxService.calculateETA(
        [driverLocation.longitude, driverLocation.latitude],
        [pickupLocation.longitude, pickupLocation.latitude]
      );

      if (result.success) {
        setEta(result.eta);
        
        // Emit ETA update via socket for real-time updates
        if (pickupId) {
          socketService.emitETARequest(
            pickupId,
            [driverLocation.longitude, driverLocation.latitude],
            [pickupLocation.longitude, pickupLocation.latitude]
          );
        }
      } else {
        throw new Error(result.error || 'ETA calculation failed');
      }
    } catch (err) {
      console.error('ETA calculation error:', err);
      setError(err.message);
      
      // Fallback to straight-line calculation
      const distance = mapboxService.calculateStraightLineDistance(
        driverLocation.latitude, driverLocation.longitude,
        pickupLocation.latitude, pickupLocation.longitude
      );
      
      const etaMinutes = Math.round((distance / 30) * 60); // Assume 30 km/h average speed
      
      setEta({
        minutes: etaMinutes,
        text: `${etaMinutes} min (estimated)`,
        distance: `${distance.toFixed(1)} km`,
        method: 'fallback'
      });
    } finally {
      setLoading(false);
    }
  }, [driverLocation, pickupLocation, pickupId]);

  // Auto-calculate ETA when locations change
  useEffect(() => {
    if (driverLocation && pickupLocation) {
      calculateETA();
    }
  }, [calculateETA]);

  // Listen for ETA updates from socket
  useEffect(() => {
    if (pickupId) {
      const handleETAUpdate = (data) => {
        if (data.pickupId === pickupId) {
          setEta(data.eta);
        }
      };

      socketService.onETAUpdate(handleETAUpdate);

      return () => {
        socketService.removeListener('eta_updated');
      };
    }
  }, [pickupId]);

  return {
    eta,
    loading,
    error,
    calculateETA,
    hasETA: !!eta
  };
};

export default useETA;
