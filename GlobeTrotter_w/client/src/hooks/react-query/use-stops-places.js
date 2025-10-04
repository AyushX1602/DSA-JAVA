import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import { stopsPlacesApi } from '@/api/stops-places.js';

// Stops
export const useStops = (tripId, { enabled = true } = {}) =>
  useQuery({
    queryKey: [QUERY_KEYS.STOPS_LIST, tripId],
    queryFn: () => stopsPlacesApi.listStops(tripId),
    select: (res) => res,
    enabled: !!tripId && enabled,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });

export const useCreateStop = (tripId, options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEYS.STOP_CREATE, tripId],
    mutationFn: (payload) => stopsPlacesApi.createStop(tripId, payload),
    onMutate: async () => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await qc.invalidateQueries({ queryKey: [QUERY_KEYS.STOPS_LIST, tripId] });
    }, 
    onError: (err, payload, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousStops) {
        qc.setQueryData([QUERY_KEYS.STOPS_LIST, tripId], context.previousStops);
      }
      options.onError?.(err, payload, context);
    },
    onSuccess: (newStop, payload, context) => {
      // Replace the temporary stop with the real one from the server
      const stopWithPlaces = {
        ...newStop,
        places: [], // findAll includes places, create doesn't, so add empty array
      };

      qc.setQueryData([QUERY_KEYS.STOPS_LIST, tripId], (old) => {
        if (!old) return [stopWithPlaces];
        return old.map((stop) =>
          stop.id === context?.tempStop?.id ? stopWithPlaces : stop,
        );
      });
      options.onSuccess?.(newStop, payload, context);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.STOPS_LIST, tripId] });
    },
    ...options,
  });
};

export const useUpdateStop = (tripId, options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEYS.STOP_UPDATE, tripId],
    mutationFn: ({ stopId, data }) =>
      stopsPlacesApi.updateStop(tripId, stopId, data),
    onMutate: async ({ stopId, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await qc.cancelQueries({ queryKey: [QUERY_KEYS.STOPS_LIST, tripId] });

      // Snapshot the previous value
      const previousStops = qc.getQueryData([QUERY_KEYS.STOPS_LIST, tripId]);

      // Optimistically update to the new value
      qc.setQueryData([QUERY_KEYS.STOPS_LIST, tripId], (old) => {
        return old
          ? old.map((stop) =>
              stop.id === stopId ? { ...stop, ...data } : stop,
            )
          : old;
      });

      // Return a context object with the snapshotted value
      return { previousStops };
    },
    onError: (err, { stopId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousStops) {
        qc.setQueryData([QUERY_KEYS.STOPS_LIST, tripId], context.previousStops);
      }
      options.onError?.(err, { stopId }, context);
    },
    onSuccess: (updatedStop, variables, ...args) => {
      // Update with the actual server response to ensure consistency
      qc.setQueryData([QUERY_KEYS.STOPS_LIST, tripId], (old) => {
        return old
          ? old.map((stop) =>
              stop.id === variables.stopId ? { ...stop, ...updatedStop } : stop,
            )
          : old;
      });
      options.onSuccess?.(updatedStop, variables, ...args);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.STOPS_LIST, tripId] });
    },
    ...options,
  });
};

export const useDeleteStop = (tripId, options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEYS.STOP_DELETE, tripId],
    mutationFn: (stopId) => stopsPlacesApi.deleteStop(tripId, stopId),
    onSuccess: (data, stopId, ...args) => {
      // Remove from cache
      qc.setQueryData([QUERY_KEYS.STOPS_LIST, tripId], (old) => {
        return old ? old.filter((stop) => stop.id !== stopId) : old;
      });
      // Clean up related caches
      qc.removeQueries({ queryKey: [QUERY_KEYS.PLACES_LIST, stopId] });
      options.onSuccess?.(data, stopId, ...args);
    },
    ...options,
  });
};

// Places
export const usePlaces = (stopId, { enabled = true } = {}) =>
  useQuery({
    queryKey: [QUERY_KEYS.PLACES_LIST, stopId],
    queryFn: () => stopsPlacesApi.listPlaces(stopId),
    select: (res) => res,
    enabled: !!stopId && enabled,
    staleTime: 30000,
    gcTime: 300000,
  });

