import { apiPostJson, apiGetJson, apiPutJson, ApiError } from '../utils/apiClient';

// Types for attendance
export interface CheckinDto {
  employee_id: number;
  date: string; // YYYY-MM-DD format
  checkin: string; // ISO string with time
  mode?: string;
}

export interface CheckoutDto {
  employee_id: number;
  date: string; // YYYY-MM-DD format
  checkout: string; // ISO string with time
}

export interface BulkMarkPresentDto {
  date: string; // YYYY-MM-DD format
  employee_ids?: number[]; // Optional: specific employee IDs, if not provided, marks all
  reason?: string;
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
