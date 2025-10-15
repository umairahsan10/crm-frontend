import { apiGetJson, apiRequest, ApiError } from '../utils/apiClient';
import { getApiBaseUrl } from '../config/api';

// Types for Leave Logs - Updated to match backend LeaveLogsListResponseDto
export interface LeaveLog {
  leave_log_id: number;
  emp_id: number;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  applied_on: string;
  reviewed_by?: number;
  reviewer_name?: string;
  reviewed_on?: string;
  confirmation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveLogsResponse {
  logs: LeaveLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


// Statistics response structure
export interface LeaveLogsStatsResponseDto {
  total_leaves: number;
  pending_leaves: number;
  approved_leaves: number;
  rejected_leaves: number;
  total_leave_days: number;
  average_leave_duration: number;
  most_common_leave_type: string;
  period_stats: PeriodStatsDto[];
  employee_breakdown?: EmployeeLeaveStatsDto[];
  leave_type_breakdown?: LeaveTypeStatsDto[];
}

export interface PeriodStatsDto {
  period: string;
  total_leaves: number;
  approved_leaves: number;
  rejected_leaves: number;
  pending_leaves: number;
  total_days: number;
}

export interface EmployeeLeaveStatsDto {
  employee_id: number;
  employee_name: string;
  total_leaves: number;
  total_days: number;
  approved_leaves: number;
  rejected_leaves: number;
  pending_leaves: number;
}

export interface LeaveTypeStatsDto {
  leave_type: string;
  count: number;
  total_days: number;
  approval_rate: number;
}

// Export format constants
export const ExportFormat = {
  CSV: 'csv',
  JSON: 'json'
} as const;

export type ExportFormat = typeof ExportFormat[keyof typeof ExportFormat];

// Export query parameters
export interface ExportLeaveLogsDto {
  employee_id?: number;
  start_date?: string;
  end_date?: string;
  format: ExportFormat;
  include_reviewer_details?: boolean;
  include_confirmation_reason?: boolean;
}

// Statistics query parameters
export interface LeaveLogsStatsDto {
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

export interface GetLeaveLogsDto {
  employee_id?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
}

// Create Leave Request DTO
export interface CreateLeaveRequestDto {
  emp_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
}

// API Functions
export const createLeaveRequestApi = async (leaveData: CreateLeaveRequestDto): Promise<LeaveLog> => {
  console.log('API: Creating leave request', leaveData);
  
  const response = await apiRequest('/hr/attendance/leave-logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leaveData),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to create leave request';
    try {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      console.error('Could not parse error response');
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
};

// Leave Action Request DTO
export interface LeaveActionRequest {
  action: 'Approved' | 'Rejected';
  reviewer_id: number;
  confirmation_reason?: string;
}

// Approve/Reject Leave Request
export const approveRejectLeaveRequestApi = async (
  leaveLogId: number, 
  actionData: LeaveActionRequest
): Promise<LeaveLog> => {
  console.log('API: Taking action on leave request', { leaveLogId, actionData });
  
  const response = await apiRequest(`/hr/attendance/leave-logs/${leaveLogId}/action`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(actionData),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to process leave request';
    try {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      console.error('Could not parse error response');
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
};

// Get pending leave requests for HR review
export const getPendingLeaveRequestsApi = async (): Promise<LeaveLog[]> => {
  try {
    const url = `${getApiBaseUrl()}/hr/attendance/leave-logs?status=Pending`;
    console.log('Fetching pending leave requests from:', url);
    
    const response = await apiGetJson<LeaveLog[]>(url);
    console.log('Pending leave requests API response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching pending leave requests:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to fetch pending leave requests: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getLeaveLogsApi = async (query: GetLeaveLogsDto = {}): Promise<LeaveLog[]> => {
  try {
    const params = new URLSearchParams();
    
    if (query.employee_id) params.append('employee_id', query.employee_id.toString());
    if (query.status) params.append('status', query.status);
    if (query.start_date) params.append('start_date', query.start_date);
    if (query.end_date) params.append('end_date', query.end_date);
    
    const queryString = params.toString();
    const url = `${getApiBaseUrl()}/hr/attendance/leave-logs${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGetJson<LeaveLog[]>(url);
    console.log('Leave logs API response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching leave logs:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to fetch leave logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getLeaveLogsByEmployeeApi = async (empId: number): Promise<LeaveLog[]> => {
  try {
    const url = `${getApiBaseUrl()}/hr/attendance/leave-logs/employee/${empId}`;
    const response = await apiGetJson<LeaveLog[]>(url);
    console.log('Leave logs by employee API response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching leave logs by employee:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to fetch leave logs by employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getLeaveLogsStatsApi = async (query: LeaveLogsStatsDto = {}): Promise<LeaveLogsStatsResponseDto> => {
  try {
    const params = new URLSearchParams();
    
    // Add optional filters
    if (query.employee_id) params.append('employee_id', query.employee_id.toString());
    if (query.start_date) params.append('start_date', query.start_date);
    if (query.end_date) params.append('end_date', query.end_date);
    if (query.period) params.append('period', query.period);
    if (query.include_breakdown) params.append('include_breakdown', 'true');
    
    const queryString = params.toString();
    const url = `${getApiBaseUrl()}/hr/attendance/leave-logs/stats${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGetJson<LeaveLogsStatsResponseDto>(url);
    console.log('Statistics API response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching leave logs statistics:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to fetch leave logs statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportLeaveLogsApi = async (query: ExportLeaveLogsDto): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    
    // Add required format parameter
    params.append('format', query.format);
    
    // Add optional filters
    if (query.employee_id) params.append('employee_id', query.employee_id.toString());
    if (query.start_date) params.append('start_date', query.start_date);
    if (query.end_date) params.append('end_date', query.end_date);
    if (query.include_reviewer_details) params.append('include_reviewer_details', 'true');
    if (query.include_confirmation_reason) params.append('include_confirmation_reason', 'true');
    
    const queryString = params.toString();
    const url = `/hr/attendance/leave-logs/export${queryString ? `?${queryString}` : ''}`;
    
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
    console.log('Export API response blob:', blob);
    
    return blob;
  } catch (error: any) {
    console.error('Error exporting leave logs:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to export leave logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
