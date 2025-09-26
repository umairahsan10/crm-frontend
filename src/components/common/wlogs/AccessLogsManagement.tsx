import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import DataTable from '../DataTable/DataTable';
import DataStatistics from '../Statistics/DataStatistics';
import BulkActions from '../BulkActions/BulkActions';
import { getAccessLogsApi, getAccessLogsStatsApi, exportAccessLogsApi, type GetAccessLogsDto } from '../../../apis/access-logs';

// Local interface for component
interface AccessLogTableRow {
  id: string; // For DataTable compatibility
  access_log_id: number;
  employee_id: number;
  success: boolean;
  login_time: string;
  logout_time?: string;
  ip_address?: string;
  user_agent?: string;
  employee_name: string;
  employee_email: string;
}

const AccessLogsManagement: React.FC = () => {
  const { user } = useAuth();
  
  // State management
  const [accessLogs, setAccessLogs] = useState<AccessLogTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    success: 0,
    failed: 0
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotal] = useState(0);
  const [selectedUserAgent, setSelectedUserAgent] = useState<string | null>(null);

  // Check if user has access to access logs
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
              You don't have permission to access access logs. Please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch statistics from API
  const fetchStatistics = async () => {
    try {
      const statsResponse = await getAccessLogsStatsApi();
      setStatistics({
        total: statsResponse.summary.totalLogs,
        today: statsResponse.timeBasedStats.today,
        thisWeek: statsResponse.timeBasedStats.thisWeek,
        thisMonth: statsResponse.timeBasedStats.thisMonth,
        success: statsResponse.summary.successfulLogins,
        failed: statsResponse.summary.failedLogins
      });
    } catch (error) {
      console.error('Error fetching access logs statistics:', error);
      // Fallback to empty stats if API fails
      setStatistics({
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        success: 0,
        failed: 0
      });
    }
  };

  // Fetch access logs
  const fetchAccessLogs = async (page?: number) => {
    try {
      setLoading(true);
      
      const pageNumber = page || currentPage;
      const query: GetAccessLogsDto = {
        page: pageNumber,
        limit: 10,
        orderBy: 'loginTime',
        orderDirection: 'desc',
      };

      console.log('Fetching access logs for page:', pageNumber, 'with query:', query);
      const response = await getAccessLogsApi(query);
      console.log('API Response for page', pageNumber, ':', response);
      
      // Check if response has logs data
      if (!response || !response.logs || !Array.isArray(response.logs)) {
        console.warn('Invalid response structure:', response);
        setAccessLogs([]);
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
          access_log_id: log.id,
          employee_id: log.employeeId,
          success: log.success,
          login_time: log.loginTime,
          logout_time: log.logoutTime || '',
          ip_address: log.ipAddress || '',
          user_agent: log.userAgent || '',
          employee_name: `${log.employee.firstName} ${log.employee.lastName}`,
          employee_email: log.employee.email
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
      setAccessLogs(mappedLogs);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(response.page || pageNumber);
    } catch (error) {
      console.error('Error fetching access logs:', error);
      setNotification({
        type: 'error',
        message: 'Failed to fetch access logs'
      });
    } finally {
      setLoading(false);
    }
  };


  // Handle page change
  const handlePageChange = (page: number) => {
    console.log('Page change requested:', { from: currentPage, to: page, totalPages });
    setCurrentPage(page);
    fetchAccessLogs(page);
  };

  // Handle user agent click
  const handleUserAgentClick = (userAgent: string) => {
    setSelectedUserAgent(userAgent);
  };

  // Close user agent modal
  const closeUserAgentModal = () => {
    setSelectedUserAgent(null);
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    try {
      switch (action) {
        case 'export':
          const query: GetAccessLogsDto = {
            orderBy: 'loginTime',
            orderDirection: 'desc',
          };
          
          const blob = await exportAccessLogsApi(query, 'csv');
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `access-logs-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          setNotification({
            type: 'success',
            message: 'Access logs exported successfully'
          });
          break;
        default:
          setNotification({
            type: 'success',
            message: `Successfully performed ${action} on ${selectedLogs.length} logs`
          });
          setSelectedLogs([]);
          fetchAccessLogs();
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
    fetchAccessLogs();
    fetchStatistics();
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

  // Handle escape key to close user agent modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedUserAgent) {
        closeUserAgentModal();
      }
    };

    if (selectedUserAgent) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [selectedUserAgent]);

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
    },
    {
      title: 'Successful',
      value: statistics.success,
      color: 'green' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Failed',
      value: statistics.failed,
      color: 'red' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
      accessor: 'access_log_id',
      render: (value: number) => <span className="font-mono text-sm">{value}</span>
    },
    {
      header: 'Employee',
      accessor: 'employee_name',
      render: (value: string, row: AccessLogTableRow) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.employee_email}</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'success',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'SUCCESS' : 'FAILED'}
        </span>
      )
    },
    {
      header: 'Login Time',
      accessor: 'login_time',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Logout Time',
      accessor: 'logout_time',
      render: (value: string) => {
        if (!value) {
          return <span className="text-sm text-gray-500 italic">Still logged in</span>;
        }
        return (
          <span className="text-sm text-gray-600">
            {new Date(value).toLocaleString()}
          </span>
        );
      }
    },
    {
      header: 'IP Address',
      accessor: 'ip_address',
      render: (value: string) => (
        <span className="font-mono text-sm text-gray-600">
          {value || 'N/A'}
        </span>
      )
    },
    {
      header: 'User Agent',
      accessor: 'user_agent',
      render: (value: string) => (
        <div className="max-w-xs">
          <span 
            className="text-sm block truncate cursor-pointer text-blue-600 hover:text-blue-800 hover:underline" 
            title="Click to view full user agent"
            onClick={() => handleUserAgentClick(value)}
          >
            {value ? value.substring(0, 50) + '...' : 'N/A'}
          </span>
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
              <h1 className="text-3xl font-bold text-gray-900">Access Logs</h1>
              <p className="mt-2 text-sm text-gray-600">
                View and manage user login/logout activities and access history
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="mb-8">
          <DataStatistics 
            title="Access Activity Statistics"
            cards={statisticsCards}
            loading={loading}
          />
        </div>

        {/* Refresh Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => {
              fetchAccessLogs();
              fetchStatistics();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Refresh
          </button>
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

        {/* Access Logs Table */}
        <div className="bg-white rounded-lg shadow">
          <DataTable
            data={accessLogs}
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

        {/* User Agent Modal */}
        {selectedUserAgent && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
            onClick={closeUserAgentModal}
          >
            <div 
              className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">User Agent Details</h3>
                  <button
                    onClick={closeUserAgentModal}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 whitespace-pre-wrap break-words">
                    {selectedUserAgent}
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={closeUserAgentModal}
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

export default AccessLogsManagement;