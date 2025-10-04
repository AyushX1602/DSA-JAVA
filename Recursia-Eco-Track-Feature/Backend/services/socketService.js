const logger = require('../utils/logger');

/**
 * Handle Socket.io connection and events
 * @param {Object} io - Socket.io server instance
 */
const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    logger.info('User connected', { socketId: socket.id });

    // Handle user authentication and room joining
    socket.on('authenticate', (data) => {
      try {
        const { userId, role, driverId, adminId } = data;
        
        // Store user information in socket
        socket.userId = userId;
        socket.role = role;
        socket.driverId = driverId;
        socket.adminId = adminId;

        // Join appropriate rooms based on role
        switch (role) {
          case 'user':
            socket.join(`user-${userId}`);
            logger.info('User joined user room', { userId, socketId: socket.id });
            break;
            
          case 'driver':
            socket.join(`driver-${driverId}`);
            socket.join('drivers-room');
            logger.info('Driver joined driver rooms', { driverId, socketId: socket.id });
            break;
            
          case 'admin':
            socket.join('admin-room');
            logger.info('Admin joined admin room', { adminId, socketId: socket.id });
            break;
        }

        socket.emit('authenticated', { 
          success: true, 
          message: 'Successfully authenticated',
          rooms: Array.from(socket.rooms)
        });

      } catch (error) {
        logger.error('Socket authentication error:', error);
        socket.emit('authentication-error', { 
          success: false, 
          message: 'Authentication failed' 
        });
      }
    });

    // Handle driver location updates
    socket.on('update-location', (data) => {
      try {
        if (socket.role !== 'driver') {
          socket.emit('error', { message: 'Unauthorized location update' });
          return;
        }

        const { latitude, longitude, heading, speed } = data;
        
        // Validate location data
        if (!latitude || !longitude || 
            Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
          socket.emit('error', { message: 'Invalid location coordinates' });
          return;
        }

        // Broadcast location update to admin
        socket.to('admin-room').emit('driver-location-update', {
          driverId: socket.driverId,
          location: { latitude, longitude, heading, speed },
          timestamp: new Date()
        });

        // Broadcast to users tracking this driver's pickups
        socket.broadcast.emit('driver-location-broadcast', {
          driverId: socket.driverId,
          location: { latitude, longitude },
          timestamp: new Date()
        });

        logger.debug('Driver location updated', { 
          driverId: socket.driverId, 
          location: { latitude, longitude } 
        });

      } catch (error) {
        logger.error('Error handling location update:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle pickup tracking subscription
    socket.on('track-pickup', (data) => {
      try {
        const { pickupId } = data;
        
        if (!pickupId) {
          socket.emit('error', { message: 'Pickup ID required' });
          return;
        }

        // Join pickup-specific room for real-time updates
        socket.join(`pickup-${pickupId}`);
        
        socket.emit('tracking-started', { 
          pickupId, 
          message: 'Now tracking pickup updates' 
        });

        logger.info('User started tracking pickup', { 
          userId: socket.userId, 
          pickupId 
        });

      } catch (error) {
        logger.error('Error starting pickup tracking:', error);
        socket.emit('error', { message: 'Failed to start tracking' });
      }
    });

    // Handle pickup tracking unsubscription
    socket.on('stop-tracking-pickup', (data) => {
      try {
        const { pickupId } = data;
        
        if (!pickupId) {
          socket.emit('error', { message: 'Pickup ID required' });
          return;
        }

        // Leave pickup-specific room
        socket.leave(`pickup-${pickupId}`);
        
        socket.emit('tracking-stopped', { 
          pickupId, 
          message: 'Stopped tracking pickup updates' 
        });

        logger.info('User stopped tracking pickup', { 
          userId: socket.userId, 
          pickupId 
        });

      } catch (error) {
        logger.error('Error stopping pickup tracking:', error);
        socket.emit('error', { message: 'Failed to stop tracking' });
      }
    });

    // Handle driver availability updates
    socket.on('update-availability', (data) => {
      try {
        if (socket.role !== 'driver') {
          socket.emit('error', { message: 'Unauthorized availability update' });
          return;
        }

        const { isAvailable } = data;
        
        // Broadcast availability change to admin
        socket.to('admin-room').emit('driver-availability-changed', {
          driverId: socket.driverId,
          isAvailable,
          timestamp: new Date()
        });

        logger.info('Driver availability updated', { 
          driverId: socket.driverId, 
          isAvailable 
        });

      } catch (error) {
        logger.error('Error handling availability update:', error);
        socket.emit('error', { message: 'Failed to update availability' });
      }
    });

    // Handle chat messages
    socket.on('send-message', (data) => {
      try {
        const { pickupId, message, messageType = 'text' } = data;
        
        if (!pickupId || !message) {
          socket.emit('error', { message: 'Pickup ID and message required' });
          return;
        }

        const messageData = {
          pickupId,
          from: socket.role,
          fromId: socket.userId,
          message,
          messageType,
          timestamp: new Date()
        };

        // Send to pickup-specific room and admin
        socket.to(`pickup-${pickupId}`).emit('new-message', messageData);
        socket.to('admin-room').emit('new-message', messageData);

        // Confirm message sent
        socket.emit('message-sent', { 
          success: true, 
          messageId: Date.now().toString() 
        });

        logger.info('Message sent', { 
          pickupId, 
          from: socket.role, 
          fromId: socket.userId 
        });

      } catch (error) {
        logger.error('Error handling message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle emergency alerts
    socket.on('emergency-alert', (data) => {
      try {
        const { pickupId, alertType, description, location } = data;
        
        const emergencyData = {
          pickupId,
          alertType,
          description,
          location,
          reportedBy: socket.role,
          reporterId: socket.userId,
          timestamp: new Date(),
          severity: 'high'
        };

        // Immediately notify all admins
        io.to('admin-room').emit('emergency-alert', emergencyData);
        
        // Notify other drivers in the area if location provided
        if (location) {
          socket.to('drivers-room').emit('area-emergency-alert', emergencyData);
        }

        socket.emit('emergency-reported', { 
          success: true, 
          message: 'Emergency alert sent to administrators' 
        });

        logger.warn('Emergency alert reported', emergencyData);

      } catch (error) {
        logger.error('Error handling emergency alert:', error);
        socket.emit('error', { message: 'Failed to send emergency alert' });
      }
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date() });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('User disconnected', { 
        socketId: socket.id, 
        userId: socket.userId, 
        role: socket.role,
        reason 
      });

      // Notify admin if driver disconnects
      if (socket.role === 'driver' && socket.driverId) {
        socket.to('admin-room').emit('driver-disconnected', {
          driverId: socket.driverId,
          timestamp: new Date(),
          reason
        });
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      logger.error('Socket error:', { 
        socketId: socket.id, 
        userId: socket.userId, 
        error: error.message 
      });
    });
  });

  // Handle server-side events
  io.engine.on('connection_error', (err) => {
    logger.error('Socket.io connection error:', {
      error: err.message,
      code: err.code,
      description: err.description,
      context: err.context,
      type: err.type
    });
  });

  logger.info('Socket.io server initialized');
};

/**
 * Emit location update to relevant rooms
 * @param {string} driverId - Driver ID
 * @param {Object} locationData - Location data
 */
const updateSocketLocation = async (driverId, locationData) => {
  try {
    const io = global.io; // Assuming io is stored globally
    
    if (!io) {
      logger.warn('Socket.io instance not available for location update');
      return;
    }

    const updateData = {
      driverId,
      location: locationData,
      timestamp: new Date()
    };

    // Emit to admin room
    io.to('admin-room').emit('driver-location-update', updateData);

    // Emit to users tracking related pickups
    io.emit('driver-location-broadcast', updateData);

    logger.debug('Location update broadcasted', { driverId });

  } catch (error) {
    logger.error('Error broadcasting location update:', error);
  }
};

/**
 * Emit pickup status update to relevant rooms
 * @param {string} pickupId - Pickup ID
 * @param {Object} statusData - Status update data
 */
const emitPickupStatusUpdate = async (pickupId, statusData) => {
  try {
    const io = global.io;
    
    if (!io) {
      logger.warn('Socket.io instance not available for status update');
      return;
    }

    const updateData = {
      pickupId,
      ...statusData,
      timestamp: new Date()
    };

    // Emit to pickup-specific room
    io.to(`pickup-${pickupId}`).emit('pickup-status-updated', updateData);

    // Emit to admin room
    io.to('admin-room').emit('pickup-status-updated', updateData);

    logger.info('Pickup status update broadcasted', { pickupId, status: statusData.status });

  } catch (error) {
    logger.error('Error broadcasting pickup status update:', error);
  }
};

/**
 * Emit ETA update to relevant rooms
 * @param {string} pickupId - Pickup ID
 * @param {Object} etaData - ETA data
 */
const emitETAUpdate = async (pickupId, etaData) => {
  try {
    const io = global.io;
    
    if (!io) {
      logger.warn('Socket.io instance not available for ETA update');
      return;
    }

    const updateData = {
      pickupId,
      eta: etaData,
      timestamp: new Date()
    };

    // Emit to pickup-specific room
    io.to(`pickup-${pickupId}`).emit('eta-updated', updateData);

    // Emit to admin room
    io.to('admin-room').emit('eta-updated', updateData);

    logger.debug('ETA update broadcasted', { pickupId });

  } catch (error) {
    logger.error('Error broadcasting ETA update:', error);
  }
};

/**
 * Send notification to specific user
 * @param {string} userId - User ID
 * @param {Object} notification - Notification data
 */
const sendUserNotification = async (userId, notification) => {
  try {
    const io = global.io;
    
    if (!io) {
      logger.warn('Socket.io instance not available for user notification');
      return;
    }

    const notificationData = {
      ...notification,
      timestamp: new Date(),
      id: Date.now().toString()
    };

    // Emit to user-specific room
    io.to(`user-${userId}`).emit('notification', notificationData);

    logger.info('User notification sent', { userId, type: notification.type });

  } catch (error) {
    logger.error('Error sending user notification:', error);
  }
};

/**
 * Send notification to specific driver
 * @param {string} driverId - Driver ID
 * @param {Object} notification - Notification data
 */
const sendDriverNotification = async (driverId, notification) => {
  try {
    const io = global.io;
    
    if (!io) {
      logger.warn('Socket.io instance not available for driver notification');
      return;
    }

    const notificationData = {
      ...notification,
      timestamp: new Date(),
      id: Date.now().toString()
    };

    // Emit to driver-specific room
    io.to(`driver-${driverId}`).emit('notification', notificationData);

    logger.info('Driver notification sent', { driverId, type: notification.type });

  } catch (error) {
    logger.error('Error sending driver notification:', error);
  }
};

/**
 * Broadcast system-wide announcement
 * @param {Object} announcement - Announcement data
 * @param {Array} targetRoles - Target roles (optional)
 */
const broadcastAnnouncement = async (announcement, targetRoles = ['user', 'driver', 'admin']) => {
  try {
    const io = global.io;
    
    if (!io) {
      logger.warn('Socket.io instance not available for announcement');
      return;
    }

    const announcementData = {
      ...announcement,
      timestamp: new Date(),
      id: Date.now().toString()
    };

    // Broadcast to specified roles
    if (targetRoles.includes('admin')) {
      io.to('admin-room').emit('announcement', announcementData);
    }
    
    if (targetRoles.includes('driver')) {
      io.to('drivers-room').emit('announcement', announcementData);
    }
    
    if (targetRoles.includes('user')) {
      // For users, we broadcast to all connected sockets
      // since we don't have a general users room
      io.emit('announcement', announcementData);
    }

    logger.info('System announcement broadcasted', { 
      targetRoles, 
      type: announcement.type 
    });

  } catch (error) {
    logger.error('Error broadcasting announcement:', error);
  }
};

module.exports = {
  handleSocketConnection,
  updateSocketLocation,
  emitPickupStatusUpdate,
  emitETAUpdate,
  sendUserNotification,
  sendDriverNotification,
  broadcastAnnouncement
};