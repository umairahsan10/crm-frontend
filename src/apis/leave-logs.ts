import { apiGetJson, apiRequest } from '../utils/apiClient';
import { getApiBaseUrl } from '../config/api';

// Types for Leave Logs
export interface LeaveLog {
  id: number;
  employeeId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: number;
  approvedAt?: string;
  rejectedReason?: string;
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

export interface LeaveLogsResponse {
  logs: LeaveLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LeaveLogsStatsResponse {
  summary: {
    totalLogs: number;
    pendingLogs: number;
    approvedLogs: number;
    rejectedLogs: number;
    totalDays: number;
  };
  timeBasedStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  byLeaveType: {
    [key: string]: number;
  };
}

export interface GetLeaveLogsDto {
  employeeId?: number;
  leaveType?: string;
  status?: 'pending' | 'approved' | 'rejected';
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// API Functions
export const getLeaveLogsApi = async (query: GetLeaveLogsDto = {}): Promise<LeaveLogsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (query.employeeId) params.append('employeeId', query.employeeId.toString());
    if (query.leaveType) params.append('leaveType', query.leaveType);
    if (query.status) params.append('status', query.status);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.page) params.append('page', query.page.toString());
    if (query.orderBy) params.append('orderBy', query.orderBy);
    if (query.orderDirection) params.append('orderDirection', query.orderDirection);
    
    const queryString = params.toString();
    const url = `${getApiBaseUrl()}/attendance/leave-logs${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGetJson<LeaveLogsResponse>(url);
    console.log('Leave logs API response:', response);
    
    return response;
  } catch (error) {
    console.error('Error fetching leave logs:', error);
    throw new Error(`Failed to fetch leave logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getLeaveLogsStatsApi = async (): Promise<LeaveLogsStatsResponse> => {
  try {
    const response = await apiGetJson<LeaveLogsStatsResponse>(`${getApiBaseUrl()}/attendance/leave-logs/stats`);
    return response;
  } catch (error) {
    console.error('Error fetching leave logs statistics:', error);
    throw new Error(`Failed to fetch leave logs statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportLeaveLogsApi = async (query: GetLeaveLogsDto = {}, format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    
    // Add format parameter
    params.append('format', format);
    
    // Add optional filters
    if (query.employeeId) params.append('employeeId', query.employeeId.toString());
    if (query.leaveType) params.append('leaveType', query.leaveType);
    if (query.status) params.append('status', query.status);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    
    const queryString = params.toString();
    const url = `/attendance/leave-logs/export${queryString ? `?${queryString}` : ''}`;
    
    // Use apiRequest for proper authentication
    const response = await apiRequest(url, {
      method: 'GET',
      headers: {
        'Accept': format === 'csv' ? 'text/csv' : 'application/json',
      },
    });

    return await response.blob();
  } catch (error) {
    console.error('Error exporting leave logs:', error);
    throw new Error(`Failed to export leave logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
