import React, { useState, useCallback } from 'react';
import AssetsTable from '../../components/assets/AssetsTable';
import GenericAssetFilters from '../../components/assets/GenericAssetFilters';
import AssetDetailsDrawer from '../../components/assets/AssetDetailsDrawer';
import AssetsStatistics from '../../components/assets/AssetsStatistics';
import { useAssets, useAssetsStatistics, useVendors } from '../../hooks/queries/useFinanceQueries';
import { createAssetApi } from '../../apis/assets';
import { createVendorApi, type CreateVendorRequest } from '../../apis/vendors';
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
  const vendorsQuery = useVendors();

  // Extract data and loading states from queries
  const assets = (assetsQuery.data as any)?.data || [];
  const statistics = (statisticsQuery.data as any)?.data || {
    totalAssets: 0,
    totalValue: 0,
    totalPurchaseValue: 0,
    totalDepreciation: 0,
    byCategory: {},
    recentAssets: []
  };
  const vendors = (vendorsQuery.data as any)?.data || [];
  const isLoading = assetsQuery.isLoading;
  // const isLoadingVendors = vendorsQuery.isLoading; // Not used in current implementation

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
  const handleCreateAsset = async (formData: CreateAssetForm) => {
    try {
      const assetData = {
        title: formData.title,
        category: formData.category,
        purchaseDate: formData.purchaseDate,
        purchaseValue: parseFloat(formData.purchaseValue),
        currentValue: parseFloat(formData.currentValue),
        vendorId: parseInt(formData.vendorId)
      };

      await createAssetApi(assetData);
      
      setShowCreateModal(false);
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
    try {
      setIsCreatingVendor(true);
      
      const vendorData: CreateVendorRequest = {
        name: newVendorForm.name,
        contact_person: newVendorForm.contact_person,
        email: newVendorForm.email,
        phone: newVendorForm.phone,
        address: newVendorForm.address,
        city: newVendorForm.city,
        country: newVendorForm.country,
        bank_account: newVendorForm.bank_account,
        status: newVendorForm.status as 'active' | 'inactive',
        notes: newVendorForm.notes
      };

      await createVendorApi(vendorData);
      
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
        message: 'Vendor created successfully!'
      });
      setTimeout(() => setNotification(null), 3000);
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
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Asset</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  handleCreateAsset({
                    title: formData.get('title') as string,
                    category: formData.get('category') as string,
                    purchaseDate: formData.get('purchaseDate') as string,
                    purchaseValue: formData.get('purchaseValue') as string,
                    currentValue: formData.get('currentValue') as string,
                    vendorId: formData.get('vendorId') as string
                  });
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        name="title"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <input
                        type="text"
                        name="category"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                      <input
                        type="date"
                        name="purchaseDate"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Purchase Value</label>
                      <input
                        type="number"
                        name="purchaseValue"
                        step="0.01"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Value</label>
                      <input
                        type="number"
                        name="currentValue"
                        step="0.01"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vendor</label>
                      <div className="flex space-x-2">
                        <select
                          name="vendorId"
                          required
                          className="mt-1 block flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select Vendor</option>
                          {vendors.map((vendor: any) => (
                            <option key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowCreateVendorModal(true)}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          + New
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Vendor</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateVendor();
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={newVendorForm.name}
                        onChange={(e) => setNewVendorForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                      <input
                        type="text"
                        value={newVendorForm.contact_person}
                        onChange={(e) => setNewVendorForm(prev => ({ ...prev, contact_person: e.target.value }))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={newVendorForm.email}
                        onChange={(e) => setNewVendorForm(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={newVendorForm.phone}
                        onChange={(e) => setNewVendorForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateVendorModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingVendor}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isCreatingVendor ? 'Creating...' : 'Create Vendor'}
                    </button>
                  </div>
                </form>
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