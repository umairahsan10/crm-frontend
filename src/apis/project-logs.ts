import { apiGetJson, apiRequest, ApiError } from '../utils/apiClient';
import { getApiBaseUrl } from '../config/api';

// Types for Project Logs - Following same structure as half-day-logs
export interface ProjectLog {
  project_log_id: number;
  project_id: number;
  project_name: string;
  employee_id: number;
  employee_name: string;
  action_type: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectLogsResponse {
  logs: ProjectLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Statistics response structure
export interface ProjectLogsStatsResponseDto {
  total_project_logs: number;
  today_logs: number;
  this_week_logs: number;
  this_month_logs: number;
  by_action_type?: ProjectLogActionTypeStatsDto[];
  by_project?: ProjectLogProjectStatsDto[];
}

export interface ProjectLogActionTypeStatsDto {
  action_type: string;
  count: number;
}

export interface ProjectLogProjectStatsDto {
  project_id: number;
  project_name: string;
  count: number;
}

// Export format constants
export const ExportFormat = {
  CSV: 'csv',
  JSON: 'json'
} as const;

export type ExportFormat = typeof ExportFormat[keyof typeof ExportFormat];

// Export query parameters
export interface ExportProjectLogsDto {
  project_id?: number;
  employee_id?: number;
  start_date?: string;
  end_date?: string;
  format: ExportFormat;
  include_project_details?: boolean;
  include_employee_details?: boolean;
}

// Statistics query parameters
export interface ProjectLogsStatsDto {
  project_id?: number;
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

export interface GetProjectLogsDto {
  project_id?: number;
  employee_id?: number;
  start_date?: string;
  end_date?: string;
}

// API Functions
export const getProjectLogsApi = async (query: GetProjectLogsDto = {}): Promise<ProjectLog[]> => {
  try {
    const params = new URLSearchParams();
    
    if (query.project_id) params.append('project_id', query.project_id.toString());
    if (query.employee_id) params.append('employee_id', query.employee_id.toString());
    if (query.start_date) params.append('start_date', query.start_date);
    if (query.end_date) params.append('end_date', query.end_date);
    
    const queryString = params.toString();
    const url = `${getApiBaseUrl()}/hr/attendance/project-logs${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGetJson<ProjectLog[]>(url);
    console.log('Project logs API response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching project logs:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to fetch project logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getProjectLogsStatsApi = async (query: ProjectLogsStatsDto = {}): Promise<ProjectLogsStatsResponseDto> => {
  try {
    const params = new URLSearchParams();
    
    // Add optional filters
    if (query.project_id) params.append('project_id', query.project_id.toString());
    if (query.employee_id) params.append('employee_id', query.employee_id.toString());
    if (query.start_date) params.append('start_date', query.start_date);
    if (query.end_date) params.append('end_date', query.end_date);
    if (query.period) params.append('period', query.period);
    if (query.include_breakdown) params.append('include_breakdown', 'true');
    
    const queryString = params.toString();
    const url = `${getApiBaseUrl()}/hr/attendance/project-logs/stats${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGetJson<ProjectLogsStatsResponseDto>(url);
    console.log('Project logs statistics API response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching project logs statistics:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to fetch project logs statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportProjectLogsApi = async (query: ExportProjectLogsDto): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    
    // Add required format parameter
    params.append('format', query.format);
    
    // Add optional filters
    if (query.project_id) params.append('project_id', query.project_id.toString());
    if (query.employee_id) params.append('employee_id', query.employee_id.toString());
    if (query.start_date) params.append('start_date', query.start_date);
    if (query.end_date) params.append('end_date', query.end_date);
    if (query.include_project_details) params.append('include_project_details', 'true');
    if (query.include_employee_details) params.append('include_employee_details', 'true');
    
    const queryString = params.toString();
    const url = `/hr/attendance/project-logs/export${queryString ? `?${queryString}` : ''}`;
    
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
    console.log('Project logs export API response blob:', blob);
    
    return blob;
  } catch (error: any) {
    console.error('Error exporting project logs:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to export project logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

