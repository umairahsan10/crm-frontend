/**
 * Generic Access Logs Filters - EXACT same structure as GenericLeadsFilters
 * Uses the SAME layout, styling, and structure for consistency
 */

import React, { useState } from 'react';
import { useFilters } from '../../../hooks/useFilters';

interface GenericAccessLogsFiltersProps {
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

const GenericAccessLogsFilters: React.FC<GenericAccessLogsFiltersProps> = ({
  onFiltersChange,
  onClearFilters
}) => {
  // Generic filter state - same pattern as Leads
  const { 
    filters, 
    updateFilter, 
    resetFilters, 
    hasActiveFilters,
    activeCount 
  } = useFilters(
    {
      search: '',
      success: '',
      startDate: '',
      endDate: ''
    },
    (newFilters) => {
      // Auto-trigger when filters change
      onFiltersChange(newFilters);
    }
  );

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleClearAll = () => {
    resetFilters();
    onClearFilters();
  };

  // Render helper for select fields (same as Leads)
  const renderSelect = (
    key: keyof typeof filters,
    label: string,
    options: Array<{value: string | number; label: string}>
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={(filters[key] as string) || ''}
        onChange={(e) => updateFilter(key as any, e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm"
      >
        <option value="">All {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const renderInput = (key: keyof typeof filters, label: string, type: 'text' | 'date' | 'number' = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={(filters[key] as string) || ''}
        onChange={(e) => updateFilter(key as any, e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm"
      />
    </div>
  );

  // Pre-defined options
  const successOptions = [
    { value: 'true', label: 'Successful' },
    { value: 'false', label: 'Failed' }
  ];

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
      {/* Search Bar - EXACT same structure as Leads */}
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
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search by employee name, email..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
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
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters - EXACT same structure as Leads */}
      {showAdvanced && (
        <div className="px-6 py-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Success Filter */}
            {renderSelect('success', 'Status', successOptions)}
            
            {/* Date Range */}
            {renderInput('startDate', 'Start Date', 'date')}
            {renderInput('endDate', 'End Date', 'date')}
          </div>

          {/* Actions - EXACT same structure as Leads */}
          <div className="mt-4 flex justify-end gap-3">
            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Clear All ({activeCount})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericAccessLogsFilters;

