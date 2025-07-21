// Navigation Constants
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/', roles: ['admin', 'hr'] },
  { id: 'employees', label: 'Employees', icon: '👥', path: '/employees', roles: ['admin', 'hr'] },
  { id: 'attendance', label: 'Attendance', icon: '📅', path: '/attendance', roles: ['admin', 'hr'] },
  { id: 'payroll', label: 'Payroll', icon: '💰', path: '/payroll', roles: ['admin', 'hr'] },
  { id: 'sales', label: 'Sales', icon: '📈', path: '/sales', roles: ['admin'] },
  { id: 'financial', label: 'Financial', icon: '💼', path: '/financial', roles: ['admin', 'accountant'] },
  { id: 'chargebacks', label: 'Chargebacks', icon: '🔄', path: '/chargebacks', roles: ['admin'] },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings', roles: ['admin'] },
];

// Department Constants
export const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'HR',
  'Finance',
  'Operations',
  'Customer Support',
  'Product',
  'Design',
  'Legal',
];

// Role Constants
export const ROLES = [
  'Software Engineer',
  'Senior Engineer',
  'Team Lead',
  'Manager',
  'Director',
  'VP',
  'CEO',
  'Sales Representative',
  'Account Manager',
  'Marketing Specialist',
  'HR Specialist',
  'Accountant',
  'Administrative Assistant',
];

// Attendance Status Constants
export const ATTENDANCE_STATUS = {
  present: { label: 'Present', color: 'success', icon: '✅' },
  late: { label: 'Late', color: 'warning', icon: '⏰' },
  absent: { label: 'Absent', color: 'danger', icon: '❌' },
  remote: { label: 'Remote', color: 'info', icon: '🏠' },
  leave: { label: 'Leave', color: 'secondary', icon: '🏖️' },
  holiday: { label: 'Holiday', color: 'primary', icon: '🎉' },
};

// Salary Status Constants
export const SALARY_STATUS = {
  pending: { label: 'Pending', color: 'warning', icon: '⏳' },
  approved: { label: 'Approved', color: 'success', icon: '✅' },
  paid: { label: 'Paid', color: 'info', icon: '💰' },
};

// Sales Status Constants
export const SALES_STATUS = {
  pending: { label: 'Pending', color: 'warning', icon: '⏳' },
  closed: { label: 'Closed', color: 'success', icon: '✅' },
  cancelled: { label: 'Cancelled', color: 'danger', icon: '❌' },
};

// Financial Record Types
export const FINANCIAL_TYPES = {
  income: { label: 'Income', color: 'success', icon: '📈' },
  expense: { label: 'Expense', color: 'danger', icon: '📉' },
};

// Financial Categories
export const FINANCIAL_CATEGORIES = {
  income: [
    'Sales Revenue',
    'Service Fees',
    'Commission',
    'Investment',
    'Other Income',
  ],
  expense: [
    'Salary & Wages',
    'Office Rent',
    'Utilities',
    'Equipment',
    'Marketing',
    'Travel',
    'Software Licenses',
    'Insurance',
    'Legal Fees',
    'Other Expenses',
  ],
};

// Chargeback Status Constants
export const CHARGEBACK_STATUS = {
  reported: { label: 'Reported', color: 'warning', icon: '📝' },
  team_lead_approved: { label: 'Team Lead Approved', color: 'info', icon: '👤' },
  admin_approved: { label: 'Admin Approved', color: 'success', icon: '✅' },
  rejected: { label: 'Rejected', color: 'danger', icon: '❌' },
};

// Alert Severity Constants
export const ALERT_SEVERITY = {
  low: { label: 'Low', color: 'info', icon: 'ℹ️' },
  medium: { label: 'Medium', color: 'warning', icon: '⚠️' },
  high: { label: 'High', color: 'danger', icon: '🚨' },
  critical: { label: 'Critical', color: 'danger', icon: '🔥' },
};

// Chart Colors
export const CHART_COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  light: '#f8fafc',
  dark: '#1e293b',
};

// Table Constants
export const TABLE_PAGE_SIZES = [10, 25, 50, 100];

// Date Formats
export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  input: 'yyyy-MM-dd',
  time: 'HH:mm',
  datetime: 'MMM dd, yyyy HH:mm',
  month: 'MMMM yyyy',
};

// Validation Rules
export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid phone number',
  },
  salary: {
    min: 0,
    message: 'Salary must be a positive number',
  },
  percentage: {
    min: 0,
    max: 100,
    message: 'Percentage must be between 0 and 100',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  refresh: '/api/auth/refresh',
  
  // Users
  users: '/api/users',
  userProfile: '/api/users/profile',
  
  // Employees
  employees: '/api/employees',
  departments: '/api/departments',
  
  // Attendance
  attendance: '/api/attendance',
  attendanceLogs: '/api/attendance/logs',
  
  // Payroll
  payroll: '/api/payroll',
  salaries: '/api/payroll/salaries',
  deductions: '/api/payroll/deductions',
  bonuses: '/api/payroll/bonuses',
  
  // Sales
  sales: '/api/sales',
  targets: '/api/sales/targets',
  
  // Financial
  financial: '/api/financial',
  chargebacks: '/api/financial/chargebacks',
  
  // Settings
  settings: '/api/settings',
  permissions: '/api/settings/permissions',
  
  // Alerts
  alerts: '/api/alerts',
  notifications: '/api/notifications',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  authToken: 'auth_token',
  refreshToken: 'refresh_token',
  user: 'user',
  theme: 'theme',
  language: 'language',
  sidebarState: 'sidebar_state',
};

// Theme Constants
export const THEMES = {
  light: 'light',
  dark: 'dark',
  system: 'system',
};

// Language Constants
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

// Permission Mappings
export const ROLE_PERMISSIONS = {
  admin: [
    'view_dashboard',
    'manage_employees',
    'view_attendance',
    'manage_attendance',
    'view_salary',
    'manage_salary',
    'view_sales',
    'manage_sales',
    'view_financial',
    'manage_financial',
    'approve_chargebacks',
    'manage_settings',
  ],
  hr: [
    'view_dashboard',
    'manage_employees',
    'view_attendance',
    'manage_attendance',
    'view_salary',
    'manage_salary',
  ],
  accountant: [
    'view_dashboard',
    'view_financial',
    'manage_financial',
  ],
  employee: [
    'view_dashboard',
  ],
};

// Default Settings
export const DEFAULT_SETTINGS = {
  companyName: 'Your Company',
  timezone: 'UTC',
  currency: 'USD',
  dateFormat: 'MM/dd/yyyy',
  timeFormat: '12h',
  language: 'en',
  theme: 'light',
  autoLogout: 30, // minutes
  sessionTimeout: 8, // hours
}; 