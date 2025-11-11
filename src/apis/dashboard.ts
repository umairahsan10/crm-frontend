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
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
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

/**
 * API Response structure from /dashboard/activity-feed
 */
export interface ActivityFeedApiResponse {
  department: string;
  role: string;
  activities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string; // ISO 8601 format
    actor: string;
    relatedEntity?: {
      type: string;
      id: number | string;
      name?: string;
    };
  }>;
  total: number;
}

/**
 * Fetch activity feed data from API
 * Backend automatically determines department and role from JWT token
 * @param limit - Number of activities to return (default: 20, max recommended: 50)
 */
export const getActivityFeedApi = async (limit: number = 20): Promise<ActivityFeedApiResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append('limit', limit.toString());
    }
    const url = `/dashboard/activity-feed${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const data = await apiGetJson<ActivityFeedApiResponse>(url);
    return data;
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    throw error;
  }
};

/**
 * API Response structure from /dashboard/hr-requests
 */
export interface HRRequestsApiResponse {
  department: string;
  role: string;
  requests: Array<{
    id: string;
    title: string;
    employee: string;
    department: string;
    type: 'Leave' | 'Salary' | 'Training' | 'Complaint' | 'Other';
    status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    submittedDate: string;
    description: string;
  }>;
  total: number;
}

/**
 * Fetch HR requests data from API
 * Backend automatically determines department and role from JWT token
 * @param limit - Number of requests to return (default: 5, max recommended: 20)
 */
export const getHRRequestsApi = async (limit: number = 5): Promise<HRRequestsApiResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append('limit', limit.toString());
    }
    const url = `/dashboard/hr-requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const data = await apiGetJson<HRRequestsApiResponse>(url);
    return data;
  } catch (error) {
    console.error('Error fetching HR requests:', error);
    throw error;
  }
};

