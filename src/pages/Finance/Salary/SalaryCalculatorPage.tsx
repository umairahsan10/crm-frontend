import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import type { MetricData } from '../../../types/dashboard';
import { 
  formatCurrency, 
  formatDate,
  getSalaryPreview
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
      setPreviewData(null);
      
      // Extract employee ID if user entered "ID - Name" format
      const empIdMatch = employeeId.match(/^(\d+)/);
      const empId = empIdMatch ? parseInt(empIdMatch[1]) : parseInt(employeeId);
      
      if (isNaN(empId)) {
        setNotification({ 
          type: 'error', 
          message: 'Please enter a valid employee ID' 
        });
        setIsLoading(false);
        return;
      }
      
      // Call the preview API
      const result = await getSalaryPreview(empId, endDate || undefined);
      
      setPreviewData(result);
      setNotification({ 
        type: 'success', 
        message: 'Salary preview calculated successfully!' 
      });
      
    } catch (error: any) {
      console.error('Error calculating preview:', error);
      setIsError(true);
      const errorMessage = error?.message || 'Failed to calculate salary preview. Please check the employee ID and try again.';
      setNotification({ 
        type: 'error', 
        message: errorMessage
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

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);


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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Salary
                </button>
                <button
                  onClick={handleClearForm}
                  disabled={isLoading}
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
              Enter employee details to calculate salary preview
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID or Name
                </label>
                <input
                  type="text"
                  id="employeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter employee ID (e.g., 37)"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
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
                disabled={isLoading}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
              <button 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                onClick={handleCalculatePreview}
                disabled={isLoading || !employeeId}
              >
                {isLoading ? (
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
        {isLoading && (
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
        {isError && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Calculation Failed</h3>
              <p className="mt-1 text-sm text-gray-500">Unable to calculate salary preview. Please check the employee ID and try again.</p>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Day</label>
                    <p className="text-lg text-gray-900 font-medium">{previewData.calculationPeriod.startDay}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Day</label>
                    <p className="text-lg text-gray-900 font-medium">{previewData.calculationPeriod.endDay}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Days Worked</label>
                    <p className="text-lg text-gray-900 font-medium">{previewData.calculationPeriod.daysWorked}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month/Year</label>
                    <p className="text-lg text-gray-900 font-medium">{previewData.calculationPeriod.month}/{previewData.calculationPeriod.year}</p>
                  </div>
                </div>
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
                  <div className="flex justify-between items-center py-2 border-t-2 border-green-200 bg-green-50 px-4 py-3 rounded-lg">
                    <span className="text-xl font-bold text-green-900">Final Salary</span>
                    <span className="text-2xl text-green-600 font-bold">{formatCurrency(previewData.salary.finalSalary)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Deduction Details</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Absent Days', value: previewData.deductionBreakdown.absentDeduction },
                    { label: 'Late Days', value: previewData.deductionBreakdown.lateDeduction },
                    { label: 'Half Days', value: previewData.deductionBreakdown.halfDayDeduction },
                    { label: 'Chargeback', value: previewData.deductionBreakdown.chargebackDeduction },
                    { label: 'Refund', value: previewData.deductionBreakdown.refundDeduction },
                    { label: 'Total Deductions', value: previewData.deductionBreakdown.totalDeduction, highlight: true }
                  ].map((item, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      item.highlight ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{item.label}</label>
                      <p className={`text-lg font-semibold ${
                        item.highlight ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {item.highlight ? '-' : ''}{formatCurrency(item.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryCalculatorPage;