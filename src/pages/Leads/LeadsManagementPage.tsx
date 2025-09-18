import React, { useState, useEffect } from 'react';
import LeadsTable from '../../components/leads/LeadsTable';
import LeadsFilters from '../../components/leads/LeadsFilters';
import LeadDetailsDrawer from '../../components/leads/LeadDetailsDrawer';
import BulkActions from '../../components/leads/BulkActions';
import LeadsStatistics from '../../components/leads/LeadsStatistics';
import CreateLeadForm from '../../components/common/CreateLeadForm/CreateLeadForm';
import { 
  getLeadsApi, 
  updateLeadApi,
  bulkUpdateLeadsApi, 
  bulkDeleteLeadsApi, 
  getLeadsStatisticsApi, 
  getEmployeesApi 
} from '../../apis/leads';
import type { Lead, UpdateLeadRequest } from '../../types';

const LeadsManagementPage: React.FC = () => {
  // State management
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
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
  const [salesUnits, setSalesUnits] = useState<Array<{ id: number; name: string }>>([]);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    byStatus: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    conversionRate: 0,
    thisMonth: {
      new: 0,
      inProgress: 0,
      completed: 0,
      failed: 0
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
    }
  };

  // Fetch employees and sales units
  const fetchSupportingData = async () => {
    try {
      const [employeesRes, salesUnitsRes] = await Promise.all([
        getEmployeesApi(),
        // Mock sales units for now
        Promise.resolve({
          success: true,
          data: [
            { id: 1, name: 'Sales Unit 1' },
            { id: 2, name: 'Sales Unit 2' },
            { id: 3, name: 'Sales Unit 3' },
            { id: 4, name: 'Enterprise Sales' },
            { id: 5, name: 'SMB Sales' }
          ]
        })
      ]);

      if (employeesRes.success && employeesRes.data) {
        setEmployees(employeesRes.data);
      }

      if (salesUnitsRes.success && salesUnitsRes.data) {
        setSalesUnits(salesUnitsRes.data);
      }
    } catch (error) {
      console.error('Error fetching supporting data:', error);
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

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      // Check if any restricted fields are being updated
      const restrictedFields = ['name', 'email', 'phone', 'source', 'assignedTo'];
      const hasRestrictedFields = restrictedFields.some(field => updates[field as keyof Lead] !== undefined);
      
      if (hasRestrictedFields) {
        setNotification({
          type: 'error',
          message: 'Contact information (name, email, phone, source) and assignment cannot be updated through this interface. Use the specific outcome/status update features.'
        });
        return;
      }
      
      // Prepare update data according to backend API format
      const updateData: UpdateLeadRequest = {};
      
      // Map frontend fields to backend API fields
      if (updates.outcome !== undefined) {
        updateData.outcome = updates.outcome;
        // Comment is required when updating outcome
        if (!updateData.comment) {
          updateData.comment = `Outcome updated to ${updates.outcome}`;
        }
      }
      
      if (updates.status !== undefined) {
        updateData.status = updates.status;
        // Add a default comment for status updates
        if (!updateData.comment) {
          updateData.comment = `Status updated to ${updates.status}`;
        }
      }
      
      if (updates.type !== undefined) {
        updateData.type = updates.type;
        // Add a default comment for type updates
        if (!updateData.comment) {
          updateData.comment = `Type updated to ${updates.type}`;
        }
      }
      
      // Handle notes as comment (backend expects 'comment' field)
      if (updates.notes !== undefined) {
        updateData.comment = updates.notes;
      }
      
      // Debug: Log the data being sent
      console.log('Updating lead with data:', updateData);
      
      // Call the API to update the lead
      const response = await updateLeadApi(leadId, updateData);
      
      if (response.success && response.data) {
        // Update local state with the response from server
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? response.data! : lead
        ));
        
        setNotification({
          type: 'success',
          message: 'Lead updated successfully'
        });
      } else {
        throw new Error(response.message || 'Failed to update lead');
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update lead'
      });
    }
  };

  const handleLeadCreated = (newLead: Lead) => {
    setLeads(prev => [newLead, ...prev]);
    setShowCreateForm(false);
    setNotification({
      type: 'success',
      message: 'Lead created successfully!'
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
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Lead
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
          salesUnits={salesUnits}
          employees={employees}
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
          onUpdateLead={handleUpdateLead}
        />

        {/* Create Lead Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateForm(false)}></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Create New Lead</h3>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <CreateLeadForm
                    onSuccess={handleLeadCreated}
                    onError={(error) => setNotification({ type: 'error', message: error })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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
