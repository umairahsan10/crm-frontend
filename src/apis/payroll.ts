import { apiGetJson, apiRequest, ApiError } from '../utils/apiClient';
import { getApiBaseUrl } from '../config/api';

// Types for Payroll/Net Salary
export interface NetSalary {
  id: number;
  employeeId: number;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  tax: number;
  netAmount: number;
  isPaid: boolean;
  paidOn?: string;
  processedBy?: number; // HR employee ID who marked it as paid
  createdAt: string;
  updatedAt: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    department: {
      id: number;
      name: string;
    };
    role: {
      id: number;
      title: string;
    };
  };
  processor?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  transaction?: {
    id: number;
    amount: number;
    transactionType: string;
    status: string;
    transactionDate: string;
  };
}

export interface PayrollStatistics {
  totalSalaries: number;
  totalPaid: number;
  totalPending: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  byDepartment: {
    [key: string]: {
      total: number;
      paid: number;
      pending: number;
      amount: number;
    };
  };
  thisMonth: {
    total: number;
    paid: number;
    pending: number;
  };
}

export interface GetPayrollDto {
  month?: number;
  year?: number;
  departmentId?: number;
  employeeId?: number;
  isPaid?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface MarkSalaryPaidDto {
  salaryId: number;
  paidOn?: string; // Optional, defaults to current date
}

export interface PayrollResponse {
  status: string;
  message: string;
  data: NetSalary[];
  total: number;
  page?: number;
  limit?: number;
}

export interface SingleSalaryResponse {
  status: string;
  message: string;
  data: NetSalary;
}

export interface PayrollStatsResponse {
  status: string;
  message: string;
  data: PayrollStatistics;
}

// API Functions
const BASE_URL = getApiBaseUrl();

/**
 * Get all salaries with filters
 */
export const getPayrollApi = async (query: GetPayrollDto = {}): Promise<PayrollResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (query.month) params.append('month', query.month.toString());
    if (query.year) params.append('year', query.year.toString());
    if (query.departmentId) params.append('departmentId', query.departmentId.toString());
    if (query.employeeId) params.append('employeeId', query.employeeId.toString());
    if (query.isPaid !== undefined) params.append('isPaid', query.isPaid.toString());
    if (query.search) params.append('search', query.search);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    
    const queryString = params.toString();
    const url = `${BASE_URL}/hr/payroll${queryString ? `?${queryString}` : ''}`;
    
    console.log('Fetching payroll from:', url);
    const response = await apiGetJson<PayrollResponse>(url);
    console.log('Payroll API response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching payroll:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Failed to fetch payroll: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get single salary by ID
 */
export const getSalaryByIdApi = async (id: number): Promise<SingleSalaryResponse> => {
  try {
    const url = `${BASE_URL}/hr/payroll/${id}`;
    console.log('Fetching salary from:', url);
    
    const response = await apiGetJson<SingleSalaryResponse>(url);
    console.log('Salary API response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching salary:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Failed to fetch salary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Mark salary as paid
 * This will:
 * 1. Update net_salary.isPaid = true
 * 2. Update net_salary.paidOn = current date
 * 3. Update net_salary.processedBy = current HR user ID
 * 4. Create transaction record with category=salary
 */
export const markSalaryAsPaidApi = async (data: MarkSalaryPaidDto): Promise<SingleSalaryResponse> => {
  try {
    const url = `${BASE_URL}/hr/payroll/${data.salaryId}/mark-paid`;
    console.log('Marking salary as paid:', url, data);
    
    const response = await apiRequest(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paidOn: data.paidOn || new Date().toISOString(),
      }),
    });

    const result = await response.json();
    console.log('Mark salary paid response:', result);
    
    return result;
  } catch (error: any) {
    console.error('Error marking salary as paid:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Failed to mark salary as paid: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get payroll statistics
 */
export const getPayrollStatisticsApi = async (query: { month?: number; year?: number } = {}): Promise<PayrollStatsResponse> => {
  try {
    const params = new URLSearchParams();
    if (query.month) params.append('month', query.month.toString());
    if (query.year) params.append('year', query.year.toString());
    
    const queryString = params.toString();
    const url = `${BASE_URL}/hr/payroll/statistics${queryString ? `?${queryString}` : ''}`;
    
    console.log('Fetching payroll statistics from:', url);
    const response = await apiGetJson<PayrollStatsResponse>(url);
    console.log('Payroll statistics response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching payroll statistics:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Failed to fetch payroll statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Export payroll data
 */
export const exportPayrollApi = async (query: GetPayrollDto = {}, format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    
    params.append('format', format);
    if (query.month) params.append('month', query.month.toString());
    if (query.year) params.append('year', query.year.toString());
    if (query.departmentId) params.append('departmentId', query.departmentId.toString());
    if (query.isPaid !== undefined) params.append('isPaid', query.isPaid.toString());
    
    const queryString = params.toString();
    const url = `${BASE_URL}/hr/payroll/export${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiRequest(url, {
      method: 'GET',
      headers: {
        'Accept': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    return await response.blob();
  } catch (error: any) {
    console.error('Error exporting payroll:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Failed to export payroll: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

