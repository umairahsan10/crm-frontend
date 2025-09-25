import React, { useState, useEffect } from 'react';
import LeadsTable from '../../components/leads/LeadsTable';
import LeadsFilters from '../../components/leads/LeadsFilters';
import LeadDetailsDrawer from '../../components/leads/LeadDetailsDrawer';
import BulkActions from '../../components/leads/BulkActions';
import LeadsStatistics from '../../components/leads/LeadsStatistics';
import CreateLeadForm from '../../components/common/CreateLeadForm/CreateLeadForm';
import { 
  getLeadsApi, 
  bulkUpdateLeadsApi, 
  bulkDeleteLeadsApi, 
  getLeadsStatisticsApi, 
  getEmployeesApi 
} from '../../apis/leads';
import type { Lead } from '../../types';

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


  const handleLeadCreated = (newLead: Lead) => {
    console.log('LeadsManagementPage: Lead created successfully:', newLead);
    setLeads(prev => [newLead, ...prev]);
    setShowCreateForm(false);
    setNotification({
      type: 'success',
      message: 'Lead created successfully!'
    });
    // Auto-clear notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
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
                onClick={() => {
                  console.log('LeadsManagementPage: Create Lead button clicked');
                  setShowCreateForm(true);
                }}
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
        />

        {/* Create Lead Modal */}
        {showCreateForm && (() => {
          console.log('LeadsManagementPage: Modal is rendering, showCreateForm:', showCreateForm);
          return (
            <div 
              className="modal-overlay" 
              onClick={() => setShowCreateForm(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
            <div 
              className="modal-content" 
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '0',
                maxWidth: '480px',
                width: '95%',
                maxHeight: '95vh',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
            >
              {/* Modal Header */}
              <div className="modal-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0'
                }}>Create New Lead</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#6b7280',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  ×
                </button>
              </div>
              
              {/* Modal Body - Compact Form */}
              <div className="modal-body" style={{ padding: '0' }}>
                <div style={{ 
                  padding: '20px',
                  maxHeight: 'calc(95vh - 60px)',
                  overflowY: 'auto'
                }}>
                  <style>{`
                    .modal-body .create-lead-form {
                      max-width: 100%;
                      margin: 0;
                      padding: 0;
                    }
                    .modal-body .reusable-form {
                      max-width: 100%;
                      margin: 0;
                      box-shadow: none;
                      border-radius: 0;
                    }
                    .modal-body .form-title {
                      display: none;
                    }
                    .modal-body .form-container {
                      padding: 0;
                    }
                    .modal-body .form-fields {
                      gap: 12px;
                      margin-bottom: 16px;
                    }
                    .modal-body .form-field-wrapper {
                      margin-bottom: 0;
                    }
                    .modal-body .form-field {
                      min-height: 40px;
                      padding: 8px 12px;
                      font-size: 14px;
                    }
                    .modal-body .form-label {
                      font-size: 13px;
                      margin-bottom: 4px;
                      font-weight: 500;
                    }
                    .modal-body .form-submit {
                      margin-top: 16px;
                    }
                    .modal-body .form-button {
                      padding: 10px 20px;
                      font-size: 14px;
                      min-height: 40px;
                    }
                  `}</style>
                  <CreateLeadForm
                    onSuccess={(lead) => {
                      console.log('LeadsManagementPage: CreateLeadForm onSuccess called with:', lead);
                      handleLeadCreated(lead);
                    }}
                    onError={(error) => {
                      console.log('LeadsManagementPage: CreateLeadForm onError called with:', error);
                      setNotification({ type: 'error', message: error });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          );
        })()}

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
