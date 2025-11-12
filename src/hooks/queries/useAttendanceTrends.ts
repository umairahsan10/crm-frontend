import { useQuery } from '@tanstack/react-query';
import { getAttendanceTrendsApi } from '../../apis/dashboard';
import { transformAttendanceTrendsResponse } from '../../utils/attendanceTransform';
import { useAuth } from '../../context/AuthContext';
import type { ChartData } from '../../types/dashboard';

/**
 * Query keys for attendance trends
 */
export const attendanceTrendsQueryKeys = {
  all: ['attendance-trends'] as const,
  byUser: (department?: string, role?: string, period?: 'daily' | 'monthly') =>
    [...attendanceTrendsQueryKeys.all, department, role, period] as const,
};

/**
 * Hook to fetch attendance trends data
 * Automatically uses user's department and role from auth context
 * Transforms API response to ChartData format
 * @param period - 'daily' or 'monthly' (default: 'daily')
 */
export const useAttendanceTrends = (period: 'daily' | 'monthly' = 'daily') => {
  const { user } = useAuth();

  return useQuery<ChartData[], Error>({
    queryKey: attendanceTrendsQueryKeys.byUser(user?.department, user?.role, period),
    queryFn: async () => {
      const apiData = await getAttendanceTrendsApi(period);
      return transformAttendanceTrendsResponse(apiData);
    },
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 30000, // Data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    retry: 2, // Retry twice on failure
  });
};

