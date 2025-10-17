/**
 * React Query hooks for Finance Management
 * 
 * This file contains all the query hooks for finance-related APIs.
 * Each hook handles caching, loading states, and error handling automatically.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getExpensesApi,
  getExpensesStatisticsApi
} from '../../apis/expenses';
import { 
  getRevenuesApi,
  getRevenuesStatisticsApi
} from '../../apis/revenue';
import { 
  getAssetsApi,
  getAssetsStatisticsApi
} from '../../apis/assets';
import { 
  getLiabilitiesApi,
  getLiabilitiesStatisticsApi
} from '../../apis/liabilities';
import { getVendorsApi } from '../../apis/vendors';
import {
  getPayrollApi,
  getPayrollStatisticsApi,
  type GetPayrollDto
} from '../../apis/payroll';

// Query Keys - Centralized for consistency
export const financeQueryKeys = {
  all: ['finance'] as const,
  expenses: () => [...financeQueryKeys.all, 'expenses'] as const,
  expensesList: (filters: any) => [...financeQueryKeys.expenses(), 'list', filters] as const,
  expensesStats: () => [...financeQueryKeys.expenses(), 'statistics'] as const,
  revenue: () => [...financeQueryKeys.all, 'revenue'] as const,
  revenueList: (filters: any) => [...financeQueryKeys.revenue(), 'list', filters] as const,
  revenueStats: () => [...financeQueryKeys.revenue(), 'statistics'] as const,
  assets: () => [...financeQueryKeys.all, 'assets'] as const,
  assetsList: (filters: any) => [...financeQueryKeys.assets(), 'list', filters] as const,
  assetsStats: () => [...financeQueryKeys.assets(), 'statistics'] as const,
  liabilities: () => [...financeQueryKeys.all, 'liabilities'] as const,
  liabilitiesList: (filters: any) => [...financeQueryKeys.liabilities(), 'list', filters] as const,
  liabilitiesStats: () => [...financeQueryKeys.liabilities(), 'statistics'] as const,
  vendors: () => [...financeQueryKeys.all, 'vendors'] as const,
  payroll: () => [...financeQueryKeys.all, 'payroll'] as const,
  payrollList: (filters: any) => [...financeQueryKeys.payroll(), 'list', filters] as const,
  payrollStats: () => [...financeQueryKeys.payroll(), 'statistics'] as const,
};

/**
 * Hook to fetch expenses with pagination and filters
 */
export const useExpenses = (page: number = 1, limit: number = 20, filters: any = {}, options: any = {}) => {
  return useQuery({
    queryKey: financeQueryKeys.expensesList({ page, limit, ...filters }),
    queryFn: () => getExpensesApi(page, limit, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - expenses data changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to fetch expenses statistics
 */
export const useExpensesStatistics = (options: any = {}) => {
  return useQuery({
    queryKey: financeQueryKeys.expensesStats(),
    queryFn: getExpensesStatisticsApi,
    staleTime: 5 * 60 * 1000, // 5 minutes - statistics don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to fetch revenue with pagination and filters
 */
export const useRevenue = (page: number = 1, limit: number = 20, filters: any = {}, options: any = {}) => {
  return useQuery({
    queryKey: financeQueryKeys.revenueList({ page, limit, ...filters }),
    queryFn: () => getRevenuesApi(page, limit, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - revenue data changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to fetch revenue statistics
 */
export const useRevenueStatistics = (options: any = {}) => {
  return useQuery({
    queryKey: financeQueryKeys.revenueStats(),
    queryFn: getRevenuesStatisticsApi,
    staleTime: 5 * 60 * 1000, // 5 minutes - statistics don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to fetch assets with pagination and filters
 */
export const useAssets = (page: number = 1, limit: number = 20, filters: any = {}, options: any = {}) => {
  return useQuery({
    queryKey: financeQueryKeys.assetsList({ page, limit, ...filters }),
    queryFn: () => getAssetsApi(page, limit, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes - assets don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to fetch assets statistics
 */
export const useAssetsStatistics = (options: any = {}) => {
  return useQuery({
    queryKey: financeQueryKeys.assetsStats(),
    queryFn: getAssetsStatisticsApi,
    staleTime: 5 * 60 * 1000, // 5 minutes - statistics don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to fetch liabilities with pagination and filters
 */
export const useLiabilities = (page: number = 1, limit: number = 20, filters: any = {}, options: any = {}) => {
  return useQuery({
    queryKey: financeQueryKeys.liabilitiesList({ page, limit, ...filters }),
    queryFn: () => getLiabilitiesApi(page, limit, filters),
    staleTime: 3 * 60 * 1000, // 3 minutes - liabilities change moderately
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to fetch liabilities statistics
 */
export const useLiabilitiesStatistics = (options: any = {}) => {
  return useQuery({
    queryKey: financeQueryKeys.liabilitiesStats(),
    queryFn: getLiabilitiesStatisticsApi,
    staleTime: 5 * 60 * 1000, // 5 minutes - statistics don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to fetch vendors (for assets and liabilities)
 */
export const useVendors = (options: any = {}) => {
  return useQuery({
    queryKey: financeQueryKeys.vendors(),
    queryFn: getVendorsApi,
    staleTime: 10 * 60 * 1000, // 10 minutes - vendors don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to prefetch finance data (useful for tab switching)
 */
export const usePrefetchFinance = () => {
  const queryClient = useQueryClient();
  
  const prefetchExpenses = (page: number = 1, limit: number = 20, filters: any = {}) => {
    queryClient.prefetchQuery({
      queryKey: financeQueryKeys.expensesList({ page, limit, ...filters }),
      queryFn: () => getExpensesApi(page, limit, filters),
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchRevenue = (page: number = 1, limit: number = 20, filters: any = {}) => {
    queryClient.prefetchQuery({
      queryKey: financeQueryKeys.revenueList({ page, limit, ...filters }),
      queryFn: () => getRevenuesApi(page, limit, filters),
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchAssets = (page: number = 1, limit: number = 20, filters: any = {}) => {
    queryClient.prefetchQuery({
      queryKey: financeQueryKeys.assetsList({ page, limit, ...filters }),
      queryFn: () => getAssetsApi(page, limit, filters),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchLiabilities = (page: number = 1, limit: number = 20, filters: any = {}) => {
    queryClient.prefetchQuery({
      queryKey: financeQueryKeys.liabilitiesList({ page, limit, ...filters }),
      queryFn: () => getLiabilitiesApi(page, limit, filters),
      staleTime: 3 * 60 * 1000,
    });
  };

  return {
    prefetchExpenses,
    prefetchRevenue,
    prefetchAssets,
    prefetchLiabilities,
  };
};

/**
 * Hook to fetch payroll with pagination and filters
 */
export const usePayroll = (page: number = 1, limit: number = 20, filters: GetPayrollDto = {}, options: any = {}) => {
  return useQuery({
    queryKey: financeQueryKeys.payrollList({ page, limit, ...filters }),
    queryFn: () => getPayrollApi({ page, limit, ...filters }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to fetch payroll statistics
 */
export const usePayrollStatistics = (options: any = {}) => {
  return useQuery({
    queryKey: financeQueryKeys.payrollStats(),
    queryFn: () => getPayrollStatisticsApi(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: options.enabled !== false,
  });
};