export const useCreatePlace = (stopId, options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEYS.PLACE_CREATE, stopId],
    mutationFn: (payload) => stopsPlacesApi.createPlace(stopId, payload),
    onMutate: async (payload) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await qc.cancelQueries({ queryKey: [QUERY_KEYS.PLACES_LIST, stopId] });

      // Snapshot the previous value
      const previousPlaces = qc.getQueryData([QUERY_KEYS.PLACES_LIST, stopId]);

      // Create a temporary place with a temporary ID for optimistic update
      const tempPlace = {
        ...payload,
        id: `temp-${Date.now()}`, // Temporary ID that will be replaced by the real one
        activities: [], // findAll includes activities, create doesn't
        totalExpense: 0, // findAll calculates totalExpense, create doesn't
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically add the new place to the cache
      qc.setQueryData([QUERY_KEYS.PLACES_LIST, stopId], (old) => {
        return old ? [...old, tempPlace] : [tempPlace];
      });

      // Return a context object with the snapshotted value and temp place
      return { previousPlaces, tempPlace };
    },
    onError: (err, payload, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPlaces) {
        qc.setQueryData(
          [QUERY_KEYS.PLACES_LIST, stopId],
          context.previousPlaces,
        );
      }
      options.onError?.(err, payload, context);
    },
    onSuccess: (newPlace, payload, context) => {
      // Replace the temporary place with the real one from the server
      const placeWithActivities = {
        ...newPlace,
        activities: [], // findAll includes activities, create doesn't
        totalExpense: 0, // findAll calculates totalExpense, create doesn't
      };

      qc.setQueryData([QUERY_KEYS.PLACES_LIST, stopId], (old) => {
        if (!old) return [placeWithActivities];
        return old.map((place) =>
          place.id === context?.tempPlace?.id ? placeWithActivities : place,
        );
      });
      options.onSuccess?.(newPlace, payload, context);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PLACES_LIST, stopId] });
    },
    ...options,
  });
};

export const useUpdatePlace = (stopId, options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEYS.PLACE_UPDATE, stopId],
    mutationFn: ({ placeId, data }) =>
      stopsPlacesApi.updatePlace(stopId, placeId, data),
    onMutate: async ({ placeId, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await qc.cancelQueries({ queryKey: [QUERY_KEYS.PLACES_LIST, stopId] });

      // Snapshot the previous value
      const previousPlaces = qc.getQueryData([QUERY_KEYS.PLACES_LIST, stopId]);

      // Optimistically update to the new value
      qc.setQueryData([QUERY_KEYS.PLACES_LIST, stopId], (old) => {
        return old
          ? old.map((place) =>
              place.id === placeId ? { ...place, ...data } : place,
            )
          : old;
      });

      // Return a context object with the snapshotted value
      return { previousPlaces };
    },
    onError: (err, { placeId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPlaces) {
        qc.setQueryData(
          [QUERY_KEYS.PLACES_LIST, stopId],
          context.previousPlaces,
        );
      }
      options.onError?.(err, { placeId }, context);
    },
    onSuccess: (updatedPlace, variables, ...args) => {
      // Update with the actual server response to ensure consistency
      qc.setQueryData([QUERY_KEYS.PLACES_LIST, stopId], (old) => {
        return old
          ? old.map((place) =>
              place.id === variables.placeId
                ? { ...place, ...updatedPlace }
                : place,
            )
          : old;
      });
      options.onSuccess?.(updatedPlace, variables, ...args);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PLACES_LIST, stopId] });
    },
    ...options,
  });
};

export const useDeletePlace = (stopId, options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEYS.PLACE_DELETE, stopId],
    mutationFn: (placeId) => stopsPlacesApi.deletePlace(stopId, placeId),
    onSuccess: (data, placeId, ...args) => {
      qc.setQueryData([QUERY_KEYS.PLACES_LIST, stopId], (old) => {
        return old ? old.filter((place) => place.id !== placeId) : old;
      });
      qc.removeQueries({ queryKey: [QUERY_KEYS.ACTIVITIES_LIST, placeId] });
      options.onSuccess?.(data, placeId, ...args);
    },
    ...options,
  });
};

