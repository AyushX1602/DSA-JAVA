// API Response Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
};

// User Roles
const USER_ROLES = {
  USER: 'user',
  DRIVER: 'driver',
  ADMIN: 'admin'
};

// User Status
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
};

// Pickup Status
const PICKUP_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  EN_ROUTE: 'en-route',
  ARRIVED: 'arrived',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Pickup Priority Levels
const PICKUP_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Waste Types
const WASTE_TYPES = {
  ORGANIC: 'organic',
  RECYCLABLE: 'recyclable',
  HAZARDOUS: 'hazardous',
  ELECTRONIC: 'electronic',
  MIXED: 'mixed'
};

// Waste Sub-types
const WASTE_SUBTYPES = {
  ORGANIC: ['food_scraps', 'garden_waste', 'compostable'],
  RECYCLABLE: ['paper', 'plastic', 'glass', 'metal', 'cardboard'],
  HAZARDOUS: ['batteries', 'chemicals', 'paint', 'medical', 'oil'],
  ELECTRONIC: ['computers', 'phones', 'appliances', 'components'],
  MIXED: ['general', 'construction', 'bulky_items']
};

// Vehicle Types
const VEHICLE_TYPES = {
  CAR: 'car',
  VAN: 'van',
  TRUCK: 'truck',
  MOTORCYCLE: 'motorcycle'
};

// Driver Status
const DRIVER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_BREAK: 'on_break',
  OFF_DUTY: 'off_duty'
};

// Admin Permission Modules
const ADMIN_PERMISSIONS = {
  USER_MANAGEMENT: 'user_management',
  DRIVER_MANAGEMENT: 'driver_management',
  PICKUP_MANAGEMENT: 'pickup_management',
  ANALYTICS: 'analytics',
  SYSTEM_CONFIG: 'system_config',
  REPORTS: 'reports'
};

// Admin Roles
const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  ANALYST: 'analyst'
};

// Time Slots for Pickup Scheduling
const TIME_SLOTS = {
  MORNING: 'morning',     // 6:00 - 12:00
  AFTERNOON: 'afternoon', // 12:00 - 18:00
  EVENING: 'evening'      // 18:00 - 22:00
};

// Days of the Week
const DAYS_OF_WEEK = {
  SUNDAY: 'sunday',
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday'
};

// Communication Types
const COMMUNICATION_TYPES = {
  MESSAGE: 'message',
  CALL: 'call',
  EMAIL: 'email',
  SMS: 'sms',
  NOTIFICATION: 'notification',
  ISSUE: 'issue',
  UPDATE: 'update'
};

// Notification Types
const NOTIFICATION_TYPES = {
  PICKUP_ASSIGNED: 'pickup_assigned',
  PICKUP_STATUS_UPDATE: 'pickup_status_update',
  ETA_UPDATE: 'eta_update',
  DRIVER_ARRIVED: 'driver_arrived',
  PICKUP_COMPLETED: 'pickup_completed',
  PICKUP_CANCELLED: 'pickup_cancelled',
  PAYMENT_PROCESSED: 'payment_processed',
  RATING_REQUEST: 'rating_request',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  EMERGENCY_ALERT: 'emergency_alert'
};

// API Rate Limits (requests per window)
const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5             // 5 login attempts per window
  },
  API: {
    WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
    MAX_REQUESTS: 100           // 100 API calls per window
  },
  PICKUP_CREATE: {
    WINDOW_MS: 60 * 60 * 1000,  // 1 hour
    MAX_REQUESTS: 10            // 10 pickup requests per hour
  },
  LOCATION_UPDATE: {
    WINDOW_MS: 60 * 1000,       // 1 minute
    MAX_REQUESTS: 60            // 1 location update per second
  }
};

// File Upload Limits
const FILE_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,  // 5MB
  MAX_FILES: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain']
};

// Socket.io Events
const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  AUTHENTICATE: 'authenticate',
  
  // Pickup events
  PICKUP_CREATED: 'pickup-created',
  PICKUP_ASSIGNED: 'pickup-assigned',
  PICKUP_STATUS_UPDATED: 'pickup-status-updated',
  PICKUP_CANCELLED: 'pickup-cancelled',
  PICKUP_COMPLETED: 'pickup-completed',
  
  // Driver events
  DRIVER_LOCATION_UPDATE: 'driver-location-update',
  DRIVER_AVAILABILITY_CHANGED: 'driver-availability-changed',
  DRIVER_CONNECTED: 'driver-connected',
  DRIVER_DISCONNECTED: 'driver-disconnected',
  
  // ETA events
  ETA_UPDATED: 'eta-updated',
  ETA_CALCULATION_FAILED: 'eta-calculation-failed',
  
  // Communication events
  NEW_MESSAGE: 'new-message',
  MESSAGE_SENT: 'message-sent',
  
  // Emergency events
  EMERGENCY_ALERT: 'emergency-alert',
  EMERGENCY_RESOLVED: 'emergency-resolved',
  
  // System events
  SYSTEM_ANNOUNCEMENT: 'system-announcement',
  MAINTENANCE_MODE: 'maintenance-mode'
};

