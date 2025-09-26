import React, { useState, useEffect } from 'react';
import LeadsTable from '../../components/leads/LeadsTable';
import LeadsFilters from '../../components/leads/LeadsFilters';
import LeadDetailsDrawer from '../../components/leads/LeadDetailsDrawer';
import BulkActions from '../../components/leads/BulkActions';
import LeadsStatistics from '../../components/leads/LeadsStatistics';
import { 
  getLeadsApi, 
  bulkUpdateLeadsApi, 
  bulkDeleteLeadsApi, 
  getLeadsStatisticsApi, 
  getFilterEmployeesApi 
} from '../../apis/leads';
import type { Lead } from '../../types';

const LeadsManagementPage: React.FC = () => {
  // State management
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatistics, setShowStatistics] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);

  // Filter state
  const [filters, setFilters] = useState({
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

  // Data state
  const [employees, setEmployees] = useState<Array<{ 
    id?: string | number; 
    employeeId?: string | number;
    userId?: string | number;
    _id?: string | number;
    name?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    [key: string]: any;
  }>>([]);
  const [statistics, setStatistics] = useState({
    totalLeads: 0,
    activeLeads: 0,
    completedLeads: 0,
    failedLeads: 0,
    conversionRate: '0%',
    completionRate: '0%',
    byStatus: {
      new: 0,
      inProgress: 0,
      completed: 0,
      failed: 0
    },
    byType: {
      warm: 0,
      cold: 0,
      push: 0,
      upsell: 0
    },
    today: {
      new: 0,
      completed: 0,
      inProgress: 0
    }
  });

  // Fetch leads with current filters
  const fetchLeads = async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      
      const response = await getLeadsApi(page, itemsPerPage, filters);
      
      if (response.success && response.data) {
        setLeads(response.data);
        
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.total);
          setCurrentPage(response.pagination.page);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch leads');
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load leads'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await getLeadsStatisticsApi();
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Fallback to mock statistics data
      setStatistics({
        totalLeads: 0,
        activeLeads: 0,
        completedLeads: 0,
        failedLeads: 0,
        conversionRate: '0%',
        completionRate: '0%',
        byStatus: {
          new: 0,
          inProgress: 0,
          completed: 0,
          failed: 0
        },
        byType: {
          warm: 0,
          cold: 0,
          push: 0,
          upsell: 0
        },
        today: {
          new: 0,
          completed: 0,
          inProgress: 0
        }
      });
    }
  };

  // Fetch employees for bulk actions (this is separate from filter employees)
  const fetchSupportingData = async () => {
    try {
      const employeesRes = await getFilterEmployeesApi();

      if (employeesRes.success && employeesRes.data) {
        setEmployees(employeesRes.data);
      }
    } catch (error) {
      console.error('Error fetching supporting data:', error);
      // Fallback to mock data for bulk actions
      setEmployees([
        { id: '1', name: 'John Smith' },
        { id: '2', name: 'Sarah Johnson' },
        { id: '3', name: 'Mike Wilson' },
        { id: '4', name: 'Emily Davis' }
      ]);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchLeads();
    fetchStatistics();
    fetchSupportingData();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchLeads(1);
  }, [filters]);

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchLeads(page);
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleBulkSelect = (leadIds: string[]) => {
    setSelectedLeads(leadIds);
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleTypeFilter = (type: string) => {
    setFilters(prev => ({ ...prev, type }));
  };

  const handleSalesUnitFilter = (salesUnitId: string) => {
    setFilters(prev => ({ ...prev, salesUnitId }));
  };

  const handleAssignedToFilter = (assignedTo: string) => {
    setFilters(prev => ({ ...prev, assignedTo }));
  };

  const handleDateRangeFilter = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleClearFilters = () => {
    setFilters({
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
  };

  const handleBulkAssign = async (leadIds: string[], assignedTo: string) => {
    try {
      await bulkUpdateLeadsApi(leadIds, { assignedTo });
      setNotification({
        type: 'success',
        message: `Successfully assigned ${leadIds.length} leads`
      });
      setSelectedLeads([]);
      fetchLeads(currentPage);
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
      fetchLeads(currentPage);
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
      fetchLeads(currentPage);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
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
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {showStatistics && (
          <div className="mb-8">
            <LeadsStatistics statistics={statistics} isLoading={false} />
          </div>
        )}

        {/* Filters */}
        <LeadsFilters
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onTypeFilter={handleTypeFilter}
          onSalesUnitFilter={handleSalesUnitFilter}
          onAssignedToFilter={handleAssignedToFilter}
          onDateRangeFilter={handleDateRangeFilter}
          onClearFilters={handleClearFilters}
        />

        {/* Bulk Actions */}
        <BulkActions
          selectedLeads={selectedLeads}
          onBulkAssign={handleBulkAssign}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedLeads([])}
          employees={employees}
        />

        {/* Leads Table */}
        <LeadsTable
          leads={leads}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onLeadClick={handleLeadClick}
          onBulkSelect={handleBulkSelect}
          selectedLeads={selectedLeads}
        />

        {/* Lead Details Drawer */}
        <LeadDetailsDrawer
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          onLeadUpdated={(updatedLead) => {
            setLeads(prev => prev.map(lead => 
              lead.id === updatedLead.id ? updatedLead : lead
            ));
            setSelectedLead(updatedLead);
            setNotification({
              type: 'success',
              message: 'Lead updated successfully!'
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

export default LeadsManagementPage;
