import React, { useState } from 'react';
import type { CompanyFilters } from '../../apis/company';

interface GenericCompanyFiltersProps {
  // Current filter values
  filters: CompanyFilters;
  
  // What filters to show (configure per tab)
  showFilters: {
    search?: boolean;
    status?: boolean;
    country?: boolean;
    company?: boolean;
  };
  
  // Callbacks
  onFiltersChange: (filters: Partial<CompanyFilters>) => void;
  onClearFilters: () => void;
  
  // UI customization
  theme?: {
    primary: string;
    secondary: string;
  };
}

const GenericCompanyFilters: React.FC<GenericCompanyFiltersProps> = ({
  filters,
  showFilters,
  onFiltersChange,
  onClearFilters
}) => {
  const [localFilters, setLocalFilters] = useState<Partial<CompanyFilters>>({
    search: filters.search || '',
    status: filters.status || '',
    country: filters.country || '',
    name: filters.name || ''
  });

  const handleFilterChange = (key: keyof CompanyFilters, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      country: '',
      name: ''
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const hasActiveFilters = Object.values(localFilters).some(value => value && value !== '');

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Filter */}
        {showFilters.search && (
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search companies..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Status Filter */}
        {showFilters.status && (
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={localFilters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}

        {/* Country Filter */}
        {showFilters.country && (
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              value={localFilters.country || ''}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Countries</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Australia">Australia</option>
              <option value="Japan">Japan</option>
              <option value="Other">Other</option>
            </select>
          </div>
        )}

        {/* Company Name Filter */}
        {showFilters.company && (
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={localFilters.name || ''}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder="Filter by company name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericCompanyFilters;