import { apiGetJson } from '../utils/apiClient';

/**
 * API Response structure from /dashboard/metric-grid
 * Supports both cardsByDepartment (for Admin) and cards (for other dashboards)
 */
export interface MetricGridApiResponse {
  department: string;
  role: string;
  cardsByDepartment?: {
    [key: string]: Array<{
      id: number;
      title: string;
      value: string;
      subtitle?: string;
      change?: string;
      changeType?: 'positive' | 'negative' | 'neutral';
      department?: string;
    }>;
  };
  // Legacy structure for backward compatibility (other dashboards)
  cards?: Array<{
    id: number;
    title: string;
    value: string;
    subtitle?: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
  }>;
}

/**
 * Fetch metric grid data from API
 * Backend automatically determines department and role from JWT token
 */
export const getMetricGridApi = async (): Promise<MetricGridApiResponse> => {
  try {
    const data = await apiGetJson<MetricGridApiResponse>('/dashboard/metric-grid');
    return data;
  } catch (error) {
    console.error('Error fetching metric grid:', error);
    throw error;
  }
};

/**
 * API Response structure from /dashboard/activity-feed
 */
export interface ActivityFeedApiResponse {
  department: string;
  role: string;
  activities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string; // ISO 8601 format
    actor: string;
    relatedEntity?: {
      type: string;
      id: number | string;
      name?: string;
    };
  }>;
  total: number;
}

/**
 * Fetch activity feed data from API
 * Backend automatically determines department and role from JWT token
 * @param limit - Number of activities to return (default: 3, max recommended: 50)
 */
export const getActivityFeedApi = async (limit: number): Promise<ActivityFeedApiResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append('limit', limit.toString());
    }
    const url = `/dashboard/activity-feed${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const data = await apiGetJson<ActivityFeedApiResponse>(url);
    return data;
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    throw error;
  }
};

/**
 * API Response structure from /dashboard/hr-requests
 * For HR users: returns requests array
 * For Admin users: returns requestsByType object with separated requests
 */
export interface HRRequestsApiResponse {
  department: string;
  role: string;
  // For HR users
  requests?: Array<{
    id: string;
    title: string;
    employee: string;
    department: string;
    type: 'Leave' | 'Salary' | 'Training' | 'Complaint' | 'Other';
    status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    submittedDate: string;
    description: string;
  }>;
  // For Admin users
  requestsByType?: {
    employeeToHr: Array<{
      id: string;
      title: string;
      employee: string;
      department: string;
      type: 'Leave' | 'Salary' | 'Training' | 'Complaint' | 'Other';
      status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
      priority: 'Low' | 'Medium' | 'High' | 'Urgent';
      submittedDate: string;
      description: string;
    }>;
    hrToAdmin: Array<{
      id: string;
      title: string;
      employee: string;
      department: string;
      type: 'Leave' | 'Salary' | 'Training' | 'Complaint' | 'Other';
      status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
      priority: 'Low' | 'Medium' | 'High' | 'Urgent';
      submittedDate: string;
      description: string;
    }>;
  };
  total: number;
}

/**
 * Fetch HR requests data from API
 * Backend automatically determines department and role from JWT token
 * @param limit - Number of requests to return (default: 5, max recommended: 20)
 */
export const getHRRequestsApi = async (limit: number = 5): Promise<HRRequestsApiResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append('limit', limit.toString());
    }
    const url = `/dashboard/hr-requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const data = await apiGetJson<HRRequestsApiResponse>(url);
    return data;
  } catch (error) {
    console.error('Error fetching HR requests:', error);
    throw error;
  }
};

/**
 * API Response structure from /dashboard/attendance-trends
 */
export interface AttendanceTrendsApiResponse {
  department: string;
  role: string;
  period: 'daily' | 'monthly';
  summary: {
    currentPeriod: {
      averageAttendanceRate: number;
      totalEmployees: number;
      averagePresent: number;
      averageAbsent: number;
      bestDay?: { date: string; rate: number };
      worstDay?: { date: string; rate: number };
    };
    previousPeriod?: {
      averageAttendanceRate: number;
      totalEmployees: number;
      averagePresent: number;
      averageAbsent: number;
    };
    change?: {
      rate: number;
      trend: 'up' | 'down' | 'neutral';
      percentage: number;
    };
  };
  data: Array<{
    date: string;
    label: string;
    fullLabel: string;
    attendanceRate: number;
    totalEmployees: number;
    present: number;
    absent: number;
    onLeave?: number;
    remote?: number;
    late?: number;
    chartValue: number;
    isWeekend?: boolean;
    isHoliday?: boolean;
    monthNumber?: number;
    year?: number;
    workingDays?: number;
  }>;
  metadata: {
    dateRange: { start: string; end: string };
    totalDays?: number;
    workingDays?: number;
    weekendDays?: number;
    totalMonths?: number;
    generatedAt: string;
  };
}

/**
 * Fetch attendance trends data from API
 * Backend automatically determines department and role from JWT token
 * @param period - 'daily' or 'monthly' (default: 'daily')
 */
export const getAttendanceTrendsApi = async (period: 'daily' | 'monthly' = 'daily'): Promise<AttendanceTrendsApiResponse> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    const url = `/dashboard/attendance-trends?${queryParams.toString()}`;
    const data = await apiGetJson<AttendanceTrendsApiResponse>(url);
    return data;
  } catch (error) {
    console.error('Error fetching attendance trends:', error);
    throw error;
  }
};

/**
 * API Response structure from /dashboard/employee-count-by-department
 */
export interface DepartmentDistributionApiResponse {
  departments: Array<{
    department: string;
    count: number;
  }>;
  total: number;
}

/**
 * Fetch department distribution data from API
 * Backend automatically determines department and role from JWT token
 */
export const getDepartmentDistributionApi = async (): Promise<DepartmentDistributionApiResponse> => {
  try {
    const url = '/dashboard/employee-count-by-department';
    const data = await apiGetJson<DepartmentDistributionApiResponse>(url);
    return data;
  } catch (error) {
    console.error('Error fetching department distribution:', error);
    throw error;
  }
};

