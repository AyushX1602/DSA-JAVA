import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import { tripsApi } from '@/api/trips';

export const useTripsList = (
  { page = 1, limit = 20, filters = {} } = {},
  options = {},
) =>
  useQuery({
    queryKey: [QUERY_KEYS.TRIPS_LIST, { page, limit, filters }],
    queryFn: () => tripsApi.listTrips({ page, limit, ...filters }),
    ...options,
  });

export const useTrip = (id, { enabled = true } = {}) =>
  useQuery({
    queryKey: [QUERY_KEYS.TRIP_DETAIL, id],
    queryFn: () => tripsApi.getTrip(id),
    select: (data) => data.data,
    enabled: !!id && enabled,
  });

export const useCreateTrip = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEYS.TRIP_CREATE],
    mutationFn: tripsApi.createTrip,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS_LIST] });
      options.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateTrip = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEYS.TRIP_UPDATE],
    mutationFn: ({ id, data }) => tripsApi.updateTrip(id, data),
    onSuccess: (data, variables, context) => {
      if (variables?.id) {
        qc.invalidateQueries({
          queryKey: [QUERY_KEYS.TRIP_DETAIL, variables.id],
        });
      }
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS_LIST] });
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteTrip = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEYS.TRIP_DELETE],
    mutationFn: (id) => tripsApi.deleteTrip(id),
    onSuccess: (data, id, context) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS_LIST] });
      qc.removeQueries({ queryKey: [QUERY_KEYS.TRIP_DETAIL, id] });
      options.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

export const useUserCalendar = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: [QUERY_KEYS.USER_CALENDAR],
    queryFn: () => tripsApi.getUserCalendar(),
    enabled,
  });

export const usePublicTripsList = ({
  page = 1,
  limit = 20,
  filters = {},
} = {}) =>
  useQuery({
    queryKey: [QUERY_KEYS.PUBLIC_TRIPS_LIST, { page, limit, filters }],
    queryFn: () => tripsApi.listPublicTrips({ page, limit, ...filters }),
  });

export const useTripSuggestions = (
  name,
  description,
  { enabled = true, limit = 5 } = {},
) =>
  useQuery({
    queryKey: [QUERY_KEYS.TRIP_SUGGESTIONS, { name, description, limit }],
    queryFn: () => tripsApi.getTripSuggestions(name, description, limit),
    enabled: enabled && (!!name || !!description), // Only fetch if there's something to search for
    staleTime: 30000, // Cache suggestions for 30 seconds
  });
