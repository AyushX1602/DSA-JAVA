import axiosClient from '@/lib/axios-client';

export const signup = (payload) => axiosClient.post('/auth/signup', payload);
export const login = (payload) => axiosClient.post('/auth/login', payload);
export const me = () => axiosClient.get('/auth/me');
export const updateProfile = (payload) =>
  axiosClient.put('/auth/profile', payload);

export const forgotPasswordRequest = (payload) =>
  axiosClient.post('/auth/forgot-password/request', payload);
export const forgotPasswordVerify = (payload) =>
  axiosClient.post('/auth/forgot-password/verify', payload);
export const forgotPasswordReset = (payload) =>
  axiosClient.post('/auth/forgot-password/reset', payload);

export const authApi = {
  signup,
  login,
  me,
  updateProfile,
  forgotPasswordRequest,
  forgotPasswordVerify,
  forgotPasswordReset,
};