// Error Codes
const ERROR_CODES = {
  // Authentication errors
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Business logic errors
  PICKUP_ALREADY_ASSIGNED: 'PICKUP_ALREADY_ASSIGNED',
  DRIVER_NOT_AVAILABLE: 'DRIVER_NOT_AVAILABLE',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  
  // External service errors
  MAPBOX_API_ERROR: 'MAPBOX_API_ERROR',
  PAYMENT_SERVICE_ERROR: 'PAYMENT_SERVICE_ERROR',
  SMS_SERVICE_ERROR: 'SMS_SERVICE_ERROR',
  
  // System errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};

// Success Messages
const SUCCESS_MESSAGES = {
  USER_CREATED: 'User account created successfully',
  USER_UPDATED: 'User profile updated successfully',
  USER_DELETED: 'User account deleted successfully',
  
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_UPDATED: 'Password updated successfully',
  PASSWORD_RESET: 'Password reset successfully',
  
  PICKUP_CREATED: 'Pickup request created successfully',
  PICKUP_UPDATED: 'Pickup updated successfully',
  PICKUP_ASSIGNED: 'Pickup assigned to driver successfully',
  PICKUP_COMPLETED: 'Pickup completed successfully',
  PICKUP_CANCELLED: 'Pickup cancelled successfully',
  
  DRIVER_CREATED: 'Driver account created successfully',
  DRIVER_UPDATED: 'Driver profile updated successfully',
  LOCATION_UPDATED: 'Location updated successfully',
  AVAILABILITY_UPDATED: 'Availability updated successfully',
  
  ETA_CALCULATED: 'ETA calculated successfully',
  ROUTE_OPTIMIZED: 'Route optimized successfully',
  
  MESSAGE_SENT: 'Message sent successfully',
  NOTIFICATION_SENT: 'Notification sent successfully'
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Cache TTL (Time To Live) in seconds
const CACHE_TTL = {
  USER_SESSION: 24 * 60 * 60,      // 24 hours
  ETA_CALCULATION: 5 * 60,         // 5 minutes
  DRIVER_LOCATION: 2 * 60,         // 2 minutes
  ANALYTICS_DATA: 30 * 60,         // 30 minutes
  SYSTEM_CONFIG: 60 * 60           // 1 hour
};

// Database Collection Names
const COLLECTIONS = {
  USERS: 'users',
  DRIVERS: 'drivers',
  ADMINS: 'admins',
  PICKUPS: 'pickups',
  SESSIONS: 'sessions',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics'
};

// Regular Expressions for Validation
const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  PICKUP_ID: /^ECO\d{8}$/,
  DRIVER_ID: /^DRV\d{6}$/,
  ADMIN_ID: /^ADM\d{6}$/,
  COORDINATES: /^-?\d+\.?\d*$/,
  LICENSE_PLATE: /^[A-Z0-9\s\-]{3,15}$/i
};

// Distance and Weight Units
const UNITS = {
  DISTANCE: {
    METERS: 'm',
    KILOMETERS: 'km',
    MILES: 'mi'
  },
  WEIGHT: {
    GRAMS: 'g',
    KILOGRAMS: 'kg',
    POUNDS: 'lbs'
  },
  VOLUME: {
    LITERS: 'l',
    CUBIC_METERS: 'm3',
    GALLONS: 'gal'
  }
};

// Environment Variables Keys
const ENV_KEYS = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  MONGODB_URI: 'MONGODB_URI',
  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRE: 'JWT_EXPIRE',
  MAPBOX_ACCESS_TOKEN: 'MAPBOX_ACCESS_TOKEN',
  REDIS_URL: 'REDIS_URL',
  EMAIL_SERVICE_KEY: 'EMAIL_SERVICE_KEY',
  SMS_SERVICE_KEY: 'SMS_SERVICE_KEY',
  CLOUDINARY_CLOUD_NAME: 'CLOUDINARY_CLOUD_NAME',
  CLOUDINARY_API_KEY: 'CLOUDINARY_API_KEY',
  CLOUDINARY_API_SECRET: 'CLOUDINARY_API_SECRET'
};

module.exports = {
  HTTP_STATUS,
  USER_ROLES,
  USER_STATUS,
  PICKUP_STATUS,
  PICKUP_PRIORITY,
  WASTE_TYPES,
  WASTE_SUBTYPES,
  VEHICLE_TYPES,
  DRIVER_STATUS,
  ADMIN_PERMISSIONS,
  ADMIN_ROLES,
  TIME_SLOTS,
  DAYS_OF_WEEK,
  COMMUNICATION_TYPES,
  NOTIFICATION_TYPES,
  RATE_LIMITS,
  FILE_LIMITS,
  SOCKET_EVENTS,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  PAGINATION,
  CACHE_TTL,
  COLLECTIONS,
  REGEX_PATTERNS,
  UNITS,
  ENV_KEYS
};