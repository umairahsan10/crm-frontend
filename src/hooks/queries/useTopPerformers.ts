import { useQuery } from '@tanstack/react-query';
import { getTopPerformersApi } from '../../apis/dashboard';
import { transformTopPerformersResponse, transformTopPerformersToLeaderboard } from '../../utils/topPerformersTransform';
import { useAuth } from '../../context/AuthContext';
import type { ChartData } from '../../types/dashboard';
import type { PerformanceMember } from '../../components/common/Leaderboard/Leaderboard';

/**
 * Query keys for top performers
 */
export const topPerformersQueryKeys = {
  all: ['top-performers'] as const,
  byUser: (
    department?: string,
    role?: string,
    limit?: number,
    period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    metric?: 'deals' | 'revenue' | 'conversion_rate' | 'leads',
    fromDate?: string,
    toDate?: string,
    unit?: string
  ) =>
    [...topPerformersQueryKeys.all, department, role, limit, period, metric, fromDate, toDate, unit] as const,
};

/**
 * Hook to fetch top performers data
 * Automatically uses user's department and role from auth context
 * Transforms API response to ChartData format
 * @param limit - Number of top performers to return (default: 5, max: 20)
 * @param period - 'daily', 'weekly', 'monthly', 'quarterly', or 'yearly' (default: 'monthly')
 * @param fromDate - Start date in ISO 8601 format (optional)
 * @param toDate - End date in ISO 8601 format (optional)
 * @param unit - Filter by specific sales unit (optional, only for department managers)
 * @param metric - Performance metric: 'deals', 'revenue', 'conversion_rate', or 'leads' (default: 'deals')
 */
export const useTopPerformers = (
  limit: number = 5,
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
  fromDate?: string,
  toDate?: string,
  unit?: string,
  metric: 'deals' | 'revenue' | 'conversion_rate' | 'leads' = 'deals'
) => {
  const { user } = useAuth();

  return useQuery<ChartData[], Error>({
    queryKey: topPerformersQueryKeys.byUser(user?.department, user?.role, limit, period, metric, fromDate, toDate, unit),
    queryFn: async () => {
      const apiData = await getTopPerformersApi(limit, period, fromDate, toDate, unit, metric);
      return transformTopPerformersResponse(apiData);
    },
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 30000, // Data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    retry: 2, // Retry twice on failure
  });
};

/**
 * Hook to fetch top performers data as PerformanceMember format for PerformanceLeaderboard
 * Automatically uses user's department and role from auth context
 * @param limit - Number of top performers to return (default: 5, max: 20)
 * @param period - 'daily', 'weekly', 'monthly', 'quarterly', or 'yearly' (default: 'monthly')
 * @param fromDate - Start date in ISO 8601 format (optional)
 * @param toDate - End date in ISO 8601 format (optional)
 * @param unit - Filter by specific sales unit (optional, only for department managers)
 * @param metric - Performance metric: 'deals', 'revenue', 'conversion_rate', or 'leads' (default: 'deals')
 */
export const useTopPerformersLeaderboard = (
  limit: number = 5,
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
  fromDate?: string,
  toDate?: string,
  unit?: string,
  metric: 'deals' | 'revenue' | 'conversion_rate' | 'leads' = 'deals'
) => {
  const { user } = useAuth();

  return useQuery<PerformanceMember[], Error>({
    queryKey: [...topPerformersQueryKeys.byUser(user?.department, user?.role, limit, period, metric, fromDate, toDate, unit), 'leaderboard'],
    queryFn: async () => {
      const apiData = await getTopPerformersApi(limit, period, fromDate, toDate, unit, metric);
      return transformTopPerformersToLeaderboard(apiData);
    },
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 30000, // Data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    retry: 2, // Retry twice on failure
  });
};

