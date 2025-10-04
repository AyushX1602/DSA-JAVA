const logger = require('../utils/logger');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error Handler:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value for field: ${field}`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = { message: messages.join(', '), statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = { message, statusCode: 400 };
  }

  // Rate limit errors
  if (err.statusCode === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
};

/**
 * Handle 404 errors for unknown routes
 */
const notFound = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  
  logger.warn('Route not found', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    success: false,
    message
  });
};

/**
 * Async error wrapper to catch async function errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle unhandled promise rejections
 */
const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (err, promise) => {
    logger.error('Unhandled Promise Rejection:', {
      error: err.message,
      stack: err.stack,
      promise
    });

    // Close server & exit process
    process.exit(1);
  });
};

/**
 * Handle uncaught exceptions
 */
const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', {
      error: err.message,
      stack: err.stack
    });

    process.exit(1);
  });
};

/**
 * Graceful shutdown handler
 */
const handleShutdown = (server) => {
  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully`);
    
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

/**
 * Validation error formatter
 */
const formatValidationErrors = (errors) => {
  return errors.map(error => ({
    field: error.param,
    message: error.msg,
    value: error.value,
    location: error.location
  }));
};

/**
 * Database error handler
 */
const handleDatabaseError = (err) => {
  let message = 'Database operation failed';
  let statusCode = 500;

  // Connection errors
  if (err.code === 'ECONNREFUSED') {
    message = 'Database connection refused';
    statusCode = 503;
  }

  // Timeout errors
  if (err.code === 'ETIMEDOUT') {
    message = 'Database operation timed out';
    statusCode = 504;
  }

  // Authentication errors
  if (err.code === 18) { // MongoDB auth failed
    message = 'Database authentication failed';
    statusCode = 500;
  }

  return { message, statusCode };
};

/**
 * Rate limiting error response
 */
const rateLimitHandler = (req, res) => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  res.status(429).json({
    success: false,
    message: 'Too many requests from this IP, please try again later',
    retryAfter: Math.round(req.rateLimit.resetTime / 1000)
  });
};

/**
 * CORS error handler
 */
const corsErrorHandler = (err, req, res, next) => {
  if (err && err.code === 'EBADCSRFTOKEN') {
    logger.warn('CSRF token mismatch', {
      ip: req.ip,
      url: req.originalUrl,
      userAgent: req.get('User-Agent')
    });

    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }

  next(err);
};

/**
 * Handle specific operational errors
 */
const handleOperationalError = (err) => {
  // File system errors
  if (err.code === 'ENOENT') {
    return {
      message: 'File not found',
      statusCode: 404
    };
  }

  if (err.code === 'EACCES') {
    return {
      message: 'Permission denied',
      statusCode: 403
    };
  }

  // Network errors
  if (err.code === 'ENOTFOUND') {
    return {
      message: 'Network service not found',
      statusCode: 503
    };
  }

  if (err.code === 'ECONNRESET') {
    return {
      message: 'Connection was reset',
      statusCode: 502
    };
  }

  return null;
};

/**
 * Development error response (detailed)
 */
const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack,
    request: {
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    }
  });
};

/**
 * Production error response (sanitized)
 */
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('Unknown error:', err);

    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  AppError,
  handleUnhandledRejection,
  handleUncaughtException,
  handleShutdown,
  formatValidationErrors,
  handleDatabaseError,
  rateLimitHandler,
  corsErrorHandler,
  handleOperationalError,
  sendErrorDev,
  sendErrorProd
};