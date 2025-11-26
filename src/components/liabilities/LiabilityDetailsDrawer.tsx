import React, { useState, useEffect } from 'react';
import type { Liability } from '../../types';
import { updateLiabilityApi, getLiabilityByIdApi, markLiabilityAsPaidApi } from '../../apis/liabilities';
import { getVendorsApi, createVendorApi, type Vendor, type CreateVendorRequest } from '../../apis/vendors';
import { useNavbar } from '../../context/NavbarContext';

interface LiabilityDetailsDrawerProps {
  liability: Liability | null;
  isOpen: boolean;
  onClose: () => void;
  onLiabilityUpdated?: (updatedLiability: Liability) => void;
  viewMode?: 'full' | 'details-only';
}

const LiabilityDetailsDrawer: React.FC<LiabilityDetailsDrawerProps> = ({
  liability,
  isOpen,
  onClose,
  onLiabilityUpdated,
  viewMode = 'full'
}) => {
  const { isNavbarOpen } = useNavbar();
  const [activeTab, setActiveTab] = useState<'details' | 'update'>('details');
  const [isMobile, setIsMobile] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isLoadingLiabilityData, setIsLoadingLiabilityData] = useState(false);
  
  // Store complete liability data with vendor details
  const [completeLiabilityData, setCompleteLiabilityData] = useState<Liability | null>(null);
  
  // Update liability form state
  const [updateForm, setUpdateForm] = useState({
    name: '',
    category: '',
    amount: '',
    dueDate: '',
    relatedVendorId: ''
  });

  // Vendor management state
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [showCreateVendorModal, setShowCreateVendorModal] = useState(false);
  const [newVendorForm, setNewVendorForm] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    bank_account: '',
    status: 'active',
    notes: ''
  });
  const [isCreatingVendor, setIsCreatingVendor] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch complete liability details when drawer opens
  const fetchLiabilityDetails = async (liabilityId: string) => {
    try {
      setIsLoadingLiabilityData(true);
      console.log('🔄 Fetching complete liability details for ID:', liabilityId);
      
      const response = await getLiabilityByIdApi(liabilityId);
      console.log('🔍 fetchLiabilityDetails - Response received:', response);
      
      if (response.success && response.data) {
        console.log('✅ Complete liability data fetched:', response.data);
        console.log('🏢 Vendor data:', response.data.vendor);
        // Store the complete liability data with vendor details
        setCompleteLiabilityData(response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching liability details:', error);
    } finally {
      setIsLoadingLiabilityData(false);
      console.log('✅ fetchLiabilityDetails completed');
    }
  };

  // Populate forms when liability changes
  useEffect(() => {
    if (liability && isOpen) {
      console.log('🔍 LiabilityDetailsDrawer received liability:', liability);
      
      // Initialize with the prop liability first
      setCompleteLiabilityData(liability);
      
      // Reset update form with null checks
      setUpdateForm({
        name: liability.name || '',
        category: liability.category || '',
        amount: liability.amount ? liability.amount.toString() : '',
        dueDate: liability.dueDate ? liability.dueDate.split('T')[0] : '',
        relatedVendorId: liability.relatedVendorId ? liability.relatedVendorId.toString() : ''
      });
      
      // Fetch complete liability details only if liability.id exists
      if (liability.id) {
      fetchLiabilityDetails(liability.id.toString());
      }
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
      setShowCreateVendorModal(false);
    }
  }, [isOpen]);

  // Load vendors when update tab opens
  useEffect(() => {
    if (activeTab === 'update' && vendors.length === 0) {
      loadVendors();
    }
  }, [activeTab]);

  const loadVendors = async () => {
    try {
      setIsLoadingVendors(true);
      const response = await getVendorsApi();
      
      if (response.success && response.data) {
        setVendors(response.data);
        console.log('Vendors loaded:', response.data);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
      setNotification({ 
        type: 'error', 
        message: 'Failed to load vendors. You can still enter vendor ID manually.' 
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsLoadingVendors(false);
    }
  };

  const handleUpdateFormChange = (field: string, value: string) => {
    setUpdateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle create new vendor
  const handleCreateVendor = async () => {
    if (!newVendorForm.name.trim()) {
      setNotification({ type: 'error', message: 'Vendor name is required' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Email validation if provided
    if (newVendorForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newVendorForm.email)) {
      setNotification({ type: 'error', message: 'Please provide a valid email address' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      setIsCreatingVendor(true);

      const vendorData: CreateVendorRequest = {
        name: newVendorForm.name.trim(),
        contact_person: newVendorForm.contact_person.trim() || undefined,
        email: newVendorForm.email.trim() || undefined,
        phone: newVendorForm.phone.trim() || undefined,
        address: newVendorForm.address.trim() || undefined,
        city: newVendorForm.city.trim() || undefined,
        country: newVendorForm.country.trim() || undefined,
        bank_account: newVendorForm.bank_account.trim() || undefined,
        status: newVendorForm.status || 'active',
        notes: newVendorForm.notes.trim() || undefined
      };

      const response = await createVendorApi(vendorData);

      if (response.success && response.data) {
        // Add new vendor to list
        setVendors(prev => [...prev, response.data!]);
        
        // Auto-select the new vendor
        setUpdateForm(prev => ({ ...prev, relatedVendorId: response.data!.id.toString() }));
        
        // Close create modal and reset form
        setShowCreateVendorModal(false);
        setNewVendorForm({
          name: '',
          contact_person: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          country: '',
          bank_account: '',
          status: 'active',
          notes: ''
        });

        setNotification({ type: 'success', message: `Vendor "${response.data.name}" created successfully!` });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to create vendor' 
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsCreatingVendor(false);
    }
  };

  // Handle liability update
  const handleUpdateLiability = async () => {
    if (!liability || !updateForm.name.trim()) {
      setNotification({ type: 'error', message: 'Please enter liability name' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (!updateForm.category) {
      setNotification({ type: 'error', message: 'Please enter a category' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    const newAmount = parseFloat(updateForm.amount);
    if (isNaN(newAmount) || newAmount <= 0) {
      setNotification({ type: 'error', message: 'Please enter a valid amount greater than 0' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Validate due date is in the future
    if (updateForm.dueDate) {
      const dueDate = new Date(updateForm.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate <= today) {
        setNotification({ type: 'error', message: 'Due date must be in the future' });
        setTimeout(() => setNotification(null), 5000);
        return;
      }
    }

    try {
      setIsUpdating(true);
      
      const updateData: any = {
        name: updateForm.name,
        category: updateForm.category,
        amount: newAmount,
        dueDate: updateForm.dueDate || undefined
      };

      // Only include relatedVendorId if it's provided and valid
      if (updateForm.relatedVendorId && !isNaN(parseInt(updateForm.relatedVendorId))) {
        updateData.relatedVendorId = parseInt(updateForm.relatedVendorId);
      }

      console.log('Updating liability:', {
        liabilityId: liability.id,
        updateData: updateData
      });

      const response = await updateLiabilityApi(liability.id, updateData);
      console.log('✅ Update response:', response);
      
      if (response.success && response.data) {
        console.log('📦 Updated liability data from update API:', response.data);
        console.log('🏢 Vendor in update response:', response.data.vendor);
        
        // Refetch complete liability details with vendor information
        const detailsResponse = await getLiabilityByIdApi(liability.id.toString());
        console.log('📦 Refetched liability data:', detailsResponse.data);
        console.log('🏢 Vendor in refetch response:', detailsResponse.data?.vendor);
        
        if (detailsResponse.success && detailsResponse.data) {
          // Update both parent component and local state with complete liability data including vendor
          console.log('✅ Updating parent and local state with complete liability data');
          setCompleteLiabilityData(detailsResponse.data);
          onLiabilityUpdated?.(detailsResponse.data);
        } else {
          // Fallback to update response data
          console.log('⚠️ Using fallback update response data');
          setCompleteLiabilityData(response.data);
          onLiabilityUpdated?.(response.data);
        }
      
      setNotification({ type: 'success', message: 'Liability updated successfully!' });
      setTimeout(() => setNotification(null), 3000);
      
        // Switch to details tab
        setActiveTab('details');
      }
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

  // Handle mark as paid
  const handleMarkAsPaid = async () => {
    if (!liability) return;

    if (window.confirm('Are you sure you want to mark this liability as paid? This will:\n\n1. Mark the liability as paid\n2. Update transaction to completed\n3. Automatically create an expense record\n\nThis action cannot be undone.')) {
      try {
        setIsMarkingPaid(true);
        
        const response = await markLiabilityAsPaidApi(liability.id, liability.transactionId);
        console.log('✅ Mark as paid response:', response);
        
        if (response.success && response.data) {
          setNotification({ 
            type: 'success', 
            message: 'Liability marked as paid! Expense record created automatically.' 
          });
          
          // Update parent component with the updated liability
          if (onLiabilityUpdated && response.data.liability) {
            onLiabilityUpdated(response.data.liability);
          }
          
          // Refetch to get updated data
          await fetchLiabilityDetails(liability.id.toString());
          
          setTimeout(() => setNotification(null), 5000);
        }
      } catch (error) {
        console.error('Error marking as paid:', error);
        setNotification({ 
          type: 'error', 
          message: error instanceof Error ? error.message : 'Failed to mark as paid' 
        });
        setTimeout(() => setNotification(null), 5000);
      } finally {
        setIsMarkingPaid(false);
      }
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
      'Loan': 'bg-red-100 text-red-800',
      'Credit': 'bg-orange-100 text-orange-800',
      'Payable': 'bg-yellow-100 text-yellow-800',
      'Tax': 'bg-purple-100 text-purple-800',
      'Rent': 'bg-blue-100 text-blue-800',
      'Utilities': 'bg-cyan-100 text-cyan-800',
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

  const getPaymentStatusBadge = (isPaid: boolean) => {
      return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {isPaid ? 'PAID' : 'UNPAID'}
        </span>
      );
  };

  if (!isOpen || !liability) return null;

  // Use completeLiabilityData if available (has vendor info), otherwise fall back to liability prop
  const displayLiability = completeLiabilityData || liability;
  const isPaid = displayLiability.isPaid;
  const canUpdate = !isPaid && displayLiability.transaction?.status !== 'completed';

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
                  { id: 'update', name: 'Update' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as 'details' | 'update');
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
            {isLoadingLiabilityData && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <svg className="animate-spin h-10 w-10 mx-auto text-red-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-3 text-sm text-gray-600">Loading complete liability details...</p>
                </div>
              </div>
            )}
            
            {!isLoadingLiabilityData && (viewMode === 'details-only' || activeTab === 'details') && (
              <div className="space-y-6">
                {/* Mark as Paid Button */}
                {!isPaid && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Payment Action</h4>
                        <p className="text-xs text-gray-600">
                          Mark this liability as paid. This will update the transaction, and automatically create an expense record.
                        </p>
                      </div>
                      <button
                        onClick={handleMarkAsPaid}
                        disabled={isMarkingPaid}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ml-4"
                      >
                        {isMarkingPaid ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Mark as Paid
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Liability Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Liability Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <p className="text-lg text-gray-900 font-medium">{displayLiability.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <div className="mt-1">
                        {getCategoryBadge(displayLiability.category)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                      <p className="text-xl text-red-600 font-bold">
                        ${displayLiability.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                      <div className="mt-1">
                        {getPaymentStatusBadge(displayLiability.isPaid)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {new Date(displayLiability.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    {displayLiability.paidOn && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Paid On</label>
                        <p className="text-lg text-green-600 font-medium">
                          {new Date(displayLiability.paidOn).toLocaleDateString()}
                      </p>
                    </div>
                    )}
                  </div>
                </div>

                {/* Transaction Information */}
                {displayLiability.transaction && (
                  <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Transaction Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          displayLiability.transaction.transactionType === 'expense' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {displayLiability.transaction.transactionType?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          displayLiability.transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : displayLiability.transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {displayLiability.transaction.status?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Amount</label>
                        <p className="text-lg text-gray-900 font-medium">
                          ${displayLiability.transaction.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
                        </p>
                      </div>
                      {displayLiability.transaction.paymentMethod && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            displayLiability.transaction.paymentMethod === 'bank' 
                              ? 'bg-blue-100 text-blue-800' 
                              : displayLiability.transaction.paymentMethod === 'cash'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {displayLiability.transaction.paymentMethod.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {displayLiability.transaction.transactionDate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Date</label>
                          <p className="text-lg text-gray-900 font-medium">
                            {new Date(displayLiability.transaction.transactionDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {displayLiability.transaction.notes && (
                        <div className="md:col-span-2 lg:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <p className="text-sm text-gray-700">{displayLiability.transaction.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Vendor Information */}
                {displayLiability.vendor && (
                  <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Vendor Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name</label>
                        <p className="text-lg text-gray-900 font-medium">{displayLiability.vendor.name || 'N/A'}</p>
                      </div>
                      {displayLiability.vendor.contact_person && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                          <p className="text-lg text-gray-900 font-medium">{displayLiability.vendor.contact_person}</p>
                        </div>
                      )}
                      {displayLiability.vendor.email && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <p className="text-lg text-gray-900 font-medium">{displayLiability.vendor.email}</p>
                        </div>
                      )}
                      {displayLiability.vendor.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <p className="text-lg text-gray-900 font-medium">{displayLiability.vendor.phone}</p>
                        </div>
                      )}
                      {displayLiability.vendor.address && (
                        <div className="md:col-span-2 lg:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                          <p className="text-lg text-gray-900 font-medium">{displayLiability.vendor.address}</p>
                        </div>
                      )}
                      {displayLiability.vendor.city && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                          <p className="text-lg text-gray-900 font-medium">{displayLiability.vendor.city}</p>
                        </div>
                      )}
                      {displayLiability.vendor.country && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                          <p className="text-lg text-gray-900 font-medium">{displayLiability.vendor.country}</p>
                        </div>
                      )}
                      {displayLiability.vendor.status && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            displayLiability.vendor.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {displayLiability.vendor.status.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {displayLiability.vendor.bank_account && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
                          <p className="text-lg text-gray-900 font-medium">{displayLiability.vendor.bank_account}</p>
                        </div>
                      )}
                      {displayLiability.vendor.notes && (
                        <div className="md:col-span-2 lg:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <p className="text-sm text-gray-700">{displayLiability.vendor.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                          {new Date(displayLiability.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {new Date(displayLiability.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {displayLiability.employee 
                            ? `${displayLiability.employee.firstName || ''} ${displayLiability.employee.lastName || ''}`.trim() || displayLiability.employee.email || 'N/A'
                            : 'N/A'
                          }
                        </p>
                      </div>
                      {displayLiability.employee?.email && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Employee Email</label>
                          <p className="text-lg text-gray-900 font-medium">
                            {displayLiability.employee.email}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'full' && activeTab === 'update' && (
              <div className="space-y-4">
                {!canUpdate && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                        </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Cannot Update Liability
                  </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{isPaid ? 'This liability is already paid and cannot be updated.' : 'The linked transaction is completed and this liability cannot be updated.'}</p>
                      </div>
                      </div>
                </div>
              </div>
            )}

                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'} ${!canUpdate ? 'opacity-50 pointer-events-none' : ''}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Liability
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
                            Update Liability Information
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>Update liability details. Due date must be in the future. All fields are optional - only changed values will be updated.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name <span className="text-red-500">*</span>
                      </label>
                          <input
                          type="text"
                          value={updateForm.name}
                          onChange={(e) => handleUpdateFormChange('name', e.target.value)}
                          disabled={!canUpdate}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                          placeholder="Enter liability name"
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
                          disabled={!canUpdate}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                          placeholder="Enter category (e.g., Loan, Credit, Tax)"
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
                            disabled={!canUpdate}
                            className="block w-full pl-7 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                            placeholder="0.00"
                          />
                      </div>
                      </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                          Due Date <span className="text-red-500">*</span>
                      </label>
                        <input
                          type="date"
                          value={updateForm.dueDate}
                          onChange={(e) => handleUpdateFormChange('dueDate', e.target.value)}
                          disabled={!canUpdate}
                          min={new Date().toISOString().split('T')[0]}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                          Must be in the future
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vendor
                      </label>
                        <select
                          value={updateForm.relatedVendorId}
                          onChange={(e) => {
                            if (e.target.value === 'create_new') {
                              setShowCreateVendorModal(true);
                            } else {
                              handleUpdateFormChange('relatedVendorId', e.target.value);
                            }
                          }}
                          disabled={isLoadingVendors || !canUpdate}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                        >
                          <option value="">
                            {isLoadingVendors ? 'Loading vendors...' : 'Select vendor (optional)'}
                          </option>
                          {vendors.map((vendor) => (
                            <option key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </option>
                          ))}
                          <option value="create_new" className="font-semibold text-red-600">
                            ➕ Create New Vendor
                          </option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Current vendor: {displayLiability.vendor?.name || 'N/A'}
                        </p>
                    </div>

                      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                      <button
                          type="button"
                          onClick={() => setActiveTab('details')}
                          className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateLiability}
                          disabled={isUpdating || !canUpdate || !updateForm.name.trim() || !updateForm.category}
                          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            'Update Liability'
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

        {/* Create Vendor Modal */}
        {showCreateVendorModal && (
          <div className="fixed inset-0 z-[1200] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setShowCreateVendorModal(false)}></div>
              
              <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <svg className="h-6 w-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                      Create New Vendor
                    </h3>
                    <button 
                      onClick={() => {
                        setShowCreateVendorModal(false);
                        setNewVendorForm({
                          name: '',
                          contact_person: '',
                          email: '',
                          phone: '',
                          address: '',
                          city: '',
                          country: '',
                          bank_account: '',
                          status: 'active',
                          notes: ''
                        });
                      }} 
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                </div>

                <div className="px-6 py-4 space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-700">
                      Create a new vendor for liability tracking. All fields are optional except the name.
                  </p>
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newVendorForm.name}
                      onChange={(e) => setNewVendorForm({...newVendorForm, name: e.target.value})}
                      placeholder="e.g., Bank Name, Credit Card Company"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      maxLength={255}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        value={newVendorForm.contact_person}
                        onChange={(e) => setNewVendorForm({...newVendorForm, contact_person: e.target.value})}
                        placeholder="John Smith"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        maxLength={255}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newVendorForm.email}
                        onChange={(e) => setNewVendorForm({...newVendorForm, email: e.target.value})}
                        placeholder="vendor@example.com"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        maxLength={255}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={newVendorForm.phone}
                        onChange={(e) => setNewVendorForm({...newVendorForm, phone: e.target.value})}
                        placeholder="+1-555-0123"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        maxLength={50}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Account
                      </label>
                      <input
                        type="text"
                        value={newVendorForm.bank_account}
                        onChange={(e) => setNewVendorForm({...newVendorForm, bank_account: e.target.value})}
                        placeholder="1234567890"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        maxLength={255}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={newVendorForm.address}
                      onChange={(e) => setNewVendorForm({...newVendorForm, address: e.target.value})}
                      placeholder="123 Business Street, Suite 100"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={newVendorForm.city}
                        onChange={(e) => setNewVendorForm({...newVendorForm, city: e.target.value})}
                        placeholder="New York"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={newVendorForm.country}
                        onChange={(e) => setNewVendorForm({...newVendorForm, country: e.target.value})}
                        placeholder="United States"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={newVendorForm.notes}
                      onChange={(e) => setNewVendorForm({...newVendorForm, notes: e.target.value})}
                      rows={3}
                      placeholder="Additional notes about this vendor..."
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateVendorModal(false);
                      setNewVendorForm({
                        name: '',
                        contact_person: '',
                        email: '',
                        phone: '',
                        address: '',
                        city: '',
                        country: '',
                        bank_account: '',
                        status: 'active',
                        notes: ''
                      });
                    }}
                    className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateVendor}
                    disabled={isCreatingVendor || !newVendorForm.name.trim()}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingVendor ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                        Creating...
                      </>
                    ) : (
                      'Create Vendor'
                    )}
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
