import React, { useState, useEffect } from 'react';
import AssetsTable from '../../components/assets/AssetsTable';
import AssetsSearchFilters from '../../components/assets/AssetsSearchFilters';
import AssetDetailsDrawer from '../../components/assets/AssetDetailsDrawer';
import AssetsStatistics from '../../components/assets/AssetsStatistics';
import { getAssetsApi, createAssetApi } from '../../apis/assets';
import { getVendorsApi, createVendorApi, type Vendor, type CreateVendorRequest } from '../../apis/vendors';
import type { Asset } from '../../types';

interface AssetsPageProps {
  onBack?: () => void;
}

interface CreateAssetForm {
  title: string;
  category: string;
  purchaseDate: string;
  purchaseValue: string;
  currentValue: string;
  vendorId: string;
}

const AssetsPage: React.FC<AssetsPageProps> = ({ onBack }) => {
  
  // State management
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Vendor management for create modal
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

  // Assets state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Filters (matching API query parameters)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    fromDate: '',
    toDate: '',
    createdBy: '',
    minPurchaseValue: '',
    maxPurchaseValue: '',
    minCurrentValue: '',
    maxCurrentValue: '',
    sortBy: 'purchaseDate',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Create form state
  const [createForm, setCreateForm] = useState<CreateAssetForm>({
    title: '',
    category: '',
    purchaseDate: '',
    purchaseValue: '',
    currentValue: '',
    vendorId: ''
  });

  // Data state
  const [statistics, setStatistics] = useState({
    totalAssets: 0,
    totalPurchaseValue: '0',
    totalCurrentValue: '0',
    totalDepreciation: '0',
    depreciationRate: '0',
    byCategory: {
      itEquipment: 0,
      furniture: 0,
      vehicles: 0,
      machinery: 0,
      officeEquipment: 0,
      software: 0,
      property: 0,
      other: 0
    },
    today: {
      new: 0,
      updated: 0
    }
  });

  // Fetch assets
  const fetchAssets = async (page: number = 1) => {
    try {
      setIsLoading(true);
      console.log('🔄 Fetching assets - page:', page);
      
      const response = await getAssetsApi(page, pagination.itemsPerPage, {
        category: filters.category || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        createdBy: filters.createdBy || undefined,
        minPurchaseValue: filters.minPurchaseValue || undefined,
        maxPurchaseValue: filters.maxPurchaseValue || undefined,
        minCurrentValue: filters.minCurrentValue || undefined,
        maxCurrentValue: filters.maxCurrentValue || undefined,
      });

      console.log('✅ Assets fetched successfully:', response);

      if (response.success && response.data) {
        setAssets(response.data);
        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.page,
            totalPages: response.pagination.totalPages,
            totalItems: response.pagination.total,
            itemsPerPage: response.pagination.limit
          });
        }

        // Calculate statistics from data
        calculateStatistics(response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching assets:', error);
      setAssets([]);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load assets'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics from assets
  const calculateStatistics = (assetsData: Asset[]) => {
    const totalPurchaseValue = assetsData.reduce((sum, asset) => sum + asset.purchaseValue, 0);
    const totalCurrentValue = assetsData.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalDepreciation = totalPurchaseValue - totalCurrentValue;
    const depreciationRate = totalPurchaseValue > 0 ? (totalCurrentValue / totalPurchaseValue * 100) : 0;

    const categoryCounts: Record<string, number> = {
      itEquipment: 0,
      furniture: 0,
      vehicles: 0,
      machinery: 0,
      officeEquipment: 0,
      software: 0,
      property: 0,
      other: 0
    };

    assetsData.forEach(asset => {
      const categoryKey = asset.category.toLowerCase().replace(/\s+/g, '');
      if (categoryKey in categoryCounts) {
        categoryCounts[categoryKey as keyof typeof categoryCounts]++;
      } else {
        categoryCounts.other++;
      }
    });

    setStatistics({
      totalAssets: assetsData.length,
      totalPurchaseValue: totalPurchaseValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalCurrentValue: totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalDepreciation: totalDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      depreciationRate: depreciationRate.toFixed(1),
      byCategory: categoryCounts as any,
      today: {
        new: 0,
        updated: 0
      }
    });
  };

  // Load data on component mount
  useEffect(() => {
    fetchAssets();
  }, []);

  // Load vendors when create modal opens
  useEffect(() => {
    if (showCreateModal && vendors.length === 0) {
      loadVendors();
    }
  }, [showCreateModal]);

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
    } finally {
      setIsLoadingVendors(false);
    }
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
        setCreateForm(prev => ({ ...prev, vendorId: response.data!.id.toString() }));
        
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

  // Refetch when filters change
  useEffect(() => {
    if (!isLoading) {
      fetchAssets(1);
    }
  }, [filters.category, filters.fromDate, filters.toDate, filters.createdBy, filters.minPurchaseValue, filters.maxPurchaseValue, filters.minCurrentValue, filters.maxCurrentValue]);

  // Handlers
  const handlePageChange = (page: number) => {
    fetchAssets(page);
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleBulkSelect = (assetIds: string[]) => {
    setSelectedAssets(assetIds);
  };

  // Filter handlers (matching API query parameters)
  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handleDateRangeFilter = (fromDate: string, toDate: string) => {
    setFilters(prev => ({ ...prev, fromDate, toDate }));
  };

  const handleMinPurchaseValueFilter = (minPurchaseValue: string) => {
    setFilters(prev => ({ ...prev, minPurchaseValue }));
  };

  const handleMaxPurchaseValueFilter = (maxPurchaseValue: string) => {
    setFilters(prev => ({ ...prev, maxPurchaseValue }));
  };

  const handleMinCurrentValueFilter = (minCurrentValue: string) => {
    setFilters(prev => ({ ...prev, minCurrentValue }));
  };

  const handleMaxCurrentValueFilter = (maxCurrentValue: string) => {
    setFilters(prev => ({ ...prev, maxCurrentValue }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      fromDate: '',
      toDate: '',
      createdBy: '',
      minPurchaseValue: '',
      maxPurchaseValue: '',
      minCurrentValue: '',
      maxCurrentValue: '',
      sortBy: 'purchaseDate',
      sortOrder: 'desc'
    });
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Create asset handlers
  const handleCreateFormChange = (field: keyof CreateAssetForm, value: string) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateAsset = async () => {
    console.log('🔵 Creating asset with form data:', createForm);
    
    // Validation
    if (!createForm.title.trim()) {
      setNotification({ type: 'error', message: 'Please enter asset title' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (!createForm.category.trim()) {
      setNotification({ type: 'error', message: 'Please enter category' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    const purchaseValue = parseFloat(createForm.purchaseValue);
    const currentValue = parseFloat(createForm.currentValue);
    const vendorId = parseInt(createForm.vendorId);

    console.log('🔍 Parsed values:', { purchaseValue, currentValue, vendorId });

    if (isNaN(purchaseValue) || purchaseValue <= 0) {
      setNotification({ type: 'error', message: 'Please enter valid purchase value' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (isNaN(currentValue) || currentValue <= 0) {
      setNotification({ type: 'error', message: 'Please enter valid current value' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (isNaN(vendorId) || vendorId <= 0) {
      setNotification({ type: 'error', message: 'Please select a vendor' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      setIsCreating(true);

      console.log('📤 Calling createAssetApi with:', {
        title: createForm.title,
        category: createForm.category,
        purchaseDate: createForm.purchaseDate || undefined,
        purchaseValue,
        currentValue,
        vendorId
      });

      const response = await createAssetApi({
        title: createForm.title,
        category: createForm.category,
        purchaseDate: createForm.purchaseDate || undefined,
        purchaseValue,
        currentValue,
        vendorId
      });

      console.log('✅ Create asset response:', response);

      if (response.success) {
        setNotification({ type: 'success', message: response.message || 'Asset created successfully!' });
        setTimeout(() => setNotification(null), 3000);
        
        // Reset form and close modal
        setCreateForm({
          title: '',
          category: '',
          purchaseDate: '',
          purchaseValue: '',
          currentValue: '',
          vendorId: ''
        });
        setShowCreateModal(false);

        // Refresh assets list
        console.log('🔄 Refreshing assets list...');
        fetchAssets(pagination.currentPage);
      }
    } catch (error) {
      console.error('❌ Error creating asset:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create asset'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Back Button */}
              {onBack && (
                <button
                  onClick={onBack}
                  className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                  <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Finance Overview
                </button>
              )}
              <h1 className="text-3xl font-bold text-gray-900">Assets Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Track and manage company assets with depreciation monitoring
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showStatistics ? 'Hide Stats' : 'Show Stats'}
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

        {/* Statistics Dashboard */}
        {showStatistics && (
          <div className="mb-8">
            <AssetsStatistics statistics={statistics} isLoading={false} />
          </div>
        )}

        {/* Search Filters */}
        <AssetsSearchFilters
          onSearch={handleSearch}
          onCategoryFilter={handleCategoryFilter}
          onDateRangeFilter={handleDateRangeFilter}
          onMinPurchaseValueFilter={handleMinPurchaseValueFilter}
          onMaxPurchaseValueFilter={handleMaxPurchaseValueFilter}
          onMinCurrentValueFilter={handleMinCurrentValueFilter}
          onMaxCurrentValueFilter={handleMaxCurrentValueFilter}
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
            // Update the assets array
            setAssets(prev => prev.map(asset => 
              asset.id === updatedAsset.id ? updatedAsset : asset
            ));
            
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
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !isCreating && setShowCreateModal(false)}></div>

              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Asset</h3>
                    <button
                      onClick={() => !isCreating && setShowCreateModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Asset Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={createForm.title}
                        onChange={(e) => handleCreateFormChange('title', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter asset title"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={createForm.category}
                        onChange={(e) => handleCreateFormChange('category', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter category (e.g., IT Equipment, Furniture)"
                      />
                    </div>

                    {/* Purchase Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purchase Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={createForm.purchaseDate}
                        onChange={(e) => handleCreateFormChange('purchaseDate', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    {/* Purchase Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purchase Value <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={createForm.purchaseValue}
                          onChange={(e) => handleCreateFormChange('purchaseValue', e.target.value)}
                          className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Current Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Value <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={createForm.currentValue}
                          onChange={(e) => handleCreateFormChange('currentValue', e.target.value)}
                          className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Vendor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendor <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={createForm.vendorId}
                        onChange={(e) => {
                          if (e.target.value === 'create_new') {
                            setShowCreateVendorModal(true);
                          } else {
                            handleCreateFormChange('vendorId', e.target.value);
                          }
                        }}
                        disabled={isLoadingVendors}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                      >
                        <option value="">
                          {isLoadingVendors ? 'Loading vendors...' : 'Select vendor'}
                        </option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </option>
                        ))}
                        <option value="create_new" className="font-semibold text-indigo-600">
                          ➕ Create New Vendor
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      type="button"
                      onClick={() => !isCreating && setShowCreateModal(false)}
                      disabled={isCreating}
                      className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateAsset}
                      disabled={isCreating}
                      className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isCreating ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </span>
                      ) : (
                        'Create Asset'
                      )}
                    </button>
                  </div>
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
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className={`text-sm font-medium ${
                    notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={handleCloseNotification}
                    className={`bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      notification.type === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'
                    }`}
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

        {/* Create Vendor Modal */}
        {showCreateVendorModal && (
          <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setShowCreateVendorModal(false)}></div>
              
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
                      onClick={() => setShowCreateVendorModal(false)}
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
                      Create a new vendor to track your asset purchases and expenses. All fields are optional except the name.
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
                      placeholder="e.g., Tech Suppliers Inc"
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
                    onClick={() => setShowCreateVendorModal(false)}
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
      </div>
    </div>
  );
};

export default AssetsPage;
