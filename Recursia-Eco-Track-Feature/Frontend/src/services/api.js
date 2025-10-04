import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth-token') || localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth-token');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      return response;
    } catch (error) {
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

  getUserPickups: async (page = 1, limit = 10) => {
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
      const response = await api.patch(`/drivers/pickups/${pickupId}/status`, {
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
      const response = await api.patch('/drivers/location', location);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateStatus: async (status) => {
    try {
      const response = await api.patch('/drivers/status', { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getRoute: async (pickupId) => {
    try {
      const response = await api.get(`/drivers/pickups/${pickupId}/route`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  reportEmergency: async (emergencyData) => {
    try {
      const response = await api.post('/drivers/emergency', emergencyData);
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
      
      const response = await api.post('/classification/classify', formData, {
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

// Classification API calls
export const classificationAPI = {
  classifyImage: async (imageFile, metadata = {}) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      if (metadata.location) {
        formData.append('location', metadata.location);
      }
      
      if (metadata.description) {
        formData.append('description', metadata.description);
      }

      const response = await api.post('/classification/classify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for ML processing
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  getHistory: async (params = {}) => {
    try {
      const { page = 1, limit = 20, waste_type } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(waste_type && { waste_type })
      });

      const response = await api.get(`/classification/history?${queryParams}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/classification/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteClassification: async (publicId) => {
    try {
      const response = await api.delete(`/classification/${publicId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default api;
