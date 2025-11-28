import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import LiabilitiesTable from '../../components/liabilities/LiabilitiesTable';
import LiabilitiesStatistics from '../../components/liabilities/LiabilitiesStatistics';
import LiabilityDetailsDrawer from '../../components/liabilities/LiabilityDetailsDrawer';
import AddLiabilityDrawer from '../../components/liabilities/AddLiabilityDrawer';
import GenericLiabilityFilters from '../../components/liabilities/GenericLiabilityFilters';
import { useLiabilities, useLiabilitiesStatistics, financeQueryKeys } from '../../hooks/queries/useFinanceQueries';
import type { Liability } from '../../types';

interface LiabilitiesFilters {
  search: string;
  isPaid: string;
  relatedVendorId: string;
  category: string;
  fromDate: string;
  toDate: string;
  createdBy: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const LiabilitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Track if an update was made in the current drawer session
  const hasUpdateBeenMade = useRef(false);
  // State management
  const [selectedLiability, setSelectedLiability] = useState<Liability | null>(null);
  const [selectedLiabilities, setSelectedLiabilities] = useState<string[]>([]);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showAddLiabilityDrawer, setShowAddLiabilityDrawer] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 1
  });

  // Filters state
  const [filters, setFilters] = useState<LiabilitiesFilters>({
    search: '',
    isPaid: '',
    relatedVendorId: '',
    category: '',
    fromDate: '',
    toDate: '',
    createdBy: '',
    sortBy: 'dueDate',
    sortOrder: 'desc'
  });

  // React Query hooks - Data fetching with automatic caching
  const liabilitiesQuery = useLiabilities(
    pagination.currentPage, 
    pagination.itemsPerPage, 
    filters
  );
  const statisticsQuery = useLiabilitiesStatistics();
  // const vendorsQuery = useVendors(); // Not used in current implementation

  // Extract data and loading states from queries
  const liabilities = (liabilitiesQuery.data as any)?.data || [];
  const statistics = (statisticsQuery.data as any)?.data || {
    totalLiabilities: 0,
    totalAmount: 0,
    averageLiability: 0,
    byCategory: {},
    topCategories: [],
    byPaymentMethod: {},
    byProcessedByRole: {},
    thisMonth: {
      count: 0,
      amount: 0
    }
  };
  // const vendors = (vendorsQuery.data as any)?.data || []; // Not used in current implementation
  const isLoading = liabilitiesQuery.isLoading;
  // const isLoadingVendors = vendorsQuery.isLoading; // Not used in current implementation

  // Update pagination when React Query data changes
  React.useEffect(() => {
    if ((liabilitiesQuery.data as any)?.pagination) {
      setPagination(prev => ({
        ...prev,
        currentPage: (liabilitiesQuery.data as any).pagination.page,
        totalPages: (liabilitiesQuery.data as any).pagination.totalPages,
        totalItems: (liabilitiesQuery.data as any).pagination.total,
      }));
    }
  }, [liabilitiesQuery.data]);

  // Handlers
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleLiabilityClick = (liability: Liability) => {
    hasUpdateBeenMade.current = false; // Reset when opening drawer
    setSelectedLiability(liability);
  };

  const handleBulkSelect = (liabilityIds: string[]) => {
    setSelectedLiabilities(liabilityIds);
  };

  // Filter handlers
  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      isPaid: '',
      relatedVendorId: '',
      category: '',
      fromDate: '',
      toDate: '',
      createdBy: '',
      sortBy: 'dueDate',
      sortOrder: 'desc'
    });
  }, []);

  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Handle drawer close - refetch data if update was made
  const handleDrawerClose = useCallback(() => {
    setSelectedLiability(null);
    // Only refetch if an update was made
    if (hasUpdateBeenMade.current) {
      // Explicitly refetch liabilities data (GET API call)
      liabilitiesQuery.refetch();
      statisticsQuery.refetch();
      hasUpdateBeenMade.current = false; // Reset the flag
    }
  }, [liabilitiesQuery, statisticsQuery]);

  // Handle liability update - mark that update was made
  const handleLiabilityUpdated = useCallback((updatedLiability: Liability) => {
    setSelectedLiability(updatedLiability);
    // Mark that an update was made (table will refresh when drawer closes)
    hasUpdateBeenMade.current = true;
    setNotification({
      type: 'success',
      message: 'Liability updated successfully!'
    });
    setTimeout(() => setNotification(null), 3000);
  }, []);

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
              <h1 className="text-3xl font-bold text-gray-900">Liabilities Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Track and manage company liabilities, debts, and payment obligations
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
                onClick={() => setShowAddLiabilityDrawer(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Liability
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Panel */}
        {showStatistics && (
          <div className="mb-8">
            <LiabilitiesStatistics 
              statistics={statistics}
              isLoading={statisticsQuery.isLoading}
            />
          </div>
        )}

        {/* Filters */}
        <GenericLiabilityFilters
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Liabilities Table */}
        <LiabilitiesTable
          liabilities={liabilities}
          isLoading={isLoading}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onLiabilityClick={handleLiabilityClick}
          onBulkSelect={handleBulkSelect}
          selectedLiabilities={selectedLiabilities}
        />

        {/* Add Liability Drawer */}
        <AddLiabilityDrawer
          isOpen={showAddLiabilityDrawer}
          onClose={() => setShowAddLiabilityDrawer(false)}
          onLiabilityCreated={() => {
            // React Query will automatically refetch and update the UI
            setNotification({
              type: 'success',
              message: 'Liability created successfully!'
            });
            setTimeout(() => setNotification(null), 3000);
          }}
        />

        {/* Liability Details Drawer */}
        <LiabilityDetailsDrawer
          liability={selectedLiability}
          isOpen={!!selectedLiability}
          onClose={handleDrawerClose}
          viewMode="full"
          onLiabilityUpdated={handleLiabilityUpdated}
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

export default LiabilitiesPage;