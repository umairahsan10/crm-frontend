// Navigation Constants
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard', roles: ['admin', 'hr', 'accountant', 'employee'] },
  { id: 'employees', label: 'Employees', icon: '👥', path: '/employees', roles: ['admin', 'hr'] },
  { id: 'attendance', label: 'Attendance', icon: '📅', path: '/attendance', roles: ['admin', 'hr', 'employee'] },
  { id: 'deals', label: 'Deals', icon: '💼', path: '/deals', roles: ['admin', 'hr', 'employee'] },
  { id: 'leads', label: 'Leads', icon: '⭕', path: '/leads', roles: ['admin', 'hr'] },
  { id: 'leads-create', label: 'Create Leads', icon: '➕', path: '/leads/create', roles: ['admin', 'dept_manager', 'team_leads', 'marketing'] },
  { id: 'chats', label: 'Chat', icon: '💬', path: '/chats', roles: ['admin', 'hr', 'accountant', 'employee'] },
  
  // Admin-specific pages
  { id: 'projects', label: 'Projects', icon: '🚀', path: '/projects', roles: ['admin'] },
  { id: 'finance', label: 'Finance', icon: '💰', path: '/finance', roles: ['admin', 'accountant'] },
  { id: 'production-units', label: 'Units Management', icon: '🏢', path: '/production/units', roles: ['admin', 'production'] },
  { id: 'production-teams', label: 'Teams Management', icon: '👥', path: '/production/teams', roles: ['admin', 'production'] },
  { id: 'clients', label: 'Clients', icon: '👤', path: '/clients', roles: ['admin', 'sales'] },
  { id: 'system-logs', label: 'System Logs', icon: '📋', path: '/system-logs', roles: ['admin'] },
  { id: 'integrations', label: 'Integrations', icon: '🔗', path: '/integrations', roles: ['admin'] },
  { id: 'profile', label: 'Profile', icon: '👤', path: '/profile', roles: ['admin', 'hr', 'accountant', 'sales', 'production', 'marketing', 'dep_manager', 'employee'] },
  
  // Settings are accessible through user dropdown, not main navigation
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
  completed: { label: 'Completed', color: 'info', icon: '💰' },
};

// Alert Severity Constants
export const ALERT_SEVERITY = {
  low: { label: 'Low', color: 'info', icon: 'ℹ️' },
  medium: { label: 'Medium', color: 'warning', icon: '⚠️' },
  high: { label: 'High', color: 'danger', icon: '🚨' },
  critical: { label: 'Critical', color: 'danger', icon: '🔥' },
};

// Chart Colors
export const CHART_COLORS = [
  '#667eea',
  '#764ba2',
  '#f093fb',
  '#f5576c',
  '#4facfe',
  '#00f2fe',
  '#43e97b',
  '#38f9d7',
  '#fa709a',
  '#fee140',
];

// Table Page Sizes
export const TABLE_PAGE_SIZES = [10, 25, 50, 100];

// Date Formats
export const DATE_FORMATS = {
  short: 'MM/dd/yyyy',
  long: 'MMMM dd, yyyy',
  time: 'HH:mm:ss',
  datetime: 'MM/dd/yyyy HH:mm',
  iso: 'yyyy-MM-dd',
};

// Validation Rules
export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-()]{10,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  url: /^https?:\/\/.+/,
};

// API Endpoints
export const API_ENDPOINTS = {
  employees: '/api/employees',
  attendance: '/api/attendance',
  payroll: '/api/payroll',
  sales: '/api/sales',
  financial: '/api/financial',
  chargebacks: '/api/chargebacks',
  settings: '/api/settings',
  auth: '/api/auth',
};

// Storage Keys
export const STORAGE_KEYS = {
  user: 'hr_admin_user',
  token: 'hr_admin_token',
  theme: 'hr_admin_theme',
  language: 'hr_admin_language',
  sidebarState: 'hr_admin_sidebar',
};

// Themes
export const THEMES = {
  light: 'light',
  dark: 'dark',
  auto: 'auto',
};

// Languages
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

// Role Permissions
export const ROLE_PERMISSIONS = {
  admin: ['read', 'write', 'delete', 'manage_users', 'manage_roles', 'view_reports'],
  hr: ['read', 'write', 'view_reports'],
  accountant: ['read', 'write', 'view_reports'],
  employee: ['read'],
};

// Default Settings
export const DEFAULT_SETTINGS = {
  theme: 'light',
  language: 'en',
  sidebarCollapsed: false,
  notifications: true,
  emailNotifications: true,
  autoRefresh: 30000, // 30 seconds
  pageSize: 25,
  dateFormat: 'MM/dd/yyyy',
  timeFormat: '12h',
  currency: 'USD',
  timezone: 'UTC',
}; 
