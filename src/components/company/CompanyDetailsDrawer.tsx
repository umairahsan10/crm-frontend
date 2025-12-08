
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useNavbar } from '../../context/NavbarContext';
import { updateCompanyApi } from '../../apis/company';
import type { Company } from '../../apis/company';

interface CompanyDetailsDrawerProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onCompanyUpdated?: (updatedCompany: Company) => void;
}

const CompanyDetailsDrawer: React.FC<CompanyDetailsDrawerProps> = ({
  company,
  isOpen,
  onClose,
  onCompanyUpdated
}) => {
  useAuth();
  const { isNavbarOpen } = useNavbar();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'details' | 'edit'>('details');
  const [isMobile, setIsMobile] = useState(false);
  const [isUpdating] = useState(false);
  
  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Company> }) => updateCompanyApi(id, data),
    onSuccess: (updatedCompany) => {
      console.log('✅ Company updated successfully:', updatedCompany);
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2';
      toast.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Company updated successfully! Status: ${updatedCompany.status || 'Success'}</span>
      `;
      document.body.appendChild(toast);
      
      // Remove toast after 3 seconds
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 3000);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company-statistics'] });
      
      // Close drawer and reset
      onCompanyUpdated?.(updatedCompany);
      setActiveTab('details');
      onClose();
    },
    onError: (error: any) => {
      console.error('❌ Failed to update company:', error);
      
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2';
      toast.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span>Failed to update company. Status: ${error?.response?.status || 'Error'}</span>
      `;
      document.body.appendChild(toast);
      
      // Remove toast after 5 seconds
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 5000);
    }
  });
  
  // Edit form state
  const [editForm, setEditForm] = useState<Partial<Company>>({
    monthlyLeaveAccrual: 2,
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    status: 'active',
    quarterlyLeavesDays: 0,
    monthlyLatesDays: 0,
    absentDeduction: 0,
    lateDeduction: 0,
    halfDeduction: 0,
    taxId: '',
    lateTime: 0,
    halfTime: 0,
    absentTime: 0
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

  // Populate forms when company changes
  useEffect(() => {
    if (company && isOpen) {
      setEditForm({
        monthlyLeaveAccrual: company.monthlyLeaveAccrual ?? 2,
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        website: company.website || '',
        industry: company.industry || '',
        size: company.size || '',
        status: (company.status as 'active' | 'inactive') || 'active',
        type: company.type || '',
        location: company.location || '',
        revenue: company.revenue || '',
        employees: company.employees || 0,
        founded: company.founded || '',
        description: company.description || '',
        assignedTo: company.assignedTo || ''
      });

    }
  }, [company, isOpen]);

  // Reset state when drawer is closed
  useEffect(() => {
    if (!isOpen) {
      setNotification(null);
    }
  }, [isOpen]);

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateCompany = async () => {
    if (!company) return;
    
    updateCompanyMutation.mutate({ 
      id: company.id, 
      data: editForm 
    });
  };


  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          UNKNOWN
        </span>
      );
    }

    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      prospect: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
      }`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-600 bg-opacity-50" onClick={onClose}></div>
      
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
                    C
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Company Details
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
                {/* Company Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Company Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      <p className="text-lg text-gray-900 font-medium">{company.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <p className="text-lg text-gray-900 font-medium">{company.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <p className="text-lg text-gray-900 font-medium">{company.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <p className="text-lg text-gray-900 font-medium">
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {company.website}
                        </a>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {company.industry}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        {company.size}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Assignment */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Status & Assignment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                      <div className="mt-1">
                        {getStatusBadge(company.status)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Type</label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {company.type?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {company.assignedTo || 'Unassigned'}
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <p className="text-lg text-gray-900 font-medium">{company.location}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Revenue</label>
                        <p className="text-lg text-gray-900 font-medium">{company.revenue}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employees</label>
                        <p className="text-lg text-gray-900 font-medium">{company.employees}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Founded</label>
                        <p className="text-lg text-gray-900 font-medium">{company.founded}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {company.createdAt ? new Date(company.createdAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {company.updatedAt ? new Date(company.updatedAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <p className="text-base text-gray-900 bg-gray-50 p-4 rounded-lg">
                        {company.description || 'No description available'}
                      </p>
                    </div>
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
                    Edit Company Information
                  </h3>
                  
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => handleEditFormChange('name', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleEditFormChange('email', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => handleEditFormChange('phone', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <input
                          type="url"
                          value={editForm.website}
                          onChange={(e) => handleEditFormChange('website', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <input
                          type="text"
                          value={editForm.address}
                          onChange={(e) => handleEditFormChange('address', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => handleEditFormChange('city', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          value={editForm.state}
                          onChange={(e) => handleEditFormChange('state', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                        <input
                          type="text"
                          value={editForm.zip}
                          onChange={(e) => handleEditFormChange('zip', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <select
                          value={editForm.country}
                          onChange={(e) => handleEditFormChange('country', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Country</option>
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="Australia">Australia</option>
                          <option value="Japan">Japan</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={editForm.status}
                          onChange={(e) => handleEditFormChange('status', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    {/* HR Configuration Section */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        HR Configuration
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Leave Accrual <span className="text-blue-600">(Default: 2)</span></label>
                          <input
                            type="number"
                            value={editForm.monthlyLeaveAccrual || 2}
                            onChange={(e) => handleEditFormChange('monthlyLeaveAccrual', (parseInt(e.target.value) || 2).toString())}
                            className="block w-full px-4 py-3 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                          />
                          <span className="text-xs text-gray-500">Number of leaves accrued per month. Unused leaves are carried forward.</span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Quarterly Leave Days (legacy)</label>
                          <input
                            type="number"
                            value={editForm.quarterlyLeavesDays}
                            onChange={(e) => handleEditFormChange('quarterlyLeavesDays', (parseInt(e.target.value) || 0).toString())}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Lates Days</label>
                          <input
                            type="number"
                            value={editForm.monthlyLatesDays}
                            onChange={(e) => handleEditFormChange('monthlyLatesDays', (parseInt(e.target.value) || 0).toString())}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Absent Deduction</label>
                          <input
                            type="number"
                            value={editForm.absentDeduction}
                            onChange={(e) => handleEditFormChange('absentDeduction', (parseInt(e.target.value) || 0).toString())}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Late Deduction</label>
                          <input
                            type="number"
                            value={editForm.lateDeduction}
                            onChange={(e) => handleEditFormChange('lateDeduction', (parseInt(e.target.value) || 0).toString())}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Half Day Deduction</label>
                          <input
                            type="number"
                            value={editForm.halfDeduction}
                            onChange={(e) => handleEditFormChange('halfDeduction', (parseInt(e.target.value) || 0).toString())}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                          <input
                            type="text"
                            value={editForm.taxId}
                            onChange={(e) => handleEditFormChange('taxId', e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Late Time (minutes)</label>
                          <input
                            type="number"
                            value={editForm.lateTime}
                            onChange={(e) => handleEditFormChange('lateTime', (parseInt(e.target.value) || 0).toString())}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Half Time (hours)</label>
                          <input
                            type="number"
                            value={editForm.halfTime}
                            onChange={(e) => handleEditFormChange('halfTime', (parseInt(e.target.value) || 0).toString())}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Absent Time (hours)</label>
                          <input
                            type="number"
                            value={editForm.absentTime}
                            onChange={(e) => handleEditFormChange('absentTime', (parseInt(e.target.value) || 0).toString())}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </div>
                      </div>
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
                        onClick={handleUpdateCompany}
                        disabled={isUpdating || !editForm.name || !editForm.email}
                        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          'Update Company'
                        )}
                      </button>
                    </div>
                  </form>
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

export default CompanyDetailsDrawer;

