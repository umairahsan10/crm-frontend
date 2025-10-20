/**
 * Client Details Drawer - Following EXACT style of LeadDetailsDrawer
 */

import React, { useState, useEffect } from 'react';
import { useNavbar } from '../../context/NavbarContext';
import { useUpdateClient } from '../../hooks/queries/useClientsQueries';
import type { Client, ClientType, ClientStatus } from '../../types';

interface ClientDetailsDrawerProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onClientUpdated?: (updatedClient: Client) => void;
}

const ClientDetailsDrawer: React.FC<ClientDetailsDrawerProps> = ({
  client,
  isOpen,
  onClose,
  onClientUpdated
}) => {
  const { isNavbarOpen } = useNavbar();
  const [activeTab, setActiveTab] = useState<'details' | 'edit'>('details');
  const [isMobile, setIsMobile] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    clientType: '' as ClientType,
    companyName: '',
    clientName: '',
    email: '',
    phone: '',
    altPhone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    industry: '',
    taxId: '',
    accountStatus: '' as ClientStatus,
    notes: ''
  });

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Populate edit form when client changes
  useEffect(() => {
    if (client) {
      setEditForm({
        clientType: client.clientType || 'individual',
        companyName: client.companyName || '',
        clientName: client.clientName || '',
        email: client.email || '',
        phone: client.phone || '',
        altPhone: client.altPhone || '',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        postalCode: client.postalCode || '',
        country: client.country || '',
        industry: typeof client.industry === 'string' ? client.industry : (client.industry?.name || ''),
        taxId: client.taxId || '',
        accountStatus: client.accountStatus || 'prospect',
        notes: client.notes || ''
      });
      setActiveTab('details');
    }
  }, [client]);

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateClientMutation = useUpdateClient();

  const handleUpdateClient = async () => {
    if (!client) return;
    
    try {
      setIsUpdating(true);
      
      // Prepare the data for the API - map industry string to industryId number
      const apiData = {
        ...editForm,
        // Convert industry string to industryId number if needed
        industryId: editForm.industry ? parseInt(editForm.industry) : undefined,
        // Remove the industry string field as API expects industryId
        industry: undefined
      };
      
      // Remove undefined values to avoid sending empty fields
      const cleanData = Object.fromEntries(
        Object.entries(apiData).filter(([_, value]) => value !== undefined && value !== '')
      );
      
      console.log('Sending update data:', cleanData);
      
      // Use the mutation to update the client
      const result = await updateClientMutation.mutateAsync({
        id: client.id,
        data: cleanData
      });
      
      if (result.success && result.data) {
        onClientUpdated?.(result.data);
        setActiveTab('details');
      }
      
    } catch (error) {
      console.error('Error updating client:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string | null | undefined) => {
    const statusClasses = {
      prospect: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      churned: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
      }`}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  const getTypeBadge = (type: string | null | undefined) => {
    const typeClasses = {
      individual: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-indigo-100 text-indigo-800',
      smb: 'bg-green-100 text-green-800',
      startup: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        typeClasses[type as keyof typeof typeClasses] || 'bg-gray-100 text-gray-800'
      }`}>
        {type?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  if (!isOpen || !client) return null;

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
          {/* Header - EXACT same style as LeadDetailsDrawer */}
          <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">
                    C
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Client Details
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

          {/* Tabs - Same as LeadDetailsDrawer */}
          <div className="border-b border-gray-200">
            <nav className={`-mb-px flex space-x-8 ${isMobile ? 'px-4' : 'px-6'}`}>
              {[
                { id: 'details', name: 'Details' },
                { id: 'edit', name: 'Edit' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-4'}`}>
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Client Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Client Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                      <p className="text-lg text-gray-900 font-medium">{client.clientName}</p>
                    </div>
                    {client.companyName && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                        <p className="text-lg text-gray-900 font-medium">{client.companyName}</p>
                    </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <p className="text-lg text-gray-900 font-medium">{client.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <p className="text-lg text-gray-900 font-medium">{client.phone}</p>
                    </div>
                    {client.altPhone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alt Phone</label>
                        <p className="text-lg text-gray-900 font-medium">{client.altPhone}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client Type</label>
                      <div className="mt-1">
                        {getTypeBadge(client.clientType)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Assignment */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Status & Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                      <div className="mt-1">
                        {getStatusBadge(client.accountStatus)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {typeof client.industry === 'object' && client.industry && 'name' in client.industry
                          ? (client.industry as any).name 
                          : client.industry || 'N/A'}
                      </p>
                      {typeof client.industry === 'object' && client.industry && 'description' in client.industry && (
                        <p className="text-sm text-gray-600 mt-1">
                          {(client.industry as any).description}
                        </p>
                      )}
                      </div>
                    {(client.assignedTo || client.employee) && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {client.employee 
                            ? `${client.employee.firstName} ${client.employee.lastName} (${client.employee.email})`
                            : client.assignedTo && typeof client.assignedTo === 'string' 
                              ? client.assignedTo 
                              : client.assignedTo && typeof client.assignedTo === 'object'
                                ? `${client.assignedTo.firstName} ${client.assignedTo.lastName}`
                                : 'N/A'}
                      </p>
                    </div>
                    )}
                    {client.totalRevenue !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Revenue</label>
                        <p className="text-lg text-green-600 font-bold">${client.totalRevenue.toLocaleString()}</p>
                      </div>
                    )}
                    {client.satisfactionScore !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Satisfaction Score</label>
                        <p className="text-lg text-blue-600 font-bold">{client.satisfactionScore.toFixed(1)}/5.0</p>
                      </div>
                    )}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {client.address && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                        <p className="text-lg text-gray-900 font-medium">{client.address}</p>
                      </div>
                    )}
                    {client.city && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <p className="text-lg text-gray-900 font-medium">{client.city}</p>
                      </div>
                    )}
                    {client.state && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <p className="text-lg text-gray-900 font-medium">{client.state}</p>
                      </div>
                    )}
                    {client.postalCode && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                        <p className="text-lg text-gray-900 font-medium">{client.postalCode}</p>
                      </div>
                    )}
                    {client.country && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <p className="text-lg text-gray-900 font-medium">{client.country}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* System Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    System Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {client.createdAt ? new Date(client.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {client.updatedAt ? new Date(client.updatedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    {client.employee && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Employee</label>
                        <div className="text-lg text-gray-900 font-medium">
                          <p>{client.employee.firstName} {client.employee.lastName}</p>
                          <p className="text-sm text-gray-600">{client.employee.email}</p>
                        </div>
                      </div>
                    )}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {client.taxId && (
                <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                        <p className="text-lg text-gray-900 font-medium">{client.taxId}</p>
                    </div>
                    )}
                    {client.lastContactDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Contact</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {new Date(client.lastContactDate).toLocaleString()}
                        </p>
                    </div>
                    )}
                    {client.notes && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-sm text-gray-700">{client.notes}</p>
                </div>
              </div>
            )}
                      </div>
                    </div>
                  </div>
            )}

            {activeTab === 'edit' && (
              <div className="space-y-4">
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Client Information
                  </h3>

                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                        <input
                          type="text"
                          value={editForm.clientName}
                          onChange={(e) => handleEditFormChange('clientName', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                        <input
                          type="text"
                          value={editForm.companyName}
                          onChange={(e) => handleEditFormChange('companyName', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleEditFormChange('email', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => handleEditFormChange('phone', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Client Type</label>
                        <select
                          value={editForm.clientType}
                          onChange={(e) => handleEditFormChange('clientType', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="individual">Individual</option>
                          <option value="enterprise">Enterprise</option>
                          <option value="smb">SMB</option>
                          <option value="startup">Startup</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                        <select
                          value={editForm.accountStatus}
                          onChange={(e) => handleEditFormChange('accountStatus', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="prospect">Prospect</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                          <option value="churned">Churned</option>
                        </select>
                    </div>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => handleEditFormChange('notes', e.target.value)}
                      rows={4}
                        placeholder="Add notes about this client..."
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                      onClick={handleUpdateClient}
                      disabled={isUpdating}
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
                          'Update Client'
                      )}
                    </button>
                  </div>
                </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsDrawer;
