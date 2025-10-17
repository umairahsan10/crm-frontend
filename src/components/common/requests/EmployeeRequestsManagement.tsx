import React, { useState, useMemo } from 'react';
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
import { useEmployees } from '../../../hooks/queries/useHRQueries';
import { 
  type EmployeeRequest, 
  type EmployeeRequestAction
} from '../../../apis/employee-requests';

// Local interface for component
interface EmployeeRequestTableRow {
  id: string; // For DataTable compatibility
  request_id: number;
  emp_id: number;
  employee_name: string;
  employee_email: string;
  department_name: string;
  request_type: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  assigned_to_name: string;
  requested_on: string;
  resolved_on: string | null;
  created_at: string;
  updated_at: string;
}

const EmployeeRequestsManagement: React.FC = () => {
  const { user } = useAuth();
  const notification = useNotification();
  
  // Check if user is HR or Admin
  const isHROrAdmin = user?.role === 'admin' || user?.department === 'HR';
  
  // Filter states
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // UI state
  const [selectedRequests] = useState<string[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<EmployeeRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);

  // React Query hooks
  const filters = useMemo(() => ({
    search,
    status: statusFilter,
    priority: priorityFilter,
    department: departmentFilter,
    requestType: requestTypeFilter,
    page: currentPage,
    limit: itemsPerPage
  }), [search, statusFilter, priorityFilter, departmentFilter, requestTypeFilter, currentPage]);

  // Use appropriate hook based on user role
  const requestsQuery = isHROrAdmin 
    ? useEmployeeRequests(filters)
    : useMyEmployeeRequests(Number(user?.id), { enabled: !!user?.id });

  const employeesQuery = useEmployees(100);
  const takeActionMutation = useTakeRequestAction();
  const exportMutation = useExportRequests();

  // Extract data from queries
  const employeeRequests = requestsQuery.data || [];
  const statisticsQuery = useEmployeeRequestsStatistics(employeeRequests);
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
  const hrEmployees = employeesQuery.data?.employees || [];

  // Loading states
  const loading = requestsQuery.isLoading;
  const hrEmployeesLoading = employeesQuery.isLoading;

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
    setCreateModalOpen(false);
    notification.show({ message: 'Request created successfully', type: 'success' });
  };

  // Convert EmployeeRequest to EmployeeRequestTableRow format
  const convertToTableRow = (request: EmployeeRequest): EmployeeRequestTableRow => ({
    id: request.id.toString(),
    request_id: request.id,
    emp_id: request.empId,
    employee_name: `${request.employee?.firstName || ''} ${request.employee?.lastName || ''}`.trim() || 'N/A',
    employee_email: request.employee?.email || 'N/A',
    department_name: request.department?.name || 'N/A',
    request_type: request.requestType || 'N/A',
    subject: request.subject || 'N/A',
    description: request.description || 'N/A',
    priority: request.priority || 'Low',
    status: request.status || 'Pending',
    assigned_to_name: request.assignedToEmployee ? 
      `${request.assignedToEmployee.firstName || ''} ${request.assignedToEmployee.lastName || ''}`.trim() || 'N/A' : 
      'Unassigned',
    requested_on: request.requestedOn || new Date().toISOString(),
    resolved_on: request.resolvedOn || null,
    created_at: request.createdAt || new Date().toISOString(),
    updated_at: request.updatedAt || new Date().toISOString()
  });

  // Convert requests to table format
  const tableRequests = employeeRequests.map(convertToTableRow);
  
  // Pagination calculations
  const totalItems = tableRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedRequests = tableRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle table row click
  const handleTableRowClick = (row: EmployeeRequestTableRow) => {
    // Find the original EmployeeRequest object
    const originalRequest = employeeRequests.find((req: EmployeeRequest) => req.id === row.request_id);
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
      notification.show({ message: 'Request rejected successfully', type: 'success' });
      setDrawerOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      notification.show({ message: 'Failed to reject request', type: 'error' });
    }
  };

  const handleUpdate = async (requestId: number, notes: string, priority: string, assignedTo: string) => {
    try {
      const action: EmployeeRequestAction = {
        status: 'In_Progress',
        responseNotes: notes,
        priority: priority as any,
        assignedTo: assignedTo && !isNaN(Number(assignedTo)) ? Number(assignedTo) : undefined
      };
      await takeActionMutation.mutateAsync({ requestId, action });
      notification.show({ message: 'Request updated successfully', type: 'success' });
      setDrawerOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error updating request:', error);
      notification.show({ message: 'Failed to update request', type: 'error' });
    }
  };

  const handleAssign = async (requestId: number, notes: string, priority: string, assignedTo: string) => {
    try {
      const action: EmployeeRequestAction = {
        status: 'In_Progress',
        responseNotes: notes,
        priority: priority as any,
        assignedTo: assignedTo && !isNaN(Number(assignedTo)) ? Number(assignedTo) : undefined
      };
      await takeActionMutation.mutateAsync({ requestId, action });
      notification.show({ message: 'Request assigned successfully', type: 'success' });
      setDrawerOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error assigning request:', error);
      notification.show({ message: 'Failed to assign request', type: 'error' });
    }
  };

  const handleHold = async (requestId: number, notes: string) => {
    try {
      const action: EmployeeRequestAction = {
        status: 'Pending',
        responseNotes: notes
      };
      await takeActionMutation.mutateAsync({ requestId, action });
      notification.show({ message: 'Request put on hold successfully', type: 'success' });
      setDrawerOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error putting request on hold:', error);
      notification.show({ message: 'Failed to put request on hold', type: 'error' });
    }
  };

  // Handle bulk actions
  const handleExportRequests = async () => {
    try {
      await exportMutation.mutateAsync(filters);
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
              <h1 className="text-3xl font-bold text-gray-900">Employee Requests</h1>
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
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Request
              </button>
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
            setPriorityFilter(newFilters.priority || '');
            setDepartmentFilter(newFilters.department || '');
            setRequestTypeFilter(newFilters.requestType || '');
            setCurrentPage(1); // Reset to first page when filters change
          }}
          onClearFilters={() => {
            setSearch('');
            setStatusFilter('');
            setPriorityFilter('');
            setDepartmentFilter('');
            setRequestTypeFilter('');
            setCurrentPage(1);
          }}
        />

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
          isLoading={loading}
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
            hrEmployeesLoading={hrEmployeesLoading}
            onResolve={handleResolve}
            onReject={handleReject}
            onUpdate={handleUpdate}
            onAssign={handleAssign}
            onHold={handleHold}
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