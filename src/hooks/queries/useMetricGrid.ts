import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getMetricGridApi } from '../../apis/dashboard';
import { transformMetricGridResponse } from '../../utils/metricTransform';
import type { MetricData } from '../../types/dashboard';
import type { MetricGridApiResponse } from '../../apis/dashboard';
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
 * @param selectedDepartment - Optional department filter for Admin dashboard (client-side filtering only)
 */
export const useMetricGrid = (selectedDepartment?: string | null) => {
  const { user } = useAuth();

  // Fetch data once without department filter in query key (since backend returns all departments)
  const { data: apiData, isLoading, isError, error, ...rest } = useQuery<MetricGridApiResponse, Error>({
    queryKey: [...metricGridQueryKeys.byUser(user?.department, user?.role)],
    queryFn: async () => {
      const data = await getMetricGridApi();
      return data;
    },
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 30000, // Data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    retry: 2, // Retry twice on failure
  });

  // Transform and filter on client side (instant, no API call)
  const transformedData = useMemo(() => {
    if (!apiData) return undefined;
    return transformMetricGridResponse(apiData, selectedDepartment);
  }, [apiData, selectedDepartment]);

  return {
    data: transformedData,
    isLoading,
    isError,
    error,
    ...rest,
  };
};

