import axiosClient from '@/lib/axios-client';

export const generateAITrip = (payload) =>
  axiosClient.post('/ai-trip-generation/generate', payload);

export const estimateActivityCost = (payload) =>
  axiosClient.post('/ai-trip-generation/estimate-cost', payload);

export const fetchTripImages = (tripId) =>
  axiosClient.get(`/ai-trip-generation/trip/${tripId}/images`);

export const narrateActivity = (payload) =>
  axiosClient.post('/ai-trip-generation/narrate-activity', payload);
