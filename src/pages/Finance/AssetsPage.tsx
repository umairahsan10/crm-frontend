import React, { useState, useEffect } from 'react';
import AssetsTable from '../../components/assets/AssetsTable';
import LeadsSearchFilters from '../../components/leads/LeadsSearchFilters';
import { assetsFilterConfig } from '../../components/assets/filterConfigs';
import AssetDetailsDrawer from '../../components/assets/AssetDetailsDrawer';
import AssetsStatistics from '../../components/assets/AssetsStatistics';
// import { getAssetsApi } from '../../apis/assets'; // Uncomment when using real API
import type { Asset } from '../../types';

interface AssetsPageProps {
  onBack?: () => void;
}

const AssetsPage: React.FC<AssetsPageProps> = ({ onBack }) => {
  
  // State management
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showStatistics, setShowStatistics] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Assets state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Mock data generation (matching API structure)
  const generateMockAssets = (): Asset[] => {
    const categories = ['IT Equipment', 'Furniture', 'Vehicles', 'Machinery', 'Office Equipment', 'Software', 'Property', 'Other'];
    const assetNames = [
      'Dell Laptop', 'HP Desktop', 'Office Chair', 'Conference Table', 'Toyota Camry', 'Ford Truck',
      'Printer', 'Scanner', 'Server Rack', 'Network Switch', 'Standing Desk', 'Office Cubicle',
      'Company Van', 'Warehouse Forklift', 'Software License', 'Cloud Storage', 'Building Property'
    ];
    const vendors = [
      { id: 5, name: 'Tech Supplier Inc' },
      { id: 6, name: 'Office Furniture Pro' },
      { id: 7, name: 'Auto Dealership' },
      { id: 8, name: 'Equipment Solutions' },
      { id: 9, name: 'Software Vendor Co' }
    ];
    const employees = [
      { id: 50, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      { id: 51, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
      { id: 52, firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com' },
      { id: 53, firstName: 'Sarah', lastName: 'Williams', email: 'sarah@example.com' }
    ];
    
    const mockAssets: Asset[] = [];

    for (let i = 1; i <= 50; i++) {
      const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
      const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
      const purchaseValue = Math.floor(Math.random() * 50000) + 500;
      const depreciationRate = Math.floor(Math.random() * 30) + 10; // 10-40%
      const yearsOld = Math.random() * 3; // 0-3 years
      const currentValue = purchaseValue * (1 - (depreciationRate / 100) * yearsOld);
      const purchaseDate = new Date(Date.now() - Math.floor(Math.random() * 1095) * 24 * 60 * 60 * 1000); // Up to 3 years ago
      
      mockAssets.push({
        id: i,
        name: assetNames[Math.floor(Math.random() * assetNames.length)] + ` #${i}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        purchaseValue: purchaseValue,
        currentValue: Math.max(currentValue, purchaseValue * 0.2), // At least 20% of purchase value
        purchaseDate: purchaseDate.toISOString(),
        depreciationRate: depreciationRate,
        vendorId: randomVendor.id,
        transactionId: 100 + i,
        createdBy: randomEmployee.id,
        createdAt: purchaseDate.toISOString(),
        updatedAt: purchaseDate.toISOString(),
        transaction: {
          id: 100 + i,
          amount: purchaseValue,
          vendor: randomVendor
        },
        employee: randomEmployee
      });
    }

    return mockAssets;
  };

  // Fetch assets
  const fetchAssets = async (page: number = 1) => {
    try {
      setIsLoading(true);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockData = generateMockAssets();
      
      // Apply filters to mock data
      let filteredData = mockData;
      if (filters.category) {
        filteredData = filteredData.filter(a => a.category === filters.category);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(a => 
          a.name.toLowerCase().includes(searchLower) ||
          a.category.toLowerCase().includes(searchLower) ||
          a.transaction?.vendor?.name.toLowerCase().includes(searchLower)
        );
      }
      if (filters.minPurchaseValue) {
        filteredData = filteredData.filter(a => a.purchaseValue >= parseFloat(filters.minPurchaseValue));
      }
      if (filters.maxPurchaseValue) {
        filteredData = filteredData.filter(a => a.purchaseValue <= parseFloat(filters.maxPurchaseValue));
      }
      if (filters.minCurrentValue) {
        filteredData = filteredData.filter(a => a.currentValue >= parseFloat(filters.minCurrentValue));
      }
      if (filters.maxCurrentValue) {
        filteredData = filteredData.filter(a => a.currentValue <= parseFloat(filters.maxCurrentValue));
      }
      
      setAssets(filteredData.slice(0, 20));
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(filteredData.length / 20),
        totalItems: filteredData.length,
        itemsPerPage: 20
      });
    } catch (error) {
      console.error('Error fetching assets:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load assets'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setStatistics({
        totalAssets: 120,
        totalPurchaseValue: '1,250,000.00',
        totalCurrentValue: '875,000.00',
        totalDepreciation: '375,000.00',
        depreciationRate: '70.0',
        byCategory: {
          itEquipment: 45,
          furniture: 25,
          vehicles: 15,
          machinery: 10,
          officeEquipment: 12,
          software: 8,
          property: 3,
          other: 2
        },
        today: {
          new: 3,
          updated: 5
        }
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAssets();
    fetchStatistics();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchAssets(1);
  }, [filters]);

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

  const handleCreatedByFilter = (createdBy: string) => {
    setFilters(prev => ({ ...prev, createdBy }));
  };

  const handleDateRangeFilter = (fromDate: string, toDate: string) => {
    setFilters(prev => ({ ...prev, fromDate, toDate }));
  };

  const handleMinAmountFilter = (minPurchaseValue: string) => {
    setFilters(prev => ({ ...prev, minPurchaseValue }));
  };

  const handleMaxAmountFilter = (maxPurchaseValue: string) => {
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
        <LeadsSearchFilters
          config={assetsFilterConfig}
          onSearch={handleSearch}
          onTypeFilter={handleCategoryFilter}
          onAssignedToFilter={handleCreatedByFilter}
          onDateRangeFilter={handleDateRangeFilter}
          onMinAmountFilter={handleMinAmountFilter}
          onMaxAmountFilter={handleMaxAmountFilter}
          onCurrentPhaseFilter={handleMinCurrentValueFilter}
          onTotalPhasesFilter={handleMaxCurrentValueFilter}
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
      </div>
    </div>
  );
};

export default AssetsPage;

