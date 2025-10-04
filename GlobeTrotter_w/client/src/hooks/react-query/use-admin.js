import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  getTripStats,
} from '@/api/admin';
import { toast } from 'sonner';

export const useUsers = (params = {}) => {
  return useQuery({
    queryKey: ['admin:users', params],
    queryFn: () => getUsers(params),
  });
};

export const useUser = (id) => {
  return useQuery({
    queryKey: ['admin:user', id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin:users'] });
      queryClient.invalidateQueries({ queryKey: ['admin:stats'] });
      toast.success('User created successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create user';
      toast.error(message);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => updateUser(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin:users'] });
      queryClient.invalidateQueries({ queryKey: ['admin:user', variables.id] });
      toast.success('User updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update user';
      toast.error(message);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin:users'] });
      queryClient.invalidateQueries({ queryKey: ['admin:stats'] });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete user';
      toast.error(message);
    },
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['admin:stats:users'],
    queryFn: getUserStats,
  });
};

export const useTripStats = () => {
  return useQuery({
    queryKey: ['admin:stats:trips'],
    queryFn: getTripStats,
  });
};
