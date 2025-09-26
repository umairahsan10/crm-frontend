import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import DataTable from '../DataTable/DataTable';
import DataStatistics from '../Statistics/DataStatistics';
import BulkActions from '../BulkActions/BulkActions';
import { 
  getLateLogsApi, 
  getLateLogsByEmployeeApi, 
  getLateLogsStatsApi, 
  exportLateLogsApi, 
  type GetLateLogsDto, 
  type LateLog,
  type ExportLateLogsDto,
  type LateLogsStatsDto,
  type LateLogsStatsResponseDto,
  ExportFormat,
  StatsPeriod
} from '../../../apis/late-logs';

// Local interface for component
interface LateLogTableRow {
  id: string; // For DataTable compatibility
  late_log_id: number;
  emp_id: number;
  employee_name: string;
  date: string;
  scheduled_time_in: string;
  actual_time_in: string;
  minutes_late: number;
  reason: string;
  justified: boolean;
  late_type: string;
  action_taken: string;
  reviewed_by?: number;
  reviewer_name?: string;
  created_at: string;
  updated_at: string;
}

const LateLogsManagement: React.FC = () => {
  const { user } = useAuth();
  
  // State management
  const [lateLogs, setLateLogs] = useState<LateLogTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<LateLogsStatsResponseDto>({
    total_late_logs: 0,
    pending_late_logs: 0,
    completed_late_logs: 0,
    total_minutes_late: 0,
    average_minutes_late: 0,
    most_common_reason: 'N/A',
    paid_late_count: 0,
    unpaid_late_count: 0,
    period_stats: []
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [, setTotal] = useState(0);
  const [employeeIdFilter, setEmployeeIdFilter] = useState('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.CSV);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  // Check if user has access to late logs
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
              You don't have permission to access late logs. Please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch statistics from API
  const fetchStatistics = async () => {
    try {
      const statsQuery: LateLogsStatsDto = {
        period: StatsPeriod.MONTHLY,
        include_breakdown: true
      };
      
      const statsResponse = await getLateLogsStatsApi(statsQuery);
      setStatistics(statsResponse);
    } catch (error) {
      console.error('Error fetching late logs statistics:', error);
      // Fallback to empty stats if API fails
      setStatistics({
        total_late_logs: 0,
        pending_late_logs: 0,
        completed_late_logs: 0,
        total_minutes_late: 0,
        average_minutes_late: 0,
        most_common_reason: 'N/A',
        paid_late_count: 0,
        unpaid_late_count: 0,
        period_stats: []
      });
    }
  };

  // Fetch late logs
  const fetchLateLogs = async () => {
    try {
      setLoading(true);
      
      const query: GetLateLogsDto = {};

      // Add filters
      if (employeeIdFilter && employeeIdFilter.trim() !== '') {
        const empId = parseInt(employeeIdFilter.trim());
        if (!isNaN(empId)) {
          query.employee_id = empId;
        }
      }

      console.log('Fetching late logs with query:', query);
      const response = await getLateLogsApi(query);
      console.log('API Response:', response);
      
      // Check if response is an array (direct response from backend)
      if (!response || !Array.isArray(response)) {
        console.warn('Invalid response structure:', response);
        setLateLogs([]);
        setTotal(0);
        return;
      }
      
      // Map API response to component format
      const mappedLogs = response.map((log: LateLog) => {
        // Ensure all required fields exist
        if (!log || typeof log.late_log_id === 'undefined') {
          console.warn('Invalid log entry:', log);
          return null;
        }
        
        return {
          id: log.late_log_id.toString(), // For DataTable compatibility
          late_log_id: log.late_log_id,
          emp_id: log.emp_id,
          employee_name: log.employee_name,
          date: log.date,
          scheduled_time_in: log.scheduled_time_in,
          actual_time_in: log.actual_time_in,
          minutes_late: log.minutes_late,
          reason: log.reason,
          justified: log.justified,
          late_type: log.late_type,
          action_taken: log.action_taken,
          reviewed_by: log.reviewed_by,
          reviewer_name: log.reviewer_name,
          created_at: log.created_at,
          updated_at: log.updated_at
        };
      }).filter(log => log !== null); // Remove any null entries
      
      console.log('Setting logs:', mappedLogs.length);
      setLateLogs(mappedLogs);
      setTotal(mappedLogs.length);
    } catch (error) {
      console.error('Error fetching late logs:', error);
      setNotification({
        type: 'error',
        message: 'Failed to fetch late logs'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch late logs by employee
  const fetchLateLogsByEmployee = async (empId: number) => {
    try {
      setLoading(true);
      
      console.log('Fetching late logs for employee:', empId);
      const response = await getLateLogsByEmployeeApi(empId);
      console.log('Employee late logs API response:', response);
      
      // Check if response is an array
      if (!response || !Array.isArray(response)) {
        console.warn('Invalid response structure:', response);
        setLateLogs([]);
        setTotal(0);
        return;
      }
      
      // Map API response to component format
      const mappedLogs = response.map((log: LateLog) => {
        if (!log || typeof log.late_log_id === 'undefined') {
          console.warn('Invalid log entry:', log);
          return null;
        }
        
        return {
          id: log.late_log_id.toString(),
          late_log_id: log.late_log_id,
          emp_id: log.emp_id,
          employee_name: log.employee_name,
          date: log.date,
          scheduled_time_in: log.scheduled_time_in,
          actual_time_in: log.actual_time_in,
          minutes_late: log.minutes_late,
          reason: log.reason,
          justified: log.justified,
          late_type: log.late_type,
          action_taken: log.action_taken,
          reviewed_by: log.reviewed_by,
          reviewer_name: log.reviewer_name,
          created_at: log.created_at,
          updated_at: log.updated_at
        };
      }).filter(log => log !== null);
      
      console.log('Setting employee logs:', mappedLogs.length);
      setLateLogs(mappedLogs);
      setTotal(mappedLogs.length);
      
      setNotification({
        type: 'success',
        message: `Found ${mappedLogs.length} late logs for employee ${empId}`
      });
    } catch (error) {
      console.error('Error fetching late logs by employee:', error);
      setNotification({
        type: 'error',
        message: 'Failed to fetch late logs for employee'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'employeeId') {
      setEmployeeIdFilter(value);
    }
    fetchLateLogs();
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
          const exportQuery: ExportLateLogsDto = {
            format: exportFormat,
            employee_id: employeeIdFilter && employeeIdFilter.trim() !== '' ? parseInt(employeeIdFilter.trim()) : undefined,
            include_late_type: true,
            include_reviewer_details: true
          };
          
          const blob = await exportLateLogsApi(exportQuery);
          
          // Create download link from the blob
          const url = window.URL.createObjectURL(blob);
          const filename = `late-logs-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          setNotification({
            type: 'success',
            message: `Late logs exported successfully in ${exportFormat.toUpperCase()} format`
          });
          break;
        default:
          setNotification({
            type: 'success',
            message: `Successfully performed ${action} on ${selectedLogs.length} logs`
          });
          setSelectedLogs([]);
          fetchLateLogs();
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
    fetchLateLogs();
    fetchStatistics();
  }, []);

  // Reload data when filters change
  useEffect(() => {
    if (employeeIdFilter.trim() !== '') {
      fetchLateLogs();
    }
  }, [employeeIdFilter]);

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
      title: 'Total Late Logs',
      value: statistics.total_late_logs,
      color: 'blue' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Pending',
      value: statistics.pending_late_logs,
      color: 'yellow' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Completed',
      value: statistics.completed_late_logs,
      color: 'green' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Avg Minutes Late',
      value: `${statistics.average_minutes_late.toFixed(1)} min`,
      color: 'purple' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Paid Late Count',
      value: statistics.paid_late_count,
      color: 'purple' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
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
      accessor: 'late_log_id',
      render: (value: number) => <span className="font-mono text-sm">{value}</span>
    },
    {
      header: 'Employee',
      accessor: 'employee_name',
      render: (value: string, row: LateLogTableRow) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">ID: {row.emp_id}</div>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Scheduled Time',
      accessor: 'scheduled_time_in',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value ? value : 'N/A'}
        </span>
      )
    },
    {
      header: 'Actual Time',
      accessor: 'actual_time_in',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value ? value : 'N/A'}
        </span>
      )
    },
    {
      header: 'Late Minutes',
      accessor: 'minutes_late',
      render: (value: number) => (
        <span className="text-sm font-medium text-red-600">
          {value ? `${value} min` : 'N/A'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'action_taken',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'Completed' ? 'bg-green-100 text-green-800' :
          value === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value ? value.toUpperCase() : 'N/A'}
        </span>
      )
    },
    {
      header: 'Justified',
      accessor: 'justified',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === true ? 'bg-green-100 text-green-800' :
          value === false ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value === true ? 'YES' : value === false ? 'NO' : 'N/A'}
        </span>
      )
    },
    {
      header: 'Late Type',
      accessor: 'late_type',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value ? value.replace(/_/g, ' ').toUpperCase() : 'N/A'}
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
            onClick={() => handleReasonClick(value || 'No reason provided')}
          >
            {value ? value.substring(0, 30) + '...' : 'N/A'}
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
              <h1 className="text-3xl font-bold text-gray-900">Late Logs</h1>
              <p className="mt-2 text-sm text-gray-600">
                View and manage employee late arrival logs and approvals
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="mb-8">
          <DataStatistics 
            title="Late Arrival Statistics"
            cards={statisticsCards}
            loading={loading}
          />
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID Filter
              </label>
              <input
                type="text"
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
            <div>
              <button
                onClick={() => {
                  fetchLateLogs();
                  fetchStatistics();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Refresh
              </button>
            </div>
            <div>
              <button
                onClick={() => {
                  if (employeeIdFilter && employeeIdFilter.trim() !== '') {
                    const empId = parseInt(employeeIdFilter.trim());
                    if (!isNaN(empId)) {
                      fetchLateLogsByEmployee(empId);
                    }
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Get Employee Logs
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

        {/* Late Logs Table */}
        <div className="bg-white rounded-lg shadow">
          <DataTable
            data={lateLogs}
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
                  <h3 className="text-lg font-medium text-gray-900">Late Arrival Reason</h3>
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

export default LateLogsManagement;