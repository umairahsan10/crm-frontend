import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import type { MetricData } from '../../../types/dashboard';
import { 
  formatCurrency, 
  formatDate
} from '../../../apis/finance/salary';
import { useEmployees } from '../../../hooks/queries/useHRQueries';
import { useSalaryPreview } from '../../../hooks/queries/useSalaryQueries';
import type { EmployeeSummary } from '../../../apis/hr-employees';
import './SalaryCalculatorPage.css';

const SalaryCalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [shouldCalculate, setShouldCalculate] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Searchable dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Fetch employees using React Query with caching
  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
    error: employeesError
  } = useEmployees(
    1,
    1000, // Get all employees
    { status: 'active' }, // Filter by active status
    {
      staleTime: 5 * 60 * 1000, // 5 minutes - employee list doesn't change often
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const employees = useMemo(() => employeesData?.employees || [], [employeesData]);

  // Fetch salary preview when employee is selected
  const employeeIdNum = useMemo(() => {
    const id = parseInt(selectedEmployeeId);
    return isNaN(id) ? 0 : id;
  }, [selectedEmployeeId]);

  const {
    data: previewData,
    isLoading: isLoadingPreview,
    error: previewError,
    refetch: refetchPreview
  } = useSalaryPreview(
    employeeIdNum,
    endDate || undefined,
    { 
      enabled: employeeIdNum > 0,
      // Only refetch when explicitly triggered or when endDate changes
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }
  );

  // Show error notification if employees query fails
  useEffect(() => {
    if (employeesError) {
      setNotification({ 
        type: 'error', 
        message: 'Failed to load employees. Please refresh the page.' 
      });
    }
  }, [employeesError]);

  // Show success/error notification for preview calculation
  useEffect(() => {
    if (shouldCalculate && !isLoadingPreview) {
      if (previewData) {
        setNotification({ 
          type: 'success', 
          message: 'Salary preview calculated successfully!' 
        });
        setShouldCalculate(false);
      } else if (previewError) {
        const errorMessage = previewError instanceof Error 
          ? previewError.message 
          : 'Failed to calculate salary preview. Please check the employee selection and try again.';
        setNotification({ 
          type: 'error', 
          message: errorMessage
        });
        setShouldCalculate(false);
      }
    }
  }, [previewData, previewError, shouldCalculate, isLoadingPreview]);

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    
    const query = searchQuery.toLowerCase();
    return employees.filter((employee: EmployeeSummary) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const email = employee.email.toLowerCase();
      const department = employee.department?.name?.toLowerCase() || '';
      
      return fullName.includes(query) || 
             email.includes(query) || 
             department.includes(query);
    });
  }, [employees, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get calculator metrics for MetricGrid
  const getCalculatorMetrics = (): MetricData[] => {
    if (!previewData) return [];
    
    return [
      {
        icon: '👤',
        title: 'Employee',
        value: `${previewData.employee.firstName} ${previewData.employee.lastName}`,
        change: previewData.employee.department,
        changeType: 'neutral' as const
      },
      {
        icon: '💰',
        title: 'Base Salary',
        value: formatCurrency(previewData.salary.fullBaseSalary),
        change: previewData.salary.proratedBaseSalary !== previewData.salary.fullBaseSalary ? 'Prorated' : 'Full',
        changeType: 'neutral' as const
      },
      {
        icon: '🎯',
        title: 'Total Bonus',
        value: formatCurrency(previewData.salary.totalBonus),
        change: `+${formatCurrency(previewData.salary.commission)} commission`,
        changeType: 'positive' as const
      },
      {
        icon: '✅',
        title: 'Final Salary',
        value: formatCurrency(previewData.salary.finalSalary),
        change: `-${formatCurrency(previewData.salary.deductions)} deductions`,
        changeType: 'positive' as const
      }
    ];
  };

  const handleCalculatePreview = async () => {
    if (!selectedEmployeeId) {
      setNotification({ 
        type: 'error', 
        message: 'Please select an employee' 
      });
      return;
    }

    const empId = parseInt(selectedEmployeeId);
    
    if (isNaN(empId)) {
      setNotification({ 
        type: 'error', 
        message: 'Please select a valid employee' 
      });
      return;
    }
    
    // Trigger the query by setting shouldCalculate to true and refetching
    setShouldCalculate(true);
    try {
      await refetchPreview();
    } catch (error) {
      // Error will be handled by the useEffect that watches previewError
      console.error('Error calculating preview:', error);
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleClearForm = () => {
    setSelectedEmployeeId('');
    setEndDate('');
    setShouldCalculate(false);
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

  // Get selected employee name for display
  const selectedEmployee = employees.find((emp: EmployeeSummary) => emp.id.toString() === selectedEmployeeId);

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Salary Calculator</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Calculate real-time salary preview for any employee
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/finance/salary')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Salary
                </button>
                <button
                  onClick={handleClearForm}
                  disabled={isLoadingPreview}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Form
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

        {/* Key Metrics - Only show when calculation is done */}
        {previewData && (
          <div className="mb-8">
            <MetricGrid
              title=""
              metrics={getCalculatorMetrics()}
              columns={4}
              headerColor="from-green-50 to-transparent"
              headerGradient="from-green-500 to-teal-600"
              cardSize="sm"
            />
          </div>
        )}

        {/* Calculator Form */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Employee Selection</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select an employee to calculate salary preview
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative" ref={dropdownRef}>
                <label htmlFor="employeeSelect" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee *
                </label>
                {isLoadingEmployees ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm text-gray-500">Loading employees...</span>
                  </div>
                ) : (
                  <>
                    {/* Selected Employee Display / Search Input */}
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2.5 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <span className="block truncate">
                        {selectedEmployee 
                          ? `${selectedEmployee.firstName} ${selectedEmployee.lastName} - ${selectedEmployee.department.name}`
                          : '-- Select an employee --'}
                      </span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg 
                          className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-hidden focus:outline-none sm:text-sm">
                        {/* Search Input */}
                        <div className="px-3 py-2 border-b border-gray-200 bg-white">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              placeholder="Search by name, email, or department..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                          </div>
                        </div>

                        {/* Employee List */}
                        <div className="max-h-48 overflow-y-auto">
                          {filteredEmployees.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              {searchQuery ? 'No employees found' : 'No employees available'}
                            </div>
                          ) : (
                            filteredEmployees.map((employee: EmployeeSummary) => (
                              <button
                                key={employee.id}
                                type="button"
                                onClick={() => handleEmployeeSelect(employee.id.toString())}
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 focus:bg-green-50 focus:outline-none transition-colors ${
                                  selectedEmployeeId === employee.id.toString() 
                                    ? 'bg-green-100 text-green-900 font-medium' 
                                    : 'text-gray-900'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-semibold text-green-700">
                                          {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">
                                          {employee.firstName} {employee.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                          {employee.department.name} • {employee.email}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  {selectedEmployeeId === employee.id.toString() && (
                                    <svg className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
                {selectedEmployee && (
                  <p className="mt-1 text-xs text-gray-500">
                    Email: {selectedEmployee.email} | Status: {selectedEmployee.status}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Calculate up to date (optional)
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty to calculate up to current date
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={handleClearForm}
                disabled={isLoadingPreview}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
              <button 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                onClick={handleCalculatePreview}
                disabled={isLoadingPreview || !selectedEmployeeId || isLoadingEmployees}
              >
                {isLoadingPreview ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Calculate Preview
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingPreview && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
            <div className="flex flex-col items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-3 text-sm text-gray-600">Calculating salary preview...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {previewError && !previewData && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Calculation Failed</h3>
              <p className="mt-1 text-sm text-gray-500">Unable to calculate salary preview. Please check the employee selection and try again.</p>
              <div className="mt-6">
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={handleClearForm}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calculation Results */}
        {previewData && (
          <div className="space-y-6">
            {/* Warning Banner for Negative Salary
            {previewData.salary.finalSalary < 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Warning: Negative Final Salary
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        The total deductions ({formatCurrency(Math.abs(previewData.salary.deductions))}) exceed the net salary ({formatCurrency(previewData.salary.netSalary)}), 
                        resulting in a negative final salary of {formatCurrency(previewData.salary.finalSalary)}.
                      </p>
                      {previewData.deductionBreakdown.totalAbsent && previewData.deductionBreakdown.totalAbsent > 0 && (
                        <p className="mt-1">
                          This is primarily due to {previewData.deductionBreakdown.totalAbsent} absent day(s) with a total deduction of {formatCurrency(previewData.deductionBreakdown.absentDeduction)}.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )} */}
            {/* Employee Info Card */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Employee Information</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-green-700">
                      {previewData.employee.firstName.charAt(0)}{previewData.employee.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900">
                      {previewData.employee.firstName} {previewData.employee.lastName}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        previewData.employee.department === 'Sales' ? 'bg-blue-100 text-blue-800' :
                        previewData.employee.department === 'Marketing' ? 'bg-purple-100 text-purple-800' :
                        previewData.employee.department === 'HR' ? 'bg-pink-100 text-pink-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {previewData.employee.department}
                      </span>
                      <span className="text-sm text-gray-500">Status: {previewData.employee.status}</span>
                      <span className="text-sm text-gray-500">Start: {formatDate(previewData.employee.startDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculation Period */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Calculation Period</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Day</label>
                    <p className="text-lg text-gray-900 font-medium">Day {previewData.calculationPeriod.startDay}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Day</label>
                    <p className="text-lg text-gray-900 font-medium">Day {previewData.calculationPeriod.endDay}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Days Worked</label>
                    <p className="text-lg text-green-600 font-bold">{previewData.calculationPeriod.daysWorked} days</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month/Year</label>
                    <p className="text-lg text-gray-900 font-medium">
                      {new Date(previewData.calculationPeriod.year, previewData.calculationPeriod.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {previewData.deductionBreakdown.perDaySalary && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Per Day Salary</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Based on {previewData.calculationPeriod.daysWorked} working days
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(previewData.deductionBreakdown.perDaySalary)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Salary Components</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-700">Full Base Salary</span>
                    <span className="text-lg text-gray-900 font-medium">{formatCurrency(previewData.salary.fullBaseSalary)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Prorated Base Salary</span>
                    <span className="text-lg text-gray-900 font-bold">{formatCurrency(previewData.salary.proratedBaseSalary)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-green-700">+ Employee Bonus</span>
                    <span className="text-lg text-green-600 font-medium">+{formatCurrency(previewData.salary.employeeBonus)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-green-700">+ Sales Bonus</span>
                    <span className="text-lg text-green-600 font-medium">+{formatCurrency(previewData.salary.salesBonus)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-blue-700">+ Commission</span>
                    <span className="text-lg text-blue-600 font-medium">+{formatCurrency(previewData.salary.commission)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">Net Salary</span>
                    <span className="text-xl text-gray-900 font-bold">{formatCurrency(previewData.salary.netSalary)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-red-700">Total Deductions</span>
                    <span className="text-lg text-red-600 font-medium">-{formatCurrency(previewData.salary.deductions)}</span>
                  </div>
                  <div className={`flex justify-between items-center py-2 border-t-2 px-4 py-3 rounded-lg ${
                    previewData.salary.finalSalary < 0 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-green-200 bg-green-50'
                  }`}>
                    <span className={`text-xl font-bold ${
                      previewData.salary.finalSalary < 0 ? 'text-red-900' : 'text-green-900'
                    }`}>
                      Final Salary
                      {previewData.salary.finalSalary < 0 && (
                        <span className="ml-2 text-sm font-normal">⚠️ Negative Balance</span>
                      )}
                    </span>
                    <span className={`text-2xl font-bold ${
                      previewData.salary.finalSalary < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(previewData.salary.finalSalary)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Deduction Details</h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    { 
                      label: 'Per Day Salary', 
                      value: previewData.deductionBreakdown.perDaySalary || 0,
                      icon: '💰',
                      color: 'blue'
                    },
                    { 
                      label: 'Total Absent Days', 
                      value: previewData.deductionBreakdown.totalAbsent || 0,
                      icon: '❌',
                      color: 'red'
                    },
                    { 
                      label: 'Total Late Days', 
                      value: previewData.deductionBreakdown.totalLateDays || 0,
                      icon: '⏰',
                      color: 'yellow'
                    },
                    { 
                      label: 'Total Half Days', 
                      value: previewData.deductionBreakdown.totalHalfDays || 0,
                      icon: '⏸️',
                      color: 'orange'
                    },
                    { 
                      label: 'Monthly Lates', 
                      value: previewData.deductionBreakdown.monthlyLatesDays || 0,
                      icon: '📅',
                      color: 'purple'
                    },
                    { 
                      label: 'Total Deductions', 
                      value: previewData.deductionBreakdown.totalDeduction,
                      icon: '📉',
                      color: 'red',
                      highlight: true
                    }
                  ].map((item, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      item.highlight 
                        ? 'bg-red-50 border-red-200' 
                        : item.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                          item.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                          item.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                          item.color === 'purple' ? 'bg-purple-50 border-purple-200' :
                          'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{item.icon}</span>
                        {typeof item.value === 'number' && item.label !== 'Per Day Salary' && (
                          <span className="text-xs font-medium text-gray-500">Days</span>
                        )}
                      </div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{item.label}</label>
                      <p className={`text-lg font-semibold ${
                        item.highlight ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {item.label === 'Per Day Salary' || item.highlight
                          ? formatCurrency(item.value)
                          : item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Deduction Amounts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Absent Deduction', value: previewData.deductionBreakdown.absentDeduction, color: 'red' },
                    { label: 'Late Deduction', value: previewData.deductionBreakdown.lateDeduction, color: 'yellow' },
                    { label: 'Half Day Deduction', value: previewData.deductionBreakdown.halfDayDeduction, color: 'orange' },
                    { label: 'Chargeback', value: previewData.deductionBreakdown.chargebackDeduction, color: 'purple' },
                    { label: 'Refund', value: previewData.deductionBreakdown.refundDeduction, color: 'indigo' }
                  ].map((item, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      item.color === 'red' ? 'bg-red-50 border-red-200' :
                      item.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                      item.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                      item.color === 'purple' ? 'bg-purple-50 border-purple-200' :
                      'bg-indigo-50 border-indigo-200'
                    }`}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{item.label}</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(item.value)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Absent Details Table */}
                {previewData.deductionBreakdown.absentDetails && previewData.deductionBreakdown.absentDetails.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2">❌</span>
                      Absent Days Breakdown ({previewData.deductionBreakdown.absentDetails.length} days)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deduction</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {previewData.deductionBreakdown.absentDetails.map((detail, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                Day {detail.day}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {detail.reason}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-red-600">
                                -{formatCurrency(detail.deduction)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-red-50">
                          <tr>
                            <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                              Total Absent Deduction:
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-red-600 text-right">
                              -{formatCurrency(previewData.deductionBreakdown.absentDeduction)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Late Details Table */}
                {previewData.deductionBreakdown.lateDetails && previewData.deductionBreakdown.lateDetails.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2">⏰</span>
                      Late Days Breakdown ({previewData.deductionBreakdown.lateDetails.length} days)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deduction</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {previewData.deductionBreakdown.lateDetails.map((detail, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                Day {detail.day}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {detail.reason}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-yellow-600">
                                -{formatCurrency(detail.deduction)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-yellow-50">
                          <tr>
                            <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                              Total Late Deduction:
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-yellow-600 text-right">
                              -{formatCurrency(previewData.deductionBreakdown.lateDeduction)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Half Day Details Table */}
                {previewData.deductionBreakdown.halfDayDetails && previewData.deductionBreakdown.halfDayDetails.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2">⏸️</span>
                      Half Days Breakdown ({previewData.deductionBreakdown.halfDayDetails.length} days)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deduction</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {previewData.deductionBreakdown.halfDayDetails.map((detail, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                Day {detail.day}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {detail.reason}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-orange-600">
                                -{formatCurrency(detail.deduction)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-orange-50">
                          <tr>
                            <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                              Total Half Day Deduction:
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-orange-600 text-right">
                              -{formatCurrency(previewData.deductionBreakdown.halfDayDeduction)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* No Details Message */}
                {(!previewData.deductionBreakdown.absentDetails || previewData.deductionBreakdown.absentDetails.length === 0) &&
                 (!previewData.deductionBreakdown.lateDetails || previewData.deductionBreakdown.lateDetails.length === 0) &&
                 (!previewData.deductionBreakdown.halfDayDetails || previewData.deductionBreakdown.halfDayDetails.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No detailed deduction records available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryCalculatorPage;