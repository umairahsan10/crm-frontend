import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import type { MetricData } from '../../../types/dashboard';
import DynamicTable from '../../../components/common/DynamicTable/DynamicTable';
import GenericSalaryFilters from '../../../components/finance/salary/GenericSalaryFilters';
import { 
  getMockSalesBonusData,
  formatCurrency,
  getCurrentMonth
} from '../../../apis/finance/salary';
import type { SalesEmployeeBonus } from '../../../types/finance/salary';
import './BonusManagementPage.css';

const BonusManagementPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [salesEmployees, setSalesEmployees] = useState<SalesEmployeeBonus[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<SalesEmployeeBonus[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [bonusInputs, setBonusInputs] = useState<{ [key: number]: string }>({});
  const [isUpdating, setIsUpdating] = useState<{ [key: number]: boolean }>({});

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: '',
    fromDate: '',
    toDate: '',
    minSalary: '',
    maxSalary: '',
    createdBy: '',
    sortBy: 'name',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  // Get bonus metrics for MetricGrid
  const getBonusMetrics = (): MetricData[] => {
    if (!salesEmployees.length) return [];
    
    const totalSales = salesEmployees.reduce((sum, emp) => sum + emp.salesAmount, 0);
    const totalBonus = salesEmployees.reduce((sum, emp) => sum + emp.bonusAmount, 0);
    const avgSales = totalSales / salesEmployees.length;
    
    return [
      {
        icon: '👥',
        title: 'Eligible Employees',
        value: salesEmployees.length.toString(),
        change: '+2',
        changeType: 'positive' as const
      },
      {
        icon: '💰',
        title: 'Total Sales',
        value: formatCurrency(totalSales),
        change: '+12.5%',
        changeType: 'positive' as const
      },
      {
        icon: '🎯',
        title: 'Total Bonus',
        value: formatCurrency(totalBonus),
        change: '+8.3%',
        changeType: 'positive' as const
      },
      {
        icon: '📊',
        title: 'Avg Sales',
        value: formatCurrency(avgSales),
        change: '+5.2%',
        changeType: 'positive' as const
      }
    ];
  };

  // Apply filters to data
  const applyFilters = useCallback((employees: SalesEmployeeBonus[], currentFilters: typeof filters) => {
    let filtered = employees;

    // Search filter
    if (currentFilters.search) {
      const searchTerm = currentFilters.search.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm) ||
        emp.id.toString().includes(searchTerm)
      );
    }

    // Sales amount range filters
    if (currentFilters.minSalary) {
      const minSales = parseFloat(currentFilters.minSalary);
      if (!isNaN(minSales)) {
        filtered = filtered.filter(emp => emp.salesAmount >= minSales);
      }
    }

    if (currentFilters.maxSalary) {
      const maxSales = parseFloat(currentFilters.maxSalary);
      if (!isNaN(maxSales)) {
        filtered = filtered.filter(emp => emp.salesAmount <= maxSales);
      }
    }

    // Bonus amount range filters
    if (currentFilters.fromDate) {
      const minBonus = parseFloat(currentFilters.fromDate);
      if (!isNaN(minBonus)) {
        filtered = filtered.filter(emp => emp.bonusAmount >= minBonus);
      }
    }

    if (currentFilters.toDate) {
      const maxBonus = parseFloat(currentFilters.toDate);
      if (!isNaN(maxBonus)) {
        filtered = filtered.filter(emp => emp.bonusAmount <= maxBonus);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (currentFilters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'salesAmount':
          aValue = a.salesAmount;
          bValue = b.salesAmount;
          break;
        case 'bonusAmount':
          aValue = a.bonusAmount;
          bValue = b.bonusAmount;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (currentFilters.sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    return filtered;
  }, []);

  // Update filtered data when filters or sales data changes
  useEffect(() => {
    if (salesEmployees.length > 0) {
      const filtered = applyFilters(salesEmployees, filters);
      setFilteredEmployees(filtered);
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / prev.itemsPerPage),
        currentPage: 1 // Reset to first page when filters change
      }));
    }
  }, [salesEmployees, filters, applyFilters]);

  // Filter handlers
  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      department: '',
      status: '',
      fromDate: '',
      toDate: '',
      minSalary: '',
      maxSalary: '',
      createdBy: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  }, []);

  const handleMonthChange = useCallback((month: string) => {
    setSelectedMonth(month);
  }, []);

  // Fetch sales employees data
  const fetchSalesEmployees = async () => {
    try {
      setIsLoading(true);
      
      // For now, use mock data
      // In a real app, you would call: await getSalesEmployeesBonus();
      const mockData = getMockSalesBonusData();
      setSalesEmployees(mockData);
      
    } catch (error) {
      console.error('Error fetching sales employees:', error);
      setNotification({ 
        type: 'error', 
        message: 'Failed to load sales employees data' 
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      
      // In a real app, you would call the API
      // await updateSalesEmployeeBonus({ employee_id: employeeId, bonusAmount });
      
      // Mock update
      setSalesEmployees(prev => 
        prev.map(emp => 
          emp.id === employeeId 
            ? { ...emp, bonusAmount }
            : emp
        )
      );
      
      setBonusInputs(prev => ({ ...prev, [employeeId]: '' }));
      
      setNotification({ 
        type: 'success', 
        message: `Bonus updated successfully for ${salesEmployees.find(emp => emp.id === employeeId)?.name}` 
      });
      
    } catch (error) {
      console.error('Error updating bonus:', error);
      setNotification({ 
        type: 'error', 
        message: 'Failed to update bonus' 
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


  // Load data on component mount
  useEffect(() => {
    fetchSalesEmployees();
  }, []);


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
    data: filteredEmployees,
    isLoading,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,
    itemsPerPage: pagination.itemsPerPage,
    onPageChange: (page: number) => setPagination(prev => ({ ...prev, currentPage: page })),
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

        {/* Key Metrics */}
        {salesEmployees.length > 0 && (
          <div className="mb-8">
            <MetricGrid
              title=""
              metrics={getBonusMetrics()}
              columns={4}
              headerColor="from-green-50 to-transparent"
              headerGradient="from-green-500 to-teal-600"
              cardSize="sm"
            />
          </div>
        )}

        {/* Filters */}
        <GenericSalaryFilters
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
        />

        {/* Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <DynamicTable {...tableConfig} />
        </div>
      </div>
    </div>
  );
};

export default BonusManagementPage;