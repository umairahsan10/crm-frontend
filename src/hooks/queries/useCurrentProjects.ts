import { useQuery } from '@tanstack/react-query';
import { getCurrentProjectsApi } from '../../apis/dashboard';
import { useAuth } from '../../context/AuthContext';
import type { CurrentProjectsApiResponse } from '../../apis/dashboard';

/**
 * Query keys for current projects
 */
export const currentProjectsQueryKeys = {
  all: ['current-projects'] as const,
  byUser: (department?: string, role?: string) => 
    [...currentProjectsQueryKeys.all, department, role] as const,
};

/**
 * Hook to fetch current projects data
 * Automatically uses user's department and role from auth context
 * Returns up to 5 projects (running projects first, then completed)
 */
export const useCurrentProjects = (options?: { enabled?: boolean }) => {
  const { user } = useAuth();
  const { enabled = true } = options || {};

  return useQuery<CurrentProjectsApiResponse['projects'], Error>({
    queryKey: currentProjectsQueryKeys.byUser(user?.department, user?.role),
    queryFn: async () => {
      const apiData = await getCurrentProjectsApi();
      return apiData.projects;
    },
    enabled: enabled && !!user, // Only fetch if user is logged in and enabled
    staleTime: 30000, // Data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    retry: 2, // Retry twice on failure
  });
};

