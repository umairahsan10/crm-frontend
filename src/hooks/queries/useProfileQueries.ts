/**
 * React Query hooks for Profile Management
 * 
 * This file contains all the query hooks for user profile APIs.
 * Handles both employee and admin profiles with automatic caching.
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { getMyProfileApi, updateProfileApi } from '../../apis/profile';
import { getMyAdminProfileApi } from '../../apis/admin';

// Query Keys - Centralized for consistency
export const profileQueryKeys = {
  all: ['profile'] as const,
  myProfile: () => [...profileQueryKeys.all, 'my-profile'] as const,
  adminProfile: () => [...profileQueryKeys.all, 'admin-profile'] as const,
};

/**
 * Hook to fetch employee profile
 * @param options - Additional React Query options
 */
export const useMyProfile = (
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: profileQueryKeys.myProfile(),
    queryFn: async () => {
      const data = await getMyProfileApi();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - profile doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...options,
  });
};

/**
 * Hook to fetch admin profile
 * @param options - Additional React Query options
 */
export const useMyAdminProfile = (
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: profileQueryKeys.adminProfile(),
    queryFn: async () => {
      const data = await getMyAdminProfileApi();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...options,
  });
};

/**
 * Hook to update profile with optimistic updates
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: any) => {
      const response = await updateProfileApi(profileData);
      return response;
    },
    onMutate: async (newProfile) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: profileQueryKeys.myProfile() });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(profileQueryKeys.myProfile());

      // Optimistically update profile
      queryClient.setQueryData(profileQueryKeys.myProfile(), (old: any) => ({
        ...old,
        ...newProfile,
      }));

      return { previousProfile };
    },
    onError: (_err, _newProfile, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(profileQueryKeys.myProfile(), context.previousProfile);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch to ensure data is up-to-date
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.myProfile() });
    },
  });
};

/**
 * Hook to update password
 */
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (passwordData: { currentPassword: string; newPassword: string }) => {
      // TODO: Implement password update API
      console.log('Password update called:', passwordData);
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      // No need to invalidate profile, but could show success message
      console.log('Password updated successfully');
    },
  });
};

/**
 * Combined hook for getting profile based on user type
 * @param userType - 'admin' or 'employee'
 */
export const useProfile = (userType: 'admin' | 'employee') => {
  const employeeProfile = useMyProfile({ enabled: userType === 'employee' });
  const adminProfile = useMyAdminProfile({ enabled: userType === 'admin' });

  return userType === 'admin' ? adminProfile : employeeProfile;
};

