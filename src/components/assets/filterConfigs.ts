import type { SearchFiltersConfig } from '../leads/LeadsSearchFilters';

// Assets Configuration - Single Row Layout (matching API)
export const assetsFilterConfig: SearchFiltersConfig = {
  tabType: 'regular',
  searchPlaceholder: 'Search assets by name, category, or vendor...',
  theme: {
    primary: 'bg-indigo-600',
    secondary: 'hover:bg-indigo-700',
    ring: 'ring-indigo-500',
    bg: 'bg-indigo-100',
    text: 'text-indigo-800'
  },
  filters: {
    showType: true, // For category
    showAssignedTo: true, // For createdBy
    showDateRange: true, // For fromDate and toDate (purchase date range)
    showAmountRange: true, // For minPurchaseValue and maxPurchaseValue
    showCurrentPhase: true, // For minCurrentValue
    showTotalPhases: true // For maxCurrentValue
  },
  customOptions: {
    typeOptions: [
      { value: '', label: 'All Categories' },
      { value: 'IT Equipment', label: 'IT Equipment' },
      { value: 'Furniture', label: 'Furniture' },
      { value: 'Vehicles', label: 'Vehicles' },
      { value: 'Machinery', label: 'Machinery' },
      { value: 'Office Equipment', label: 'Office Equipment' },
      { value: 'Software', label: 'Software' },
      { value: 'Property', label: 'Property' },
      { value: 'Other', label: 'Other' }
    ]
  },
  // Custom labels matching API parameter names
  customLabels: {
    typeLabel: 'category',
    assignedToLabel: 'createdBy',
    startDateLabel: 'fromDate',
    endDateLabel: 'toDate',
    minAmountLabel: 'minPurchaseValue',
    maxAmountLabel: 'maxPurchaseValue',
    currentPhaseLabel: 'minCurrentValue',
    totalPhasesLabel: 'maxCurrentValue'
  },
  // Don't force single row - let last 2 wrap to next row
  singleRowLayout: false
};

