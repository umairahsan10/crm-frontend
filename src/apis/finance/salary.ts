// Salary Management API Functions
import type { 
  SalaryDisplayAll, 
  SalaryPreview, 
  SalaryDisplay, 
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
  if (endDate) params.append('endDate', endDate);
  
  const queryString = params.toString();
  const url = `/finance/salary/preview/${employeeId}${queryString ? `?${queryString}` : ''}`;
  
  return apiGetJson<SalaryPreview>(url);
};

// 3. Get Salary Display (Single Employee)
export const getSalaryDisplay = async (
  employeeId: number, 
  month?: string
): Promise<SalaryDisplay> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  
  const queryString = params.toString();
  const url = `/finance/salary/display/${employeeId}${queryString ? `?${queryString}` : ''}`;
  
  return apiGetJson<SalaryDisplay>(url);
};

// 4. Get All Salaries Display (All Employees) with Pagination and Filters
export interface SalaryFiltersParams {
  search?: string;
  department?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  minSalary?: string;
  maxSalary?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getAllSalariesDisplay = async (
  month?: string,
  page?: number,
  limit?: number,
  filters?: SalaryFiltersParams
): Promise<SalaryDisplayAll> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (page !== undefined) params.append('page', page.toString());
  if (limit !== undefined) params.append('limit', limit.toString());
  
  // Add filter parameters
  if (filters) {
    if (filters.search) params.append('search', filters.search);
    if (filters.department) params.append('department', filters.department);
    if (filters.status) params.append('status', filters.status);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.minSalary) params.append('minSalary', filters.minSalary);
    if (filters.maxSalary) params.append('maxSalary', filters.maxSalary);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  }
  
  const queryString = params.toString();
  const url = `/finance/salary/display-all${queryString ? `?${queryString}` : ''}`;
  
  const apiResponse = await apiGetJson<any>(url);
  
  // Handle paginated response structure
  const employeesArray = apiResponse.employees || apiResponse.data?.employees || apiResponse.data || [];
  const summaryData = apiResponse.summary || apiResponse.data?.summary || {};
  const paginationData = apiResponse.pagination || apiResponse.meta || apiResponse.paginationMeta || {};
  
  console.log('API Response pagination data:', paginationData);
  console.log('Page:', page, 'Limit:', limit);
  
  // Helper to build pagination object
  const buildPagination = (paginationData: any, employeesCount: number) => {
    // Check if we have pagination metadata
    if (paginationData.page || paginationData.total) {
      return {
        page: paginationData.page || page || 1,
        limit: paginationData.limit || paginationData.take || limit || 20,
        total: paginationData.total || paginationData.totalItems || paginationData.totalRecords || 0,
        totalPages: paginationData.totalPages || paginationData.totalPages || (paginationData.total ? Math.ceil((paginationData.total || 0) / (paginationData.limit || paginationData.take || limit || 20)) : 1),
        hasNext: paginationData.hasNext !== undefined ? paginationData.hasNext : ((paginationData.page || page || 1) < (paginationData.totalPages || Math.ceil((paginationData.total || 0) / (paginationData.limit || limit || 20)))),
        hasPrev: paginationData.hasPrev !== undefined ? paginationData.hasPrev : ((paginationData.page || page || 1) > 1)
      };
    }
    // If no pagination metadata but we requested pagination, calculate from employees returned
    if (page !== undefined || limit !== undefined) {
      // If we got fewer employees than the limit, assume this is the last page
      const actualLimit = limit || 20;
      const actualPage = page || 1;
      const hasMore = employeesCount === actualLimit; // If we got exactly the limit, there might be more
      return {
        page: actualPage,
        limit: actualLimit,
        total: employeesCount, // Unknown total, use count for now
        totalPages: hasMore ? actualPage + 1 : actualPage, // At least current page, maybe more
        hasNext: hasMore,
        hasPrev: actualPage > 1
      };
    }
    return undefined;
  };
  
  // Check if API response already has the correct structure (employees and summary)
  if (employeesArray.length > 0 || summaryData.totalEmployees !== undefined) {
    const mappedEmployees = (Array.isArray(employeesArray) ? employeesArray : []).map((emp: any) => ({
        employeeId: emp.employeeId,
        employeeName: emp.employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || `Employee ${emp.employeeId}`,
        department: emp.department || emp.departmentName || 'Unknown',
        month: emp.month || apiResponse.month || month || getCurrentMonth(),
        baseSalary: emp.baseSalary || emp.fullBaseSalary || 0,
        commission: emp.commission || 0,
        bonus: emp.bonus || emp.totalBonus || (emp.employeeBonus || 0) + (emp.salesBonus || 0),
        netSalary: emp.netSalary || ((emp.baseSalary || emp.fullBaseSalary || 0) + (emp.commission || 0) + (emp.bonus || emp.totalBonus || 0)),
        attendanceDeductions: emp.attendanceDeductions || 0,
        chargebackDeduction: emp.chargebackDeduction || 0,
        refundDeduction: emp.refundDeduction || 0,
        deductions: emp.deductions || (emp.attendanceDeductions || 0) + (emp.chargebackDeduction || 0) + (emp.refundDeduction || 0),
        finalSalary: emp.finalSalary || 0,
        status: (emp.status === 'unpaid' ? 'pending' : emp.status) || 'pending',
        paidOn: emp.paidOn || undefined,
        createdAt: emp.createdAt || new Date().toISOString()
      }));
    
    const pagination = buildPagination(paginationData, mappedEmployees.length);
    console.log('Built pagination:', pagination);
    
    return {
      month: apiResponse.month || month || getCurrentMonth(),
      summary: {
        totalEmployees: summaryData.totalEmployees || mappedEmployees.length || 0,
        totalBaseSalary: summaryData.totalBaseSalary || 0,
        totalCommission: summaryData.totalCommission || 0,
        totalBonus: summaryData.totalBonus || 0,
        totalNetSalary: summaryData.totalNetSalary || 0,
        totalDeductions: summaryData.totalDeductions || 0,
        totalFinalSalary: summaryData.totalFinalSalary || 0
      },
      employees: mappedEmployees,
      pagination
    };
  }
  
  // Fallback: Handle old API structure with results array
  const employees: SalaryDisplay[] = (apiResponse.results || []).map((emp: any) => ({
    employeeId: emp.employeeId,
    employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || `Employee ${emp.employeeId}`,
    department: emp.departmentName || emp.department || 'Unknown',
    month: apiResponse.month || month || getCurrentMonth(),
    baseSalary: emp.baseSalary || emp.fullBaseSalary || 0,
    commission: emp.commission || 0,
    bonus: emp.totalBonus || (emp.employeeBonus || 0) + (emp.salesBonus || 0),
    netSalary: (emp.baseSalary || emp.fullBaseSalary || 0) + (emp.commission || 0) + (emp.totalBonus || 0),
    attendanceDeductions: emp.attendanceDeductions || 0,
    chargebackDeduction: emp.chargebackDeduction || 0,
    refundDeduction: emp.refundDeduction || 0,
    deductions: emp.deductions || (emp.attendanceDeductions || 0) + (emp.chargebackDeduction || 0) + (emp.refundDeduction || 0),
    finalSalary: emp.finalSalary || 0,
    status: emp.status || 'pending',
    paidOn: emp.paidOn || undefined,
    createdAt: emp.createdAt || new Date().toISOString()
  }));
  
  // Build summary from API response
  const summary = {
    totalEmployees: apiResponse.totalEmployees || apiResponse.summary?.totalEmployees || employees.length,
    totalBaseSalary: apiResponse.totalBaseSalary || apiResponse.summary?.totalBaseSalary || 0,
    totalCommission: apiResponse.totalCommission || apiResponse.summary?.totalCommission || 0,
    totalBonus: apiResponse.totalBonus || apiResponse.summary?.totalBonus || 0,
    totalNetSalary: apiResponse.totalNetSalary || apiResponse.summary?.totalNetSalary || ((apiResponse.totalBaseSalary || apiResponse.summary?.totalBaseSalary || 0) + (apiResponse.totalCommission || apiResponse.summary?.totalCommission || 0) + (apiResponse.totalBonus || apiResponse.summary?.totalBonus || 0)),
    totalDeductions: apiResponse.totalDeductions || apiResponse.summary?.totalDeductions || 0,
    totalFinalSalary: apiResponse.totalFinalSalary || apiResponse.summary?.totalFinalSalary || 0
  };
  
  const pagination = buildPagination(paginationData, employees.length);
  console.log('Fallback pagination:', pagination);
  
  return {
    month: apiResponse.month || month || getCurrentMonth(),
    summary,
    employees,
    pagination
  };
};

