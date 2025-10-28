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
  takeEmployeeRequestActionApi,
  updateEmployeeRequestActionApi,
  type EmployeeRequest, 
  type EmployeeRequestStats,
  type EmployeeRequestAction
} from '../../apis/employee-requests';
import { useAuth } from '../../context/AuthContext';

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
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ requestId, action }: { requestId: number; action: EmployeeRequestAction }) => {
      const hrEmployeeId = Number(user?.id);
      if (!hrEmployeeId || Number.isNaN(hrEmployeeId)) {
        throw new Error('Missing HR employee id');
      }

      try {
        // Try creating/upserting the action first
        return await takeEmployeeRequestActionApi(requestId, hrEmployeeId, action);
      } catch (err) {
        // If the backend expects an update, retry with PUT
        return await updateEmployeeRequestActionApi(requestId, hrEmployeeId, action);
      }
    },
    onMutate: async ({ requestId, action }) => {
      // Cancel outgoing refetches so we don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: employeeRequestsQueryKeys.all });

      // Snapshot previous data across all related queries for rollback
      const previousData = queryClient.getQueriesData({ queryKey: employeeRequestsQueryKeys.all });

      // Produce an updater that applies the action to a single request
      const applyActionToRequest = (request: any) => {
        if (!request || request.id !== requestId) return request;
        return {
          ...request,
          status: action.status ?? request.status,
          responseNotes: action.responseNotes ?? request.responseNotes,
          priority: action.priority ?? request.priority,
          assignedTo: action.assignedTo ?? request.assignedTo,
          requestType: action.requestType ?? request.requestType,
          subject: action.subject ?? request.subject,
          description: action.description ?? request.description,
          updatedAt: new Date().toISOString(),
        };
      };

      // Optimistically update all list and my-requests caches
      queryClient.setQueriesData({ queryKey: employeeRequestsQueryKeys.all, exact: false }, (data: any) => {
        if (!data) return data;
        // HR/Admin list shape: { data: EmployeeRequest[], meta: {...} }
        if (data && Array.isArray(data.data)) {
          return {
            ...data,
            data: data.data.map((req: any) => applyActionToRequest(req)),
          };
        }
        // My requests shape: EmployeeRequest[]
        if (Array.isArray(data)) {
          return data.map((req: any) => applyActionToRequest(req));
        }
        return data;
      });

      // Return context for potential rollback
      return { previousData };
    },
    onError: (_err, _vars, context) => {
      // Rollback optimistic update on error
      if (context?.previousData) {
        for (const [key, data] of context.previousData as Array<[unknown, unknown]>) {
          queryClient.setQueryData(key as any, data);
        }
      }
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

