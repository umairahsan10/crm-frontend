
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

// Expense Management Types (from API)
export interface Expense {
  id: number;
  title: string;
  category: string;
  amount: number;
  paidOn: string;
  paymentMethod: string;
  vendorId: number;
  createdBy: number;
  transactionId: number;
  createdAt: string;
  updatedAt: string;
  transaction?: {
    id: number;
    amount: number;
    transactionType: string;
    status: string;
  };
  vendor?: {
    id: number;
    name: string;
  };
  employee?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface ExpensesResponse {
  status: string;
  message: string;
  data: Expense[];
  total: number;
}

export interface ExpenseResponse {
  status: string;
  message: string;
  data: Expense;
}

// Revenue Management Types (from API)
export interface Revenue {
  id: number;
  source: string;
  category: string;
  amount: number;
  receivedFrom: number | null;
  receivedOn: string;
  paymentMethod: string;
  relatedInvoiceId: number | null;
  createdBy: number;
  transactionId: number;
  createdAt: string;
  updatedAt: string;
  transaction?: {
    id: number;
    amount: number;
    transactionType: string;
    paymentMethod: string;
    transactionDate: string;
    status: string;
    notes: string | null;
    employeeId: number | null;
    vendorId: number | null;
    clientId: number | null;
    invoiceId: number | null;
    createdAt: string;
    updatedAt: string;
    client?: {
      id: number;
      companyName: string;
      clientName: string;
      email: string;
      phone: string;
      accountStatus: string;
    };
  };
  lead?: {
    id: number;
    companyName: string;
  } | null;
  invoice?: {
    id: number;
    amount: number;
    notes: string;
  } | null;
  employee?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface RevenuesResponse {
  status: string;
  message: string;
  data: Revenue[];
  total: number;
  page: number;
  limit: number;
}

export interface RevenueResponse {
  status: string;
  message: string;
  data: Revenue;
}

// Asset Management Types (from API)
export interface Asset {
  id: number;
  title: string;
  category: string;
  purchaseValue: number;
  currentValue: number;
  purchaseDate: string;
  vendorId: number;
  transactionId: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  transaction?: {
    id: number;
    employeeId: number;
    vendorId: number;
    clientId: number | null;
    invoiceId: number | null;
    amount: number;
    transactionType: string;
    paymentMethod: string;
    transactionDate: string;
    status: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
  };
  vendor?: {
    id: number;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    bankAccount?: string;
    status?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  employee?: {
    id: number;
    firstName?: string;
    lastName?: string;
  };
}

export interface AssetsResponse {
  status: string;
  message: string;
  data: Asset[];
  total: number;
}

export interface AssetResponse {
  status: string;
  message: string;
  data: Asset;
}

// Liability Management Types (from API)
export interface Liability {
  id: number;
  name: string;
  category: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidOn: string | null;
  transactionId: number;
  relatedVendorId: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  transaction?: {
    id: number;
    amount: number;
    status: string;
  };
  vendor?: {
    id: number;
    name: string;
  };
  employee?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface LiabilitiesResponse {
  status: string;
  message: string;
  data: Liability[];
  total: number;
}

export interface LiabilityResponse {
  status: string;
  message: string;
  data: Liability;
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
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
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

// Lead Management Types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  type?: LeadType;
  salesUnitId: number;
  status?: LeadStatus;
  outcome?: LeadOutcome | null;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string | { firstName: string; lastName: string };
  notes?: string;
}

export type LeadSource = 'PPC' | 'SMM';
export type LeadType = 'warm' | 'cold' | 'upsell' | 'push';
export type LeadStatus = 'new' | 'in_progress' | 'completed' | 'payment_link_generated' | 'failed' | 'cracked';

export interface CreateLeadRequest {
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  type: LeadType;
  salesUnitId: number;
}


export type LeadOutcome = "voice_mail" | "interested" | "not_answered" | "busy" | "denied";

export interface CreateLeadResponse {
  success: boolean;
  data?: Lead;
  message?: string;
  error?: string;
}

export interface SalesUnit {
  id: number;
  name: string;
  description?: string;
}

// Client Management Types
export interface Client {
  id: string;
  clientType: ClientType;
  companyName?: string;
  clientName: string;
  email: string;
  phone: string;
  passwordHash?: string;
  altPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  industryId?: number;
  industry?: string | { id: number; name: string; description?: string; isActive?: boolean; createdAt?: string; updatedAt?: string };
  taxId?: string;
  accountStatus: ClientStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string | { firstName: string; lastName: string };
  salesUnitId?: number;
  lastContactDate?: string;
  totalRevenue?: number;
  satisfactionScore?: number;
  // New fields from API response
  createdBy?: number;
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export type ClientType = 'individual' | 'enterprise' | 'smb' | 'startup';
export type ClientStatus = 'prospect' | 'active' | 'inactive' | 'suspended' | 'churned';

export interface CreateClientRequest {
  clientType: ClientType;
  companyName?: string;
  clientName: string;
  email: string;
  phone: string;
  passwordHash?: string;
  altPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  industryId?: number;
  taxId?: string;
  accountStatus: ClientStatus;
  notes?: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {}

export interface ClientStatistics {
  // Basic counts (from API response)
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  prospect: number;
  
  // Optional extended fields (for backward compatibility)
  totalClients?: number;
  activeClients?: number;
  prospectClients?: number;
  inactiveClients?: number;
  churnedClients?: number;
  totalRevenue?: number;
  averageSatisfaction?: number;
  byStatus?: {
    prospect: number;
    active: number;
    inactive: number;
    suspended: number;
    churned: number;
  };
  byType?: {
    individual: number;
    enterprise: number;
    smb: number;
    startup: number;
  };
  byIndustry?: {
    technology: number;
    healthcare: number;
    finance: number;
    retail: number;
    manufacturing: number;
    education: number;
    other: number;
  };
  today?: {
    new: number;
    contacted: number;
    converted: number;
  };
} 