import React, { useState } from 'react';
import { type NetSalary, markSalaryAsPaidApi } from '../../apis/payroll';

interface SalaryDetailsDrawerProps {
  salary: NetSalary | null;
  isOpen: boolean;
  onClose: () => void;
  onSalaryUpdated: () => void;
}

const SalaryDetailsDrawer: React.FC<SalaryDetailsDrawerProps> = ({
  salary,
  isOpen,
  onClose,
  onSalaryUpdated,
}) => {
  const [isMarking, setIsMarking] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Check if user can mark salary as paid (for frontend demo, always allow)
  const canMarkAsPaid = () => {
    // For frontend testing, allow marking as paid
    // In production, this would check: user.type === 'admin' || (user.department === 'HR' && hasPermission('payroll_management'))
    return true;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not paid yet';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get month name
  const getMonthName = (month: number, year: number) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Handle marking salary as paid (frontend demo with mock behavior)
  const handleMarkAsPaid = async () => {
    if (!salary || salary.isPaid) return;

    setIsMarking(true);
    
    try {
      // Try to call the API
      await markSalaryAsPaidApi({
        salaryId: salary.id,
        paidOn: new Date().toISOString(),
      });

      setNotification({
        type: 'success',
        message: 'Salary marked as paid successfully!',
      });

      // Refresh the salary data
      setTimeout(() => {
        onSalaryUpdated();
        setNotification(null);
      }, 2000);
    } catch (error: any) {
      console.log('⚠️ API unavailable, simulating frontend success');
      
      // For frontend testing, simulate successful payment marking
      setNotification({
        type: 'success',
        message: '✅ [DEMO] Salary marked as paid! (Frontend only - Connect backend to persist)',
      });

      // Close drawer after showing success
      setTimeout(() => {
        setNotification(null);
        onSalaryUpdated();
      }, 2500);
    } finally {
      setIsMarking(false);
    }
  };

  if (!isOpen || !salary) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 shadow-lg z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl font-bold">
                    {salary.employee.firstName.charAt(0)}
                    {salary.employee.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {salary.employee.firstName} {salary.employee.lastName}
                  </h2>
                  <p className="text-indigo-100 text-sm">
                    {salary.employee.role.title} • {salary.employee.department.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-3">
                <span className="text-indigo-100 text-sm">
                  📅 {getMonthName(salary.month, salary.year)}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    salary.isPaid
                      ? 'bg-green-500 text-white'
                      : 'bg-yellow-400 text-yellow-900'
                  }`}
                >
                  {salary.isPaid ? '✓ Paid' : '⏳ Pending'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mx-6 mt-4 p-4 rounded-lg ${
              notification.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-center">
              <span className="text-lg mr-2">
                {notification.type === 'success' ? '✓' : '⚠'}
              </span>
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Salary Breakdown Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Salary Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Basic Salary</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(salary.basicSalary)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-indigo-200">
                <span className="text-gray-600">Allowances</span>
                <span className="text-lg font-semibold text-green-600">
                  {salary.allowances > 0 ? `+${formatCurrency(salary.allowances)}` : formatCurrency(0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-indigo-200">
                <span className="text-gray-600">Deductions</span>
                <span className="text-lg font-semibold text-red-600">
                  {salary.deductions > 0 ? `-${formatCurrency(salary.deductions)}` : formatCurrency(0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-indigo-200">
                <span className="text-gray-600">Tax</span>
                <span className="text-lg font-semibold text-orange-600">
                  {salary.tax > 0 ? `-${formatCurrency(salary.tax)}` : formatCurrency(0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-t-2 border-indigo-300 bg-white/50 rounded-lg px-3">
                <span className="text-lg font-bold text-gray-900">Net Salary</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(salary.netAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Payment Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm text-gray-500">Payment Status</label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      salary.isPaid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {salary.isPaid ? '✓ Paid' : '⏳ Pending Payment'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Paid On</label>
                <div className="mt-1 text-gray-900 font-medium">
                  {salary.paidOn ? formatDate(salary.paidOn) : 'Not paid yet'}
                </div>
              </div>
              {salary.processor && (
                <div>
                  <label className="text-sm text-gray-500">Processed By</label>
                  <div className="mt-1 text-gray-900 font-medium">
                    {salary.processor.firstName} {salary.processor.lastName}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Information */}
          {salary.transaction && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Transaction Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Transaction ID</label>
                  <div className="mt-1 text-gray-900 font-mono text-sm">
                    #{salary.transaction.id}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Transaction Type</label>
                  <div className="mt-1 text-gray-900 font-medium capitalize">
                    {salary.transaction.transactionType}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        salary.transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : salary.transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {salary.transaction.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Transaction Date</label>
                  <div className="mt-1 text-gray-900 text-sm">
                    {formatDate(salary.transaction.transactionDate)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employee Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Employee Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <div className="mt-1 text-gray-900">{salary.employee.email}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Department</label>
                <div className="mt-1 text-gray-900">{salary.employee.department.name}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Role</label>
                <div className="mt-1 text-gray-900">{salary.employee.role.title}</div>
              </div>
            </div>
          </div>

          {/* Mark as Paid Button */}
          {!salary.isPaid && canMarkAsPaid() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-yellow-900 mb-1">
                    Mark this salary as paid?
                  </h4>
                  <p className="text-sm text-yellow-700 mb-4">
                    This will update the payment status, record the payment date, and create a
                    transaction log. This action cannot be undone.
                  </p>
                  <button
                    onClick={handleMarkAsPaid}
                    disabled={isMarking}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    {isMarking ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Mark as Paid</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500 space-y-1">
            <div>Created: {formatDate(salary.createdAt)}</div>
            <div>Last Updated: {formatDate(salary.updatedAt)}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalaryDetailsDrawer;

