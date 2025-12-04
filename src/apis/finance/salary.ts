// Salary Management API Functions
import type { 
  SalaryDisplayAll, 
  SalaryPreview, 
  SalaryBreakdown, 
  SalesEmployeeBonus, 
  BonusUpdateRequest, 
  BonusUpdateResponse,
  CalculateAllResponse
} from '../../types/finance/salary';
import { apiGetJson, apiPostJson, apiPatchJson } from '../../utils/apiClient';

// 1. Calculate All Salaries (Bulk Trigger)
export const calculateAllSalaries = async (): Promise<CalculateAllResponse> => {
  return apiPostJson<CalculateAllResponse>('/finance/salary/calculate-all');
};

// 2. Salary Preview (Read-Only Calculation)
export const getSalaryPreview = async (
  employeeId: number, 
  endDate?: string
): Promise<SalaryPreview> => {
  const params = new URLSearchParams();
  params.append('employeeId', employeeId.toString());
  if (endDate) params.append('endDate', endDate);
  
  const queryString = params.toString();
  const url = `/finance/salary/calculate${queryString ? `?${queryString}` : ''}`;
  
  return apiGetJson<SalaryPreview>(url);
};

// 3. Get All Salaries (All Employees) with Pagination and Filters
export interface SalaryFiltersParams {
  search?: string;
  department?: string;
  status?: string;
  minSalary?: string;
  maxSalary?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  departments?: string;
}

export const getAllSalaries = async (
  month?: string,
  page?: number,
  limit?: number,
  filters?: SalaryFiltersParams
): Promise<SalaryDisplayAll> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (page !== undefined) params.append('page', page.toString());
  if (limit !== undefined) params.append('limit', limit.toString());
  
  if (filters) {
    if (filters.search) params.append('search', filters.search);
    const departmentFilter = filters.departments || filters.department;
    if (departmentFilter) params.append('departments', departmentFilter);
    if (filters.status) params.append('status', filters.status);
    if (filters.minSalary) params.append('minSalary', filters.minSalary);
    if (filters.maxSalary) params.append('maxSalary', filters.maxSalary);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  }
  
  const queryString = params.toString();
  const url = `/finance/salary${queryString ? `?${queryString}` : ''}`;
  
  const apiResponse = await apiGetJson<SalaryDisplayAll>(url);

  // Extract values to avoid type narrowing issues
  const totalEmployees = apiResponse.summary?.totalEmployees || apiResponse.employees.length || 0;
  const employeesLength = apiResponse.employees.length || 0;
  const currentLimit = limit || employeesLength || 1;
  const currentPage = page || 1;

  // Build pagination object, using existing pagination if available
  const pagination = apiResponse.pagination ? {
    ...apiResponse.pagination,
    page: apiResponse.pagination.page || currentPage,
    limit: apiResponse.pagination.limit || currentLimit,
    total: apiResponse.pagination.total || totalEmployees,
    totalPages: apiResponse.pagination.totalPages || Math.max(1, Math.ceil(totalEmployees / currentLimit)),
    hasNext: apiResponse.pagination.hasNext ?? false,
    hasPrev: apiResponse.pagination.hasPrev ?? (currentPage > 1)
  } : {
    page: currentPage,
    limit: limit || employeesLength || 0,
    total: totalEmployees || employeesLength || 0,
    totalPages: Math.max(1, Math.ceil(totalEmployees / currentLimit)),
    hasNext: false,
    hasPrev: currentPage > 1
  };

  return {
    ...apiResponse,
    month: apiResponse.month || month || getCurrentMonth(),
    pagination
  };
};

// 4. Get Detailed Salary Breakdown/Details
export const getSalaryDetails = async (
  employeeId: number, 
  month?: string
): Promise<SalaryBreakdown> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  const queryString = params.toString();
  const url = `/finance/salary/${employeeId}${queryString ? `?${queryString}` : ''}`;
  
  return apiGetJson<SalaryBreakdown>(url);
};

// 5. Mark Salary as Paid (Single or Bulk)
export interface MarkSalaryPayload {
  employeeId?: number;
  employeeIds?: number[];
  month: string;
}

export const markSalaryRecordsApi = async (
  payload: MarkSalaryPayload
): Promise<{ message: string; marked?: number }> => {
  return apiPatchJson<{ message: string; marked?: number }>('/finance/salary/mark', payload);
};

