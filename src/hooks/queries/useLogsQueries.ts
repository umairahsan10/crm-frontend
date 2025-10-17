/**
 * React Query Hooks for HR Logs Modules
 * 
 * Centralized query management for:
 * - Access Logs (login/logout tracking)
 * - Late Logs (late arrivals)
 * - Leave Logs (leave requests)
 * - Half Day Logs (half day requests)
 * - Salary Logs (salary changes)
 * - HR Logs (HR activities)
 * 
 * Benefits:
 * - Automatic caching and background refetching
 * - Deduplication of requests
 * - Optimistic updates
 * - Automatic retry on failure
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { 
  getAccessLogsApi,
  getAccessLogsStatsApi,
  type GetAccessLogsDto
} from '../../apis/access-logs';
import {
  getLateLogsApi,
  getLateLogsStatsApi,
  type GetLateLogsDto
} from '../../apis/late-logs';
import {
  getLeaveLogsApi,
  getLeaveLogsStatsApi,
  type GetLeaveLogsDto
} from '../../apis/leave-logs';
import {
  getHalfDayLogsApi,
  getHalfDayLogsStatsApi,
  type GetHalfDayLogsDto
} from '../../apis/halfday-logs';
import {
  getSalaryLogsApi,
  getSalaryLogsStatsApi,
  type GetSalaryLogsDto
} from '../../apis/salary-logs';
import {
  getHrLogsApi,
  getHrLogsStatsApi,
  type GetHrLogsDto
} from '../../apis/hr-logs';

// ============================================================================
// QUERY KEYS - Centralized key management for cache invalidation
// ============================================================================

export const logsQueryKeys = {
  all: ['logs'] as const,
  
  accessLogs: {
    all: ['logs', 'access'] as const,
    lists: () => [...logsQueryKeys.accessLogs.all, 'list'] as const,
    list: (filters: any) => [...logsQueryKeys.accessLogs.lists(), filters] as const,
    stats: () => [...logsQueryKeys.accessLogs.all, 'stats'] as const,
  },

  lateLogs: {
    all: ['logs', 'late'] as const,
    lists: () => [...logsQueryKeys.lateLogs.all, 'list'] as const,
    list: (filters: any) => [...logsQueryKeys.lateLogs.lists(), filters] as const,
    stats: () => [...logsQueryKeys.lateLogs.all, 'stats'] as const,
  },

  leaveLogs: {
    all: ['logs', 'leave'] as const,
    lists: () => [...logsQueryKeys.leaveLogs.all, 'list'] as const,
    list: (filters: any) => [...logsQueryKeys.leaveLogs.lists(), filters] as const,
    stats: () => [...logsQueryKeys.leaveLogs.all, 'stats'] as const,
  },

  halfDayLogs: {
    all: ['logs', 'halfday'] as const,
    lists: () => [...logsQueryKeys.halfDayLogs.all, 'list'] as const,
    list: (filters: any) => [...logsQueryKeys.halfDayLogs.lists(), filters] as const,
    stats: () => [...logsQueryKeys.halfDayLogs.all, 'stats'] as const,
  },

  salaryLogs: {
    all: ['logs', 'salary'] as const,
    lists: () => [...logsQueryKeys.salaryLogs.all, 'list'] as const,
    list: (filters: any) => [...logsQueryKeys.salaryLogs.lists(), filters] as const,
    stats: () => [...logsQueryKeys.salaryLogs.all, 'stats'] as const,
  },

  hrLogs: {
    all: ['logs', 'hr'] as const,
    lists: () => [...logsQueryKeys.hrLogs.all, 'list'] as const,
    list: (filters: any) => [...logsQueryKeys.hrLogs.lists(), filters] as const,
    stats: () => [...logsQueryKeys.hrLogs.all, 'stats'] as const,
  },
};

// ============================================================================
// ACCESS LOGS QUERIES
// ============================================================================

/**
 * Hook to fetch paginated access logs with filters
 */
export const useAccessLogs = (
  page: number = 1,
  limit: number = 20,
  filters: Partial<GetAccessLogsDto> = {},
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: logsQueryKeys.accessLogs.list({ page, limit, ...filters }),
    queryFn: async () => {
      console.log('🔍 [LOGS] Fetching access logs with filters:', { page, limit, ...filters });
      const response = await getAccessLogsApi({ page, limit, ...filters });
      console.log('✅ [LOGS] Access logs fetched successfully:', response);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
    ...options,
  });
};

/**
 * Hook to fetch access logs statistics
 */
export const useAccessLogsStatistics = (
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: logsQueryKeys.accessLogs.stats(),
    queryFn: async () => {
      console.log('📊 [LOGS] Fetching access logs statistics...');
      const response = await getAccessLogsStatsApi();
      console.log('✅ [LOGS] Statistics received:', response);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled !== false,
    ...options,
  });
};

