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

/**
 * API Response structure from /dashboard/sales-trends
 */
export interface SalesTrendsApiResponse {
  status: string;
  department: string;
  role: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  summary: {
    currentPeriod: {
      totalRevenue: number;
      totalDeals: number;
      averageDealSize: number;
      conversionRate: number;
      bestMonth?: {
        date: string;
        revenue: number;
        label: string;
      };
      worstMonth?: {
        date: string;
        revenue: number;
        label: string;
      };
    };
    previousPeriod?: {
      totalRevenue: number;
      totalDeals: number;
      averageDealSize: number;
      conversionRate: number;
    };
    change?: {
      revenue: number;
      revenuePercentage: number;
      deals: number;
      dealsPercentage: number;
      trend: 'up' | 'down' | 'neutral';
    };
  };
  data: Array<{
    date: string;
    label: string;
    fullLabel: string;
    revenue: number;
    deals: number;
    conversionRate: number;
    averageDealSize: number;
    chartValue: number;
    monthNumber?: number;
    year?: number;
  }>;
  metadata: {
    dateRange: {
      start: string;
      end: string;
    };
    totalMonths?: number;
    generatedAt: string;
  };
}

/**
 * Fetch sales trends data from API
 * Backend automatically determines department and role from JWT token
 * @param period - 'daily', 'weekly', 'monthly', 'quarterly', or 'yearly' (default: 'monthly')
 * @param fromDate - Start date in ISO 8601 format (optional)
 * @param toDate - End date in ISO 8601 format (optional)
 * @param unit - Filter by specific sales unit (optional, only for department managers)
 */
export const getSalesTrendsApi = async (
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
  fromDate?: string,
  toDate?: string,
  unit?: string
): Promise<SalesTrendsApiResponse> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);
    if (unit) queryParams.append('unit', unit);
    
    const url = `/dashboard/sales-trends?${queryParams.toString()}`;
    const data = await apiGetJson<SalesTrendsApiResponse>(url);
    return data;
  } catch (error) {
    console.error('Error fetching sales trends:', error);
    throw error;
  }
};

/**
 * API Response structure from /dashboard/top-performers
 */
export interface TopPerformersApiResponse {
  status: string;
  department: string;
  role: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  metric: 'deals' | 'revenue' | 'conversion_rate' | 'leads';
  summary: {
    totalTeamMembers: number;
    periodStart: string;
    periodEnd: string;
    averagePerformance: number;
  };
  data: Array<{
    employeeId: number;
    employeeName: string;
    value: number;
    metric: string;
    additionalMetrics: {
      revenue?: number;
      leads?: number;
      conversionRate?: number;
      averageDealSize?: number;
    };
    rank: number;
    change?: {
      value: number;
      percentage: number;
      trend: 'up' | 'down' | 'neutral';
    };
  }>;
  metadata: {
    generatedAt: string;
  };
}

/**
 * Fetch top performers data from API
 * Backend automatically determines department and role from JWT token
 * @param limit - Number of top performers to return (default: 5, max: 20)
 * @param period - 'daily', 'weekly', 'monthly', 'quarterly', or 'yearly' (default: 'monthly')
 * @param fromDate - Start date in ISO 8601 format (optional)
 * @param toDate - End date in ISO 8601 format (optional)
 * @param unit - Filter by specific sales unit (optional, only for department managers)
 * @param metric - Performance metric: 'deals', 'revenue', 'conversion_rate', or 'leads' (default: 'deals')
 */
export const getTopPerformersApi = async (
  limit: number = 5,
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
  fromDate?: string,
  toDate?: string,
  unit?: string,
  metric: 'deals' | 'revenue' | 'conversion_rate' | 'leads' = 'deals'
): Promise<TopPerformersApiResponse> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    queryParams.append('period', period);
    queryParams.append('metric', metric);
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);
    if (unit) queryParams.append('unit', unit);
    
    const url = `/dashboard/top-performers?${queryParams.toString()}`;
    const data = await apiGetJson<TopPerformersApiResponse>(url);
    return data;
  } catch (error) {
    console.error('Error fetching top performers:', error);
    throw error;
  }
};

/**
 * API Response structure from /dashboard/current-projects
 */
export interface CurrentProjectsApiResponse {
  projects: Array<{
    name: string;
    progress: number;
    status: 'on-track' | 'ahead' | 'delayed';
    deadline: string; // YYYY-MM-DD format
    team: string;
  }>;
}

/**
 * Fetch current projects data from API
 * Backend automatically determines department and role from JWT token
 * Returns up to 5 projects (running projects first, then completed)
 * @param employeeId - Optional employee ID to filter projects. If provided, only returns projects for that employee.
 *                     Should only be used for non-managers/unit heads. Managers and unit heads should pass undefined to see all projects.
 */
export const getCurrentProjectsApi = async (employeeId?: number): Promise<CurrentProjectsApiResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (employeeId !== undefined) {
      queryParams.append('employeeId', employeeId.toString());
    }
    const url = `/dashboard/current-projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const data = await apiGetJson<CurrentProjectsApiResponse>(url);
    return data;
  } catch (error) {
    console.error('Error fetching current projects:', error);
    throw error;
  }
};

/**
 * API Response structure from /dashboard/cross-department-top-performers
 */
export interface CrossDepartmentTopPerformerDto {
  employeeId: number;
  employeeName: string;
  department: string;
  role: string;
  performancePercentage: number;
  rank: number;
  metrics: {
    [key: string]: any;
  };
}

export interface CrossDepartmentTopPerformersSummaryDto {
  totalDepartments: number;
  periodStart: string;
  periodEnd: string;
  averagePerformance: number;
}

export interface CrossDepartmentTopPerformersMetadataDto {
  generatedAt: string;
}

export interface CrossDepartmentTopPerformersResponseDto {
  status: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  summary: CrossDepartmentTopPerformersSummaryDto;
  data: CrossDepartmentTopPerformerDto[];
  metadata: CrossDepartmentTopPerformersMetadataDto;
}

/**
 * Fetch cross-department top performers data from API
 * Returns top performers from all departments
 * @param period - 'daily', 'weekly', 'monthly', 'quarterly', or 'yearly' (default: 'monthly')
 * @param limit - Number of top performers to return (optional, backend may have default)
 */
export const getCrossDepartmentTopPerformersApi = async (
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
  limit?: number
): Promise<CrossDepartmentTopPerformersResponseDto> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    if (limit) queryParams.append('limit', limit.toString());
    
    const url = `/dashboard/cross-department-top-performers?${queryParams.toString()}`;
    const data = await apiGetJson<CrossDepartmentTopPerformersResponseDto>(url);
    return data;
  } catch (error) {
    console.error('Error fetching cross-department top performers:', error);
    throw error;
  }
};

