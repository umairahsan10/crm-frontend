/**
 * React Query hooks for Clients Management
 * 
 * This file contains all the query hooks for clients-related APIs.
 * Each hook handles caching, loading states, and error handling automatically.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getClientsApi,
  getClientsStatisticsApi,
  getClientByIdApi,
  searchCompaniesApi,
  searchContactsApi
} from '../../apis/clients';

// Query Keys - Centralized for consistency
export const clientsQueryKeys = {
  all: ['clients'] as const,
  lists: () => [...clientsQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...clientsQueryKeys.lists(), filters] as const,
  details: () => [...clientsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientsQueryKeys.details(), id] as const,
  statistics: () => [...clientsQueryKeys.all, 'statistics'] as const,
  search: () => [...clientsQueryKeys.all, 'search'] as const,
  companies: (query: string) => [...clientsQueryKeys.search(), 'companies', query] as const,
  contacts: (query: string) => [...clientsQueryKeys.search(), 'contacts', query] as const,
};

/**
 * Hook to fetch clients with pagination and filters
 */
export const useClients = (page: number = 1, limit: number = 20, filters: any = {}, options: any = {}) => {
  return useQuery({
    queryKey: clientsQueryKeys.list({ page, limit, ...filters }),
    queryFn: () => getClientsApi({ page, limit, ...filters }),
    staleTime: 2 * 60 * 1000, // 2 minutes - clients data changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to fetch a specific client by ID
 */
export const useClientById = (clientId: string, options: any = {}) => {
  return useQuery({
    queryKey: clientsQueryKeys.detail(clientId),
    queryFn: () => getClientByIdApi(clientId),
    staleTime: 5 * 60 * 1000, // 5 minutes - individual client data changes less frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!clientId && options.enabled !== false,
  });
};

/**
 * Hook to fetch clients statistics
 */
export const useClientsStatistics = (options: any = {}) => {
  return useQuery({
    queryKey: clientsQueryKeys.statistics(),
    queryFn: getClientsStatisticsApi,
    staleTime: 5 * 60 * 1000, // 5 minutes - statistics don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: options.enabled !== false,
  });
};

/**
 * Hook to search companies
 */
export const useSearchCompanies = (query: string, options: any = {}) => {
  return useQuery({
    queryKey: clientsQueryKeys.companies(query),
    queryFn: () => searchCompaniesApi(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!query && query.length >= 2 && options.enabled !== false,
  });
};

/**
 * Hook to search contacts
 */
export const useSearchContacts = (query: string, options: any = {}) => {
  return useQuery({
    queryKey: clientsQueryKeys.contacts(query),
    queryFn: () => searchContactsApi(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!query && query.length >= 2 && options.enabled !== false,
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

  const prefetchClientById = (clientId: string) => {
    queryClient.prefetchQuery({
      queryKey: clientsQueryKeys.detail(clientId),
      queryFn: () => getClientByIdApi(clientId),
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    prefetchClients,
    prefetchClientById,
  };
};

