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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// 1. Calculate All Salaries (Bulk Trigger)
export const calculateAllSalaries = async (): Promise<CalculateAllResponse> => {
  return apiRequest<CalculateAllResponse>('/finance/salary/calculate-all', {
    method: 'POST',
  });
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
  
  return apiRequest<SalaryPreview>(url);
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
  
  return apiRequest<SalaryDisplay>(url);
};

// 4. Get All Salaries Display (All Employees)
export const getAllSalariesDisplay = async (
  month?: string
): Promise<SalaryDisplayAll> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  
  const queryString = params.toString();
  const url = `/finance/salary/display-all${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest<SalaryDisplayAll>(url);
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
  
  return apiRequest<SalaryBreakdown>(url);
};

// 6. Get Sales Employees Bonus Display
export const getSalesEmployeesBonus = async (): Promise<SalesEmployeeBonus[]> => {
  return apiRequest<SalesEmployeeBonus[]>('/finance/salary/bonus-display');
};

// 7. Update Sales Employee Bonus
export const updateSalesEmployeeBonus = async (
  request: BonusUpdateRequest
): Promise<BonusUpdateResponse> => {
  return apiRequest<BonusUpdateResponse>('/finance/salary/update-sales-bonus', {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
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
export const getMockSalaryData = (month?: string): SalaryDisplayAll => {
  const selectedMonth = month || getCurrentMonth();
  const mockEmployees: SalaryDisplay[] = [
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
      createdAt: '2025-01-04T08:00:00.000Z'
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
      createdAt: '2025-01-04T08:00:00.000Z'
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
      createdAt: '2025-01-04T08:00:00.000Z'
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
      createdAt: '2025-01-04T08:00:00.000Z'
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
      createdAt: '2025-01-04T08:00:00.000Z'
    }
  ];

  return {
    month: selectedMonth,
    summary: {
      totalEmployees: 5,
      totalBaseSalary: 151000,
      totalCommission: 7500,
      totalBonus: 6000,
      totalNetSalary: 164500,
      totalDeductions: 2150,
      totalFinalSalary: 162350
    },
    employees: mockEmployees
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
