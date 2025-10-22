/**
 * React Query Hooks for HR Module
 * 
 * Centralized query management for:
 * - Employees (with pagination, filters, and statistics)
 * - Departments
 * - Roles
 * - Employee statistics
 * 
 * Benefits:
 * - Automatic caching and background refetching
 * - Deduplication of requests
 * - Optimistic updates
 * - Automatic retry on failure
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { 
  getEmployeesApi, 
  getEmployeeByIdApi,
  getDepartmentsApi,
  getRolesApi,
  getEmployeeStatisticsApi,
  createEmployeeApi,
  updateEmployeeApi,
  terminateEmployeeApi,
  type GetEmployeesDto,
  type CreateEmployeeDto,
  type UpdateEmployeeDto
} from '../../apis/hr-employees';
import {
  getAttendanceLogsApi,
  type AttendanceLogDto
} from '../../apis/attendance';

// ============================================================================
// QUERY KEYS - Centralized key management for cache invalidation
// ============================================================================

export const hrQueryKeys = {
  all: ['hr'] as const,
  
  employees: {
    all: ['hr', 'employees'] as const,
    lists: () => [...hrQueryKeys.employees.all, 'list'] as const,
    list: (filters: any) => [...hrQueryKeys.employees.lists(), filters] as const,
    details: () => [...hrQueryKeys.employees.all, 'detail'] as const,
    detail: (id: string | number) => [...hrQueryKeys.employees.details(), id] as const,
  },
  
  statistics: {
    all: ['hr', 'statistics'] as const,
    employees: () => [...hrQueryKeys.statistics.all, 'employees'] as const,
  },
  
  departments: {
    all: ['hr', 'departments'] as const,
    lists: () => [...hrQueryKeys.departments.all, 'list'] as const,
    list: (params?: any) => [...hrQueryKeys.departments.lists(), params || {}] as const,
  },
  
  roles: {
    all: ['hr', 'roles'] as const,
    lists: () => [...hrQueryKeys.roles.all, 'list'] as const,
    list: (params?: any) => [...hrQueryKeys.roles.lists(), params || {}] as const,
  },

  attendance: {
    all: ['hr', 'attendance'] as const,
    logs: () => [...hrQueryKeys.attendance.all, 'logs'] as const,
    log: (filters: any) => [...hrQueryKeys.attendance.logs(), filters] as const,
    statistics: (date: string) => [...hrQueryKeys.attendance.all, 'statistics', date] as const,
  },
};

// ============================================================================
// EMPLOYEE QUERIES
// ============================================================================

/**
 * Hook to fetch paginated employees list with filters
 * 
 * Features:
 * - Automatic pagination
 * - Filter support (search, department, role, status, etc.)
 * - Background refetching
 * - Cached for 2 minutes
 * 
 * @param page - Current page number
 * @param limit - Items per page
 * @param filters - Filter object
 * @param options - Additional React Query options
 */
export const useEmployees = (
  page: number = 1,
  limit: number = 20,
  filters: Partial<GetEmployeesDto> = {},
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: hrQueryKeys.employees.list({ page, limit, ...filters }),
    queryFn: async () => {
      console.log('🔍 [HR] Fetching employees with filters:', { page, limit, ...filters });
      const response = await getEmployeesApi({ 
        page, 
        limit, 
        ...filters 
      });
      console.log('✅ [HR] Employees fetched successfully:', response);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - employees data changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
    ...options,
  });
};

export const useActiveEmployees = (
  page: number = 1,
  limit: number = 20,
  filters: Partial<GetEmployeesDto> = {},
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useEmployees(page, limit, { ...filters, status: 'active' }, options);
};


export const useTerminatedEmployees = (
  page: number = 1,
  limit: number = 20,
  filters: Partial<GetEmployeesDto> = {},
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useEmployees(page, limit, { ...filters, status: 'terminated' }, options);
};

export const useInactiveEmployees = (
  page: number = 1,
  limit: number = 20,
  filters: Partial<GetEmployeesDto> = {},
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useEmployees(page, limit, { ...filters, status: 'inactive' }, options);
};


/**
 * Hook to fetch single employee details
 * 
 * @param employeeId - Employee ID to fetch
 * @param options - Additional React Query options
 */
export const useEmployee = (
  employeeId: string | number | null,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: hrQueryKeys.employees.detail(employeeId!),
    queryFn: async () => {
      console.log('🔍 [HR] Fetching employee details:', employeeId);
      const id = typeof employeeId === 'string' ? parseInt(employeeId) : employeeId!;
      const response = await getEmployeeByIdApi(id);
      console.log('✅ [HR] Employee details fetched:', response);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!employeeId && options?.enabled !== false,
    ...options,
  });
};

/**
 * Hook to fetch employee statistics
 * 
 * Features:
 * - Total, active, inactive counts
 * - Breakdown by department, role, gender, etc.
 * - This month's statistics
 * - Cached for 5 minutes
 */
export const useEmployeeStatistics = (
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: hrQueryKeys.statistics.employees(),
    queryFn: async () => {
      console.log('📊 [HR] Fetching employee statistics...');
      const response = await getEmployeeStatisticsApi();
      console.log('✅ [HR] Statistics received:', response);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - statistics don't change very often
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled !== false,
    ...options,
  });
};

