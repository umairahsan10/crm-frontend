
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// User and Authentication Types
export interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  type: 'admin' | 'employee';
  department?: string;
  departmentId?: number;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  permissions?: Record<string, boolean>;
}

export type UserRole = 'admin' | 'dept_manager' | 'team_leads' | 'unit_head' | 'senior' | 'junior';

// JWT Backend Response Types
export interface JWTUser {
  sub: number;
  role: string;
  type: 'admin' | 'employee';
  department?: string;
  permissions?: Record<string, boolean>;
}

export interface LoginResponse {
  access_token: string;
  user: JWTUser;
}

// Employee Management Types
export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  startDate: string;
  isActive: boolean;
  managerId?: string;
  avatar?: string;
  phone?: string;
  address?: string;
}

export interface Department {
  id: string;
  name: string;
  managerId?: string;
  employeeCount: number;
}

// Attendance Types
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'remote' | 'leave' | 'holiday';

export interface AttendanceLog {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  approvedBy?: string;
  createdAt: string;
}

// Salary and Payroll Types
export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string;
  year: string;
  baseSalary: number;
  deductions: number;
  bonuses: number;
  commission: number;
  finalSalary: number;
  status: 'pending' | 'approved' | 'paid';
  paidDate?: string;
}

export interface Deduction {
  id: string;
  employeeId: string;
  amount: number;
  reason: string;
  date: string;
  approvedBy?: string;
}

export interface Bonus {
  id: string;
  employeeId: string;
  amount: number;
  reason: string;
  date: string;
  approvedBy?: string;
}

// Sales and Bonus Types
export interface SalesTarget {
  id: string;
  employeeId: string;
  month: string;
  year: string;
  target: number;
  achieved: number;
  commission: number;
}

export interface SalesRecord {
  id: string;
  employeeId: string;
  amount: number;
  date: string;
  description: string;
  status: 'pending' | 'closed' | 'cancelled';
}

// Financial Types
export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ChargebackRequest {
  id: string;
  employeeId: string;
  amount: number;
  reason: string;
  description: string;
  status: 'reported' | 'team_lead_approved' | 'admin_approved' | 'rejected';
  reportedDate: string;
  teamLeadApprovedBy?: string;
  teamLeadApprovedDate?: string;
  adminApprovedBy?: string;
  adminApprovedDate?: string;
  notes?: string;
}

// System Configuration Types
export interface RolePermission {
  role: UserRole;
  permissions: Permission[];
}

export type Permission = 
  | 'view_dashboard'
  | 'manage_employees'
  | 'view_attendance'
  | 'manage_attendance'
  | 'view_salary'
  | 'manage_salary'
  | 'view_sales'
  | 'manage_sales'
  | 'view_financial'
  | 'manage_financial'
  | 'approve_chargebacks'
  | 'manage_settings';

export interface SystemSettings {
  id: string;
  key: string;
  value: string;
  description: string;
  updatedBy: string;
  updatedAt: string;
}

// Alert and Notification Types
export interface Alert {
  id: string;
  type: 'meeting' | 'approval' | 'target' | 'attendance' | 'system';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
  userId?: string;
  relatedId?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalEmployees: number;
  activeToday: number;
  totalSales: number;
  totalBonuses: number;
  totalDeductions: number;
  pendingApprovals: number;
  missedMeetings: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// Filter and Search Types
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface FilterOptions {
  department?: string;
  status?: string;
  role?: string;
  dateRange?: DateRange;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Component Props Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
          render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'date' | 'textarea';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
} 