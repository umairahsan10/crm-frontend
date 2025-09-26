import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../common/DataTable/DataTable';
import DataStatistics from '../common/Statistics/DataStatistics';
import BulkActions from '../common/BulkActions/BulkActions';

// Types for Employee Requests based on backend APIs
interface EmployeeRequest {
  id: number;
  employee_id: number;
  employee_name: string;
  request_type: 'leave' | 'late_reason' | 'half_day';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  hr_notes?: string;
  // Leave request specific fields
  start_date?: string;
  end_date?: string;
  leave_type?: string;
  total_days?: number;
  // Late reason specific fields
  late_date?: string;
  minutes_late?: number;
  late_reason?: string;
  // Half-day specific fields
  half_day_date?: string;
  half_day_type?: 'morning' | 'afternoon';
  half_day_reason?: string;
}

interface EmployeeRequestsResponse {
  requests: EmployeeRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const EmployeeRequestsManagement: React.FC = () => {
  const { user } = useAuth();
  
  // State management
  const [employeeRequests, setEmployeeRequests] = useState<EmployeeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    urgent: 0
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Check if user has access to employee requests
  const hasAccess = user && (
    user.role === 'admin' || 
    user.role === 'dep_manager' || 
    user.role === 'team_lead' ||
    user.role === 'unit_head'
  );

  // Access denied
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to access employee requests. Only <strong>managers and team leads</strong> can view employee requests.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch employee requests
  const fetchEmployeeRequests = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await getEmployeeRequestsApi({ 
      //   page: currentPage, 
      //   search: searchTerm, 
      //   status: statusFilter,
      //   type: typeFilter,
      //   priority: priorityFilter
      // });
      
      // Mock data for now - based on real backend APIs
      const mockResponse: EmployeeRequestsResponse = {
        requests: [
          {
            id: 1,
            employee_id: 26,
            employee_name: 'John Doe',
            request_type: 'leave',
            title: 'Annual Leave Request',
            description: 'Requesting 5 days annual leave for vacation',
            status: 'pending',
            priority: 'medium',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            start_date: '2025-10-01',
            end_date: '2025-10-05',
            leave_type: 'annual',
            total_days: 5
          },
          {
            id: 2,
            employee_id: 27,
            employee_name: 'Jane Smith',
            request_type: 'late_reason',
            title: 'Late Arrival Justification',
            description: 'Late arrival due to traffic jam on highway',
            status: 'approved',
            priority: 'low',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString(),
            hr_notes: 'Approved with warning',
            late_date: '2025-09-25',
            minutes_late: 45,
            late_reason: 'Traffic jam on main highway due to accident'
          },
          {
            id: 3,
            employee_id: 28,
            employee_name: 'Mike Johnson',
            request_type: 'half_day',
            title: 'Half Day Leave Request',
            description: 'Need to leave early for medical appointment',
            status: 'pending',
            priority: 'medium',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date(Date.now() - 172800000).toISOString(),
            half_day_date: '2025-09-27',
            half_day_type: 'afternoon',
            half_day_reason: 'Medical appointment scheduled at 2 PM'
          },
          {
            id: 4,
            employee_id: 29,
            employee_name: 'Sarah Wilson',
            request_type: 'late_reason',
            title: 'Late Arrival Due to Emergency',
            description: 'Family emergency caused delay',
            status: 'in_progress',
            priority: 'high',
            created_at: new Date(Date.now() - 259200000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString(),
            hr_notes: 'Under review - emergency situation',
            late_date: '2025-09-23',
            minutes_late: 90,
            late_reason: 'Family member had medical emergency'
          }
        ],
        total: 4,
        page: 1,
        limit: 10,
        totalPages: 1
      };
      
      setEmployeeRequests(mockResponse.requests);
      setTotalPages(mockResponse.totalPages);
      updateStatistics(mockResponse.requests);
    } catch (error) {
      console.error('Error fetching employee requests:', error);
      setNotification({
        type: 'error',
        message: 'Failed to fetch employee requests'
      });
    } finally {
      setLoading(false);
    }
  };

  // Update statistics
  const updateStatistics = (requests: EmployeeRequest[]) => {
    const stats = {
      total: requests.length,
      pending: requests.filter(req => req.status === 'pending').length,
      approved: requests.filter(req => req.status === 'approved').length,
      rejected: requests.filter(req => req.status === 'rejected').length,
      urgent: requests.filter(req => req.priority === 'urgent').length
    };
    setStatistics(stats);
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    fetchEmployeeRequests();
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'type':
        setTypeFilter(value);
        break;
      case 'priority':
        setPriorityFilter(value);
        break;
    }
    setCurrentPage(1);
    fetchEmployeeRequests();
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchEmployeeRequests();
  };

  // Handle request action (approve/reject) based on request type
  const handleRequestAction = async (requestId: number, action: 'approve' | 'reject', notes?: string) => {
    try {
      // Find the request to determine its type
      const request = employeeRequests.find(req => req.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // TODO: Implement actual API calls based on request type
      let apiEndpoint = '';
      
      switch (request.request_type) {
        case 'leave':
          apiEndpoint = `PUT /hr/attendance/leave-logs/${requestId}/action`;
          break;
        case 'late_reason':
          apiEndpoint = `PUT /hr/attendance/late-logs/${requestId}/action`;
          break;
        case 'half_day':
          apiEndpoint = `PUT /hr/attendance/half-day-logs/${requestId}/action`;
          break;
        default:
          throw new Error('Unknown request type');
      }

      console.log(`API Call: ${apiEndpoint}`);
      console.log(`Action: ${action}`, `Request ID: ${requestId}`, `Notes: ${notes}`);
      
      // TODO: Replace with actual API call
      // await apiPutJson(apiEndpoint, { action, notes });
      
      setNotification({
        type: 'success',
        message: `${request.request_type.replace('_', ' ')} request ${action}d successfully`
      });
      
      fetchEmployeeRequests();
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Failed to ${action} request: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedRequests.length === 0) {
      setNotification({
        type: 'error',
        message: 'Please select requests to perform action'
      });
      return;
    }

    try {
      // TODO: Implement bulk actions
      console.log(`Bulk action: ${action} on requests:`, selectedRequests);
      
      setNotification({
        type: 'success',
        message: `Successfully performed ${action} on ${selectedRequests.length} requests`
      });
      
      setSelectedRequests([]);
      fetchEmployeeRequests();
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Failed to perform ${action}`
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchEmployeeRequests();
  }, []);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Statistics cards
  const statisticsCards = [
    {
      title: 'Total Requests',
      value: statistics.total,
      color: 'blue' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Pending',
      value: statistics.pending,
      color: 'yellow' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Approved',
      value: statistics.approved,
      color: 'green' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Rejected',
      value: statistics.rejected,
      color: 'red' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Urgent',
      value: statistics.urgent,
      color: 'purple' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  // Bulk actions configuration
  const bulkActions = [
    {
      id: 'approve',
      label: 'Approve Selected',
      onClick: (_selectedIds: string[]) => handleBulkAction('approve')
    },
    {
      id: 'reject',
      label: 'Reject Selected',
      onClick: (_selectedIds: string[]) => handleBulkAction('reject')
    },
    {
      id: 'export',
      label: 'Export Selected',
      onClick: (_selectedIds: string[]) => handleBulkAction('export')
    }
  ];

  // Table columns
  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      render: (value: number) => <span className="font-mono text-sm">{value}</span>
    },
    {
      header: 'Employee',
      accessor: 'employee_name',
      render: (value: string, row: EmployeeRequest) => (
        <div>
          <div className="font-medium text-sm">{value}</div>
          <div className="text-xs text-gray-500">ID: {row.employee_id}</div>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'request_type',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'leave' ? 'bg-blue-100 text-blue-800' :
          value === 'late_reason' ? 'bg-yellow-100 text-yellow-800' :
          value === 'half_day' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value === 'late_reason' ? 'Late Reason' :
           value === 'half_day' ? 'Half Day' :
           value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      header: 'Title',
      accessor: 'title',
      render: (value: string) => <span className="text-sm font-medium">{value}</span>
    },
    {
      header: 'Details',
      accessor: 'description',
      render: (value: string, row: EmployeeRequest) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-600 truncate" title={value}>
            {value}
          </div>
          {row.request_type === 'leave' && row.total_days && (
            <div className="text-xs text-blue-600 mt-1">
              {row.total_days} day{row.total_days > 1 ? 's' : ''} ({row.start_date} - {row.end_date})
            </div>
          )}
          {row.request_type === 'late_reason' && row.minutes_late && (
            <div className="text-xs text-yellow-600 mt-1">
              {row.minutes_late} min late on {row.late_date}
            </div>
          )}
          {row.request_type === 'half_day' && row.half_day_type && (
            <div className="text-xs text-orange-600 mt-1">
              {row.half_day_type} half-day on {row.half_day_date}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'urgent' ? 'bg-red-100 text-red-800' :
          value === 'high' ? 'bg-orange-100 text-orange-800' :
          value === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          value === 'approved' ? 'bg-green-100 text-green-800' :
          value === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      header: 'Created',
      accessor: 'created_at',
      render: (value: string) => (
        <span className="text-sm">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (value: number, row: EmployeeRequest) => (
        <div className="flex items-center space-x-2">
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleRequestAction(value, 'approve')}
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => handleRequestAction(value, 'reject')}
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                ✗ Reject
              </button>
            </>
          )}
          <button
            onClick={() => {
              // TODO: Open request details modal
              console.log('View request details:', value);
            }}
            className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Requests</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage leave requests, late reason submissions, and half-day requests from employees
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="mb-8">
          <DataStatistics 
            title="Request Statistics"
            cards={statisticsCards}
            loading={loading}
          />
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search requests..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="leave">Leave Requests</option>
                <option value="late_reason">Late Reason Submissions</option>
                <option value="half_day">Half-Day Requests</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={fetchEmployeeRequests}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedRequests.length > 0 && (
          <div className="mb-6">
            <BulkActions
              selectedItems={selectedRequests}
              actions={bulkActions}
              onClearSelection={() => setSelectedRequests([])}
            />
          </div>
        )}

        {/* Employee Requests Table */}
        <div className="bg-white rounded-lg shadow">
          <DataTable
            data={employeeRequests}
            columns={columns}
            loading={loading}
            selectedRows={selectedRequests}
            onBulkSelect={setSelectedRequests}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            searchable={false}
            sortable={true}
            selectable={true}
            paginated={true}
          />
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeRequestsManagement;
