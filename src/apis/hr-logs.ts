import { apiGetJson, apiRequest, ApiError } from '../utils/apiClient';

// Types for HR Logs
export interface GetHrLogsDto {
  hr_id?: number;
  action_type?: string;
  affected_employee_id?: number;
  created_start?: string;
  created_end?: string;
  updated_start?: string;
  updated_end?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface AffectedEmployee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface HRUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface HRLog {
  id: number;
  hrId: number;
  actionType: string;
  affectedEmployeeId: number | null;
  description: string;
  createdAt: string;
  updatedAt: string;
  affectedEmployee?: AffectedEmployee | null;
  hr?: {
    id: number;
    employeeId: number;
    employee: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface HrLogsListResponseDto {
  logs: HRLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HrLogsStatsResponseDto {
  totalLogs: number;
  todayLogs: number;
  thisWeekLogs: number;
  thisMonthLogs: number;
}

// Get HR logs
export const getHrLogsApi = async (query: GetHrLogsDto): Promise<HrLogsListResponseDto> => {
  try {
    console.log('Fetching HR logs with query:', query);
    
    const queryParams = new URLSearchParams();
    if (query.hr_id) queryParams.append('hr_id', query.hr_id.toString());
    if (query.action_type) queryParams.append('action_type', query.action_type);
    if (query.affected_employee_id) queryParams.append('affected_employee_id', query.affected_employee_id.toString());
    if (query.created_start) queryParams.append('created_start', query.created_start);
    if (query.created_end) queryParams.append('created_end', query.created_end);
    if (query.updated_start) queryParams.append('updated_start', query.updated_start);
    if (query.updated_end) queryParams.append('updated_end', query.updated_end);
    // Always include page and limit for pagination
    queryParams.append('page', (query.page || 1).toString());
    queryParams.append('limit', (query.limit || 10).toString());
    // Always include ordering for consistent sequence
    queryParams.append('orderBy', query.orderBy || 'createdAt');
    queryParams.append('orderDirection', query.orderDirection || 'desc');

    const url = `/hr/logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('API Request URL:', url);
    
    const response = await apiGetJson<HrLogsListResponseDto>(url);
    console.log('HR Logs API response:', response);
    console.log('Response logs array:', response?.logs);
    console.log('First log entry:', response?.logs?.[0]);
    
    // Handle 304 Not Modified response
    if (!response || !response.logs) {
      console.log('No data returned from API (possibly 304 Not Modified)');
      // Return empty response structure
      return {
        logs: [],
        total: 0,
        page: query.page || 1,
        limit: query.limit || 10,
        totalPages: 0
      };
    }
    
    return response;
  } catch (error: any) {
    console.error('Get HR logs API error:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch HR logs');
  }
};

// Get HR logs statistics
export const getHrLogsStatsApi = async (): Promise<HrLogsStatsResponseDto> => {
  try {
    console.log('Fetching HR logs statistics');
    
    const response = await apiGetJson<HrLogsStatsResponseDto>('/hr/logs/stats');
    console.log('HR Logs Stats API response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Get HR logs stats API error:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch HR logs statistics');
  }
};

// Export HR logs
export const exportHrLogsApi = async (query: GetHrLogsDto, format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add format parameter first (separate from DTO)
    queryParams.append('format', format);
    
    // Add only the DTO parameters that are defined in GetHrLogsDto interface
    if (query.hr_id) queryParams.append('hr_id', query.hr_id.toString());
    if (query.action_type) queryParams.append('action_type', query.action_type);
    if (query.affected_employee_id) queryParams.append('affected_employee_id', query.affected_employee_id.toString());
    
    // Use the parameter names that the backend expects
    if (query.created_start) queryParams.append('created_start', query.created_start);
    if (query.created_end) queryParams.append('created_end', query.created_end);
    if (query.updated_start) queryParams.append('updated_start', query.updated_start);
    if (query.updated_end) queryParams.append('updated_end', query.updated_end);
    
    // Note: page, limit, orderBy, orderDirection are not needed for export
    // as the backend gets all records without pagination

    const url = `/hr/logs/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    // Use apiRequest for proper authentication
    const response = await apiRequest(url, {
      method: 'GET',
      headers: {
        'Accept': format === 'csv' ? 'text/csv' : 'application/json',
      },
    });

    return await response.blob();
  } catch (error: any) {
    console.error('Export HR logs API error:', error);
    throw new Error(`Failed to export HR logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
