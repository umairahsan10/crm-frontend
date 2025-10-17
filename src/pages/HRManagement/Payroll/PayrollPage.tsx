/**
 * Payroll Page - Optimized with React Query
 * Follows EXACT same structure as LeadsManagementPage
 */

import React, { useState, useCallback } from 'react';
import PayrollTable from '../../../components/payroll/PayrollTable';
import SalaryDetailsDrawer from '../../../components/payroll/SalaryDetailsDrawer';
import DataStatistics from '../../../components/common/Statistics/DataStatistics';
import GenericPayrollFilters from '../../../components/payroll/GenericPayrollFilters';
import { usePayroll, usePayrollStatistics } from '../../../hooks/queries/useFinanceQueries';
import { useDepartments } from '../../../hooks/queries/useHRQueries';
import { type NetSalary } from '../../../apis/payroll';

interface PayrollPageProps {
  onBack?: () => void;
}

const PayrollPage: React.FC<PayrollPageProps> = ({ onBack }) => {
  
  // State management
  const [selectedSalary, setSelectedSalary] = useState<NetSalary | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
    month: '',
    year: '',
    departmentId: '',
    isPaid: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC' as 'ASC' | 'DESC'
  });

  // React Query hooks - Data fetching with automatic caching
  const payrollQuery = usePayroll(
    pagination.currentPage,
    pagination.itemsPerPage,
    {
      month: filters.month ? parseInt(filters.month) : undefined,
      year: filters.year ? parseInt(filters.year) : undefined,
      departmentId: filters.departmentId ? parseInt(filters.departmentId) : undefined,
      isPaid: filters.isPaid ? filters.isPaid === 'true' : undefined,
      search: filters.search || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    }
  );
  const statisticsQuery = usePayrollStatistics();
  const departmentsQuery = useDepartments();

  // Extract data and loading states from queries
  const salaries = (payrollQuery.data as any)?.data || [];
  const statistics = (statisticsQuery.data as any)?.data || {
    totalSalaries: 0,
    totalPaid: 0,
    totalPending: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    byDepartment: {},
    thisMonth: { total: 0, paid: 0, pending: 0 }
  };
  const departments = (departmentsQuery.data as any)?.departments || [];
  const isLoading = payrollQuery.isLoading;

  // Update pagination when React Query data changes
  React.useEffect(() => {
    if (payrollQuery.data) {
      const data = payrollQuery.data as any;
      setPagination(prev => ({
        ...prev,
        currentPage: data.page || prev.currentPage,
        totalPages: Math.ceil((data.total || 0) / pagination.itemsPerPage),
        totalItems: data.total || 0,
      }));
    }
  }, [payrollQuery.data, pagination.itemsPerPage]);

  // Handlers
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSalaryClick = (salary: NetSalary) => {
    setSelectedSalary(salary);
    setDrawerOpen(true);
  };

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 on filter change
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      month: '',
      year: '',
      departmentId: '',
      isPaid: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);


  // Statistics cards
  const statisticsCards = [
    {
      title: 'Total Salaries',
      value: statistics.totalSalaries,
      color: 'blue' as const,
      icon: (<svg fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" /></svg>)
    },
    {
      title: 'Paid',
      value: statistics.totalPaid,
      color: 'green' as const,
      icon: (<svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>)
    },
    {
      title: 'Pending',
      value: statistics.totalPending,
      color: 'yellow' as const,
      icon: (<svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>)
    },
    {
      title: 'Total Amount',
      value: `$${statistics.totalAmount.toLocaleString()}`,
      color: 'purple' as const,
      icon: (<svg fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" /></svg>)
    },
    {
      title: 'Paid Amount',
      value: `$${statistics.paidAmount.toLocaleString()}`,
      color: 'green' as const,
      icon: (<svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>)
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
          <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage employee salaries and payment records
            </p>
          </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
              </button>
          {onBack && (
            <button
              onClick={onBack}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
                  Back
            </button>
          )}
            </div>
        </div>
      </div>

        {/* Statistics Dashboard */}
        {showStatistics && (
          <div className="mb-8">
            <DataStatistics
              title="Payroll Statistics"
              cards={statisticsCards}
              loading={statisticsQuery.isLoading}
            />
        </div>
      )}

      {/* Filters */}
        <div className="mb-6">
          <GenericPayrollFilters
            onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
            departments={departments}
      />
        </div>

        {/* Payroll Table */}
        <PayrollTable
          salaries={salaries}
          isLoading={isLoading}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onRowClick={handleSalaryClick}
        />

      {/* Salary Details Drawer */}
      <SalaryDetailsDrawer
        salary={selectedSalary}
        isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedSalary(null);
          }}
          onSalaryUpdated={() => {
            setNotification({
              type: 'success',
              message: 'Salary updated successfully!'
            });
            setTimeout(() => setNotification(null), 3000);
          }}
        />

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
            notification.type === 'success' ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'
          }`}>
            <div className="p-4">
              <div className="flex items-start">
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
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className={`text-sm font-medium ${
                    notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={() => setNotification(null)}
                    className={`bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      notification.type === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'
                    }`}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollPage;
