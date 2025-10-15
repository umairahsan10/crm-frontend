import { type SearchFiltersConfig } from '../leads/LeadsSearchFilters';

export const payrollFilterConfig: SearchFiltersConfig = {
  tabType: 'regular',
  searchPlaceholder: 'Search by employee name...',
  theme: {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    ring: 'ring-indigo-500',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
  },
  filters: {
    showType: true,
    showStatus: true,
    showDateRange: true,
  },
  customOptions: {
    typeOptions: [], // Will be populated with departments dynamically
    statusOptions: [
      { value: 'all', label: 'All Status' },
      { value: 'paid', label: 'Paid' },
      { value: 'pending', label: 'Pending' },
    ],
  },
  customLabels: {
    typeLabel: 'Department',
    statusLabel: 'Payment Status',
    startDateLabel: 'Month',
    endDateLabel: '',
  },
  singleRowLayout: true,
};

