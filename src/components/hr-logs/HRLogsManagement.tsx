import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../common/DataTable/DataTable';
import DataStatistics from '../common/Statistics/DataStatistics';
import BulkActions from '../common/BulkActions/BulkActions';
import { getHrLogsApi, getHrLogsStatsApi, exportHrLogsApi, type GetHrLogsDto } from '../../apis/hr-logs';

// Local interface for component
interface HRLog {
  id: string; // For DataTable compatibility
  hr_log_id: number;
  hr_id: number;
  action_type: string;
  affected_employee_id: number;
  description: string;
  created_at: string;
  updated_at: string;
}

const HRLogsManagement: React.FC = () => {
  const { user } = useAuth();
  
  // State management
  const [hrLogs, setHrLogs] = useState<HRLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
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
  const [actionFilter, setActionFilter] = useState('all');
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);

  // Check if user has access to HR logs
  const hasAccess = user && (
    user.role === 'admin' || 
    user.role === 'dep_manager'
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
              You don't have permission to access HR logs. Only <strong>administrators and department managers</strong> can view HR logs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch statistics from API
  const fetchStatistics = async () => {
    try {
      const statsResponse = await getHrLogsStatsApi();
      setStatistics({
        total: statsResponse.totalLogs,
        today: statsResponse.todayLogs,
        thisWeek: statsResponse.thisWeekLogs,
        thisMonth: statsResponse.thisMonthLogs
      });
    } catch (error) {
      console.error('Error fetching HR logs statistics:', error);
      // Fallback to empty stats if API fails
      setStatistics({
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      });
    }
  };

  // Fetch HR logs
  const fetchHRLogs = async (page?: number) => {
    try {
      setLoading(true);
      
      const pageNumber = page || currentPage;
      const query: GetHrLogsDto = {
        page: pageNumber,
        limit: 10,
        orderBy: 'createdAt',
        orderDirection: 'desc',
      };

      // Add filters
      if (actionFilter !== 'all') {
        query.action_type = actionFilter;
      }

      console.log('Fetching HR logs for page:', pageNumber, 'with query:', query);
      const response = await getHrLogsApi(query);
      console.log('API Response for page', pageNumber, ':', response);
      
      // Check if response has logs data
      if (!response || !response.logs || !Array.isArray(response.logs)) {
        console.warn('Invalid response structure:', response);
        setHrLogs([]);
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
          hr_log_id: log.id,
          hr_id: log.hrId || 0,
          action_type: log.actionType || 'unknown',
          affected_employee_id: log.affectedEmployeeId || 0,
          description: log.description || '',
          created_at: log.createdAt || new Date().toISOString(),
          updated_at: log.updatedAt || new Date().toISOString()
        };
      }).filter(log => log !== null); // Remove any null entries
      
      console.log('Setting logs:', mappedLogs.length, 'total:', response.total, 'totalPages:', response.totalPages, 'currentPage:', response.page);
      console.log('Pagination state update:', {
        logsCount: mappedLogs.length,
        total: response.total,
        totalPages: response.totalPages,
        currentPage: response.page,
        requestedPage: pageNumber
      });
      setHrLogs(mappedLogs);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(response.page || pageNumber);
    } catch (error) {
      console.error('Error fetching HR logs:', error);
      setNotification({
        type: 'error',
        message: 'Failed to fetch HR logs'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setActionFilter(filter);
    setCurrentPage(1);
    fetchHRLogs(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    console.log('Page change requested:', { from: currentPage, to: page });
    setCurrentPage(page);
    fetchHRLogs(page);
  };

  // Handle description click
  const handleDescriptionClick = (description: string) => {
    setSelectedDescription(description);
  };

  // Close description modal
  const closeDescriptionModal = () => {
    setSelectedDescription(null);
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    try {
      switch (action) {
        case 'export':
          const query: GetHrLogsDto = {
            action_type: actionFilter !== 'all' ? actionFilter : undefined,
            orderBy: 'createdAt',
            orderDirection: 'desc',
          };
          
          const blob = await exportHrLogsApi(query);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `hr-logs-${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          setNotification({
            type: 'success',
            message: 'HR logs exported successfully'
          });
          break;
        case 'delete':
          setNotification({
            type: 'error',
            message: 'Bulk delete not supported for HR logs'
          });
          break;
        default:
          setNotification({
            type: 'success',
            message: `Successfully performed ${action} on ${selectedLogs.length} logs`
          });
          setSelectedLogs([]);
          fetchHRLogs();
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
    fetchHRLogs();
    fetchStatistics();
  }, []);

  // Reload data when filters change
  useEffect(() => {
    if (actionFilter !== 'all') {
      fetchHRLogs(1);
    }
  }, [actionFilter]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle escape key to close description modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedDescription) {
        closeDescriptionModal();
      }
    };

    if (selectedDescription) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [selectedDescription]);

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
      title: 'Today',
      value: statistics.today,
      color: 'green' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'This Week',
      value: statistics.thisWeek,
      color: 'yellow' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'This Month',
      value: statistics.thisMonth,
      color: 'purple' as const,
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
    },
    {
      id: 'delete',
      label: 'Delete Selected',
      onClick: (_selectedIds: string[]) => handleBulkAction('delete')
    }
  ];

  // Table columns
  const columns = [
    {
      header: 'Log ID',
      accessor: 'hr_log_id',
      render: (value: number) => <span className="font-mono text-sm">{value}</span>
    },
    {
      header: 'Action',
      accessor: 'action_type',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value.includes('created') ? 'bg-green-100 text-green-800' :
          value.includes('updated') ? 'bg-blue-100 text-blue-800' :
          value.includes('terminated') || value.includes('deleted') ? 'bg-red-100 text-red-800' :
          value.includes('processed') ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value.replace(/_/g, ' ').toUpperCase()}
        </span>
      )
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (value: string) => (
        <div className="max-w-xs">
          <span 
            className="text-sm block truncate cursor-pointer text-blue-600 hover:text-blue-800 hover:underline" 
            title="Click to view full description"
            onClick={() => handleDescriptionClick(value)}
          >
            {value}
          </span>
        </div>
      )
    },
    {
      header: 'HR ID',
      accessor: 'hr_id',
      render: (value: number) => <span className="text-sm text-gray-600">HR #{value}</span>
    },
    {
      header: 'Affected Employee',
      accessor: 'affected_employee_id',
      render: (value: number) => {
        if (value === 0 || value === null) {
          return <span className="text-sm text-gray-500 italic">N/A</span>;
        }
        return <span className="text-sm text-gray-600">Emp #{value}</span>;
      }
    },
    {
      header: 'Created At',
      accessor: 'created_at',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Updated At',
      accessor: 'updated_at',
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
              <h1 className="text-3xl font-bold text-gray-900">HR Logs</h1>
              <p className="mt-2 text-sm text-gray-600">
                View and manage HR activity logs and audit trails
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="mb-8">
          <DataStatistics 
            title="HR Activity Statistics"
            cards={statisticsCards}
            loading={loading}
          />
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Filter
              </label>
              <select
                value={actionFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Actions</option>
                <option value="employee_created">Employee Created</option>
                <option value="employee_updated">Employee Updated</option>
                <option value="employee_terminated">Employee Terminated</option>
                <option value="employee_deleted">Employee Deleted</option>
                <option value="hr_created">HR Record Created</option>
                <option value="hr_updated">HR Record Updated</option>
                <option value="hr_deleted">HR Record Deleted</option>
                <option value="bonus_updated">Bonus Updated</option>
                <option value="shift_updated">Shift Updated</option>
                <option value="attendance_log_updated">Attendance Log Updated</option>
                <option value="late_log_processed">Late Log Processed</option>
                <option value="half_day_log_processed">Half Day Log Processed</option>
                <option value="leave_log_processed">Leave Log Processed</option>
              </select>
            </div>
            <div>
              <button
                onClick={() => {
                  fetchHRLogs();
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

        {/* HR Logs Table */}
        <div className="bg-white rounded-lg shadow">
          <DataTable
            data={hrLogs}
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

        {/* Description Modal */}
        {selectedDescription && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
            onClick={closeDescriptionModal}
          >
            <div 
              className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Full Description</h3>
                  <button
                    onClick={closeDescriptionModal}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 whitespace-pre-wrap break-words">
                    {selectedDescription}
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={closeDescriptionModal}
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

export default HRLogsManagement;