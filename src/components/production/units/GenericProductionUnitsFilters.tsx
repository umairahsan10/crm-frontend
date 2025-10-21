import React, { useState } from 'react';
import { useFilters } from '../../../hooks/useFilters';

interface GenericProductionUnitsFiltersProps {
  showFilters: {
    hasHead?: boolean;
    hasTeams?: boolean;
    hasProjects?: boolean;
    sortBy?: boolean;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  availableHeads?: Array<{ id: number; firstName: string; lastName: string; email: string }>;
  theme?: {
    primary: string;
    secondary: string;
    ring: string;
    bg: string;
    text: string;
  };
  searchPlaceholder?: string;
}

const GenericProductionUnitsFilters: React.FC<GenericProductionUnitsFiltersProps> = ({
  showFilters,
  onFiltersChange,
  onClearFilters,
  availableHeads = [],
  theme = {
    primary: 'bg-blue-600',
    secondary: 'hover:bg-blue-700',
    ring: 'ring-blue-500',
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  },
  searchPlaceholder = 'Search production units...'
}) => {
  // Generic filter state - automatically works with any combination!
  const { 
    filters, 
    updateFilter, 
    resetFilters, 
    hasActiveFilters,
    activeCount 
  } = useFilters(
    {
      search: '',
      hasHead: '',
      hasTeams: '',
      hasProjects: '',
      sortBy: '',
      sortOrder: 'desc'
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

  // Render helper for select fields
  const renderSelect = (
    key: string,
    label: string,
    options: Array<{ value: string; label: string }>,
    placeholder: string = 'Select...'
  ) => (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={filters[key] || ''}
        onChange={(e) => updateFilter(key, e.target.value)}
        className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${theme.ring} sm:text-sm`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className={`${theme.bg} p-4 rounded-lg border border-gray-200 mb-6`}>
      {/* Search and Basic Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder={searchPlaceholder}
              className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-offset-0 focus:${theme.ring} sm:text-sm`}
            />
          </div>
        </div>

        {/* Filter Toggle and Clear */}
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${theme.primary} ${theme.secondary} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${theme.ring}`}
            >
              Clear All ({activeCount})
            </button>
          )}
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${theme.ring}`}
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Has Head Filter */}
            {showFilters.hasHead && renderSelect(
              'hasHead',
              'Head Status',
              [
                { value: 'true', label: 'Has Head' },
                { value: 'false', label: 'No Head' }
              ],
              'All Units'
            )}

            {/* Has Teams Filter */}
            {showFilters.hasTeams && renderSelect(
              'hasTeams',
              'Teams Status',
              [
                { value: 'true', label: 'Has Teams' },
                { value: 'false', label: 'No Teams' }
              ],
              'All Units'
            )}

            {/* Has Projects Filter */}
            {showFilters.hasProjects && renderSelect(
              'hasProjects',
              'Projects Status',
              [
                { value: 'true', label: 'Has Projects' },
                { value: 'false', label: 'No Projects' }
              ],
              'All Units'
            )}

            {/* Sort By Filter */}
            {showFilters.sortBy && renderSelect(
              'sortBy',
              'Sort By',
              [
                { value: 'name', label: 'Name' },
                { value: 'createdAt', label: 'Created Date' },
                { value: 'updatedAt', label: 'Updated Date' },
                { value: 'teamsCount', label: 'Teams Count' },
                { value: 'employeeCount', label: 'Employee Count' }
              ],
              'Default Sorting'
            )}
          </div>

          {/* Sort Order */}
          {showFilters.sortBy && filters.sortBy && (
            <div className="mt-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Sort Order:</span>
                <div className="flex space-x-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="sortOrder"
                      value="asc"
                      checked={filters.sortOrder === 'asc'}
                      onChange={(e) => updateFilter('sortOrder', e.target.value)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Ascending</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="sortOrder"
                      value="desc"
                      checked={filters.sortOrder === 'desc'}
                      onChange={(e) => updateFilter('sortOrder', e.target.value)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Descending</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenericProductionUnitsFilters;
