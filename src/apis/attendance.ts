import { apiPostJson, apiGetJson, apiPutJson, ApiError } from '../utils/apiClient';

// Types for attendance
export interface CheckinDto {
  employee_id: number;
  date: string; // YYYY-MM-DD format
  checkin: string; // ISO string with time
  mode?: string;
  timezone?: string; // IANA timezone name, e.g., "Asia/Karachi"
  offset_minutes?: number; // Offset from UTC in minutes at event time
}

export interface CheckoutDto {
  employee_id: number;
  date: string; // YYYY-MM-DD format
  checkout: string; // ISO string with time
}

export interface BulkMarkPresentDto {
  date?: string; // YYYY-MM-DD format, optional - defaults to current PKT date
  employee_ids?: number[]; // Optional array of employee IDs - if not provided, marks all active employees
  reason?: string; // Optional reason for marking employees present
}

export interface CheckinResponseDto {
  id: number;
  employee_id: number;
  date: string | null;
  checkin: string | null;
  mode: string | null;
  status: 'present' | 'late' | 'half_day' | 'absent' | null;
  late_details: {
    minutes_late: number;
    requires_reason: boolean;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface CheckoutResponseDto {
  id: number;
  employee_id: number;
  date: string | null;
  checkin: string | null;
  checkout: string | null;
  mode: string | null;
  status: 'present' | 'late' | 'half_day' | 'absent' | null;
  total_hours_worked: number;
  created_at: string;
  updated_at: string;
}

export interface BulkMarkPresentResponseDto {
  message: string;
  marked_present: number;
  errors: number;
  skipped: number;
}

// Status Update DTOs
export interface UpdateAttendanceLogStatusDto {
  status: 'present' | 'late' | 'half_day' | 'absent';
  reason?: string;
  reviewer_id?: number;
  checkin?: string;
  checkout?: string;
}

export interface AttendanceLogDto {
  employee_id?: number;
  start_date?: string; // YYYY-MM-DD format
  end_date?: string; // YYYY-MM-DD format
}

export interface AttendanceLogResponseDto {
  id: number;
  employee_id: number;
  employee_first_name: string;
  employee_last_name: string;
  date: string | null;
  checkin: string | null;
  checkout: string | null;
  mode: string | null;
  status: 'present' | 'late' | 'half_day' | 'absent' | null;
  late_details?: {
    minutes_late: number;
    requires_reason: boolean;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceListResponseDto {
  id: number;
  employee_id: number;
  present_days: number | null;
  absent_days: number | null;
  late_days: number | null;
  leave_days: number | null;
  remote_days: number | null;
  quarterly_leaves: number | null;
  monthly_lates: number | null;
  half_days: number | null;
  created_at: string;
  updated_at: string;
}

// API functions
export const checkinApi = async (checkinData: CheckinDto): Promise<CheckinResponseDto> => {
  try {
    return await apiPostJson<CheckinResponseDto>('/hr/attendance/checkin', checkinData);
  } catch (error: any) {
    console.error('Checkin API error:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to record check-in');
  }
};

export const checkoutApi = async (checkoutData: CheckoutDto): Promise<CheckoutResponseDto> => {
  try {
    return await apiPostJson<CheckoutResponseDto>('/hr/attendance/checkout', checkoutData);
  } catch (error: any) {
    console.error('Checkout API error:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to record check-out');
  }
};

export const bulkMarkPresentApi = async (bulkMarkData: BulkMarkPresentDto): Promise<BulkMarkPresentResponseDto> => {
  try {
    return await apiPostJson<BulkMarkPresentResponseDto>('/hr/attendance/bulk-mark-present', bulkMarkData);
  } catch (error: any) {
    console.error('Bulk mark present API error:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to bulk mark attendance');
  }
};

// Update attendance log status
export const updateAttendanceLogStatusApi = async (logId: number, data: UpdateAttendanceLogStatusDto): Promise<AttendanceLogResponseDto> => {
  try {
    return await apiPutJson<AttendanceLogResponseDto>(`/hr/attendance/logs/${logId}/status`, data);
  } catch (error: any) {
    console.error('Update attendance log status API error:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to update attendance log status');
  }
};

export const getAttendanceLogsApi = async (query: AttendanceLogDto): Promise<AttendanceLogResponseDto[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (query.employee_id) queryParams.append('employee_id', query.employee_id.toString());
    if (query.start_date) queryParams.append('start_date', query.start_date);
    if (query.end_date) queryParams.append('end_date', query.end_date);
    
    // Use the correct endpoint based on your backend
    const url = `/hr/attendance/logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Fetching attendance logs from:', url);
    return await apiGetJson<AttendanceLogResponseDto[]>(url);
  } catch (error: any) {
    console.error('Get attendance logs API error:', error);
    if (error instanceof ApiError) {
      // Log the actual response for debugging
      console.error('API Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      throw new Error(`Failed to fetch attendance logs: ${error.message}`);
    }
    throw new Error('Failed to fetch attendance logs');
  }
};

export const getAttendanceListApi = async (): Promise<AttendanceListResponseDto[]> => {
  try {
    return await apiGetJson<AttendanceListResponseDto[]>('/hr/attendance/list');
  } catch (error: any) {
    console.error('Get attendance list API error:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch attendance list');
  }
};

// Late Logs APIs
export const getLateLogs = async (query: any): Promise<any[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (query.employee_id) queryParams.append('employee_id', query.employee_id.toString());
    if (query.start_date) queryParams.append('start_date', query.start_date);
    if (query.end_date) queryParams.append('end_date', query.end_date);
    if (query.action_taken) queryParams.append('action_taken', query.action_taken);
    if (query.justified !== undefined) queryParams.append('justified', query.justified.toString());
    
    const url = `/hr/attendance/late-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiGetJson<any[]>(url);
  } catch (error: any) {
    console.error('Get late logs error:', error);
    throw new Error('Failed to fetch late logs');
  }
};

export const updateLateLogAction = async (logId: number, data: any): Promise<any> => {
  try {
    return await apiPutJson<any>(`/hr/attendance/late-logs/${logId}/action`, data);
  } catch (error: any) {
    console.error('Update late log action error:', error);
    throw new Error('Failed to update late log');
  }
};

export const getLateLogsStats = async (query: any): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (query.employee_id) queryParams.append('employee_id', query.employee_id.toString());
    if (query.start_date) queryParams.append('start_date', query.start_date);
    if (query.end_date) queryParams.append('end_date', query.end_date);
    
    const url = `/hr/attendance/late-logs/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiGetJson<any>(url);
  } catch (error: any) {
    console.error('Get late logs stats error:', error);
    throw new Error('Failed to fetch late logs statistics');
  }
};

// Half-Day Logs APIs
export const getHalfDayLogs = async (query: any): Promise<any[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (query.employee_id) queryParams.append('employee_id', query.employee_id.toString());
    if (query.start_date) queryParams.append('start_date', query.start_date);
    if (query.end_date) queryParams.append('end_date', query.end_date);
    if (query.action_taken) queryParams.append('action_taken', query.action_taken);
    if (query.justified !== undefined) queryParams.append('justified', query.justified.toString());
    
    const url = `/hr/attendance/half-day-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiGetJson<any[]>(url);
  } catch (error: any) {
    console.error('Get half-day logs error:', error);
    throw new Error('Failed to fetch half-day logs');
  }
};

export const updateHalfDayLogAction = async (logId: number, data: any): Promise<any> => {
  try {
    return await apiPutJson<any>(`/hr/attendance/half-day-logs/${logId}/action`, data);
  } catch (error: any) {
    console.error('Update half-day log action error:', error);
    throw new Error('Failed to update half-day log');
  }
};

export const getHalfDayLogsStats = async (query: any): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (query.employee_id) queryParams.append('employee_id', query.employee_id.toString());
    if (query.start_date) queryParams.append('start_date', query.start_date);
    if (query.end_date) queryParams.append('end_date', query.end_date);
    
