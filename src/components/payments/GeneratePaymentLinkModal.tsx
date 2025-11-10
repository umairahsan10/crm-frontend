/**
 * Generate Payment Link Modal
 * Form to generate payment links with client search by email
 */

import React, { useState, useEffect, useCallback } from 'react';
import { findClientByEmailApi } from '../../apis/clients';
import { generatePaymentLinkApi, type GeneratePaymentLinkRequest } from '../../apis/leads';
import type { Client } from '../../types';

interface GeneratePaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: number;
  defaultAmount?: number;
  onSuccess?: (paymentLink: any) => void;
  // Initial lead data to pre-populate form
  initialLeadData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

type TransactionType = 'payment' | 'refund' | 'adjustment';
type PaymentWays = 'bank' | 'card' | 'cash' | 'other';

const GeneratePaymentLinkModal: React.FC<GeneratePaymentLinkModalProps> = ({
  isOpen,
  onClose,
  leadId,
  defaultAmount = 0,
  onSuccess,
  initialLeadData
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [foundClient, setFoundClient] = useState<Client | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [clientNotFound, setClientNotFound] = useState(false);
  const [hasInitialLeadData, setHasInitialLeadData] = useState(false);
  
  const [formData, setFormData] = useState<GeneratePaymentLinkRequest>({
    leadId,
    clientId: undefined,
    clientName: '',
    companyName: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    postalCode: '',
    amount: 0,
    type: 'payment',
    method: 'bank'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-search for client by email (without user interaction)
  const handleSearchClientAuto = useCallback(async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await findClientByEmailApi(email);
      
      if (response.success && response.data) {
        const client = response.data;
        setFoundClient(client);
        
        // Populate form with client data
        setFormData(prev => ({
          ...prev,
          clientId: typeof client.id === 'string' ? parseInt(client.id) : client.id,
          clientName: client.clientName || prev.clientName || '',
          companyName: client.companyName || prev.companyName || '',
          email: client.email || email,
          phone: client.phone || prev.phone || '',
          country: client.country || prev.country || '',
          state: client.state || prev.state || '',
          postalCode: client.postalCode || prev.postalCode || ''
        }));
      }
    } catch (error) {
      // Silently fail - client not found, but we still have lead data populated
      setFoundClient(null);
      // Check if it's a 404 or "not found" error
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.toLowerCase().includes('not found') || 
          (error instanceof Error && 'status' in error && (error as any).status === 404)) {
        setClientNotFound(true);
      }
      // Don't set error for auto-search, only for manual search
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Reset form when modal opens/closes and auto-populate from lead data
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        leadId,
        clientId: undefined,
        clientName: '',
        companyName: '',
        email: '',
        phone: '',
        country: '',
        state: '',
        postalCode: '',
        amount: 0,
        type: 'payment',
        method: 'bank'
      });
      setSearchEmail('');
      setFoundClient(null);
      setSearchError(null);
      setClientNotFound(false);
      setHasInitialLeadData(false);
      setErrors({});
    } else if (isOpen) {
      // Pre-populate form with initial lead data if available
      const initialData: Partial<GeneratePaymentLinkRequest> = {
        leadId,
        amount: defaultAmount > 0 ? defaultAmount : 0,
        type: 'payment',
        method: 'bank'
      };

      // If we have initial lead data, populate the fields
      if (initialLeadData) {
        setHasInitialLeadData(true);
        initialData.clientName = initialLeadData.name || '';
        initialData.email = initialLeadData.email || '';
        initialData.phone = initialLeadData.phone || '';
        
        // Set search email for auto-search
        if (initialLeadData.email) {
          setSearchEmail(initialLeadData.email);
        }
      } else {
        setHasInitialLeadData(false);
      }

      setFormData(prev => ({
        ...prev,
        ...initialData
      }));

      // Auto-search for client by email if email is provided
      if (initialLeadData?.email) {
        handleSearchClientAuto(initialLeadData.email);
      }
    }
  }, [isOpen, leadId, defaultAmount, initialLeadData, handleSearchClientAuto]);

  // Handle search for client by email (manual search)
  const handleSearchClient = async () => {
    if (!searchEmail.trim()) {
      setSearchError('Please enter an email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchEmail)) {
      setSearchError('Please enter a valid email address');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await findClientByEmailApi(searchEmail);
      
      if (response.success && response.data) {
        const client = response.data;
        setFoundClient(client);
        
        // Populate form with client data (but keep fields editable)
        setFormData(prev => ({
          ...prev,
          clientId: typeof client.id === 'string' ? parseInt(client.id) : client.id,
          clientName: client.clientName || prev.clientName || '',
          companyName: client.companyName || prev.companyName || '',
          email: client.email || searchEmail,
          phone: client.phone || prev.phone || '',
          country: client.country || prev.country || '',
          state: client.state || prev.state || '',
          postalCode: client.postalCode || prev.postalCode || ''
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Client not found with this email';
      setSearchError(errorMessage);
      setFoundClient(null);
      // Check if it's a 404 or "not found" error
      if (errorMessage.toLowerCase().includes('not found') || 
          (error instanceof Error && 'status' in error && (error as any).status === 404)) {
        setClientNotFound(true);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Handle input change
  const handleInputChange = (field: keyof GeneratePaymentLinkRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validate form - fields are required only if clientId is not provided
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // If clientId is not provided, validate all client fields
    if (!formData.clientId) {
      if (!formData.clientName?.trim()) {
        newErrors.clientName = 'Client name is required';
      }

      if (!formData.email?.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!formData.phone?.trim()) {
        newErrors.phone = 'Phone number is required';
      }

      if (!formData.country?.trim()) {
        newErrors.country = 'Country is required';
      }

      if (!formData.state?.trim()) {
        newErrors.state = 'State is required';
      }

      if (!formData.postalCode?.trim()) {
        newErrors.postalCode = 'Postal code is required';
      }
    }

    // Amount is always required and must be positive
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (formData.amount < 0) {
      newErrors.amount = 'Amount cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare payload according to DTO structure
      // If clientId is provided, client fields are optional
      // If clientId is not provided, all client fields are required
      const payload: GeneratePaymentLinkRequest = {
        leadId: formData.leadId,
        amount: formData.amount,
        type: formData.type || 'payment',
        method: formData.method || 'bank',
        ...(formData.clientId ? { clientId: formData.clientId } : {}),
        // Include client fields - required if no clientId, optional if clientId exists
        ...(!formData.clientId ? {
          clientName: formData.clientName || '',
          email: formData.email || '',
          phone: formData.phone || '',
          country: formData.country || '',
          state: formData.state || '',
          postalCode: formData.postalCode || '',
          ...(formData.companyName ? { companyName: formData.companyName } : {}),
        } : {
          // If clientId exists, still send client fields if they were edited
          ...(formData.clientName ? { clientName: formData.clientName } : {}),
          ...(formData.companyName ? { companyName: formData.companyName } : {}),
          ...(formData.email ? { email: formData.email } : {}),
          ...(formData.phone ? { phone: formData.phone } : {}),
          ...(formData.country ? { country: formData.country } : {}),
          ...(formData.state ? { state: formData.state } : {}),
          ...(formData.postalCode ? { postalCode: formData.postalCode } : {}),
        }),
      };

      const response = await generatePaymentLinkApi(payload);
      
      if (response.success) {
        // Pass the full response data to onSuccess
        onSuccess?.(response.data || response);
        onClose();
      } else {
        setErrors({ submit: response.message || 'Failed to generate payment link' });
      }
    } catch (error) {
      setErrors({ 
        submit: error instanceof Error ? error.message : 'An unexpected error occurred' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 GeneratePaymentLinkModal - isOpen:', isOpen);
    console.log('🔍 GeneratePaymentLinkModal - leadId:', leadId);
    console.log('🔍 GeneratePaymentLinkModal - defaultAmount:', defaultAmount);
  }, [isOpen, leadId, defaultAmount]);

  if (!isOpen) {
    console.log('❌ GeneratePaymentLinkModal - Not rendering because isOpen is false');
    return null;
  }

  console.log('✅ GeneratePaymentLinkModal - Rendering modal');

  return (
    <div className="fixed inset-0 z-[1200] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Generate Payment Link</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter client details to generate a payment link
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-4 pt-5 pb-4 sm:p-6">
            {/* Client Search Section - Only show if no initial lead data and client not found */}
            {!hasInitialLeadData && !clientNotFound && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Client by Email (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => {
                    setSearchEmail(e.target.value);
                    setSearchError(null);
                  }}
                  placeholder="Enter client email to search"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSearching}
                />
                <button
                  type="button"
                  onClick={handleSearchClient}
                  disabled={isSearching || !searchEmail.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
              {searchError && (
                <p className="mt-2 text-sm text-red-600">{searchError}</p>
              )}
              {foundClient && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    ✓ Client found: {foundClient.clientName} {foundClient.companyName ? `(${foundClient.companyName})` : ''}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Client details have been populated. You can still edit the fields below.
                  </p>
                </div>
              )}
            </div>
            )}

            {/* Client Information Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Client Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.clientName || ''}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.clientName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.clientName && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode || ''}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.postalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                  )}
                </div>
              </div>

              {/* Transaction Details */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Transaction Details</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.amount || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        // Prevent negative values
                        if (value < 0) {
                          setErrors(prev => ({ ...prev, amount: 'Amount cannot be negative' }));
                          return;
                        }
                        // Clear error if value is valid
                        if (value > 0 && errors.amount) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.amount;
                            return newErrors;
                          });
                        }
                        handleInputChange('amount', value || 0);
                      }}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value < 0) {
                          setErrors(prev => ({ ...prev, amount: 'Amount cannot be negative' }));
                          handleInputChange('amount', 0);
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.amount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                    )}
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type || 'payment'}
                      onChange={(e) => handleInputChange('type', e.target.value as TransactionType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="payment">Payment</option>
                      <option value="refund">Refund</option>
                      <option value="adjustment">Adjustment</option>
                    </select>
                  </div>

                  {/* Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Method
                    </label>
                    <select
                      value={formData.method || 'bank'}
                      onChange={(e) => handleInputChange('method', e.target.value as PaymentWays)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bank">Bank</option>
                      <option value="card">Card</option>
                      <option value="cash">Cash</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Payment Link'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GeneratePaymentLinkModal;

