// Salary Management Types and Interfaces

export interface SalaryEmployee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  status: 'active' | 'inactive';
  startDate: string;
  endDate?: string;
  avatar?: string;
}

export interface SalaryCalculation {
  fullBaseSalary: number;
  proratedBaseSalary: number;
  employeeBonus: number;
  salesBonus: number;
  totalBonus: number;
  commission: number;
  netSalary: number;
  deductions: number;
  finalSalary: number;
}

export interface DeductionBreakdown {
  absentDeduction: number;
  lateDeduction: number;
  halfDayDeduction: number;
  chargebackDeduction: number;
  refundDeduction: number;
  totalDeduction: number;
}

export interface CalculationPeriod {
  startDay: number;
  endDay: number;
  daysWorked: number;
  year: number;
  month: number;
}

export interface SalaryPreview {
  employee: SalaryEmployee;
  salary: SalaryCalculation;
  calculationPeriod: CalculationPeriod;
  deductionBreakdown: DeductionBreakdown;
}

export interface SalaryDisplay {
  employeeId: number;
  employeeName: string;
  department: string;
  month: string;
  baseSalary: number;
  commission: number;
  bonus: number;
  netSalary: number;
  attendanceDeductions: number;
  chargebackDeduction: number;
  refundDeduction: number;
  deductions: number;
  finalSalary: number;
  status: 'pending' | 'paid' | 'processing';
  paidOn?: string;
  createdAt: string;
}

export interface SalarySummary {
  totalEmployees: number;
  totalBaseSalary: number;
  totalCommission: number;
  totalBonus: number;
  totalNetSalary: number;
  totalDeductions: number;
  totalFinalSalary: number;
}

export interface SalaryDisplayAll {
  month: string;
  summary: SalarySummary;
  employees: SalaryDisplay[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CommissionBreakdown {
  projectId: number;
  projectName: string;
  clientName: string;
  projectValue: number;
  commissionRate: number;
  commissionAmount: number;
  completedAt: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface SalaryBreakdown {
  employee: SalaryEmployee;
  salary: {
    baseSalary: number;
    commission: number;
    bonus: number;
    netSalary: number;
    attendanceDeductions: number;
    chargebackDeduction: number;
    refundDeduction: number;
    deductions: number;
    finalSalary: number;
  };
  month: string;
  status: 'pending' | 'paid' | 'processing';
  paidOn?: string;
  createdAt: string;
  commissionBreakdown: CommissionBreakdown[];
  deductionBreakdown: DeductionBreakdown;
}

export interface SalesEmployeeBonus {
  id: number;
  name: string;
  salesAmount: number;
  bonusAmount: number;
}

export interface BonusUpdateRequest {
  employee_id: number;
  bonusAmount: number;
}

export interface BonusUpdateResponse {
  id: number;
  name: string;
  salesAmount: number;
  bonusAmount: number;
  message: string;
}

// API Response Types
export interface CalculateAllResponse {
  message: string;
}

export interface SalaryApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Filter and Search Types
export interface SalaryFilters {
  month?: string;
  department?: string;
  status?: 'pending' | 'paid' | 'processing';
  search?: string;
}

export interface SalaryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Component Props Types
export interface SalaryTableProps {
  employees: SalaryDisplay[];
  onViewDetails: (employee: SalaryDisplay) => void;
  onMarkPaid?: (employeeId: number) => void;
  loading?: boolean;
}

export interface SalaryStatisticsProps {
  summary: SalarySummary;
  loading?: boolean;
}

export interface SalaryDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  salaryData?: SalaryBreakdown;
  loading?: boolean;
}

export interface SalaryCalculatorProps {
  onCalculate: (employeeId: number, endDate?: string) => void;
  previewData?: SalaryPreview;
  loading?: boolean;
}

export interface BonusManagementProps {
  salesEmployees: SalesEmployeeBonus[];
  onUpdateBonus: (employeeId: number, bonusAmount: number) => void;
  loading?: boolean;
}