// ============================================================================
// LATE LOGS QUERIES
// ============================================================================

/**
 * Hook to fetch late logs with filters
 */
export const useLateLogs = (
  filters: Partial<GetLateLogsDto> = {},
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: logsQueryKeys.lateLogs.list(filters),
    queryFn: async () => {
      console.log('🔍 [LOGS] Fetching late logs with filters:', filters);
      const response = await getLateLogsApi(filters);
      console.log('✅ [LOGS] Late logs fetched successfully:', response);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
    ...options,
  });
};

/**
 * Hook to fetch late logs statistics
 */
export const useLateLogsStatistics = (
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: logsQueryKeys.lateLogs.stats(),
    queryFn: async () => {
      console.log('📊 [LOGS] Fetching late logs statistics...');
      const response = await getLateLogsStatsApi({ period: 'monthly', include_breakdown: true });
      console.log('✅ [LOGS] Statistics received:', response);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled !== false,
    ...options,
  });
};

// ============================================================================
// LEAVE LOGS QUERIES
// ============================================================================

/**
 * Hook to fetch leave logs with filters
 */
export const useLeaveLogs = (
  filters: Partial<GetLeaveLogsDto> = {},
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: logsQueryKeys.leaveLogs.list(filters),
    queryFn: async () => {
      console.log('🔍 [LOGS] Fetching leave logs with filters:', filters);
      const response = await getLeaveLogsApi(filters);
      console.log('✅ [LOGS] Leave logs fetched successfully:', response);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
    ...options,
  });
};

/**
 * Hook to fetch leave logs statistics
 */
export const useLeaveLogsStatistics = (
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: logsQueryKeys.leaveLogs.stats(),
    queryFn: async () => {
      console.log('📊 [LOGS] Fetching leave logs statistics...');
      const response = await getLeaveLogsStatsApi({ period: 'monthly', include_breakdown: true });
      console.log('✅ [LOGS] Statistics received:', response);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled !== false,
    ...options,
  });
};

// ============================================================================
// HALF DAY LOGS QUERIES
// ============================================================================

export const useHalfDayLogs = (
  filters: Partial<GetHalfDayLogsDto> = {},
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: logsQueryKeys.halfDayLogs.list(filters),
    queryFn: async () => {
      console.log('🔍 [LOGS] Fetching half day logs with filters:', filters);
      const response = await getHalfDayLogsApi(filters);
      console.log('✅ [LOGS] Half day logs fetched successfully:', response);
      return response;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false,
    ...options,
  });
};

export const useHalfDayLogsStatistics = (
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: logsQueryKeys.halfDayLogs.stats(),
    queryFn: async () => {
      console.log('📊 [LOGS] Fetching half day logs statistics...');
      const response = await getHalfDayLogsStatsApi();
      console.log('✅ [LOGS] Statistics received:', response);
      return response;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled !== false,
    ...options,
  });
};

// ============================================================================
// SALARY LOGS QUERIES
// ============================================================================

export const useSalaryLogs = (
  filters: Partial<GetSalaryLogsDto> = {},
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: logsQueryKeys.salaryLogs.list(filters),
    queryFn: async () => {
      console.log('🔍 [LOGS] Fetching salary logs with filters:', filters);
      const response = await getSalaryLogsApi(filters);
      console.log('✅ [LOGS] Salary logs fetched successfully:', response);
      return response;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false,
    ...options,
  });
};

export const useSalaryLogsStatistics = (
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: logsQueryKeys.salaryLogs.stats(),
    queryFn: async () => {
      console.log('📊 [LOGS] Fetching salary logs statistics...');
      const response = await getSalaryLogsStatsApi();
      console.log('✅ [LOGS] Statistics received:', response);
      return response;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled !== false,
    ...options,
  });
};

// ============================================================================
// HR LOGS QUERIES
// ============================================================================

export const useHRLogs = (
  filters: Partial<GetHrLogsDto> = {},
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: logsQueryKeys.hrLogs.list(filters),
    queryFn: async () => {
      console.log('🔍 [LOGS] Fetching HR logs with filters:', filters);
      const response = await getHrLogsApi(filters);
      console.log('✅ [LOGS] HR logs fetched successfully:', response);
      return response;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false,
    ...options,
  });
};

export const useHRLogsStatistics = (
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: logsQueryKeys.hrLogs.stats(),
    queryFn: async () => {
      console.log('📊 [LOGS] Fetching HR logs statistics...');
      const response = await getHrLogsStatsApi();
      console.log('✅ [LOGS] Statistics received:', response);
      return response;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled !== false,
    ...options,
  });
};

