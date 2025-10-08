import React, { useState, useEffect } from 'react';
import RevenueTable from '../../components/revenue/RevenueTable';
import LeadsSearchFilters from '../../components/leads/LeadsSearchFilters';
import { revenueFilterConfig } from '../../components/revenue/filterConfigs';
import RevenueDetailsDrawer from '../../components/revenue/RevenueDetailsDrawer';
import RevenueStatistics from '../../components/revenue/RevenueStatistics';
// import { getRevenuesApi } from '../../apis/revenue'; // Uncomment when using real API
import type { Revenue } from '../../types';

interface RevenuePageProps {
  onBack?: () => void;
}

const RevenuePage: React.FC<RevenuePageProps> = ({ onBack }) => {
  
  // State management
  const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null);
  const [selectedRevenues, setSelectedRevenues] = useState<string[]>([]);
  const [showStatistics, setShowStatistics] = useState(false);
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

  // Mock data generation (matching API structure)
  const generateMockRevenues = (): Revenue[] => {
    const categories = ['Software Development', 'Consulting', 'Product Sales', 'Subscription', 'Support', 'Training', 'License', 'Other'];
    const paymentMethods = ['bank', 'cash', 'credit_card', 'online'];
    const transactionStatuses = ['completed', 'pending', 'failed'];
    const sources = ['Project Payment', 'Invoice Payment', 'Subscription Payment', 'Service Payment', 'Product Sale', 'Other'];
    const clients = [
      { id: 123, companyName: 'ABC Corp' },
      { id: 124, companyName: 'Tech Solutions Inc' },
      { id: 125, companyName: 'Digital Innovations' },
      { id: 126, companyName: 'Enterprise Systems Ltd' },
      { id: 127, companyName: 'Global Services Group' }
    ];
    const employees = [
      { id: 50, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      { id: 51, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
      { id: 52, firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com' },
      { id: 53, firstName: 'Sarah', lastName: 'Williams', email: 'sarah@example.com' }
    ];
    
    const mockRevenues: Revenue[] = [];

    for (let i = 1; i <= 50; i++) {
      const randomClient = clients[Math.floor(Math.random() * clients.length)];
      const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
      const randomStatus = transactionStatuses[Math.floor(Math.random() * transactionStatuses.length)];
      const amount = Math.floor(Math.random() * 100000) + 5000;
      const receivedDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
      const invoiceId = 400 + i;
      
      mockRevenues.push({
        id: i,
        source: sources[Math.floor(Math.random() * sources.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        amount: amount,
        receivedFrom: randomClient.id,
        receivedOn: receivedDate.toISOString(),
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        relatedInvoiceId: invoiceId,
        createdBy: randomEmployee.id,
        transactionId: 100 + i,
        createdAt: receivedDate.toISOString(),
        updatedAt: receivedDate.toISOString(),
        transaction: {
          id: 100 + i,
          amount: amount,
          transactionType: 'income',
          status: randomStatus
        },
        lead: randomClient,
        invoice: {
          id: invoiceId,
          amount: amount,
          notes: `Payment for ${categories[Math.floor(Math.random() * categories.length)]} services`
        },
        employee: randomEmployee
      });
    }

    return mockRevenues;
  };

  // Fetch revenues
  const fetchRevenues = async (page: number = 1) => {
    try {
      setIsLoading(true);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockData = generateMockRevenues();
      
      // Apply filters to mock data
      let filteredData = mockData;
      if (filters.category) {
        filteredData = filteredData.filter(r => r.category === filters.category);
      }
      if (filters.paymentMethod) {
        filteredData = filteredData.filter(r => r.paymentMethod === filters.paymentMethod);
      }
      if (filters.source) {
        filteredData = filteredData.filter(r => r.source === filters.source);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(r => 
          r.source.toLowerCase().includes(searchLower) ||
          r.category.toLowerCase().includes(searchLower) ||
          r.lead?.companyName.toLowerCase().includes(searchLower)
        );
      }
      if (filters.minAmount) {
        filteredData = filteredData.filter(r => r.amount >= parseFloat(filters.minAmount));
      }
      if (filters.maxAmount) {
        filteredData = filteredData.filter(r => r.amount <= parseFloat(filters.maxAmount));
      }
      
      setRevenues(filteredData.slice(0, 20));
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(filteredData.length / 20),
        totalItems: filteredData.length,
        itemsPerPage: 20
      });
    } catch (error) {
      console.error('Error fetching revenues:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load revenues'
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
    fetchRevenues();
    fetchStatistics();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchRevenues(1);
  }, [filters]);

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

  // Filter handlers (matching API query parameters)
  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handlePaymentMethodFilter = (paymentMethod: string) => {
    setFilters(prev => ({ ...prev, paymentMethod }));
  };

  const handleSourceFilter = (source: string) => {
    setFilters(prev => ({ ...prev, source }));
  };

  const handleCreatedByFilter = (createdBy: string) => {
    setFilters(prev => ({ ...prev, createdBy }));
  };

  const handleDateRangeFilter = (fromDate: string, toDate: string) => {
    setFilters(prev => ({ ...prev, fromDate, toDate }));
  };

  const handleMinAmountFilter = (minAmount: string) => {
    setFilters(prev => ({ ...prev, minAmount }));
  };

  const handleMaxAmountFilter = (maxAmount: string) => {
    setFilters(prev => ({ ...prev, maxAmount }));
  };

  const handleClearFilters = () => {
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

        {/* Search Filters */}
        <LeadsSearchFilters
          config={revenueFilterConfig}
          onSearch={handleSearch}
          onTypeFilter={handleCategoryFilter}
          onStatusFilter={handlePaymentMethodFilter}
          onSourceFilter={handleSourceFilter}
          onAssignedToFilter={handleCreatedByFilter}
          onDateRangeFilter={handleDateRangeFilter}
          onMinAmountFilter={handleMinAmountFilter}
          onMaxAmountFilter={handleMaxAmountFilter}
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

