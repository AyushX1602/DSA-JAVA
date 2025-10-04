import axiosClient from '@/lib/axios-client';

// User Management APIs
export const getUsers = async (params = {}) => {
  const { page = 1, limit = 10, search } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  return axiosClient.get(`/users?${queryParams}`);
};

export const getUserById = async (id) => {
  const response = await axiosClient.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axiosClient.post('/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axiosClient.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axiosClient.delete(`/users/${id}`);
  return response.data;
};

// Analytics APIs
export const getUserStats = async () => axiosClient.get('/users/stats');
export const getTripStats = async () =>
  axiosClient.get('/users/analytics/trips');
