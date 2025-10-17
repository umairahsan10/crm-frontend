/**
 * React Query hooks for Leads Management
 * 
 * This file contains all the query hooks for leads-related APIs.
 * Each hook handles caching, loading states, and error handling automatically.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getLeadsApi, 
  getCrackedLeadsApi, 
  getArchivedLeadsApi, 
  getLeadsStatisticsApi,
  getSalesUnitsApi,
  getFilterEmployeesApi
} from '../../apis/leads';
import { getActiveIndustriesApi } from '../../apis/industries';

// Query Keys - Centralized for consistency
export const leadsQueryKeys = {
  all: ['leads'] as const,
  lists: () => [...leadsQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...leadsQueryKeys.lists(), filters] as const,
  details: () => [...leadsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadsQueryKeys.details(), id] as const,
  statistics: () => [...leadsQueryKeys.all, 'statistics'] as const,
  salesUnits: () => [...leadsQueryKeys.all, 'salesUnits'] as const,
  employees: (salesUnitId?: number) => [...leadsQueryKeys.all, 'employees', salesUnitId] as const,
  industries: () => [...leadsQueryKeys.all, 'industries'] as const,
  cracked: () => [...leadsQueryKeys.all, 'cracked'] as const,
  crackedList: (filters: any) => [...leadsQueryKeys.cracked(), 'list', filters] as const,
  archived: () => [...leadsQueryKeys.all, 'archived'] as const,
  archivedList: (filters: any) => [...leadsQueryKeys.archived(), 'list', filters] as const,
};

/**
 * Hook to fetch regular leads with pagination and filters
 */
export const useLeads = (page: number = 1, limit: number = 20, filters: any = {}, options: any = {}) => {
  return useQuery({
    queryKey: leadsQueryKeys.list({ page, limit, ...filters }),
    queryFn: () => getLeadsApi(page, limit, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - leads data changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options.enabled !== false, // Default to true, but allow override
  });
};

/**
 * Hook to fetch cracked leads with pagination and filters
 */
export const useCrackedLeads = (page: number = 1, limit: number = 20, filters: any = {}, options: any = {}) => {
  return useQuery({
    queryKey: leadsQueryKeys.crackedList({ page, limit, ...filters }),
    queryFn: () => getCrackedLeadsApi(page, limit, filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to fetch archived leads with pagination and filters
 */
export const useArchivedLeads = (page: number = 1, limit: number = 20, filters: any = {}, options: any = {}) => {
  return useQuery({
    queryKey: leadsQueryKeys.archivedList({ page, limit, ...filters }),
    queryFn: () => getArchivedLeadsApi(page, limit, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes - archived data rarely changes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to fetch leads statistics
 */
export const useLeadsStatistics = (options: any = {}) => {
  return useQuery({
    queryKey: leadsQueryKeys.statistics(),
    queryFn: getLeadsStatisticsApi,
    staleTime: 5 * 60 * 1000, // 5 minutes - statistics don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to fetch sales units (for filter dropdowns)
 */
export const useSalesUnits = () => {
  return useQuery({
    queryKey: leadsQueryKeys.salesUnits(),
    queryFn: getSalesUnitsApi,
    staleTime: 10 * 60 * 1000, // 10 minutes - sales units rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: true,
  });
};

/**
 * Hook to fetch employees (for filter dropdowns and bulk actions)
 */
export const useFilterEmployees = (salesUnitId?: number) => {
  return useQuery({
    queryKey: leadsQueryKeys.employees(salesUnitId),
    queryFn: () => getFilterEmployeesApi(salesUnitId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: true,
  });
};

/**
 * Hook to fetch industries (for crack leads filter)
 */
export const useIndustries = (options: any = {}) => {
  return useQuery({
    queryKey: leadsQueryKeys.industries(),
    queryFn: getActiveIndustriesApi,
    staleTime: 10 * 60 * 1000, // 10 minutes - industries rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to prefetch leads data (useful for tab switching)
 */
export const usePrefetchLeads = () => {
  const queryClient = useQueryClient();
  
  const prefetchLeads = (page: number = 1, limit: number = 20, filters: any = {}) => {
    queryClient.prefetchQuery({
      queryKey: leadsQueryKeys.list({ page, limit, ...filters }),
      queryFn: () => getLeadsApi(page, limit, filters),
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchCrackedLeads = (page: number = 1, limit: number = 20, filters: any = {}) => {
    queryClient.prefetchQuery({
      queryKey: leadsQueryKeys.crackedList({ page, limit, ...filters }),
      queryFn: () => getCrackedLeadsApi(page, limit, filters),
      staleTime: 3 * 60 * 1000,
    });
  };

  const prefetchArchivedLeads = (page: number = 1, limit: number = 20, filters: any = {}) => {
    queryClient.prefetchQuery({
      queryKey: leadsQueryKeys.archivedList({ page, limit, ...filters }),
      queryFn: () => getArchivedLeadsApi(page, limit, filters),
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    prefetchLeads,
    prefetchCrackedLeads,
    prefetchArchivedLeads,
  };
};