    const url = `/hr/attendance/half-day-logs/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiGetJson<any>(url);
  } catch (error: any) {
    console.error('Get half-day logs stats error:', error);
    throw new Error('Failed to fetch half-day logs statistics');
  }
};

// Leave Logs APIs
export const getLeaveLogs = async (query: any): Promise<any[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (query.employee_id) queryParams.append('employee_id', query.employee_id.toString());
    if (query.start_date) queryParams.append('start_date', query.start_date);
    if (query.end_date) queryParams.append('end_date', query.end_date);
    if (query.status) queryParams.append('status', query.status);
    if (query.leave_type) queryParams.append('leave_type', query.leave_type);
    
    const url = `/hr/attendance/leave-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiGetJson<any[]>(url);
  } catch (error: any) {
    console.error('Get leave logs error:', error);
    throw new Error('Failed to fetch leave logs');
  }
};

export const updateLeaveLogAction = async (logId: number, data: any): Promise<any> => {
  try {
    return await apiPutJson<any>(`/hr/attendance/leave-logs/${logId}/action`, data);
  } catch (error: any) {
    console.error('Update leave log action error:', error);
    throw new Error('Failed to update leave log');
  }
};

export const getLeaveLogsStats = async (query: any): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (query.employee_id) queryParams.append('employee_id', query.employee_id.toString());
    if (query.start_date) queryParams.append('start_date', query.start_date);
    if (query.end_date) queryParams.append('end_date', query.end_date);
    
    const url = `/hr/attendance/leave-logs/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiGetJson<any>(url);
  } catch (error: any) {
    console.error('Get leave logs stats error:', error);
    throw new Error('Failed to fetch leave logs statistics');
  }
};

// Monthly Attendance APIs
export const getMonthlyAttendance = async (employeeId: number, query: any): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (query.month) queryParams.append('month', query.month);
    
    const url = `/hr/attendance/month/${employeeId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiGetJson<any>(url);
  } catch (error: any) {
    console.error('Get monthly attendance error:', error);
    throw new Error('Failed to fetch monthly attendance');
  }
};