// 5. Get Detailed Salary Breakdown
export const getSalaryBreakdown = async (
  employeeId: number, 
  month?: string
): Promise<SalaryBreakdown> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  const queryString = params.toString();
  const url = `/finance/salary/breakdown/${employeeId}${queryString ? `?${queryString}` : ''}`;
  
  return apiGetJson<SalaryBreakdown>(url);
};

// 6. Mark Salary as Paid (Single Employee)
export const markSalaryAsPaidApi = async (
  employeeId: number,
  month?: string
): Promise<{ message: string }> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  const queryString = params.toString();
  const url = `/finance/salary/mark-paid/${employeeId}${queryString ? `?${queryString}` : ''}`;
  
  return apiPatchJson<{ message: string }>(url);
};

// 7. Mark Salary as Paid (Bulk)
export interface BulkMarkPaidDto {
  employeeIds: number[];
  month?: string;
}

export const bulkMarkSalaryAsPaidApi = async (
  data: BulkMarkPaidDto
): Promise<{ message: string; marked: number; errors?: number }> => {
  const params = new URLSearchParams();
  if (data.month) params.append('month', data.month);
  const queryString = params.toString();
  const url = `/finance/salary/mark-paid-bulk${queryString ? `?${queryString}` : ''}`;
  
  return apiPatchJson<{ message: string; marked: number; errors?: number }>(url, data);
};

// 8. Get Sales Employees Bonus Display
export const getSalesEmployeesBonus = async (): Promise<SalesEmployeeBonus[]> => {
  const apiResponse = await apiGetJson<any>('/finance/salary/bonus-display');
  
  // Get the salesEmployees array from response (could be result, data, or direct array)
  const salesEmployees = apiResponse.result || apiResponse.data || apiResponse.salesEmployees || apiResponse || [];
  
  // Map the API response to the expected format
  // Expected structure: { employee: { id, firstName, lastName }, salesAmount, salesBonus }
  const result = (Array.isArray(salesEmployees) ? salesEmployees : []).map((record: any) => ({
    id: record.id || record.employee?.id,
    name: record.name || `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.trim() || `Employee ${record.id || record.employee?.id}`,
    salesAmount: Number(record.salesAmount || 0),
    bonusAmount: Number(record.bonusAmount || record.salesBonus || 0)
  }));
  
  return result;
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

// Mock data for development/testing
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

// Mock sales employees bonus data
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
