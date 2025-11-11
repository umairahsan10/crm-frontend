import { useQuery } from '@tanstack/react-query';
import { getHRRequestsApi } from '../../apis/dashboard';
import type { HRRequestsApiResponse } from '../../apis/dashboard';
import { useAuth } from '../../context/AuthContext';

/**
 * Query keys for HR requests
 */
export const hrRequestsQueryKeys = {
  all: ['hr-requests'] as const,
  byUser: (department?: string, role?: string, limit?: number) => 
    [...hrRequestsQueryKeys.all, department, role, limit] as const,
};

interface UseHRRequestsOptions {
  limit?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch HR requests data
 * Automatically uses user's department and role from auth context
 * @param options - Configuration options
 */
export const useHRRequests = (options: UseHRRequestsOptions = {}) => {
  const { user } = useAuth();
  const { limit = 5, enabled = true } = options;

  return useQuery<HRRequestsApiResponse, Error>({
    queryKey: hrRequestsQueryKeys.byUser(user?.department, user?.role, limit),
    queryFn: () => getHRRequestsApi(limit),
    enabled: enabled && !!user, // Only fetch if user is logged in and enabled
    staleTime: 60000, // Data is fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    retry: 2, // Retry twice on failure
  });
};

