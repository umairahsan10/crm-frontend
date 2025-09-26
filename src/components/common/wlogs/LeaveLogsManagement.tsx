import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import DataTable from '../DataTable/DataTable';
import DataStatistics from '../Statistics/DataStatistics';
import BulkActions from '../BulkActions/BulkActions';
import { 
  getLeaveLogsApi, 
  getLeaveLogsByEmployeeApi, 
  getLeaveLogsStatsApi, 
  exportLeaveLogsApi, 
  type GetLeaveLogsDto, 
  type LeaveLog,
  type ExportLeaveLogsDto,
  type LeaveLogsStatsDto,
  type LeaveLogsStatsResponseDto,
  ExportFormat,
  StatsPeriod
} from '../../../apis/leave-logs';

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
  status: string;
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
  const [statistics, setStatistics] = useState<LeaveLogsStatsResponseDto>({
    total_leaves: 0,
    pending_leaves: 0,
    approved_leaves: 0,
    rejected_leaves: 0,
    total_leave_days: 0,
    average_leave_duration: 0,
    most_common_leave_type: 'N/A',
    period_stats: []
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeIdFilter, setEmployeeIdFilter] = useState('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.CSV);
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
      const statsQuery: LeaveLogsStatsDto = {
        period: StatsPeriod.MONTHLY,
        include_breakdown: true
      };
      
      const statsResponse = await getLeaveLogsStatsApi(statsQuery);
      setStatistics(statsResponse);
    } catch (error) {
      console.error('Error fetching leave logs statistics:', error);
      // Fallback to empty stats if API fails
      setStatistics({
        total_leaves: 0,
        pending_leaves: 0,
        approved_leaves: 0,
        rejected_leaves: 0,
        total_leave_days: 0,
        average_leave_duration: 0,
        most_common_leave_type: 'N/A',
        period_stats: []
      });
    }
  };

  // Fetch leave logs by employee ID
  const fetchLeaveLogsByEmployee = async (empId: number) => {
    try {
      setLoading(true);
      const response = await getLeaveLogsByEmployeeApi(empId);
      console.log('Leave logs by employee API response:', response);
      
      if (!response || !Array.isArray(response)) {
        console.warn('Invalid response structure:', response);
        setLeaveLogs([]);
        return;
      }
      
      // Map API response to component format
      const mappedLogs = response.map((log: LeaveLog) => {
        if (!log || typeof log.leave_log_id === 'undefined') {
          console.warn('Invalid log entry:', log);
          return null;
        }
        
        // Calculate days between start and end date
        const startDate = new Date(log.start_date);
        const endDate = new Date(log.end_date);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        return {
          id: log.leave_log_id.toString(),
          leave_log_id: log.leave_log_id,
          employee_id: log.emp_id,
          leave_type: log.leave_type,
          start_date: log.start_date,
          end_date: log.end_date,
          days: days,
          reason: log.reason,
          status: log.status,
          approved_by: log.reviewed_by || 0,
          approved_at: log.reviewed_on || '',
          rejected_reason: log.confirmation_reason || '',
          created_at: log.created_at,
          updated_at: log.updated_at,
          employee_name: log.employee_name,
          employee_email: '',
          approver_name: log.reviewer_name || undefined
        };
      }).filter(log => log !== null);
      
      setLeaveLogs(mappedLogs);
      setTotal(mappedLogs.length);
    } catch (error) {
      console.error('Error fetching leave logs by employee:', error);
      setNotification({
        type: 'error',
        message: 'Failed to fetch leave logs for employee'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch leave logs
  const fetchLeaveLogs = async () => {
    try {
      setLoading(true);
      
      const query: GetLeaveLogsDto = {};

      // Add filters
      if (statusFilter !== 'all') {
        query.status = statusFilter;
      }
      if (employeeIdFilter && employeeIdFilter.trim() !== '') {
        const empId = parseInt(employeeIdFilter.trim());
        if (!isNaN(empId)) {
          query.employee_id = empId;
        }
      }

      console.log('Fetching leave logs with query:', query);
      const response = await getLeaveLogsApi(query);
      console.log('API Response:', response);
      
      // Check if response is an array (direct response from backend)
      if (!response || !Array.isArray(response)) {
        console.warn('Invalid response structure:', response);
        setLeaveLogs([]);
        setTotal(0);
        return;
      }
      
      // Map API response to component format
      const mappedLogs = response.map((log: LeaveLog) => {
        // Ensure all required fields exist
        if (!log || typeof log.leave_log_id === 'undefined') {
          console.warn('Invalid log entry:', log);
          return null;
        }
        
        // Calculate days between start and end date
        const startDate = new Date(log.start_date);
        const endDate = new Date(log.end_date);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        return {
          id: log.leave_log_id.toString(), // For DataTable compatibility
          leave_log_id: log.leave_log_id,
          employee_id: log.emp_id,
          leave_type: log.leave_type,
          start_date: log.start_date,
          end_date: log.end_date,
          days: days,
          reason: log.reason,
          status: log.status,
          approved_by: log.reviewed_by || 0,
          approved_at: log.reviewed_on || '',
          rejected_reason: log.confirmation_reason || '',
          created_at: log.created_at,
          updated_at: log.updated_at,
          employee_name: log.employee_name,
          employee_email: '', // Not provided by backend
          approver_name: log.reviewer_name || undefined
        };
      }).filter(log => log !== null); // Remove any null entries
      
      console.log('Setting logs:', mappedLogs.length);
      setLeaveLogs(mappedLogs);
      setTotal(mappedLogs.length);
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
    } else if (filterType === 'employeeId') {
      setEmployeeIdFilter(value);
    }
    fetchLeaveLogs();
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
          const exportQuery: ExportLeaveLogsDto = {
            format: exportFormat,
            employee_id: employeeIdFilter && employeeIdFilter.trim() !== '' ? parseInt(employeeIdFilter.trim()) : undefined,
            include_reviewer_details: true,
            include_confirmation_reason: true
          };
          
          const blob = await exportLeaveLogsApi(exportQuery);
          
          // Create download link from the blob
          const url = window.URL.createObjectURL(blob);
          const filename = `leave-logs-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          setNotification({
            type: 'success',
            message: `Leave logs exported successfully in ${exportFormat.toUpperCase()} format`
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
    if (statusFilter !== 'all' || employeeIdFilter.trim() !== '') {
      fetchLeaveLogs();
    }
  }, [statusFilter, employeeIdFilter]);

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
      title: 'Total Leaves',
      value: statistics.total_leaves,
      color: 'blue' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Pending',
      value: statistics.pending_leaves,
      color: 'yellow' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Approved',
      value: statistics.approved_leaves,
      color: 'green' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Rejected',
      value: statistics.rejected_leaves,
      color: 'red' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Total Days',
      value: statistics.total_leave_days,
      color: 'purple' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Avg Duration',
      value: `${statistics.average_leave_duration.toFixed(1)} days`,
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
          {value ? value.replace(/_/g, ' ').toUpperCase() : 'N/A'}
        </span>
      )
    },
    {
      header: 'Start Date',
      accessor: 'start_date',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      header: 'End Date',
      accessor: 'end_date',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleDateString() : 'N/A'}
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
          {value ? value.toUpperCase() : 'N/A'}
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
            {value ? (value.length > 30 ? value.substring(0, 30) + '...' : value) : 'N/A'}
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
          {value ? new Date(value).toLocaleString() : 'N/A'}
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
                Employee ID Filter
              </label>
              <input
                type="number"
                value={employeeIdFilter}
                onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                placeholder="Enter employee ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={ExportFormat.CSV}>CSV</option>
                <option value={ExportFormat.JSON}>JSON</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  fetchLeaveLogs();
                  fetchStatistics();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Refresh
              </button>
              {employeeIdFilter && employeeIdFilter.trim() !== '' && (
                <button
                  onClick={() => {
                    const empId = parseInt(employeeIdFilter.trim());
                    if (!isNaN(empId)) {
                      fetchLeaveLogsByEmployee(empId);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Get Employee Logs
                </button>
              )}
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
            sortable={true}
            selectable={true}
            paginated={false}
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