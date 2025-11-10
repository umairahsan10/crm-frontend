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
  useCrackedLeadsAll, 
  useArchivedLeads, 
  useLeadsStatistics,
  useSalesUnits,
  useFilterEmployees,
  useIndustries,
  leadsQueryKeys
} from '../../hooks/queries/useLeadsQueries';
import { useQueryClient } from '@tanstack/react-query';
import type { Lead } from '../../types';

const LeadsManagementPage: React.FC = () => {
  // Auth context
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
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

  // React Query hooks - Enabled for active tab, but prefetch others in background
  // refetchOnMount: false ensures cached data is used instantly when switching tabs
  const leadsQuery = useLeads(
    regularPagination.currentPage, 
    regularPagination.itemsPerPage, 
    regularFilters,
    { enabled: activeTab === 'leads' }
  );
  // Fetch ALL cracked leads once for client-side pagination
  const crackedLeadsQuery = useCrackedLeadsAll(
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
  const allCrackedLeads = (crackedLeadsQuery.data as any)?.data || [];
  const archivedLeads = (archivedLeadsQuery.data as any)?.data || [];

  // Client-side filtering and pagination for cracked leads
  const filteredCrackedLeads = React.useMemo(() => {
    if (!allCrackedLeads.length) return [];
    
    let filtered = [...allCrackedLeads];

    // Apply filters
    if (crackedFilters.search) {
      const searchLower = crackedFilters.search.toLowerCase();
      filtered = filtered.filter((lead: any) => {
        const leadName = lead.lead?.name?.toLowerCase() || '';
        const leadEmail = lead.lead?.email?.toLowerCase() || '';
        const leadPhone = lead.lead?.phone?.toLowerCase() || '';
        const industryName = lead.industry?.name?.toLowerCase() || '';
        return leadName.includes(searchLower) || 
               leadEmail.includes(searchLower) || 
               leadPhone.includes(searchLower) ||
               industryName.includes(searchLower);
      });
    }

    if (crackedFilters.industryId) {
      filtered = filtered.filter((lead: any) => 
        lead.industryId?.toString() === crackedFilters.industryId ||
        lead.industry?.id?.toString() === crackedFilters.industryId
      );
    }

    if (crackedFilters.minAmount) {
      const minAmount = parseFloat(crackedFilters.minAmount);
      filtered = filtered.filter((lead: any) => parseFloat(lead.amount || 0) >= minAmount);
    }

    if (crackedFilters.maxAmount) {
      const maxAmount = parseFloat(crackedFilters.maxAmount);
      filtered = filtered.filter((lead: any) => parseFloat(lead.amount || 0) <= maxAmount);
    }

    if (crackedFilters.closedBy) {
      filtered = filtered.filter((lead: any) => 
        lead.closedBy?.toString() === crackedFilters.closedBy ||
        lead.employee?.id?.toString() === crackedFilters.closedBy
      );
    }

    if (crackedFilters.currentPhase) {
      filtered = filtered.filter((lead: any) => 
        lead.currentPhase?.toString() === crackedFilters.currentPhase
      );
    }

    if (crackedFilters.totalPhases) {
      filtered = filtered.filter((lead: any) => 
        lead.totalPhases?.toString() === crackedFilters.totalPhases
      );
    }

    // Apply sorting
    if (crackedFilters.sortBy) {
      filtered.sort((a: any, b: any) => {
        let aValue: any;
        let bValue: any;

        switch (crackedFilters.sortBy) {
          case 'crackedAt':
            aValue = new Date(a.crackedAt || 0).getTime();
            bValue = new Date(b.crackedAt || 0).getTime();
            break;
          case 'amount':
            aValue = parseFloat(a.amount || 0);
            bValue = parseFloat(b.amount || 0);
            break;
          case 'name':
            aValue = a.lead?.name || '';
            bValue = b.lead?.name || '';
            break;
          default:
            aValue = a[crackedFilters.sortBy] || '';
            bValue = b[crackedFilters.sortBy] || '';
        }

        if (aValue < bValue) return crackedFilters.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return crackedFilters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [allCrackedLeads, crackedFilters]);

  // Client-side pagination for cracked leads
  const crackedLeads = React.useMemo(() => {
    const startIndex = (crackedPagination.currentPage - 1) * crackedPagination.itemsPerPage;
    const endIndex = startIndex + crackedPagination.itemsPerPage;
    return filteredCrackedLeads.slice(startIndex, endIndex);
  }, [filteredCrackedLeads, crackedPagination.currentPage, crackedPagination.itemsPerPage]);
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

  // Update pagination for cracked leads based on filtered results (client-side)
  React.useEffect(() => {
    const totalItems = filteredCrackedLeads.length;
    const totalPages = Math.ceil(totalItems / crackedPagination.itemsPerPage);
    setCrackedPagination(prev => ({
      ...prev,
      totalPages: totalPages || 1,
      totalItems,
      // Reset to page 1 if current page is out of bounds
      currentPage: prev.currentPage > totalPages && totalPages > 0 ? 1 : prev.currentPage,
    }));
  }, [filteredCrackedLeads.length, crackedPagination.itemsPerPage]);

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

  // Prefetch other tabs in the background after initial tab loads
  // This ensures instant tab switching - data is ready before user clicks
  React.useEffect(() => {
    // Only prefetch if current tab has loaded successfully
    const currentTabLoaded = 
      (activeTab === 'leads' && leadsQuery.data) ||
      (activeTab === 'crack' && crackedLeadsQuery.data) ||
      (activeTab === 'archive' && archivedLeadsQuery.data);
    
    if (!currentTabLoaded) return; // Wait for current tab to load first
    
    // Prefetch other tabs in background
    const prefetchTimer = setTimeout(() => {
      // Prefetch cracked leads if not already loaded
      if (activeTab !== 'crack' && !crackedLeadsQuery.data) {
        queryClient.prefetchQuery({
          queryKey: leadsQueryKeys.crackedAll(crackedFilters),
          queryFn: async () => {
            const { getCrackedLeadsApi } = await import('../../apis/leads');
            return getCrackedLeadsApi(1, 1000, crackedFilters);
          },
          staleTime: 5 * 60 * 1000,
        });
      }
      
      // Prefetch archived leads if not already loaded
      if (activeTab !== 'archive' && !archivedLeadsQuery.data && canAccessArchiveLeads()) {
        queryClient.prefetchQuery({
          queryKey: leadsQueryKeys.archivedList({ 
            page: archivedPagination.currentPage, 
            limit: archivedPagination.itemsPerPage, 
            ...archivedFilters 
          }),
          queryFn: async () => {
            const { getArchivedLeadsApi } = await import('../../apis/leads');
            return getArchivedLeadsApi(archivedPagination.currentPage, archivedPagination.itemsPerPage, archivedFilters);
          },
          staleTime: 5 * 60 * 1000,
        });
      }
      
      // Prefetch regular leads if not already loaded
      if (activeTab !== 'leads' && !leadsQuery.data) {
        queryClient.prefetchQuery({
          queryKey: leadsQueryKeys.list({ 
            page: regularPagination.currentPage, 
            limit: regularPagination.itemsPerPage, 
            ...regularFilters 
          }),
          queryFn: async () => {
            const { getLeadsApi } = await import('../../apis/leads');
            return getLeadsApi(regularPagination.currentPage, regularPagination.itemsPerPage, regularFilters);
          },
          staleTime: 5 * 60 * 1000,
        });
      }
    }, 500); // Small delay to not block initial render

    return () => clearTimeout(prefetchTimer);
  }, [
    activeTab, 
    queryClient, 
    leadsQuery.data, 
    crackedLeadsQuery.data, 
    archivedLeadsQuery.data, 
    crackedFilters, 
    archivedFilters, 
    regularFilters,
    archivedPagination,
    regularPagination
  ]);

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
    // Reset to page 1 when filters change
    setCrackedPagination(prev => ({ ...prev, currentPage: 1 }));
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
    setCrackedPagination(prev => ({ ...prev, currentPage: 1 }));
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
