import React, { useState } from 'react';
import { useFilters } from '../../../hooks/useFilters';

interface GenericProductionTeamsFiltersProps {
  showFilters: {
    hasLead?: boolean;
    hasMembers?: boolean;
    hasProjects?: boolean;
    sortBy?: boolean;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  availableLeads?: Array<{ id: number; firstName: string; lastName: string; email: string }>;
  theme?: {
    primary: string;
    secondary: string;
    ring: string;
    bg: string;
    text: string;
  };
  searchPlaceholder?: string;
}

const GenericProductionTeamsFilters: React.FC<GenericProductionTeamsFiltersProps> = ({
  showFilters,
  onFiltersChange,
  onClearFilters,
  searchPlaceholder = 'Search production teams...'
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
      hasLead: '',
      hasMembers: '',
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
        value={filters[key as keyof typeof filters] || ''}
        onChange={(e) => updateFilter(key as keyof typeof filters, e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm"
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
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
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
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Advanced Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear All ({activeCount})
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Has Lead Filter */}
            {showFilters.hasLead && renderSelect(
              'hasLead',
              'Lead Status',
              [
                { value: 'true', label: 'Has Lead' },
                { value: 'false', label: 'No Lead' }
              ],
              'All Teams'
            )}

            {/* Has Members Filter */}
            {showFilters.hasMembers && renderSelect(
              'hasMembers',
              'Members Status',
              [
                { value: 'true', label: 'Has Members' },
                { value: 'false', label: 'No Members' }
              ],
              'All Teams'
            )}

            {/* Has Projects Filter */}
            {showFilters.hasProjects && renderSelect(
              'hasProjects',
              'Projects Status',
              [
                { value: 'true', label: 'Has Projects' },
                { value: 'false', label: 'No Projects' }
              ],
              'All Teams'
            )}

            {/* Sort By Filter */}
            {showFilters.sortBy && renderSelect(
              'sortBy',
              'Sort By',
              [
                { value: 'name', label: 'Name' },
                { value: 'createdAt', label: 'Created Date' },
                { value: 'updatedAt', label: 'Updated Date' },
                { value: 'employeeCount', label: 'Members Count' },
                { value: 'projectsCount', label: 'Projects Count' }
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
                      className="form-radio h-4 w-4 text-gray-600"
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
                      className="form-radio h-4 w-4 text-gray-600"
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

export default GenericProductionTeamsFilters;
