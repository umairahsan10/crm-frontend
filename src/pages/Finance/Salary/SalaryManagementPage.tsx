import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SalaryStatisticsCards from '../../../components/finance/salary/SalaryStatisticsCards';
import SalaryTable from '../../../components/finance/salary/SalaryTable';
import SalaryDetailsDrawer from '../../../components/finance/salary/SalaryDetailsDrawer';
import { 
  getAllSalariesDisplay, 
  getSalaryBreakdown, 
  calculateAllSalaries,
  getMockSalaryData,
  getCurrentMonth,
  getMonthOptions,
  formatCurrency
} from '../../../apis/finance/salary';
import type { SalaryDisplayAll, SalaryDisplay, SalaryBreakdown } from '../../../types/finance/salary';
import './SalaryManagementPage.css';

const SalaryManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [salaryData, setSalaryData] = useState<SalaryDisplayAll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedEmployee, setSelectedEmployee] = useState<SalaryDisplay | null>(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [salaryBreakdown, setSalaryBreakdown] = useState<SalaryBreakdown | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const monthOptions = getMonthOptions();

  const handleEmployeeViewDetails = async (employee: SalaryDisplay) => {
    try {
      setSelectedEmployee(employee);
      setShowDetailsDrawer(true);
      
      // In a real app, you would fetch the breakdown from the API
      // For now, we'll create a mock breakdown
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
    } catch (error) {
      console.error('Error fetching salary breakdown:', error);
      setNotification({ 
        type: 'error', 
        message: 'Failed to load salary details' 
      });
    }
  };

  const handleMarkAsPaid = async (employeeId: number) => {
    try {
      // In a real app, you would call the API to mark as paid
      console.log('Marking employee as paid:', employeeId);
      
      setNotification({ 
        type: 'success', 
        message: 'Employee marked as paid successfully!' 
      });
      
      // Refresh the data
      await fetchSalaryData();
    } catch (error) {
      console.error('Error marking as paid:', error);
      setNotification({ 
        type: 'error', 
        message: 'Failed to mark employee as paid' 
      });
    }
  };

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

  const handleExportSalaries = () => {
    // In a real app, you would implement export functionality
    console.log('Exporting salaries...');
    setNotification({ 
      type: 'success', 
      message: 'Salary data exported successfully!' 
    });
  };

  const fetchSalaryData = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      // For now, use mock data
      // In a real app, you would call: await getAllSalariesDisplay(selectedMonth);
      const mockData = getMockSalaryData();
      setSalaryData(mockData);
      
    } catch (error) {
      console.error('Error fetching salary data:', error);
      setIsError(true);
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

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleCloseDetailsDrawer = () => {
    setShowDetailsDrawer(false);
    setSelectedEmployee(null);
    setSalaryBreakdown(null);
  };

  // Load salary data on component mount
  useEffect(() => {
    fetchSalaryData();
  }, []);

  return (
    <div className="salary-management-container">
      <div className="page-header">
        <h1>Salary Management</h1>
        <p>Manage employee salaries, bonuses, and payroll processing</p>
        
        <div className="header-actions">
          <select 
            className="month-selector"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
          >
            {monthOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <button 
            className="btn btn-secondary"
            onClick={handleCalculateAllSalaries}
            disabled={isCalculating}
          >
            {isCalculating ? '⏳ Calculating...' : '🧮 Calculate All Salaries'}
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={handleExportSalaries}
          >
            📊 Export to Excel
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/finance/salary/calculator')}
          >
            🧮 Salary Calculator
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/finance/salary/bonus')}
          >
            🏆 Bonus Management
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification notification--${notification.type}`}>
          <span>{notification.message}</span>
          <button 
            className="notification-close"
            onClick={handleCloseNotification}
          >
            ×
          </button>
        </div>
      )}

      {/* Salary Statistics */}
      {salaryData && (
        <SalaryStatisticsCards 
          summary={salaryData.summary}
          loading={isLoading}
        />
      )}

      {/* Salary Table */}
      <div className="salary-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading salary data...</p>
          </div>
        ) : isError ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Failed to load salary data</h3>
            <p>There was an error loading the salary data from the server.</p>
            <button 
              className="btn btn-primary"
              onClick={fetchSalaryData}
            >
              Try Again
            </button>
          </div>
        ) : salaryData && salaryData.employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <h3>No salary data for this month</h3>
            <p>No salary records found for the selected month.</p>
            <button 
              className="btn btn-primary"
              onClick={handleCalculateAllSalaries}
            >
              Calculate Salaries
            </button>
          </div>
        ) : salaryData ? (
          <div className="salary-list">
            <div className="salary-header">
              <div className="salary-title">
                <h3>Employee Salaries</h3>
                <p className="salary-count">
                  Showing {salaryData.employees.length} employees for {monthOptions.find(m => m.value === selectedMonth)?.label}
                </p>
              </div>
              <button 
                className="btn btn-secondary"
                onClick={fetchSalaryData}
                title="Refresh salary data"
              >
                🔄 Refresh
              </button>
            </div>
            
            <SalaryTable
              employees={salaryData.employees}
              onViewDetails={handleEmployeeViewDetails}
              onMarkPaid={handleMarkAsPaid}
              loading={isLoading}
            />
          </div>
        ) : null}
      </div>

      {/* Salary Details Drawer */}
      <SalaryDetailsDrawer
        isOpen={showDetailsDrawer}
        onClose={handleCloseDetailsDrawer}
        salaryData={salaryBreakdown}
        loading={false}
      />
    </div>
  );
};

export default SalaryManagementPage;
