import React, { useState, useEffect } from 'react';
import LiabilitiesTable from '../../components/liabilities/LiabilitiesTable';
import LiabilitiesStatistics from '../../components/liabilities/LiabilitiesStatistics';
import LiabilityDetailsDrawer from '../../components/liabilities/LiabilityDetailsDrawer';
import AddLiabilityDrawer from '../../components/liabilities/AddLiabilityDrawer';
import LiabilitiesSearchFilters from '../../components/liabilities/LiabilitiesSearchFilters';
import { getLiabilitiesApi } from '../../apis/liabilities';
import type { Liability } from '../../types';

interface LiabilitiesPageProps {
  onBack?: () => void;
}

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

const LiabilitiesPage: React.FC<LiabilitiesPageProps> = ({ onBack }) => {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Details drawer state
  const [selectedLiability, setSelectedLiability] = useState<Liability | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLiabilities, setSelectedLiabilities] = useState<string[]>([]);

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalLiabilities: 0,
    paidLiabilities: 0,
    unpaidLiabilities: 0,
    overdueLiabilities: 0,
    totalAmount: '0',
    paidAmount: '0',
    unpaidAmount: '0',
    byCategory: {
      rent: 0,
      loan: 0,
      creditCard: 0,
      utilities: 0,
      salary: 0,
      vendorPayment: 0,
      tax: 0,
      other: 0
    },
    today: {
      new: 0,
      paid: 0,
      due: 0
    }
  });

  // Load liabilities from database
  const loadLiabilities = async (page: number = 1) => {
    try {
      setIsLoading(true);
      
      console.log('📤 Fetching liabilities with filters:', filters);
      
      const response = await getLiabilitiesApi(page, pagination.itemsPerPage, {
        isPaid: filters.isPaid || undefined,
        relatedVendorId: filters.relatedVendorId || undefined,
        category: filters.category || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        createdBy: filters.createdBy || undefined,
        search: filters.search || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });
      
      console.log('✅ Liabilities response:', response);
      
      if (response.success && response.data) {
        setLiabilities(response.data);
        
        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.page,
            totalPages: response.pagination.totalPages,
            totalItems: response.pagination.total,
            itemsPerPage: pagination.itemsPerPage
          });
        }

        // Calculate statistics from data
        const totalAmount = response.data.reduce((sum, l) => sum + l.amount, 0);
        const paidAmount = response.data.filter(l => l.isPaid).reduce((sum, l) => sum + l.amount, 0);
        const unpaidAmount = totalAmount - paidAmount;
        
        const today = new Date();
        const overdue = response.data.filter(l => !l.isPaid && new Date(l.dueDate) < today).length;
        
        const categoryCount = response.data.reduce((acc, l) => {
          const key = l.category.toLowerCase().replace(/\s+/g, '');
          if (key === 'rent') acc.rent++;
          else if (key === 'loan') acc.loan++;
          else if (key === 'creditcard') acc.creditCard++;
          else if (key === 'utilities') acc.utilities++;
          else if (key === 'salary') acc.salary++;
          else if (key === 'vendorpayment') acc.vendorPayment++;
          else if (key === 'tax') acc.tax++;
          else acc.other++;
          return acc;
        }, { rent: 0, loan: 0, creditCard: 0, utilities: 0, salary: 0, vendorPayment: 0, tax: 0, other: 0 });
        
        const todayStr = today.toISOString().split('T')[0];
        const todayNew = response.data.filter(l => 
          l.createdAt.split('T')[0] === todayStr
        ).length;
        const todayPaid = response.data.filter(l => 
          l.isPaid && l.paidOn && l.paidOn.split('T')[0] === todayStr
        ).length;
        const todayDue = response.data.filter(l => 
          l.dueDate.split('T')[0] === todayStr
        ).length;
        
        setStatistics({
          totalLiabilities: response.data.length,
          paidLiabilities: response.data.filter(l => l.isPaid).length,
          unpaidLiabilities: response.data.filter(l => !l.isPaid).length,
          overdueLiabilities: overdue,
          totalAmount: totalAmount.toFixed(2),
          paidAmount: paidAmount.toFixed(2),
          unpaidAmount: unpaidAmount.toFixed(2),
          byCategory: categoryCount,
          today: {
            new: todayNew,
            paid: todayPaid,
            due: todayDue
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error loading liabilities:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load liabilities'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Load liabilities on mount
  useEffect(() => {
    loadLiabilities(pagination.currentPage);
  }, []);

  // Refetch when filters change
  const [isInitialMount, setIsInitialMount] = useState(true);
  
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }
    loadLiabilities(1);
  }, [filters.isPaid, filters.relatedVendorId, filters.category, filters.fromDate, filters.toDate, filters.createdBy]);

  // Filter handlers
  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleIsPaidFilter = (isPaid: string) => {
    setFilters(prev => ({ ...prev, isPaid }));
  };

  const handleRelatedVendorIdFilter = (relatedVendorId: string) => {
    setFilters(prev => ({ ...prev, relatedVendorId }));
  };

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handleDateRangeFilter = (fromDate: string, toDate: string) => {
    setFilters(prev => ({ ...prev, fromDate, toDate }));
  };

  const handleClearFilters = () => {
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
  };

  const handlePageChange = (page: number) => {
    loadLiabilities(page);
  };

  const handleLiabilityClick = (liability: Liability) => {
    setSelectedLiability(liability);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedLiability(null), 300);
  };

  const handleLiabilityUpdated = (updatedLiability: Liability) => {
    setLiabilities(prev => 
      prev.map(l => l.id === updatedLiability.id ? updatedLiability : l)
    );
    setSelectedLiability(updatedLiability);
    loadLiabilities();
  };

  const handleBulkSelect = (liabilityIds: string[]) => {
    setSelectedLiabilities(liabilityIds);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
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
              <h1 className="text-3xl font-bold text-gray-900">Liabilities Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Track and manage all company liabilities and payments
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showStatistics ? 'Hide Stats' : 'Show Stats'}
              </button>
              <button
                onClick={() => setShowAddLiabilityDrawer(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Liability
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {showStatistics && (
          <div className="mb-8">
            <LiabilitiesStatistics statistics={statistics} isLoading={false} />
          </div>
        )}

        {/* Search Filters */}
        <LiabilitiesSearchFilters
          onSearch={handleSearch}
          onCategoryFilter={handleCategoryFilter}
          onIsPaidFilter={handleIsPaidFilter}
          onDateRangeFilter={handleDateRangeFilter}
          onRelatedVendorIdFilter={handleRelatedVendorIdFilter}
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
          onLiabilityCreated={(newLiability) => {
            // Add the new liability to the list
            setLiabilities(prev => [newLiability, ...prev]);
            
            // Update pagination
            setPagination(prev => ({
              ...prev,
              totalItems: prev.totalItems + 1
            }));
            
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
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
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
                    onClick={() => setNotification(null)}
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

export default LiabilitiesPage;

