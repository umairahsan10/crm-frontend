import React, { useState, useEffect } from 'react';
import ExpensesTable from '../../components/expenses/ExpensesTable';
import LeadsSearchFilters from '../../components/leads/LeadsSearchFilters';
import { regularExpensesConfig } from '../../components/expenses/filterConfigs';
import ExpenseDetailsDrawer from '../../components/expenses/ExpenseDetailsDrawer';
import ExpensesStatistics from '../../components/expenses/ExpensesStatistics';
// import { getExpensesApi } from '../../apis/expenses'; // Uncomment when using real API
import type { Expense } from '../../types';

interface ExpensesPageProps {
  onBack?: () => void;
}

const ExpensesPage: React.FC<ExpensesPageProps> = ({ onBack }) => {
  
  // State management
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [showStatistics, setShowStatistics] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Expenses state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
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
    sortBy: 'paidOn',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Data state
  const [statistics, setStatistics] = useState({
    totalExpenses: 0,
    pendingExpenses: 0,
    approvedExpenses: 0,
    rejectedExpenses: 0,
    totalAmount: '0',
    approvalRate: '0%',
    byStatus: {
      pending: 0,
      approved: 0,
      rejected: 0,
      paid: 0
    },
    byCategory: {
      salary: 0,
      office: 0,
      marketing: 0,
      utilities: 0,
      travel: 0,
      equipment: 0,
      other: 0
    },
    today: {
      new: 0,
      approved: 0,
      rejected: 0
    }
  });

  // Mock data generation (matching API structure)
  const generateMockExpenses = (): Expense[] => {
    const categories = ['Office Expenses', 'Salary', 'Marketing', 'Utilities', 'Travel', 'Equipment', 'Rent', 'Software', 'Other'];
    const paymentMethods = ['bank', 'cash', 'credit_card', 'online'];
    const transactionStatuses = ['completed', 'pending', 'failed'];
    const vendors = [
      { id: 1, name: 'ABC Company' },
      { id: 2, name: 'XYZ Suppliers' },
      { id: 3, name: 'Tech Solutions Inc' },
      { id: 4, name: 'Office Depot' },
      { id: 5, name: 'Marketing Agency Pro' }
    ];
    const employees = [
      { id: 50, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      { id: 51, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
      { id: 52, firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com' },
      { id: 53, firstName: 'Sarah', lastName: 'Williams', email: 'sarah@example.com' }
    ];
    
    const mockExpenses: Expense[] = [];

    for (let i = 1; i <= 50; i++) {
      const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
      const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
      const randomStatus = transactionStatuses[Math.floor(Math.random() * transactionStatuses.length)];
      const amount = Math.floor(Math.random() * 10000) + 100;
      const paidDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
      
      mockExpenses.push({
        id: i,
        title: `${categories[Math.floor(Math.random() * categories.length)]} - Item ${i}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        amount: amount,
        paidOn: paidDate.toISOString(),
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        vendorId: randomVendor.id,
        createdBy: randomEmployee.id,
        transactionId: 20 + i,
        createdAt: paidDate.toISOString(),
        updatedAt: paidDate.toISOString(),
        transaction: {
          id: 20 + i,
          amount: amount,
          transactionType: 'expense',
          status: randomStatus
        },
        vendor: randomVendor,
        employee: randomEmployee
      });
    }

    return mockExpenses;
  };

  // Fetch expenses
  const fetchExpenses = async (page: number = 1) => {
    try {
      setIsLoading(true);
      
      // Using mock data for now - uncomment below to use real API
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockData = generateMockExpenses();
      
      // Apply filters to mock data
      let filteredData = mockData;
      if (filters.category) {
        filteredData = filteredData.filter(e => e.category === filters.category);
      }
      if (filters.paymentMethod) {
        filteredData = filteredData.filter(e => e.paymentMethod === filters.paymentMethod);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(e => 
          e.title.toLowerCase().includes(searchLower) ||
          e.category.toLowerCase().includes(searchLower) ||
          e.vendor?.name.toLowerCase().includes(searchLower)
        );
      }
      if (filters.minAmount) {
        filteredData = filteredData.filter(e => e.amount >= parseFloat(filters.minAmount));
      }
      if (filters.maxAmount) {
        filteredData = filteredData.filter(e => e.amount <= parseFloat(filters.maxAmount));
      }
      
      setExpenses(filteredData.slice(0, 20)); // Show first 20
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(filteredData.length / 20),
        totalItems: filteredData.length,
        itemsPerPage: 20
      });

      // Real API call - uncomment when ready
      /*
      const response = await getExpensesApi(page, pagination.itemsPerPage, {
        category: filters.category,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        createdBy: filters.createdBy,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount,
        paymentMethod: filters.paymentMethod,
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });
      
      if (response.success && response.data) {
        setExpenses(response.data);
        
        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.page,
            totalPages: response.pagination.totalPages,
            totalItems: response.pagination.total,
            itemsPerPage: pagination.itemsPerPage
          });
        }
      }
      */
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load expenses'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setStatistics({
        totalExpenses: 150,
        pendingExpenses: 45,
        approvedExpenses: 80,
        rejectedExpenses: 25,
        totalAmount: '456,789.00',
        approvalRate: '76.2%',
        byStatus: {
          pending: 45,
          approved: 80,
          rejected: 20,
          paid: 5
        },
        byCategory: {
          salary: 60,
          office: 30,
          marketing: 25,
          utilities: 15,
          travel: 10,
          equipment: 5,
          other: 5
        },
        today: {
          new: 8,
          approved: 12,
          rejected: 3
        }
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchExpenses();
    fetchStatistics();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchExpenses(1);
  }, [filters]);

  // Handlers
  const handlePageChange = (page: number) => {
    fetchExpenses(page);
  };

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
  };

  const handleBulkSelect = (expenseIds: string[]) => {
    setSelectedExpenses(expenseIds);
  };

  // Filter handlers (matching API query parameters)
  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handlePaymentMethodFilter = (paymentMethod: string) => {
    setFilters(prev => ({ ...prev, paymentMethod }));
  };

  const handleCreatedByFilter = (createdBy: string) => {
    setFilters(prev => ({ ...prev, createdBy }));
  };

  const handleDateRangeFilter = (fromDate: string, toDate: string) => {
    setFilters(prev => ({ ...prev, fromDate, toDate }));
  };

  const handleMinAmountFilter = (minAmount: string) => {
    setFilters(prev => ({ ...prev, minAmount }));
  };

  const handleMaxAmountFilter = (maxAmount: string) => {
    setFilters(prev => ({ ...prev, maxAmount }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      fromDate: '',
      toDate: '',
      createdBy: '',
      minAmount: '',
      maxAmount: '',
      paymentMethod: '',
      sortBy: 'paidOn',
      sortOrder: 'desc'
    });
  };

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

        {/* Search Filters */}
        <LeadsSearchFilters
          config={regularExpensesConfig}
          onSearch={handleSearch}
          onTypeFilter={handleCategoryFilter}
          onStatusFilter={handlePaymentMethodFilter}
          onAssignedToFilter={handleCreatedByFilter}
          onDateRangeFilter={handleDateRangeFilter}
          onMinAmountFilter={handleMinAmountFilter}
          onMaxAmountFilter={handleMaxAmountFilter}
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

        {/* Expense Details Drawer */}
        <ExpenseDetailsDrawer
          expense={selectedExpense}
          isOpen={!!selectedExpense}
          onClose={() => setSelectedExpense(null)}
          viewMode="full"
          onExpenseUpdated={(updatedExpense) => {
            // Update the expenses array
            setExpenses(prev => prev.map(expense => 
              expense.id === updatedExpense.id ? updatedExpense : expense
            ));
            
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

