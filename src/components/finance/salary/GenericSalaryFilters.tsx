/**
 * Generic Salary Filters using new filter system
 * Matches GenericRevenueFilters structure exactly
 */

import React from 'react';
import { useFilters } from '../../../hooks/useFilters';

interface GenericSalaryFiltersProps {
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

const GenericSalaryFilters: React.FC<GenericSalaryFiltersProps> = ({
  onFiltersChange,
  onClearFilters
}) => {
  const { 
    filters, 
    updateFilter, 
    resetFilters, 
    hasActiveFilters,
    activeCount 
  } = useFilters(
    {
      search: '',
      department: '',
      status: '',
      fromDate: '',
      toDate: '',
      minSalary: '',
      maxSalary: '',
      createdBy: '',
      sortBy: 'employeeName',
      sortOrder: 'asc'
    },
    (newFilters) => onFiltersChange(newFilters) // Auto-trigger on ALL changes including search
  );

  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleClearAll = () => {
    resetFilters();
    onClearFilters();
  };

  const handleAmountChange = (type: 'min' | 'max', value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    if (numericValue === '' || parseFloat(numericValue) >= 0) {
      updateFilter(type === 'min' ? 'minSalary' : 'maxSalary' as any, numericValue);
    }
  };

  const theme = {
    primary: 'bg-green-600',
    secondary: 'hover:bg-green-700',
    ring: 'ring-green-500',
    bg: 'bg-green-100',
    text: 'text-green-800'
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={(filters.search as string) || ''}
                onChange={(e) => updateFilter('search' as any, e.target.value)}
                placeholder="Search employees by name, ID, or department..."
                className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:${theme.ring} sm:text-sm`}
              />
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${theme.bg} ${theme.text}`}>
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={(filters.department as string) || ''}
                onChange={(e) => updateFilter('department' as any, e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Departments</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Production">Production</option>
                <option value="Accounts">Accounts</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={(filters.status as string) || ''}
                onChange={(e) => updateFilter('status' as any, e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
              </select>
            </div>

            {/* Min Salary Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
              <input
                type="number"
                value={(filters.minSalary as string) || ''}
                onChange={(e) => handleAmountChange('min', e.target.value)}
                placeholder="0"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* Max Salary Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
              <input
                type="number"
                value={(filters.maxSalary as string) || ''}
                onChange={(e) => handleAmountChange('max', e.target.value)}
                placeholder="100000"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* Date Range Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={(filters.fromDate as string) || ''}
                onChange={(e) => updateFilter('fromDate' as any, e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={(filters.toDate as string) || ''}
                onChange={(e) => updateFilter('toDate' as any, e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* Created By Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
              <input
                type="text"
                value={(filters.createdBy as string) || ''}
                onChange={(e) => updateFilter('createdBy' as any, e.target.value)}
                placeholder="Employee name or ID"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Clear All Filters ({activeCount})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenericSalaryFilters;
