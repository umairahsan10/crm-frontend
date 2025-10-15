import React, { useState, useEffect } from 'react';
import { createRevenueApi } from '../../apis/revenue';
import { useNavbar } from '../../context/NavbarContext';
import type { Revenue } from '../../types';

interface AddRevenueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRevenueCreated?: (newRevenue: Revenue) => void;
}

type RevenueScenario = 'lead-invoice' | 'invoice-only' | 'admin-entry';

const AddRevenueDrawer: React.FC<AddRevenueDrawerProps> = ({
  isOpen,
  onClose,
  onRevenueCreated
}) => {
  const { isNavbarOpen } = useNavbar();
  const [isMobile, setIsMobile] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [scenario, setScenario] = useState<RevenueScenario>('lead-invoice');
  
  // Revenue form state
  const [revenueForm, setRevenueForm] = useState({
    source: '',
    category: '',
    amount: '',
    receivedOn: '',
    paymentMethod: '' as 'cash' | 'bank' | 'online' | '',
    receivedFrom: '',
    relatedInvoiceId: '',
    transactionId: ''
  });

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

  // Reset form when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setRevenueForm({
        source: '',
        category: '',
        amount: '',
        receivedOn: '',
        paymentMethod: '',
        receivedFrom: '',
        relatedInvoiceId: '',
        transactionId: ''
      });
      setScenario('lead-invoice');
      setNotification(null);
    }
  }, [isOpen]);

  const handleFormChange = (field: string, value: string) => {
    setRevenueForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScenarioChange = (newScenario: RevenueScenario) => {
    setScenario(newScenario);
    // Reset scenario-specific fields
    if (newScenario === 'admin-entry') {
      setRevenueForm(prev => ({
        ...prev,
        receivedFrom: '',
        relatedInvoiceId: ''
      }));
    } else if (newScenario === 'invoice-only') {
      setRevenueForm(prev => ({
        ...prev,
        receivedFrom: '',
        source: ''
      }));
    }
  };

  // Handle revenue creation
  const handleCreateRevenue = async () => {
    // Validation based on scenario
    if (scenario === 'lead-invoice') {
      if (!revenueForm.receivedFrom) {
        setNotification({ type: 'error', message: 'Lead ID is required for Lead+Invoice scenario' });
        setTimeout(() => setNotification(null), 5000);
        return;
      }
      if (!revenueForm.relatedInvoiceId) {
        setNotification({ type: 'error', message: 'Invoice ID is required when Lead ID is provided' });
        setTimeout(() => setNotification(null), 5000);
        return;
      }
    } else if (scenario === 'invoice-only') {
      if (!revenueForm.relatedInvoiceId) {
        setNotification({ type: 'error', message: 'Invoice ID is required for Invoice-Only scenario' });
        setTimeout(() => setNotification(null), 5000);
        return;
      }
    }

    // Common validation
    if (!revenueForm.source.trim() && scenario !== 'invoice-only') {
      setNotification({ type: 'error', message: 'Please enter revenue source' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (!revenueForm.category.trim()) {
      setNotification({ type: 'error', message: 'Please enter category' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    const amount = parseFloat(revenueForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setNotification({ type: 'error', message: 'Please enter a valid amount greater than 0' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      setIsCreating(true);
      
      const revenueData: any = {
        source: revenueForm.source.trim() || (scenario === 'invoice-only' ? 'Lead Revenue' : 'Admin'),
        category: revenueForm.category.trim(),
        amount: amount
      };

      // Add optional fields based on scenario
      if (revenueForm.receivedOn) {
        revenueData.receivedOn = revenueForm.receivedOn;
      }
      if (revenueForm.paymentMethod) {
        revenueData.paymentMethod = revenueForm.paymentMethod;
      }

      // Scenario-specific fields
      if (scenario === 'lead-invoice') {
        const leadId = parseInt(revenueForm.receivedFrom);
        const invoiceId = parseInt(revenueForm.relatedInvoiceId);
        if (!isNaN(leadId) && leadId > 0) {
          revenueData.receivedFrom = leadId;
        }
        if (!isNaN(invoiceId) && invoiceId > 0) {
          revenueData.relatedInvoiceId = invoiceId;
        }
      } else if (scenario === 'invoice-only') {
        const invoiceId = parseInt(revenueForm.relatedInvoiceId);
        if (!isNaN(invoiceId) && invoiceId > 0) {
          revenueData.relatedInvoiceId = invoiceId;
        }
      }

      // Transaction ID (optional - for updating existing transaction)
      if (revenueForm.transactionId) {
        const transactionId = parseInt(revenueForm.transactionId);
        if (!isNaN(transactionId) && transactionId > 0) {
          revenueData.transactionId = transactionId;
        }
      }

      console.log('Creating revenue:', revenueData);
      console.log('Scenario:', scenario);

      const response = await createRevenueApi(revenueData);
      console.log('✅ Create response:', response);
      
      if (response.success && response.data) {
        setNotification({ type: 'success', message: 'Revenue created successfully!' });
        
        // Notify parent component
        if (onRevenueCreated) {
          onRevenueCreated(response.data);
        }
        
        // Close drawer after short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating revenue:', error);
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to create revenue' 
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

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
                    +
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Add New Revenue
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
                  <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Revenue Scenario
                </h3>

                {/* Scenario Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Revenue Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Scenario 1: Lead + Invoice */}
                    <button
                      type="button"
                      onClick={() => handleScenarioChange('lead-invoice')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        scenario === 'lead-invoice'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                          scenario === 'lead-invoice' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                        }`}>
                          {scenario === 'lead-invoice' && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm">Lead + Invoice</h4>
                      </div>
                      <p className="text-xs text-gray-600">Record revenue from a completed lead with invoice</p>
                    </button>

                    {/* Scenario 2: Invoice Only */}
                    <button
                      type="button"
                      onClick={() => handleScenarioChange('invoice-only')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        scenario === 'invoice-only'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                          scenario === 'invoice-only' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {scenario === 'invoice-only' && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm">Invoice Only</h4>
                      </div>
                      <p className="text-xs text-gray-600">Auto-fetch lead from invoice</p>
                    </button>

                    {/* Scenario 3: Admin Entry */}
                    <button
                      type="button"
                      onClick={() => handleScenarioChange('admin-entry')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        scenario === 'admin-entry'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                          scenario === 'admin-entry' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                        }`}>
                          {scenario === 'admin-entry' && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm">Admin Entry</h4>
                      </div>
                      <p className="text-xs text-gray-600">Manual revenue entry without lead/invoice</p>
                    </button>
                  </div>
                </div>

                {/* Info Box based on scenario */}
                <div className={`mb-6 rounded-md p-4 ${
                  scenario === 'lead-invoice' ? 'bg-green-50 border border-green-200' :
                  scenario === 'invoice-only' ? 'bg-blue-50 border border-blue-200' :
                  'bg-purple-50 border border-purple-200'
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className={`h-5 w-5 ${
                        scenario === 'lead-invoice' ? 'text-green-400' :
                        scenario === 'invoice-only' ? 'text-blue-400' :
                        'text-purple-400'
                      }`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        scenario === 'lead-invoice' ? 'text-green-800' :
                        scenario === 'invoice-only' ? 'text-blue-800' :
                        'text-purple-800'
                      }`}>
                        {scenario === 'lead-invoice' && 'Lead + Invoice Revenue'}
                        {scenario === 'invoice-only' && 'Invoice-Based Revenue'}
                        {scenario === 'admin-entry' && 'Admin Manual Entry'}
                      </h3>
                      <div className={`mt-2 text-sm ${
                        scenario === 'lead-invoice' ? 'text-green-700' :
                        scenario === 'invoice-only' ? 'text-blue-700' :
                        'text-purple-700'
                      }`}>
                        {scenario === 'lead-invoice' && (
                          <p>Record revenue from a completed lead with invoice. Lead must have status "completed" and invoice must match the lead.</p>
                        )}
                        {scenario === 'invoice-only' && (
                          <p>Provide only invoice ID - the system will automatically fetch the lead information from the invoice.</p>
                        )}
                        {scenario === 'admin-entry' && (
                          <p>Manual revenue entry for cases without lead or invoice linkage. Source will be set to "Admin".</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <form className="space-y-6">
                    {/* Conditional Fields based on Scenario */}
                    {scenario === 'lead-invoice' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lead ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={revenueForm.receivedFrom}
                            onChange={(e) => handleFormChange('receivedFrom', e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter Lead ID (must be completed)"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Lead must have status "completed" to record revenue
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Invoice ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={revenueForm.relatedInvoiceId}
                            onChange={(e) => handleFormChange('relatedInvoiceId', e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter Invoice ID (must belong to the lead)"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Invoice must belong to the specified lead
                          </p>
                        </div>
                      </>
                    )}

                    {scenario === 'invoice-only' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Invoice ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={revenueForm.relatedInvoiceId}
                          onChange={(e) => handleFormChange('relatedInvoiceId', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter Invoice ID"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          System will auto-fetch lead from invoice and set source to "Lead Revenue"
                        </p>
                      </div>
                    )}

                    {/* Common Fields */}
                    {scenario !== 'invoice-only' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Source <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={revenueForm.source}
                          onChange={(e) => handleFormChange('source', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder={scenario === 'admin-entry' ? 'e.g., Client Payment, Service Fee' : 'Enter revenue source'}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={revenueForm.category}
                        onChange={(e) => handleFormChange('category', e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., Product Sales, Service Revenue, Consulting"
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
                          value={revenueForm.amount}
                          onChange={(e) => handleFormChange('amount', e.target.value)}
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
                        value={revenueForm.receivedOn}
                        onChange={(e) => handleFormChange('receivedOn', e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Leave empty to use current date
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <select
                        value={revenueForm.paymentMethod}
                        onChange={(e) => handleFormChange('paymentMethod', e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select payment method (optional)</option>
                        <option value="cash">Cash</option>
                        <option value="bank">Bank</option>
                        <option value="online">Online</option>
                      </select>
                    </div>

                    {/* Advanced: Transaction ID (optional) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction ID (Optional)
                      </label>
                      <input
                        type="number"
                        value={revenueForm.transactionId}
                        onChange={(e) => handleFormChange('transactionId', e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter existing transaction ID to update it"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        If provided, updates existing transaction to "completed" instead of creating new one
                      </p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateRevenue}
                        disabled={isCreating || !revenueForm.category.trim() || !revenueForm.amount}
                        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          'Create Revenue'
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
      </div>
    </div>
  );
};

export default AddRevenueDrawer;

