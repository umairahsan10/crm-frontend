/**
 * Add Client Drawer - Following EXACT style of ClientDetailsDrawer
 */

import React, { useState, useEffect } from 'react';
import { useNavbar } from '../../context/NavbarContext';
import { useCreateClient } from '../../hooks/queries/useClientsQueries';
import type { CreateClientRequest, ClientType, ClientStatus } from '../../types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (client: any) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onClientCreated
}) => {
  const { isNavbarOpen } = useNavbar();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateClientRequest>({
    clientType: 'individual',
    clientName: '',
    email: '',
    phone: '',
    accountStatus: 'prospect',
    companyName: '',
    altPhone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    industryId: undefined,
    taxId: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const clientTypes: { value: ClientType; label: string }[] = [
    { value: 'individual', label: 'Individual' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'smb', label: 'Small & Medium Business' },
    { value: 'startup', label: 'Startup' }
  ];

  const clientStatuses: { value: ClientStatus; label: string }[] = [
    { value: 'prospect', label: 'Prospect' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'churned', label: 'Churned' }
  ];

  const industries = [
    { value: 1, label: 'Technology' },
    { value: 2, label: 'Healthcare' },
    { value: 3, label: 'Finance' },
    { value: 4, label: 'Retail' },
    { value: 5, label: 'Manufacturing' },
    { value: 6, label: 'Education' },
    { value: 7, label: 'Other' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    // Company name required for non-individual clients
    if (formData.clientType !== 'individual' && !formData.companyName?.trim()) {
      newErrors.companyName = 'Company name is required for this client type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createClientMutation = useCreateClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Use the mutation to create the client
      const result = await createClientMutation.mutateAsync({
        passwordHash: 'TempPassword123!', // Required field - should be handled by form
        ...formData,
        accountStatus: formData.accountStatus as 'active' | 'inactive' | 'suspended' | 'prospect'
      });

      if (result.success && result.data) {
        onClientCreated(result.data);
        
        // Reset form
        setFormData({
          clientType: 'individual',
          clientName: '',
          email: '',
          phone: '',
          accountStatus: 'prospect',
          companyName: '',
          altPhone: '',
          address: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
          industryId: undefined,
          taxId: '',
          notes: ''
        });
        setErrors({});
        
        onClose();
      }
      
    } catch (error) {
      console.error('Error creating client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        clientType: 'individual',
        clientName: '',
        email: '',
        phone: '',
        accountStatus: 'prospect',
        companyName: '',
        altPhone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        industryId: undefined,
        taxId: '',
        notes: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75" onClick={handleClose}></div>
      
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
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          {/* Header - EXACT same style as ClientDetailsDrawer */}
          <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                Add New Client
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-4'}`}>
            <div className="space-y-6">
              {/* Client Information */}
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Client Information
                </h3>
                <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label htmlFor="clientType" className="block text-sm font-medium text-gray-700 mb-2">
                    Client Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="clientType"
                    name="clientType"
                    value={formData.clientType}
                    onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {clientTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                      <label htmlFor="accountStatus" className="block text-sm font-medium text-gray-700 mb-2">
                    Account Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="accountStatus"
                    name="accountStatus"
                    value={formData.accountStatus}
                    onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {clientStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                        className={`block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.clientName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter client name"
                  />
                  {errors.clientName && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
                  )}
                </div>

                <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name {formData.clientType !== 'individual' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName || ''}
                    onChange={handleInputChange}
                        className={`block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.companyName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter company name"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                  )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Information
                </h3>
                <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                        className={`block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                        className={`block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label htmlFor="altPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Alternative Phone
                  </label>
                  <input
                    type="tel"
                    id="altPhone"
                    name="altPhone"
                    value={formData.altPhone || ''}
                    onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter alternative phone"
                  />
                </div>

                <div>
                      <label htmlFor="industryId" className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    id="industryId"
                    name="industryId"
                    value={formData.industryId || ''}
                    onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select industry</option>
                    {industries.map(industry => (
                      <option key={industry.value} value={industry.value}>
                        {industry.label}
                      </option>
                    ))}
                  </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Address Information
                </h3>
              <div className="space-y-4">
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state || ''}
                      onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode || ''}
                      onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>

                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country || ''}
                    onChange={handleInputChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter country"
                  />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Additional Information
                </h3>
                <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-2">
                    Tax ID
                  </label>
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    value={formData.taxId || ''}
                    onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter tax ID"
                  />
                    </div>
                </div>

                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                      rows={4}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add notes about this client..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Fixed at bottom */}
          <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-t border-gray-200 bg-gray-50`}>
            <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
                className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                  </>
              ) : (
                'Create Client'
              )}
            </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientModal;
