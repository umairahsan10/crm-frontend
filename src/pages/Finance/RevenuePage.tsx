import React, { useState, useCallback } from 'react';
import RevenueTable from '../../components/revenue/RevenueTable';
import RevenueDetailsDrawer from '../../components/revenue/RevenueDetailsDrawer';
import AddRevenueDrawer from '../../components/revenue/AddRevenueDrawer';
import GenericRevenueFilters from '../../components/revenue/GenericRevenueFilters';
import RevenueStatistics from '../../components/revenue/RevenueStatistics';
import { useRevenue, useRevenueStatistics } from '../../hooks/queries/useFinanceQueries';
import type { Revenue } from '../../types';

interface RevenuePageProps {
  onBack?: () => void;
}

const RevenuePage: React.FC<RevenuePageProps> = ({ onBack }) => {
  
  // State management
  const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null);
  const [selectedRevenues, setSelectedRevenues] = useState<string[]>([]);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showAddRevenueDrawer, setShowAddRevenueDrawer] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination state
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
    minAmount: '',
    maxAmount: '',
    paymentMethod: '',
    source: '',
    receivedFrom: '',
    relatedInvoiceId: '',
    sortBy: 'receivedOn',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // React Query hooks - Data fetching with automatic caching
  const revenueQuery = useRevenue(
    pagination.currentPage, 
    pagination.itemsPerPage, 
    filters
  );
  const statisticsQuery = useRevenueStatistics();

  // Extract data and loading states from queries
  const revenues = (revenueQuery.data as any)?.data || [];
  const statistics = (statisticsQuery.data as any)?.data || {
    totalRevenue: 0,
    totalAmount: 0,
    averageRevenue: 0,
    byCategory: {},
    bySource: {},
    byPaymentMethod: {},
    thisMonth: {
      count: 0,
      amount: 0
    },
    topGenerators: []
  };
  const isLoading = revenueQuery.isLoading;

  // Update pagination when React Query data changes
  React.useEffect(() => {
    if ((revenueQuery.data as any)?.pagination) {
      setPagination(prev => ({
        ...prev,
        currentPage: (revenueQuery.data as any).pagination.page,
        totalPages: (revenueQuery.data as any).pagination.totalPages,
        totalItems: (revenueQuery.data as any).pagination.total,
      }));
    }
  }, [revenueQuery.data]);

  // Handlers
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleRevenueClick = (revenue: Revenue) => {
    setSelectedRevenue(revenue);
  };

  const handleBulkSelect = (revenueIds: string[]) => {
    setSelectedRevenues(revenueIds);
  };

  // Simplified filter handlers using generic system
  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      fromDate: '',
      toDate: '',
      createdBy: '',
      minAmount: '',
      maxAmount: '',
      paymentMethod: '',
      source: '',
      receivedFrom: '',
      relatedInvoiceId: '',
      sortBy: 'receivedOn',
      sortOrder: 'desc'
    });
  }, []);

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
              <h1 className="text-3xl font-bold text-gray-900">Revenue Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Track and manage revenue streams with comprehensive reporting and analytics
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
                onClick={() => setShowAddRevenueDrawer(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Revenue
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Panel */}
        {showStatistics && (
          <div className="mb-8">
            <RevenueStatistics 
              statistics={statistics}
              isLoading={statisticsQuery.isLoading}
            />
          </div>
        )}

        {/* Filters */}
        <GenericRevenueFilters
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Revenue Table */}
        <RevenueTable
          revenues={revenues}
          isLoading={isLoading}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onRevenueClick={handleRevenueClick}
          onBulkSelect={handleBulkSelect}
          selectedRevenues={selectedRevenues}
        />

        {/* Add Revenue Drawer */}
        <AddRevenueDrawer
          isOpen={showAddRevenueDrawer}
          onClose={() => setShowAddRevenueDrawer(false)}
          onRevenueCreated={() => {
            // React Query will automatically refetch and update the UI
            setNotification({
              type: 'success',
              message: 'Revenue created successfully!'
            });
            setTimeout(() => setNotification(null), 3000);
          }}
        />

        {/* Revenue Details Drawer */}
        <RevenueDetailsDrawer
          revenue={selectedRevenue}
          isOpen={!!selectedRevenue}
          onClose={() => setSelectedRevenue(null)}
          viewMode="full"
          onRevenueUpdated={(updatedRevenue) => {
            // React Query will automatically refetch and update the UI
            setSelectedRevenue(updatedRevenue);
            setNotification({
              type: 'success',
              message: 'Revenue updated successfully!'
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

export default RevenuePage;