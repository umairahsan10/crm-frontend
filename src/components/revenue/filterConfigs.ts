import type { SearchFiltersConfig } from '../leads/LeadsSearchFilters';

// Revenue Configuration - Single Row Layout (matching API)
export const revenueFilterConfig: SearchFiltersConfig = {
  tabType: 'regular',
  searchPlaceholder: 'Search revenues by source, category, or client...',
  theme: {
    primary: 'bg-green-600',
    secondary: 'hover:bg-green-700',
    ring: 'ring-green-500',
    bg: 'bg-green-100',
    text: 'text-green-800'
  },
  filters: {
    showType: true, // For category
    showStatus: true, // For paymentMethod
    showSource: true, // For source
    showAssignedTo: true, // For createdBy
    showDateRange: true, // For fromDate and toDate
    showAmountRange: true // For minAmount and maxAmount
  },
  customOptions: {
    typeOptions: [
      { value: '', label: 'All Categories' },
      { value: 'Software Development', label: 'Software Development' },
      { value: 'Consulting', label: 'Consulting' },
      { value: 'Product Sales', label: 'Product Sales' },
      { value: 'Subscription', label: 'Subscription' },
      { value: 'Support', label: 'Support' },
      { value: 'Training', label: 'Training' },
      { value: 'License', label: 'License' },
      { value: 'Other', label: 'Other' }
    ],
    statusOptions: [
      { value: '', label: 'All Payment Methods' },
      { value: 'bank', label: 'Bank Transfer' },
      { value: 'cash', label: 'Cash' },
      { value: 'credit_card', label: 'Credit Card' },
      { value: 'online', label: 'Online Payment' }
    ],
    sourceOptions: [
      { value: '', label: 'All Sources' },
      { value: 'Project Payment', label: 'Project Payment' },
      { value: 'Invoice Payment', label: 'Invoice Payment' },
      { value: 'Subscription Payment', label: 'Subscription Payment' },
      { value: 'Service Payment', label: 'Service Payment' },
      { value: 'Product Sale', label: 'Product Sale' },
      { value: 'Other', label: 'Other' }
    ]
  },
  // Custom labels matching API parameter names
  customLabels: {
    typeLabel: 'category',
    statusLabel: 'paymentMethod',
    sourceLabel: 'source',
    assignedToLabel: 'createdBy',
    startDateLabel: 'fromDate',
    endDateLabel: 'toDate',
    minAmountLabel: 'minAmount',
    maxAmountLabel: 'maxAmount'
  },
  // Force single row layout
  singleRowLayout: true
};

