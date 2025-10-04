import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import { communityApi } from '@/api/community';

export const useCommunityMessages = ({ page = 1, limit = 50 } = {}) =>
  useQuery({
    queryKey: [QUERY_KEYS.COMMUNITY_MESSAGES, { page, limit }],
    queryFn: () => communityApi.getMessages({ page, limit }),
    refetchInterval: 60000, // Poll every minute
    select: (data) => data,
  });

export const useCommunityMessage = (id, { enabled = true } = {}) =>
  useQuery({
    queryKey: [QUERY_KEYS.COMMUNITY_MESSAGES, id],
    queryFn: () => communityApi.getMessage(id),
    select: (data) => data,
    enabled: !!id && enabled,
  });

export const useCreateCommunityMessage = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEYS.COMMUNITY_MESSAGE_CREATE],
    mutationFn: communityApi.createMessage,
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches
      await qc.cancelQueries({ queryKey: [QUERY_KEYS.COMMUNITY_MESSAGES] });

      // Snapshot the previous value
      const previousMessages = qc.getQueryData([QUERY_KEYS.COMMUNITY_MESSAGES]);

      // Get current user from localStorage or context
      const token = localStorage.getItem('accessToken');
      let currentUser = null;

      if (token) {
        try {
          // Decode JWT to get user info (basic approach)
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUser = {
            id: payload.userId,
            name: payload.name || 'You',
            email: payload.email || 'temp@email.com',
          };
        } catch {
          currentUser = {
            id: 'temp-user-id',
            name: 'You',
            email: 'temp@email.com',
          };
        }
      }

      // Optimistically update to the new value
      qc.setQueryData([QUERY_KEYS.COMMUNITY_MESSAGES], (old) => {
        if (!old) return old;

        const optimisticMessage = {
          id: `temp-${Date.now()}`,
          content: newMessage.content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: currentUser,
        };

        return {
          ...old,
          messages: [optimisticMessage, ...old.messages],
          total: old.total + 1,
        };
      });

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMessages) {
        qc.setQueryData(
          [QUERY_KEYS.COMMUNITY_MESSAGES],
          context.previousMessages,
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITY_MESSAGES] });
    },
    onSuccess: (...args) => {
      options.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteCommunityMessage = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [QUERY_KEYS.COMMUNITY_MESSAGE_DELETE],
    mutationFn: communityApi.deleteMessage,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITY_MESSAGES] });
      options.onSuccess?.(...args);
    },
    ...options,
  });
};
