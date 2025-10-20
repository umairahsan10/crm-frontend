import React, { useState, useCallback } from 'react';
import CompanyTable from '../../components/company/CompanyTable';
import GenericCompanyFilters from '../../components/company/GenericCompanyFilters';
import CompanyDetailsDrawer from '../../components/company/CompanyDetailsDrawer';
import BulkActions from '../../components/company/BulkActions';
import CompanyStatistics from '../../components/company/CompanyStatistics';
import AddCompanyModal from '../../components/company/AddCompanyModal';
import { useAuth } from '../../context/AuthContext';

// Dummy data for companies
const dummyCompanies = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    email: 'contact@techcorp.com',
    phone: '+1-555-0123',
    website: 'https://techcorp.com',
    address: '123 Tech Street, San Francisco, CA 94105',
    country: 'United States',
    status: 'active',
    location: 'San Francisco, CA',
    revenue: '$10M+',
    employees: 500,
    founded: '2010',
    description: 'Leading technology solutions provider',
    assignedTo: 'John Smith',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z'
  },
  {
    id: '2',
    name: 'Green Energy Co',
    email: 'info@greenenergy.com',
    phone: '+1-555-0456',
    website: 'https://greenenergy.com',
    address: '456 Green Avenue, Austin, TX 78701',
    country: 'United States',
    status: 'inactive',
    location: 'Austin, TX',
    revenue: '$5M',
    employees: 150,
    founded: '2018',
    description: 'Sustainable energy solutions',
    assignedTo: 'Sarah Johnson',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T16:20:00Z'
  },
  {
    id: '3',
    name: 'Manufacturing Inc',
    email: 'sales@manufacturing.com',
    phone: '+1-555-0789',
    website: 'https://manufacturing.com',
    address: '789 Industrial Blvd, Detroit, MI 48201',
    country: 'United States',
    status: 'inactive',
    location: 'Detroit, MI',
    revenue: '$50M+',
    employees: 1000,
    founded: '1995',
    description: 'Industrial manufacturing solutions',
    assignedTo: 'Mike Wilson',
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-12T13:30:00Z'
  },
  {
    id: '4',
    name: 'HealthTech Innovations',
    email: 'hello@healthtech.com',
    phone: '+1-555-0321',
    website: 'https://healthtech.com',
    address: '321 Medical Plaza, Boston, MA 02108',
    country: 'United States',
    status: 'active',
    location: 'Boston, MA',
    revenue: '$2M',
    employees: 50,
    founded: '2020',
    description: 'Healthcare technology solutions',
    assignedTo: 'Lisa Brown',
    createdAt: '2024-01-08T14:20:00Z',
    updatedAt: '2024-01-22T10:15:00Z'
  },
  {
    id: '5',
    name: 'FinanceFirst Ltd',
    email: 'contact@financefirst.com',
    phone: '+1-555-0654',
    website: 'https://financefirst.com',
    address: '654 Wall Street, New York, NY 10005',
    country: 'United States',
    status: 'inactive',
    location: 'New York, NY',
    revenue: '$25M',
    employees: 300,
    founded: '2015',
    description: 'Financial services and consulting',
    assignedTo: 'David Lee',
    createdAt: '2024-01-12T08:45:00Z',
    updatedAt: '2024-01-19T15:30:00Z'
  }
];

// Dummy statistics
const dummyStatistics = {
  totalCompanies: 5,
  activeCompanies: 2,
  inactiveCompanies: 3,
  conversionRate: '40%',
  completionRate: '60%',
  byStatus: { active: 2, inactive: 3 },
  byCountry: { 'United States': 5 }
};

