import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import type { MetricData } from '../../../types/dashboard';
import SalaryTable from '../../../components/finance/salary/SalaryTable';
import SalaryDetailsDrawer from '../../../components/finance/salary/SalaryDetailsDrawer';
import GenericSalaryFilters from '../../../components/finance/salary/GenericSalaryFilters';
import { 
  calculateAllSalaries,
  getMockSalaryData,
  getCurrentMonth
} from '../../../apis/finance/salary';
import type { SalaryDisplayAll, SalaryDisplay, SalaryBreakdown } from '../../../types/finance/salary';
import './SalaryManagementPage.css';

const SalaryManagementPage: React.FC = () => {
  const navigate = useNavigate();
  // State management
  const [salaryData, setSalaryData] = useState<SalaryDisplayAll | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [salaryBreakdown, setSalaryBreakdown] = useState<SalaryBreakdown | undefined>(undefined);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [isCalculating, setIsCalculating] = useState(false);

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
    sortBy: 'employeeName',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  // Filtered data state
  const [filteredEmployees, setFilteredEmployees] = useState<SalaryDisplay[]>([]);



  // Transform salary summary data to MetricData format
  const getSalaryMetrics = (): MetricData[] => {
    if (!salaryData) return [];
    
    const { summary } = salaryData;
    
    return [
      {
        title: 'Total Employees',
        value: summary.totalEmployees,
        change: 'Active employees',
        changeType: 'positive' as const,
        icon: '👥',
        subtitle: 'This month'
      },
      {
        title: 'Total Base Salary',
        value: `$${summary.totalBaseSalary.toLocaleString()}`,
        change: 'Base salary pool',
        changeType: 'positive' as const,
        icon: '💰',
        subtitle: 'Monthly base'
      },
      {
        title: 'Total Commission',
        value: `$${summary.totalCommission.toLocaleString()}`,
        change: 'Performance based',
        changeType: 'positive' as const,
        icon: '📈',
        subtitle: 'Earned this month'
      },
      {
        title: 'Total Bonus',
        value: `$${summary.totalBonus.toLocaleString()}`,
        change: 'Rewards & incentives',
        changeType: 'positive' as const,
        icon: '🎁',
        subtitle: 'Bonus payments'
      },
      {
        title: 'Total Deductions',
        value: `$${summary.totalDeductions.toLocaleString()}`,
        change: 'Attendance & penalties',
        changeType: 'negative' as const,
        icon: '📉',
        subtitle: 'This month'
      },
      {
        title: 'Final Salary Pool',
        value: `$${summary.totalFinalSalary.toLocaleString()}`,
        change: 'Net payable amount',
        changeType: 'positive' as const,
        icon: '✅',
        subtitle: 'Total to be paid'
      }
    ];
  };

  // Handlers
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleEmployeeClick = (employee: SalaryDisplay) => {
    setShowDetailsDrawer(true);
    
    // Create mock breakdown for the selected employee
    const mockBreakdown: SalaryBreakdown = {
      employee: {
        id: employee.employeeId,
        firstName: employee.employeeName.split(' ')[0],
        lastName: employee.employeeName.split(' ')[1] || '',
        email: `${employee.employeeName.toLowerCase().replace(' ', '.')}@company.com`,
        department: employee.department,
        status: 'active',
        startDate: '2023-01-01T00:00:00.000Z'
      },
      salary: {
        baseSalary: employee.baseSalary,
        commission: employee.commission,
        bonus: employee.bonus,
        netSalary: employee.netSalary,
        attendanceDeductions: employee.attendanceDeductions,
        chargebackDeduction: employee.chargebackDeduction,
        refundDeduction: employee.refundDeduction,
        deductions: employee.deductions,
        finalSalary: employee.finalSalary
      },
      month: employee.month,
      status: employee.status,
      paidOn: employee.paidOn,
      createdAt: employee.createdAt,
      commissionBreakdown: employee.commission > 0 ? [
        {
          projectId: 101,
          projectName: 'Website Redesign',
          clientName: 'ABC Corp',
          projectValue: employee.commission * 20,
          commissionRate: 5.0,
          commissionAmount: employee.commission,
          completedAt: '2025-01-15T00:00:00.000Z',
          status: 'completed' as const
        }
      ] : [],
      deductionBreakdown: {
        absentDeduction: employee.attendanceDeductions * 0.4,
        lateDeduction: employee.attendanceDeductions * 0.3,
        halfDayDeduction: employee.attendanceDeductions * 0.3,
        chargebackDeduction: employee.chargebackDeduction,
        refundDeduction: employee.refundDeduction,
        totalDeduction: employee.deductions
      }
    };
    
    setSalaryBreakdown(mockBreakdown);
  };

  const handleBulkSelect = (employeeIds: string[]) => {
    setSelectedEmployees(employeeIds);
  };

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
      sortBy: 'employeeName',
      sortOrder: 'asc'
    });
  }, []);

  // Apply filters to data
  const applyFilters = useCallback((employees: SalaryDisplay[], currentFilters: typeof filters, currentMonth: string) => {
    let filtered = employees;

    // Month filter
    if (currentMonth) {
      filtered = filtered.filter(emp => emp.month === currentMonth);
    }

    // Search filter
    if (currentFilters.search) {
      const searchTerm = currentFilters.search.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.employeeName.toLowerCase().includes(searchTerm) ||
        emp.department.toLowerCase().includes(searchTerm) ||
        emp.employeeId.toString().includes(searchTerm)
      );
    }

    // Department filter
    if (currentFilters.department) {
      filtered = filtered.filter(emp => emp.department === currentFilters.department);
    }

    // Status filter
    if (currentFilters.status) {
      filtered = filtered.filter(emp => emp.status === currentFilters.status);
    }

    // Salary range filters
    if (currentFilters.minSalary) {
      const minSalary = parseFloat(currentFilters.minSalary);
      if (!isNaN(minSalary)) {
        filtered = filtered.filter(emp => emp.finalSalary >= minSalary);
      }
    }

    if (currentFilters.maxSalary) {
      const maxSalary = parseFloat(currentFilters.maxSalary);
      if (!isNaN(maxSalary)) {
        filtered = filtered.filter(emp => emp.finalSalary <= maxSalary);
      }
    }

    // Date range filters
    if (currentFilters.fromDate) {
      const fromDate = new Date(currentFilters.fromDate);
      filtered = filtered.filter(emp => {
        if (!emp.paidOn) return false;
        return new Date(emp.paidOn) >= fromDate;
      });
    }

    if (currentFilters.toDate) {
      const toDate = new Date(currentFilters.toDate);
      filtered = filtered.filter(emp => {
        if (!emp.paidOn) return false;
        return new Date(emp.paidOn) <= toDate;
      });
    }

    // Created by filter
    if (currentFilters.createdBy) {
      const createdByTerm = currentFilters.createdBy.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.employeeName.toLowerCase().includes(createdByTerm) ||
        emp.employeeId.toString().includes(createdByTerm)
      );
    }

    return filtered;
  }, []);

  // Update filtered data when filters, salary data, or selected month changes
  useEffect(() => {
    if (salaryData) {
      const filtered = applyFilters(salaryData.employees, filters, selectedMonth);
      setFilteredEmployees(filtered);
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / prev.itemsPerPage),
        currentPage: 1 // Reset to first page when filters change
      }));
    }
  }, [salaryData, filters, selectedMonth, applyFilters]);


  const handleCalculateAllSalaries = async () => {
    try {
      setIsCalculating(true);
      await calculateAllSalaries();
      
      setNotification({ 
        type: 'success', 
        message: 'Salary calculation triggered for all employees!' 
      });
      
      // Refresh the data
      await fetchSalaryData();
    } catch (error) {
      console.error('Error calculating salaries:', error);
      setNotification({ 
        type: 'error', 
        message: 'Failed to calculate salaries' 
      });
    } finally {
      setIsCalculating(false);
    }
  };


  const fetchSalaryData = async () => {
    try {
      setIsLoading(true);
      
      // For now, use mock data
      // In a real app, you would call: await getAllSalariesDisplay(selectedMonth);
      const mockData = getMockSalaryData(selectedMonth);
      setSalaryData(mockData);
      
    } catch (error) {
      console.error('Error fetching salary data:', error);
      setNotification({ 
        type: 'error', 
        message: 'Failed to load salary data' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    fetchSalaryData();
  };


  const handleCloseDetailsDrawer = () => {
    setShowDetailsDrawer(false);
    setSalaryBreakdown(undefined);
  };

  // Load salary data on component mount
  useEffect(() => {
    fetchSalaryData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Salary Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage employee salaries, bonuses, and payroll processing
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCalculateAllSalaries}
                disabled={isCalculating}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {isCalculating ? 'Calculating...' : 'Calculate All Salaries'}
              </button>
              
              <button
                onClick={() => navigate('/finance/salary/calculator')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Salary Calculator
              </button>
              
              <button
                onClick={() => navigate('/finance/salary/bonus')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                Bonus Management
              </button>
            </div>
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

        {/* Key Metrics Summary */}
        {salaryData && (
          <div className="mb-8">
            <MetricGrid
              title=""
              metrics={getSalaryMetrics()}
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

        {/* Salary Table */}
        {salaryData && (
          <SalaryTable
            employees={filteredEmployees}
            isLoading={isLoading}
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            onEmployeeClick={handleEmployeeClick}
            onBulkSelect={handleBulkSelect}
            selectedEmployees={selectedEmployees}
          />
        )}

        {/* Salary Details Drawer */}
        <SalaryDetailsDrawer
          isOpen={showDetailsDrawer}
          onClose={handleCloseDetailsDrawer}
          salaryData={salaryBreakdown}
          loading={false}
        />
      </div>
    </div>
  );
};

export default SalaryManagementPage;
