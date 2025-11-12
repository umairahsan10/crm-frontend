import { useQuery } from '@tanstack/react-query';
import { getDepartmentDistributionApi } from '../../apis/dashboard';
import { transformDepartmentDistributionResponse } from '../../utils/departmentTransform';
import { useAuth } from '../../context/AuthContext';
import type { ChartData } from '../../types/dashboard';

/**
 * Query keys for department distribution
 */
export const departmentDistributionQueryKeys = {
  all: ['department-distribution'] as const,
  byUser: (department?: string, role?: string) =>
    [...departmentDistributionQueryKeys.all, department, role] as const,
};

/**
 * Hook to fetch department distribution data
 * Automatically uses user's department and role from auth context
 * Transforms API response to ChartData format
 */
export const useDepartmentDistribution = () => {
  const { user } = useAuth();

  return useQuery<ChartData[], Error>({
    queryKey: departmentDistributionQueryKeys.byUser(user?.department, user?.role),
    queryFn: async () => {
      const apiData = await getDepartmentDistributionApi();
      return transformDepartmentDistributionResponse(apiData);
    },
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 30000, // Data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    retry: 2, // Retry twice on failure
  });
};

