import { useQuery } from '@tanstack/react-query';
import { getCurrentProjectsApi } from '../../apis/dashboard';
import { useAuth } from '../../context/AuthContext';
import type { CurrentProjectsApiResponse } from '../../apis/dashboard';

/**
 * Query keys for current projects
 */
export const currentProjectsQueryKeys = {
  all: ['current-projects'] as const,
  byUser: (department?: string, role?: string, employeeId?: number) => 
    [...currentProjectsQueryKeys.all, department, role, employeeId] as const,
};

/**
 * Hook to fetch current projects data
 * Automatically uses user's department and role from auth context
 * Returns up to 5 projects (running projects first, then completed)
 * For non-managers/unit heads, filters projects by user ID
 */
export const useCurrentProjects = (options?: { enabled?: boolean }) => {
  const { user } = useAuth();
  const { enabled = true } = options || {};

  // Determine if user is manager or unit head (should see all projects)
  // Managers: admin, sales department managers, or department managers
  // Unit heads: dep_manager role (unit heads in sales)
  const isManagerOrUnitHead = user?.role === 'admin' || 
                               (user?.role === 'sales' && user?.department === 'Sales') ||
                               user?.role === 'dep_manager';

  // Convert user.id (string) to number for API call if needed
  const employeeId = !isManagerOrUnitHead && user?.id ? Number(user.id) : undefined;

  return useQuery<CurrentProjectsApiResponse['projects'], Error>({
    queryKey: currentProjectsQueryKeys.byUser(user?.department, user?.role, employeeId),
    queryFn: async () => {
      const apiData = await getCurrentProjectsApi(employeeId);
      return apiData.projects;
    },
    enabled: enabled && !!user, // Only fetch if user is logged in and enabled
    staleTime: 30000, // Data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    retry: 2, // Retry twice on failure
  });
};

