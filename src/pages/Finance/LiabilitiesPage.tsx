import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LeadsSearchFilters from '../../components/leads/LeadsSearchFilters';
import LiabilitiesTable from '../../components/liabilities/LiabilitiesTable';
import LiabilitiesStatistics from '../../components/liabilities/LiabilitiesStatistics';
import LiabilityDetailsDrawer from '../../components/liabilities/LiabilityDetailsDrawer';
import { liabilitiesFilterConfig } from '../../components/liabilities/filterConfigs';
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
  const { user } = useAuth();
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  
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

  // Generate mock liabilities data
  const generateMockLiabilities = (count: number): Liability[] => {
    const categories = ['Rent', 'Loan', 'Credit Card', 'Utilities', 'Salary', 'Vendor Payment', 'Tax', 'Other'];
    const vendors = [
      { id: 10, name: 'Property Management Co' },
      { id: 11, name: 'Bank of America' },
      { id: 12, name: 'Chase Credit Card' },
      { id: 13, name: 'Electric Company' },
      { id: 14, name: 'Tax Authority' },
      { id: 15, name: 'Supplier Inc' }
    ];
    
    const mockData: Liability[] = [];
    const today = new Date();
    
    for (let i = 1; i <= count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      const amount = Math.floor(Math.random() * 50000) + 1000;
      const isPaid = Math.random() > 0.6;
      const daysFromNow = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + daysFromNow);
      
      const createdDate = new Date(today);
      createdDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
      
      const paidDate = isPaid ? new Date(dueDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null;
      
      mockData.push({
        id: i,
        name: `${category} Payment #${1000 + i}`,
        category,
        amount,
        dueDate: dueDate.toISOString(),
        isPaid,
        paidOn: paidDate ? paidDate.toISOString() : null,
        transactionId: 200 + i,
        relatedVendorId: vendor.id,
        createdBy: 50,
        createdAt: createdDate.toISOString(),
        updatedAt: (paidDate || createdDate).toISOString(),
        transaction: {
          id: 200 + i,
          amount,
          status: isPaid ? 'completed' : 'pending'
        },
        vendor,
        employee: {
          id: 50,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        }
      });
    }
    
    return mockData;
  };

  // Load liabilities
  useEffect(() => {
    loadLiabilities();
  }, [pagination.currentPage, filters]);

  const loadLiabilities = async () => {
    try {
      setIsLoading(true);
      
      // Generate mock data
      const allLiabilities = generateMockLiabilities(50);
      
      // Apply filters
      let filteredLiabilities = allLiabilities;
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredLiabilities = filteredLiabilities.filter(liability => 
          liability.name.toLowerCase().includes(searchLower) ||
          liability.category.toLowerCase().includes(searchLower) ||
          liability.vendor?.name.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.isPaid) {
        const isPaidValue = filters.isPaid === 'true';
        filteredLiabilities = filteredLiabilities.filter(liability => liability.isPaid === isPaidValue);
      }
      
      if (filters.category) {
        filteredLiabilities = filteredLiabilities.filter(liability => liability.category === filters.category);
      }
      
      if (filters.relatedVendorId) {
        filteredLiabilities = filteredLiabilities.filter(liability => 
          liability.relatedVendorId === parseInt(filters.relatedVendorId)
        );
      }
      
      if (filters.createdBy) {
        filteredLiabilities = filteredLiabilities.filter(liability => 
          liability.createdBy === parseInt(filters.createdBy)
        );
      }
      
      if (filters.fromDate) {
        filteredLiabilities = filteredLiabilities.filter(liability => 
          new Date(liability.dueDate) >= new Date(filters.fromDate)
        );
      }
      
      if (filters.toDate) {
        filteredLiabilities = filteredLiabilities.filter(liability => 
          new Date(liability.dueDate) <= new Date(filters.toDate)
        );
      }
      
      // Calculate statistics
      const totalAmount = filteredLiabilities.reduce((sum, l) => sum + l.amount, 0);
      const paidAmount = filteredLiabilities.filter(l => l.isPaid).reduce((sum, l) => sum + l.amount, 0);
      const unpaidAmount = totalAmount - paidAmount;
      
      const today = new Date();
      const overdue = filteredLiabilities.filter(l => !l.isPaid && new Date(l.dueDate) < today).length;
      
      const categoryCount = filteredLiabilities.reduce((acc, l) => {
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
      const todayNew = filteredLiabilities.filter(l => 
        l.createdAt.split('T')[0] === todayStr
      ).length;
      const todayPaid = filteredLiabilities.filter(l => 
        l.isPaid && l.paidOn && l.paidOn.split('T')[0] === todayStr
      ).length;
      const todayDue = filteredLiabilities.filter(l => 
        l.dueDate.split('T')[0] === todayStr
      ).length;
      
      setStatistics({
        totalLiabilities: filteredLiabilities.length,
        paidLiabilities: filteredLiabilities.filter(l => l.isPaid).length,
        unpaidLiabilities: filteredLiabilities.filter(l => !l.isPaid).length,
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
      
      // Apply pagination
      const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
      const endIndex = startIndex + pagination.itemsPerPage;
      const paginatedLiabilities = filteredLiabilities.slice(startIndex, endIndex);
      
      setLiabilities(paginatedLiabilities);
      setPagination(prev => ({
        ...prev,
        totalItems: filteredLiabilities.length,
        totalPages: Math.ceil(filteredLiabilities.length / prev.itemsPerPage)
      }));
      
    } catch (error) {
      console.error('Error loading liabilities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter handlers
  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleStatusFilter = (isPaid: string) => {
    setFilters(prev => ({ ...prev, isPaid }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleVendorFilter = (relatedVendorId: string) => {
    setFilters(prev => ({ ...prev, relatedVendorId }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleDateRangeFilter = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, fromDate: startDate, toDate: endDate }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleCreatedByFilter = (createdBy: string) => {
    setFilters(prev => ({ ...prev, createdBy }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
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
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
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
            <button
              onClick={() => setShowStatistics(!showStatistics)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg 
                className="h-5 w-5 mr-2 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                />
              </svg>
              {showStatistics ? 'Hide' : 'Show'} Statistics
            </button>
          </div>
        </div>

        {/* Statistics */}
        {showStatistics && (
          <div className="mb-8">
            <LiabilitiesStatistics statistics={statistics} isLoading={false} />
          </div>
        )}

        {/* Search Filters */}
        <LeadsSearchFilters
          config={liabilitiesFilterConfig}
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onClosedByFilter={handleVendorFilter}
          onTypeFilter={handleCategoryFilter}
          onDateRangeFilter={handleDateRangeFilter}
          onAssignedToFilter={handleCreatedByFilter}
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

        {/* Liability Details Drawer */}
        <LiabilityDetailsDrawer
          liability={selectedLiability}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          onLiabilityUpdated={handleLiabilityUpdated}
        />
      </div>
    </div>
  );
};

export default LiabilitiesPage;

