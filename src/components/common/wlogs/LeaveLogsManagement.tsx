import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import DataTable from '../DataTable/DataTable';
import DataStatistics from '../Statistics/DataStatistics';
import BulkActions from '../BulkActions/BulkActions';
import { getLeaveLogsApi, getLeaveLogsStatsApi, exportLeaveLogsApi, type GetLeaveLogsDto } from '../../../apis/leave-logs';

// Local interface for component
interface LeaveLogTableRow {
  id: string; // For DataTable compatibility
  leave_log_id: number;
  employee_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
  employee_name: string;
  employee_email: string;
  approver_name?: string;
}

const LeaveLogsManagement: React.FC = () => {
  const { user } = useAuth();
  
  // State management
  const [leaveLogs, setLeaveLogs] = useState<LeaveLogTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalDays: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  // Check if user has access to leave logs
  const hasAccess = user && (
    user.role === 'admin' || 
    user.role === 'dep_manager' ||
    user.role === 'team_lead' ||
    user.role === 'unit_head' ||
    user.role === 'senior' ||
    user.role === 'junior'
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
              You don't have permission to access leave logs. Please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch statistics from API
  const fetchStatistics = async () => {
    try {
      const statsResponse = await getLeaveLogsStatsApi();
      setStatistics({
        total: statsResponse.summary.totalLogs,
        pending: statsResponse.summary.pendingLogs,
        approved: statsResponse.summary.approvedLogs,
        rejected: statsResponse.summary.rejectedLogs,
        totalDays: statsResponse.summary.totalDays,
        today: statsResponse.timeBasedStats.today,
        thisWeek: statsResponse.timeBasedStats.thisWeek,
        thisMonth: statsResponse.timeBasedStats.thisMonth
      });
    } catch (error) {
      console.error('Error fetching leave logs statistics:', error);
      // Fallback to empty stats if API fails
      setStatistics({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalDays: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      });
    }
  };

  // Fetch leave logs
  const fetchLeaveLogs = async (page?: number) => {
    try {
      setLoading(true);
      
      const pageNumber = page || currentPage;
      const query: GetLeaveLogsDto = {
        page: pageNumber,
        limit: 10,
        orderBy: 'startDate',
        orderDirection: 'desc',
      };

      // Add filters
      if (statusFilter !== 'all') {
        query.status = statusFilter as 'pending' | 'approved' | 'rejected';
      }
      if (leaveTypeFilter !== 'all') {
        query.leaveType = leaveTypeFilter;
      }

      console.log('Fetching leave logs for page:', pageNumber, 'with query:', query);
      const response = await getLeaveLogsApi(query);
      console.log('API Response for page', pageNumber, ':', response);
      
      // Check if response has logs data
      if (!response || !response.logs || !Array.isArray(response.logs)) {
        console.warn('Invalid response structure:', response);
        setLeaveLogs([]);
        setTotal(0);
        setTotalPages(1);
        return;
      }
      
      // Map API response to component format
      const mappedLogs = response.logs.map(log => {
        // Ensure all required fields exist
        if (!log || typeof log.id === 'undefined') {
          console.warn('Invalid log entry:', log);
          return null;
        }
        
        return {
          id: log.id.toString(), // For DataTable compatibility
          leave_log_id: log.id,
          employee_id: log.employeeId,
          leave_type: log.leaveType,
          start_date: log.startDate,
          end_date: log.endDate,
          days: log.days,
          reason: log.reason,
          status: log.status,
          approved_by: log.approvedBy || 0,
          approved_at: log.approvedAt || '',
          rejected_reason: log.rejectedReason || '',
          created_at: log.createdAt,
          updated_at: log.updatedAt,
          employee_name: `${log.employee.firstName} ${log.employee.lastName}`,
          employee_email: log.employee.email,
          approver_name: log.approver ? `${log.approver.firstName} ${log.approver.lastName}` : undefined
        };
      }).filter(log => log !== null); // Remove any null entries
      
      console.log('Setting logs:', mappedLogs.length, 'total:', response.total, 'totalPages:', response.totalPages, 'currentPage:', response.page);
      setLeaveLogs(mappedLogs);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(response.page || pageNumber);
    } catch (error) {
      console.error('Error fetching leave logs:', error);
      setNotification({
        type: 'error',
        message: 'Failed to fetch leave logs'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else if (filterType === 'leaveType') {
      setLeaveTypeFilter(value);
    }
    setCurrentPage(1);
    fetchLeaveLogs(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    console.log('Page change requested:', { from: currentPage, to: page });
    setCurrentPage(page);
    fetchLeaveLogs(page);
  };

  // Handle reason click
  const handleReasonClick = (reason: string) => {
    setSelectedReason(reason);
  };

  // Close reason modal
  const closeReasonModal = () => {
    setSelectedReason(null);
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    try {
      switch (action) {
        case 'export':
          const query: GetLeaveLogsDto = {
            status: statusFilter !== 'all' ? statusFilter as 'pending' | 'approved' | 'rejected' : undefined,
            leaveType: leaveTypeFilter !== 'all' ? leaveTypeFilter : undefined,
          };
          
          const blob = await exportLeaveLogsApi(query, 'csv');
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `leave-logs-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          setNotification({
            type: 'success',
            message: 'Leave logs exported successfully'
          });
          break;
        default:
          setNotification({
            type: 'success',
            message: `Successfully performed ${action} on ${selectedLogs.length} logs`
          });
          setSelectedLogs([]);
          fetchLeaveLogs();
          break;
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      setNotification({
        type: 'error',
        message: 'Failed to perform bulk action'
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchLeaveLogs();
    fetchStatistics();
  }, []);

  // Reload data when filters change
  useEffect(() => {
    if (statusFilter !== 'all' || leaveTypeFilter !== 'all') {
      fetchLeaveLogs(1);
    }
  }, [statusFilter, leaveTypeFilter]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle escape key to close reason modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedReason) {
        closeReasonModal();
      }
    };

    if (selectedReason) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [selectedReason]);

  // Statistics cards
  const statisticsCards = [
    {
      title: 'Total Logs',
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
      title: 'Total Days',
      value: statistics.totalDays,
      color: 'purple' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'This Month',
      value: statistics.thisMonth,
      color: 'indigo' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  // Bulk actions configuration
  const bulkActions = [
    {
      id: 'export',
      label: 'Export Selected',
      onClick: (_selectedIds: string[]) => handleBulkAction('export')
    }
  ];

  // Table columns
  const columns = [
    {
      header: 'Log ID',
      accessor: 'leave_log_id',
      render: (value: number) => <span className="font-mono text-sm">{value}</span>
    },
    {
      header: 'Employee',
      accessor: 'employee_name',
      render: (value: string, row: LeaveLogTableRow) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.employee_email}</div>
        </div>
      )
    },
    {
      header: 'Leave Type',
      accessor: 'leave_type',
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value.replace(/_/g, ' ').toUpperCase()}
        </span>
      )
    },
    {
      header: 'Start Date',
      accessor: 'start_date',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'End Date',
      accessor: 'end_date',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Days',
      accessor: 'days',
      render: (value: number) => (
        <span className="text-sm font-medium text-gray-900">
          {value} day{value !== 1 ? 's' : ''}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'approved' ? 'bg-green-100 text-green-800' :
          value === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (value: string) => (
        <div className="max-w-xs">
          <span 
            className="text-sm block truncate cursor-pointer text-blue-600 hover:text-blue-800 hover:underline" 
            title="Click to view full reason"
            onClick={() => handleReasonClick(value)}
          >
            {value.substring(0, 30) + '...'}
          </span>
        </div>
      )
    },
    {
      header: 'Approved By',
      accessor: 'approver_name',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value || 'N/A'}
        </span>
      )
    },
    {
      header: 'Created At',
      accessor: 'created_at',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleString()}
        </span>
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
              <h1 className="text-3xl font-bold text-gray-900">Leave Logs</h1>
              <p className="mt-2 text-sm text-gray-600">
                View and manage employee leave requests and approvals
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="mb-8">
          <DataStatistics 
            title="Leave Request Statistics"
            cards={statisticsCards}
            loading={loading}
          />
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type Filter
              </label>
              <select
                value={leaveTypeFilter}
                onChange={(e) => handleFilterChange('leaveType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="sick_leave">Sick Leave</option>
                <option value="vacation_leave">Vacation Leave</option>
                <option value="personal_leave">Personal Leave</option>
                <option value="maternity_leave">Maternity Leave</option>
                <option value="paternity_leave">Paternity Leave</option>
                <option value="emergency_leave">Emergency Leave</option>
              </select>
            </div>
            <div>
              <button
                onClick={() => {
                  fetchLeaveLogs();
                  fetchStatistics();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedLogs.length > 0 && (
          <div className="mb-6">
            <BulkActions
              selectedItems={selectedLogs}
              actions={bulkActions}
              onClearSelection={() => setSelectedLogs([])}
            />
          </div>
        )}

        {/* Leave Logs Table */}
        <div className="bg-white rounded-lg shadow">
          <DataTable
            data={leaveLogs}
            columns={columns}
            loading={loading}
            selectedRows={selectedLogs}
            onBulkSelect={setSelectedLogs}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            sortable={true}
            selectable={true}
            paginated={true}
            serverSidePagination={true}
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

        {/* Reason Modal */}
        {selectedReason && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
            onClick={closeReasonModal}
          >
            <div 
              className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Leave Request Reason</h3>
                  <button
                    onClick={closeReasonModal}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 whitespace-pre-wrap break-words">
                    {selectedReason}
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={closeReasonModal}
                    className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Close
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

export default LeaveLogsManagement;