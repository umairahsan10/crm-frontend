import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SalaryStatisticsCards from '../../../components/finance/salary/SalaryStatisticsCards';
import SalaryTable from '../../../components/finance/salary/SalaryTable';
import SalaryDetailsDrawer from '../../../components/finance/salary/SalaryDetailsDrawer';
import GenericSalaryFilters from '../../../components/finance/salary/GenericSalaryFilters';
import { 
  calculateAllSalaries,
  getMockSalaryData,
  getCurrentMonth,
  getMonthOptions
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


  const monthOptions = getMonthOptions();

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

  // Simplified filter handlers using generic system
  const handleFiltersChange = useCallback((newFilters: any) => {
    // Handle filter changes
    console.log('Filters changed:', newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    // Handle clear filters
    console.log('Filters cleared');
  }, []);


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
      const mockData = getMockSalaryData();
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
              <div className="month-selector">
                <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-1">Select Month:</label>
                <select 
                  id="month-select"
                  value={selectedMonth} 
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  {monthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
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

        {/* Statistics Panel */}
        {salaryData && (
          <div className="mb-8">
            <SalaryStatisticsCards 
              summary={salaryData.summary}
              loading={isLoading}
            />
          </div>
        )}

        {/* Filters */}
        <GenericSalaryFilters
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Salary Table */}
        {salaryData && (
          <SalaryTable
            employees={salaryData.employees}
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
