import React, { useState } from 'react';
import { FilterField, FilterFieldConfig } from './FilterField';

/**
 * Generic FilterContainer Props
 * Works with ANY filter structure!
 */
export interface FilterContainerProps<T extends Record<string, any>> {
  // Filter state
  filters: T;
  
  // Filter configuration - defines what fields to show and their types
  filterConfig: Record<keyof T, FilterFieldConfig>;
  
  // Callbacks
  onFilterChange: (key: keyof T, value: any) => void;
  onSearch?: () => void;
  onReset: () => void;
  
  // Metadata
  hasActiveFilters: boolean;
  activeCount: number;
  
  // UI customization
  theme?: 'blue' | 'green' | 'purple' | 'red' | 'indigo';
  searchPlaceholder?: string;
  showSearch?: boolean;
  showFilterToggle?: boolean;
  title?: string;
  
  // Advanced filters
  advancedFilterKeys?: (keyof T)[];
}

/**
 * 100% Generic FilterContainer Component
 * Automatically renders filters based on configuration
 * NO CHANGES NEEDED for new modules - just configure!
 */
export const FilterContainer = <T extends Record<string, any>>({
  filters,
  filterConfig,
  onFilterChange,
  onSearch,
  onReset,
  hasActiveFilters,
  activeCount,
  theme = 'blue',
  searchPlaceholder = 'Search...',
  showSearch = true,
  showFilterToggle = true,
  title,
  advancedFilterKeys = []
}: FilterContainerProps<T>) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Theme configuration
  const themes = {
    blue: {
      primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      badge: 'bg-blue-100 text-blue-800',
      ring: 'ring-blue-500'
    },
    green: {
      primary: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      badge: 'bg-green-100 text-green-800',
      ring: 'ring-green-500'
    },
    purple: {
      primary: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
      badge: 'bg-purple-100 text-purple-800',
      ring: 'ring-purple-500'
    },
    red: {
      primary: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      badge: 'bg-red-100 text-red-800',
      ring: 'ring-red-500'
    },
    indigo: {
      primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
      badge: 'bg-indigo-100 text-indigo-800',
      ring: 'ring-indigo-500'
    }
  };

  const currentTheme = themes[theme];

  // Separate basic and advanced filters
  const basicFilters = Object.keys(filterConfig).filter(
    key => !advancedFilterKeys.includes(key as keyof T)
  ) as (keyof T)[];

  const advancedFilters = advancedFilterKeys;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.();
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
      {/* Header with title */}
      {title && (
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
      )}

      {/* Search Bar */}
      {showSearch && filters.search !== undefined && (
        <div className="px-6 py-4 border-b border-gray-200">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-4">
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
                  onChange={(e) => onFilterChange('search' as keyof T, e.target.value)}
                  placeholder={searchPlaceholder}
                  className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:${currentTheme.ring} focus:border-${theme}-600 sm:text-sm`}
                />
              </div>
            </div>
            
            {onSearch && (
              <button
                type="submit"
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${currentTheme.primary} focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                Search
              </button>
            )}
            
            {showFilterToggle && (
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filters
                {hasActiveFilters && (
                  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${currentTheme.badge}`}>
                    {activeCount}
                  </span>
                )}
              </button>
            )}
          </form>
        </div>
      )}

      {/* Filter Fields */}
      {showAdvancedFilters && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Basic Filters */}
            {basicFilters
              .filter(key => key !== 'search') // Search is handled separately
              .map((key) => (
                <FilterField
                  key={String(key)}
                  name={String(key)}
                  value={filters[key]}
                  config={filterConfig[key]}
                  onChange={(value) => onFilterChange(key, value)}
                  theme={theme}
                />
              ))}
          </div>

          {/* Advanced Filters (if any) */}
          {advancedFilters.length > 0 && (
            <>
              <div className="mt-4 mb-2">
                <h4 className="text-sm font-medium text-gray-700">Advanced Filters</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {advancedFilters.map((key) => (
                  <FilterField
                    key={String(key)}
                    name={String(key)}
                    value={filters[key]}
                    config={filterConfig[key]}
                    onChange={(value) => onFilterChange(key, value)}
                    theme={theme}
                  />
                ))}
              </div>
            </>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

