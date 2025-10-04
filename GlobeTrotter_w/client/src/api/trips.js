import axiosClient from '@/lib/axios-client';

export const listTrips = (params) => {
  const {
    page,
    limit,
    name,
    startDate,
    endDate,
    minBudget,
    maxBudget,
    ...otherParams
  } = params;

  const queryParams = {
    ...(page && { page }),
    ...(limit && { limit }),
    ...(name && { name }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(minBudget && { minBudget }),
    ...(maxBudget && { maxBudget }),
    ...otherParams,
  };

  return axiosClient.get('/trips', { params: queryParams });
};
export const getTrip = (id) => axiosClient.get(`/trips/${id}`);
export const createTrip = (payload) => axiosClient.post('/trips', payload);
export const updateTrip = (id, payload) =>
  axiosClient.patch(`/trips/${id}`, payload);
export const deleteTrip = (id) => axiosClient.delete(`/trips/${id}`);
export const getUserCalendar = () => axiosClient.get('/trips/calendar');

export const listPublicTrips = (params) => {
  const {
    page,
    limit,
    name,
    startDate,
    endDate,
    minBudget,
    maxBudget,
    ...otherParams
  } = params;

  const queryParams = {
    ...(page && { page }),
    ...(limit && { limit }),
    ...(name && { name }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(minBudget && { minBudget }),
    ...(maxBudget && { maxBudget }),
    ...otherParams,
  };

  return axiosClient.get('/trips/public', { params: queryParams });
};

export const getTripSuggestions = (name, description, limit = 5) => {
  const queryParams = {};
  if (name) queryParams.name = name;
  if (description) queryParams.description = description;
  if (limit) queryParams.limit = limit;

  return axiosClient.get('/trips/suggestions', { params: queryParams });
};

export const tripsApi = {
  listTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  getUserCalendar,
  listPublicTrips,
  getTripSuggestions,
};
