import { apiGetJson, apiRequest, ApiError } from '../utils/apiClient';
import { getApiBaseUrl } from '../config/api';

// Types for Salary Logs
export interface SalaryLog {
  id: number;
  employeeId: number;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'paid';
  processedBy?: number;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  processor?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface SalaryLogsResponse {
  logs: SalaryLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SalaryLogsStatsResponse {
  summary: {
    totalLogs: number;
    pendingLogs: number;
    processedLogs: number;
    paidLogs: number;
    totalSalaryPaid: number;
    averageSalary: number;
  };
  timeBasedStats: {
    thisMonth: number;
    thisQuarter: number;
    thisYear: number;
  };
  byMonth: {
    [key: string]: number;
  };
}

export interface GetSalaryLogsDto {
  employeeId?: number;
  status?: 'pending' | 'processed' | 'paid';
  month?: string;
  year?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// API Functions
export const getSalaryLogsApi = async (query: GetSalaryLogsDto = {}): Promise<SalaryLogsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (query.employeeId) params.append('employeeId', query.employeeId.toString());
    if (query.status) params.append('status', query.status);
    if (query.month) params.append('month', query.month);
    if (query.year) params.append('year', query.year.toString());
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.page) params.append('page', query.page.toString());
    if (query.orderBy) params.append('orderBy', query.orderBy);
    if (query.orderDirection) params.append('orderDirection', query.orderDirection);
    
    const queryString = params.toString();
    const url = `${getApiBaseUrl()}/finance/salary-logs${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGetJson<SalaryLogsResponse>(url);
    console.log('Salary logs API response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching salary logs:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to fetch salary logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getSalaryLogsStatsApi = async (): Promise<SalaryLogsStatsResponse> => {
  try {
    const response = await apiGetJson<SalaryLogsStatsResponse>(`${getApiBaseUrl()}/finance/salary-logs/stats`);
    return response;
  } catch (error: any) {
    console.error('Error fetching salary logs statistics:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to fetch salary logs statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportSalaryLogsApi = async (query: GetSalaryLogsDto = {}, format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    
    // Add format parameter
    params.append('format', format);
    
    // Add optional filters
    if (query.employeeId) params.append('employeeId', query.employeeId.toString());
    if (query.status) params.append('status', query.status);
    if (query.month) params.append('month', query.month);
    if (query.year) params.append('year', query.year.toString());
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    
    const queryString = params.toString();
    const url = `/finance/salary-logs/export${queryString ? `?${queryString}` : ''}`;
    
    // Use apiRequest for proper authentication
    const response = await apiRequest(url, {
      method: 'GET',
      headers: {
        'Accept': format === 'csv' ? 'text/csv' : 'application/json',
      },
    });

    return await response.blob();
  } catch (error: any) {
    console.error('Error exporting salary logs:', error);
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to export salary logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
