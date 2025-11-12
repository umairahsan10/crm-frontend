import { useQuery } from '@tanstack/react-query';
import { getActivityFeedApi } from '../../apis/dashboard';
import { transformActivityFeedResponse } from '../../utils/activityTransform';
import { useAuth } from '../../context/AuthContext';
import type { ActivityItem } from '../../types/dashboard';

interface UseActivityFeedOptions {
  limit?: number;
  enabled?: boolean;
}

/**
 * Query keys for activity feed
 */
export const activityFeedQueryKeys = {
  all: ['activity-feed'] as const,
  byUser: (department?: string, role?: string, limit?: number) =>
    [...activityFeedQueryKeys.all, department, role, limit] as const,
};

/**
 * Hook to fetch activity feed data
 * Automatically uses user's department and role from auth context
 * Transforms API response to ActivityItem format
 */
export const useActivityFeed = (options: UseActivityFeedOptions = {}) => {
  const { user } = useAuth();
  const { enabled = true } = options;
  
  // Always use limit of 3
  const finalLimit = 3;

  return useQuery<ActivityItem[], Error>({
    queryKey: activityFeedQueryKeys.byUser(user?.department, user?.role, finalLimit),
    queryFn: async () => {
      const apiData = await getActivityFeedApi(finalLimit);
      return transformActivityFeedResponse(apiData);
    },
    enabled: enabled && !!user, // Only fetch if user is logged in and enabled
    staleTime: 30000, // Data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    retry: 2, // Retry twice on failure
  });
};

