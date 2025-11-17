import { useQuery } from '@tanstack/react-query';
import { getSalesTrendsApi } from '../../apis/dashboard';
import { transformSalesTrendsResponse } from '../../utils/salesTransform';
import { useAuth } from '../../context/AuthContext';
import type { ChartData } from '../../types/dashboard';

/**
 * Query keys for sales trends
 */
export const salesTrendsQueryKeys = {
  all: ['sales-trends'] as const,
  byUser: (
    department?: string,
    role?: string,
    period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    fromDate?: string,
    toDate?: string,
    unit?: string
  ) =>
    [...salesTrendsQueryKeys.all, department, role, period, fromDate, toDate, unit] as const,
};

/**
 * Hook to fetch sales trends data
 * Automatically uses user's department and role from auth context
 * Transforms API response to ChartData format
 * @param period - 'daily', 'weekly', 'monthly', 'quarterly', or 'yearly' (default: 'monthly')
 * @param fromDate - Start date in ISO 8601 format (optional)
 * @param toDate - End date in ISO 8601 format (optional)
 * @param unit - Filter by specific sales unit (optional, only for department managers)
 */
export const useSalesTrends = (
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
  fromDate?: string,
  toDate?: string,
  unit?: string
) => {
  const { user } = useAuth();

  return useQuery<ChartData[], Error>({
    queryKey: salesTrendsQueryKeys.byUser(user?.department, user?.role, period, fromDate, toDate, unit),
    queryFn: async () => {
      const apiData = await getSalesTrendsApi(period, fromDate, toDate, unit);
      return transformSalesTrendsResponse(apiData);
    },
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 30000, // Data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    retry: 2, // Retry twice on failure
  });
};

