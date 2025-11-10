import { apiGetJson } from '../utils/apiClient';

/**
 * API Response structure from /dashboard/metric-grid
 */
export interface MetricGridApiResponse {
  department: string;
  role: string;
  cards: Array<{
    id: number;
    title: string;
    value: string;
    subtitle?: string;
  }>;
}

/**
 * Fetch metric grid data from API
 * Backend automatically determines department and role from JWT token
 */
export const getMetricGridApi = async (): Promise<MetricGridApiResponse> => {
  try {
    const data = await apiGetJson<MetricGridApiResponse>('/dashboard/metric-grid');
    return data;
  } catch (error) {
    console.error('Error fetching metric grid:', error);
    throw error;
  }
};

