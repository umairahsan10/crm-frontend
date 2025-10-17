/**
 * Attendance Management - Optimized with React Query
 * Follows EXACT same structure as LeadsManagementPage
 * 
 * Structure:
 * - Header with date selector and actions
 * - Statistics (collapsible)
 * - Generic filters
 * - Data table with bulk actions
 * - Employee attendance drawer
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import DynamicTable, { type ColumnConfig } from '../../../components/common/DynamicTable/DynamicTable';
import DataStatistics from '../../../components/common/Statistics/DataStatistics';
import GenericAttendanceFilters from '../../../components/attendance/GenericAttendanceFilters';
import EmployeeAttendanceDrawer from '../../../components/attendance/EmployeeAttendanceDrawer';
import { useEmployees, useAttendanceLogs, useAttendanceMutation } from '../../../hooks/queries/useHRQueries';
import { 
  checkinApi, 
  bulkMarkPresentApi,
  updateAttendanceLogStatusApi,
  type CheckinDto, 
  type BulkMarkPresentDto,
  type UpdateAttendanceLogStatusDto
} from '../../../apis/attendance';
import './AttendanceManagement.css';

interface AttendanceRecord {
  id: string;
  employeeId: number;
  employeeName: string;
  department: string;
  status: 'present' | 'late' | 'half_day' | 'absent' | 'not_marked' | null;
  checkin: string | null;
  checkout: string | null;
  totalHours: number | null;
  logId?: number;
  lateDetails?: {
    minutes_late: number;
    requires_reason: boolean;
  } | null;
}

const AttendanceManagement: React.FC = () => {
  const { user } = useAuth();
  
  // Get today's date in local timezone
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State management
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showBulkMarkModal, setShowBulkMarkModal] = useState(false);
  const [bulkMarkReason, setBulkMarkReason] = useState('');
  const [showStatistics, setShowStatistics] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  
  // Modals state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedEmployeeForStatus, setSelectedEmployeeForStatus] = useState<{id: number, name: string, currentStatus: string, logId?: number} | null>(null);
  const [newStatus, setNewStatus] = useState<'present' | 'late' | 'half_day' | 'absent'>('present');
  const [statusChangeReason, setStatusChangeReason] = useState('');
  
  // Employee drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEmployeeForDrawer, setSelectedEmployeeForDrawer] = useState<{id: number, name: string} | null>(null);

  // React Query hooks - Auto caching and refetching
  const employeesQuery = useEmployees(1, 1000, {}); // Get all employees
  const attendanceQuery = useAttendanceLogs({
        start_date: selectedDate,
        end_date: selectedDate
      });
  const { invalidateAttendance } = useAttendanceMutation();

  // Extract data from queries
  const employees = (employeesQuery.data as any)?.employees || [];
  const attendanceLogs = attendanceQuery.data || [];
  const isLoading = employeesQuery.isLoading || attendanceQuery.isLoading;

  // Merge employee data with attendance logs
  const attendanceRecords: AttendanceRecord[] = useMemo(() => {
      const attendanceMap = new Map();
    if (Array.isArray(attendanceLogs)) {
      attendanceLogs.forEach((log: any) => {
          attendanceMap.set(log.employee_id, {
            status: log.status,
            checkin: log.checkin,
            checkout: log.checkout,
          totalHours: null,
          logId: log.id,
            lateDetails: log.late_details || null
          });
        });
      }

    return employees.map((employee: any) => {
        const attendance = attendanceMap.get(employee.id);
        return {
          id: employee.id.toString(),
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
        department: employee.department?.name || 'N/A',
          status: attendance?.status || 'not_marked',
          checkin: attendance?.checkin || null,
          checkout: attendance?.checkout || null,
          totalHours: attendance?.totalHours || null,
          logId: attendance?.logId || undefined,
          lateDetails: attendance?.lateDetails || null
        };
      });
  }, [employees, attendanceLogs]);

  // Apply filters
  const filteredRecords = useMemo(() => {
    let filtered = [...attendanceRecords];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(record => 
        record.employeeName.toLowerCase().includes(searchLower) ||
        record.department.toLowerCase().includes(searchLower)
      );
    }

    if (filters.department) {
      filtered = filtered.filter(record => record.department.toLowerCase().includes(filters.department.toLowerCase()));
    }

    if (filters.status) {
      filtered = filtered.filter(record => record.status === filters.status);
    }

    return filtered;
  }, [attendanceRecords, filters]);

  // Calculate statistics
  const statistics = useMemo(() => ({
    total: filteredRecords.length,
    present: filteredRecords.filter(r => r.status === 'present').length,
    late: filteredRecords.filter(r => r.status === 'late').length,
    halfDay: filteredRecords.filter(r => r.status === 'half_day').length,
    absent: filteredRecords.filter(r => r.status === 'absent').length,
    notMarked: filteredRecords.filter(r => r.status === 'not_marked').length
  }), [filteredRecords]);

  // Handlers
  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      department: '',
      status: '',
      startDate: '',
      endDate: ''
    });
  }, []);

  const handleMarkAttendance = async (employeeId: number) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
      
      const pakistaniTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
      
      const checkinData: CheckinDto = {
        employee_id: employeeId,
        date: selectedDate,
        checkin: pakistaniTime,
        mode: 'onsite'
      };

      const response = await checkinApi(checkinData);
      
      // Invalidate and refetch attendance data
      invalidateAttendance({ start_date: selectedDate, end_date: selectedDate });

      setNotification({
        type: 'success',
        message: `Employee attendance marked as ${response.status}`
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to mark attendance'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleBulkMarkAttendance = async () => {
    try {
      const employeeIds = selectedEmployees.map(id => parseInt(id));
      
      const bulkMarkData: BulkMarkPresentDto = {
        date: selectedDate,
        employee_ids: employeeIds,
        reason: bulkMarkReason || 'Bulk marked attendance by HR'
      };

      const response = await bulkMarkPresentApi(bulkMarkData);
      
      // Invalidate and refetch
      invalidateAttendance({ start_date: selectedDate, end_date: selectedDate });

      setNotification({
        type: 'success',
        message: `Successfully marked ${response.marked_present} employees present`
      });
      setTimeout(() => setNotification(null), 3000);

      setSelectedEmployees([]);
      setShowBulkMarkModal(false);
      setBulkMarkReason('');
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to bulk mark attendance'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedEmployeeForStatus || !selectedEmployeeForStatus.logId) {
      setNotification({
        type: 'error',
        message: 'Cannot change status: Attendance log not found'
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }
    
    try {
      const statusData: UpdateAttendanceLogStatusDto = {
        status: newStatus,
        reason: statusChangeReason || undefined,
        reviewer_id: user?.id ? parseInt(user.id) : undefined
      };

      await updateAttendanceLogStatusApi(selectedEmployeeForStatus.logId, statusData);
      
      // Invalidate and refetch
      invalidateAttendance({ start_date: selectedDate, end_date: selectedDate });
      
      setNotification({
        type: 'success',
        message: `Status changed from ${selectedEmployeeForStatus.currentStatus} to ${newStatus} for ${selectedEmployeeForStatus.name}`
      });
      setTimeout(() => setNotification(null), 3000);

      setShowStatusModal(false);
      setSelectedEmployeeForStatus(null);
      setNewStatus('present');
      setStatusChangeReason('');
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to change status'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const openStatusModal = (employeeId: number, employeeName: string, currentStatus: string, logId?: number) => {
    setSelectedEmployeeForStatus({ id: employeeId, name: employeeName, currentStatus, logId });
    setNewStatus(currentStatus as any);
    setShowStatusModal(true);
  };

  const handleBulkSelect = (employeeIds: string[]) => {
    setSelectedEmployees(employeeIds);
  };

  // Statistics cards
  const statisticsCards = [
    {
      title: 'Total Employees',
      value: statistics.total,
      color: 'blue' as const,
      icon: (<svg fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>)
    },
    {
      title: 'Present',
      value: statistics.present,
      color: 'green' as const,
      icon: (<svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>)
    },
    {
      title: 'Late',
      value: statistics.late,
      color: 'yellow' as const,
      icon: (<svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>)
    },
    {
      title: 'Half Day',
      value: statistics.halfDay,
      color: 'purple' as const,
      icon: (<svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>)
    },
    {
      title: 'Absent',
      value: statistics.absent,
      color: 'red' as const,
      icon: (<svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>)
    },
    {
      title: 'Not Marked',
      value: statistics.notMarked,
      color: 'indigo' as const,
      icon: (<svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>)
    }
  ];

  // Dynamic table columns
  const columns: ColumnConfig[] = [
    {
      key: 'employeeName',
      label: 'Employee',
      type: 'custom',
      sortable: true,
      render: (_value, row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">
                {row.employeeName.split(' ').map((n: string) => n[0]).join('')}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{row.employeeName}</div>
            <div className="text-sm text-gray-500">{row.department}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      type: 'custom',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'present' ? 'bg-green-100 text-green-800' : 
          value === 'late' ? 'bg-yellow-100 text-yellow-800' :
          value === 'half_day' ? 'bg-orange-100 text-orange-800' :
          value === 'absent' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value === 'present' ? 'Present' : value === 'late' ? 'Late' : value === 'half_day' ? 'Half Day' : value === 'absent' ? 'Absent' : 'Not Marked'}
        </span>
      )
    },
    {
      key: 'checkin',
      label: 'Check In',
      type: 'custom',
      render: (value) => (<span className="text-sm text-gray-900">{value ? new Date(value).toLocaleTimeString() : 'N/A'}</span>)
    },
    {
      key: 'checkout',
      label: 'Check Out',
      type: 'custom',
      render: (value) => (<span className="text-sm text-gray-900">{value ? new Date(value).toLocaleTimeString() : 'N/A'}</span>)
    },
    {
      key: 'employeeId',
      label: 'Actions',
      type: 'custom',
      render: (_value, row) => (
        <div className="flex items-center space-x-2">
          {row.status === 'not_marked' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleMarkAttendance(row.employeeId); }}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Mark
            </button>
          )}
          {row.status !== 'not_marked' && (
              <button
              onClick={(e) => { e.stopPropagation(); openStatusModal(row.employeeId, row.employeeName, row.status || 'not_marked', row.logId); }}
              className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                title="Change Status"
              >
                ✏️
                </button>
          )}
        </div>
      )
    }
  ];

  // Access control
  const hasAccess = user && (user.role === 'admin' || user.role === 'dep_manager' || user.role === 'team_lead' || user.role === 'unit_head' || user.role === 'senior' || user.role === 'junior');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have permission to access attendance management.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
              <p className="mt-2 text-sm text-gray-600">Mark and track employee attendance for the selected date</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <label htmlFor="date" className="text-sm font-medium text-gray-700">Date:</label>
                <input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
                  <button
                    onClick={() => setShowStatistics(!showStatistics)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {showStatistics ? 'Hide Stats' : 'Show Stats'}
                  </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {showStatistics && (
          <div className="mb-8">
            <DataStatistics 
              title={`Attendance Statistics for ${new Date(selectedDate).toLocaleDateString()}`}
              cards={statisticsCards} 
              loading={isLoading}
            />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <GenericAttendanceFilters
            onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
        </div>

        {/* Bulk Selection Bar */}
        {selectedEmployees.length > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedEmployees.length} {selectedEmployees.length === 1 ? 'employee' : 'employees'} selected
                </span>
                <button onClick={() => setSelectedEmployees([])} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Clear selection
                </button>
              </div>
              <button
                onClick={() => setShowBulkMarkModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Mark Selected Attendance
              </button>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <DynamicTable
          columns={columns}
          data={filteredRecords}
          isLoading={isLoading}
          currentPage={1}
          totalPages={1}
          totalItems={filteredRecords.length}
          itemsPerPage={20}
          selectedItems={selectedEmployees}
          onPageChange={() => {}}
          onRowClick={(row) => {
            setSelectedEmployeeForDrawer({
              id: row.employeeId,
              name: row.employeeName
            });
            setIsDrawerOpen(true);
          }}
          onBulkSelect={handleBulkSelect}
          selectable={true}
          emptyMessage="No employees found"
          theme={{ primary: 'blue', secondary: 'gray', accent: 'blue' }}
        />

        {/* Bulk Mark Modal */}
        {showBulkMarkModal && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowBulkMarkModal(false)}></div>
              <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Bulk Mark Attendance</h3>
                    <button onClick={() => setShowBulkMarkModal(false)} className="text-gray-400 hover:text-gray-600">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                  <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">Mark attendance for {selectedEmployees.length} selected employees for {new Date(selectedDate).toLocaleDateString()}</p>
                    <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                    <textarea value={bulkMarkReason} onChange={(e) => setBulkMarkReason(e.target.value)} placeholder="Enter reason for bulk marking..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                  <button onClick={() => setShowBulkMarkModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                  <button onClick={handleBulkMarkAttendance} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Mark Attendance</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && selectedEmployeeForStatus && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowStatusModal(false)}></div>
              <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Change Attendance Status</h3>
                    <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-500">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                  <div className="p-6">
                    <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Employee: <span className="font-medium">{selectedEmployeeForStatus.name}</span></p>
                    <p className="text-sm text-gray-600 mb-4">Current Status: <span className="font-medium">{selectedEmployeeForStatus.currentStatus}</span></p>
                    </div>
                    <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="present">Present</option>
                        <option value="late">Late</option>
                        <option value="half_day">Half Day</option>
                        <option value="absent">Absent</option>
                      </select>
                    </div>
                    <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Change</label>
                    <textarea value={statusChangeReason} onChange={(e) => setStatusChangeReason(e.target.value)} rows={3} placeholder="Enter reason for status change..." className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="flex justify-end space-x-3">
                    <button onClick={() => setShowStatusModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                    <button onClick={handleStatusChange} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Change Status</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employee Attendance Drawer */}
        {selectedEmployeeForDrawer && (
          <EmployeeAttendanceDrawer
            isOpen={isDrawerOpen}
            onClose={() => {
              setIsDrawerOpen(false);
              setSelectedEmployeeForDrawer(null);
              invalidateAttendance({ start_date: selectedDate, end_date: selectedDate });
            }}
            employeeId={selectedEmployeeForDrawer.id}
            employeeName={selectedEmployeeForDrawer.name}
            currentDate={selectedDate}
          />
        )}

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${notification.type === 'success' ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'}`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{notification.message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button onClick={() => setNotification(null)} className={`bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 ${notification.type === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'}`}>
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

export default AttendanceManagement;
