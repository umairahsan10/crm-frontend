import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import DataTable from '../DataTable/DataTable';
import DataStatistics from '../Statistics/DataStatistics';
import BulkActions from '../BulkActions/BulkActions';
import { getSalaryLogsApi, getSalaryLogsStatsApi, exportSalaryLogsApi, type GetSalaryLogsDto } from '../../../apis/salary-logs';

// Local interface for component
interface SalaryLogTableRow {
  id: string; // For DataTable compatibility
  salary_log_id: number;
  employee_id: number;
  month: string;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: 'pending' | 'processed' | 'paid';
  processed_by?: number;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  employee_name: string;
  employee_email: string;
  processor_name?: string;
}

const SalaryLogsManagement: React.FC = () => {
  const { user } = useAuth();
  
  // State management
  const [salaryLogs, setSalaryLogs] = useState<SalaryLogTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    processed: 0,
    paid: 0,
    totalSalaryPaid: 0,
    averageSalary: 0,
    thisMonth: 0,
    thisQuarter: 0,
    thisYear: 0
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  // Check if user has access to salary logs
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
              You don't have permission to access salary logs. Only <strong>administrators and department managers</strong> can view salary logs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch statistics from API
  const fetchStatistics = async () => {
    try {
      const statsResponse = await getSalaryLogsStatsApi();
      setStatistics({
        total: statsResponse.summary.totalLogs,
        pending: statsResponse.summary.pendingLogs,
        processed: statsResponse.summary.processedLogs,
        paid: statsResponse.summary.paidLogs,
        totalSalaryPaid: statsResponse.summary.totalSalaryPaid,
        averageSalary: statsResponse.summary.averageSalary,
        thisMonth: statsResponse.timeBasedStats.thisMonth,
        thisQuarter: statsResponse.timeBasedStats.thisQuarter,
        thisYear: statsResponse.timeBasedStats.thisYear
      });
    } catch (error) {
      console.error('Error fetching salary logs statistics:', error);
      // Fallback to empty stats if API fails
      setStatistics({
        total: 0,
        pending: 0,
        processed: 0,
        paid: 0,
        totalSalaryPaid: 0,
        averageSalary: 0,
        thisMonth: 0,
        thisQuarter: 0,
        thisYear: 0
      });
    }
  };

  // Fetch salary logs
  const fetchSalaryLogs = async (page?: number) => {
    try {
      setLoading(true);
      
      const pageNumber = page || currentPage;
      const query: GetSalaryLogsDto = {
        page: pageNumber,
        limit: 10,
        orderBy: 'createdAt',
        orderDirection: 'desc',
      };

      // Add filters
      if (statusFilter !== 'all') {
        query.status = statusFilter as 'pending' | 'processed' | 'paid';
      }
      if (monthFilter !== 'all') {
        query.month = monthFilter;
      }
      if (yearFilter) {
        query.year = parseInt(yearFilter);
      }

      console.log('Fetching salary logs for page:', pageNumber, 'with query:', query);
      const response = await getSalaryLogsApi(query);
      console.log('API Response for page', pageNumber, ':', response);
      
      // Check if response has logs data
      if (!response || !response.logs || !Array.isArray(response.logs)) {
        console.warn('Invalid response structure:', response);
        setSalaryLogs([]);
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
          salary_log_id: log.id,
          employee_id: log.employeeId,
          month: log.month,
          year: log.year,
          basic_salary: log.basicSalary,
          allowances: log.allowances,
          deductions: log.deductions,
          net_salary: log.netSalary,
          status: log.status,
          processed_by: log.processedBy || 0,
          processed_at: log.processedAt || '',
          created_at: log.createdAt,
          updated_at: log.updatedAt,
          employee_name: `${log.employee.firstName} ${log.employee.lastName}`,
          employee_email: log.employee.email,
          processor_name: log.processor ? `${log.processor.firstName} ${log.processor.lastName}` : undefined
        };
      }).filter(log => log !== null); // Remove any null entries
      
      console.log('Setting logs:', mappedLogs.length, 'total:', response.total, 'totalPages:', response.totalPages, 'currentPage:', response.page);
      setSalaryLogs(mappedLogs);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(response.page || pageNumber);
    } catch (error) {
      console.error('Error fetching salary logs:', error);
      setNotification({
        type: 'error',
        message: 'Failed to fetch salary logs'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else if (filterType === 'month') {
      setMonthFilter(value);
    } else if (filterType === 'year') {
      setYearFilter(value);
    }
    setCurrentPage(1);
    fetchSalaryLogs(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    console.log('Page change requested:', { from: currentPage, to: page });
    setCurrentPage(page);
    fetchSalaryLogs(page);
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    try {
      switch (action) {
        case 'export':
          const query: GetSalaryLogsDto = {
            status: statusFilter !== 'all' ? statusFilter as 'pending' | 'processed' | 'paid' : undefined,
            month: monthFilter !== 'all' ? monthFilter : undefined,
            year: yearFilter ? parseInt(yearFilter) : undefined,
          };
          
          const blob = await exportSalaryLogsApi(query, 'csv');
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `salary-logs-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          setNotification({
            type: 'success',
            message: 'Salary logs exported successfully'
          });
          break;
        default:
          setNotification({
            type: 'success',
            message: `Successfully performed ${action} on ${selectedLogs.length} logs`
          });
          setSelectedLogs([]);
          fetchSalaryLogs();
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
    fetchSalaryLogs();
    fetchStatistics();
  }, []);

  // Reload data when filters change
  useEffect(() => {
    if (statusFilter !== 'all' || monthFilter !== 'all' || yearFilter) {
      fetchSalaryLogs(1);
    }
  }, [statusFilter, monthFilter, yearFilter]);

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
      title: 'Processed',
      value: statistics.processed,
      color: 'blue' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Paid',
      value: statistics.paid,
      color: 'green' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Total Paid',
      value: `$${statistics.totalSalaryPaid.toLocaleString()}`,
      color: 'green' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Average Salary',
      value: `$${Math.round(statistics.averageSalary).toLocaleString()}`,
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
      accessor: 'salary_log_id',
      render: (value: number) => <span className="font-mono text-sm">{value}</span>
    },
    {
      header: 'Employee',
      accessor: 'employee_name',
      render: (value: string, row: SalaryLogTableRow) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.employee_email}</div>
        </div>
      )
    },
    {
      header: 'Period',
      accessor: 'month',
      render: (value: string, row: SalaryLogTableRow) => (
        <span className="text-sm text-gray-600">
          {value} {row.year}
        </span>
      )
    },
    {
      header: 'Basic Salary',
      accessor: 'basic_salary',
      render: (value: number) => (
        <span className="text-sm font-medium text-gray-900">
          ${value.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Allowances',
      accessor: 'allowances',
      render: (value: number) => (
        <span className="text-sm text-green-600">
          +${value.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Deductions',
      accessor: 'deductions',
      render: (value: number) => (
        <span className="text-sm text-red-600">
          -${value.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Net Salary',
      accessor: 'net_salary',
      render: (value: number) => (
        <span className="text-sm font-bold text-gray-900">
          ${value.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'paid' ? 'bg-green-100 text-green-800' :
          value === 'processed' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      header: 'Processed By',
      accessor: 'processor_name',
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
              <h1 className="text-3xl font-bold text-gray-900">Salary Logs</h1>
              <p className="mt-2 text-sm text-gray-600">
                View and manage employee salary calculations and payment history
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="mb-8">
          <DataStatistics 
            title="Salary Processing Statistics"
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
                <option value="processed">Processed</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month Filter
              </label>
              <select
                value={monthFilter}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Months</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Filter
              </label>
              <select
                value={yearFilter}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>
            <div>
              <button
                onClick={() => {
                  fetchSalaryLogs();
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

        {/* Salary Logs Table */}
        <div className="bg-white rounded-lg shadow">
          <DataTable
            data={salaryLogs}
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
      </div>
    </div>
  );
};

export default SalaryLogsManagement;