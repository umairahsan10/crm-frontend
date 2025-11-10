import { useQuery } from '@tanstack/react-query';
import { getMetricGridApi } from '../../apis/dashboard';
import { transformMetricGridResponse } from '../../utils/metricTransform';
import type { MetricData } from '../../types/dashboard';
import { useAuth } from '../../context/AuthContext';

/**
 * Query keys for metric grid
 */
export const metricGridQueryKeys = {
  all: ['metric-grid'] as const,
  byUser: (department?: string, role?: string) => 
    [...metricGridQueryKeys.all, department, role] as const,
};

/**
 * Hook to fetch metric grid data
 * Automatically uses user's department and role from auth context
 * Transforms API response to MetricData format
 */
export const useMetricGrid = () => {
  const { user } = useAuth();

  return useQuery<MetricData[], Error>({
    queryKey: metricGridQueryKeys.byUser(user?.department, user?.role),
    queryFn: async () => {
      const apiData = await getMetricGridApi();
      return transformMetricGridResponse(apiData);
    },
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 30000, // Data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    retry: 2, // Retry twice on failure
  });
};

