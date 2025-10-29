/**
 * Leave Logs Page - Following EXACT structure as AccessLogsPage
 */

import React, { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import DataTable from '../../../components/common/DataTable/DataTable';
import DataStatistics from '../../../components/common/Statistics/DataStatistics';
import GenericLeaveLogsFilters from '../../../components/common/wlogs/GenericLeaveLogsFilters';
import LeaveLogDetailsDrawer from '../../../components/common/wlogs/LeaveLogDetailsDrawer';
import { useLeaveLogs, useLeaveLogsStatistics } from '../../../hooks/queries/useLogsQueries';
import { exportLeaveLogsApi, ExportFormat } from '../../../apis/leave-logs';

interface LeaveLogsPageProps {
  onBack?: () => void;
}

const LeaveLogsPage: React.FC<LeaveLogsPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  
  const [showStatistics, setShowStatistics] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: '',
    employeeId: '',
    status: '',
    leaveType: '',
    startDate: '',
    endDate: ''
  });

  const hasAccess = user && (user.role === 'admin' || user.role === 'dep_manager' || user.role === 'team_lead' || user.role === 'unit_head' || user.role === 'senior' || user.role === 'junior');

  const logsQuery = useLeaveLogs({
    employee_id: filters.employeeId ? parseInt(filters.employeeId) : undefined,
    status: filters.status || undefined,
    start_date: filters.startDate || undefined,
    end_date: filters.endDate || undefined,
  });

  const statisticsQuery = useLeaveLogsStatistics();

  const leaveLogs = logsQuery.data || [];
  const statistics = statisticsQuery.data || {
    total_leaves: 0,
    pending_leaves: 0,
    approved_leaves: 0,
    rejected_leaves: 0,
    total_leave_days: 0,
    average_leave_duration: 0,
    most_common_leave_type: 'N/A',
    period_stats: []
  };
  const isLoading = logsQuery.isLoading;

  const statisticsCards = [
    { title: 'Total Leaves', value: statistics.total_leaves, color: 'blue' as const, icon: (<svg fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>) },
    { title: 'Pending', value: statistics.pending_leaves, color: 'yellow' as const, icon: (<svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>) },
    { title: 'Approved', value: statistics.approved_leaves, color: 'green' as const, icon: (<svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>) },
    { title: 'Rejected', value: statistics.rejected_leaves, color: 'red' as const, icon: (<svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>) },
    { title: 'Avg Duration', value: `${statistics.average_leave_duration.toFixed(1)} days`, color: 'purple' as const, icon: (<svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>) }
  ];

  const columns = [
    { header: 'Log ID', accessor: 'leave_log_id', sortable: true, render: (value: number) => <span className="font-mono text-sm">#{value}</span> },
    { header: 'Employee', accessor: 'employee_name', sortable: true, render: (value: string, row: any) => (<div className="max-w-xs"><div className="text-sm font-medium text-gray-900">{value}</div><div className="text-sm text-gray-500">ID: {row.emp_id}</div></div>) },
    { header: 'Leave Type', accessor: 'leave_type', sortable: true, render: (value: string) => value ? value.replace('_', ' ').toUpperCase() : 'N/A' },
    { header: 'Start Date', accessor: 'start_date', sortable: true, render: (value: string) => new Date(value).toLocaleDateString() },
    { header: 'End Date', accessor: 'end_date', sortable: true, render: (value: string) => new Date(value).toLocaleDateString() },
    { header: 'Status', accessor: 'status', sortable: true, render: (value: string) => (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value === 'Approved' ? 'bg-green-100 text-green-800' : value === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{value || 'PENDING'}</span>) },
    { header: 'Applied On', accessor: 'applied_on', sortable: true, render: (value: string) => new Date(value).toLocaleDateString() }
  ];

  const tableData = leaveLogs.map((log: any) => ({
    id: log.leave_log_id.toString(),
    leave_log_id: log.leave_log_id,
    emp_id: log.emp_id,
    employee_name: log.employee_name,
    leave_type: log.leave_type,
    start_date: log.start_date,
    end_date: log.end_date,
    reason: log.reason,
    status: log.status,
    applied_on: log.applied_on,
    reviewed_by: log.reviewed_by,
    reviewer_name: log.reviewer_name,
    reviewed_on: log.reviewed_on,
    confirmation_reason: log.confirmation_reason,
    created_at: log.created_at,
    updated_at: log.updated_at
  }));

  const handleLogClick = (log: any) => setSelectedLog(log);
  const handleFiltersChange = useCallback((newFilters: any) => setFilters(prev => ({ ...prev, ...newFilters })), []);
  const handleClearFilters = useCallback(() => setFilters({ search: '', employeeId: '', status: '', leaveType: '', startDate: '', endDate: '' }), []);

  const handleExport = async () => {
    try {
      const blob = await exportLeaveLogsApi({
        format: ExportFormat.CSV,
        employee_id: filters.employeeId ? parseInt(filters.employeeId) : undefined,
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
        include_reviewer_details: true,
        include_confirmation_reason: true
      });

      const url = window.URL.createObjectURL(blob);
      const filename = `leave-logs-${new Date().toISOString().split('T')[0]}.csv`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setNotification({ type: 'success', message: 'Leave logs exported successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to export leave logs' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have permission to access leave logs.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Leave Logs</h1>
              <p className="mt-2 text-sm text-gray-600">Track and manage employee leave requests and approvals</p>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => setShowStatistics(!showStatistics)} className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
              </button>
              <button onClick={handleExport} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>

        {showStatistics && (
          <div className="mb-8">
            <DataStatistics cards={statisticsCards} loading={statisticsQuery.isLoading} />
          </div>
        )}

        <div className="mb-6">
          <GenericLeaveLogsFilters onFiltersChange={handleFiltersChange} onClearFilters={handleClearFilters} />
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <DataTable data={tableData} columns={columns} loading={isLoading} onRowClick={handleLogClick} sortable={true} paginated={false} />
        </div>

        <LeaveLogDetailsDrawer log={selectedLog} isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} />

        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${notification.type === 'success' ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'}`}>
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
                  <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500" onClick={() => setNotification(null)}>
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

export default LeaveLogsPage;