// Activities
export const useActivities = (placeId, { enabled = true } = {}) =>
  useQuery({
    queryKey: [QUERY_KEYS.ACTIVITIES_LIST, placeId],
    queryFn: () => stopsPlacesApi.listActivities(placeId),
    select: (res) => res,
    enabled: !!placeId && enabled,
    staleTime: 30000,
    gcTime: 300000,
  });

export const useCreateActivity = (placeId, options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEYS.ACTIVITY_CREATE, placeId],
    mutationFn: (payload) => stopsPlacesApi.createActivity(placeId, payload),
    onMutate: async (payload) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await qc.cancelQueries({
        queryKey: [QUERY_KEYS.ACTIVITIES_LIST, placeId],
      });

      // Snapshot the previous value
      const previousActivities = qc.getQueryData([
        QUERY_KEYS.ACTIVITIES_LIST,
        placeId,
      ]);

      // Create a temporary activity with a temporary ID for optimistic update
      const tempActivity = {
        ...payload,
        id: `temp-${Date.now()}`, // Temporary ID that will be replaced by the real one
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically add the new activity to the cache
      qc.setQueryData([QUERY_KEYS.ACTIVITIES_LIST, placeId], (old) => {
        return old ? [...old, tempActivity] : [tempActivity];
      });

      // Return a context object with the snapshotted value and temp activity
      return { previousActivities, tempActivity };
    },
    onError: (err, payload, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousActivities) {
        qc.setQueryData(
          [QUERY_KEYS.ACTIVITIES_LIST, placeId],
          context.previousActivities,
        );
      }
      options.onError?.(err, payload, context);
    },
    onSuccess: (newActivity, payload, context) => {
      // Replace the temporary activity with the real one from the server
      qc.setQueryData([QUERY_KEYS.ACTIVITIES_LIST, placeId], (old) => {
        if (!old) return [newActivity];
        return old.map((activity) =>
          activity.id === context?.tempActivity?.id ? newActivity : activity,
        );
      });
      options.onSuccess?.(newActivity, payload, context);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACTIVITIES_LIST, placeId] });
    },
    ...options,
  });
};

export const useUpdateActivity = (placeId, options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEYS.ACTIVITY_UPDATE, placeId],
    mutationFn: ({ activityId, data }) =>
      stopsPlacesApi.updateActivity(placeId, activityId, data),
    onMutate: async ({ activityId, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await qc.cancelQueries({
        queryKey: [QUERY_KEYS.ACTIVITIES_LIST, placeId],
      });

      // Snapshot the previous value
      const previousActivities = qc.getQueryData([
        QUERY_KEYS.ACTIVITIES_LIST,
        placeId,
      ]);

      // Optimistically update to the new value
      qc.setQueryData([QUERY_KEYS.ACTIVITIES_LIST, placeId], (old) => {
        return old
          ? old.map((activity) =>
              activity.id === activityId ? { ...activity, ...data } : activity,
            )
          : old;
      });

      // Return a context object with the snapshotted value
      return { previousActivities };
    },
    onError: (err, { activityId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousActivities) {
        qc.setQueryData(
          [QUERY_KEYS.ACTIVITIES_LIST, placeId],
          context.previousActivities,
        );
      }
      options.onError?.(err, { activityId }, context);
    },
    onSuccess: (updatedActivity, variables, ...args) => {
      // Update with the actual server response to ensure consistency
      qc.setQueryData([QUERY_KEYS.ACTIVITIES_LIST, placeId], (old) => {
        return old
          ? old.map((activity) =>
              activity.id === variables.activityId
                ? { ...activity, ...updatedActivity }
                : activity,
            )
          : old;
      });
      options.onSuccess?.(updatedActivity, variables, ...args);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACTIVITIES_LIST, placeId] });
    },
    ...options,
  });
};

export const useDeleteActivity = (placeId, options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEYS.ACTIVITY_DELETE, placeId],
    mutationFn: (activityId) =>
      stopsPlacesApi.deleteActivity(placeId, activityId),
    onSuccess: (data, activityId, ...args) => {
      qc.setQueryData([QUERY_KEYS.ACTIVITIES_LIST, placeId], (old) => {
        return old ? old.filter((activity) => activity.id !== activityId) : old;
      });
      options.onSuccess?.(data, activityId, ...args);
    },
    ...options,
  });
};
