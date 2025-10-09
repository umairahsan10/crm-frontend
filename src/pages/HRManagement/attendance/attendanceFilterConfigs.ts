import type { SearchFiltersConfig } from '../../../components/leads/LeadsSearchFilters';

// Attendance Management Filter Configuration
export const attendanceFilterConfig: SearchFiltersConfig = {
  tabType: 'regular',
  searchPlaceholder: 'Search employees by name, department...',
  theme: {
    primary: 'bg-blue-600',
    secondary: 'hover:bg-blue-700',
    ring: 'ring-blue-500',
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  },
  filters: {
    showType: true, // For department
    showStatus: true, // For attendance status (present, late, half_day, absent, not_marked)
    showDateRange: true // For date range filtering
  },
  customOptions: {
    typeOptions: [
      { value: '', label: 'All Departments' },
      { value: 'Sales', label: 'Sales' },
      { value: 'HR', label: 'HR' },
      { value: 'Marketing', label: 'Marketing' },
      { value: 'Accounts', label: 'Accounts' }
    ],
    statusOptions: [
      { value: '', label: 'All Statuses' },
      { value: 'present', label: 'Present' },
      { value: 'late', label: 'Late' },
      { value: 'half_day', label: 'Half Day' },
      { value: 'absent', label: 'Absent' },
      { value: 'not_marked', label: 'Not Marked' }
    ]
  },
  // Custom labels matching attendance filter parameters
  customLabels: {
    typeLabel: 'department',
    statusLabel: 'status',
    startDateLabel: 'fromDate',
    endDateLabel: 'toDate'
  },
  // Force single row layout
  singleRowLayout: true
};

