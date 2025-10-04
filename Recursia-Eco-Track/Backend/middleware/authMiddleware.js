const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate JWT tokens
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header provided'
      });
    }

    // Check if header starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is active
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is suspended or inactive'
      });
    }

    // Add user and token data to request
    req.user = {
      id: user._id,
      role: user.role,
      ...decoded.user
    };

    // Add user document to request for convenience
    req.userDoc = user;

    // Log successful authentication
    logger.debug('User authenticated', {
      userId: user._id,
      role: user.role,
      endpoint: req.originalUrl
    });

    next();

  } catch (error) {
    logger.error('Authentication error:', {
      error: error.message,
      endpoint: req.originalUrl,
      ip: req.ip
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to authorize specific roles
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!roles.includes(req.user.role)) {
        logger.warn('Unauthorized access attempt', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: roles,
          endpoint: req.originalUrl
        });

        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      logger.debug('User authorized', {
        userId: req.user.id,
        role: req.user.role,
        endpoint: req.originalUrl
      });

      next();

    } catch (error) {
      logger.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  };
};

/**
 * Middleware to check if user owns the resource or is admin
 * @param {string} paramName - URL parameter name containing the resource owner ID
 */
const authorizeOwnerOrAdmin = (paramName = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const resourceOwnerId = req.params[paramName];
      const isOwner = req.user.id.toString() === resourceOwnerId;
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        logger.warn('Unauthorized resource access attempt', {
          userId: req.user.id,
          userRole: req.user.role,
          resourceOwnerId,
          endpoint: req.originalUrl
        });

        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      next();

    } catch (error) {
      logger.error('Owner/Admin authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  };
};

/**
 * Middleware to check driver status and availability
 */
const checkDriverStatus = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Driver access required'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Driver account is not active'
      });
    }

    // Add driver data to request
    req.driver = user;

    next();

  } catch (error) {
    logger.error('Driver status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Driver status check failed'
    });
  }
};

/**
 * Middleware to check admin permissions
 * @param {string} requiredPermission - Required permission module
 */
const checkAdminPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Admin profile not found'
        });
      }

      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Admin account is deactivated'
        });
      }

      // For simplified admin permissions, just check if user is admin
      // In future, can add more granular permissions to User model
      
      // Add admin data to request
      req.admin = user;

      next();

    } catch (error) {
      logger.error('Admin permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

/**
 * Middleware to validate pickup ownership
 */
const validatePickupOwnership = async (req, res, next) => {
  try {
    const pickupId = req.params.id || req.params.pickupId;
    
    if (!pickupId) {
      return res.status(400).json({
        success: false,
        message: 'Pickup ID required'
      });
    }

    const Pickup = require('../models/Pickup');
    const pickup = await Pickup.findById(pickupId);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Check ownership based on user role
    if (req.user.role === 'user') {
      if (pickup.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own pickups.'
        });
      }
    } else if (req.user.role === 'driver') {
      if (!pickup.driver || pickup.driver.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your assigned pickups.'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add pickup to request
    req.pickup = pickup;

    next();

  } catch (error) {
    logger.error('Pickup ownership validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Pickup validation failed'
    });
  }
};

/**
 * Middleware to log API requests
 */
const logRequest = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info('API Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    role: req.user?.role
  });

  // Log response when it finishes
  const oldSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    logger.info('API Response', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
      role: req.user?.role
    });

    oldSend.apply(this, arguments);
  };

  next();
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next(); // Continue without authentication
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (user && user.status === 'active') {
      req.user = {
        id: user._id,
        role: user.role,
        ...decoded.user
      };
      req.userDoc = user;
    }

    next();

  } catch (error) {
    // Don't fail on optional auth errors, just continue without user
    logger.debug('Optional auth failed (continuing without auth):', error.message);
    next();
  }
};

module.exports = {
  auth,
  authorize,
  authorizeOwnerOrAdmin,
  checkDriverStatus,
  checkAdminPermission,
  validatePickupOwnership,
  logRequest,
  optionalAuth
};