// ============================================================================
// DEPARTMENT QUERIES
// ============================================================================

/**
 * Hook to fetch all departments
 * 
 * Features:
 * - Cached for 10 minutes (departments rarely change)
 * - Used for filters and dropdowns
 */
export const useDepartments = (
  params?: { limit?: number },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: hrQueryKeys.departments.list(params),
    queryFn: async () => {
      console.log('🔍 [HR] Fetching departments...');
      const response = await getDepartmentsApi(params || { limit: 100 });
      console.log('✅ [HR] Departments fetched:', response);
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - departments rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: options?.enabled !== false,
    ...options,
  });
};

// ============================================================================
// ROLE QUERIES
// ============================================================================

/**
 * Hook to fetch all roles
 * 
 * Features:
 * - Cached for 10 minutes (roles rarely change)
 * - Used for filters and dropdowns
 */
export const useRoles = (
  params?: { limit?: number },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: hrQueryKeys.roles.list(params),
    queryFn: async () => {
      console.log('🔍 [HR] Fetching roles...');
      const response = await getRolesApi(params || { limit: 100 });
      console.log('✅ [HR] Roles fetched:', response);
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - roles rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: options?.enabled !== false,
    ...options,
  });
};

// ============================================================================
// MUTATIONS - For Create, Update, Delete operations
// ============================================================================

/**
 * Hook to create a new employee
 * 
 * Features:
 * - Automatic cache invalidation after success
 * - Refetches employees list and statistics
 */
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateEmployeeDto) => {
      console.log('➕ [HR] Creating employee:', data);
      const response = await createEmployeeApi(data);
      console.log('✅ [HR] Employee created:', response);
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch employees list and statistics
      queryClient.invalidateQueries({ queryKey: hrQueryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: hrQueryKeys.statistics.all });
    },
  });
};

/**
 * Hook to update an existing employee
 * 
 * Features:
 * - Automatic cache invalidation after success
 * - Refetches specific employee and lists
 */
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: UpdateEmployeeDto }) => {
      console.log('✏️ [HR] Updating employee:', id, data);
      const employeeId = typeof id === 'string' ? parseInt(id) : id;
      const response = await updateEmployeeApi(employeeId, data);
      console.log('✅ [HR] Employee updated:', response);
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific employee and lists
      queryClient.invalidateQueries({ queryKey: hrQueryKeys.employees.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrQueryKeys.employees.lists() });
      queryClient.invalidateQueries({ queryKey: hrQueryKeys.statistics.all });
    },
  });
};

/**
 * Hook to terminate an employee
 * 
 * Features:
 * - Automatic cache invalidation after success
 * - Refetches employees list and statistics
 */
export const useTerminateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { employeeId: number; termination_date: string; description?: string }) => {
      console.log('🚫 [HR] Terminating employee:', data);
      const terminateData = {
        employee_id: data.employeeId,
        termination_date: data.termination_date,
        description: data.description
      };
      const response = await terminateEmployeeApi(terminateData);
      console.log('✅ [HR] Employee terminated:', response);
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: hrQueryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: hrQueryKeys.statistics.all });
    },
  });
};

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook to prefetch employee details
 * Useful for hover interactions or predictive loading
 */
export const usePrefetchEmployee = () => {
  const queryClient = useQueryClient();
  
  return (employeeId: string | number) => {
    const id = typeof employeeId === 'string' ? parseInt(employeeId) : employeeId;
    queryClient.prefetchQuery({
      queryKey: hrQueryKeys.employees.detail(employeeId),
      queryFn: () => getEmployeeByIdApi(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};

/**
 * Hook to manually invalidate employee queries
 * Useful for force refresh scenarios
 */
export const useInvalidateEmployees = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: hrQueryKeys.employees.all });
    queryClient.invalidateQueries({ queryKey: hrQueryKeys.statistics.all });
  };
};

// ============================================================================
// ATTENDANCE QUERIES
// ============================================================================

/**
 * Hook to fetch attendance logs with filters and date range
 */
export const useAttendanceLogs = (
  filters: AttendanceLogDto,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: hrQueryKeys.attendance.log(filters),
    queryFn: async () => {
      console.log('🔍 [ATTENDANCE] Fetching attendance logs with filters:', filters);
      const response = await getAttendanceLogsApi(filters);
      console.log('✅ [ATTENDANCE] Attendance logs fetched successfully:', response);
      return response;
    },
    staleTime: 1 * 60 * 1000, // 1 minute - attendance changes frequently
    gcTime: 3 * 60 * 1000, // 3 minutes
    enabled: options?.enabled !== false,
    ...options,
  });
};

/**
 * Hook for attendance mutations (check-in, check-out, bulk mark)
 * Returns mutation object with invalidation on success
 */
export const useAttendanceMutation = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAttendance: (filters?: AttendanceLogDto) => {
      if (filters) {
        queryClient.invalidateQueries({ queryKey: hrQueryKeys.attendance.log(filters) });
      } else {
        queryClient.invalidateQueries({ queryKey: hrQueryKeys.attendance.all });
      }
    }
  };
};

