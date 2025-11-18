import { useQuery } from '@tanstack/react-query';
import { getCrossDepartmentTopPerformersApi } from '../../apis/dashboard';
import { transformCrossDepartmentTopPerformersToLeaderboard } from '../../utils/topPerformersTransform';
import type { PerformanceMember } from '../../components/common/Leaderboard/Leaderboard';

export const crossDepartmentTopPerformersQueryKeys = {
  all: ['cross-department-top-performers'] as const,
  byPeriod: (period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly', limit?: number) =>
    ['cross-department-top-performers', period, limit] as const,
};

/**
 * Hook to fetch cross-department top performers data
 * Transforms API response to PerformanceMember format for PerformanceLeaderboard
 * @param period - 'daily', 'weekly', 'monthly', 'quarterly', or 'yearly' (default: 'monthly')
 * @param limit - Number of top performers to return (optional)
 */
export const useCrossDepartmentTopPerformers = (
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
  limit?: number
) => {
  return useQuery<PerformanceMember[], Error>({
    queryKey: crossDepartmentTopPerformersQueryKeys.byPeriod(period, limit),
    queryFn: async () => {
      const apiData = await getCrossDepartmentTopPerformersApi(period, limit);
      return transformCrossDepartmentTopPerformersToLeaderboard(apiData);
    },
    staleTime: 30000, // Data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    retry: 2, // Retry twice on failure
  });
};

