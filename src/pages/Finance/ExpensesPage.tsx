import React, { useState, useCallback } from 'react';
import ExpensesTable from '../../components/expenses/ExpensesTable';
import GenericExpenseFilters from '../../components/expenses/GenericExpenseFilters';
import ExpenseDetailsDrawer from '../../components/expenses/ExpenseDetailsDrawer';
import AddExpenseDrawer from '../../components/expenses/AddExpenseDrawer';
import ExpensesStatistics from '../../components/expenses/ExpensesStatistics';
import { useExpenses, useExpensesStatistics } from '../../hooks/queries/useFinanceQueries';
import type { Expense } from '../../types';

interface ExpensesPageProps {
  onBack?: () => void;
}

const ExpensesPage: React.FC<ExpensesPageProps> = ({ onBack }) => {
  
  // State management
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showAddExpenseDrawer, setShowAddExpenseDrawer] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Filters (matching API query parameters)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    fromDate: '',
    toDate: '',
    createdBy: '',
    minAmount: '',
    maxAmount: '',
    paymentMethod: '',
    processedByRole: '',
    sortBy: 'paidOn',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // React Query hooks - Data fetching with automatic caching
  const expensesQuery = useExpenses(
    pagination.currentPage, 
    pagination.itemsPerPage, 
    filters
  );
  const statisticsQuery = useExpensesStatistics();

  // Extract data and loading states from queries
  const expenses = (expensesQuery.data as any)?.data || [];
  const statistics = (statisticsQuery.data as any)?.data || {
    totalExpenses: 0,
    totalAmount: 0,
    thisMonthAmount: 0,
    lastMonthAmount: 0,
    growthRate: 0,
    byCategory: {},
    byPaymentMethod: {},
    recentExpenses: []
  };
  const isLoading = expensesQuery.isLoading;

  // Update pagination when React Query data changes
  React.useEffect(() => {
    if ((expensesQuery.data as any)?.pagination) {
      setPagination(prev => ({
        ...prev,
        currentPage: (expensesQuery.data as any).pagination.page,
        totalPages: (expensesQuery.data as any).pagination.totalPages,
        totalItems: (expensesQuery.data as any).pagination.total,
      }));
    }
  }, [expensesQuery.data]);

  // Handlers
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
  };

  const handleBulkSelect = (expenseIds: string[]) => {
    setSelectedExpenses(expenseIds);
  };

  // Simplified filter handlers using generic system
  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      fromDate: '',
      toDate: '',
      createdBy: '',
      minAmount: '',
      maxAmount: '',
      paymentMethod: '',
      processedByRole: '',
      sortBy: 'paidOn',
      sortOrder: 'desc'
    });
  }, []);

  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Back Button */}
              {onBack && (
                <button
                  onClick={onBack}
                  className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                  <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Finance Overview
                </button>
              )}
              <h1 className="text-3xl font-bold text-gray-900">Expenses Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage and track expenses with advanced filtering and approval workflows
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
                {showStatistics ? 'Hide Stats' : 'Show Stats'}
              </button>
              <button
                onClick={() => setShowAddExpenseDrawer(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {showStatistics && (
          <div className="mb-8">
            <ExpensesStatistics statistics={statistics} isLoading={false} />
          </div>
        )}

        {/* Search Filters - NEW GENERIC SYSTEM */}
        <GenericExpenseFilters
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Expenses Table */}
        <ExpensesTable
          expenses={expenses}
          isLoading={isLoading}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onExpenseClick={handleExpenseClick}
          onBulkSelect={handleBulkSelect}
          selectedExpenses={selectedExpenses}
        />

        {/* Add Expense Drawer */}
        <AddExpenseDrawer
          isOpen={showAddExpenseDrawer}
          onClose={() => setShowAddExpenseDrawer(false)}
          onExpenseCreated={() => {
            // React Query will automatically refetch and update the UI
            setNotification({
              type: 'success',
              message: 'Expense created successfully!'
            });
            setTimeout(() => setNotification(null), 3000);
          }}
        />

        {/* Expense Details Drawer */}
        <ExpenseDetailsDrawer
          expense={selectedExpense}
          isOpen={!!selectedExpense}
          onClose={() => setSelectedExpense(null)}
          viewMode="full"
          onExpenseUpdated={(updatedExpense) => {
            // React Query will automatically refetch and update the UI
            setSelectedExpense(updatedExpense);
            setNotification({
              type: 'success',
              message: 'Expense updated successfully!'
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
                    onClick={handleCloseNotification}
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

export default ExpensesPage;

