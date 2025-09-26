import { apiGetJson, apiRequest } from '../utils/apiClient';
import { getApiBaseUrl } from '../config/api';

// Types for Access Logs
export interface AccessLog {
  id: number;
  employeeId: number;
  success: boolean;
  loginTime: string;
  logoutTime?: string | null;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AccessLogsResponse {
  logs: AccessLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AccessLogsStatsResponse {
  summary: {
    totalLogs: number;
    successfulLogins: number;
    failedLogins: number;
    uniqueUsers: number;
    successRate: number;
  };
  timeBasedStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  recentActivity: AccessLog[];
}

export interface GetAccessLogsDto {
  employeeId?: number;
  success?: boolean;
  limit?: number;
  page?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

// API Functions
export const getAccessLogsApi = async (query: GetAccessLogsDto = {}): Promise<AccessLogsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (query.employeeId) params.append('employeeId', query.employeeId.toString());
    if (query.success !== undefined) params.append('success', query.success.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.page) params.append('page', query.page.toString());
    
    const queryString = params.toString();
    const url = `${getApiBaseUrl()}/auth/access-logs${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGetJson<any>(url);
    console.log('Access logs API response:', response);
    
    // Handle different possible response formats
    let logs: AccessLog[] = [];
    let total = 0;
    
    if (response.recentActivity) {
      // Stats format with recentActivity
      logs = response.recentActivity;
      total = response.summary?.totalLogs || logs.length;
    } else if (Array.isArray(response)) {
      // Direct array format
      logs = response;
      total = logs.length;
    } else if (response.logs) {
      // Standard paginated format
      logs = response.logs;
      total = response.total || logs.length;
    } else {
      console.warn('Unexpected response format:', response);
      logs = [];
      total = 0;
    }
    
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);
    
    return {
      logs: logs,
      total: total,
      page: query.page || 1,
      limit: limit,
      totalPages: totalPages > 0 ? totalPages : 1
    };
  } catch (error) {
    console.error('Error fetching access logs:', error);
    throw new Error(`Failed to fetch access logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getAccessLogsStatsApi = async (): Promise<AccessLogsStatsResponse> => {
  try {
    const response = await apiGetJson<AccessLogsStatsResponse>(`${getApiBaseUrl()}/auth/access-logs/stats`);
    return response;
  } catch (error) {
    console.error('Error fetching access logs statistics:', error);
    throw new Error(`Failed to fetch access logs statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportAccessLogsApi = async (query: GetAccessLogsDto = {}, format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    
    // Add format parameter
    params.append('format', format);
    
    // Add optional filters
    if (query.employeeId) params.append('employeeId', query.employeeId.toString());
    if (query.success !== undefined) params.append('success', query.success.toString());
    
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    
    const queryString = params.toString();
    const url = `/auth/access-logs/export${queryString ? `?${queryString}` : ''}`;
    
    // Use apiRequest for proper authentication
    const response = await apiRequest(url, {
      method: 'GET',
      headers: {
        'Accept': format === 'csv' ? 'text/csv' : 'application/json',
      },
    });

    return await response.blob();
  } catch (error) {
    console.error('Error exporting access logs:', error);
    throw new Error(`Failed to export access logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
