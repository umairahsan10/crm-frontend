/**
 * React Query hooks for Clients Management
 * 
 * This file contains all the query hooks for clients-related APIs.
 * Each hook handles caching, loading states, and error handling automatically.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getClientsApi,
  getClientsStatisticsApi
} from '../../apis/clients';

// Query Keys - Centralized for consistency
export const clientsQueryKeys = {
  all: ['clients'] as const,
  lists: () => [...clientsQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...clientsQueryKeys.lists(), filters] as const,
  details: () => [...clientsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientsQueryKeys.details(), id] as const,
  statistics: () => [...clientsQueryKeys.all, 'statistics'] as const,
};

/**
 * Hook to fetch clients with pagination and filters
 */
export const useClients = (page: number = 1, limit: number = 20, filters: any = {}, options: any = {}) => {
  return useQuery({
    queryKey: clientsQueryKeys.list({ page, limit, ...filters }),
    queryFn: () => getClientsApi({ page, limit, ...filters }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to fetch clients statistics
 */
export const useClientsStatistics = (options: any = {}) => {
  return useQuery({
    queryKey: clientsQueryKeys.statistics(),
    queryFn: getClientsStatisticsApi,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to prefetch clients data (useful for tab switching)
 */
export const usePrefetchClients = () => {
  const queryClient = useQueryClient();
  
  const prefetchClients = (page: number = 1, limit: number = 20, filters: any = {}) => {
    queryClient.prefetchQuery({
      queryKey: clientsQueryKeys.list({ page, limit, ...filters }),
      queryFn: () => getClientsApi({ page, limit, ...filters }),
      staleTime: 2 * 60 * 1000,
    });
  };

  return {
    prefetchClients,
  };
};

