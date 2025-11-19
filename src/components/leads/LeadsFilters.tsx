import React, { useState, useEffect } from 'react';
import { getSalesUnitsApi, getFilterEmployeesApi } from '../../apis/leads';

interface LeadsFiltersProps {
  onSearch: (search: string) => void;
  onStatusFilter: (status: string) => void;
  onTypeFilter: (type: string) => void;
  onSalesUnitFilter: (salesUnitId: string) => void;
  onAssignedToFilter: (assignedTo: string) => void;
  onDateRangeFilter: (startDate: string, endDate: string) => void;
  onClearFilters: () => void;
}

const LeadsFilters: React.FC<LeadsFiltersProps> = ({
  onSearch,
  onStatusFilter,
  onTypeFilter,
  onSalesUnitFilter,
  onAssignedToFilter,
  onDateRangeFilter,
  onClearFilters
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSalesUnit, setSelectedSalesUnit] = useState('');
  const [selectedAssignedTo, setSelectedAssignedTo] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // API-driven data - no hardcoded initial data
  const [salesUnits, setSalesUnits] = useState<Array<{ id: number; name: string }>>([]);
  const [employees, setEmployees] = useState<Array<{ 
    id?: string | number; 
    employeeId?: string | number;
    userId?: string | number;
    _id?: string | number;
    name?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    [key: string]: any;
  }>>([]);
  const [isLoadingSalesUnits, setIsLoadingSalesUnits] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  // Updated status options based on requirements
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'payment_link_generated', label: 'Payment Link Generated' },
    { value: 'failed', label: 'Failed' },
    { value: 'cracked', label: 'Cracked' }
  ];

  // Updated type options based on requirements
  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'warm', label: 'Warm' },
    { value: 'cold', label: 'Cold' },
    { value: 'upsell', label: 'Upsell' },
    { value: 'push', label: 'Push' }
  ];

  // Fetch sales units on component mount
  useEffect(() => {
    const fetchSalesUnits = async () => {
      try {
        setIsLoadingSalesUnits(true);
        console.log('LeadsFilters: Fetching sales units...');
        const response = await getSalesUnitsApi();
        console.log('LeadsFilters: Sales units response:', response);
        
        if (response.success && response.data && Array.isArray(response.data)) {
          setSalesUnits(response.data);
          console.log('LeadsFilters: Sales units set:', response.data);
        } else {
          console.error('Sales units API failed:', response);
          // No fallback - show empty state if API fails
          setSalesUnits([]);
        }
      } catch (error) {
        console.error('Error fetching sales units:', error);
        // No fallback - show empty state on error
        setSalesUnits([]);
      } finally {
        setIsLoadingSalesUnits(false);
      }
    };

    fetchSalesUnits();
  }, []);

  // Fetch employees when component mounts or sales unit changes
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoadingEmployees(true);
        const salesUnitId = selectedSalesUnit ? parseInt(selectedSalesUnit) : undefined;
        console.log('Fetching employees for sales unit:', salesUnitId);
        const response = await getFilterEmployeesApi(salesUnitId);
        console.log('Employees response:', response);
        
        if (response.success && response.data && Array.isArray(response.data)) {
          setEmployees(response.data);
          console.log('Employees loaded successfully:', response.data.length);
        } else {
          console.error('Employees API failed:', response);
          // No fallback - show empty state if API fails
          setEmployees([]);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        // No fallback - show empty state on error
        setEmployees([]);
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [selectedSalesUnit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedType('');
    setSelectedSalesUnit('');
    setSelectedAssignedTo('');
    setStartDate('');
    setEndDate('');
    onClearFilters();
  };

  const handleDateRangeChange = () => {
    if (startDate && endDate) {
      onDateRangeFilter(startDate, endDate);
    }
  };

  // Handle sales unit change - reset employee selection and fetch new employees
  const handleSalesUnitChange = (salesUnitId: string) => {
    setSelectedSalesUnit(salesUnitId);
    setSelectedAssignedTo(''); // Reset employee selection
    onSalesUnitFilter(salesUnitId);
  };

  const hasActiveFilters = selectedStatus || selectedType || selectedSalesUnit || selectedAssignedTo || startDate || endDate;

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
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search leads by name, email, or phone..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  onStatusFilter(e.target.value);
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  onTypeFilter(e.target.value);
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sales Unit Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sales Unit
              </label>
              <select
                value={selectedSalesUnit}
                onChange={(e) => handleSalesUnitChange(e.target.value)}
                disabled={isLoadingSalesUnits}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {isLoadingSalesUnits ? 'Loading...' : 'All Sales Units'}
                </option>
                {Array.isArray(salesUnits) && salesUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned To Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <select
                value={selectedAssignedTo}
                onChange={(e) => {
                  setSelectedAssignedTo(e.target.value);
                  onAssignedToFilter(e.target.value);
                }}
                disabled={isLoadingEmployees}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {isLoadingEmployees ? 'Loading...' : 'All Employees'}
                </option>
                {Array.isArray(employees) && employees.map((employee, index) => {
                  // Handle different employee data formats
                  const employeeId = (employee.id || employee.employeeId || employee.userId || employee._id || index.toString()).toString();
                  const employeeName = employee.name || employee.fullName || 
                    (employee.firstName && employee.lastName ? `${employee.firstName} ${employee.lastName}` : null) || 
                    employee.email || `Employee ${index + 1}`;
                  
                  return (
                    <option key={employeeId} value={employeeId}>
                      {employeeName}
                    </option>
                  );
                })}
              </select>
              {selectedSalesUnit && (
                <p className="mt-1 text-xs text-gray-500">
                  Showing employees from selected sales unit
                </p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onBlur={handleDateRangeChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onBlur={handleDateRangeChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // Refresh data from API
                  window.location.reload();
                }}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                🔄 Refresh Data
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

export default LeadsFilters;
