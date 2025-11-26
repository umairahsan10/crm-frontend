import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AssetsTable from '../../components/assets/AssetsTable';
import GenericAssetFilters from '../../components/assets/GenericAssetFilters';
import AssetDetailsDrawer from '../../components/assets/AssetDetailsDrawer';
import AssetsStatistics from '../../components/assets/AssetsStatistics';
import { useAssets, useAssetsStatistics } from '../../hooks/queries/useFinanceQueries';
import { createAssetApi } from '../../apis/assets';
import { createVendorApi, getVendorsApi, type CreateVendorRequest, type Vendor } from '../../apis/vendors';
import type { Asset } from '../../types';

interface AssetFormState {
  title: string;
  category: string;
  purchaseDate: string;
  purchaseValue: string;
  currentValue: string;
  vendorId: string;
}

const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Asset form state
  const [assetForm, setAssetForm] = useState<AssetFormState>({
    title: '',
    category: '',
    purchaseDate: '',
    purchaseValue: '',
    currentValue: '',
    vendorId: ''
  });

  // Vendor management state (using local state like AddExpenseDrawer)
  const [vendors, setVendors] = useState<Vendor[]>([]);
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
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    vendorId: '',
    minValue: '',
    maxValue: '',
    purchaseDateFrom: '',
    purchaseDateTo: '',
    sortBy: 'purchaseDate',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // React Query hooks - Data fetching with automatic caching
  const assetsQuery = useAssets(
    pagination.currentPage, 
    pagination.itemsPerPage, 
    filters
  );
  const statisticsQuery = useAssetsStatistics();

  // Extract data and loading states from queries
  const assets = (assetsQuery.data as any)?.data || [];
  const statistics = (statisticsQuery.data as any)?.data || {
    totalAssets: 0,
    totalAmount: 0,
    averageAsset: 0,
    byCategory: {},
    topCategories: [],
    byPaymentMethod: {},
    byProcessedByRole: {},
    thisMonth: {
      count: 0,
      amount: 0
    }
  };
  const isLoading = assetsQuery.isLoading;
  
  // Load vendors manually when needed (same as AddExpenseDrawer)
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

  // Handle form change
  const handleAssetFormChange = (field: keyof AssetFormState, value: string) => {
    setAssetForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update pagination when React Query data changes
  React.useEffect(() => {
    if ((assetsQuery.data as any)?.pagination) {
      setPagination(prev => ({
        ...prev,
        currentPage: (assetsQuery.data as any).pagination.page,
        totalPages: (assetsQuery.data as any).pagination.totalPages,
        totalItems: (assetsQuery.data as any).pagination.total,
      }));
    }
  }, [assetsQuery.data]);

  // Load vendors when create modal opens
  React.useEffect(() => {
    if (showCreateModal && vendors.length === 0) {
      loadVendors();
    }
  }, [showCreateModal]);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!showCreateModal) {
      setAssetForm({
        title: '',
        category: '',
        purchaseDate: '',
        purchaseValue: '',
        currentValue: '',
        vendorId: ''
      });
      setNotification(null);
      setShowCreateVendorModal(false);
    }
  }, [showCreateModal]);

  // Handlers
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleBulkSelect = (assetIds: string[]) => {
    setSelectedAssets(assetIds);
  };

  // Filter handlers
  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      vendorId: '',
      minValue: '',
      maxValue: '',
      purchaseDateFrom: '',
      purchaseDateTo: '',
      sortBy: 'purchaseDate',
      sortOrder: 'desc'
    });
  }, []);

  // Create asset handler
  const handleCreateAsset = async () => {
    // Validation
    if (!assetForm.title.trim()) {
      setNotification({ type: 'error', message: 'Please enter asset title' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (!assetForm.category.trim()) {
      setNotification({ type: 'error', message: 'Please enter category' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    const purchaseValue = parseFloat(assetForm.purchaseValue);
    if (isNaN(purchaseValue) || purchaseValue <= 0) {
      setNotification({ type: 'error', message: 'Please enter a valid purchase value greater than 0' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    const currentValue = parseFloat(assetForm.currentValue);
    if (isNaN(currentValue) || currentValue <= 0) {
      setNotification({ type: 'error', message: 'Please enter a valid current value greater than 0' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (!assetForm.purchaseDate) {
      setNotification({ type: 'error', message: 'Please select purchase date' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (!assetForm.vendorId) {
      setNotification({ type: 'error', message: 'Please select a vendor' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      const assetData = {
        title: assetForm.title.trim(),
        category: assetForm.category.trim(),
        purchaseDate: assetForm.purchaseDate,
        purchaseValue: purchaseValue,
        currentValue: currentValue,
        vendorId: parseInt(assetForm.vendorId)
      };

      await createAssetApi(assetData);
      
      setShowCreateModal(false);
      setAssetForm({
        title: '',
        category: '',
        purchaseDate: '',
        purchaseValue: '',
        currentValue: '',
        vendorId: ''
      });
      setNotification({
        type: 'success',
        message: 'Asset created successfully!'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create asset'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Create vendor handler
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
        handleAssetFormChange('vendorId', response.data.id.toString());
        
        // Close modal and reset form
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

        setNotification({
          type: 'success',
          message: `Vendor "${response.data.name}" created successfully!`
        });
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

  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Back Button */}
              <button
                onClick={() => navigate('/finance')}
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors"
              >
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Finance Overview
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Assets Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Track and manage company assets with depreciation monitoring and vendor management
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Asset
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Panel */}
        {showStatistics && (
          <div className="mb-8">
            <AssetsStatistics 
              statistics={statistics}
              isLoading={statisticsQuery.isLoading}
            />
          </div>
        )}

        {/* Filters */}
        <GenericAssetFilters
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Assets Table */}
        <AssetsTable
          assets={assets}
          isLoading={isLoading}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onAssetClick={handleAssetClick}
          onBulkSelect={handleBulkSelect}
          selectedAssets={selectedAssets}
        />

        {/* Asset Details Drawer */}
        <AssetDetailsDrawer
          asset={selectedAsset}
          isOpen={!!selectedAsset}
          onClose={() => setSelectedAsset(null)}
          viewMode="full"
          onAssetUpdated={(updatedAsset) => {
            // React Query will automatically refetch and update the UI
            setSelectedAsset(updatedAsset);
            setNotification({
              type: 'success',
              message: 'Asset updated successfully!'
            });
            setTimeout(() => setNotification(null), 3000);
          }}
        />

        {/* Create Asset Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Create New Asset</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setAssetForm({
                        title: '',
                        category: '',
                        purchaseDate: '',
                        purchaseValue: '',
                        currentValue: '',
                        vendorId: ''
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateAsset();
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={assetForm.title}
                        onChange={(e) => handleAssetFormChange('title', e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter asset title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={assetForm.category}
                        onChange={(e) => handleAssetFormChange('category', e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter category (e.g., IT Equipment, Furniture)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={assetForm.purchaseDate}
                        onChange={(e) => handleAssetFormChange('purchaseDate', e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Value <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={assetForm.purchaseValue}
                          onChange={(e) => handleAssetFormChange('purchaseValue', e.target.value)}
                          className="block w-full pl-7 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Value <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={assetForm.currentValue}
                          onChange={(e) => handleAssetFormChange('currentValue', e.target.value)}
                          className="block w-full pl-7 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vendor <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={assetForm.vendorId}
                        onChange={(e) => {
                          if (e.target.value === 'create_new') {
                            setShowCreateVendorModal(true);
                          } else {
                            handleAssetFormChange('vendorId', e.target.value);
                          }
                        }}
                        disabled={isLoadingVendors}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                      >
                        <option value="">
                          {isLoadingVendors ? 'Loading vendors...' : 'Select vendor'}
                        </option>
                        {vendors.map((vendor: any) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </option>
                        ))}
                        <option value="create_new" className="font-semibold text-blue-600">
                          ➕ Create New Vendor
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setAssetForm({
                          title: '',
                          category: '',
                          purchaseDate: '',
                          purchaseValue: '',
                          currentValue: '',
                          vendorId: ''
                        });
                      }}
                      className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!assetForm.title.trim() || !assetForm.category.trim() || !assetForm.purchaseDate || !assetForm.purchaseValue || !assetForm.currentValue || !assetForm.vendorId}
                      className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Asset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Create Vendor Modal */}
        {showCreateVendorModal && (
          <div className="fixed inset-0 z-[1200] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => {
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
              }}></div>
              
              <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <svg className="h-6 w-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3">
                    <p className="text-sm text-indigo-700">
                      Create a new vendor to track your asset purchases. All fields are optional except the name.
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
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
            notification.type === 'success' ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'
          }`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={handleCloseNotification}
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

export default AssetsPage;
