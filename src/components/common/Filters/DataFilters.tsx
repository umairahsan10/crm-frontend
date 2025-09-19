import React, { useState } from 'react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  type: 'search' | 'select' | 'date' | 'dateRange' | 'multiSelect';
  label: string;
  placeholder?: string;
  options?: FilterOption[];
  width?: string;
  loading?: boolean;
}

export interface DataFiltersProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
  className?: string;
}

const DataFilters: React.FC<DataFiltersProps> = ({
  filters,
  values,
  onChange,
  onClear,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    onChange(key, value);
  };

  const hasActiveFilters = Object.values(values).some(value => 
    value !== '' && value !== null && value !== undefined && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.key] || '';

    switch (filter.type) {
      case 'search':
        return (
          <div key={filter.key} className="flex-1 min-w-0" style={{ width: filter.width }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <input
              type="text"
              placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
              value={value}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        );

      case 'select':
        return (
          <div key={filter.key} className="flex-1 min-w-0" style={{ width: filter.width }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <select
              value={value}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              disabled={filter.loading}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {filter.loading ? 'Loading...' : `All ${filter.label}`}
              </option>
              {filter.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multiSelect':
        return (
          <div key={filter.key} className="flex-1 min-w-0" style={{ width: filter.width }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <select
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={(e) => {
                const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                handleFilterChange(filter.key, selectedValues);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {filter.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'date':
        return (
          <div key={filter.key} className="flex-1 min-w-0" style={{ width: filter.width }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        );

      case 'dateRange':
        return (
          <div key={filter.key} className="flex-1 min-w-0" style={{ width: filter.width }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                placeholder="Start Date"
                value={value?.startDate || ''}
                onChange={(e) => handleFilterChange(filter.key, { 
                  ...value, 
                  startDate: e.target.value 
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <input
                type="date"
                placeholder="End Date"
                value={value?.endDate || ''}
                onChange={(e) => handleFilterChange(filter.key, { 
                  ...value, 
                  endDate: e.target.value 
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={onClear}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {/* Always visible filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filters.slice(0, 4).map(renderFilter)}
        </div>

        {/* Expandable filters */}
        {isExpanded && filters.length > 4 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filters.slice(4).map(renderFilter)}
          </div>
        )}

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {Object.entries(values).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              
              const filter = filters.find(f => f.key === key);
              if (!filter) return null;

              const displayValue = Array.isArray(value) 
                ? value.join(', ') 
                : typeof value === 'object' 
                  ? `${value.startDate || ''} - ${value.endDate || ''}`
                  : value;

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {filter.label}: {displayValue}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                  >
                    <span className="sr-only">Remove</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataFilters;
