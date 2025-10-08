import React, { useState, useEffect } from 'react';
import type { Revenue } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNavbar } from '../../context/NavbarContext';

interface RevenueDetailsDrawerProps {
  revenue: Revenue | null;
  isOpen: boolean;
  onClose: () => void;
  onRevenueUpdated?: (updatedRevenue: Revenue) => void;
  viewMode?: 'full' | 'details-only';
}

interface RevenueComment {
  id: number;
  revenueId: number;
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
  revenueId: number;
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

const RevenueDetailsDrawer: React.FC<RevenueDetailsDrawerProps> = ({
  revenue,
  isOpen,
  onClose,
  onRevenueUpdated,
  viewMode = 'full'
}) => {
  const { user } = useAuth();
  const { isNavbarOpen } = useNavbar();
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'comments' | 'update'>('details');
  const [isMobile, setIsMobile] = useState(false);
  const [comments, setComments] = useState<RevenueComment[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingRevenueData, setIsLoadingRevenueData] = useState(false);
  
  // Update revenue form state
  const [updateForm, setUpdateForm] = useState({
    transactionStatus: '' as 'completed' | 'pending' | 'failed' | 'cancelled' | '',
    comment: '',
    notes: ''
  });

  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch complete revenue details when drawer opens
  const fetchRevenueDetails = async (revenueId: string) => {
    try {
      setIsLoadingRevenueData(true);
      console.log('🔄 Fetching complete revenue details for ID:', revenueId);
      
      // Mock data for now
      setComments([
        {
          id: 1,
          revenueId: parseInt(revenueId),
          commentBy: revenue?.createdBy || 50,
          commentText: `Revenue from ${revenue?.source || 'payment'} recorded`,
          createdAt: revenue?.createdAt || new Date().toISOString(),
          updatedAt: revenue?.updatedAt || new Date().toISOString(),
          employee: {
            id: revenue?.employee?.id || 50,
            firstName: revenue?.employee?.firstName || 'John',
            lastName: revenue?.employee?.lastName || 'Doe',
            email: revenue?.employee?.email || 'john@example.com'
          }
        }
      ]);
      
      setStatusHistory([
        {
          id: 1,
          revenueId: parseInt(revenueId),
          status: revenue?.transaction?.status || 'completed',
          changedBy: revenue?.createdBy || 50,
          commentId: 1,
          createdAt: revenue?.createdAt || new Date().toISOString(),
          changedByUser: {
            id: revenue?.employee?.id || 50,
            firstName: revenue?.employee?.firstName || 'John',
            lastName: revenue?.employee?.lastName || 'Doe',
            email: revenue?.employee?.email || 'john@example.com'
          },
          comment: {
            id: 1,
            commentText: `Revenue received via ${revenue?.paymentMethod}`,
            createdAt: revenue?.createdAt || new Date().toISOString()
          }
        }
      ]);
    } catch (error) {
      console.error('❌ Error fetching revenue details:', error);
      setComments([]);
      setStatusHistory([]);
    } finally {
      setIsLoadingRevenueData(false);
    }
  };

  // Populate forms when revenue changes
  useEffect(() => {
    if (revenue && isOpen) {
      console.log('🔍 RevenueDetailsDrawer received revenue:', revenue);
      
      // Reset update form
      setUpdateForm({
        transactionStatus: '',
        comment: '',
        notes: ''
      });
      
      // Fetch complete revenue details
      fetchRevenueDetails(revenue.id.toString());
    }
  }, [revenue, isOpen]);

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

  // Check if revenue can be updated
  const canUpdateStatus = revenue?.transaction?.status === 'pending' || user?.role === 'admin';

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!revenue || !updateForm.transactionStatus || !updateForm.comment.trim()) {
      setNotification({ type: 'error', message: 'Please select a status and provide a comment' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      setIsUpdating(true);
      
      const updatedRevenue: Revenue = {
        ...revenue,
        transaction: revenue.transaction ? {
          ...revenue.transaction,
          status: updateForm.transactionStatus
        } : {
          id: revenue.transactionId,
          amount: revenue.amount,
          transactionType: 'income',
          status: updateForm.transactionStatus
        },
        updatedAt: new Date().toISOString()
      };

      if (onRevenueUpdated) {
        onRevenueUpdated(updatedRevenue);
      }
      
      setUpdateForm({
        transactionStatus: updateForm.transactionStatus,
        comment: '',
        notes: ''
      });
      
      await fetchRevenueDetails(revenue.id.toString());
      
      setNotification({ type: 'success', message: 'Transaction status updated successfully!' });
      setTimeout(() => setNotification(null), 3000);
      
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
      'Software Development': 'bg-blue-100 text-blue-800',
      'Consulting': 'bg-purple-100 text-purple-800',
      'Product Sales': 'bg-green-100 text-green-800',
      'Subscription': 'bg-indigo-100 text-indigo-800',
      'Support': 'bg-cyan-100 text-cyan-800',
      'Training': 'bg-orange-100 text-orange-800',
      'License': 'bg-pink-100 text-pink-800',
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

  if (!isOpen || !revenue) return null;

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
          <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-green-700">
                    R
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Revenue Details
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
                  className="py-4 px-1 border-b-2 font-medium text-sm border-green-500 text-green-600"
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
                        ? 'border-green-500 text-green-600'
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
                {/* Revenue Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Revenue Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                      <p className="text-lg text-gray-900 font-medium">{revenue.source}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                      <p className="text-2xl text-green-600 font-bold">
                        ${revenue.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <div className="mt-1">
                        {getCategoryBadge(revenue.category)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                      <div className="mt-1">
                        {getPaymentMethodBadge(revenue.paymentMethod)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Received On</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {new Date(revenue.receivedOn).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {revenue.lead?.companyName || 'N/A'}
                      </p>
                    </div>
                    {revenue.invoice && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Notes</label>
                        <p className="text-sm text-gray-700">
                          {revenue.invoice.notes || 'No notes'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transaction Details */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Transaction Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Status</label>
                      <div className="mt-1">
                        {getTransactionStatusBadge(revenue.transaction?.status)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                      <p className="text-lg text-gray-900 font-medium capitalize">
                        {revenue.transaction?.transactionType || 'income'}
                      </p>
                    </div>
                    {revenue.invoice && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Amount</label>
                        <p className="text-lg text-green-600 font-semibold">
                          ${revenue.invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
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
                          {new Date(revenue.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {new Date(revenue.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {revenue.employee 
                            ? `${revenue.employee.firstName} ${revenue.employee.lastName}`
                            : 'N/A'
                          }
                        </p>
                        {revenue.employee?.email && (
                          <div className="text-sm text-gray-500 mt-1">
                            {revenue.employee.email}
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
                      {isLoadingRevenueData ? (
                        <div className="text-center py-8">
                          <svg className="animate-spin mx-auto h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24">
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
                                    event.status === 'completed' ? 'bg-green-500' :
                                    event.status === 'failed' ? 'bg-red-500' :
                                    event.status === 'pending' ? 'bg-yellow-500' :
                                    event.status === 'cancelled' ? 'bg-gray-500' :
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
                    {isLoadingRevenueData ? (
                      <div className="text-center py-8">
                        <svg className="animate-spin mx-auto h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24">
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
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-green-700">
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
                            <p>Transaction status can only be updated by authorized users. Current status: <span className="font-semibold">{revenue.transaction?.status || 'N/A'}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">
                              Update Transaction Status
                            </h3>
                            <div className="mt-2 text-sm text-green-700">
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
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                        >
                          <option value="">Select transaction status...</option>
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Current status: <span className="font-medium">{revenue.transaction?.status || 'Unknown'}</span>
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
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
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
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                        />
                      </div>

                      {/* Update Button */}
                      <div className="flex space-x-3">
                        <button
                          onClick={handleStatusUpdate}
                          disabled={isUpdating || !updateForm.transactionStatus || !updateForm.comment.trim()}
                          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base transition-colors"
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

export default RevenueDetailsDrawer;

