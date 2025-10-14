import React, { useState } from 'react';

interface ExpensesSearchFiltersProps {
  onSearch: (search: string) => void;
  onCategoryFilter: (category: string) => void;
  onDateRangeFilter: (fromDate: string, toDate: string) => void;
  onMinAmountFilter: (minValue: string) => void;
  onMaxAmountFilter: (maxValue: string) => void;
  onPaymentMethodFilter: (method: string) => void;
  onProcessedByRoleFilter: (role: string) => void;
  onClearFilters: () => void;
}

const ExpensesSearchFilters: React.FC<ExpensesSearchFiltersProps> = ({
  onSearch,
  onCategoryFilter,
  onDateRangeFilter,
  onMinAmountFilter,
  onMaxAmountFilter,
  onPaymentMethodFilter,
  onProcessedByRoleFilter,
  onClearFilters
}) => {
  // Common state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processedByRole, setProcessedByRole] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFromDate('');
    setToDate('');
    setMinAmount('');
    setMaxAmount('');
    setPaymentMethod('');
    setProcessedByRole('');
    onCategoryFilter('');
    onPaymentMethodFilter('');
    onProcessedByRoleFilter('');
    onClearFilters();
  };

  const handleDateRangeChange = () => {
    if (fromDate && toDate) {
      onDateRangeFilter(fromDate, toDate);
    }
  };

  const handleAmountChange = (type: 'min' | 'max', value: string) => {
    // Only allow positive numbers
    const numericValue = value.replace(/[^0-9.]/g, '');
    if (numericValue === '' || (parseFloat(numericValue) >= 0)) {
      if (type === 'min') {
        setMinAmount(numericValue);
        onMinAmountFilter(numericValue);
      } else {
        setMaxAmount(numericValue);
        onMaxAmountFilter(numericValue);
      }
    }
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    onPaymentMethodFilter(value);
  };

  const handleProcessedByRoleChange = (value: string) => {
    setProcessedByRole(value);
    onProcessedByRoleFilter(value);
  };

  const hasActiveFilters = fromDate || toDate || minAmount || maxAmount || paymentMethod || processedByRole;

  const theme = {
    primary: 'bg-blue-600',
    secondary: 'hover:bg-blue-700',
    ring: 'ring-blue-500',
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <form onSubmit={handleSearch} className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Search also filters by category (varchar field)
                  onCategoryFilter(e.target.value);
                }}
                placeholder="Search expenses by title, category, or vendor..."
                className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:${theme.ring} focus:border-blue-600 sm:text-sm`}
              />
            </div>
          </div>
          <button
            type="submit"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${theme.primary} ${theme.secondary} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${theme.ring}`}
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${theme.bg} ${theme.text}`}>
                Active
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-6 py-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            
            {/* Date Range Filter - From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                onBlur={handleDateRangeChange}
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${theme.ring} focus:border-blue-600 sm:text-sm`}
              />
            </div>

            {/* Date Range Filter - To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                onBlur={handleDateRangeChange}
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${theme.ring} focus:border-blue-600 sm:text-sm`}
              />
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Amount
              </label>
              <input
                type="text"
                value={minAmount}
                onChange={(e) => handleAmountChange('min', e.target.value)}
                placeholder="0.00"
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${theme.ring} focus:border-blue-600 sm:text-sm`}
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Amount
              </label>
              <input
                type="text"
                value={maxAmount}
                onChange={(e) => handleAmountChange('max', e.target.value)}
                placeholder="0.00"
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${theme.ring} focus:border-blue-600 sm:text-sm`}
              />
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${theme.ring} focus:border-blue-600 sm:text-sm`}
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="online">Online</option>
              </select>
            </div>

            {/* Processed By Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Processed By
              </label>
              <select
                value={processedByRole}
                onChange={(e) => handleProcessedByRoleChange(e.target.value)}
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${theme.ring} focus:border-blue-600 sm:text-sm`}
              >
                <option value="">All Roles</option>
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

          </div>

          {/* Filter Actions */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.reload()}
                className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${theme.ring}`}
              >
                🔄 Refresh Data
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClearFilters}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${theme.ring}`}
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${theme.primary} ${theme.secondary} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${theme.ring}`}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesSearchFilters;

