import type { FilterFieldConfig } from '../../common/Filters/FilterField';

// Salary Management Filter Configuration
export interface SalaryFilters {
  search: string;
  department: string;
  status: string;
  salaryRange: { min: string; max: string };
  month: string;
}

// Filter field configurations for salary management
export const salaryFilterConfig: Record<keyof SalaryFilters, FilterFieldConfig> = {
  search: {
    type: 'text',
    label: 'Search',
    placeholder: 'Search employees by name, ID, or department...'
  },
  department: {
    type: 'select',
    label: 'Department',
    placeholder: 'All Departments',
    options: [
      { value: '', label: 'All Departments' },
      { value: 'Sales', label: 'Sales' },
      { value: 'Marketing', label: 'Marketing' },
      { value: 'HR', label: 'HR' },
      { value: 'Finance', label: 'Finance' },
      { value: 'Production', label: 'Production' },
      { value: 'Accounts', label: 'Accounts' }
    ]
  },
  status: {
    type: 'select',
    label: 'Status',
    placeholder: 'All Status',
    options: [
      { value: '', label: 'All Status' },
      { value: 'unpaid', label: 'Unpaid' },
      { value: 'paid', label: 'Paid' }
    ]
  },
  salaryRange: {
    type: 'amount-range',
    label: 'Salary Range',
    currency: 'USD',
    placeholder: 'Enter salary range...'
  },
  month: {
    type: 'select',
    label: 'Month',
    placeholder: 'Select Month',
    options: [
      { value: '2025-01', label: 'January 2025' },
      { value: '2025-02', label: 'February 2025' },
      { value: '2025-03', label: 'March 2025' },
      { value: '2025-04', label: 'April 2025' },
      { value: '2025-05', label: 'May 2025' },
      { value: '2025-06', label: 'June 2025' },
      { value: '2025-07', label: 'July 2025' },
      { value: '2025-08', label: 'August 2025' },
      { value: '2025-09', label: 'September 2025' },
      { value: '2025-10', label: 'October 2025' },
      { value: '2025-11', label: 'November 2025' },
      { value: '2025-12', label: 'December 2025' }
    ]
  }
};

// Helper function to check if filters are active
export const hasActiveFilters = (filters: SalaryFilters): boolean => {
  return !!(
    filters.search ||
    filters.department ||
    filters.status ||
    filters.salaryRange.min ||
    filters.salaryRange.max ||
    filters.month
  );
};

// Helper function to count active filters
export const getActiveFilterCount = (filters: SalaryFilters): number => {
  let count = 0;
  if (filters.search) count++;
  if (filters.department) count++;
  if (filters.status) count++;
  if (filters.salaryRange.min || filters.salaryRange.max) count++;
  if (filters.month) count++;
  return count;
};

// Helper function to reset filters
export const getDefaultFilters = (): SalaryFilters => ({
  search: '',
  department: '',
  status: '',
  salaryRange: { min: '', max: '' },
  month: ''
});
