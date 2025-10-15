import React, { useState, useEffect } from 'react';
import { createLiabilityApi } from '../../apis/liabilities';
import { getVendorsApi, createVendorApi, type Vendor, type CreateVendorRequest } from '../../apis/vendors';
import { useNavbar } from '../../context/NavbarContext';
import type { Liability } from '../../types';

interface AddLiabilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLiabilityCreated?: (newLiability: Liability) => void;
}

const AddLiabilityDrawer: React.FC<AddLiabilityDrawerProps> = ({
  isOpen,
  onClose,
  onLiabilityCreated
}) => {
  const { isNavbarOpen } = useNavbar();
  const [isMobile, setIsMobile] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Liability form state
  const [liabilityForm, setLiabilityForm] = useState({
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

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load vendors when drawer opens
  useEffect(() => {
    if (isOpen && vendors.length === 0) {
      loadVendors();
    }
  }, [isOpen]);

  // Reset form when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setLiabilityForm({
        name: '',
        category: '',
        amount: '',
        dueDate: '',
        relatedVendorId: ''
      });
      setNotification(null);
      setShowCreateVendorModal(false);
    }
  }, [isOpen]);

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

  const handleFormChange = (field: string, value: string) => {
    setLiabilityForm(prev => ({
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
        setLiabilityForm(prev => ({ ...prev, relatedVendorId: response.data!.id.toString() }));
        
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

  // Handle liability creation
  const handleCreateLiability = async () => {
    // Validation
    if (!liabilityForm.name.trim()) {
      setNotification({ type: 'error', message: 'Please enter liability name' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (!liabilityForm.category.trim()) {
      setNotification({ type: 'error', message: 'Please enter category' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    const amount = parseFloat(liabilityForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setNotification({ type: 'error', message: 'Please enter a valid amount greater than 0' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (!liabilityForm.dueDate) {
      setNotification({ type: 'error', message: 'Please select a due date' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Validate due date is in the future
    const dueDate = new Date(liabilityForm.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate <= today) {
      setNotification({ type: 'error', message: 'Due date must be in the future' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      setIsCreating(true);
      
      const liabilityData: any = {
        name: liabilityForm.name.trim(),
        category: liabilityForm.category.trim(),
        amount: amount,
        dueDate: liabilityForm.dueDate
      };

      // Only include relatedVendorId if it's provided and valid
      if (liabilityForm.relatedVendorId && !isNaN(parseInt(liabilityForm.relatedVendorId))) {
        liabilityData.relatedVendorId = parseInt(liabilityForm.relatedVendorId);
      }

      console.log('Creating liability:', liabilityData);

      const response = await createLiabilityApi(liabilityData);
      console.log('✅ Create response:', response);
      
      if (response.success && response.data) {
        setNotification({ type: 'success', message: 'Liability created successfully!' });
        
        // Notify parent component
        if (onLiabilityCreated) {
          onLiabilityCreated(response.data);
        }
        
        // Close drawer after short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating liability:', error);
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to create liability' 
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  // Get tomorrow's date for min date validation
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

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
                    +
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Add New Liability
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

          {/* Content */}
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-4'}`}>
            <div className="space-y-4">
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Liability Information
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
                          Create New Liability
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>Create a liability record for money owed. Due date must be in the future. A pending transaction will be created automatically.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Liability Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={liabilityForm.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        placeholder="e.g., Bank Loan Payment, Credit Card Payment"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={liabilityForm.category}
                        onChange={(e) => handleFormChange('category', e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        placeholder="e.g., Loan, Credit, Payable, Tax, Rent"
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
                          min="0"
                          value={liabilityForm.amount}
                          onChange={(e) => handleFormChange('amount', e.target.value)}
                          className="block w-full pl-7 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
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
                        value={liabilityForm.dueDate}
                        onChange={(e) => handleFormChange('dueDate', e.target.value)}
                        min={minDate}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                      <p className="mt-1 text-xs text-red-600 font-medium">
                        ⚠️ Due date must be in the future (minimum: tomorrow)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vendor (Optional)
                      </label>
                      <select
                        value={liabilityForm.relatedVendorId}
                        onChange={(e) => {
                          if (e.target.value === 'create_new') {
                            setShowCreateVendorModal(true);
                          } else {
                            handleFormChange('relatedVendorId', e.target.value);
                          }
                        }}
                        disabled={isLoadingVendors}
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
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateLiability}
                        disabled={isCreating || !liabilityForm.name.trim() || !liabilityForm.category.trim() || !liabilityForm.amount || !liabilityForm.dueDate}
                        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCreating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating...
                          </>
                        ) : (
                          'Create Liability'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
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
                      Create a new vendor for liability tracking (e.g., banks, credit companies). All fields are optional except the name.
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
                      placeholder="e.g., ABC Bank, Credit Card Company"
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

export default AddLiabilityDrawer;

