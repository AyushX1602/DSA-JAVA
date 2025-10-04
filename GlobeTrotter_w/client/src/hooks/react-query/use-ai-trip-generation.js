import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  generateAITrip,
  estimateActivityCost,
  fetchTripImages,
  narrateActivity,
} from '@/api/ai-trip-generation';
import { QUERY_KEYS } from '@/constants/query-keys';

export const useGenerateAITrip = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: [QUERY_KEYS.AI_TRIP_GENERATION],
    mutationFn: generateAITrip,
    onSuccess: (data, ...args) => {
      // Invalidate trips list to refresh the data
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS_LIST] });
      options.onSuccess?.(data, ...args);
    },
    onError: (error, ...args) => {
      options.onError?.(error, ...args);
    },
    ...options,
  });
};

export const useEstimateActivityCost = (options = {}) => {
  return useMutation({
    mutationKey: [QUERY_KEYS.ACTIVITY_COST_ESTIMATION],
    mutationFn: estimateActivityCost,
    onSuccess: (data, ...args) => {
      options.onSuccess?.(data, ...args);
    },
    onError: (error, ...args) => {
      options.onError?.(error, ...args);
    },
    ...options,
  });
};

export const useTripImages = (tripId, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TRIP_IMAGES, tripId],
    queryFn: () => fetchTripImages(tripId),
    enabled: !!tripId,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    ...options,
  });
};

export const useNarrateActivity = (options = {}) => {
  return useMutation({
    mutationKey: [QUERY_KEYS.ACTIVITY_NARRATION],
    mutationFn: narrateActivity,
    onSuccess: (data, ...args) => {
      options.onSuccess?.(data, ...args);
    },
    onError: (error, ...args) => {
      options.onError?.(error, ...args);
    },
    ...options,
  });
};
