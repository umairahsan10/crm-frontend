import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import DataStatistics from '../Statistics/DataStatistics';
import BulkActions from '../BulkActions/BulkActions';
import EmployeeRequestsTable from '../../employee-requests/EmployeeRequestsTable';
import GenericEmployeeRequestsFilters from '../../employee-requests/GenericEmployeeRequestsFilters';
import EmployeeRequestDetailsDrawer from '../../employee-requests/EmployeeRequestDetailsDrawer';
import CreateRequestModal from './CreateRequestModal';
import { useNotification } from '../../../hooks/useNotification';
import { 
  useEmployeeRequests,
  useMyEmployeeRequests,
  useEmployeeRequestsStatistics,
  useTakeRequestAction,
  useExportRequests
} from '../../../hooks/queries/useEmployeeRequestsQueries';
import { 
  type EmployeeRequest, 
  type EmployeeRequestAction
} from '../../../apis/employee-requests';


const EmployeeRequestsManagement: React.FC = () => {
  const { user } = useAuth();
  const notification = useNotification();
  
  // Check if user is HR or Admin
  const isHROrAdmin = user?.role === 'admin' || user?.department === 'HR';
  
  // Check if user should be able to create requests (exclude HR dept managers and admins)
  // HR department managers and admins cannot create employee requests
  const canCreateRequest = !isHROrAdmin;
  
  // Filter states
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>('');
  const [fromDateFilter, setFromDateFilter] = useState<string>('');
  const [toDateFilter, setToDateFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // UI state
  const [selectedRequests] = useState<string[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<EmployeeRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);


  // Use appropriate hook based on user role (single API call like Request Admin page)
  const requestsQuery = isHROrAdmin 
    ? useEmployeeRequests({
        page: 1,
        limit: 100, // Backend guard limit - get all data for client-side filtering
      })
    : useMyEmployeeRequests(Number(user?.id), { enabled: !!user?.id });

  const takeActionMutation = useTakeRequestAction();
  const exportMutation = useExportRequests();

  // Extract data from queries
  // useEmployeeRequests returns { data: [], meta: {} }, useMyEmployeeRequests returns [] directly
  const allEmployeeRequests = useMemo(() => {
    if (!requestsQuery.data) return [];
    // Check if data is an array (from useMyEmployeeRequests) or object with data property (from useEmployeeRequests)
    if (Array.isArray(requestsQuery.data)) {
      return requestsQuery.data;
    }
    return requestsQuery.data.data || [];
  }, [requestsQuery.data]);
  
  // Transform to table format and apply ALL filtering client-side
  const employeeRequests = useMemo(() => {
    // First transform the data to table format
    let transformed = allEmployeeRequests.map((request: any) => ({
      id: request.id.toString(),
      request_id: request.id,
      emp_id: request.empId,
      employee_name: `${request.employee?.firstName || ''} ${request.employee?.lastName || ''}`.trim(),
      employee_email: request.employee?.email || 'N/A',
      department_name: request.employee?.department?.name || 'Unknown',
      request_type: request.requestType || 'Other',
      subject: request.subject || 'N/A',
      description: request.description || 'N/A',
      priority: request.priority || 'Low',
      status: request.status || 'Pending',
      requested_on: request.requestedOn || new Date().toISOString(),
      resolved_on: request.resolvedOn || null,
      created_at: request.requestedOn || new Date().toISOString(),
      updated_at: request.updatedAt || new Date().toISOString()
    }));

    // Apply ALL filters client-side
    transformed = transformed.filter((req: any) => {
      // Tab filtering
      if (activeTab === 'pending' && req.status !== 'Pending') return false;
      
      // Search filter
      if (search && !req.subject.toLowerCase().includes(search.toLowerCase()) && 
          !req.employee_name.toLowerCase().includes(search.toLowerCase()) &&
          !req.description.toLowerCase().includes(search.toLowerCase())) return false;
      
      // Status filter
      if (statusFilter && req.status !== statusFilter) return false;
      
      // Department filter
      if (departmentFilter && req.department_name !== departmentFilter) return false;
      
      // Priority filter
      if (priorityFilter && req.priority !== priorityFilter) return false;
      
      // Request type filter
      if (requestTypeFilter && req.request_type !== requestTypeFilter) return false;
      
      // Date filters
      if (fromDateFilter) {
        const reqDate = new Date(req.created_at);
        const fromDate = new Date(fromDateFilter);
        if (reqDate < fromDate) return false;
      }
      
      if (toDateFilter) {
        const reqDate = new Date(req.created_at);
        const toDate = new Date(toDateFilter);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (reqDate > toDate) return false;
      }
      
      return true;
    });

    return transformed;
  }, [allEmployeeRequests, activeTab, search, statusFilter, departmentFilter, priorityFilter, requestTypeFilter, fromDateFilter, toDateFilter]);

  const statisticsQuery = useEmployeeRequestsStatistics(allEmployeeRequests);
  const statistics = statisticsQuery.data || {
    total_requests: 0,
    pending_requests: 0,
    in_progress_requests: 0,
    resolved_requests: 0,
    rejected_requests: 0,
    on_hold_requests: 0,
    critical_requests: 0,
    high_priority_requests: 0,
    medium_priority_requests: 0,
    low_priority_requests: 0,
    avg_resolution_time: 0,
    department_breakdown: [],
    request_type_breakdown: []
  };
  // HR employees data is now included in the requests response
  const hrEmployees = allEmployeeRequests.map((request: any) => request.employee).filter((emp: any, index: number, self: any[]) => 
    index === self.findIndex((e: any) => e.id === emp.id)
  );

  // Calculate counts for tabs using unfiltered data
  const tabCounts = useMemo(() => {
    const requestTypeCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};
    const departmentCounts: Record<string, number> = {};


    allEmployeeRequests.forEach((request: any) => {
      // Count by request type
      const requestType = request.requestType || 'Other';
      requestTypeCounts[requestType] = (requestTypeCounts[requestType] || 0) + 1;

      // Count by priority
      const priority = request.priority || 'Low';
      priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;

      // Count by status
      const status = request.status || 'Pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      // Count by department
      const department = request.employee?.department?.name || 'Unknown';
      departmentCounts[department] = (departmentCounts[department] || 0) + 1;
    });

    return {
      requestTypeCounts,
      priorityCounts,
      statusCounts,
      departmentCounts
    };
  }, [allEmployeeRequests]);

  // Loading states
  const loading = requestsQuery.isLoading;

  // No access check needed - all logged-in users can access this page
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Not Logged In</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please log in to access employee requests.
          </p>
        </div>
      </div>
    );
  }

  // Event handlers
  const handleRequestClick = (request: EmployeeRequest) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedRequest(null);
  };

  const handleRequestCreated = () => {
    // Close modal immediately
    setCreateModalOpen(false);
    
    // Show notification immediately
    notification.show({ message: 'Request created successfully', type: 'success' });
    
    // Refresh data in background (don't await)
    requestsQuery.refetch().catch(error => {
      console.error('Error refreshing requests data:', error);
      notification.show({ message: 'Request created but failed to refresh data', type: 'error' });
    });
  };

  // Update pagination state based on filtered results
  useEffect(() => {
    const totalFilteredItems = employeeRequests.length;
    const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
    // Reset to page 1 if current page is beyond the new total pages
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [employeeRequests.length, itemsPerPage, currentPage]);

  // Client-side pagination
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return employeeRequests.slice(startIndex, endIndex);
  }, [employeeRequests, currentPage, itemsPerPage]);

  // Calculate pagination totals
  const totalItems = employeeRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Handle table row click
  const handleTableRowClick = (row: any) => {
    // Find the original EmployeeRequest object from allEmployeeRequests
    const originalRequest = allEmployeeRequests.find((req: any) => req.id === row.request_id);
    if (originalRequest) {
      handleRequestClick(originalRequest);
    }
  };

  // Action handlers for the drawer
  const handleResolve = async (requestId: number, notes: string) => {
    try {
      const action: EmployeeRequestAction = {
        status: 'Resolved',
        responseNotes: notes
      };
      await takeActionMutation.mutateAsync({ requestId, action });
      await requestsQuery.refetch();
      notification.show({ message: 'Request resolved successfully', type: 'success' });
      setDrawerOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error resolving request:', error);
      notification.show({ message: 'Failed to resolve request', type: 'error' });
    }
  };

  const handleReject = async (requestId: number, notes: string) => {
    try {
      const action: EmployeeRequestAction = {
        status: 'Rejected',
        responseNotes: notes
      };
      await takeActionMutation.mutateAsync({ requestId, action });
      await requestsQuery.refetch();
      notification.show({ message: 'Request rejected successfully', type: 'success' });
      setDrawerOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      notification.show({ message: 'Failed to reject request', type: 'error' });
    }
  };

  const handleUpdate = async (requestId: number, notes: string, priority: string) => {
    try {
      const action: EmployeeRequestAction = {
        status: 'In_Progress',
        responseNotes: notes,
        priority: priority as any,
      };
      await takeActionMutation.mutateAsync({ requestId, action });
      await requestsQuery.refetch();
      notification.show({ message: 'Request updated successfully', type: 'success' });
      setDrawerOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error updating request:', error);
      notification.show({ message: 'Failed to update request', type: 'error' });
    }
  };


  // Handle bulk actions
  const handleExportRequests = async () => {
    try {
      const exportFilters = {
        search,
        status: statusFilter,
        department: departmentFilter,
        priority: priorityFilter,
        requestType: requestTypeFilter,
        start_date: fromDateFilter,
        end_date: toDateFilter
      };
      await exportMutation.mutateAsync(exportFilters);
      notification.show({ message: 'Requests exported successfully', type: 'success' });
    } catch (error) {
      console.error('Error exporting requests:', error);
      notification.show({ message: 'Failed to export requests', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="mt-2 text-gray-600">
                Manage and track employee requests and their status
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
              </button>
              {canCreateRequest && (
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Request
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        {showStatistics && (
          <div className="mb-8">
            <DataStatistics
              title="Request Statistics"
              cards={[
                {
                  title: 'Total Requests',
                  value: statistics.total_requests
                },
                {
                  title: 'Pending',
                  value: statistics.pending_requests
                },
                {
                  title: 'In Progress',
                  value: statistics.in_progress_requests
                },
                {
                  title: 'Resolved',
                  value: statistics.resolved_requests
                }
              ]}
            />
          </div>
        )}

        {/* Filters */}
        <GenericEmployeeRequestsFilters
          onFiltersChange={(newFilters) => {
            setSearch(newFilters.search || '');
            setStatusFilter(newFilters.status || '');
            setDepartmentFilter(newFilters.department || '');
            setPriorityFilter(newFilters.priority || '');
            setRequestTypeFilter(newFilters.requestType || '');
            setFromDateFilter(newFilters.fromDate || '');
            setToDateFilter(newFilters.toDate || '');
            setCurrentPage(1); // Reset to first page when filters change
          }}
          onClearFilters={() => {
            setSearch('');
            setStatusFilter('');
            setDepartmentFilter('');
            setPriorityFilter('');
            setRequestTypeFilter('');
            setFromDateFilter('');
            setToDateFilter('');
            setCurrentPage(1);
          }}
        />

        {/* Tab Navigation */}
        <div className="w-full border-b border-gray-200 mb-4">
          <div className="flex w-full justify-between">
            {/* All Requests Tab */}
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-blue-600'
              }`}
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(1);
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              All Requests ({tabCounts.statusCounts ? Object.values(tabCounts.statusCounts).reduce((sum, count) => sum + count, 0) : 0})
            </button>

            {/* Pending Status Tab */}
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'pending'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-yellow-600'
              }`}
              onClick={() => {
                setActiveTab('pending');
                setCurrentPage(1);
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              Pending ({tabCounts.statusCounts?.Pending || 0})
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="mb-6">
          <BulkActions
            selectedItems={selectedRequests}
            actions={[
              {
                id: 'export',
                label: 'Export Selected',
                onClick: handleExportRequests,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              }
            ]}
            onClearSelection={() => {}}
          />
        </div>

        {/* Employee Requests Table */}
        <EmployeeRequestsTable
          requests={paginatedRequests}
          isLoading={loading || takeActionMutation.isPending}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onRequestClick={handleTableRowClick}
          onBulkSelect={() => {}}
          selectedRequests={selectedRequests}
          showDepartmentColumn={isHROrAdmin}
          showRequestIdColumn={false}
        />

        {/* Request Details Drawer */}
        {selectedRequest && (
          <EmployeeRequestDetailsDrawer
            request={selectedRequest}
            isOpen={drawerOpen}
            onClose={handleCloseDrawer}
            hrEmployees={hrEmployees}
            hrEmployeesLoading={false}
            onResolve={handleResolve}
            onReject={handleReject}
            onUpdate={handleUpdate}
            isHROrAdmin={isHROrAdmin}
          />
        )}

        {/* Create Request Modal */}
        <CreateRequestModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleRequestCreated}
          employeeId={Number(user?.id) || 0}
        />
      </div>
    </div>
  );
};

export default EmployeeRequestsManagement;