const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      msg += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return msg;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
require('fs').mkdirSync(logsDir, { recursive: true });

// Define transports
const transports = [
  // Console transport for development
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
    handleExceptions: true,
    handleRejections: true
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: path.join(logsDir, 'app.log'),
    level: 'info',
    format: logFormat,
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    handleExceptions: true,
    handleRejections: true
  }),

  // File transport for error logs only
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    handleExceptions: true,
    handleRejections: true
  }),

  // File transport for API requests (if needed)
  new winston.transports.File({
    filename: path.join(logsDir, 'requests.log'),
    level: 'info',
    format: logFormat,
    maxsize: 10485760, // 10MB
    maxFiles: 3
  })
];

// Add daily rotate file transport in production
if (process.env.NODE_ENV === 'production') {
  const DailyRotateFile = require('winston-daily-rotate-file');
  
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      format: logFormat
    })
  );

  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: logFormat
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  defaultMeta: {
    service: 'ecotrack-api',
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  },
  transports,
  exitOnError: false
});

// Handle uncaught exceptions and unhandled rejections
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logsDir, 'exceptions.log'),
    format: logFormat
  })
);

logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(logsDir, 'rejections.log'),
    format: logFormat
  })
);

// Custom logging methods for specific use cases
logger.apiRequest = (req, res, responseTime) => {
  logger.info('API Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userId: req.user?.id,
    role: req.user?.role,
    requestId: req.id
  });
};

logger.apiError = (req, error, statusCode = 500) => {
  logger.error('API Error', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode,
    error: error.message,
    stack: error.stack,
    userId: req.user?.id,
    role: req.user?.role,
    requestId: req.id
  });
};

logger.security = (event, details = {}) => {
  logger.warn('Security Event', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.performance = (operation, duration, details = {}) => {
  logger.info('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.business = (event, details = {}) => {
  logger.info('Business Event', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.auth = (event, userId, details = {}) => {
  logger.info('Authentication Event', {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.pickup = (event, pickupId, details = {}) => {
  logger.info('Pickup Event', {
    event,
    pickupId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.driver = (event, driverId, details = {}) => {
  logger.info('Driver Event', {
    event,
    driverId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.system = (event, details = {}) => {
  logger.info('System Event', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Create a stream for Morgan HTTP request logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Utility function to create child logger with context
logger.child = (context) => {
  return {
    debug: (message, meta = {}) => logger.debug(message, { ...context, ...meta }),
    info: (message, meta = {}) => logger.info(message, { ...context, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { ...context, ...meta }),
    error: (message, meta = {}) => logger.error(message, { ...context, ...meta })
  };
};

// Add request ID middleware helper
logger.addRequestId = () => {
  return (req, res, next) => {
    req.id = Math.random().toString(36).substr(2, 9);
    next();
  };
};

// Log application startup
logger.system('Application starting', {
  nodeVersion: process.version,
  platform: process.platform,
  environment: process.env.NODE_ENV,
  pid: process.pid,
  memoryUsage: process.memoryUsage()
});

module.exports = logger;