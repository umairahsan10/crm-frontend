/**
 * React Query hooks for HR Admin Requests Management
 * 
 * This file contains all the query hooks for HR admin requests APIs.
 * Handles requests from HR to Admin with automatic caching.
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { 
  getHRAdminRequestsApi,
  getMyHRAdminRequestsApi,
  updateHRAdminRequestApi
} from '../../apis/hr-admin-requests';

// Query Keys - Centralized for consistency
export const hrAdminRequestsQueryKeys = {
  all: ['hrAdminRequests'] as const,
  lists: () => [...hrAdminRequestsQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...hrAdminRequestsQueryKeys.lists(), filters] as const,
  my: (hrId: number, filters?: any) => [...hrAdminRequestsQueryKeys.all, 'my', hrId, filters] as const,
};

/**
 * Hook to fetch all HR admin requests (Admin view)
 * @param filters - Filter parameters for requests
 */
export const useHRAdminRequests = (
  filters: any = {},
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: hrAdminRequestsQueryKeys.list(filters),
    queryFn: async () => {
      const response = await getHRAdminRequestsApi();
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch HR's own admin requests (HR view)
 * @param hrId - HR employee ID
 * @param filters - Filter parameters for requests
 */
export const useMyHRAdminRequests = (
  hrId: number,
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  } = {},
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: hrAdminRequestsQueryKeys.my(hrId, filters),
    queryFn: async () => {
      const response = await getMyHRAdminRequestsApi({
        hrId,
        ...filters
      });
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!hrId && (options?.enabled !== false),
    ...options,
  });
};

/**
 * Hook to update HR admin request (approve/reject)
 */
export const useUpdateHRAdminRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, action, notes }: { requestId: number; action: 'approve' | 'reject'; notes?: string }) => {
      const status = action === 'approve' ? 'approved' : 'rejected';
      const response = await updateHRAdminRequestApi(requestId, status, notes);
      return response;
    },
    onSuccess: () => {
      // Invalidate all request lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: hrAdminRequestsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: hrAdminRequestsQueryKeys.all });
    },
  });
};

