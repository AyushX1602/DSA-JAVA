import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from cookies first, then localStorage as fallback
    const token = Cookies.get('auth-token') || localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear authentication data
      Cookies.remove('auth-token');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
      
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (email, password) => {
    try {
      console.log('📤 Making login request to:', api.defaults.baseURL + '/auth/login');
      console.log('📤 Request data:', { email, password: '***' });
      
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      console.log('📥 Raw response:', response);
      return response;
    } catch (error) {
      console.error('🚨 API login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response;
    } catch (error) {
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      return response;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// Pickup API calls
export const pickupAPI = {
  createRequest: async (requestData) => {
    try {
      const response = await api.post('/users/pickup/request', requestData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getUserPickups: async (page = 1, limit = 50) => {
    try {
      const response = await api.get(`/users/pickups?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  cancelPickup: async (pickupId) => {
    try {
      const response = await api.patch(`/users/pickup/${pickupId}/cancel`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  ratePickup: async (pickupId, rating, comment) => {
    try {
      const response = await api.post(`/users/pickup/${pickupId}/rate`, {
        rating,
        comment
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  trackPickup: async (pickupId) => {
    try {
      const response = await api.get(`/users/pickup/${pickupId}/track`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// User Profile API endpoints
export const profileAPI = {
  getUserProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// Notification API endpoints
export const notificationAPI = {
  getUserNotifications: async (page = 1, limit = 20, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      const response = await api.get(`/users/notifications?${params}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await api.patch(`/users/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.patch('/users/notifications/read-all');
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/users/notifications/${notificationId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteReadNotifications: async () => {
    try {
      const response = await api.delete('/users/notifications/cleanup');
      return response;
    } catch (error) {
      throw error;
    }
  },

  getSettings: async () => {
    try {
      const response = await api.get('/users/notifications/settings');
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// Driver API calls
export const driverAPI = {
  getAssignedPickups: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/drivers/pickups?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updatePickupStatus: async (pickupId, status, location = null) => {
    try {
      const response = await api.put(`/drivers/pickup/${pickupId}/status`, {
        status,
        location
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateLocation: async (location) => {
    try {
      const response = await api.put('/drivers/location', location);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateAvailability: async (availability) => {
    try {
      const response = await api.put('/drivers/availability', availability);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getRoute: async (pickupId) => {
    try {
      const response = await api.get(`/drivers/pickup/${pickupId}/route`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  reportIssue: async (issueData) => {
    try {
      const response = await api.post('/drivers/report-issue', issueData);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// Admin API calls
export const adminAPI = {
  getAnalytics: async (timeframe = '7d') => {
    try {
      const response = await api.get(`/admin/analytics?timeframe=${timeframe}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getAllPickups: async (page = 1, limit = 20, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters
      });
      const response = await api.get(`/admin/pickups?${queryParams}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getAllDrivers: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/admin/drivers?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getSystemAlerts: async () => {
    try {
      const response = await api.get('/admin/alerts');
      return response;
    } catch (error) {
      throw error;
    }
  },

  manageDriver: async (driverId, action, data = {}) => {
    try {
      const response = await api.patch(`/admin/drivers/${driverId}/${action}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  resolveDispute: async (pickupId, resolution) => {
    try {
      const response = await api.post(`/admin/pickups/${pickupId}/resolve`, {
        resolution
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getUsers: async (page = 1, limit = 20, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters
      });
      const response = await api.get(`/admin/users?${queryParams}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// AI/ML API calls
export const aiAPI = {
  classifyWaste: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post('/ai/classify-waste', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  analyzeWasteTrends: async (timeframe = '30d') => {
    try {
      const response = await api.get(`/ai/trends?timeframe=${timeframe}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  predictOptimalRoutes: async (driverId) => {
    try {
      const response = await api.get(`/ai/routes/optimize/${driverId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// ETA API calls
export const etaAPI = {
  calculateETA: async (driverLocation, pickupLocation) => {
    try {
      const response = await api.post('/eta/calculate', {
        driverLocation,
        pickupLocation
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateETA: async (pickupId, newETA) => {
    try {
      const response = await api.patch(`/eta/pickups/${pickupId}`, {
        estimatedArrival: newETA
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default api;