// 8. Get Sales Employees Bonus Display with Pagination and Filters
export interface BonusFiltersParams {
  search?: string;
  minSales?: string;
  maxSales?: string;
  minBonus?: string;
  maxBonus?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BonusDisplayResponse {
  employees: SalesEmployeeBonus[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

type SalesEmployeeApiRecord = {
  id?: number;
  name?: string;
  salesAmount?: number | string;
  bonusAmount?: number | string;
  salesBonus?: number | string;
  employee?: {
    id?: number;
    firstName?: string;
    lastName?: string;
  };
};

type PaginationMeta = {
  page?: number;
  limit?: number;
  take?: number;
  total?: number;
  totalItems?: number;
  totalRecords?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
};

type SalesEmployeesApiResponse = {
  result?: unknown;
  data?: unknown;
  salesEmployees?: unknown;
  employees?: unknown;
  pagination?: PaginationMeta;
  meta?: PaginationMeta;
  paginationMeta?: PaginationMeta;
};

export const getSalesEmployeesBonus = async (
  page?: number,
  limit?: number,
  filters?: BonusFiltersParams
): Promise<BonusDisplayResponse> => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', page.toString());
  if (limit !== undefined) params.append('limit', limit.toString());
  
  // Add filter parameters
  if (filters) {
    if (filters.search) params.append('search', filters.search);
    if (filters.minSales) params.append('minSales', filters.minSales);
    if (filters.maxSales) params.append('maxSales', filters.maxSales);
    if (filters.minBonus) params.append('minBonus', filters.minBonus);
    if (filters.maxBonus) params.append('maxBonus', filters.maxBonus);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  }
  
  const queryString = params.toString();
  const url = `/finance/salary/bonus-display${queryString ? `?${queryString}` : ''}`;
  
  const apiResponse = await apiGetJson<SalesEmployeesApiResponse>(url);
  
  // Get the salesEmployees array from response (could be result, data, or direct array)
  const rawRecords =
    apiResponse.result ??
    apiResponse.data ??
    apiResponse.salesEmployees ??
    apiResponse.employees ??
    [];

  const normalizedRecords: SalesEmployeeApiRecord[] = Array.isArray(rawRecords)
    ? rawRecords
    : Array.isArray((rawRecords as { employees?: SalesEmployeeApiRecord[] }).employees)
      ? (rawRecords as { employees: SalesEmployeeApiRecord[] }).employees
      : [];
  
  // Map the API response to the expected format
  // Expected structure: { employee: { id, firstName, lastName }, salesAmount, salesBonus }
  const employees = normalizedRecords.map((record) => {
    const fallbackId = record.employee?.id ?? record.id ?? 0;
    const fallbackName = `Employee ${fallbackId}`.trim();
    const composedName = `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.trim();
    
    return {
      id: fallbackId,
      name: record.name || composedName || fallbackName,
      salesAmount: Number(record.salesAmount ?? 0),
      bonusAmount: Number(record.bonusAmount ?? record.salesBonus ?? 0)
    };
  });
  
  // Extract pagination data
  const paginationData = apiResponse.pagination || apiResponse.meta || apiResponse.paginationMeta || {};
  
  const pagination = paginationData.page || paginationData.total ? {
    page: paginationData.page || page || 1,
    limit: paginationData.limit || paginationData.take || limit || 20,
    total: paginationData.total || paginationData.totalItems || paginationData.totalRecords || employees.length,
    totalPages: paginationData.totalPages || Math.ceil((paginationData.total || employees.length) / (paginationData.limit || limit || 20)),
    hasNext: paginationData.hasNext !== undefined ? paginationData.hasNext : false,
    hasPrev: paginationData.hasPrev !== undefined ? paginationData.hasPrev : false
  } : undefined;
  
  return {
    employees,
    pagination
  };
};

// 7. Update Sales Employee Bonus
export const updateSalesEmployeeBonus = async (
  request: BonusUpdateRequest
): Promise<BonusUpdateResponse> => {
  return apiPatchJson<BonusUpdateResponse>('/finance/salary/update-sales-bonus', request);
};

// Additional utility functions for frontend

// Get current month in YYYY-MM format
export const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format date for display
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date and time for display
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Generate month options for dropdown (last 12 months)
export const getMonthOptions = (): { value: string; label: string }[] => {
  const options = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
    
    options.push({ value, label });
  }
  
  return options;
};

// REMOVED: Mock data function - not used in production
// If needed for testing, use actual API endpoints instead
/*
export const getMockSalaryData = (month?: string, recalculated?: boolean): SalaryDisplayAll => {
  const selectedMonth = month || getCurrentMonth();
  
  // Real salary calculation logic
  const calculateEmployeeSalary = (employee: any, isRecalculated: boolean) => {
    if (!isRecalculated) {
      // Return original values if not recalculated
      return employee;
    }
    
    // Simulate real calculation based on employee data
    const baseSalary = employee.baseSalary;
    const daysInMonth = 31; // Assuming 31 days for simplicity
    const workingDays = daysInMonth - (employee.absentDays || 0) - (employee.lateDays || 0) * 0.5 - (employee.halfDays || 0) * 0.5;
    
    // Calculate prorated base salary
    const proratedBaseSalary = Math.round((baseSalary * workingDays) / daysInMonth);
    
    // Calculate attendance deductions
    const absentDeduction = (employee.absentDays || 0) * (baseSalary / daysInMonth);
    const lateDeduction = (employee.lateDays || 0) * (baseSalary / daysInMonth) * 0.1; // 10% deduction for late
    const halfDayDeduction = (employee.halfDays || 0) * (baseSalary / daysInMonth) * 0.5;
    const attendanceDeductions = absentDeduction + lateDeduction + halfDayDeduction;
    
    // Calculate commission (based on completed projects)
    const commission = employee.department === 'Sales' ? 
      Math.round((employee.commission || 0) * (0.8 + Math.random() * 0.4)) : 0; // ±20% variation
    
    // Calculate bonuses
    const employeeBonus = Math.round((employee.bonus || 0) * (0.9 + Math.random() * 0.2)); // ±10% variation
    const salesBonus = employee.department === 'Sales' && commission > 2000 ? 
      Math.round(commission * 0.1) : 0; // 10% of commission as sales bonus
    const totalBonus = employeeBonus + salesBonus;
    
    // Calculate other deductions
    const chargebackDeduction = employee.chargebackDeduction || 0;
    const refundDeduction = employee.refundDeduction || 0;
    const totalDeductions = attendanceDeductions + chargebackDeduction + refundDeduction;
    
    // Calculate net and final salary
    const netSalary = proratedBaseSalary + commission + totalBonus;
    const finalSalary = netSalary - totalDeductions;
    
    return {
      ...employee,
      baseSalary: proratedBaseSalary,
      commission: commission,
      bonus: totalBonus,
      netSalary: netSalary,
      attendanceDeductions: Math.round(attendanceDeductions),
      chargebackDeduction: chargebackDeduction,
      refundDeduction: refundDeduction,
      deductions: Math.round(totalDeductions),
      finalSalary: Math.round(finalSalary)
    };
  };
  // Base employee data with attendance information
  const baseEmployees = [
    {
      employeeId: 1,
      employeeName: 'John Doe',
      department: 'Sales',
      month: selectedMonth,
      baseSalary: 30000,
      commission: 2500,
      bonus: 1500,
      netSalary: 34000,
      attendanceDeductions: 450,
      chargebackDeduction: 100,
      refundDeduction: 50,
      deductions: 600,
      finalSalary: 33400,
      status: 'paid',
      paidOn: '2025-01-05T10:30:00.000Z',
      createdAt: '2025-01-04T08:00:00.000Z',
      // Attendance data for calculation
      absentDays: 2,
      lateDays: 3,
      halfDays: 1
    },
    {
      employeeId: 2,
      employeeName: 'Jane Smith',
      department: 'Marketing',
      month: selectedMonth,
      baseSalary: 28000,
      commission: 0,
      bonus: 800,
      netSalary: 28800,
      attendanceDeductions: 200,
      chargebackDeduction: 0,
      refundDeduction: 0,
      deductions: 200,
      finalSalary: 28600,
      status: 'paid',
      paidOn: '2025-01-05T10:30:00.000Z',
      createdAt: '2025-01-04T08:00:00.000Z',
      // Attendance data for calculation
      absentDays: 1,
      lateDays: 2,
      halfDays: 0
    },
    {
      employeeId: 3,
      employeeName: 'Mike Johnson',
      department: 'Sales',
      month: selectedMonth,
      baseSalary: 32000,
      commission: 1800,
      bonus: 1200,
      netSalary: 35000,
      attendanceDeductions: 300,
      chargebackDeduction: 150,
      refundDeduction: 0,
      deductions: 450,
      finalSalary: 34550,
      status: 'pending',
      createdAt: '2025-01-04T08:00:00.000Z',
      // Attendance data for calculation
      absentDays: 0,
      lateDays: 5,
      halfDays: 2
    },
    {
      employeeId: 4,
      employeeName: 'Sarah Wilson',
      department: 'HR',
      month: selectedMonth,
      baseSalary: 26000,
      commission: 0,
      bonus: 500,
      netSalary: 26500,
      attendanceDeductions: 0,
      chargebackDeduction: 0,
      refundDeduction: 0,
      deductions: 0,
      finalSalary: 26500,
      status: 'paid',
      paidOn: '2025-01-05T10:30:00.000Z',
      createdAt: '2025-01-04T08:00:00.000Z',
      // Attendance data for calculation
      absentDays: 0,
      lateDays: 0,
      halfDays: 0
    },
    {
      employeeId: 5,
      employeeName: 'David Brown',
      department: 'Sales',
      month: selectedMonth,
      baseSalary: 35000,
      commission: 3200,
      bonus: 2000,
      netSalary: 40200,
      attendanceDeductions: 600,
      chargebackDeduction: 200,
      refundDeduction: 100,
      deductions: 900,
      finalSalary: 39300,
      status: 'processing',
      createdAt: '2025-01-04T08:00:00.000Z',
      // Attendance data for calculation
      absentDays: 3,
      lateDays: 1,
      halfDays: 0
    }
  ];

  // Apply calculation logic to employees
  const calculatedEmployees = baseEmployees.map(emp => calculateEmployeeSalary(emp, recalculated || false));
  
  // Calculate summary totals
  const summary = calculatedEmployees.reduce((acc, emp) => ({
    totalEmployees: acc.totalEmployees + 1,
    totalBaseSalary: acc.totalBaseSalary + emp.baseSalary,
    totalCommission: acc.totalCommission + emp.commission,
    totalBonus: acc.totalBonus + emp.bonus,
    totalNetSalary: acc.totalNetSalary + emp.netSalary,
    totalDeductions: acc.totalDeductions + emp.deductions,
    totalFinalSalary: acc.totalFinalSalary + emp.finalSalary
  }), {
    totalEmployees: 0,
    totalBaseSalary: 0,
    totalCommission: 0,
    totalBonus: 0,
    totalNetSalary: 0,
    totalDeductions: 0,
    totalFinalSalary: 0
  });

  return {
    month: selectedMonth,
    summary,
    employees: calculatedEmployees
  };
};
*/

// REMOVED: Mock data function - not used in production
// If needed for testing, use actual API endpoints instead
/*
export const getMockSalesBonusData = (): SalesEmployeeBonus[] => [
  {
    id: 1,
    name: 'John Doe',
    salesAmount: 5000,
    bonusAmount: 500
  },
  {
    id: 3,
    name: 'Mike Johnson',
    salesAmount: 4500,
    bonusAmount: 300
  },
  {
    id: 5,
    name: 'David Brown',
    salesAmount: 6000,
    bonusAmount: 800
  }
];
*/

// Commission Management API Functions
export interface CommissionEmployee {
  id: number;
  name: string;
  commissionAmount: string | number;
  withholdCommission: string | number;
  withholdFlag: boolean;
}

export interface CommissionDetailsResponse {
  commissionEmployees: CommissionEmployee[];
  summary: {
    totalCommissionAmount: number;
    totalWithheldAmount: number;
    totalEmployees: number;
  };
}

// Get commission details for all employees
export const getCommissionDetails = async (): Promise<CommissionDetailsResponse> => {
  const response = await apiGetJson<CommissionEmployee[]>('/salary/commission/details');
  
  // Transform the response to match our interface
  const commissionEmployees = response || [];
  
  // Calculate summary from the data
  const summary = {
    totalCommissionAmount: commissionEmployees.reduce((sum, emp) => 
      sum + (typeof emp.commissionAmount === 'string' ? parseFloat(emp.commissionAmount) : emp.commissionAmount), 0),
    totalWithheldAmount: commissionEmployees.reduce((sum, emp) => 
      sum + (typeof emp.withholdCommission === 'string' ? parseFloat(emp.withholdCommission) : emp.withholdCommission), 0),
    totalEmployees: commissionEmployees.length
  };
  
  return {
    commissionEmployees,
    summary
  };
};

// Assign commission
export const assignCommission = async (payload: { project_id: number }) => {
  return apiPostJson('/salary/commission/assign', payload);
};

// Update withhold flag
export const updateWithholdFlag = async (payload: { employee_id: number; flag: boolean }) => {
  return apiPostJson('/salary/commission/withhold-flag', payload);
};

// Transfer commission
export const transferCommission = async (payload: { employee_id: number; amount: number; direction: 'release' | 'withhold' }) => {
  return apiPostJson('/salary/commission/transfer', payload);
};
