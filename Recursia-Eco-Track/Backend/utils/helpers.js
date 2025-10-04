const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { REGEX_PATTERNS, WASTE_TYPES, PICKUP_STATUS } = require('./constants');

/**
 * Generate a unique pickup ID
 * Format: ECO + 8 digits (YYYYMMDD + sequential number)
 * @returns {string} - Unique pickup ID
 */
const generatePickupId = () => {
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ECO${dateString}${randomSuffix}`;
};

/**
 * Generate a unique driver ID
 * Format: DRV + 6 digits
 * @returns {string} - Unique driver ID
 */
const generateDriverId = () => {
  const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `DRV${randomNumber}`;
};

/**
 * Generate a unique admin ID
 * Format: ADM + 6 digits
 * @returns {string} - Unique admin ID
 */
const generateAdminId = () => {
  const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `ADM${randomNumber}`;
};

/**
 * Generate a secure random token
 * @param {number} length - Token length (default: 32)
 * @returns {string} - Random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - Comparison result
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Validation result
 */
const isValidEmail = (email) => {
  return REGEX_PATTERNS.EMAIL.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Validation result
 */
const isValidPhone = (phone) => {
  return REGEX_PATTERNS.PHONE.test(phone);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with details
 */
const validatePassword = (password) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!password || password.length < 6) {
    result.isValid = false;
    result.errors.push('Password must be at least 6 characters long');
  }

  if (!/(?=.*[a-z])/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one lowercase letter');
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one uppercase letter');
  }

  if (!/(?=.*\d)/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one number');
  }

  return result;
};

/**
 * Validate coordinates (latitude and longitude)
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {boolean} - Validation result
 */
const isValidCoordinates = (latitude, longitude) => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First point latitude
 * @param {number} lon1 - First point longitude
 * @param {number} lat2 - Second point latitude
 * @param {number} lon2 - Second point longitude
 * @returns {number} - Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees value
 * @returns {number} - Radians value
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Format date to ISO string in local timezone
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

/**
 * Get time difference in minutes
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time (default: now)
 * @returns {number} - Time difference in minutes
 */
const getTimeDifferenceInMinutes = (startTime, endTime = new Date()) => {
  return Math.round((endTime - startTime) / (1000 * 60));
};

/**
 * Check if time is within business hours
 * @param {Date} time - Time to check
 * @param {object} businessHours - Business hours object
 * @returns {boolean} - Whether time is within business hours
 */
const isWithinBusinessHours = (time, businessHours) => {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[time.getDay()];
  const currentHour = time.getHours();
  
  const dayHours = businessHours[dayName];
  if (!dayHours || !dayHours.isWorking) {
    return false;
  }
  
  const startHour = parseInt(dayHours.start.split(':')[0]);
  const endHour = parseInt(dayHours.end.split(':')[0]);
  
  return currentHour >= startHour && currentHour < endHour;
};

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Generate a random color hex code
 * @returns {string} - Random hex color
 */
const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

/**
 * Mask sensitive information in strings
 * @param {string} value - Value to mask
 * @param {number} visibleChars - Number of visible characters at start and end
 * @returns {string} - Masked string
 */
const maskSensitiveInfo = (value, visibleChars = 2) => {
  if (!value || value.length <= visibleChars * 2) {
    return '*'.repeat(value?.length || 0);
  }
  
  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  const middle = '*'.repeat(value.length - visibleChars * 2);
  
  return start + middle + end;
};

/**
 * Generate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {object} - Pagination metadata
 */
const generatePaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    currentPage: parseInt(page),
    totalPages,
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
};

/**
 * Convert object to query string
 * @param {object} obj - Object to convert
 * @returns {string} - Query string
 */
const objectToQueryString = (obj) => {
  return Object.keys(obj)
    .filter(key => obj[key] !== undefined && obj[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
};

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} - Cloned object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove undefined and null values from object
 * @param {object} obj - Object to clean
 * @returns {object} - Cleaned object
 */
const removeEmptyValues = (obj) => {
  const cleaned = {};
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined && obj[key] !== null) {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        const nestedCleaned = removeEmptyValues(obj[key]);
        if (Object.keys(nestedCleaned).length > 0) {
          cleaned[key] = nestedCleaned;
        }
      } else {
        cleaned[key] = obj[key];
      }
    }
  });
  
  return cleaned;
};

/**
 * Get the next status in pickup workflow
 * @param {string} currentStatus - Current pickup status
 * @returns {string|null} - Next status or null if terminal
 */
const getNextPickupStatus = (currentStatus) => {
  const statusFlow = {
    [PICKUP_STATUS.PENDING]: PICKUP_STATUS.ASSIGNED,
    [PICKUP_STATUS.ASSIGNED]: PICKUP_STATUS.EN_ROUTE,
    [PICKUP_STATUS.EN_ROUTE]: PICKUP_STATUS.ARRIVED,
    [PICKUP_STATUS.ARRIVED]: PICKUP_STATUS.IN_PROGRESS,
    [PICKUP_STATUS.IN_PROGRESS]: PICKUP_STATUS.COMPLETED
  };
  
  return statusFlow[currentStatus] || null;
};

/**
 * Check if pickup status transition is valid
 * @param {string} fromStatus - Current status
 * @param {string} toStatus - Target status
 * @returns {boolean} - Whether transition is valid
 */
const isValidStatusTransition = (fromStatus, toStatus) => {
  const validTransitions = {
    [PICKUP_STATUS.PENDING]: [PICKUP_STATUS.ASSIGNED, PICKUP_STATUS.CANCELLED],
    [PICKUP_STATUS.ASSIGNED]: [PICKUP_STATUS.EN_ROUTE, PICKUP_STATUS.CANCELLED],
    [PICKUP_STATUS.EN_ROUTE]: [PICKUP_STATUS.ARRIVED, PICKUP_STATUS.CANCELLED],
    [PICKUP_STATUS.ARRIVED]: [PICKUP_STATUS.IN_PROGRESS, PICKUP_STATUS.CANCELLED],
    [PICKUP_STATUS.IN_PROGRESS]: [PICKUP_STATUS.COMPLETED],
    [PICKUP_STATUS.COMPLETED]: [], // Terminal state
    [PICKUP_STATUS.CANCELLED]: []  // Terminal state
  };
  
  return validTransitions[fromStatus]?.includes(toStatus) || false;
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate a slug from a string
 * @param {string} text - Text to slugify
 * @returns {string} - Slug
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

/**
 * Get estimated carbon footprint saved by waste type
 * @param {string} wasteType - Type of waste
 * @param {number} weight - Weight in kg
 * @returns {number} - CO2 saved in kg
 */
const calculateCarbonFootprintSaved = (wasteType, weight) => {
  // Average CO2 savings per kg by waste type (approximate values)
  const carbonSavingFactors = {
    [WASTE_TYPES.ORGANIC]: 0.3,      // Composting vs landfill
    [WASTE_TYPES.RECYCLABLE]: 1.2,   // Recycling vs new production
    [WASTE_TYPES.ELECTRONIC]: 2.5,   // E-waste recycling
    [WASTE_TYPES.HAZARDOUS]: 0.8,    // Proper disposal vs environmental damage
    [WASTE_TYPES.MIXED]: 0.6         // Average mixed waste
  };
  
  const factor = carbonSavingFactors[wasteType] || 0.5;
  return Math.round(weight * factor * 100) / 100; // Round to 2 decimals
};

module.exports = {
  generatePickupId,
  generateDriverId,
  generateAdminId,
  generateToken,
  hashPassword,
  comparePassword,
  isValidEmail,
  isValidPhone,
  validatePassword,
  isValidCoordinates,
  calculateDistance,
  toRadians,
  formatDate,
  getTimeDifferenceInMinutes,
  isWithinBusinessHours,
  sanitizeInput,
  generateRandomColor,
  maskSensitiveInfo,
  generatePaginationMeta,
  objectToQueryString,
  deepClone,
  removeEmptyValues,
  getNextPickupStatus,
  isValidStatusTransition,
  formatFileSize,
  slugify,
  calculateCarbonFootprintSaved
};