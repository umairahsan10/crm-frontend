import { apiGetJson, apiRequest } from '../utils/apiClient';
import { getApiBaseUrl } from '../config/api';

// Types for Late Logs
export interface LateLog {
  id: number;
  employeeId: number;
  date: string;
  lateMinutes: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: number;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  approver?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface LateLogsResponse {
  logs: LateLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LateLogsStatsResponse {
  summary: {
    totalLogs: number;
    pendingLogs: number;
    approvedLogs: number;
    rejectedLogs: number;
    averageLateMinutes: number;
  };
  timeBasedStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface GetLateLogsDto {
  employeeId?: number;
  status?: 'pending' | 'approved' | 'rejected';
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// API Functions
export const getLateLogsApi = async (query: GetLateLogsDto = {}): Promise<LateLogsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (query.employeeId) params.append('employeeId', query.employeeId.toString());
    if (query.status) params.append('status', query.status);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.page) params.append('page', query.page.toString());
    if (query.orderBy) params.append('orderBy', query.orderBy);
    if (query.orderDirection) params.append('orderDirection', query.orderDirection);
    
    const queryString = params.toString();
    const url = `${getApiBaseUrl()}/attendance/late-logs${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGetJson<LateLogsResponse>(url);
    console.log('Late logs API response:', response);
    
    return response;
  } catch (error) {
    console.error('Error fetching late logs:', error);
    throw new Error(`Failed to fetch late logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getLateLogsStatsApi = async (): Promise<LateLogsStatsResponse> => {
  try {
    const response = await apiGetJson<LateLogsStatsResponse>(`${getApiBaseUrl()}/attendance/late-logs/stats`);
    return response;
  } catch (error) {
    console.error('Error fetching late logs statistics:', error);
    throw new Error(`Failed to fetch late logs statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportLateLogsApi = async (query: GetLateLogsDto = {}, format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    
    // Add format parameter
    params.append('format', format);
    
    // Add optional filters
    if (query.employeeId) params.append('employeeId', query.employeeId.toString());
    if (query.status) params.append('status', query.status);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    
    const queryString = params.toString();
    const url = `/attendance/late-logs/export${queryString ? `?${queryString}` : ''}`;
    
    // Use apiRequest for proper authentication
    const response = await apiRequest(url, {
      method: 'GET',
      headers: {
        'Accept': format === 'csv' ? 'text/csv' : 'application/json',
      },
    });

    return await response.blob();
  } catch (error) {
    console.error('Error exporting late logs:', error);
    throw new Error(`Failed to export late logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
