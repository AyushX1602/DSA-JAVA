import axiosClient from '@/lib/axios-client';

// Trip Stops
export const listStops = (tripId) => axiosClient.get(`/trips/${tripId}/stops`);
export const createStop = (tripId, payload) =>
  axiosClient.post(`/trips/${tripId}/stops`, payload);
export const updateStop = (tripId, stopId, payload) =>
  axiosClient.patch(`/trips/${tripId}/stops/${stopId}`, payload);
export const deleteStop = (tripId, stopId) =>
  axiosClient.delete(`/trips/${tripId}/stops/${stopId}`);

// Places within a stop
export const listPlaces = (stopId) =>
  axiosClient.get(`/trip-stops/${stopId}/places`);
export const createPlace = (stopId, payload) =>
  axiosClient.post(`/trip-stops/${stopId}/places`, payload);
export const updatePlace = (stopId, placeId, payload) =>
  axiosClient.patch(`/trip-stops/${stopId}/places/${placeId}`, payload);
export const deletePlace = (stopId, placeId) =>
  axiosClient.delete(`/trip-stops/${stopId}/places/${placeId}`);

// Activities within a place
export const listActivities = (placeId) =>
  axiosClient.get(`/places/${placeId}/activities`);
export const createActivity = (placeId, payload) =>
  axiosClient.post(`/places/${placeId}/activities`, payload);
export const updateActivity = (placeId, activityId, payload) =>
  axiosClient.patch(`/places/${placeId}/activities/${activityId}`, payload);
export const deleteActivity = (placeId, activityId) =>
  axiosClient.delete(`/places/${placeId}/activities/${activityId}`);

export const stopsPlacesApi = {
  listStops,
  createStop,
  updateStop,
  deleteStop,
  listPlaces,
  createPlace,
  updatePlace,
  deletePlace,
  listActivities,
  createActivity,
  updateActivity,
  deleteActivity,
};
