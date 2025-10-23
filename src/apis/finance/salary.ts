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
  // For development/testing, simulate API call with mock response
  // In a real app, you would call the actual API:
  // return apiRequest<CalculateAllResponse>('/finance/salary/calculate-all', {
  //   method: 'POST',
  // });
  
  // Mock implementation with real calculation logic
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate the backend calculation process
      console.log('Calculating salaries for all employees...');
      
      // In a real implementation, this would:
      // 1. Fetch all active employees
      // 2. Get their attendance records for the month
      // 3. Calculate base salary (prorated if joined mid-month)
      // 4. Add commissions from completed projects
      // 5. Add bonuses (employee and sales bonuses)
      // 6. Calculate deductions (absent, late, half-day, chargebacks, refunds)
      // 7. Calculate final salary = base + commission + bonus - deductions
      // 8. Store calculated salaries in database
      // 9. Update employee salary records
      
      resolve({
        message: "Salary calculation completed for all employees"
      });
    }, 2000); // Simulate longer processing time for real calculation
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
  // For development/testing, use mock data
  // In a real app, you would call the actual API:
  // const params = new URLSearchParams();
  // if (month) params.append('month', month);
  // const queryString = params.toString();
  // const url = `/finance/salary/display-all${queryString ? `?${queryString}` : ''}`;
  // return apiRequest<SalaryDisplayAll>(url);
  
  return getMockSalaryData(month);
};

// 5. Get Detailed Salary Breakdown
export const getSalaryBreakdown = async (
  employeeId: number, 
  month?: string
): Promise<SalaryBreakdown> => {
  // For development/testing, use mock data
  // In a real app, you would call the actual API:
  // const params = new URLSearchParams();
  // if (month) params.append('month', month);
  // const queryString = params.toString();
  // const url = `/finance/salary/breakdown/${employeeId}${queryString ? `?${queryString}` : ''}`;
  // return apiRequest<SalaryBreakdown>(url);
  
  // Mock implementation for development
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockBreakdown: SalaryBreakdown = {
        employee: {
          id: employeeId,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@company.com',
          department: 'Sales',
          status: 'active',
          startDate: '2023-01-01T00:00:00.000Z',
          endDate: undefined
        },
        salary: {
          baseSalary: 30000,
          commission: 2500,
          bonus: 1500,
          netSalary: 34000,
          attendanceDeductions: 450,
          chargebackDeduction: 100,
          refundDeduction: 50,
          deductions: 600,
          finalSalary: 33400
        },
        month: month || getCurrentMonth(),
        status: 'paid',
        paidOn: '2025-01-05T10:30:00.000Z',
        createdAt: '2025-01-04T08:00:00.000Z',
        commissionBreakdown: [
          {
            projectId: 101,
            projectName: 'Website Redesign',
            clientName: 'ABC Corp',
            projectValue: 50000,
            commissionRate: 5.0,
            commissionAmount: 2500,
            completedAt: '2025-01-15T00:00:00.000Z',
            status: 'completed'
          }
        ],
        deductionBreakdown: {
          absentDeduction: 200,
          lateDeduction: 150,
          halfDayDeduction: 100,
          chargebackDeduction: 100,
          refundDeduction: 50,
          totalDeduction: 600
        }
      };
      resolve(mockBreakdown);
    }, 500); // Simulate API delay
  });
};

// 6. Get Sales Employees Bonus Display
export const getSalesEmployeesBonus = async (): Promise<SalesEmployeeBonus[]> => {
  // For development/testing, use mock data
  // In a real app, you would call the actual API:
  // return apiRequest<SalesEmployeeBonus[]>('/finance/salary/bonus-display');
  
  return getMockSalesBonusData();
};

// 7. Update Sales Employee Bonus
export const updateSalesEmployeeBonus = async (
  request: BonusUpdateRequest
): Promise<BonusUpdateResponse> => {
  // For development/testing, simulate API call with mock response
  // In a real app, you would call the actual API:
  // return apiRequest<BonusUpdateResponse>('/finance/salary/update-sales-bonus', {
  //   method: 'PATCH',
  //   body: JSON.stringify(request),
  // });
  
  // Mock implementation for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: request.employee_id,
        name: `Employee ${request.employee_id}`,
        salesAmount: 5000,
        bonusAmount: request.bonusAmount,
        message: `Bonus updated successfully for Employee ${request.employee_id}`
      });
    }, 500); // Simulate API delay
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
