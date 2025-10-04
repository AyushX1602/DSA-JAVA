import axios from 'axios';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    Accept: 'application/json, text/plain, */*',
  },
});

// Attach bearer token from cookies (Jotai writes here)
axiosClient.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    const method = response.config.method.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || ''))
      toast.success(response.data.message);
    return response.data;
  },
  (error) => {
    toast.error(error.response.data.message || 'Error Occured!');
    return Promise.reject(error);
  },
);

export default axiosClient;
