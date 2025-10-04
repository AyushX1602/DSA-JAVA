import { useMutation, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import { authApi } from '@/api/auth';

export const useMe = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: [QUERY_KEYS.AUTH_ME],
    queryFn: authApi.me,
    enabled,
  });

export const useLogin = (options = {}) =>
  useMutation({
    mutationKey: [QUERY_KEYS.AUTH_LOGIN],
    mutationFn: authApi.login,
    ...options,
  });

export const useSignup = (options = {}) =>
  useMutation({
    mutationKey: [QUERY_KEYS.AUTH_SIGNUP],
    mutationFn: authApi.signup,
    ...options,
  });

export const useUpdateProfile = (options = {}) =>
  useMutation({
    mutationKey: [QUERY_KEYS.AUTH_UPDATE_PROFILE],
    mutationFn: authApi.updateProfile,
    ...options,
  });

export const useForgotPasswordRequest = (options = {}) =>
  useMutation({
    mutationKey: [QUERY_KEYS.AUTH_FORGOT_PASSWORD_REQUEST],
    mutationFn: authApi.forgotPasswordRequest,
    ...options,
  });

export const useForgotPasswordVerify = (options = {}) =>
  useMutation({
    mutationKey: [QUERY_KEYS.AUTH_FORGOT_PASSWORD_VERIFY],
    mutationFn: authApi.forgotPasswordVerify,
    ...options,
  });

export const useForgotPasswordReset = (options = {}) =>
  useMutation({
    mutationKey: [QUERY_KEYS.AUTH_FORGOT_PASSWORD_RESET],
    mutationFn: authApi.forgotPasswordReset,
    ...options,
  });
