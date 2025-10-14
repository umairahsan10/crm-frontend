import React, { useState, useEffect } from 'react';
import type { Revenue } from '../../types';
import { updateRevenueApi, getRevenueByIdApi } from '../../apis/revenue';
import { useNavbar } from '../../context/NavbarContext';

interface RevenueDetailsDrawerProps {
  revenue: Revenue | null;
  isOpen: boolean;
  onClose: () => void;
  onRevenueUpdated?: (updatedRevenue: Revenue) => void;
  viewMode?: 'full' | 'details-only';
}

const RevenueDetailsDrawer: React.FC<RevenueDetailsDrawerProps> = ({
  revenue,
  isOpen,
  onClose,
  onRevenueUpdated,
  viewMode = 'full'
}) => {
  const { isNavbarOpen } = useNavbar();
  const [activeTab, setActiveTab] = useState<'details' | 'update'>('details');
  const [isMobile, setIsMobile] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingRevenueData, setIsLoadingRevenueData] = useState(false);
  
  // Store complete revenue data with lead/invoice details
  const [completeRevenueData, setCompleteRevenueData] = useState<Revenue | null>(null);
  
  // Update revenue form state
  const [updateForm, setUpdateForm] = useState({
    source: '',
    category: '',
    amount: '',
    receivedOn: '',
    paymentMethod: '' as 'cash' | 'bank' | 'online' | '',
    receivedFrom: '',
    relatedInvoiceId: ''
  });

  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch complete revenue details when drawer opens
  const fetchRevenueDetails = async (revenueId: string) => {
    try {
      setIsLoadingRevenueData(true);
      console.log('🔄 Fetching complete revenue details for ID:', revenueId);
      
      const response = await getRevenueByIdApi(revenueId);
      console.log('🔍 fetchRevenueDetails - Response received:', response);
      
      if (response.success && response.data) {
        console.log('✅ Complete revenue data fetched:', response.data);
        console.log('👤 Lead data:', response.data.lead);
        console.log('📄 Invoice data:', response.data.invoice);
        // Store the complete revenue data with lead/invoice details
        setCompleteRevenueData(response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching revenue details:', error);
    } finally {
      setIsLoadingRevenueData(false);
      console.log('✅ fetchRevenueDetails completed');
    }
  };

  // Populate forms when revenue changes
  useEffect(() => {
    if (revenue && isOpen) {
      console.log('🔍 RevenueDetailsDrawer received revenue:', revenue);
      
      // Initialize with the prop revenue first
      setCompleteRevenueData(revenue);
      
      // Reset update form with null checks
      setUpdateForm({
        source: revenue.source || '',
        category: revenue.category || '',
        amount: revenue.amount ? revenue.amount.toString() : '',
        receivedOn: revenue.receivedOn ? revenue.receivedOn.split('T')[0] : '',
        paymentMethod: (revenue.paymentMethod as 'cash' | 'bank' | 'online') || '',
        receivedFrom: revenue.receivedFrom ? revenue.receivedFrom.toString() : '',
        relatedInvoiceId: revenue.relatedInvoiceId ? revenue.relatedInvoiceId.toString() : ''
      });
      
      // Fetch complete revenue details only if revenue.id exists
      if (revenue.id) {
        fetchRevenueDetails(revenue.id.toString());
      }
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

  // Handle revenue update
  const handleUpdateRevenue = async () => {
    if (!revenue || !updateForm.source.trim()) {
      setNotification({ type: 'error', message: 'Please enter revenue source' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (!updateForm.category.trim()) {
      setNotification({ type: 'error', message: 'Please enter category' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    const newAmount = parseFloat(updateForm.amount);
    if (isNaN(newAmount) || newAmount <= 0) {
      setNotification({ type: 'error', message: 'Please enter a valid amount greater than 0' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      setIsUpdating(true);
      
      const updateData: any = {
        source: updateForm.source.trim(),
        category: updateForm.category.trim(),
        amount: newAmount
      };

      // Add optional fields if provided
      if (updateForm.receivedOn) {
        updateData.receivedOn = updateForm.receivedOn;
      }
      if (updateForm.paymentMethod) {
        updateData.paymentMethod = updateForm.paymentMethod;
      }
      if (updateForm.receivedFrom) {
        const leadId = parseInt(updateForm.receivedFrom);
        if (!isNaN(leadId) && leadId > 0) {
          updateData.receivedFrom = leadId;
        }
      }
      if (updateForm.relatedInvoiceId) {
        const invoiceId = parseInt(updateForm.relatedInvoiceId);
        if (!isNaN(invoiceId) && invoiceId > 0) {
          updateData.relatedInvoiceId = invoiceId;
        }
      }

      console.log('Updating revenue:', {
        revenueId: revenue.id,
        updateData: updateData
      });

      const response = await updateRevenueApi(revenue.id, updateData);
      console.log('✅ Update response:', response);
      
      if (response.success && response.data) {
        console.log('📦 Updated revenue data from update API:', response.data);
        console.log('👤 Lead in update response:', response.data.lead);
        console.log('📄 Invoice in update response:', response.data.invoice);
        
        // Refetch complete revenue details with lead/invoice information
        const detailsResponse = await getRevenueByIdApi(revenue.id.toString());
        console.log('📦 Refetched revenue data:', detailsResponse.data);
        console.log('👤 Lead in refetch response:', detailsResponse.data?.lead);
        console.log('📄 Invoice in refetch response:', detailsResponse.data?.invoice);
        
        if (detailsResponse.success && detailsResponse.data) {
          // Update both parent component and local state with complete revenue data including lead/invoice
          console.log('✅ Updating parent and local state with complete revenue data');
          setCompleteRevenueData(detailsResponse.data);
          onRevenueUpdated?.(detailsResponse.data);
        } else {
          // Fallback to update response data
          console.log('⚠️ Using fallback update response data');
          setCompleteRevenueData(response.data);
          onRevenueUpdated?.(response.data);
        }
        
        setNotification({ type: 'success', message: 'Revenue updated successfully!' });
        setTimeout(() => setNotification(null), 3000);
        
        // Switch to details tab
        setActiveTab('details');
      }
    } catch (error) {
      console.error('Error updating revenue:', error);
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
    if (!category) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          UNKNOWN
        </span>
      );
    }

    const categoryClasses: Record<string, string> = {
      'Product Sales': 'bg-blue-100 text-blue-800',
      'Service Revenue': 'bg-green-100 text-green-800',
      'Consulting': 'bg-purple-100 text-purple-800',
      'Subscription': 'bg-indigo-100 text-indigo-800',
      'License': 'bg-cyan-100 text-cyan-800',
      'Commission': 'bg-orange-100 text-orange-800',
      'Miscellaneous': 'bg-gray-100 text-gray-800',
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
    if (!method) return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        N/A
      </span>
    );

    const methodClasses: Record<string, string> = {
      bank: 'bg-blue-100 text-blue-800',
      cash: 'bg-green-100 text-green-800',
      online: 'bg-indigo-100 text-indigo-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        methodClasses[method] || 'bg-gray-100 text-gray-800'
      }`}>
        {method.toUpperCase()}
      </span>
    );
  };

  if (!isOpen || !revenue) return null;

  // Use completeRevenueData if available (has lead/invoice info), otherwise fall back to revenue prop
  const displayRevenue = completeRevenueData || revenue;

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
          <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg`}>
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
                  { id: 'update', name: 'Update' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as 'details' | 'update');
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
            {isLoadingRevenueData && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <svg className="animate-spin h-10 w-10 mx-auto text-green-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-3 text-sm text-gray-600">Loading complete revenue details...</p>
                </div>
              </div>
            )}
            
            {!isLoadingRevenueData && (viewMode === 'details-only' || activeTab === 'details') && (
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                      <p className="text-lg text-gray-900 font-medium">{displayRevenue.source}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <div className="mt-1">
                        {getCategoryBadge(displayRevenue.category)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                      <p className="text-xl text-green-600 font-bold">
                        ${displayRevenue.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                      <div className="mt-1">
                        {getPaymentMethodBadge(displayRevenue.paymentMethod)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Received On</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {new Date(displayRevenue.receivedOn).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lead</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {displayRevenue.lead?.companyName || 'N/A'}
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
                          {new Date(displayRevenue.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {new Date(displayRevenue.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {displayRevenue.employee 
                            ? `${displayRevenue.employee.firstName} ${displayRevenue.employee.lastName}`
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Invoice</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {displayRevenue.invoice ? `#${displayRevenue.invoice.id}` : 'N/A'}
                        </p>
                      </div>
                    </div>
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
                    Update Revenue
                  </h3>
                  
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
                            Update Revenue Information
                          </h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>Update revenue details. All fields are optional - only changed values will be updated.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <form className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Source <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={updateForm.source}
                          onChange={(e) => handleUpdateFormChange('source', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter revenue source"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={updateForm.category}
                          onChange={(e) => handleUpdateFormChange('category', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter category (e.g., Product Sales, Service Revenue)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            value={updateForm.amount}
                            onChange={(e) => handleUpdateFormChange('amount', e.target.value)}
                            className="block w-full pl-7 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Received On
                        </label>
                        <input
                          type="date"
                          value={updateForm.receivedOn}
                          onChange={(e) => handleUpdateFormChange('receivedOn', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method
                        </label>
                        <select
                          value={updateForm.paymentMethod}
                          onChange={(e) => handleUpdateFormChange('paymentMethod', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Select payment method (optional)</option>
                          <option value="cash">Cash</option>
                          <option value="bank">Bank</option>
                          <option value="online">Online</option>
                        </select>
                      </div>

                      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setActiveTab('details')}
                          className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateRevenue}
                          disabled={isUpdating || !updateForm.source.trim() || !updateForm.category.trim()}
                          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdating ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Updating...
                            </>
                          ) : (
                            'Update Revenue'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div 
            className={`
              fixed top-5 right-5 px-5 py-4 rounded-lg text-white font-medium z-[1100]
              flex items-center gap-3 min-w-[300px] shadow-lg
              ${notification.type === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : 'bg-gradient-to-r from-red-500 to-red-600'
              }
            `}
          >
            <span className="flex-1">{notification.message}</span>
            <button 
              className="bg-transparent border-none text-white text-xl cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-white/20"
              onClick={() => setNotification(null)}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueDetailsDrawer;
