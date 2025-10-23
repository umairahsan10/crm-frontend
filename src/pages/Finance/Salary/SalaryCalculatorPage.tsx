import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  formatCurrency, 
  formatDate 
} from '../../../apis/finance/salary';
import type { SalaryPreview } from '../../../types/finance/salary';
import './SalaryCalculatorPage.css';

const SalaryCalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [previewData, setPreviewData] = useState<SalaryPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Mock employee data for autocomplete
  const mockEmployees = [
    { id: 1, name: 'John Doe', department: 'Sales' },
    { id: 2, name: 'Jane Smith', department: 'Marketing' },
    { id: 3, name: 'Mike Johnson', department: 'Sales' },
    { id: 4, name: 'Sarah Wilson', department: 'HR' },
    { id: 5, name: 'David Brown', department: 'Sales' }
  ];

  const handleCalculatePreview = async () => {
    if (!employeeId) {
      setNotification({ 
        type: 'error', 
        message: 'Please enter an employee ID' 
      });
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      
      // In a real app, you would call the API
      // const result = await getSalaryPreview(parseInt(employeeId), endDate);
      
      // Mock data for demonstration
      const mockPreview: SalaryPreview = {
        employee: {
          id: parseInt(employeeId),
          firstName: mockEmployees.find(emp => emp.id === parseInt(employeeId))?.name.split(' ')[0] || 'John',
          lastName: mockEmployees.find(emp => emp.id === parseInt(employeeId))?.name.split(' ')[1] || 'Doe',
          email: `${mockEmployees.find(emp => emp.id === parseInt(employeeId))?.name.toLowerCase().replace(' ', '.')}@company.com`,
          department: mockEmployees.find(emp => emp.id === parseInt(employeeId))?.department || 'Sales',
          status: 'active',
          startDate: '2023-01-01T00:00:00.000Z'
        },
        salary: {
          fullBaseSalary: 30000,
          proratedBaseSalary: 30000,
          employeeBonus: 500,
          salesBonus: 1000,
          totalBonus: 1500,
          commission: 2500,
          netSalary: 34000,
          deductions: 600,
          finalSalary: 33400
        },
        calculationPeriod: {
          startDay: 1,
          endDay: 31,
          daysWorked: 31,
          year: 2025,
          month: 1
        },
        deductionBreakdown: {
          absentDeduction: 200,
          lateDeduction: 150,
          halfDayDeduction: 100,
          chargebackDeduction: 100,
          refundDeduction: 50,
          totalDeduction: 600
        }
      };
      
      setPreviewData(mockPreview);
      setNotification({ 
        type: 'success', 
        message: 'Salary preview calculated successfully!' 
      });
      
    } catch (error) {
      console.error('Error calculating preview:', error);
      setIsError(true);
      setNotification({ 
        type: 'error', 
        message: 'Failed to calculate salary preview' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleClearForm = () => {
    setEmployeeId('');
    setEndDate('');
    setPreviewData(null);
    setIsError(false);
  };

  const getEmployeeSuggestions = (query: string) => {
    if (!query) return [];
    return mockEmployees.filter(emp => 
      emp.name.toLowerCase().includes(query.toLowerCase()) ||
      emp.id.toString().includes(query)
    );
  };

  return (
    <div className="salary-calculator-container">
      <div className="page-header">
        <h1>Salary Calculator</h1>
        <p>Calculate real-time salary preview for any employee</p>
        
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/finance/salary')}
          >
            ← Back to Salary Management
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

      <div className="calculator-content">
        {/* Calculator Form */}
        <div className="calculator-form">
          <div className="form-card">
            <h3>Employee Selection</h3>
            <div className="form-group">
              <label htmlFor="employeeId">Employee ID or Name</label>
              <input
                type="text"
                id="employeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter employee ID or search by name..."
                className="form-input"
                list="employeeSuggestions"
              />
              <datalist id="employeeSuggestions">
                {getEmployeeSuggestions(employeeId).map(emp => (
                  <option key={emp.id} value={`${emp.id} - ${emp.name}`} />
                ))}
              </datalist>
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">Calculate up to date (optional)</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input"
              />
              <small className="form-help">
                Leave empty to calculate up to current date
              </small>
            </div>
            
            <div className="form-actions">
              <button 
                className="btn btn-primary"
                onClick={handleCalculatePreview}
                disabled={isLoading || !employeeId}
              >
                {isLoading ? '⏳ Calculating...' : '🧮 Calculate Preview'}
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={handleClearForm}
                disabled={isLoading}
              >
                🗑️ Clear
              </button>
            </div>
          </div>
        </div>

        {/* Calculation Results */}
        {previewData && (
          <div className="calculation-results">
            {/* Employee Info Card */}
            <div className="employee-info-card">
              <div className="employee-avatar">
                {previewData.employee.firstName.charAt(0)}{previewData.employee.lastName.charAt(0)}
              </div>
              <div className="employee-details">
                <h3>{previewData.employee.firstName} {previewData.employee.lastName}</h3>
                <div className="employee-meta">
                  <span className="department-badge department-badge--{previewData.employee.department.toLowerCase()}">
                    {previewData.employee.department}
                  </span>
                  <span className="employee-status">Status: {previewData.employee.status}</span>
                  <span className="employee-start">Start Date: {formatDate(previewData.employee.startDate)}</span>
                </div>
              </div>
            </div>

            {/* Calculation Period */}
            <div className="period-card">
              <h4>Calculation Period</h4>
              <div className="period-details">
                <div className="period-item">
                  <span className="label">Start Day:</span>
                  <span className="value">{previewData.calculationPeriod.startDay}</span>
                </div>
                <div className="period-item">
                  <span className="label">End Day:</span>
                  <span className="value">{previewData.calculationPeriod.endDay}</span>
                </div>
                <div className="period-item">
                  <span className="label">Days Worked:</span>
                  <span className="value">{previewData.calculationPeriod.daysWorked}</span>
                </div>
                <div className="period-item">
                  <span className="label">Month/Year:</span>
                  <span className="value">{previewData.calculationPeriod.month}/{previewData.calculationPeriod.year}</span>
                </div>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="salary-breakdown-card">
              <h4>Salary Components</h4>
              <div className="breakdown-list">
                <div className="breakdown-item">
                  <span className="label">Full Base Salary</span>
                  <span className="value">{formatCurrency(previewData.salary.fullBaseSalary)}</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Prorated Base Salary</span>
                  <span className="value final">{formatCurrency(previewData.salary.proratedBaseSalary)}</span>
                </div>
                <div className="divider"></div>
                <div className="breakdown-item bonus">
                  <span className="label">+ Employee Bonus</span>
                  <span className="value">+{formatCurrency(previewData.salary.employeeBonus)}</span>
                </div>
                <div className="breakdown-item bonus">
                  <span className="label">+ Sales Bonus</span>
                  <span className="value">+{formatCurrency(previewData.salary.salesBonus)}</span>
                </div>
                <div className="breakdown-item commission">
                  <span className="label">+ Commission</span>
                  <span className="value">+{formatCurrency(previewData.salary.commission)}</span>
                </div>
                <div className="divider"></div>
                <div className="breakdown-item net-salary">
                  <span className="label">Net Salary</span>
                  <span className="value">{formatCurrency(previewData.salary.netSalary)}</span>
                </div>
                <div className="divider"></div>
                <div className="breakdown-item deductions">
                  <span className="label">Total Deductions</span>
                  <span className="value">-{formatCurrency(previewData.salary.deductions)}</span>
                </div>
                <div className="divider"></div>
                <div className="breakdown-item final-salary">
                  <span className="label">Final Salary</span>
                  <span className="value">{formatCurrency(previewData.salary.finalSalary)}</span>
                </div>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div className="deductions-card">
              <h4>Deduction Details</h4>
              <div className="deductions-list">
                <div className="deduction-item">
                  <span className="label">Absent Days</span>
                  <span className="value">{formatCurrency(previewData.deductionBreakdown.absentDeduction)}</span>
                </div>
                <div className="deduction-item">
                  <span className="label">Late Days</span>
                  <span className="value">{formatCurrency(previewData.deductionBreakdown.lateDeduction)}</span>
                </div>
                <div className="deduction-item">
                  <span className="label">Half Days</span>
                  <span className="value">{formatCurrency(previewData.deductionBreakdown.halfDayDeduction)}</span>
                </div>
                <div className="deduction-item">
                  <span className="label">Chargeback</span>
                  <span className="value">{formatCurrency(previewData.deductionBreakdown.chargebackDeduction)}</span>
                </div>
                <div className="deduction-item">
                  <span className="label">Refund</span>
                  <span className="value">{formatCurrency(previewData.deductionBreakdown.refundDeduction)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Calculating salary preview...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Calculation Failed</h3>
            <p>Unable to calculate salary preview. Please check the employee ID and try again.</p>
            <button 
              className="btn btn-primary"
              onClick={handleClearForm}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryCalculatorPage;
