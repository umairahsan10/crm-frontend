/**
 * React Query hooks for Salary Management
 * 
 * This file contains all the query hooks for salary-related APIs.
 * Handles caching, loading states, and error handling automatically.
 * 
 * Benefits:
 * - Automatic caching and background refetching
 * - Deduplication of requests
 * - Optimistic updates
 * - Automatic retry on failure
 * - Query invalidation on mutations
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  getAllSalaries,
  getSalaryDetails,
  getSalaryPreview,
  getSalesEmployeesBonus,
  markSalaryRecordsApi,
  updateSalesEmployeeBonus,
  calculateAllSalaries,
  type SalaryFiltersParams,
  type BonusFiltersParams,
  type MarkSalaryPayload,
  type BonusDisplayResponse
} from '../../apis/finance/salary';
import type {
  SalaryDisplayAll,
  SalaryBreakdown,
  SalaryPreview,
  BonusUpdateRequest,
  BonusUpdateResponse,
  CalculateAllResponse
} from '../../types/finance/salary';

// Query Keys - Centralized for consistency
export const salaryQueryKeys = {
  all: ['salary'] as const,
  lists: () => [...salaryQueryKeys.all, 'list'] as const,
  list: (params: {
    month?: string;
    page?: number;
    limit?: number;
    filters?: SalaryFiltersParams;
  }) => [...salaryQueryKeys.lists(), params] as const,
  details: () => [...salaryQueryKeys.all, 'detail'] as const,
  detail: (employeeId: number, month?: string) => 
    [...salaryQueryKeys.details(), employeeId, month] as const,
  preview: () => [...salaryQueryKeys.all, 'preview'] as const,
  previewByEmployee: (employeeId: number, endDate?: string) =>
    [...salaryQueryKeys.preview(), employeeId, endDate] as const,
  bonus: () => [...salaryQueryKeys.all, 'bonus'] as const,
  bonusList: (params: {
    page?: number;
    limit?: number;
    filters?: BonusFiltersParams;
  }) => [...salaryQueryKeys.bonus(), 'list', params] as const,
};

/**
 * Hook to fetch all salaries with pagination and filters
 * 
 * @param month - Month in YYYY-MM format (defaults to current month)
 * @param page - Page number (defaults to 1)
 * @param limit - Items per page (defaults to 20)
 * @param filters - Filter parameters
 * @param options - Additional React Query options
 */
export const useSalaries = (
  month?: string,
  page: number = 1,
  limit: number = 20,
  filters?: SalaryFiltersParams,
  options?: Omit<UseQueryOptions<SalaryDisplayAll, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SalaryDisplayAll, Error>({
    queryKey: salaryQueryKeys.list({ month, page, limit, filters }),
    queryFn: () => getAllSalaries(month, page, limit, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - salary data changes moderately
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
    retry: 2,
    ...options,
  });
};

/**
 * Hook to fetch detailed salary breakdown for a specific employee
 * 
 * @param employeeId - Employee ID
 * @param month - Month in YYYY-MM format (optional)
 * @param options - Additional React Query options
 */
export const useSalaryDetails = (
  employeeId: number,
  month?: string,
  options?: Omit<UseQueryOptions<SalaryBreakdown, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SalaryBreakdown, Error>({
    queryKey: salaryQueryKeys.detail(employeeId, month),
    queryFn: () => getSalaryDetails(employeeId, month),
    staleTime: 3 * 60 * 1000, // 3 minutes - details don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: employeeId > 0 && (options?.enabled !== false),
    retry: 2,
    ...options,
  });
};

/**
 * Hook to fetch salary preview (read-only calculation)
 * 
 * @param employeeId - Employee ID
 * @param endDate - End date for calculation (optional)
 * @param options - Additional React Query options
 */
export const useSalaryPreview = (
  employeeId: number,
  endDate?: string,
  options?: Omit<UseQueryOptions<SalaryPreview, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SalaryPreview, Error>({
    queryKey: salaryQueryKeys.previewByEmployee(employeeId, endDate),
    queryFn: () => getSalaryPreview(employeeId, endDate),
    staleTime: 1 * 60 * 1000, // 1 minute - previews are calculated on-demand
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: employeeId > 0 && (options?.enabled !== false),
    retry: 1,
    ...options,
  });
};

/**
 * Hook to fetch sales employees bonus data
 * 
 * @param page - Page number (defaults to 1)
 * @param limit - Items per page (defaults to 20)
 * @param filters - Filter parameters
 * @param options - Additional React Query options
 */
export const useSalesEmployeesBonus = (
  page: number = 1,
  limit: number = 20,
  filters?: BonusFiltersParams,
  options?: Omit<UseQueryOptions<BonusDisplayResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<BonusDisplayResponse, Error>({
    queryKey: salaryQueryKeys.bonusList({ page, limit, filters }),
    queryFn: () => getSalesEmployeesBonus(page, limit, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
    retry: 2,
    ...options,
  });
};

/**
 * Mutation to mark salary records as paid (single or bulk)
 */
export const useMarkSalaryAsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; marked?: number },
    Error,
    MarkSalaryPayload
  >({
    mutationFn: markSalaryRecordsApi,
    onSuccess: (_data, variables) => {
      // Invalidate all salary lists to refetch updated data
      queryClient.invalidateQueries({
        queryKey: salaryQueryKeys.lists(),
      });
      
      // If marking a specific employee, invalidate their detail
      if (variables.employeeId) {
        queryClient.invalidateQueries({
          queryKey: salaryQueryKeys.detail(variables.employeeId, variables.month),
        });
      }
    },
    retry: 1,
  });
};

/**
 * Mutation to update sales employee bonus
 */
export const useUpdateSalesEmployeeBonus = () => {
  const queryClient = useQueryClient();

  return useMutation<BonusUpdateResponse, Error, BonusUpdateRequest>({
    mutationFn: updateSalesEmployeeBonus,
    onSuccess: () => {
      // Invalidate bonus list and salary lists
      queryClient.invalidateQueries({
        queryKey: salaryQueryKeys.bonus(),
      });
      queryClient.invalidateQueries({
        queryKey: salaryQueryKeys.lists(),
      });
    },
    retry: 1,
  });
};

/**
 * Mutation to calculate all salaries (bulk trigger)
 */
export const useCalculateAllSalaries = () => {
  const queryClient = useQueryClient();

  return useMutation<CalculateAllResponse, Error, void>({
    mutationFn: calculateAllSalaries,
    onSuccess: () => {
      // Invalidate all salary-related queries
      queryClient.invalidateQueries({
        queryKey: salaryQueryKeys.all,
      });
    },
    retry: 1,
  });
};

/**
 * Hook to prefetch salary data (useful for navigation or tab switching)
 */
export const usePrefetchSalary = () => {
  const queryClient = useQueryClient();

  const prefetchSalaries = (
    month?: string,
    page: number = 1,
    limit: number = 20,
    filters?: SalaryFiltersParams
  ) => {
    queryClient.prefetchQuery({
      queryKey: salaryQueryKeys.list({ month, page, limit, filters }),
      queryFn: () => getAllSalaries(month, page, limit, filters),
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchSalaryDetails = (employeeId: number, month?: string) => {
    queryClient.prefetchQuery({
      queryKey: salaryQueryKeys.detail(employeeId, month),
      queryFn: () => getSalaryDetails(employeeId, month),
      staleTime: 3 * 60 * 1000,
    });
  };

  return {
    prefetchSalaries,
    prefetchSalaryDetails,
  };
};

