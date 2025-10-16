import React, { useState, useEffect, useCallback } from 'react';
import RevenueTable from '../../components/revenue/RevenueTable';
import RevenueDetailsDrawer from '../../components/revenue/RevenueDetailsDrawer';
import AddRevenueDrawer from '../../components/revenue/AddRevenueDrawer';
import GenericRevenueFilters from '../../components/revenue/GenericRevenueFilters';
import RevenueStatistics from '../../components/revenue/RevenueStatistics';
import { getRevenuesApi } from '../../apis/revenue';
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

  // Revenues state
  const [revenues, setRevenues] = useState<Revenue[]>([]);
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
    minAmount: '',
    maxAmount: '',
    paymentMethod: '',
    source: '',
    receivedFrom: '',
    relatedInvoiceId: '',
    sortBy: 'receivedOn',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Data state
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    pendingRevenue: 0,
    completedRevenue: 0,
    totalAmount: '0',
    collectionRate: '0%',
    byStatus: {
      pending: 0,
      completed: 0,
      failed: 0,
      cancelled: 0
    },
    byCategory: {
      softwareDevelopment: 0,
      consulting: 0,
      productSales: 0,
      subscription: 0,
      support: 0,
      training: 0,
      license: 0,
      other: 0
    },
    today: {
      new: 0,
      completed: 0,
      pending: 0
    }
  });

  // Fetch revenues from database
  const fetchRevenues = async (page: number = 1) => {
    try {
      setIsLoading(true);
      
      console.log('📤 [REVENUE] Fetching revenues - Page:', page, 'Filters:', filters);
      console.log('📤 [REVENUE] Calling getRevenuesApi...');
      
      const response = await getRevenuesApi(page, pagination.itemsPerPage, {
        category: filters.category || undefined,
        source: filters.source || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        createdBy: filters.createdBy || undefined,
        minAmount: filters.minAmount || undefined,
        maxAmount: filters.maxAmount || undefined,
        paymentMethod: filters.paymentMethod || undefined,
        receivedFrom: filters.receivedFrom || undefined,
        relatedInvoiceId: filters.relatedInvoiceId || undefined,
        search: filters.search || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });
      
      console.log('✅ [REVENUE] API Response received:', response);
      console.log('✅ [REVENUE] Response data:', response.data);
      console.log('✅ [REVENUE] Response pagination:', response.pagination);
      
      if (response.success && response.data) {
        console.log(`✅ [REVENUE] Setting ${response.data.length} revenues to state`);
        setRevenues(response.data);
        
        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.page,
            totalPages: response.pagination.totalPages,
            totalItems: response.pagination.total,
            itemsPerPage: pagination.itemsPerPage
          });
          console.log('✅ [REVENUE] Pagination updated:', response.pagination);
        }
      } else {
        console.warn('⚠️ [REVENUE] Response not successful or no data');
      }
    } catch (error) {
      console.error('❌ [REVENUE] Error fetching revenues:', error);
      console.error('❌ [REVENUE] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load revenues'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsLoading(false);
      console.log('✅ [REVENUE] Fetch complete. Loading state set to false');
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setStatistics({
        totalRevenue: 200,
        pendingRevenue: 25,
        completedRevenue: 165,
        totalAmount: '2,456,789.00',
        collectionRate: '92.5%',
        byStatus: {
          pending: 25,
          completed: 165,
          failed: 8,
          cancelled: 2
        },
        byCategory: {
          softwareDevelopment: 80,
          consulting: 45,
          productSales: 30,
          subscription: 20,
          support: 10,
          training: 8,
          license: 5,
          other: 2
        },
        today: {
          new: 12,
          completed: 18,
          pending: 5
        }
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    console.log('🔵 [REVENUE] Component mounted - fetching revenues...');
    console.log('🔵 [REVENUE] Initial state - isLoading:', isLoading);
    console.log('🔵 [REVENUE] Initial state - revenues:', revenues);
    fetchRevenues(1).then(() => {
      console.log('🔵 [REVENUE] Initial fetch completed');
    });
    fetchStatistics();
  }, []);

  // Refetch when filters change (skip on initial mount)
  const [isInitialMount, setIsInitialMount] = useState(true);
  
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }
    console.log('🔄 [REVENUE] Filters changed - refetching...');
    fetchRevenues(1);
  }, [filters.search, filters.category, filters.source, filters.fromDate, filters.toDate, filters.createdBy, filters.minAmount, filters.maxAmount, filters.paymentMethod, filters.receivedFrom, filters.relatedInvoiceId]);

  // Handlers
  const handlePageChange = (page: number) => {
    fetchRevenues(page);
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
                Track and manage revenue with advanced filtering and transaction monitoring
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showStatistics ? 'Hide Stats' : 'Show Stats'}
              </button>
              <button
                onClick={() => setShowAddRevenueDrawer(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Revenue
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {showStatistics && (
          <div className="mb-8">
            <RevenueStatistics statistics={statistics} isLoading={false} />
          </div>
        )}

        {/* Search Filters - NEW GENERIC SYSTEM */}
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
          onRevenueCreated={(newRevenue) => {
            // Add the new revenue to the list
            setRevenues(prev => [newRevenue, ...prev]);
            
            // Update pagination
            setPagination(prev => ({
              ...prev,
              totalItems: prev.totalItems + 1
            }));
            
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
            // Update the revenues array
            setRevenues(prev => prev.map(revenue => 
              revenue.id === updatedRevenue.id ? updatedRevenue : revenue
            ));
            
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

export default RevenuePage;

