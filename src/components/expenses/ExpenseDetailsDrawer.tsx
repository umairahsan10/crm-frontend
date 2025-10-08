import React, { useState, useEffect } from 'react';
import type { Expense } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNavbar } from '../../context/NavbarContext';
// import { getExpenseByIdApi, updateExpenseApi } from '../../apis/expenses'; // Uncomment when using real API

interface ExpenseDetailsDrawerProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onExpenseUpdated?: (updatedExpense: Expense) => void;
  viewMode?: 'full' | 'details-only';
}

interface ExpenseComment {
  id: number;
  expenseId: number;
  commentBy: number;
  commentText: string;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface StatusHistoryItem {
  id: number;
  expenseId: number;
  status: string;
  changedBy: number;
  commentId: number;
  createdAt: string;
  changedByUser: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  comment: {
    id: number;
    commentText: string;
    createdAt: string;
  };
}

const ExpenseDetailsDrawer: React.FC<ExpenseDetailsDrawerProps> = ({
  expense,
  isOpen,
  onClose,
  onExpenseUpdated,
  viewMode = 'full'
}) => {
  const { user } = useAuth();
  const { isNavbarOpen } = useNavbar();
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'comments' | 'update'>('details');
  const [isMobile, setIsMobile] = useState(false);
  const [comments, setComments] = useState<ExpenseComment[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingExpenseData, setIsLoadingExpenseData] = useState(false);
  
  // Update expense form state
  const [updateForm, setUpdateForm] = useState({
    transactionStatus: '' as 'completed' | 'pending' | 'failed' | 'cancelled' | '',
    comment: '',
    notes: ''
  });

  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch complete expense details when drawer opens
  const fetchExpenseDetails = async (expenseId: string) => {
    try {
      setIsLoadingExpenseData(true);
      console.log('🔄 Fetching complete expense details for ID:', expenseId);
      
      // Real API call - uncomment when backend is ready
      /*
      const response = await getExpenseByIdApi(expenseId);
      
      if (response.success && response.data) {
        const expenseData = response.data;
        console.log('✅ Complete expense data fetched:', expenseData);
        
        // Extract comments and history if available
        const expenseComments = (expenseData as any).comments || [];
        setComments(expenseComments);
        
        const history = (expenseData as any).statusHistory || [];
        setStatusHistory(history);
      }
      */
      
      // Mock data for now
      setComments([
        {
          id: 1,
          expenseId: parseInt(expenseId),
          commentBy: expense?.createdBy || 50,
          commentText: `Expense submitted for ${expense?.category || 'general'} payment`,
          createdAt: expense?.createdAt || new Date().toISOString(),
          updatedAt: expense?.updatedAt || new Date().toISOString(),
          employee: {
            id: expense?.employee?.id || 50,
            firstName: expense?.employee?.firstName || 'John',
            lastName: expense?.employee?.lastName || 'Doe',
            email: expense?.employee?.email || 'john@example.com'
          }
        }
      ]);
      
      setStatusHistory([
        {
          id: 1,
          expenseId: parseInt(expenseId),
          status: expense?.transaction?.status || 'completed',
          changedBy: expense?.createdBy || 50,
          commentId: 1,
          createdAt: expense?.createdAt || new Date().toISOString(),
          changedByUser: {
            id: expense?.employee?.id || 50,
            firstName: expense?.employee?.firstName || 'John',
            lastName: expense?.employee?.lastName || 'Doe',
            email: expense?.employee?.email || 'john@example.com'
          },
          comment: {
            id: 1,
            commentText: `Expense created with ${expense?.paymentMethod} payment method`,
            createdAt: expense?.createdAt || new Date().toISOString()
          }
        }
      ]);
    } catch (error) {
      console.error('❌ Error fetching expense details:', error);
      setComments([]);
      setStatusHistory([]);
    } finally {
      setIsLoadingExpenseData(false);
    }
  };

  // Populate forms when expense changes
  useEffect(() => {
    if (expense && isOpen) {
      console.log('🔍 ExpenseDetailsDrawer received expense:', expense);
      console.log('🔍 Expense Transaction:', expense.transaction);
      console.log('🔍 Expense Vendor:', expense.vendor);
      console.log('🔍 Expense Employee:', expense.employee);
      
      // Reset update form
      setUpdateForm({
        transactionStatus: '',
        comment: '',
        notes: ''
      });
      
      // Fetch complete expense details (including comments and timeline)
      fetchExpenseDetails(expense.id.toString());
    }
  }, [expense, isOpen]);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset state when drawer is closed
  useEffect(() => {
    if (!isOpen) {
      setNotification(null);
    }
  }, [isOpen]);

  const handleUpdateFormChange = (field: string, value: string) => {
    setUpdateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if expense can be updated
  const canUpdateStatus = expense?.transaction?.status === 'pending' || user?.role === 'admin';

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!expense || !updateForm.transactionStatus || !updateForm.comment.trim()) {
      setNotification({ type: 'error', message: 'Please select a status and provide a comment' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      setIsUpdating(true);
      
      const updateData = {
        transactionStatus: updateForm.transactionStatus,
        comment: updateForm.comment,
        notes: updateForm.notes
      };

      console.log('Updating expense transaction status:', {
        expenseId: expense.id,
        updateData: updateData
      });

      // Real API call - uncomment when backend is ready
      /*
      const response = await updateExpenseApi(expense.id.toString(), updateData);
      
      if (response.success && response.data) {
        if (onExpenseUpdated) {
          onExpenseUpdated(response.data);
        }
        
        // Refresh expense details
        await fetchExpenseDetails(expense.id.toString());
      }
      */
      
      // Mock success for now
      const updatedExpense: Expense = {
        ...expense,
        transaction: expense.transaction ? {
          ...expense.transaction,
          status: updateForm.transactionStatus
        } : {
          id: expense.transactionId,
          amount: expense.amount,
          transactionType: 'expense',
          status: updateForm.transactionStatus
        },
        updatedAt: new Date().toISOString()
      };

      if (onExpenseUpdated) {
        onExpenseUpdated(updatedExpense);
      }
      
      // Reset comment but keep status
      setUpdateForm({
        transactionStatus: updateForm.transactionStatus,
        comment: '',
        notes: ''
      });
      
      // Refresh expense details to get updated comments and timeline
      await fetchExpenseDetails(expense.id.toString());
      
      setNotification({ type: 'success', message: 'Transaction status updated successfully!' });
      setTimeout(() => setNotification(null), 3000);
      
      // Switch to timeline tab to show the new status
      setActiveTab('timeline');
    } catch (error) {
      console.error('Error updating status:', error);
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const getTransactionStatusBadge = (status: string | null | undefined) => {
    if (!status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          UNKNOWN
        </span>
      );
    }

    const statusClasses = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
      }`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getCategoryBadge = (category: string | null | undefined) => {
    if (!category) return null;

    const categoryClasses: Record<string, string> = {
      'Office Expenses': 'bg-blue-100 text-blue-800',
      'Salary': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-orange-100 text-orange-800',
      'Utilities': 'bg-cyan-100 text-cyan-800',
      'Travel': 'bg-indigo-100 text-indigo-800',
      'Equipment': 'bg-gray-100 text-gray-800',
      'Rent': 'bg-pink-100 text-pink-800',
      'Software': 'bg-green-100 text-green-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        categoryClasses[category] || 'bg-gray-100 text-gray-800'
      }`}>
        {category.toUpperCase()}
      </span>
    );
  };

