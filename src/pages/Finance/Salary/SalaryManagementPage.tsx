import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import SalaryTable from '../../../components/finance/salary/SalaryTable';
import SalaryDetailsDrawer from '../../../components/finance/salary/SalaryDetailsDrawer';
import GenericSalaryFilters, { type SalaryFilterValues } from '../../../components/finance/salary/GenericSalaryFilters';
import { 
  type SalaryFiltersParams,
  getCurrentMonth
} from '../../../apis/finance/salary';
import {
  useSalaries,
  useSalaryDetails,
  useMarkSalaryAsPaid
} from '../../../hooks/queries/useSalaryQueries';
import type { SalaryDisplay } from '../../../types/finance/salary';
import './SalaryManagementPage.css';

const SalaryManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user is HR
  const isHR = user?.role === 'admin' || user?.department === 'HR';
  
  // State management
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [showStatistics, setShowStatistics] = useState(false);
  const [showBulkMarkModal, setShowBulkMarkModal] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Filter state
  const [filters, setFilters] = useState<SalaryFilterValues>({
    search: '',
    department: '',
    status: '',
    minSalary: '',
    maxSalary: '',
    sortBy: 'employeeName',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  // Convert filters to API parameters
  const filtersParams: SalaryFiltersParams = useMemo(() => ({
    search: filters.search || undefined,
    department: filters.department || undefined,
    status: filters.status || undefined,
    minSalary: filters.minSalary || undefined,
    maxSalary: filters.maxSalary || undefined,
    sortBy: filters.sortBy || undefined,
    sortOrder: filters.sortOrder || undefined
  }), [filters]);

  // React Query hooks
  const {
    data: salaryData,
    isLoading,
    error: salaryError
  } = useSalaries(
    selectedMonth,
    pagination.currentPage,
    pagination.itemsPerPage,
    filtersParams
  );

  // Fetch salary details when employee is selected
  const {
    data: salaryBreakdown,
    isLoading: isLoadingBreakdown
  } = useSalaryDetails(
    selectedEmployeeId || 0,
    selectedMonth,
    { enabled: selectedEmployeeId !== null && showDetailsDrawer }
  );

  // Mutations
  const markSalaryAsPaidMutation = useMarkSalaryAsPaid();


  // Update pagination from API response
  useEffect(() => {
    if (salaryData?.pagination) {
      setPagination({
        currentPage: salaryData.pagination.page || 1,
        totalPages: salaryData.pagination.totalPages || 1,
        totalItems: salaryData.pagination.total || 0,
        itemsPerPage: salaryData.pagination.limit || 20
      });
    }
  }, [salaryData]);

  // Show error notification if query fails
  useEffect(() => {
    if (salaryError) {
      setNotification({
        type: 'error',
        message: 'Failed to load salary data. Please try again.'
      });
    }
  }, [salaryError]);

  // Handlers
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleEmployeeClick = (employee: SalaryDisplay) => {
    setSelectedEmployeeId(employee.employeeId);
    setShowDetailsDrawer(true);
  };

  const handleBulkSelect = (employeeIds: string[]) => {
    setSelectedEmployees(employeeIds);
  };

  // Mark single salary as paid
  const handleMarkAsPaid = async (employee: SalaryDisplay) => {
    if (!isHR) return;
    
    try {
      await markSalaryAsPaidMutation.mutateAsync({
        employeeId: employee.employeeId,
        month: employee.month
      });
      
      setNotification({
        type: 'success',
        message: `Salary marked as paid for ${employee.employeeName}`
      });
    } catch (error) {
      console.error('Error marking salary as paid:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to mark salary as paid'
      });
    }
  };

  // Bulk mark salaries as paid
  const handleBulkMarkAsPaid = async () => {
    if (!isHR || selectedEmployees.length === 0) return;
    
    try {
      // Filter to only unpaid employees
      const unpaidEmployeeIds = (salaryData?.employees || [])
        .filter(emp => selectedEmployees.includes(emp.employeeId.toString()) && emp.status !== 'paid')
        .map(emp => emp.employeeId);
      
      if (unpaidEmployeeIds.length === 0) {
        setNotification({
          type: 'success',
          message: 'All selected employees are already marked as paid'
        });
        setShowBulkMarkModal(false);
        setSelectedEmployees([]);
        return;
      }
      
      const response = await markSalaryAsPaidMutation.mutateAsync({
        employeeIds: unpaidEmployeeIds,
        month: selectedMonth
      });
      
      setNotification({
        type: 'success',
        message: `Successfully marked ${response.marked || unpaidEmployeeIds.length} salary record(s) as paid`
      });
      
      setShowBulkMarkModal(false);
      setSelectedEmployees([]);
    } catch (error) {
      console.error('Error bulk marking salaries as paid:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to bulk mark salaries as paid'
      });
    }
  };

  // Filter handlers
  const handleFiltersChange = useCallback((newFilters: SalaryFilterValues) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      department: '',
      status: '',
      minSalary: '',
      maxSalary: '',
      sortBy: 'employeeName',
      sortOrder: 'asc'
    });
    // Reset to first page when clearing filters
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);


  // const handleCalculateAllSalaries = async () => {
  //   try {
  //     setIsCalculating(true);
  //     await calculateAllSalaries();
  //     
  //     setNotification({ 
  //       type: 'success', 
  //       message: 'Salary calculation completed for all employees! Values have been updated.' 
  //     });
  //     
  //     // Clear any existing timer
  //     if (timerRef) {
  //       clearTimeout(timerRef);
  //     }
  //     
  //     // Set calculation timestamp and show it
  //     const now = new Date();
  //     setLastCalculated(now);
  //     setShowLastCalculated(true);
  //     
  //     // Hide the timestamp after 5 seconds
  //     const timer = setTimeout(() => {
  //       setShowLastCalculated(false);
  //       setTimerRef(null);
  //     }, 5000);
  //     setTimerRef(timer);
  //     
  //     // Refresh the data with recalculated flag
  //     await fetchSalaryData();
  //   } catch (error) {
  //     console.error('Error calculating salaries:', error);
  //     setNotification({ 
  //       type: 'error', 
  //       message: 'Failed to calculate salaries' 
  //     });
  //   } finally {
  //     setIsCalculating(false);
  //   }
  // };



  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    // Reset to first page when month changes
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };


  const handleCloseDetailsDrawer = () => {
    setShowDetailsDrawer(false);
    setSelectedEmployeeId(null);
  };

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Cleanup timer on unmount
  // useEffect(() => {
  //   return () => {
  //     if (timerRef) {
  //       clearTimeout(timerRef);
  //     }
  //   };
  // }, [timerRef]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
              {/* {lastCalculated && showLastCalculated && (
            <div className="mb-4 flex items-center text-sm text-green-600 animate-pulse">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Last calculated: {lastCalculated.toLocaleString()}
                </div>
              )} */}
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
            
              {/* <button
                onClick={handleCalculateAllSalaries}
                disabled={isCalculating}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {isCalculating ? 'Calculating...' : 'Calculate All Salaries'}
              </button> */}
              
              <button
                onClick={() => navigate('/finance/salary/calculator')}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Salary Calculator
              </button>
              
              <button
                onClick={() => navigate('/finance/salary/bonus')}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                Bonus Management
              </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-md ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={() => setNotification(null)}
                    className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Summary Cards */}
        {salaryData && showStatistics && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Employees Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Staff</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Total Employees</h3>
                <p className="text-2xl font-bold text-gray-900">{salaryData.summary.totalEmployees}</p>
                <p className="text-xs text-blue-600 mt-2">Active employees</p>
              </div>

              {/* Total Base Salary Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500 rounded-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Base</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Total Base Salary</h3>
                <p className="text-2xl font-bold text-gray-900">${salaryData.summary.totalBaseSalary.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-2">Monthly base</p>
              </div>

              {/* Total Commission Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500 rounded-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">Earned</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Total Commission</h3>
                <p className="text-2xl font-bold text-gray-900">${salaryData.summary.totalCommission.toLocaleString()}</p>
                <p className="text-xs text-purple-600 mt-2">Performance based</p>
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
                <p className="text-2xl font-bold text-gray-900">${salaryData.summary.totalBonus.toLocaleString()}</p>
                <p className="text-xs text-orange-600 mt-2">Rewards & incentives</p>
              </div>

              {/* Total Deductions Card */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl shadow-sm border border-red-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-500 rounded-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">Deductions</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Total Deductions</h3>
                <p className="text-2xl font-bold text-gray-900">${salaryData.summary.totalDeductions.toLocaleString()}</p>
                <p className="text-xs text-red-600 mt-2">Attendance & penalties</p>
              </div>

              {/* Final Salary Pool Card */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl shadow-sm border border-teal-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-teal-500 rounded-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-teal-700 bg-teal-100 px-2 py-1 rounded-full">Final</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Final Salary Pool</h3>
                <p className="text-2xl font-bold text-gray-900">${salaryData.summary.totalFinalSalary.toLocaleString()}</p>
                <p className="text-xs text-teal-600 mt-2">After deductions</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <GenericSalaryFilters
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
        />

        {/* Bulk Mark as Paid Button (HR only) */}
        {isHR && selectedEmployees.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">
                  {selectedEmployees.length} {selectedEmployees.length === 1 ? 'employee' : 'employees'} selected
                </span>
                <button 
                  onClick={() => setSelectedEmployees([])} 
                  className="ml-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear selection
                </button>
              </div>
              <button
                onClick={() => setShowBulkMarkModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mark Selected as Paid
              </button>
            </div>
          </div>
        )}

        {/* Salary Table */}
        {salaryData && (
          <SalaryTable
            employees={salaryData.employees}
            isLoading={isLoading || markSalaryAsPaidMutation.isPending}
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            onEmployeeClick={handleEmployeeClick}
            onBulkSelect={handleBulkSelect}
            selectedEmployees={selectedEmployees}
            onMarkAsPaid={isHR ? handleMarkAsPaid : undefined}
            isHR={isHR}
          />
        )}

        {/* Bulk Mark as Paid Modal */}
        {showBulkMarkModal && (
          <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowBulkMarkModal(false)}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Bulk Mark Salary as Paid</h3>
                    <button onClick={() => setShowBulkMarkModal(false)} className="text-gray-400 hover:text-gray-600">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {selectedEmployees.length > 0 
                        ? `Mark ${selectedEmployees.length} selected employee${selectedEmployees.length > 1 ? 's' : ''} as paid for ${selectedMonth}?`
                        : `Mark all employees as paid for ${selectedMonth}?`}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Only unpaid salaries will be marked. Already paid salaries will be skipped.
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleBulkMarkAsPaid}
                    disabled={markSalaryAsPaidMutation.isPending}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {markSalaryAsPaidMutation.isPending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Marking...
                      </>
                    ) : (
                      'Mark as Paid'
                    )}
                  </button>
                  <button
                    onClick={() => setShowBulkMarkModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Salary Details Drawer */}
        <SalaryDetailsDrawer
          isOpen={showDetailsDrawer}
          onClose={handleCloseDetailsDrawer}
          salaryData={salaryBreakdown}
          loading={isLoadingBreakdown}
        />
      </div>
    </div>
  );
};

export default SalaryManagementPage;
