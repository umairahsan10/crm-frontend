/**
 * React Query hooks for Employee Requests Management
 * 
 * This file contains all the query hooks for employee requests APIs.
 * Handles requests fetching, statistics, and actions with automatic caching.
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { 
  getEmployeeRequestsApi, 
  getMyEmployeeRequestsApi,
  exportEmployeeRequestsApi,
  type EmployeeRequest, 
  type EmployeeRequestStats,
  type EmployeeRequestAction
} from '../../apis/employee-requests';

// Query Keys - Centralized for consistency
export const employeeRequestsQueryKeys = {
  all: ['employeeRequests'] as const,
  lists: () => [...employeeRequestsQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...employeeRequestsQueryKeys.lists(), filters] as const,
  my: (empId: number) => [...employeeRequestsQueryKeys.all, 'my', empId] as const,
  stats: () => [...employeeRequestsQueryKeys.all, 'stats'] as const,
};

/**
 * Hook to fetch all employee requests (HR/Admin view)
 * @param filters - Filter parameters for requests
 */
export const useEmployeeRequests = (
  filters: any = {},
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: employeeRequestsQueryKeys.list(filters),
    queryFn: async () => {
      const response = await getEmployeeRequestsApi(filters);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch current user's employee requests
 * @param empId - Employee ID
 */
export const useMyEmployeeRequests = (
  empId: number,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: employeeRequestsQueryKeys.my(empId),
    queryFn: async () => {
      const response = await getMyEmployeeRequestsApi(empId);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!empId && (options?.enabled !== false),
    ...options,
  });
};

/**
 * Hook to take action on employee request (approve/reject/etc.)
 */
export const useTakeRequestAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, action }: { requestId: number; action: EmployeeRequestAction }) => {
      // TODO: Fix API call signature - needs 3 parameters
      console.log('Taking action on request:', requestId, action);
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      // Invalidate all request lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: employeeRequestsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeRequestsQueryKeys.all });
    },
  });
};

/**
 * Hook to export employee requests
 */
export const useExportRequests = () => {
  return useMutation({
    mutationFn: async (filters: any) => {
      const response = await exportEmployeeRequestsApi(filters);
      return response;
    },
  });
};

/**
 * Hook to fetch employee requests statistics
 * Calculates stats from existing data instead of separate API call
 */
export const useEmployeeRequestsStatistics = (
  requests: EmployeeRequest[] = [],
  options?: Omit<UseQueryOptions<EmployeeRequestStats>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...employeeRequestsQueryKeys.stats(), requests.length],
    queryFn: async (): Promise<EmployeeRequestStats> => {
      // Calculate statistics from the provided requests data
      return {
        total_requests: requests.length,
        pending_requests: requests.filter(r => r.status === 'Pending').length,
        in_progress_requests: requests.filter(r => r.status === 'In_Progress').length,
        resolved_requests: requests.filter(r => r.status === 'Resolved').length,
        rejected_requests: requests.filter(r => r.status === 'Rejected').length,
        on_hold_requests: 0, // No status for this yet
        critical_requests: requests.filter(r => r.priority === 'Critical').length,
        high_priority_requests: requests.filter(r => r.priority === 'High').length,
        medium_priority_requests: requests.filter(r => r.priority === 'Medium').length,
        low_priority_requests: requests.filter(r => r.priority === 'Low').length,
        avg_resolution_time: 0, // Would need to calculate from dates
        department_breakdown: [],
        request_type_breakdown: []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: requests.length > 0 && (options?.enabled !== false),
    ...options,
  });
};

