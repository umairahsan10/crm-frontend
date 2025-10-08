import type { SearchFiltersConfig } from '../leads/LeadsSearchFilters';

// Liabilities Configuration - Single Row Layout (matching API)
export const liabilitiesFilterConfig: SearchFiltersConfig = {
  tabType: 'regular',
  searchPlaceholder: 'Search liabilities by name, category, or vendor...',
  theme: {
    primary: 'bg-blue-600',
    secondary: 'hover:bg-blue-700',
    ring: 'ring-blue-500',
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  },
  filters: {
    showStatus: true, // For isPaid
    showClosedBy: true, // For relatedVendorId
    showType: true, // For category
    showDateRange: true, // For fromDate and toDate
    showAssignedTo: true // For createdBy
  },
  customOptions: {
    statusOptions: [
      { value: '', label: 'All Status' },
      { value: 'true', label: 'Paid' },
      { value: 'false', label: 'Unpaid' }
    ],
    typeOptions: [
      { value: '', label: 'All Categories' },
      { value: 'Rent', label: 'Rent' },
      { value: 'Loan', label: 'Loan' },
      { value: 'Credit Card', label: 'Credit Card' },
      { value: 'Utilities', label: 'Utilities' },
      { value: 'Salary', label: 'Salary' },
      { value: 'Vendor Payment', label: 'Vendor Payment' },
      { value: 'Tax', label: 'Tax' },
      { value: 'Other', label: 'Other' }
    ]
  },
  // Custom labels matching API parameter names
  customLabels: {
    statusLabel: 'isPaid',
    closedByLabel: 'relatedVendorId',
    typeLabel: 'category',
    startDateLabel: 'fromDate',
    endDateLabel: 'toDate',
    assignedToLabel: 'createdBy'
  },
  // Force single row layout
  singleRowLayout: true
};

