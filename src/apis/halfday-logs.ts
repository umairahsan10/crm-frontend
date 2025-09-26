import { apiGetJson, apiRequest } from '../utils/apiClient';
import { getApiBaseUrl } from '../config/api';

// Types for Half Day Logs
export interface HalfDayLog {
  id: number;
  employeeId: number;
  date: string;
  halfDayType: 'morning' | 'afternoon';
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

export interface HalfDayLogsResponse {
  logs: HalfDayLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HalfDayLogsStatsResponse {
  summary: {
    totalLogs: number;
    pendingLogs: number;
    approvedLogs: number;
    rejectedLogs: number;
    morningHalfDays: number;
    afternoonHalfDays: number;
  };
  timeBasedStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface GetHalfDayLogsDto {
  employeeId?: number;
  halfDayType?: 'morning' | 'afternoon';
  status?: 'pending' | 'approved' | 'rejected';
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// API Functions
export const getHalfDayLogsApi = async (query: GetHalfDayLogsDto = {}): Promise<HalfDayLogsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (query.employeeId) params.append('employeeId', query.employeeId.toString());
    if (query.halfDayType) params.append('halfDayType', query.halfDayType);
    if (query.status) params.append('status', query.status);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.page) params.append('page', query.page.toString());
    if (query.orderBy) params.append('orderBy', query.orderBy);
    if (query.orderDirection) params.append('orderDirection', query.orderDirection);
    
    const queryString = params.toString();
    const url = `${getApiBaseUrl()}/attendance/halfday-logs${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGetJson<HalfDayLogsResponse>(url);
    console.log('Half day logs API response:', response);
    
    return response;
  } catch (error) {
    console.error('Error fetching half day logs:', error);
    throw new Error(`Failed to fetch half day logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getHalfDayLogsStatsApi = async (): Promise<HalfDayLogsStatsResponse> => {
  try {
    const response = await apiGetJson<HalfDayLogsStatsResponse>(`${getApiBaseUrl()}/attendance/halfday-logs/stats`);
    return response;
  } catch (error) {
    console.error('Error fetching half day logs statistics:', error);
    throw new Error(`Failed to fetch half day logs statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportHalfDayLogsApi = async (query: GetHalfDayLogsDto = {}, format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    
    // Add format parameter
    params.append('format', format);
    
    // Add optional filters
    if (query.employeeId) params.append('employeeId', query.employeeId.toString());
    if (query.halfDayType) params.append('halfDayType', query.halfDayType);
    if (query.status) params.append('status', query.status);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    
    const queryString = params.toString();
    const url = `/attendance/halfday-logs/export${queryString ? `?${queryString}` : ''}`;
    
    // Use apiRequest for proper authentication
    const response = await apiRequest(url, {
      method: 'GET',
      headers: {
        'Accept': format === 'csv' ? 'text/csv' : 'application/json',
      },
    });

    return await response.blob();
  } catch (error) {
    console.error('Error exporting half day logs:', error);
    throw new Error(`Failed to export half day logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