// Dummy employees for assignment
const dummyEmployees = [
  { id: 1, firstName: 'John', lastName: 'Smith', email: 'john@company.com' },
  { id: 2, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@company.com' },
  { id: 3, firstName: 'Mike', lastName: 'Wilson', email: 'mike@company.com' },
  { id: 4, firstName: 'Lisa', lastName: 'Brown', email: 'lisa@company.com' },
  { id: 5, firstName: 'David', lastName: 'Lee', email: 'david@company.com' }
];

const CompanyManagementPage: React.FC = () => {
  // Auth context
  const { user } = useAuth();
  
  // UI State management
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'companies' | 'inactive'>('companies');

  // Pagination state for each tab
  const [regularPagination, setRegularPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  
  const [inactivePagination, setInactivePagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Filter state for each tab
  const [regularFilters, setRegularFilters] = useState({
    search: '',
    status: '',
    country: '',
    company: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  const [inactiveFilters, setInactiveFilters] = useState({
    search: '',
    country: '',
    company: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Filter companies based on active tab
  const getFilteredCompanies = (companies: any[], filters: any) => {
    return companies.filter(company => {
      if (filters.search && !company.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !company.email.toLowerCase().includes(filters.search.toLowerCase()) &&
          !company.phone.includes(filters.search)) {
        return false;
      }
      if (filters.status && company.status !== filters.status) return false;
      if (filters.country && company.country !== filters.country) return false;
      if (filters.company && company.name !== filters.company) return false;
      return true;
    });
  };

  // Get companies for current tab
  const getCurrentCompanies = () => {
    const allCompanies = dummyCompanies;
    if (activeTab === 'companies') {
      return getFilteredCompanies(allCompanies.filter(c => c.status === 'active'), regularFilters);
    } else {
      return getFilteredCompanies(allCompanies.filter(c => c.status === 'inactive'), inactiveFilters);
    }
  };

  const currentCompanies = getCurrentCompanies();
  const statistics = dummyStatistics;
  const employees = dummyEmployees;

  // Handlers
  const handlePageChange = (page: number) => {
    if (activeTab === 'companies') {
      setRegularPagination(prev => ({ ...prev, currentPage: page }));
    } else if (activeTab === 'inactive') {
      setInactivePagination(prev => ({ ...prev, currentPage: page }));
    }
  };

  const handleCompanyClick = (company: any) => {
    setSelectedCompany(company);
  };

  const handleBulkSelect = (companyIds: string[]) => {
    setSelectedCompanies(companyIds);
  };

  // Filter handlers
  const handleRegularFiltersChange = useCallback((newFilters: any) => {
    setRegularFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleInactiveFiltersChange = useCallback((newFilters: any) => {
    setInactiveFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleRegularClearFilters = useCallback(() => {
    setRegularFilters({
      search: '',
      status: '',
      country: '',
      company: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }, []);

  const handleInactiveClearFilters = useCallback(() => {
    setInactiveFilters({
      search: '',
      country: '',
      company: '',
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });
  }, []);

  const handleBulkAssign = async (companyIds: string[], assignedTo: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotification({
        type: 'success',
        message: `Successfully assigned ${companyIds.length} companies`
      });
      setSelectedCompanies([]);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to assign companies'
      });
    }
  };

  const handleBulkStatusChange = async (companyIds: string[], status: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotification({
        type: 'success',
        message: `Successfully updated status for ${companyIds.length} companies`
      });
      setSelectedCompanies([]);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update companies'
      });
    }
  };

  const handleBulkDelete = async (companyIds: string[]) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotification({
        type: 'success',
        message: `Successfully deleted ${companyIds.length} companies`
      });
      setSelectedCompanies([]);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete companies'
      });
    }
  };

  const handleAddCompany = async (companyData: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotification({
        type: 'success',
        message: 'Company added successfully'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to add company'
      });
      
      setTimeout(() => setNotification(null), 3000);
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage and track your companies with advanced filtering and bulk operations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showStatistics ? 'Hide Stats' : 'Show Stats'}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Company
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {showStatistics && (
          <div className="mb-8">
            <CompanyStatistics statistics={statistics} isLoading={false} />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex justify-between" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('companies')}
                className={`flex-1 py-3 px-4 border-b-2 font-medium text-sm transition-colors text-center ${
                  activeTab === 'companies'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Active Companies</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`flex-1 py-3 px-4 border-b-2 font-medium text-sm transition-colors text-center ${
                  activeTab === 'inactive'
                    ? 'border-gray-500 text-gray-600 bg-gray-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4-4 4m5-4h6" />
                  </svg>
                  <span>Inactive</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Dynamic Tab-specific Filters */}
        {activeTab === 'companies' && (
          <GenericCompanyFilters
            showFilters={{
              status: true,
              country: true,
              company: true
            }}
            onFiltersChange={handleRegularFiltersChange}
            onClearFilters={handleRegularClearFilters}
            employees={employees}
            searchPlaceholder="Search companies by name, email, phone..."
            theme={{
              primary: 'bg-indigo-600',
              secondary: 'hover:bg-indigo-700',
              ring: 'ring-indigo-500',
              bg: 'bg-indigo-100',
              text: 'text-indigo-800'
            }}
          />
        )}
        
        
        {activeTab === 'inactive' && (
          <GenericCompanyFilters
            showFilters={{
              country: true,
              company: true
            }}
            onFiltersChange={handleInactiveFiltersChange}
            onClearFilters={handleInactiveClearFilters}
            employees={employees}
            searchPlaceholder="Search inactive companies..."
            theme={{
              primary: 'bg-gray-600',
              secondary: 'hover:bg-gray-700',
              ring: 'ring-gray-500',
              bg: 'bg-gray-100',
              text: 'text-gray-800'
            }}
          />
        )}

        {/* Bulk Actions */}
        <BulkActions
          selectedCompanies={selectedCompanies}
          onBulkAssign={handleBulkAssign}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedCompanies([])}
          employees={employees}
        />

        {/* Company Table */}
        <CompanyTable
          companies={currentCompanies}
          isLoading={false}
          currentPage={activeTab === 'companies' ? regularPagination.currentPage : 
                      activeTab === 'prospects' ? prospectPagination.currentPage : 
                      inactivePagination.currentPage}
          totalPages={activeTab === 'companies' ? regularPagination.totalPages : 
                      activeTab === 'prospects' ? prospectPagination.totalPages : 
                      inactivePagination.totalPages}
          totalItems={activeTab === 'companies' ? regularPagination.totalItems : 
                      activeTab === 'prospects' ? prospectPagination.totalItems : 
                      inactivePagination.totalItems}
          itemsPerPage={activeTab === 'companies' ? regularPagination.itemsPerPage : 
                        activeTab === 'prospects' ? prospectPagination.itemsPerPage : 
                        inactivePagination.itemsPerPage}
          onPageChange={handlePageChange}
          onCompanyClick={handleCompanyClick}
          onBulkSelect={handleBulkSelect}
          selectedCompanies={selectedCompanies}
        />

        {/* Company Details Drawer */}
        <CompanyDetailsDrawer
          company={selectedCompany}
          isOpen={!!selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onCompanyUpdated={(updatedCompany) => {
            setSelectedCompany(updatedCompany);
            setNotification({
              type: 'success',
              message: 'Company updated successfully!'
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

        {/* Add Company Modal */}
        <AddCompanyModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCompany}
        />
      </div>
    </div>
  );
};

export default CompanyManagementPage;

