import { apiGetJson, apiRequest, ApiError } from '../utils/apiClient';
import { getApiBaseUrl } from '../config/api';

// Types for Late Logs - Updated to match backend LateLogsListResponseDto
export interface LateLog {
  late_log_id: number;
  emp_id: number;
  employee_name: string;
  date: string;
  scheduled_time_in: string;
  actual_time_in: string;
  minutes_late: number;
  reason: string;
  justified: boolean;
  late_type: string;
  action_taken: string;
  reviewed_by?: number;
  reviewer_name?: string;
  created_at: string;
  updated_at: string;
}

export interface LateLogsResponse {
  logs: LateLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Statistics response structure
export interface LateLogsStatsResponseDto {
  total_late_logs: number;
  pending_late_logs: number;
  completed_late_logs: number;
  total_minutes_late: number;
  average_minutes_late: number;
  most_common_reason: string;
  paid_late_count: number;
  unpaid_late_count: number;
  period_stats: LatePeriodStatsDto[];
  employee_breakdown?: EmployeeLateStatsDto[];
  reason_breakdown?: ReasonStatsDto[];
}

export interface LatePeriodStatsDto {
  period: string;
  total_late_logs: number;
  completed_late_logs: number;
  pending_late_logs: number;
  total_minutes: number;
}

export interface EmployeeLateStatsDto {
  employee_id: number;
  employee_name: string;
  total_late_logs: number;
  total_minutes: number;
  completed_late_logs: number;
  pending_late_logs: number;
  average_minutes_late: number;
}

export interface ReasonStatsDto {
  reason: string;
  count: number;
  total_minutes: number;
  completion_rate: number;
}

// Export format constants
export const ExportFormat = {
  CSV: 'csv',
  JSON: 'json'
} as const;

export type ExportFormat = typeof ExportFormat[keyof typeof ExportFormat];

// Export query parameters
export interface ExportLateLogsDto {
  employee_id?: number;
  start_date?: string;
  end_date?: string;
  format: ExportFormat;
  include_late_type?: boolean;
  include_reviewer_details?: boolean;
}

// Statistics query parameters
export interface LateLogsStatsDto {
  employee_id?: number;
  start_date?: string;
  end_date?: string;
  period?: StatsPeriod;
  include_breakdown?: boolean;
}

export const StatsPeriod = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
} as const;

export type StatsPeriod = typeof StatsPeriod[keyof typeof StatsPeriod];

export interface GetLateLogsDto {
  employee_id?: number;
  start_date?: string;
  end_date?: string;
}

// API Functions
export const getLateLogsApi = async (query: GetLateLogsDto = {}): Promise<LateLog[]> => {
  try {
    const params = new URLSearchParams();
    
    if (query.employee_id) params.append('employee_id', query.employee_id.toString());
    if (query.start_date) params.append('start_date', query.start_date);
    if (query.end_date) params.append('end_date', query.end_date);
    
    const queryString = params.toString();
    const url = `${getApiBaseUrl()}/hr/logs/late-logs${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGetJson<LateLog[]>(url);
    console.log('Late logs API response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching late logs:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to fetch late logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getLateLogsByEmployeeApi = async (empId: number): Promise<LateLog[]> => {
  try {
    const url = `${getApiBaseUrl()}/hr/logs/late-logs/employee/${empId}`;
    const response = await apiGetJson<LateLog[]>(url);
    console.log('Late logs by employee API response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching late logs by employee:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to fetch late logs by employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getLateLogsStatsApi = async (query: LateLogsStatsDto = {}): Promise<LateLogsStatsResponseDto> => {
  try {
    const params = new URLSearchParams();
    
    // Add optional filters
    if (query.employee_id) params.append('employee_id', query.employee_id.toString());
    if (query.start_date) params.append('start_date', query.start_date);
    if (query.end_date) params.append('end_date', query.end_date);
    if (query.period) params.append('period', query.period);
    if (query.include_breakdown) params.append('include_breakdown', 'true');
    
    const queryString = params.toString();
    const url = `${getApiBaseUrl()}/hr/logs/late-logs/stats${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGetJson<LateLogsStatsResponseDto>(url);
    console.log('Late logs statistics API response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching late logs statistics:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to fetch late logs statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportLateLogsApi = async (query: ExportLateLogsDto): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    
    // Add required format parameter
    params.append('format', query.format);
    
    // Add optional filters
    if (query.employee_id) params.append('employee_id', query.employee_id.toString());
    if (query.start_date) params.append('start_date', query.start_date);
    if (query.end_date) params.append('end_date', query.end_date);
    if (query.include_late_type) params.append('include_late_type', 'true');
    if (query.include_reviewer_details) params.append('include_reviewer_details', 'true');
    
    const queryString = params.toString();
    const url = `/hr/logs/late-logs/export${queryString ? `?${queryString}` : ''}`;
    
    // Use apiRequest for proper authentication (handles cookies)
    const response = await apiRequest(url, {
      method: 'GET',
      headers: {
        'Accept': query.format === 'csv' ? 'text/csv' : 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    console.log('Late logs export API response blob:', blob);
    
    return blob;
  } catch (error: any) {
    console.error('Error exporting late logs:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to export late logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};