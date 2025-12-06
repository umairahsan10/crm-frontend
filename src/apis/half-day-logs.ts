import { apiGetJson, apiRequest, ApiError } from '../utils/apiClient';
import { getApiBaseUrl } from '../config/api';

// Types for Half Day Logs - Updated to match backend HalfDayLogsListResponseDto
export interface HalfDayLog {
  half_day_log_id: number;
  emp_id: number;
  employee_name: string;
  date: string;
  scheduled_time_in: string;
  actual_time_in: string;
  minutes_late: number;
  reason: string;
  justified: boolean;
  half_day_type: string;
  action_taken: string;
  reviewed_by?: number;
  reviewer_name?: string;
  created_at: string;
  updated_at: string;
}

export interface HalfDayLogsResponse {
  logs: HalfDayLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Statistics response structure
export interface HalfDayLogsStatsResponseDto {
  total_half_day_logs: number;
  pending_half_day_logs: number;
  completed_half_day_logs: number;
  total_minutes_late: number;
  average_minutes_late: number;
  most_common_reason: string;
  paid_half_day_count: number;
  unpaid_half_day_count: number;
  period_stats: HalfDayPeriodStatsDto[];
  employee_breakdown?: EmployeeHalfDayStatsDto[];
  reason_breakdown?: HalfDayReasonStatsDto[];
}

export interface HalfDayPeriodStatsDto {
  period: string;
  total_half_day_logs: number;
  completed_half_day_logs: number;
  pending_half_day_logs: number;
  total_minutes: number;
}

export interface EmployeeHalfDayStatsDto {
  employee_id: number;
  employee_name: string;
  total_half_day_logs: number;
  total_minutes: number;
  completed_half_day_logs: number;
  pending_half_day_logs: number;
  average_minutes_late: number;
}

export interface HalfDayReasonStatsDto {
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
export interface ExportHalfDayLogsDto {
  employee_id?: number;
  start_date?: string;
  end_date?: string;
  format: ExportFormat;
  include_half_day_type?: boolean;
  include_reviewer_details?: boolean;
}

// Statistics query parameters
export interface HalfDayLogsStatsDto {
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

export interface GetHalfDayLogsDto {
  employee_id?: number;
  start_date?: string;
  end_date?: string;
}

// Submit half-day reason DTO
export interface SubmitHalfDayReasonDto {
  emp_id: number;
  date: string;
  scheduled_time_in: string;
  actual_time_in: string;
  minutes_late: number;
  reason: string;
}

// Half day log response DTO
export interface HalfDayLogResponseDto {
  half_day_log_id: number;
  emp_id: number;
  date: string;
  scheduled_time_in: string;
  actual_time_in: string;
  minutes_late: number;
  reason: string;
  justified: boolean;
  half_day_type: string;
  action_taken: string;
  reviewed_by?: number;
  created_at: string;
  updated_at: string;
}

// API Functions
export const getHalfDayLogsApi = async (query: GetHalfDayLogsDto = {}): Promise<HalfDayLog[]> => {
  try {
    const params = new URLSearchParams();
    
    if (query.employee_id) params.append('employee_id', query.employee_id.toString());
    if (query.start_date) params.append('start_date', query.start_date);
    if (query.end_date) params.append('end_date', query.end_date);
    
    const queryString = params.toString();
    const url = `${getApiBaseUrl()}/hr/logs/half-day-logs${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGetJson<HalfDayLog[]>(url);
    console.log('Half day logs API response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching half day logs:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to fetch half day logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getHalfDayLogsByEmployeeApi = async (empId: number): Promise<HalfDayLog[]> => {
  try {
    const url = `${getApiBaseUrl()}/hr/logs/half-day-logs/employee/${empId}`;
    const response = await apiGetJson<HalfDayLog[]>(url);
    console.log('Half day logs by employee API response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching half day logs by employee:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to fetch half day logs by employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getHalfDayLogsStatsApi = async (query: HalfDayLogsStatsDto = {}): Promise<HalfDayLogsStatsResponseDto> => {
  try {
    const params = new URLSearchParams();
    
    // Add optional filters
    if (query.employee_id) params.append('employee_id', query.employee_id.toString());
    if (query.start_date) params.append('start_date', query.start_date);
    if (query.end_date) params.append('end_date', query.end_date);
    if (query.period) params.append('period', query.period);
    if (query.include_breakdown) params.append('include_breakdown', 'true');
    
    const queryString = params.toString();
    const url = `${getApiBaseUrl()}/hr/logs/half-day-logs/stats${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGetJson<HalfDayLogsStatsResponseDto>(url);
    console.log('Half day logs statistics API response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching half day logs statistics:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to fetch half day logs statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportHalfDayLogsApi = async (query: ExportHalfDayLogsDto): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    
    // Add required format parameter
    params.append('format', query.format);
    
    // Add optional filters
    if (query.employee_id) params.append('employee_id', query.employee_id.toString());
    if (query.start_date) params.append('start_date', query.start_date);
    if (query.end_date) params.append('end_date', query.end_date);
    if (query.include_half_day_type) params.append('include_half_day_type', 'true');
    if (query.include_reviewer_details) params.append('include_reviewer_details', 'true');
    
    const queryString = params.toString();
    const url = `/hr/logs/half-day-logs/export${queryString ? `?${queryString}` : ''}`;
    
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
    console.log('Half day logs export API response blob:', blob);
    
    return blob;
  } catch (error: any) {
    console.error('Error exporting half day logs:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to export half day logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const submitHalfDayReasonApi = async (data: SubmitHalfDayReasonDto): Promise<HalfDayLogResponseDto> => {
  try {
    const url = `${getApiBaseUrl()}/hr/logs/half-day-logs/submit-reason`;
    
    const response = await apiRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Submit failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Submit half day reason API response:', result);
    
    return result;
  } catch (error: any) {
    console.error('Error submitting half day reason:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to submit half day reason: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
