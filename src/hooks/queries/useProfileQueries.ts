/**
 * React Query hooks for Profile Management
 * 
 * This file contains all the query hooks for user profile APIs.
 * Handles both employee and admin profiles with automatic caching.
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { getMyProfileApi, updateProfileApi } from '../../apis/profile';
import { getMyAdminProfileApi, updateAdminProfileApi } from '../../apis/admin';

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
 * Handles both admin and employee profile updates
 */
export const useUpdateProfile = (userType?: 'admin' | 'employee') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: any) => {
      // Determine user type from profileData or parameter
      const isAdmin = userType === 'admin' || profileData.userType === 'admin';
      
      if (isAdmin) {
        // Transform ProfileData format to AdminData format
        const adminUpdateData: any = {};
        
        // Handle name field (split into firstName and lastName)
        // Only include fields that meet validation requirements (min 2 chars for firstName/lastName)
        if (profileData.name) {
          const nameParts = profileData.name.trim().split(/\s+/).filter((part: string) => part.length > 0);
          
          if (nameParts.length > 0) {
            const firstName = nameParts[0];
            // Only include firstName if it's at least 2 characters
            if (firstName.length >= 2) {
              adminUpdateData.firstName = firstName;
            }
            
            // Only include lastName if there are multiple parts and it's at least 2 characters
            if (nameParts.length > 1) {
              const lastName = nameParts.slice(1).join(' ');
              if (lastName.length >= 2) {
                adminUpdateData.lastName = lastName;
              }
            }
            // If only one word, don't include lastName (it's optional in the API)
          }
        }
        
        // Map other fields
        if (profileData.email !== undefined && profileData.email.trim().length > 0) {
          adminUpdateData.email = profileData.email;
        }
        
        // Note: Admin profile might not support phone, address, etc. based on AdminData interface
        // Only update fields that exist in AdminData
        
        const response = await updateAdminProfileApi(adminUpdateData);
        return response;
      } else {
        const response = await updateProfileApi(profileData);
        return response;
      }
    },
    onMutate: async (newProfile) => {
      // Determine which query key to use
      const isAdmin = userType === 'admin' || newProfile.userType === 'admin';
      const queryKey = isAdmin ? profileQueryKeys.adminProfile() : profileQueryKeys.myProfile();
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(queryKey);

      // Optimistically update profile
      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        ...newProfile,
      }));

      return { previousProfile, queryKey };
    },
    onError: (_err, _newProfile, context) => {
      // Rollback on error
      if (context?.previousProfile && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousProfile);
      }
    },
    onSuccess: (_data, _variables, context) => {
      // Invalidate and refetch to ensure data is up-to-date
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      } else {
        // Fallback: invalidate both
        queryClient.invalidateQueries({ queryKey: profileQueryKeys.myProfile() });
        queryClient.invalidateQueries({ queryKey: profileQueryKeys.adminProfile() });
      }
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

