import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import DataStatistics from '../Statistics/DataStatistics';
import BulkActions from '../BulkActions/BulkActions';
import EmployeeRequestsTable from '../../employee-requests/EmployeeRequestsTable';
import EmployeeRequestsFilters from '../../employee-requests/EmployeeRequestsFilters';
import EmployeeRequestDetailsDrawer from '../../employee-requests/EmployeeRequestDetailsDrawer';
import CreateRequestModal from './CreateRequestModal';
import Notification from '../Notification/Notification';
import { useNotification } from '../../../hooks/useNotification';
import { 
  getEmployeeRequestsApi, 
  getMyEmployeeRequestsApi,
  takeEmployeeRequestActionApi,
  exportEmployeeRequestsApi,
  type EmployeeRequest, 
  type EmployeeRequestStats,
  type EmployeeRequestAction
} from '../../../apis/employee-requests';
import { getEmployeesApi, type Employee } from '../../../apis/hr-employees';

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
  
  // State management
  const [employeeRequests, setEmployeeRequests] = useState<EmployeeRequestTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequests] = useState<string[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<EmployeeRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [hrEmployees, setHrEmployees] = useState<Employee[]>([]);
  const [hrEmployeesLoading, setHrEmployeesLoading] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [statistics, setStatistics] = useState<EmployeeRequestStats>({
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
  });

  // Filter states
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

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

  // Fetch HR employees for assignment dropdown (only for HR/Admin)
  const fetchHrEmployees = async () => {
    // Skip fetching HR employees if user is not HR or Admin
    if (!isHROrAdmin) {
      console.log('Skipping HR employees fetch - user is not HR/Admin');
      return;
    }
    
    try {
      setHrEmployeesLoading(true);
      const response = await getEmployeesApi({ 
        limit: 100,
        departmentId: 3 // Assuming HR department ID is 3, adjust as needed
      });
      setHrEmployees(response.employees);
    } catch (error) {
      console.error('Error fetching HR employees:', error);
      setHrEmployees([]);
    } finally {
      setHrEmployeesLoading(false);
    }
  };

  // Calculate statistics from the current requests data
  const calculateStatistics = (requests: EmployeeRequestTableRow[]) => {
    const stats = {
      total_requests: requests.length,
      pending_requests: requests.filter(r => r.status === 'Pending').length,
      in_progress_requests: requests.filter(r => r.status === 'In_Progress').length,
      resolved_requests: requests.filter(r => r.status === 'Resolved').length,
      rejected_requests: requests.filter(r => r.status === 'Rejected').length,
      on_hold_requests: requests.filter(r => r.status === 'Cancelled').length,
      critical_requests: requests.filter(r => r.priority === 'Urgent').length,
      high_priority_requests: requests.filter(r => r.priority === 'High').length,
      medium_priority_requests: requests.filter(r => r.priority === 'Medium').length,
      low_priority_requests: requests.filter(r => r.priority === 'Low').length,
      avg_resolution_time: 0,
      department_breakdown: [] as any[],
      request_type_breakdown: [] as any[]
    };

    // Calculate department breakdown
    const deptCounts = requests.reduce((acc, req) => {
      const dept = req.department_name;
      if (!acc[dept]) {
        acc[dept] = { total: 0, pending: 0, resolved: 0 };
      }
      acc[dept].total++;
      if (req.status === 'Pending') acc[dept].pending++;
      if (req.status === 'Resolved') acc[dept].resolved++;
      return acc;
    }, {} as Record<string, any>);

    stats.department_breakdown = Object.entries(deptCounts).map(([name, counts]) => ({
      department_name: name,
      total_requests: counts.total,
      pending_requests: counts.pending,
      resolved_requests: counts.resolved
    }));

    // Calculate request type breakdown
    const typeCounts = requests.reduce((acc, req) => {
      const type = req.request_type;
      if (!acc[type]) {
        acc[type] = { count: 0, resolved: 0 };
      }
      acc[type].count++;
      if (req.status === 'Resolved') acc[type].resolved++;
      return acc;
    }, {} as Record<string, any>);

    stats.request_type_breakdown = Object.entries(typeCounts).map(([type, counts]) => ({
      request_type: type,
      count: counts.count,
      resolution_rate: counts.count > 0 ? Math.round((counts.resolved / counts.count) * 100) : 0
    }));

    return stats;
  };

  // Fetch filtered requests
  const fetchFilteredRequests = async () => {
    try {
      setLoading(true);
      
      console.log('User ID:', user.id);
      console.log('Is HR or Admin:', isHROrAdmin);
      
      // For regular employees, use the my-requests endpoint
      // For HR/Admin, use the main endpoint to get all requests
      const response = isHROrAdmin 
        ? await getEmployeeRequestsApi({})
        : await getMyEmployeeRequestsApi(Number(user.id));
      
      console.log('Fetched requests response:', response);
      
      // Apply all filters on the frontend
      let filteredRequests = response;
      
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filteredRequests = filteredRequests.filter(request => 
          request.subject?.toLowerCase().includes(searchLower) ||
          request.description?.toLowerCase().includes(searchLower) ||
          `${request.employee?.firstName || ''} ${request.employee?.lastName || ''}`.toLowerCase().includes(searchLower) ||
          request.employee?.email?.toLowerCase().includes(searchLower)
        );
      }
      
      if (statusFilter) {
        filteredRequests = filteredRequests.filter(request => 
          request.status === statusFilter
        );
      }
      
      if (priorityFilter) {
        filteredRequests = filteredRequests.filter(request => 
          request.priority === priorityFilter
        );
      }
      
      if (departmentFilter) {
        filteredRequests = filteredRequests.filter(request => 
          request.department?.name === departmentFilter
        );
      }
      
      if (requestTypeFilter) {
        filteredRequests = filteredRequests.filter(request => 
          request.requestType === requestTypeFilter
        );
      }
      
      const mappedRequests: EmployeeRequestTableRow[] = filteredRequests.map(request => ({
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
      }));

      console.log('Mapped requests count:', mappedRequests.length);
      console.log('Mapped requests:', mappedRequests);

      setEmployeeRequests(mappedRequests);
      
      // Calculate pagination
      setTotalItems(mappedRequests.length);
      setTotalPages(Math.ceil(mappedRequests.length / itemsPerPage));
      
      // Calculate statistics from the filtered data
      const stats = calculateStatistics(mappedRequests);
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching filtered requests:', error);
      setEmployeeRequests([]);
      setStatistics({
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
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedRequests.length === 0) {
      notification.hide();
      setTimeout(() => {
        notification.show({
          type: 'warning',
          message: 'Please select requests to perform action',
          title: 'No Selection',
          autoDismiss: true,
          dismissTimeout: 2000,
          position: 'top-right',
          className: 'bg-white border-2 border-yellow-500 text-yellow-700 shadow-lg notification-red-close'
        });
      }, 100);
      return;
    }

    try {
      switch (action) {
        case 'export':
          const blob = await exportEmployeeRequestsApi({});
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `employee_requests_export_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          notification.hide();
          setTimeout(() => {
            notification.show({
              type: 'success',
              message: 'Employee requests exported successfully!',
              title: 'Export Complete',
              autoDismiss: true,
              dismissTimeout: 2000,
              position: 'top-right',
              className: 'bg-white notification-red-close',
              style: {
                backgroundColor: '#ffffff',
                border: '2px solid #000000',
                color: '#000000'
              }
            });
          }, 100);
          break;
        default:
          notification.hide();
          setTimeout(() => {
            notification.show({
              type: 'info',
              message: `Bulk action "${action}" not implemented yet`,
              title: 'Info',
              autoDismiss: true,
              dismissTimeout: 2000,
              position: 'top-right',
              className: 'bg-white border-2 border-blue-500 text-blue-700 shadow-lg notification-red-close'
            });
          }, 100);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      notification.hide();
      setTimeout(() => {
        notification.show({
          type: 'error',
          message: 'Failed to perform bulk action',
          title: 'Error',
          autoDismiss: true,
          dismissTimeout: 2000,
          position: 'top-right',
          className: 'bg-white border-2 border-red-500 text-red-700 shadow-lg notification-red-close'
        });
      }, 100);
    }
  };

  // Handle row click - find and set the full request object
  const handleRequestClick = (row: EmployeeRequestTableRow) => {
    // We need to find the full EmployeeRequest object from the API response
    // For now, we'll construct it from the row data
    const fullRequest: EmployeeRequest = {
      id: row.request_id,
      empId: row.emp_id,
      departmentId: 0, // This would need to be stored in the row
      requestType: row.request_type,
      subject: row.subject,
      description: row.description,
      priority: row.priority as any,
      status: row.status as any,
      assignedTo: 0,
      requestedOn: row.requested_on,
      resolvedOn: row.resolved_on,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      employee: {
        id: row.emp_id,
        firstName: row.employee_name.split(' ')[0] || '',
        lastName: row.employee_name.split(' ').slice(1).join(' ') || '',
        email: row.employee_email,
        department: {
          id: 0,
          name: row.department_name
        },
        role: {
          id: 0,
          name: ''
        }
      },
      department: {
        id: 0,
        name: row.department_name
      },
      assignedToEmployee: {
        id: 0,
        firstName: row.assigned_to_name !== 'Unassigned' ? row.assigned_to_name.split(' ')[0] : 'Unassigned',
        lastName: row.assigned_to_name !== 'Unassigned' ? row.assigned_to_name.split(' ').slice(1).join(' ') : '',
        email: ''
      }
    };
    
    setSelectedRequest(fullRequest);
    setDrawerOpen(true);
  };

  // Action handlers
  const handleResolve = async (requestId: number, notes: string) => {
    if (!user) return;
    try {
      const actionData: EmployeeRequestAction = {
        status: 'Resolved',
        responseNotes: notes
      };
      const userId = Number(user.id) || 0;
      await takeEmployeeRequestActionApi(requestId, userId, actionData);
      notification.show({
        type: 'success',
        message: 'Request resolved successfully!',
        title: 'Success',
        autoDismiss: true,
        dismissTimeout: 2000,
        position: 'top-right',
        className: 'bg-white notification-red-close',
        style: {
          backgroundColor: '#ffffff',
          border: '2px solid #000000',
          color: '#000000'
        }
      });
      fetchFilteredRequests();
      setDrawerOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error resolving request:', error);
      notification.hide();
      setTimeout(() => {
        notification.show({
          type: 'error',
          message: 'Failed to resolve request',
          title: 'Error',
          autoDismiss: true,
          dismissTimeout: 2000,
          position: 'top-right',
          className: 'bg-white border-2 border-red-500 text-red-700 shadow-lg notification-red-close'
        });
      }, 100);
    }
  };

  const handleReject = async (requestId: number, notes: string) => {
    if (!user) return;
    try {
      const actionData: EmployeeRequestAction = {
        status: 'Rejected',
        responseNotes: notes
      };
      const userId = Number(user.id) || 0;
      await takeEmployeeRequestActionApi(requestId, userId, actionData);
      notification.hide();
      setTimeout(() => {
        notification.show({
          type: 'success',
          message: 'Request rejected successfully',
          title: 'Rejected',
          autoDismiss: true,
          dismissTimeout: 2000,
          position: 'top-right',
          className: 'bg-white border-2 border-orange-500 text-orange-700 shadow-lg notification-red-close'
        });
      }, 100);
      fetchFilteredRequests();
      setDrawerOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      notification.hide();
      setTimeout(() => {
        notification.show({
          type: 'error',
          message: 'Failed to reject request',
          title: 'Error',
          autoDismiss: true,
          dismissTimeout: 2000,
          position: 'top-right',
          className: 'bg-white border-2 border-red-500 text-red-700 shadow-lg notification-red-close'
        });
      }, 100);
    }
  };

  const handleUpdate = async (requestId: number, notes: string, priority: string, assignedTo: string) => {
    if (!user) return;
    try {
      const actionData: EmployeeRequestAction = {
        status: 'In_Progress',
        responseNotes: notes,
        priority: priority as any,
        assignedTo: assignedTo && !isNaN(Number(assignedTo)) ? Number(assignedTo) : undefined
      };
      const userId = Number(user.id) || 0;
      await takeEmployeeRequestActionApi(requestId, userId, actionData);
      notification.hide();
      setTimeout(() => {
        notification.show({
          type: 'success',
          message: 'Request updated successfully!',
          title: 'Success',
          autoDismiss: true,
          dismissTimeout: 2000,
          position: 'top-right',
          className: 'bg-white border-2 border-blue-500 text-blue-700 shadow-lg notification-red-close'
        });
      }, 100);
      fetchFilteredRequests();
      setDrawerOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error updating request:', error);
      notification.hide();
      setTimeout(() => {
        notification.show({
          type: 'error',
          message: 'Failed to update request',
          title: 'Error',
          autoDismiss: true,
          dismissTimeout: 2000,
          position: 'top-right',
          className: 'bg-white border-2 border-red-500 text-red-700 shadow-lg notification-red-close'
        });
      }, 100);
    }
  };

  const handleAssign = async (requestId: number, notes: string, priority: string, assignedTo: string) => {
    if (!user) return;
    try {
      const actionData: EmployeeRequestAction = {
        status: 'In_Progress',
        responseNotes: notes,
        priority: priority as any,
        assignedTo: assignedTo && !isNaN(Number(assignedTo)) ? Number(assignedTo) : undefined
      };
      const userId = Number(user.id) || 0;
      await takeEmployeeRequestActionApi(requestId, userId, actionData);
      notification.hide();
      setTimeout(() => {
        notification.show({
          type: 'success',
          message: 'Request assigned successfully!',
          title: 'Success',
          autoDismiss: true,
          dismissTimeout: 2000,
          position: 'top-right',
          className: 'bg-white border-2 border-purple-500 text-purple-700 shadow-lg notification-red-close'
        });
      }, 100);
      fetchFilteredRequests();
      setDrawerOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error assigning request:', error);
      notification.hide();
      setTimeout(() => {
        notification.show({
          type: 'error',
          message: 'Failed to assign request',
          title: 'Error',
          autoDismiss: true,
          dismissTimeout: 2000,
          position: 'top-right',
          className: 'bg-white border-2 border-red-500 text-red-700 shadow-lg notification-red-close'
        });
      }, 100);
    }
  };

  const handleHold = async (requestId: number, notes: string) => {
    if (!user) return;
    try {
      const actionData: EmployeeRequestAction = {
        status: 'Cancelled',
        responseNotes: notes
      };
      const userId = Number(user.id) || 0;
      await takeEmployeeRequestActionApi(requestId, userId, actionData);
      notification.hide();
      setTimeout(() => {
        notification.show({
          type: 'success',
          message: 'Request put on hold successfully',
          title: 'On Hold',
          autoDismiss: true,
          dismissTimeout: 2000,
          position: 'top-right',
          className: 'bg-white border-2 border-yellow-500 text-yellow-700 shadow-lg notification-red-close'
        });
      }, 100);
      fetchFilteredRequests();
      setDrawerOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error putting request on hold:', error);
      notification.hide();
      setTimeout(() => {
        notification.show({
          type: 'error',
          message: 'Failed to put request on hold',
          title: 'Error',
          autoDismiss: true,
          dismissTimeout: 2000,
          position: 'top-right',
          className: 'bg-white border-2 border-red-500 text-red-700 shadow-lg notification-red-close'
        });
      }, 100);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setDepartmentFilter('');
    setRequestTypeFilter('');
  };

  // Statistics cards
  const statisticsCards = [
    {
      title: 'Total Requests',
      value: statistics.total_requests,
      color: 'blue' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: `Page ${currentPage} Requests`,
      value: employeeRequests.length,
      color: 'blue' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Pending',
      value: statistics.pending_requests,
      color: 'yellow' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'In Progress',
      value: statistics.in_progress_requests,
      color: 'blue' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Completed',
      value: statistics.resolved_requests,
      color: 'green' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Urgent Priority',
      value: statistics.critical_requests,
      color: 'red' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Rejected',
      value: statistics.rejected_requests,
      color: 'red' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Cancelled',
      value: statistics.on_hold_requests,
      color: 'indigo' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  // Load data on component mount
  useEffect(() => {
    fetchFilteredRequests();
    fetchHrEmployees();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchFilteredRequests();
  }, [search, statusFilter, priorityFilter, departmentFilter, requestTypeFilter]);

  // Get paginated data
  const paginatedRequests = employeeRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isHROrAdmin ? 'Employee Requests' : 'My Requests'}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {isHROrAdmin 
                  ? 'View and manage employee requests and communications'
                  : 'View your requests and submit new ones to HR'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {!isHROrAdmin && (
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Request
                </button>
              )}
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
            <DataStatistics 
              title={`Request Statistics - Overall (Page ${currentPage} of ${totalPages} showing ${paginatedRequests.length} of ${totalItems} requests)`}
              cards={statisticsCards}
              loading={loading}
            />
            
            {/* Page Information */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Current Page Information</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing requests {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} total requests
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{paginatedRequests.length}</div>
                  <div className="text-sm text-gray-500">requests on this page</div>
                </div>
              </div>
            </div>

            {/* Additional Statistics Sections */}
            <div className="mt-8">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Breakdown by Category</h3>
                <p className="text-sm text-gray-600">
                  {isHROrAdmin ? 'Statistics from all requests in the system' : 'Statistics from your requests'}
                </p>
              </div>
              <div className={`grid grid-cols-1 ${isHROrAdmin ? 'lg:grid-cols-2' : ''} gap-6`}>
                {/* Department Breakdown - Only for HR/Admin */}
                {isHROrAdmin && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">By Department</h3>
                  <div className="space-y-3">
                    {statistics.department_breakdown.length > 0 ? (
                      statistics.department_breakdown.map((dept) => (
                        <div key={dept.department_name} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">{dept.department_name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-blue-600">{dept.total_requests}</span>
                            <span className="text-xs text-gray-500">
                              ({dept.pending_requests} pending)
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No department data available</p>
                    )}
                  </div>
                </div>
                )}

                {/* Request Type Breakdown */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">By Request Type</h3>
                  <div className="space-y-3">
                    {statistics.request_type_breakdown.length > 0 ? (
                      statistics.request_type_breakdown.map((type) => (
                        <div key={type.request_type} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">{type.request_type}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-blue-600">{type.count}</span>
                            <span className="text-xs text-gray-500">
                              ({type.resolution_rate}% resolved)
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No request type data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <EmployeeRequestsFilters
          search={search}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          departmentFilter={departmentFilter}
          requestTypeFilter={requestTypeFilter}
          onSearchChange={setSearch}
          onStatusFilter={setStatusFilter}
          onPriorityFilter={setPriorityFilter}
          onDepartmentFilter={setDepartmentFilter}
          onRequestTypeFilter={setRequestTypeFilter}
          onClearFilters={handleClearFilters}
        />

        {/* Bulk Actions */}
        <div className="mb-6">
          <BulkActions
            selectedItems={selectedRequests}
            onClearSelection={() => {}}
            actions={[
              { id: 'export', label: 'Export Selected', icon: '📤', onClick: () => handleBulkAction('export') }
            ]}
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
          onRequestClick={handleRequestClick}
          onBulkSelect={() => {}}
          selectedRequests={selectedRequests}
          showDepartmentColumn={isHROrAdmin}
        />

        {/* Request Details Drawer */}
        <EmployeeRequestDetailsDrawer
          request={selectedRequest}
          isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedRequest(null);
          }}
          hrEmployees={hrEmployees}
          hrEmployeesLoading={hrEmployeesLoading}
          onResolve={handleResolve}
          onReject={handleReject}
          onUpdate={handleUpdate}
          onAssign={handleAssign}
          onHold={handleHold}
          isHROrAdmin={isHROrAdmin}
        />

        {/* Create Request Modal */}
        <CreateRequestModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            fetchFilteredRequests();
            notification.hide();
            setTimeout(() => {
              notification.show({
                type: 'success',
                message: 'Request created successfully!',
                title: 'Success',
                autoDismiss: true,
                dismissTimeout: 2000,
                position: 'top-right',
                className: 'bg-white notification-red-close',
                style: {
                  backgroundColor: '#ffffff',
                  border: '2px solid #000000',
                  color: '#000000'
                }
              });
            }, 100);
          }}
          employeeId={Number(user.id)}
        />

        {/* Notification */}
        <Notification
          visible={notification.visible}
          onClose={notification.hide}
          {...notification.config}
        />
      </div>
    </div>
  );
};

export default EmployeeRequestsManagement;
