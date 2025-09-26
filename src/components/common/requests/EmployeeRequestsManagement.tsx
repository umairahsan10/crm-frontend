import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import DataTable from '../DataTable/DataTable';
import DataStatistics from '../Statistics/DataStatistics';
import BulkActions from '../BulkActions/BulkActions';
import { 
  getEmployeeRequestsApi, 
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
  
  // State management
  const [employeeRequests, setEmployeeRequests] = useState<EmployeeRequestTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequests] = useState<string[]>([]);
  const [hrEmployees, setHrEmployees] = useState<Employee[]>([]);
  const [hrEmployeesLoading, setHrEmployeesLoading] = useState(false);
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

  // Filter states - only 4 filters
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [priorityFilter, setPriorityFilter] = useState<string>('All Priority');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All Departments');
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>('All Types');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  // Action modal states
  const [selectedRequest, setSelectedRequest] = useState<EmployeeRequest | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'update' | 'hold' | 'assign'>('approve');
  const [actionNotes, setActionNotes] = useState('');
  const [actionPriority, setActionPriority] = useState<string>('');
  const [actionAssignedTo, setActionAssignedTo] = useState<string>('');

  // Check permissions
  if (!user || (user.role !== 'admin' && user.department !== 'HR')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access employee requests. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // Fetch HR employees for assignment dropdown
  const fetchHrEmployees = async () => {
    try {
      setHrEmployeesLoading(true);
      const response = await getEmployeesApi({ 
        limit: 100,
        departmentId: 3 // Assuming HR department ID is 3, adjust as needed
      });
      setHrEmployees(response.employees);
    } catch (error) {
      console.error('Error fetching HR employees:', error);
      // Fallback to empty array
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
      avg_resolution_time: 0, // This would need backend calculation
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



  // Fetch filtered requests using correct API endpoints
  const fetchFilteredRequests = async () => {
    try {
      setLoading(true);
      
      // Always fetch all requests without backend filtering
      // Apply all filters on the frontend for consistency
      const response = await getEmployeeRequestsApi();
      
      // Apply all filters on the frontend
      let filteredRequests = response;
      
      // Apply status filter (frontend filtering)
      if (statusFilter && statusFilter !== 'All Status') {
        filteredRequests = filteredRequests.filter(request => 
          request.status === statusFilter
        );
      }
      
      // Apply priority filter (frontend filtering)
      if (priorityFilter && priorityFilter !== 'All Priority') {
        filteredRequests = filteredRequests.filter(request => 
          request.priority === priorityFilter
        );
      }
      
      // Apply department filter (frontend filtering)
      if (departmentFilter && departmentFilter !== 'All Departments') {
        filteredRequests = filteredRequests.filter(request => 
          request.department?.name === departmentFilter
        );
      }
      
      // Apply request type filter (frontend filtering)
      if (requestTypeFilter && requestTypeFilter !== 'All Types') {
        filteredRequests = filteredRequests.filter(request => 
          request.requestType === requestTypeFilter
        );
      }
      
      console.log('Filtered requests count:', filteredRequests.length);
      
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

      setEmployeeRequests(mappedRequests);
      
      // Calculate statistics from the filtered data
      const stats = calculateStatistics(mappedRequests);
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching filtered requests:', error);
      // Set empty state on error
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
      alert('Please select requests to perform action');
      return;
    }

    try {
      switch (action) {
        case 'export':
          // Export all data and let the backend handle the export
          const blob = await exportEmployeeRequestsApi({});
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `employee_requests_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          alert(`Employee requests exported successfully in ${exportFormat.toUpperCase()} format`);
          break;
        default:
          alert(`Bulk action "${action}" not implemented yet`);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    }
  };

  // Handle individual request action
  const handleRequestAction = async (requestId: number, action: 'approve' | 'reject' | 'update' | 'hold' | 'assign') => {
    if (!user) return;

    try {
       const actionData: EmployeeRequestAction = {
         status: action === 'approve' ? 'Resolved' : 
                 action === 'reject' ? 'Rejected' : 
                 action === 'hold' ? 'Cancelled' : 
                 action === 'assign' ? 'In_Progress' : 'In_Progress',
         responseNotes: actionNotes || '',
         priority: actionPriority as 'Low' | 'Medium' | 'High' | 'Urgent' | undefined,
         assignedTo: actionAssignedTo && !isNaN(Number(actionAssignedTo)) ? Number(actionAssignedTo) : undefined
       };

      const userId = Number(user.id) || 0;
      if (userId === 0) {
        alert('Invalid user ID. Please log in again.');
        return;
      }

      await takeEmployeeRequestActionApi(requestId, userId, actionData);
      
      alert(`Request ${action}ed successfully`);

      // Refresh data (statistics will be calculated automatically)
      fetchFilteredRequests();
      
      // Close modal
      setActionModalOpen(false);
      setSelectedRequest(null);
      setActionNotes('');
      setActionPriority('');
      setActionAssignedTo('');
    } catch (error) {
      console.error('Error performing request action:', error);
      alert('Failed to perform request action');
    }
  };

  // Open action modal
  const openActionModal = (request: EmployeeRequest, action: 'approve' | 'reject' | 'update' | 'hold' | 'assign') => {
    setSelectedRequest(request);
    setActionType(action);
    setActionModalOpen(true);
    setActionNotes('');
    setActionPriority(request.priority || 'Low');
    setActionAssignedTo(request.assignedTo?.toString() || '');
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
      title: 'Avg Resolution Time',
      value: `${statistics.avg_resolution_time.toFixed(1)} days`,
      color: 'purple' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  // Table columns
  const columns = [
    {
      header: 'Request ID',
      accessor: 'request_id',
      render: (value: number) => (
        <span className="text-sm font-medium text-gray-900">#{value}</span>
      )
    },
    {
      header: 'Employee',
      accessor: 'employee_name',
      render: (value: string, row: EmployeeRequestTableRow) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.employee_email}</div>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department_name',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      )
    },
    {
      header: 'Request Type',
      accessor: 'request_type',
      render: (value: string) => (
        <span className="text-sm text-gray-900">{value}</span>
      )
    },
    {
      header: 'Subject',
      accessor: 'subject',
      render: (value: string) => (
        <div className="max-w-xs">
          <span className="text-sm text-gray-900 truncate block" title={value}>
            {value}
          </span>
        </div>
      )
    },
     {
       header: 'Priority',
       accessor: 'priority',
       render: (value: string) => {
         const priorityColors = {
           'Urgent': 'bg-red-100 text-red-800',
           'High': 'bg-orange-100 text-orange-800',
           'Medium': 'bg-yellow-100 text-yellow-800',
           'Low': 'bg-green-100 text-green-800'
         };
         return (
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[value as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'}`}>
             {value}
           </span>
         );
       }
     },
     {
       header: 'Status',
       accessor: 'status',
       render: (value: string) => {
         const statusColors = {
           'Pending': 'bg-yellow-100 text-yellow-800',
           'In_Progress': 'bg-blue-100 text-blue-800',
           'Resolved': 'bg-green-100 text-green-800',
           'Rejected': 'bg-red-100 text-red-800',
           'Cancelled': 'bg-gray-100 text-gray-800'
         };
         return (
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
             {value === 'In_Progress' ? 'In Progress' : value}
           </span>
         );
       }
     },
    {
      header: 'Assigned To',
      accessor: 'assigned_to_name',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      )
    },
    {
      header: 'Requested On',
      accessor: 'requested_on',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_: any, row: EmployeeRequestTableRow) => (
        <div className="flex space-x-2 flex-wrap">
           <button
             onClick={() => openActionModal(row as any, 'approve')}
             className="text-green-600 hover:text-green-800 text-sm font-medium"
             disabled={row.status === 'Resolved'}
           >
             Resolve
           </button>
           <button
             onClick={() => openActionModal(row as any, 'reject')}
             className="text-red-600 hover:text-red-800 text-sm font-medium"
             disabled={row.status === 'Rejected'}
           >
             Reject
           </button>
          <button
            onClick={() => openActionModal(row as any, 'update')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Update
          </button>
          {row.assigned_to_name === 'Unassigned' && (
            <button
              onClick={() => openActionModal(row as any, 'assign')}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              Assign
            </button>
          )}
        </div>
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
  }, [statusFilter, priorityFilter, departmentFilter, requestTypeFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Requests</h1>
              <p className="mt-2 text-sm text-gray-600">
                View and manage employee requests and communications
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <DataStatistics 
            title="Request Statistics"
            cards={statisticsCards}
            loading={loading}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                 <select
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="All Status">All Status</option>
                   <option value="Pending">Pending</option>
                   <option value="In_Progress">In Progress</option>
                   <option value="Resolved">Resolved</option>
                   <option value="Rejected">Rejected</option>
                   <option value="Cancelled">Cancelled</option>
                 </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                 <select
                   value={priorityFilter}
                   onChange={(e) => setPriorityFilter(e.target.value)}
                   className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="All Priority">All Priority</option>
                   <option value="Low">Low</option>
                   <option value="Medium">Medium</option>
                   <option value="High">High</option>
                   <option value="Urgent">Urgent</option>
                 </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Development">Development</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Production">Production</option>
                  <option value="HR">HR</option>
                  <option value="Accounts">Accounts</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Request Type</label>
                <select
                  value={requestTypeFilter}
                  onChange={(e) => setRequestTypeFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All Types">All Types</option>
                  <option value="Leave Request">Leave Request</option>
                  <option value="Salary Request">Salary Request</option>
                  <option value="Equipment Request">Equipment Request</option>
                  <option value="Training Request">Training Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStatusFilter('All Status');
                    setPriorityFilter('All Priority');
                    setDepartmentFilter('All Departments');
                    setRequestTypeFilter('All Types');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

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
        <div className="bg-white rounded-lg shadow">
          <DataTable
            data={employeeRequests}
            columns={columns}
            loading={loading}
            paginated={false}
          />
        </div>

        {/* Action Modal */}
        {actionModalOpen && selectedRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {actionType === 'approve' ? 'Resolve' : 
                   actionType === 'reject' ? 'Reject' : 
                   actionType === 'hold' ? 'Put On Hold' : 
                   actionType === 'assign' ? 'Assign' : 'Update'} Request
                </h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Subject:</strong> {selectedRequest.subject || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Employee:</strong> {selectedRequest.employee?.firstName || ''} {selectedRequest.employee?.lastName || ''}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Notes
                  </label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter your response notes..."
                  />
                </div>

                {(actionType === 'update' || actionType === 'assign') && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                       <select
                         value={actionPriority}
                         onChange={(e) => setActionPriority(e.target.value)}
                         className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                       >
                         <option value="Low">Low</option>
                         <option value="Medium">Medium</option>
                         <option value="High">High</option>
                         <option value="Urgent">Urgent</option>
                       </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign To HR Employee
                      </label>
                      <select
                        value={actionAssignedTo}
                        onChange={(e) => setActionAssignedTo(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={hrEmployeesLoading}
                      >
                        <option value="">Select HR Employee</option>
                        {hrEmployees.map((hr) => (
                          <option key={hr.id} value={hr.id.toString()}>
                            {hr.firstName} {hr.lastName} (ID: {hr.id}) - {hr.role.name}
                          </option>
                        ))}
                      </select>
                      {hrEmployeesLoading && (
                        <p className="text-xs text-gray-500 mt-1">Loading HR employees...</p>
                      )}
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setActionModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRequestAction(selectedRequest.id, actionType)}
                    className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 ${
                      actionType === 'approve' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
                      actionType === 'reject' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
                      actionType === 'hold' ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' :
                      actionType === 'assign' ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' :
                      'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    }`}
                  >
                    {actionType === 'approve' ? 'Resolve' : 
                     actionType === 'reject' ? 'Reject' : 
                     actionType === 'hold' ? 'Put On Hold' : 
                     actionType === 'assign' ? 'Assign' : 'Update'}
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

export default EmployeeRequestsManagement;
