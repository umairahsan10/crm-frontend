import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CompanyTable from '../../components/company/CompanyTable';
import CompanyDetailsDrawer from '../../components/company/CompanyDetailsDrawer';
import BulkActions from '../../components/company/BulkActions';
import CompanyStatistics from '../../components/company/CompanyStatistics';
import AddCompanyModal from '../../components/company/AddCompanyModal';
import { useAuth } from '../../context/AuthContext';
import { 
  getCompaniesApi, 
  createCompanyApi, 
  updateCompanyApi, 
  bulkUpdateCompaniesApi, 
  bulkDeleteCompaniesApi,
  getCompanyStatisticsApi
} from '../../apis/company';
import type { Company, CompanyFilters } from '../../apis/company';

const CompanyManagementPage: React.FC = () => {
  useAuth();
  const queryClient = useQueryClient();
  
  // State management
  const [activeTab, setActiveTab] = useState<'companies' | 'inactive'>('companies');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatistics, setShowStatistics] = useState(true);
  
  // Filter states
  const [regularFilters, setRegularFilters] = useState<CompanyFilters>({
    page: 1,
    limit: 20,
    status: 'active'
  });
  
  const [inactiveFilters, setInactiveFilters] = useState<CompanyFilters>({
    page: 1,
    limit: 20,
    status: 'inactive'
  });

  // Fetch companies data
  const { data: companiesData, isLoading: companiesLoading, error: companiesError } = useQuery({
    queryKey: ['companies', activeTab === 'companies' ? regularFilters : inactiveFilters],
    queryFn: () => getCompaniesApi(activeTab === 'companies' ? regularFilters : inactiveFilters),
    enabled: true
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ['company-statistics'],
    queryFn: getCompanyStatisticsApi,
    enabled: true
  });

  // Mutations
  const createCompanyMutation = useMutation({
    mutationFn: createCompanyApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company-statistics'] });
    }
  });

  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Company> }) => updateCompanyApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company-statistics'] });
    }
  });

  // const deleteCompanyMutation = useMutation({
  //   mutationFn: deleteCompanyApi,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['companies'] });
  //     queryClient.invalidateQueries({ queryKey: ['company-statistics'] });
  //   }
  // });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, data }: { ids: number[]; data: Partial<Company> }) => 
      bulkUpdateCompaniesApi(ids, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company-statistics'] });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteCompaniesApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company-statistics'] });
    }
  });

  // Event handlers
  const handleCompanyClick = useCallback((company: Company) => {
    setSelectedCompany(company);
    setShowDetailsDrawer(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setShowDetailsDrawer(false);
    setSelectedCompany(null);
  }, []);

  const handleCompanyUpdated = useCallback((updatedCompany: Company) => {
    updateCompanyMutation.mutate({ 
      id: updatedCompany.id, 
      data: updatedCompany 
    });
    setShowDetailsDrawer(false);
    setSelectedCompany(null);
  }, [updateCompanyMutation]);

  const handleAddCompany = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const handleSaveCompany = useCallback((companyData: any) => {
    createCompanyMutation.mutate(companyData);
    setShowAddModal(false);
  }, [createCompanyMutation]);

  const handleBulkStatusChange = useCallback(async (companyIds: string[], status: string) => {
    const ids = companyIds.map(id => parseInt(id));
    await bulkUpdateMutation.mutateAsync({ ids, data: { status: status as 'active' | 'inactive' } });
    setSelectedCompanies([]);
  }, [bulkUpdateMutation]);

  const handleBulkDelete = useCallback(async (companyIds: string[]) => {
    const ids = companyIds.map(id => parseInt(id));
    await bulkDeleteMutation.mutateAsync(ids);
    setSelectedCompanies([]);
  }, [bulkDeleteMutation]);



  const companies = companiesData?.companies || [];

  if (companiesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (companiesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Companies</h2>
          <p className="text-gray-600">There was an error loading the companies data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="mt-2 text-gray-600">Manage your company database and track business relationships</p>
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
                onClick={handleAddCompany}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Company
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {statistics && showStatistics && (
          <div className="mb-8">
            <CompanyStatistics statistics={statistics} />
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'companies', name: 'Active Companies', count: statistics?.active || 0 },
                { id: 'inactive', name: 'Inactive Companies', count: statistics?.inactive || 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'companies' | 'inactive')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {companies.length} of {companiesData?.pagination?.total || 0} companies
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const currentFilters = activeTab === 'companies' ? regularFilters : inactiveFilters;
                  const newPage = Math.max(1, currentFilters.page! - 1);
                  if (activeTab === 'companies') {
                    setRegularFilters(prev => ({ ...prev, page: newPage }));
                  } else {
                    setInactiveFilters(prev => ({ ...prev, page: newPage }));
                  }
                }}
                disabled={companiesData?.pagination?.page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {companiesData?.pagination?.page || 1} of {companiesData?.pagination?.totalPages || 1}
              </span>
              <button
                onClick={() => {
                  const currentFilters = activeTab === 'companies' ? regularFilters : inactiveFilters;
                  const newPage = currentFilters.page! + 1;
                  if (activeTab === 'companies') {
                    setRegularFilters(prev => ({ ...prev, page: newPage }));
                  } else {
                    setInactiveFilters(prev => ({ ...prev, page: newPage }));
                  }
                }}
                disabled={companiesData?.pagination?.page === companiesData?.pagination?.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCompanies.length > 0 && (
          <div className="mb-4">
            <BulkActions
              selectedCompanies={selectedCompanies}
              onBulkAssign={() => {}}
              onBulkStatusChange={(companyIds, status) => handleBulkStatusChange(companyIds, status)}
              onBulkDelete={(companyIds) => handleBulkDelete(companyIds)}
              onClearSelection={() => setSelectedCompanies([])}
              employees={[]}
            />
          </div>
        )}

        {/* Table */}
        <div className="bg-white shadow rounded-lg">
          <CompanyTable
            companies={companies}
            onCompanyClick={handleCompanyClick}
            selectedCompanies={selectedCompanies}
            onSelectionChange={setSelectedCompanies}
            isLoading={companiesLoading}
          />
        </div>

        {/* Details Drawer */}
        {selectedCompany && (
          <CompanyDetailsDrawer
            company={selectedCompany}
            isOpen={showDetailsDrawer}
            onClose={handleCloseDetails}
            onCompanyUpdated={handleCompanyUpdated}
          />
        )}

        {/* Add Company Modal */}
        <AddCompanyModal
          isOpen={showAddModal}
          onClose={handleCloseAddModal}
          onSave={handleSaveCompany}
        />
      </div>
    </div>
  );
};

export default CompanyManagementPage;