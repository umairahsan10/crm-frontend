import type { SearchFiltersConfig } from '../leads/LeadsSearchFilters';

// Regular Expenses Configuration - Single Row Layout (matching API)
export const regularExpensesConfig: SearchFiltersConfig = {
  tabType: 'regular',
  searchPlaceholder: 'Search expenses by title, category, or vendor...',
  theme: {
    primary: 'bg-blue-600',
    secondary: 'hover:bg-blue-700',
    ring: 'ring-blue-500',
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  },
  filters: {
    showType: true, // For category
    showStatus: true, // For paymentMethod
    showAssignedTo: true, // For createdBy
    showDateRange: true, // For fromDate and toDate
    showAmountRange: true // For minAmount and maxAmount
  },
  customOptions: {
    typeOptions: [
      { value: '', label: 'All Categories' },
      { value: 'Office Expenses', label: 'Office Expenses' },
      { value: 'Salary', label: 'Salary' },
      { value: 'Marketing', label: 'Marketing' },
      { value: 'Utilities', label: 'Utilities' },
      { value: 'Travel', label: 'Travel' },
      { value: 'Equipment', label: 'Equipment' },
      { value: 'Rent', label: 'Rent' },
      { value: 'Software', label: 'Software' },
      { value: 'Other', label: 'Other' }
    ],
    statusOptions: [
      { value: '', label: 'All Payment Methods' },
      { value: 'bank', label: 'Bank Transfer' },
      { value: 'cash', label: 'Cash' },
      { value: 'credit_card', label: 'Credit Card' },
      { value: 'online', label: 'Online Payment' }
    ]
  },
  // Custom labels matching API parameter names
  customLabels: {
    typeLabel: 'category',
    statusLabel: 'paymentMethod',
    assignedToLabel: 'createdBy',
    startDateLabel: 'fromDate',
    endDateLabel: 'toDate',
    minAmountLabel: 'minAmount',
    maxAmountLabel: 'maxAmount'
  },
  // Force single row layout
  singleRowLayout: true
};

// Approved Expenses Configuration
export const approvedExpensesConfig: SearchFiltersConfig = {
  tabType: 'cracked',
  searchPlaceholder: 'Search approved expenses by description, category...',
  theme: {
    primary: 'bg-green-600',
    secondary: 'hover:bg-green-700',
    ring: 'ring-green-500',
    bg: 'bg-green-100',
    text: 'text-green-800'
  },
  filters: {
    showAmountRange: true,
    showClosedBy: true,
    showDateRange: true
  }
};

// Rejected Expenses Configuration
export const rejectedExpensesConfig: SearchFiltersConfig = {
  tabType: 'archived',
  searchPlaceholder: 'Search rejected expenses by description, reason...',
  theme: {
    primary: 'bg-red-600',
    secondary: 'hover:bg-red-700',
    ring: 'ring-red-500',
    bg: 'bg-red-100',
    text: 'text-red-800'
  },
  filters: {
    showAssignedTo: true,
    showDateRange: true,
    showAmountRange: true
  }
};

