import React, { useState, useCallback } from 'react';
import LeadsTable from '../../components/leads/LeadsTable';
import CrackLeadsTable from '../../components/leads/CrackLeadsTable';
import ArchiveLeadsTable from '../../components/leads/ArchiveLeadsTable';
import GenericLeadsFilters from '../../components/leads/GenericLeadsFilters';
import LeadDetailsDrawer from '../../components/leads/LeadDetailsDrawer';
import BulkActions from '../../components/leads/BulkActions';
import LeadsStatistics from '../../components/leads/LeadsStatistics';
import RequestLeadModal from '../../components/leads/RequestLeadModal';
import { useAuth } from '../../context/AuthContext';
import { 
  bulkUpdateLeadsApi, 
  bulkDeleteLeadsApi
} from '../../apis/leads';
import { 
  useLeads, 
  useCrackedLeads, 
  useArchivedLeads, 
  useLeadsStatistics,
  useSalesUnits,
  useFilterEmployees,
  useIndustries
} from '../../hooks/queries/useLeadsQueries';
import type { Lead } from '../../types';

const LeadsManagementPage: React.FC = () => {
  // Auth context
  const { user } = useAuth();
  
  // UI State management
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showStatistics, setShowStatistics] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'leads' | 'crack' | 'archive'>('leads');
  const [showRequestLeadModal, setShowRequestLeadModal] = useState(false);

  // Pagination state for each tab
  const [regularPagination, setRegularPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  
  const [crackedPagination, setCrackedPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  
  const [archivedPagination, setArchivedPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Helper function to check if user can access archive leads
  const canAccessArchiveLeads = (): boolean => {
    if (!user) return false;
    
    const userRole = user.role?.toLowerCase();
    const allowedRoles = ['admin', 'unit_head', 'dep_manager'];
    
    return allowedRoles.includes(userRole);
  };

  // Filter state for each tab
  const [regularFilters, setRegularFilters] = useState({
    search: '',
    status: '',
    type: '',
    salesUnitId: '',
    assignedTo: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  const [crackedFilters, setCrackedFilters] = useState({
    search: '',
    industryId: '',
    minAmount: '',
    maxAmount: '',
    closedBy: '',
    currentPhase: '',
    totalPhases: '',
    sortBy: 'crackedAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  const [archivedFilters, setArchivedFilters] = useState({
    search: '',
    unitId: '',  // Changed from salesUnitId to unitId for archived leads
    assignedTo: '',
    source: '',
    outcome: '',
    qualityRating: '',
    archivedFrom: '',
    archivedTo: '',
    sortBy: 'archivedOn',  // Correct field name from backend
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // React Query hooks - Data fetching with automatic caching
  // Only fetch data for the active tab and supporting data
  const leadsQuery = useLeads(
    regularPagination.currentPage, 
    regularPagination.itemsPerPage, 
    regularFilters,
    { enabled: activeTab === 'leads' }
  );
  const crackedLeadsQuery = useCrackedLeads(
    crackedPagination.currentPage, 
    crackedPagination.itemsPerPage, 
    crackedFilters,
    { enabled: activeTab === 'crack' }
  );
  const archivedLeadsQuery = useArchivedLeads(
    archivedPagination.currentPage, 
    archivedPagination.itemsPerPage, 
    archivedFilters,
    { enabled: activeTab === 'archive' }
  );
  const statisticsQuery = useLeadsStatistics({ enabled: activeTab === 'leads' });
  const salesUnitsQuery = useSalesUnits();
  const employeesQuery = useFilterEmployees();
  const industriesQuery = useIndustries({ enabled: activeTab === 'crack' });

  // Extract data and loading states from queries
  const regularLeads = (leadsQuery.data as any)?.data || [];
  const crackedLeads = (crackedLeadsQuery.data as any)?.data || [];
  const archivedLeads = (archivedLeadsQuery.data as any)?.data || [];
  const statistics = (statisticsQuery.data as any)?.data || {
    totalLeads: 0,
    activeLeads: 0,
    completedLeads: 0,
    failedLeads: 0,
    conversionRate: '0%',
    completionRate: '0%',
    byStatus: { new: 0, inProgress: 0, completed: 0, failed: 0 },
    byType: { warm: 0, cold: 0, push: 0, upsell: 0 },
    today: { new: 0, completed: 0, inProgress: 0 }
  };
  const employees = (employeesQuery.data as any)?.data || [];
  const salesUnits = (salesUnitsQuery.data as any)?.data || [];
  const industries = (industriesQuery.data as any)?.data || [];

  // Loading states
  const isLoadingRegular = leadsQuery.isLoading;
  const isLoadingCracked = crackedLeadsQuery.isLoading;
  const isLoadingArchived = archivedLeadsQuery.isLoading;

  // Update pagination when React Query data changes
  React.useEffect(() => {
    if ((leadsQuery.data as any)?.pagination) {
      setRegularPagination(prev => ({
        ...prev,
        currentPage: (leadsQuery.data as any).pagination.page,
        totalPages: (leadsQuery.data as any).pagination.totalPages,
        totalItems: (leadsQuery.data as any).pagination.total,
      }));
    }
  }, [(leadsQuery.data as any)?.pagination]);

  React.useEffect(() => {
    if ((crackedLeadsQuery.data as any)?.pagination) {
      setCrackedPagination(prev => ({
        ...prev,
        currentPage: (crackedLeadsQuery.data as any).pagination.page,
        totalPages: (crackedLeadsQuery.data as any).pagination.totalPages,
        totalItems: (crackedLeadsQuery.data as any).pagination.total,
      }));
    }
  }, [(crackedLeadsQuery.data as any)?.pagination]);

  React.useEffect(() => {
    if ((archivedLeadsQuery.data as any)?.pagination) {
      setArchivedPagination(prev => ({
        ...prev,
        currentPage: (archivedLeadsQuery.data as any).pagination.page,
        totalPages: (archivedLeadsQuery.data as any).pagination.totalPages,
        totalItems: (archivedLeadsQuery.data as any).pagination.total,
      }));
    }
  }, [(archivedLeadsQuery.data as any)?.pagination]);

  // Handle tab switching - React Query handles data fetching automatically
  React.useEffect(() => {
    if (activeTab === 'archive' && !canAccessArchiveLeads()) {
      setActiveTab('leads');
    }
  }, [activeTab]);

  // Handlers - Tab-aware page change
  const handlePageChange = (page: number) => {
    if (activeTab === 'leads') {
      setRegularPagination(prev => ({ ...prev, currentPage: page }));
    } else if (activeTab === 'crack') {
      setCrackedPagination(prev => ({ ...prev, currentPage: page }));
    } else if (activeTab === 'archive') {
      setArchivedPagination(prev => ({ ...prev, currentPage: page }));
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleBulkSelect = (leadIds: string[]) => {
    setSelectedLeads(leadIds);
  };

  // No need for handleEmployeesLoaded - React Query handles this automatically

  // Simplified filter handlers using generic system
  const handleRegularFiltersChange = useCallback((newFilters: any) => {
    setRegularFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleCrackedFiltersChange = useCallback((newFilters: any) => {
    // Map GenericLeadsFilters field names to crackedFilters field names
    const mappedFilters = {
      ...newFilters,
      industryId: newFilters.industry || '', // Map 'industry' to 'industryId'
    };
    setCrackedFilters(prev => ({ ...prev, ...mappedFilters }));
  }, []);

  const handleArchivedFiltersChange = useCallback((newFilters: any) => {
    setArchivedFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleRegularClearFilters = useCallback(() => {
    setRegularFilters({
      search: '',
      status: '',
      type: '',
      salesUnitId: '',
      assignedTo: '',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }, []);

  const handleCrackedClearFilters = useCallback(() => {
    setCrackedFilters({
      search: '',
      industryId: '',
      minAmount: '',
      maxAmount: '',
      closedBy: '',
      currentPhase: '',
      totalPhases: '',
      sortBy: 'crackedAt',
      sortOrder: 'desc'
    });
  }, []);

  const handleArchivedClearFilters = useCallback(() => {
    setArchivedFilters({
      search: '',
      unitId: '',
      assignedTo: '',
      source: '',
      outcome: '',
      qualityRating: '',
      archivedFrom: '',
      archivedTo: '',
      sortBy: 'archivedOn',
      sortOrder: 'desc'
    });
  }, []);

  const handleBulkAssign = async (leadIds: string[], assignedTo: string) => {
    try {
      await bulkUpdateLeadsApi(leadIds, { assignedTo });
      setNotification({
        type: 'success',
        message: `Successfully assigned ${leadIds.length} leads`
      });
      setSelectedLeads([]);
      
      // React Query will automatically refetch the data
      // No manual refetch needed!
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to assign leads'
      });
    }
  };

  const handleBulkStatusChange = async (leadIds: string[], status: string) => {
    try {
      await bulkUpdateLeadsApi(leadIds, { status: status as any });
      setNotification({
        type: 'success',
        message: `Successfully updated status for ${leadIds.length} leads`
      });
      setSelectedLeads([]);
      
      // React Query will automatically refetch the data
      // No manual refetch needed!
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update leads'
      });
    }
  };

  const handleBulkDelete = async (leadIds: string[]) => {
    try {
      await bulkDeleteLeadsApi(leadIds);
      setNotification({
        type: 'success',
        message: `Successfully deleted ${leadIds.length} leads`
      });
      setSelectedLeads([]);
      
      // React Query will automatically refetch the data
      // No manual refetch needed!
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete leads'
      });
    }
  };



  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleRequestLead = () => {
    console.log('🔘 Request Lead button clicked');
    console.log('👤 Current user:', { id: user?.id, role: user?.role });
    setShowRequestLeadModal(true);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="mt-2 text-sm text-gray-600">
                Manage and track your leads with advanced filtering and bulk operations
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
                onClick={handleRequestLead}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Request Lead
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {showStatistics && (
          <div className="mb-8">
            <LeadsStatistics statistics={statistics} isLoading={false} />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex justify-between" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('leads')}
                className={`${canAccessArchiveLeads() ? 'flex-1' : 'flex-1'} py-3 px-4 border-b-2 font-medium text-sm transition-colors text-center ${
                  activeTab === 'leads'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>All Leads</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('crack')}
                className={`${canAccessArchiveLeads() ? 'flex-1' : 'flex-1'} py-3 px-4 border-b-2 font-medium text-sm transition-colors text-center ${
                  activeTab === 'crack'
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Crack Leads</span>
                </div>
              </button>
              {canAccessArchiveLeads() && (
                <button
                  onClick={() => setActiveTab('archive')}
                  className={`flex-1 py-3 px-4 border-b-2 font-medium text-sm transition-colors text-center ${
                    activeTab === 'archive'
                      ? 'border-gray-500 text-gray-600 bg-gray-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4-4 4m5-4h6" />
                    </svg>
                    <span>Archive Leads</span>
                  </div>
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Dynamic Tab-specific Filters - NEW GENERIC SYSTEM */}
        {activeTab === 'leads' && (
          <GenericLeadsFilters
            showFilters={{
              status: true,
              type: true,
              salesUnit: true,
              assignedTo: true,
              dateRange: true
            }}
            onFiltersChange={handleRegularFiltersChange}
            onClearFilters={handleRegularClearFilters}
            salesUnits={salesUnits}
            employees={employees}
            searchPlaceholder="Search leads by name, email, phone..."
            theme={{
              primary: 'bg-indigo-600',
              secondary: 'hover:bg-indigo-700',
              ring: 'ring-indigo-500',
              bg: 'bg-indigo-100',
              text: 'text-indigo-800'
            }}
          />
        )}
        
        {activeTab === 'crack' && (
          <GenericLeadsFilters
            showFilters={{
              industry: true,
              amountRange: true,
              closedBy: true,
              currentPhase: true,
              totalPhases: true
            }}
            onFiltersChange={handleCrackedFiltersChange}
            onClearFilters={handleCrackedClearFilters}
            employees={employees}
            industries={industries}
            searchPlaceholder="Search cracked leads..."
            theme={{
              primary: 'bg-green-600',
              secondary: 'hover:bg-green-700',
              ring: 'ring-green-500',
              bg: 'bg-green-100',
              text: 'text-green-800'
            }}
          />
        )}
        
        {activeTab === 'archive' && canAccessArchiveLeads() && (
          <GenericLeadsFilters
            showFilters={{
              salesUnit: true,
              assignedTo: true,
              source: true,
              outcome: true,
              qualityRating: true,
              archivedDateRange: true
            }}
            onFiltersChange={handleArchivedFiltersChange}
            onClearFilters={handleArchivedClearFilters}
            salesUnits={salesUnits}
            employees={employees}
            searchPlaceholder="Search archived leads..."
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
          selectedLeads={selectedLeads}
          onBulkAssign={handleBulkAssign}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedLeads([])}
          employees={employees}
        />

        {/* Conditional Table Rendering */}
        {activeTab === 'leads' && (
          <LeadsTable
            leads={regularLeads}
            isLoading={isLoadingRegular}
            currentPage={regularPagination.currentPage}
            totalPages={regularPagination.totalPages}
            totalItems={regularPagination.totalItems}
            itemsPerPage={regularPagination.itemsPerPage}
            onPageChange={handlePageChange}
            onLeadClick={handleLeadClick}
            onBulkSelect={handleBulkSelect}
            selectedLeads={selectedLeads}
          />
        )}
        
        {activeTab === 'crack' && (
          <CrackLeadsTable
            leads={crackedLeads}
            isLoading={isLoadingCracked}
            currentPage={crackedPagination.currentPage}
            totalPages={crackedPagination.totalPages}
            totalItems={crackedPagination.totalItems}
            itemsPerPage={crackedPagination.itemsPerPage}
            onPageChange={handlePageChange}
            onLeadClick={handleLeadClick}
            onBulkSelect={handleBulkSelect}
            selectedLeads={selectedLeads}
          />
        )}
        
        {activeTab === 'archive' && canAccessArchiveLeads() && (
          <ArchiveLeadsTable
            leads={archivedLeads}
            isLoading={isLoadingArchived}
            currentPage={archivedPagination.currentPage}
            totalPages={archivedPagination.totalPages}
            totalItems={archivedPagination.totalItems}
            itemsPerPage={archivedPagination.itemsPerPage}
            onPageChange={handlePageChange}
            onLeadClick={handleLeadClick}
            onBulkSelect={handleBulkSelect}
            selectedLeads={selectedLeads}
          />
        )}

        {/* Lead Details Drawer */}
        <LeadDetailsDrawer
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          viewMode={activeTab === 'leads' ? 'full' : 'details-only'}
          onLeadUpdated={(updatedLead) => {
            // React Query will automatically refetch the data
            // No manual state updates needed!
            
            setSelectedLead(updatedLead);
            setNotification({
              type: 'success',
              message: 'Lead updated successfully!'
            });
            setTimeout(() => setNotification(null), 3000);
          }}
        />

        {/* Request Lead Modal */}
        <RequestLeadModal
          isOpen={showRequestLeadModal}
          onClose={() => setShowRequestLeadModal(false)}
          userRole={user?.role}
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

export default LeadsManagementPage;
