import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.locationTrackingInterval = null;
    this.lastKnownLocation = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
        transports: ['websocket'],
        upgrade: true,
        withCredentials: true
      });

      this.socket.on('connect', () => {
        console.log('Connected to real-time server');
        this.isConnected = true;
        
        // Authenticate and join user-specific room based on stored user data
        const user = JSON.parse(localStorage.getItem('ecotrack_user') || '{}');
        if (user.id) {
          this.socket.emit('authenticate', {
            userId: user.id,
            role: user.role || 'user'
          });
        }
      });

      this.socket.on('authenticated', (data) => {
        console.log('Socket authenticated:', data);
      });

      this.socket.on('authentication-error', (data) => {
        console.error('Socket authentication failed:', data);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from real-time server');
        this.isConnected = false;
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }

    return this.socket;
  }

  disconnect() {
    // Stop location tracking
    this.stopLocationTracking();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Driver location tracking
  emitLocationUpdate(location) {
    if (this.socket && this.isConnected) {
      this.socket.emit('driver_location_update', {
        driverId: this.getCurrentUserId(),
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  onLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('driver_location_updated', callback);
    }
  }

  // ETA updates
  onETAUpdate(callback) {
    if (this.socket) {
      this.socket.on('eta_updated', callback);
    }
  }

  emitETARequest(pickupId, driverLocation, pickupLocation) {
    if (this.socket && this.isConnected) {
      this.socket.emit('request_eta_calculation', {
        pickupId,
        driverLocation,
        pickupLocation,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Auto-location tracking for drivers
  startLocationTracking(interval = 10000) { // 10 seconds default
    if (this.locationTrackingInterval) {
      this.stopLocationTracking();
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported by this browser');
      return null;
    }

    const trackLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          // Emit location update
          this.emitLocationUpdate(location);
          
          // Store last known location
          this.lastKnownLocation = location;
        },
        (error) => {
          console.error('Location tracking error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 5000
        }
      );
    };

    // Get initial location
    trackLocation();

    // Set up interval for regular updates
    this.locationTrackingInterval = setInterval(trackLocation, interval);

    return this.locationTrackingInterval;
  }

  stopLocationTracking() {
    if (this.locationTrackingInterval) {
      clearInterval(this.locationTrackingInterval);
      this.locationTrackingInterval = null;
    }
  }

  // Get last known location
  getLastKnownLocation() {
    return this.lastKnownLocation || null;
  }

  // Pickup status updates
  emitPickupStatusUpdate(pickupId, status) {
    if (this.socket && this.isConnected) {
      this.socket.emit('pickup_status_update', {
        pickupId,
        status,
        timestamp: new Date().toISOString()
      });
    }
  }

  onPickupStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('pickup_status_updated', callback);
    }
  }

  // New pickup assignments for drivers
  onNewPickupAssignment(callback) {
    if (this.socket) {
      this.socket.on('new_pickup_assigned', callback);
    }
  }

  // Admin notifications
  onSystemAlert(callback) {
    if (this.socket) {
      this.socket.on('system_alert', callback);
    }
  }

  onFraudDetection(callback) {
    if (this.socket) {
      this.socket.on('fraud_detected', callback);
    }
  }

  onSurgeDetection(callback) {
    if (this.socket) {
      this.socket.on('surge_detected', callback);
    }
  }

  // User notifications
  onPickupUpdate(callback) {
    if (this.socket) {
      this.socket.on('pickup_update', callback);
    }
  }

  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on('newNotification', callback);
    }
  }

  onNotificationRead(callback) {
    if (this.socket) {
      this.socket.on('notificationRead', callback);
    }
  }

  onAllNotificationsRead(callback) {
    if (this.socket) {
      this.socket.on('allNotificationsRead', callback);
    }
  }

  // Generic event listener method
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Utility methods
  getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('ecotrack_user') || '{}');
    return user.id || null;
  }

  joinDriverRoom(driverId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_driver_room', { driverId });
    }
  }

  joinAdminRoom() {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_admin_room');
    }
  }

  // Remove event listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  removeListener(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