  const getPaymentMethodBadge = (method: string | null | undefined) => {
    if (!method) return null;

    const methodClasses: Record<string, string> = {
      bank: 'bg-blue-100 text-blue-800',
      cash: 'bg-green-100 text-green-800',
      credit_card: 'bg-purple-100 text-purple-800',
      online: 'bg-indigo-100 text-indigo-800'
    };

    const methodLabels: Record<string, string> = {
      bank: 'BANK TRANSFER',
      cash: 'CASH',
      credit_card: 'CREDIT CARD',
      online: 'ONLINE'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        methodClasses[method] || 'bg-gray-100 text-gray-800'
      }`}>
        {methodLabels[method] || method.toUpperCase()}
      </span>
    );
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75" onClick={onClose}></div>
      
      <div 
        className="relative mx-auto h-full bg-white shadow-2xl rounded-lg border border-gray-200 transform transition-all duration-300 ease-out"
        style={{
          marginLeft: isMobile ? '0' : (isNavbarOpen ? '280px' : '100px'),
          width: isMobile ? '100vw' : (isNavbarOpen ? 'calc(100vw - 350px)' : 'calc(100vw - 150px)'),
          maxWidth: isMobile ? '100vw' : '1200px',
          marginRight: isMobile ? '0' : '50px',
          marginTop: isMobile ? '0' : '20px',
          marginBottom: isMobile ? '0' : '20px',
          height: isMobile ? '100vh' : 'calc(100vh - 40px)'
        }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">
                    E
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Expense Details
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className={`-mb-px flex space-x-8 ${isMobile ? 'px-4' : 'px-6'}`}>
              {viewMode === 'details-only' ? (
                <button
                  className="py-4 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600"
                >
                  Details
                </button>
              ) : (
                [
                  { id: 'details', name: 'Details' },
                  { id: 'timeline', name: 'Timeline' },
                  { id: 'comments', name: 'Comments' },
                  { id: 'update', name: 'Update' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))
              )}
            </nav>
          </div>

          {/* Content */}
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-4'}`}>
            {(viewMode === 'details-only' || activeTab === 'details') && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Expense Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <p className="text-lg text-gray-900 font-medium">{expense.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                      <p className="text-2xl text-red-600 font-bold">
                        ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <div className="mt-1">
                        {getCategoryBadge(expense.category)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                      <div className="mt-1">
                        {getPaymentMethodBadge(expense.paymentMethod)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Paid On</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {new Date(expense.paidOn).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {expense.vendor?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transaction & Status Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Transaction Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Status</label>
                      <div className="mt-1">
                        {getTransactionStatusBadge(expense.transaction?.status)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                      <p className="text-lg text-gray-900 font-medium capitalize">
                        {expense.transaction?.transactionType || 'expense'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Additional Information
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {new Date(expense.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {new Date(expense.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {expense.employee 
                            ? `${expense.employee.firstName} ${expense.employee.lastName}`
                            : 'N/A'
                          }
                        </p>
                        {expense.employee?.email && (
                          <div className="text-sm text-gray-500 mt-1">
                            {expense.employee.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'full' && activeTab === 'timeline' && (
              <div className="space-y-4">
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Activity Timeline
                  </h3>
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {isLoadingExpenseData ? (
                        <div className="text-center py-8">
                          <svg className="animate-spin mx-auto h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">Loading timeline...</p>
                        </div>
                      ) : statusHistory.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="mt-2 text-sm">No activity history yet</p>
                        </div>
                      ) : (
                        statusHistory.map((event, eventIdx) => (
                          <li key={event.id}>
                            <div className="relative pb-8">
                              {eventIdx !== statusHistory.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                              ) : null}
                              <div className="relative flex space-x-4">
                                <div>
                                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                    event.status === 'approved' ? 'bg-green-500' :
                                    event.status === 'rejected' ? 'bg-red-500' :
                                    event.status === 'pending' ? 'bg-yellow-500' :
                                    event.status === 'paid' ? 'bg-blue-500' :
                                    'bg-purple-500'
                                  }`}>
                                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div className="flex-1">
                                    <p className="text-base text-gray-900 font-medium">
                                      Status: <span className="font-semibold text-gray-900">{event.status.toUpperCase()}</span>
                                    </p>
                                    {event.comment && event.comment.commentText && (
                                      <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                        "{event.comment.commentText}"
                                      </p>
                                    )}
                                    <p className="mt-2 text-sm text-gray-500">
                                      by {event.changedByUser.firstName} {event.changedByUser.lastName}
                                    </p>
                                  </div>
                                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                    <time dateTime={event.createdAt}>
                                      {new Date(event.createdAt).toLocaleDateString()}
                                    </time>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(event.createdAt).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'full' && activeTab === 'comments' && (
              <div className="space-y-4">
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Comments & Notes
                  </h3>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {isLoadingExpenseData ? (
                      <div className="text-center py-8">
                        <svg className="animate-spin mx-auto h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">Loading comments...</p>
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="mt-2 text-sm">No comments yet</p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-700">
                                  {comment.employee.firstName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900">
                                  {comment.employee.firstName} {comment.employee.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{comment.commentText}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'full' && activeTab === 'update' && (
              <div className="space-y-4">
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Transaction Status
                  </h3>
                  
                  {!canUpdateStatus ? (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Cannot Update Status
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>Transaction status can only be updated by authorized users. Current status: <span className="font-semibold">{expense.transaction?.status || 'N/A'}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                              Update Transaction Status
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>Change the transaction status and add a comment to explain the change. Comments help maintain a clear audit trail.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Status Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Transaction Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={updateForm.transactionStatus}
                          onChange={(e) => handleUpdateFormChange('transactionStatus', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        >
                          <option value="">Select transaction status...</option>
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Current status: <span className="font-medium">{expense.transaction?.status || 'Unknown'}</span>
                        </p>
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comment <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={updateForm.comment}
                          onChange={(e) => handleUpdateFormChange('comment', e.target.value)}
                          rows={4}
                          placeholder="Add a comment explaining this status change..."
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Comments are required to maintain audit trail
                        </p>
                      </div>

                      {/* Additional Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional Notes (Optional)
                        </label>
                        <textarea
                          value={updateForm.notes}
                          onChange={(e) => handleUpdateFormChange('notes', e.target.value)}
                          rows={3}
                          placeholder="Add any additional notes or details..."
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        />
                      </div>

                      {/* Update Button */}
                      <div className="flex space-x-3">
                        <button
                          onClick={handleStatusUpdate}
                          disabled={isUpdating || !updateForm.transactionStatus || !updateForm.comment.trim()}
                          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base transition-colors"
                        >
                          {isUpdating ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Updating...
                            </span>
                          ) : (
                            'Update Transaction Status'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed ${isMobile ? 'bottom-4 left-4 right-4' : 'top-4 right-4'} z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
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
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
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

export default ExpenseDetailsDrawer;
