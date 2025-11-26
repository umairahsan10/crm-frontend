import React, { useState, useEffect } from 'react';
import type { Expense } from '../../types';
import { updateExpenseApi, getExpenseByIdApi } from '../../apis/expenses';
import { getVendorsApi, createVendorApi, type Vendor, type CreateVendorRequest } from '../../apis/vendors';
import { useNavbar } from '../../context/NavbarContext';

interface ExpenseDetailsDrawerProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onExpenseUpdated?: (updatedExpense: Expense) => void;
  viewMode?: 'full' | 'details-only';
}

const ExpenseDetailsDrawer: React.FC<ExpenseDetailsDrawerProps> = ({
  expense,
  isOpen,
  onClose,
  onExpenseUpdated,
  viewMode = 'full'
}) => {
  const { isNavbarOpen } = useNavbar();
  const [activeTab, setActiveTab] = useState<'details' | 'update'>('details');
  const [isMobile, setIsMobile] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingExpenseData, setIsLoadingExpenseData] = useState(false);
  
  // Store complete expense data with vendor details
  const [completeExpenseData, setCompleteExpenseData] = useState<Expense | null>(null);
  
  // Update expense form state
  const [updateForm, setUpdateForm] = useState({
    title: '',
    category: '',
    amount: '',
    paidOn: '',
    notes: '',
    paymentMethod: '' as 'cash' | 'bank' | 'online' | '',
    processedByRole: '' as 'Employee' | 'Admin' | '',
    vendorId: ''
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

  // Fetch complete expense details when drawer opens
  const fetchExpenseDetails = async (expenseId: string) => {
    try {
      setIsLoadingExpenseData(true);
      console.log('🔄 Fetching complete expense details for ID:', expenseId);
      
      const response = await getExpenseByIdApi(expenseId);
      console.log('🔍 fetchExpenseDetails - Response received:', response);
      
      if (response.success && response.data) {
        console.log('✅ Complete expense data fetched:', response.data);
        console.log('🏢 Vendor data:', response.data.vendor);
        // Store the complete expense data with vendor details
        setCompleteExpenseData(response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching expense details:', error);
    } finally {
      setIsLoadingExpenseData(false);
      console.log('✅ fetchExpenseDetails completed');
    }
  };

  // Populate forms when expense changes
  useEffect(() => {
    if (expense && isOpen) {
      console.log('🔍 ExpenseDetailsDrawer received expense:', expense);
      
      // Initialize with the prop expense first
      setCompleteExpenseData(expense);
      
      // Reset update form with null checks
      setUpdateForm({
        title: expense.title || '',
        category: expense.category || '',
        amount: expense.amount ? expense.amount.toString() : '',
        paidOn: expense.paidOn ? expense.paidOn.split('T')[0] : '',
        notes: '',
        paymentMethod: (expense.paymentMethod as 'cash' | 'bank' | 'online') || '',
        processedByRole: '' as 'Employee' | 'Admin' | '',
        vendorId: expense.vendorId ? expense.vendorId.toString() : ''
      });
      
      // Fetch complete expense details only if expense.id exists
      if (expense.id) {
      fetchExpenseDetails(expense.id.toString());
      }
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
        setUpdateForm(prev => ({ ...prev, vendorId: response.data!.id.toString() }));
        
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

  // Handle expense update
  const handleUpdateExpense = async () => {
    if (!expense || !updateForm.title.trim()) {
      setNotification({ type: 'error', message: 'Please enter expense title' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (!updateForm.category) {
      setNotification({ type: 'error', message: 'Please select a category' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    const newAmount = parseFloat(updateForm.amount);

    if (isNaN(newAmount) || newAmount < 0) {
      setNotification({ type: 'error', message: 'Please enter a valid amount' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      setIsUpdating(true);
      
      const updateData: any = {
        title: updateForm.title,
        category: updateForm.category,
        amount: newAmount,
        paidOn: updateForm.paidOn || undefined,
        notes: updateForm.notes || undefined,
        paymentMethod: updateForm.paymentMethod || undefined,
        processedByRole: updateForm.processedByRole || undefined
      };

      // Only include vendorId if it's provided and valid
      if (updateForm.vendorId && !isNaN(parseInt(updateForm.vendorId))) {
        updateData.vendorId = parseInt(updateForm.vendorId);
      }

      console.log('Updating expense:', {
        expenseId: expense.id,
        updateData: updateData
      });

      const response = await updateExpenseApi(expense.id, updateData);
      console.log('✅ Update response:', response);
      
      if (response.success && response.data) {
        console.log('📦 Updated expense data from update API:', response.data);
        console.log('🏢 Vendor in update response:', response.data.vendor);
        
        // Refetch complete expense details with vendor information
        const detailsResponse = await getExpenseByIdApi(expense.id.toString());
        console.log('📦 Refetched expense data:', detailsResponse.data);
        console.log('🏢 Vendor in refetch response:', detailsResponse.data?.vendor);
        
        if (detailsResponse.success && detailsResponse.data) {
          // Update both parent component and local state with complete expense data including vendor
          console.log('✅ Updating parent and local state with complete expense data');
          setCompleteExpenseData(detailsResponse.data);
          onExpenseUpdated?.(detailsResponse.data);
        } else {
          // Fallback to update response data
          console.log('⚠️ Using fallback update response data');
          setCompleteExpenseData(response.data);
          onExpenseUpdated?.(response.data);
        }
        
        setNotification({ type: 'success', message: 'Expense updated successfully!' });
      setTimeout(() => setNotification(null), 3000);
      
        // Switch to details tab
        setActiveTab('details');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
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

  if (!isOpen || !expense) return null;

  // Use completeExpenseData if available (has vendor info), otherwise fall back to expense prop
  const displayExpense = completeExpenseData || expense;

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
                  { id: 'update', name: 'Update' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as 'details' | 'update');
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
            {isLoadingExpenseData && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <svg className="animate-spin h-10 w-10 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-3 text-sm text-gray-600">Loading complete expense details...</p>
                </div>
              </div>
            )}
            
            {!isLoadingExpenseData && (viewMode === 'details-only' || activeTab === 'details') && (
              <div className="space-y-6">
                {/* Expense Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Expense Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <p className="text-lg text-gray-900 font-medium">{displayExpense.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <div className="mt-1">
                        {getCategoryBadge(displayExpense.category)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                      <p className="text-xl text-red-600 font-bold">
                        ${displayExpense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                      <div className="mt-1">
                        {getPaymentMethodBadge(displayExpense.paymentMethod)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Paid On</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {new Date(displayExpense.paidOn).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transaction Information */}
                {displayExpense.transaction && (
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
                          displayExpense.transaction.transactionType === 'expense' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {displayExpense.transaction.transactionType?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          displayExpense.transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : displayExpense.transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {displayExpense.transaction.status?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Amount</label>
                        <p className="text-lg text-gray-900 font-medium">
                          ${displayExpense.transaction.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vendor Information */}
                {displayExpense.vendor && (
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
                        <p className="text-lg text-gray-900 font-medium">{displayExpense.vendor.name || 'N/A'}</p>
                      </div>
                      {displayExpense.vendor.contact_person && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                          <p className="text-lg text-gray-900 font-medium">{displayExpense.vendor.contact_person}</p>
                        </div>
                      )}
                      {displayExpense.vendor.email && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <p className="text-lg text-gray-900 font-medium">{displayExpense.vendor.email}</p>
                        </div>
                      )}
                      {displayExpense.vendor.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <p className="text-lg text-gray-900 font-medium">{displayExpense.vendor.phone}</p>
                        </div>
                      )}
                      {displayExpense.vendor.address && (
                        <div className="md:col-span-2 lg:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                          <p className="text-lg text-gray-900 font-medium">{displayExpense.vendor.address}</p>
                        </div>
                      )}
                      {displayExpense.vendor.city && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                          <p className="text-lg text-gray-900 font-medium">{displayExpense.vendor.city}</p>
                        </div>
                      )}
                      {displayExpense.vendor.country && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                          <p className="text-lg text-gray-900 font-medium">{displayExpense.vendor.country}</p>
                        </div>
                      )}
                      {displayExpense.vendor.status && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            displayExpense.vendor.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {displayExpense.vendor.status.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {displayExpense.vendor.bank_account && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
                          <p className="text-lg text-gray-900 font-medium">{displayExpense.vendor.bank_account}</p>
                        </div>
                      )}
                      {displayExpense.vendor.notes && (
                        <div className="md:col-span-2 lg:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <p className="text-sm text-gray-700">{displayExpense.vendor.notes}</p>
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
                          {new Date(displayExpense.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {new Date(displayExpense.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {displayExpense.employee 
                            ? `${displayExpense.employee.firstName || ''} ${displayExpense.employee.lastName || ''}`.trim() || displayExpense.employee.email || 'N/A'
                            : 'N/A'
                          }
                        </p>
                      </div>
                      {displayExpense.employee?.email && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Employee Email</label>
                          <p className="text-lg text-gray-900 font-medium">
                            {displayExpense.employee.email}
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
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Expense
                  </h3>
                  
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
                            Update Expense Information
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                            <p>Update expense details. All fields are optional - only changed values will be updated.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                    <form className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={updateForm.title}
                          onChange={(e) => handleUpdateFormChange('title', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter expense title"
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
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter category (e.g., Office Expenses, Utilities)"
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
                            className="block w-full pl-7 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Paid On
                        </label>
                        <input
                          type="date"
                          value={updateForm.paidOn}
                          onChange={(e) => handleUpdateFormChange('paidOn', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method
                        </label>
                        <select
                          value={updateForm.paymentMethod}
                          onChange={(e) => handleUpdateFormChange('paymentMethod', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select payment method</option>
                          <option value="cash">Cash</option>
                          <option value="bank">Bank</option>
                          <option value="online">Online</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Processed By
                        </label>
                        <select
                          value={updateForm.processedByRole}
                          onChange={(e) => handleUpdateFormChange('processedByRole', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select who processed</option>
                          <option value="Employee">Employee</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vendor
                        </label>
                        <select
                          value={updateForm.vendorId}
                          onChange={(e) => {
                            if (e.target.value === 'create_new') {
                              setShowCreateVendorModal(true);
                            } else {
                              handleUpdateFormChange('vendorId', e.target.value);
                            }
                          }}
                          disabled={isLoadingVendors}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        >
                          <option value="">
                            {isLoadingVendors ? 'Loading vendors...' : 'Select vendor'}
                          </option>
                          {vendors.map((vendor) => (
                            <option key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </option>
                          ))}
                          <option value="create_new" className="font-semibold text-blue-600">
                            ➕ Create New Vendor
                          </option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Current vendor: {displayExpense.vendor?.name || 'N/A'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes
                        </label>
                        <textarea
                          value={updateForm.notes}
                          onChange={(e) => handleUpdateFormChange('notes', e.target.value)}
                          rows={3}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Add any additional notes..."
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setActiveTab('details')}
                          className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateExpense}
                          disabled={isUpdating || !updateForm.title.trim() || !updateForm.category}
                          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            'Update Expense'
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
                      <svg className="h-6 w-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-700">
                      Create a new vendor to track your expense payments. All fields are optional except the name.
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
                      placeholder="e.g., Office Supplies Inc"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default ExpenseDetailsDrawer;
