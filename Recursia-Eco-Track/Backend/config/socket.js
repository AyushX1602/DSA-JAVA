const logger = require('../utils/logger');
const { updateDriverLocation, broadcastETAUpdate } = require('../services/socketService');

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    logger.info(`🔌 Socket connected: ${socket.id}`);

    // Driver joins driver room for receiving assignments
    socket.on('join-driver', (driverId) => {
      socket.join(`driver-${driverId}`);
      logger.info(`👨‍✈️ Driver ${driverId} joined room`);
    });

    // User joins pickup room for receiving updates
    socket.on('join-pickup', (pickupId) => {
      socket.join(`pickup-${pickupId}`);
      logger.info(`👤 User joined pickup room: ${pickupId}`);
    });

    // Admin joins admin room for system-wide updates
    socket.on('join-admin', (adminId) => {
      socket.join('admin-room');
      logger.info(`👑 Admin ${adminId} joined admin room`);
    });

    // Handle driver location updates
    socket.on('driver-location-update', async (data) => {
      try {
        const { driverId, latitude, longitude, heading, speed } = data;
        
        // Update driver location in database and broadcast
        await updateDriverLocation(driverId, {
          latitude,
          longitude,
          heading: heading || 0,
          speed: speed || 0,
          lastUpdated: new Date()
        });

        // Broadcast location update to relevant rooms
        socket.to(`driver-${driverId}`).emit('location-updated', {
          driverId,
          latitude,
          longitude,
          heading,
          speed,
          timestamp: new Date()
        });

        // Broadcast to admin room
        socket.to('admin-room').emit('driver-location-update', {
          driverId,
          latitude,
          longitude,
          heading,
          speed,
          timestamp: new Date()
        });

        logger.info(`📍 Location updated for driver ${driverId}`);

      } catch (error) {
        logger.error('Error updating driver location:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle ETA calculation requests
    socket.on('calculate-eta', async (data) => {
      try {
        const { pickupId, driverId } = data;
        
        // Calculate and broadcast ETA update
        await broadcastETAUpdate(io, pickupId, driverId);
        
      } catch (error) {
        logger.error('Error calculating ETA:', error);
        socket.emit('error', { message: 'Failed to calculate ETA' });
      }
    });

    // Handle pickup status updates
    socket.on('pickup-status-update', (data) => {
      const { pickupId, status, driverId, message } = data;
      
      // Broadcast to pickup room
      io.to(`pickup-${pickupId}`).emit('pickup-status-changed', {
        pickupId,
        status,
        driverId,
        message,
        timestamp: new Date()
      });

      // Broadcast to admin room
      io.to('admin-room').emit('pickup-status-update', {
        pickupId,
        status,
        driverId,
        message,
        timestamp: new Date()
      });

      logger.info(`📦 Pickup ${pickupId} status updated to: ${status}`);
    });

    // Handle driver status updates (online/offline/busy)
    socket.on('driver-status-update', (data) => {
      const { driverId, status } = data;
      
      // Broadcast to admin room
      io.to('admin-room').emit('driver-status-changed', {
        driverId,
        status,
        timestamp: new Date()
      });

      logger.info(`👨‍✈️ Driver ${driverId} status changed to: ${status}`);
    });

    // Handle emergency alerts
    socket.on('emergency-alert', (data) => {
      const { type, message, location, severity, driverId } = data;
      
      // Broadcast emergency alert to all admin users
      io.to('admin-room').emit('emergency-alert', {
        type,
        message,
        location,
        severity,
        driverId,
        timestamp: new Date()
      });

      logger.warn(`🚨 Emergency alert: ${message} from driver ${driverId}`);
    });

    // Handle chat messages between driver and admin
    socket.on('send-message', (data) => {
      const { from, to, message, pickupId } = data;
      
      // Send message to specific recipient
      io.to(`driver-${to}`).emit('receive-message', {
        from,
        message,
        pickupId,
        timestamp: new Date()
      });

      // Also send to admin room if sender is driver
      if (from.startsWith('driver-')) {
        io.to('admin-room').emit('receive-message', {
          from,
          message,
          pickupId,
          timestamp: new Date()
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Middleware for authentication (optional)
  io.use((socket, next) => {
    // Add JWT token verification here if needed
    // const token = socket.handshake.auth.token;
    // ... verify token logic
    next();
  });

  return io;
};

module.exports = {
  initializeSocket
};