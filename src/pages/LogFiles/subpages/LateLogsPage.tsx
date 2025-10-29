/**
 * Late Logs Page - Optimized with React Query
 * Follows EXACT same structure as AccessLogsPage
 * 
 * Structure:
 * - Header with actions
 * - Statistics (collapsible)
 * - Generic filters
 * - Data table with pagination
 * - Detail drawer
 * - Export functionality
 */

import React, { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import DataTable from '../../../components/common/DataTable/DataTable';
import DataStatistics from '../../../components/common/Statistics/DataStatistics';
import GenericLateLogsFilters from '../../../components/common/wlogs/GenericLateLogsFilters';
import LateLogDetailsDrawer from '../../../components/common/wlogs/LateLogDetailsDrawer';
import { useLateLogs, useLateLogsStatistics } from '../../../hooks/queries/useLogsQueries';
import { exportLateLogsApi, ExportFormat } from '../../../apis/late-logs';

interface LateLogsPageProps {
  onBack?: () => void;
}

const LateLogsPage: React.FC<LateLogsPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  
  // State management
  const [showStatistics, setShowStatistics] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    employeeId: '',
    justified: '',
    lateType: '',
    startDate: '',
    endDate: ''
  });

  // Check access permissions
  const hasAccess = user && (
    user.role === 'admin' || 
    user.role === 'dep_manager' ||
    user.role === 'team_lead' ||
    user.role === 'unit_head' ||
    user.role === 'senior' ||
    user.role === 'junior'
  );

  // React Query hooks - Data fetching with automatic caching
  const logsQuery = useLateLogs({
    employee_id: filters.employeeId ? parseInt(filters.employeeId) : undefined,
    start_date: filters.startDate || undefined,
    end_date: filters.endDate || undefined,
  });

  const statisticsQuery = useLateLogsStatistics();

  // Extract data from queries
  const lateLogs = logsQuery.data || [];
  const statistics = statisticsQuery.data || {
    total_late_logs: 0,
    pending_late_logs: 0,
    completed_late_logs: 0,
    total_minutes_late: 0,
    average_minutes_late: 0,
    most_common_reason: 'N/A',
    paid_late_count: 0,
    unpaid_late_count: 0,
    period_stats: []
  };
  const isLoading = logsQuery.isLoading;

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
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Paid Late Count',
      value: statistics.paid_late_count,
      color: 'indigo' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  // Table columns configuration
  const columns = [
    {
      header: 'Log ID',
      accessor: 'late_log_id',
      sortable: true,
      render: (value: number) => <span className="font-mono text-sm">#{value}</span>
    },
    {
      header: 'Employee',
      accessor: 'employee_name',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">ID: {row.emp_id}</div>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      header: 'Scheduled Time',
      accessor: 'scheduled_time_in',
      sortable: false,
      render: (value: string) => value || 'N/A'
    },
    {
      header: 'Actual Time',
      accessor: 'actual_time_in',
      sortable: false,
      render: (value: string) => value || 'N/A'
    },
    {
      header: 'Late Minutes',
      accessor: 'minutes_late',
      sortable: true,
      render: (value: number) => (
        <span className="text-sm font-medium text-red-600">
          {value} min
        </span>
      )
    },
    {
      header: 'Justified',
      accessor: 'justified',
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'YES' : 'NO'}
        </span>
      )
    },
    {
      header: 'Late Type',
      accessor: 'late_type',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value ? value.replace('_', ' ').toUpperCase() : 'N/A'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'action_taken',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'Completed' ? 'bg-green-100 text-green-800' :
          value === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value || 'PENDING'}
        </span>
      )
    }
  ];

  // Map API data to table format
  const tableData = lateLogs.map((log: any) => ({
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
  }));

  // Handlers
  const handleLogClick = (log: any) => {
    setSelectedLog(log);
  };

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      employeeId: '',
      justified: '',
      lateType: '',
      startDate: '',
      endDate: ''
    });
  }, []);

  const handleExport = async () => {
    try {
      const blob = await exportLateLogsApi({
        format: ExportFormat.CSV,
        employee_id: filters.employeeId ? parseInt(filters.employeeId) : undefined,
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
        include_late_type: true,
        include_reviewer_details: true
      });

      const url = window.URL.createObjectURL(blob);
      const filename = `late-logs-${new Date().toISOString().split('T')[0]}.csv`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setNotification({
        type: 'success',
        message: 'Late logs exported successfully!'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to export late logs'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

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
              You don't have permission to access late logs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Back Button */}
              {onBack && (
                <button
                  onClick={onBack}
                  className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                  <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Logs Overview
                </button>
              )}
              <h1 className="text-3xl font-bold text-gray-900">Late Logs</h1>
              <p className="mt-2 text-sm text-gray-600">
                Track and monitor employee late arrivals and justifications
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
              </button>
              
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        {showStatistics && (
          <div className="mb-8">
            <DataStatistics
              cards={statisticsCards}
              loading={statisticsQuery.isLoading}
            />
          </div>
        )}

        {/* Filters Section */}
        <div className="mb-6">
          <GenericLateLogsFilters
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Table Section */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <DataTable
            data={tableData}
            columns={columns}
            loading={isLoading}
            onRowClick={handleLogClick}
            sortable={true}
            paginated={false}
          />
        </div>

        {/* Late Log Details Drawer */}
        <LateLogDetailsDrawer
          log={selectedLog}
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
        />

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
            notification.type === 'success' ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'
          }`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    onClick={() => setNotification(null)}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
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

export default LateLogsPage;
