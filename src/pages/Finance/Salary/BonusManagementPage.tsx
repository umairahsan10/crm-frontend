import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicTable from '../../../components/common/DynamicTable/DynamicTable';
import { 
  getSalesEmployeesBonus,
  updateSalesEmployeeBonus,
  formatCurrency,
  type BonusFiltersParams
} from '../../../apis/finance/salary';
import type { SalesEmployeeBonus } from '../../../types/finance/salary';
import './BonusManagementPage.css';

const BonusManagementPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [salesEmployees, setSalesEmployees] = useState<SalesEmployeeBonus[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bonusInputs, setBonusInputs] = useState<{ [key: number]: string }>({});
  const [isUpdating, setIsUpdating] = useState<{ [key: number]: boolean }>({});
  const [showStatistics, setShowStatistics] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Filter state (only keeping search and salary/bonus ranges)
  const [filters, setFilters] = useState({
    search: '',
    minSales: '',
    maxSales: '',
    minBonus: '',
    maxBonus: '',
    sortBy: 'name',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  // Calculate bonus statistics
  const getBonusStatistics = () => {
    if (!salesEmployees.length) {
      return {
        totalEmployees: 0,
        totalSales: 0,
        totalBonus: 0,
        avgSales: 0
      };
    }
    
    const totalSales = salesEmployees.reduce((sum, emp) => sum + emp.salesAmount, 0);
    const totalBonus = salesEmployees.reduce((sum, emp) => sum + emp.bonusAmount, 0);
    const avgSales = totalSales / salesEmployees.length;
    
    return {
      totalEmployees: salesEmployees.length,
      totalSales,
      totalBonus,
      avgSales
    };
  };

  // Filter handlers
  const handleFiltersChange = useCallback((field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      minSales: '',
      maxSales: '',
      minBonus: '',
      maxBonus: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
    // Reset to first page when clearing filters
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleAmountChange = (type: 'minSales' | 'maxSales' | 'minBonus' | 'maxBonus', value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    if (numericValue === '' || parseFloat(numericValue) >= 0) {
      handleFiltersChange(type, numericValue);
    }
  };

  // Fetch sales employees data with pagination and filters
  const fetchSalesEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const filtersParams: BonusFiltersParams = {
        search: filters.search || undefined,
        minSales: filters.minSales || undefined,
        maxSales: filters.maxSales || undefined,
        minBonus: filters.minBonus || undefined,
        maxBonus: filters.maxBonus || undefined,
        sortBy: filters.sortBy || undefined,
        sortOrder: filters.sortOrder || undefined
      };
      
      const response = await getSalesEmployeesBonus(
        pagination.currentPage,
        pagination.itemsPerPage,
        filtersParams
      );
      
      setSalesEmployees(response.employees);
      
      // Update pagination from API response
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          currentPage: response.pagination!.page,
          totalPages: response.pagination!.totalPages || 1,
          totalItems: response.pagination!.total || 0,
          itemsPerPage: response.pagination!.limit || 20
        }));
      } else {
        // Fallback: calculate from returned data if no pagination metadata
        const totalItems = response.employees.length;
        const calculatedPages = Math.ceil(totalItems / pagination.itemsPerPage) || 1;
        setPagination(prev => ({
          ...prev,
          totalItems,
          totalPages: calculatedPages
        }));
      }
      
    } catch (error) {
      console.error('Error fetching sales employees:', error);
      setNotification({ 
        type: 'error', 
        message: 'Failed to load sales employees data' 
      });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters]);

  const handleBonusInputChange = (employeeId: number, value: string) => {
    setBonusInputs(prev => ({
      ...prev,
      [employeeId]: value
    }));
  };

  const handleUpdateBonus = async (employeeId: number) => {
    const bonusAmount = parseFloat(bonusInputs[employeeId]);
    
    if (isNaN(bonusAmount) || bonusAmount < 0) {
      setNotification({ 
        type: 'error', 
        message: 'Please enter a valid bonus amount' 
      });
      return;
    }

    try {
      setIsUpdating(prev => ({ ...prev, [employeeId]: true }));
      
      // Call the API to update bonus in database
      const response = await updateSalesEmployeeBonus({ 
        employee_id: employeeId, 
        bonusAmount 
      });
      
      // Update local state with the response from API
      setSalesEmployees(prev => 
        prev.map(emp => 
          emp.id === employeeId 
            ? { ...emp, bonusAmount: response.bonusAmount }
            : emp
        )
      );
      
      setBonusInputs(prev => ({ ...prev, [employeeId]: '' }));
      
      setNotification({ 
        type: 'success', 
        message: response.message || `Bonus updated successfully for ${salesEmployees.find(emp => emp.id === employeeId)?.name}` 
      });
      
    } catch (error) {
      console.error('Error updating bonus:', error);
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to update bonus' 
      });
    } finally {
      setIsUpdating(prev => ({ ...prev, [employeeId]: false }));
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleRefresh = () => {
    fetchSalesEmployees();
  };

  const handlePageChange = async (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Load data when filters, pagination, or on mount changes
  useEffect(() => {
    fetchSalesEmployees();
  }, [fetchSalesEmployees]);


  // Table configuration for DynamicTable
  const tableConfig = {
    columns: [
      {
        key: 'name',
        label: 'Employee Name',
        type: 'custom' as const,
        sortable: true,
        render: (_: any, employee: SalesEmployeeBonus) => (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-700">
                {employee.name.charAt(0)}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{employee.name}</div>
              <div className="text-sm text-gray-500">ID: {employee.id}</div>
            </div>
          </div>
        )
      },
      {
        key: 'salesAmount',
        label: 'Sales Amount',
        type: 'currency' as const,
        sortable: true,
        render: (_: any, employee: SalesEmployeeBonus) => (
          <span className="text-blue-600 font-semibold">
            {formatCurrency(employee.salesAmount)}
          </span>
        )
      },
      {
        key: 'bonusAmount',
        label: 'Current Bonus',
        type: 'currency' as const,
        sortable: true,
        render: (_: any, employee: SalesEmployeeBonus) => (
          <span className="text-green-600 font-semibold">
            {formatCurrency(employee.bonusAmount)}
          </span>
        )
      },
      {
        key: 'newBonus',
        label: 'New Bonus',
        type: 'custom' as const,
        render: (_: any, employee: SalesEmployeeBonus) => (
          <input
            type="number"
            placeholder="Enter amount"
            value={bonusInputs[employee.id] || ''}
            onChange={(e) => handleBonusInputChange(employee.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            min="0"
            step="0.01"
          />
        )
      },
      {
        key: 'actions',
        label: 'Actions',
        type: 'custom' as const,
        render: (_: any, employee: SalesEmployeeBonus) => (
          <button 
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            onClick={() => handleUpdateBonus(employee.id)}
            disabled={!bonusInputs[employee.id] || isUpdating[employee.id]}
          >
            {isUpdating[employee.id] ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update
              </>
            )}
          </button>
        )
      }
    ],
    data: salesEmployees,
    isLoading,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,
    itemsPerPage: pagination.itemsPerPage,
    onPageChange: handlePageChange,
    onRowClick: () => {}, // No row click action needed
    emptyMessage: 'No eligible sales employees found'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bonus Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage bonuses for high-performing sales employees (Sales &gt;= $3000)
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/finance/salary')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Salary
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Toggle */}
        <div className="mb-8">
          {/* Action Buttons */}
          <div className="flex items-center justify-between w-full gap-3">
            <button
              onClick={() => setShowStatistics(!showStatistics)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 rounded-md p-4 ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.message}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={handleCloseNotification}
                    className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      notification.type === 'success'
                        ? 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600'
                        : 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600'
                    }`}
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Summary Cards */}
        {showStatistics && (() => {
          const stats = getBonusStatistics();
          return (
          <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Eligible Employees Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-500 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Staff</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Eligible Employees</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                  <p className="text-xs text-blue-600 mt-2">Sales employees</p>
                </div>

                {/* Total Sales Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-500 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Sales</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Sales</h3>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalSales.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-2">Total sales amount</p>
                </div>

                {/* Total Bonus Card */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-sm border border-orange-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-500 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">Reward</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Bonus</h3>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalBonus.toLocaleString()}</p>
                  <p className="text-xs text-orange-600 mt-2">Total bonus amount</p>
                </div>

                {/* Avg Sales Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-500 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">Average</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Average Sales</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalEmployees > 0 
                      ? `$${stats.avgSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}` 
                      : '$0'}
                  </p>
                  <p className="text-xs text-purple-600 mt-2">Per employee</p>
                </div>
              </div>
          </div>
          );
        })()}

        {/* Simple Filters */}
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
                    value={filters.search}
                    onChange={(e) => handleFiltersChange('search', e.target.value)}
                    placeholder="Search employees by name or ID..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filters
                {(filters.minSales || filters.maxSales || filters.minBonus || filters.maxBonus) && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {[filters.minSales, filters.maxSales, filters.minBonus, filters.maxBonus].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Min Sales Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Sales</label>
                  <input
                    type="number"
                    value={filters.minSales}
                    onChange={(e) => handleAmountChange('minSales', e.target.value)}
                    placeholder="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>

                {/* Max Sales Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Sales</label>
                  <input
                    type="number"
                    value={filters.maxSales}
                    onChange={(e) => handleAmountChange('maxSales', e.target.value)}
                    placeholder="100000"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>

                {/* Min Bonus Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Bonus</label>
                  <input
                    type="number"
                    value={filters.minBonus}
                    onChange={(e) => handleAmountChange('minBonus', e.target.value)}
                    placeholder="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>

                {/* Max Bonus Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Bonus</label>
                  <input
                    type="number"
                    value={filters.maxBonus}
                    onChange={(e) => handleAmountChange('maxBonus', e.target.value)}
                    placeholder="10000"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              {(filters.search || filters.minSales || filters.maxSales || filters.minBonus || filters.maxBonus) && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <DynamicTable {...tableConfig} />
        </div>
      </div>
    </div>
  );
};

export default BonusManagementPage;