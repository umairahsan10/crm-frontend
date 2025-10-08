import React, { useState, useEffect } from 'react';
import type { Liability } from '../../types';
// import { useAuth } from '../../context/AuthContext'; // Commented out - not currently used
import { useNavbar } from '../../context/NavbarContext';

interface LiabilityDetailsDrawerProps {
  liability: Liability | null;
  isOpen: boolean;
  onClose: () => void;
  onLiabilityUpdated?: (updatedLiability: Liability) => void;
  viewMode?: 'full' | 'details-only';
}

interface LiabilityComment {
  id: number;
  liabilityId: number;
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

interface PaymentHistoryItem {
  id: number;
  liabilityId: number;
  action: string;
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

const LiabilityDetailsDrawer: React.FC<LiabilityDetailsDrawerProps> = ({
  liability,
  isOpen,
  onClose,
  onLiabilityUpdated,
  viewMode = 'full'
}) => {
  // const { user } = useAuth(); // Commented out - not currently used
  const { isNavbarOpen } = useNavbar();
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'comments' | 'update'>('details');
  const [isMobile, setIsMobile] = useState(false);
  const [comments, setComments] = useState<LiabilityComment[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingLiabilityData, setIsLoadingLiabilityData] = useState(false);
  
  // Update liability form state
  const [updateForm, setUpdateForm] = useState({
    isPaid: false,
    paidOn: '',
    comment: '',
    notes: ''
  });

  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch complete liability details when drawer opens
  const fetchLiabilityDetails = async (liabilityId: string) => {
    try {
      setIsLoadingLiabilityData(true);
      
      // Mock data for now
      setComments([
        {
          id: 1,
          liabilityId: parseInt(liabilityId),
          commentBy: liability?.createdBy || 50,
          commentText: `Liability ${liability?.name} created`,
          createdAt: liability?.createdAt || new Date().toISOString(),
          updatedAt: liability?.updatedAt || new Date().toISOString(),
          employee: {
            id: liability?.employee?.id || 50,
            firstName: liability?.employee?.firstName || 'John',
            lastName: liability?.employee?.lastName || 'Doe',
            email: liability?.employee?.email || 'john@example.com'
          }
        }
      ]);
      
      setPaymentHistory([
        {
          id: 1,
          liabilityId: parseInt(liabilityId),
          action: liability?.isPaid ? 'paid' : 'created',
          changedBy: liability?.createdBy || 50,
          commentId: 1,
          createdAt: liability?.createdAt || new Date().toISOString(),
          changedByUser: {
            id: liability?.employee?.id || 50,
            firstName: liability?.employee?.firstName || 'John',
            lastName: liability?.employee?.lastName || 'Doe',
            email: liability?.employee?.email || 'john@example.com'
          },
          comment: {
            id: 1,
            commentText: `Liability ${liability?.isPaid ? 'paid' : 'created'}`,
            createdAt: liability?.createdAt || new Date().toISOString()
          }
        }
      ]);
    } catch (error) {
      console.error('❌ Error fetching liability details:', error);
      setComments([]);
      setPaymentHistory([]);
    } finally {
      setIsLoadingLiabilityData(false);
    }
  };

  // Populate forms when liability changes
  useEffect(() => {
    if (liability && isOpen) {
      setUpdateForm({
        isPaid: liability.isPaid,
        paidOn: liability.paidOn || '',
        comment: '',
        notes: ''
      });
      
      fetchLiabilityDetails(liability.id.toString());
    }
  }, [liability, isOpen]);

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

  const handleUpdateFormChange = (field: string, value: string | boolean) => {
    setUpdateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle payment status update
  const handlePaymentUpdate = async () => {
    if (!liability || !updateForm.comment.trim()) {
      setNotification({ type: 'error', message: 'Please provide a comment' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (updateForm.isPaid && !updateForm.paidOn) {
      setNotification({ type: 'error', message: 'Please select payment date' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      setIsUpdating(true);
      
      const updatedLiability: Liability = {
        ...liability,
        isPaid: updateForm.isPaid,
        paidOn: updateForm.isPaid ? updateForm.paidOn : null,
        updatedAt: new Date().toISOString()
      };

      if (onLiabilityUpdated) {
        onLiabilityUpdated(updatedLiability);
      }
      
      setUpdateForm({
        isPaid: updateForm.isPaid,
        paidOn: updateForm.paidOn,
        comment: '',
        notes: ''
      });
      
      await fetchLiabilityDetails(liability.id.toString());
      
      setNotification({ type: 'success', message: 'Liability updated successfully!' });
      setTimeout(() => setNotification(null), 3000);
      
      setActiveTab('timeline');
    } catch (error) {
      console.error('Error updating liability:', error);
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const getCategoryBadge = (category: string | null | undefined) => {
    if (!category) return null;

    const categoryClasses: Record<string, string> = {
      'Rent': 'bg-pink-100 text-pink-800',
      'Loan': 'bg-purple-100 text-purple-800',
      'Credit Card': 'bg-blue-100 text-blue-800',
      'Utilities': 'bg-cyan-100 text-cyan-800',
      'Salary': 'bg-orange-100 text-orange-800',
      'Vendor Payment': 'bg-indigo-100 text-indigo-800',
      'Tax': 'bg-red-100 text-red-800',
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

  const getStatusBadge = (isPaid: boolean, dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const isOverdue = !isPaid && due < today;

    if (isPaid) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          PAID
        </span>
      );
    } else if (isOverdue) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          OVERDUE
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          UNPAID
        </span>
      );
    }
  };

  if (!isOpen || !liability) return null;

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
          <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-red-700">
                    L
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Liability Details
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
                  className="py-4 px-1 border-b-2 font-medium text-sm border-red-500 text-red-600"
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
                        ? 'border-red-500 text-red-600'
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
                {/* Liability Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Liability Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <p className="text-lg text-gray-900 font-medium">{liability.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                      <p className="text-2xl text-red-600 font-bold">
                        ${liability.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <div className="mt-1">
                        {getCategoryBadge(liability.category)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {new Date(liability.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Is Paid</label>
                      <p className="text-lg font-semibold" style={{ color: liability.isPaid ? '#10b981' : '#ef4444' }}>
                        {liability.isPaid ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Paid On</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {liability.paidOn ? new Date(liability.paidOn).toLocaleDateString() : 'Not paid yet'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                      <div className="mt-1">
                        {getStatusBadge(liability.isPaid, liability.dueDate)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {liability.vendor?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Transaction Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Amount</label>
                      <p className="text-xl text-gray-900 font-semibold">
                        ${(liability.transaction?.amount || liability.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Status</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (liability.transaction?.status || 'pending') === 'completed' ? 'bg-green-100 text-green-800' :
                          (liability.transaction?.status || 'pending') === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          (liability.transaction?.status || 'pending') === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {(liability.transaction?.status || 'pending').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Additional Information
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {new Date(liability.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {new Date(liability.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {liability.employee 
                            ? `${liability.employee.firstName} ${liability.employee.lastName}`
                            : 'N/A'
                          }
                        </p>
                        {liability.employee?.email && (
                          <div className="text-sm text-gray-500 mt-1">
                            {liability.employee.email}
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
                    <svg className="h-5 w-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment History
                  </h3>
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {isLoadingLiabilityData ? (
                        <div className="text-center py-8">
                          <svg className="animate-spin mx-auto h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">Loading timeline...</p>
                        </div>
                      ) : paymentHistory.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="mt-2 text-sm">No payment history yet</p>
                        </div>
                      ) : (
                        paymentHistory.map((event, eventIdx) => (
                          <li key={event.id}>
                            <div className="relative pb-8">
                              {eventIdx !== paymentHistory.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                              ) : null}
                              <div className="relative flex space-x-4">
                                <div>
                                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                    event.action === 'paid' ? 'bg-green-500' : 'bg-red-500'
                                  }`}>
                                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div className="flex-1">
                                    <p className="text-base text-gray-900 font-medium">
                                      Action: <span className="font-semibold text-gray-900">{event.action.toUpperCase()}</span>
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
                    <svg className="h-5 w-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Comments & Notes
                  </h3>

                  <div className="space-y-4">
                    {isLoadingLiabilityData ? (
                      <div className="text-center py-8">
                        <svg className="animate-spin mx-auto h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24">
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
                              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-red-700">
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
                    <svg className="h-5 w-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Payment Status
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Update Payment Status
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>Mark liability as paid and provide payment date. Add a comment to explain the payment.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Status
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={updateForm.isPaid}
                            onChange={(e) => handleUpdateFormChange('isPaid', e.target.checked)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-5 w-5"
                          />
                          <span className="ml-2 text-sm text-gray-700">Mark as Paid</span>
                        </label>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Current status: {liability.isPaid ? 'Paid' : 'Unpaid'}
                      </p>
                    </div>

                    {/* Payment Date (conditional) */}
                    {updateForm.isPaid && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={updateForm.paidOn}
                          onChange={(e) => handleUpdateFormChange('paidOn', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Select the date when payment was made
                        </p>
                      </div>
                    )}

                    {/* Comment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={updateForm.comment}
                        onChange={(e) => handleUpdateFormChange('comment', e.target.value)}
                        rows={4}
                        placeholder="Add a comment explaining this update..."
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
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
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                      />
                    </div>

                    {/* Update Button */}
                    <div className="flex space-x-3">
                      <button
                        onClick={handlePaymentUpdate}
                        disabled={isUpdating || !updateForm.comment.trim()}
                        className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base transition-colors"
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
                          'Update Payment Status'
                        )}
                      </button>
                    </div>
                  </div>
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

export default LiabilityDetailsDrawer;

