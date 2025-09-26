import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useNavbar } from '../../../context/NavbarContext';
import { getEmployeesApi, type Employee } from '../../../apis/hr-employees';
import { 
  checkinApi, 
  bulkMarkPresentApi,
  getAttendanceLogsApi,
  updateAttendanceLogStatusApi,
  type CheckinDto, 
  type BulkMarkPresentDto,
  type UpdateAttendanceLogStatusDto
} from '../../../apis/attendance';
import DataTable, { type Column } from '../../../components/common/DataTable/DataTable';
import BulkActions, { type BulkAction } from '../../../components/common/BulkActions/BulkActions';
import DataStatistics from '../../../components/common/Statistics/DataStatistics';
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
  logId?: number; // Attendance log ID for status updates
  lateDetails?: {
    minutes_late: number;
    requires_reason: boolean;
  } | null;
}

const AttendanceManagement: React.FC = () => {
  const { user } = useAuth();
  const { isNavbarOpen } = useNavbar();
  const navigate = useNavigate();
  
  // State management
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Get today's date in local timezone (not UTC)
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showBulkMarkModal, setShowBulkMarkModal] = useState(false);
  const [bulkMarkReason, setBulkMarkReason] = useState('');
  
  // Status Management State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedEmployeeForStatus, setSelectedEmployeeForStatus] = useState<{id: number, name: string, currentStatus: string, logId?: number} | null>(null);
  const [newStatus, setNewStatus] = useState<'present' | 'late' | 'half_day' | 'absent'>('present');
  const [statusChangeReason, setStatusChangeReason] = useState('');
  
  // Late Management State
  const [showLateModal, setShowLateModal] = useState(false);
  const [selectedEmployeeForLate, setSelectedEmployeeForLate] = useState<{id: number, name: string, lateDetails: any} | null>(null);
  const [lateAction, setLateAction] = useState<'approve' | 'reject'>('approve');
  const [lateActionReason, setLateActionReason] = useState('');

  // Statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    present: 0,
    late: 0,
    halfDay: 0,
    absent: 0,
    notMarked: 0
  });

  // Load employees and attendance data on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Update attendance records when date or employees change
  useEffect(() => {
    if (employees.length > 0) {
      fetchAttendanceData();
    }
  }, [employees, selectedDate]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await getEmployeesApi({ limit: 1000 }); // Get all employees
      setEmployees(response.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load employees'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      // Fetch real attendance logs from backend for the selected date
      const logsResponse = await getAttendanceLogsApi({
        start_date: selectedDate,
        end_date: selectedDate
      });

      // Create a map of employee attendance for quick lookup
      const attendanceMap = new Map();
      if (logsResponse && Array.isArray(logsResponse)) {
        logsResponse.forEach(log => {
          attendanceMap.set(log.employee_id, {
            status: log.status,
            checkin: log.checkin,
            checkout: log.checkout,
            totalHours: null, // total_hours is not available in AttendanceLogResponseDto
            logId: log.id, // Store the attendance log ID
            lateDetails: log.late_details || null
          });
        });
      }

      // Create attendance records for all employees
      const records: AttendanceRecord[] = employees.map(employee => {
        const attendance = attendanceMap.get(employee.id);
        return {
          id: employee.id.toString(),
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          department: employee.department.name,
          status: attendance?.status || 'not_marked',
          checkin: attendance?.checkin || null,
          checkout: attendance?.checkout || null,
          totalHours: attendance?.totalHours || null,
          logId: attendance?.logId || undefined,
          lateDetails: attendance?.lateDetails || null
        };
      });
      
      setAttendanceRecords(records);
      updateStatistics(records);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      // Fallback to default records if API fails
      const records: AttendanceRecord[] = employees.map(employee => {
        return {
          id: employee.id.toString(),
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          department: employee.department.name,
          status: 'not_marked',
          checkin: null,
          checkout: null,
          totalHours: null,
          logId: undefined,
          lateDetails: null
        };
      });
      
      setAttendanceRecords(records);
      updateStatistics(records);
      
      setNotification({
        type: 'error',
        message: 'Using default attendance data. Please refresh to sync with backend.'
      });
    }
  };


  const updateStatistics = (records: AttendanceRecord[]) => {
    const stats = {
      total: records.length,
      present: records.filter(r => r.status === 'present').length,
      late: records.filter(r => r.status === 'late').length,
      halfDay: records.filter(r => r.status === 'half_day').length,
      absent: records.filter(r => r.status === 'absent').length,
      notMarked: records.filter(r => r.status === 'not_marked').length
    };
    setStatistics(stats);
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
  };

  const handleMarkAttendance = async (employeeId: number) => {
    try {
      // Use current Pakistani time directly without any conversion
      const now = new Date();
      
      // Format as Pakistani time: YYYY-MM-DDTHH:mm:ss.sssZ (local time)
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
        checkin: pakistaniTime, // Send Pakistani time directly without UTC conversion
        mode: 'onsite'  // Valid values: 'onsite' or 'remote' (from backend docs)
      };

      const response = await checkinApi(checkinData);
      
      // Refresh attendance data from backend to get the most up-to-date information
      await fetchAttendanceData();

      setNotification({
        type: 'success',
        message: `Employee attendance marked as ${response.status}`
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to mark attendance'
      });
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

      console.log('Sending bulk mark data:', bulkMarkData);
      const response = await bulkMarkPresentApi(bulkMarkData);
      console.log('Bulk mark response:', response);
      
      // Refresh attendance data from backend to get the most up-to-date information
      await fetchAttendanceData();

      setNotification({
        type: 'success',
        message: `Successfully marked ${response.marked_present} employees present`
      });

      setSelectedEmployees([]);
      setShowBulkMarkModal(false);
      setBulkMarkReason('');
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to bulk mark attendance'
      });
    }
  };

  // Status Management Functions
  const handleStatusChange = async () => {
    if (!selectedEmployeeForStatus || !selectedEmployeeForStatus.logId) {
      setNotification({
        type: 'error',
        message: 'Cannot change status: Attendance log not found'
      });
      return;
    }
    
    try {
      const statusData: UpdateAttendanceLogStatusDto = {
        status: newStatus,
        reason: statusChangeReason || undefined,
        reviewer_id: user?.id ? parseInt(user.id) : undefined
      };

      await updateAttendanceLogStatusApi(selectedEmployeeForStatus.logId, statusData);
      
      setNotification({
        type: 'success',
        message: `Status changed from ${selectedEmployeeForStatus.currentStatus} to ${newStatus} for ${selectedEmployeeForStatus.name}`
      });

      // Refresh attendance data to get updated information
      await fetchAttendanceData();

      // Close modal and reset state
      setShowStatusModal(false);
      setSelectedEmployeeForStatus(null);
      setNewStatus('present');
      setStatusChangeReason('');
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to change status'
      });
    }
  };

  const openStatusModal = (employeeId: number, employeeName: string, currentStatus: string, logId?: number) => {
    setSelectedEmployeeForStatus({ id: employeeId, name: employeeName, currentStatus, logId });
    setNewStatus(currentStatus as any);
    setShowStatusModal(true);
  };

  // Late Management Functions
  const handleLateAction = async () => {
    if (!selectedEmployeeForLate) return;
    
    try {
      // This would call the late action API endpoint
      setNotification({
        type: 'success',
        message: `Late action ${lateAction}d for ${selectedEmployeeForLate.name}`
      });

      // Refresh attendance data
      await fetchAttendanceData();

      // Close modal and reset state
      setShowLateModal(false);
      setSelectedEmployeeForLate(null);
      setLateAction('approve');
      setLateActionReason('');
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to process late action'
      });
    }
  };

  const openLateModal = (employeeId: number, employeeName: string, lateDetails: any) => {
    setSelectedEmployeeForLate({ id: employeeId, name: employeeName, lateDetails });
    setShowLateModal(true);
  };

  const handleBulkSelect = (employeeIds: string[]) => {
    setSelectedEmployees(employeeIds);
  };

  // Table columns configuration
  const columns: Column<AttendanceRecord>[] = [
    {
      header: 'Employee',
      accessor: 'employeeName',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {row.employeeName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {row.employeeName}
            </div>
            <div className="text-sm text-gray-500">{row.department}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'present'
            ? 'bg-green-100 text-green-800' 
            : value === 'late'
            ? 'bg-yellow-100 text-yellow-800'
            : value === 'half_day'
            ? 'bg-orange-100 text-orange-800'
            : value === 'absent'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value === 'present' ? 'Present' : 
           value === 'late' ? 'Late' : 
           value === 'half_day' ? 'Half Day' : 
           value === 'absent' ? 'Absent' : 'Not Marked'}
        </span>
      )
    },
    {
      header: 'Check In',
      accessor: 'checkin',
      render: (value) => (
        <span className="text-sm text-gray-900">
          {value ? new Date(value).toLocaleTimeString() : 'N/A'}
        </span>
      )
    },
    {
      header: 'Check Out',
      accessor: 'checkout',
      render: (value) => (
        <span className="text-sm text-gray-900">
          {value ? new Date(value).toLocaleTimeString() : 'N/A'}
        </span>
      )
    },
    {
      header: 'Total Hours',
      accessor: 'totalHours',
      render: (value) => (
        <span className="text-sm text-gray-900">
          {value ? `${value}h` : 'N/A'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'employeeId',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          {row.status === 'not_marked' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAttendance(row.employeeId);
              }}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Mark Attendance
            </button>
          )}
          {row.status !== 'not_marked' && (
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                row.status === 'present'
                  ? 'bg-green-100 text-green-800' 
                  : row.status === 'late'
                  ? 'bg-yellow-100 text-yellow-800'
                  : row.status === 'half_day'
                  ? 'bg-orange-100 text-orange-800'
                  : row.status === 'absent'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {row.status === 'present' ? 'Present' : 
                 row.status === 'late' ? 'Late' : 
                 row.status === 'half_day' ? 'Half Day' : 
                 row.status === 'absent' ? 'Absent' : 'Marked'}
              </span>
              
              {/* Status Change Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openStatusModal(row.employeeId, row.employeeName, row.status || 'not_marked', row.logId);
                }}
                className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Change Status"
              >
                ✏️
              </button>
              
              {/* Late Details Button (only show for late employees) */}
              {row.status === 'late' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openLateModal(row.employeeId, row.employeeName, row.lateDetails);
                  }}
                  className="inline-flex items-center px-2 py-1 border border-yellow-300 text-xs font-medium rounded text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  title="Manage Late"
                >
                  ⏰
                </button>
              )}
            </div>
          )}
        </div>
      )
    }
  ];

  // Statistics cards
  const statisticsCards = [
    {
      title: 'Total Employees',
      value: statistics.total,
      color: 'blue' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      )
    },
    {
      title: 'Present',
      value: statistics.present,
      color: 'green' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Late',
      value: statistics.late,
      color: 'yellow' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Half Day',
      value: statistics.halfDay,
      color: 'purple' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Absent',
      value: statistics.absent,
      color: 'red' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Not Marked',
      value: statistics.notMarked,
      color: 'indigo' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  // Bulk actions configuration
  const bulkActions: BulkAction[] = [
    {
      id: 'bulk-attendance',
      label: 'Mark Selected Attendance',
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
      variant: 'primary',
      onClick: () => setShowBulkMarkModal(true),
      confirmMessage: `Are you sure you want to mark attendance for the selected employees?`
    }
  ];

  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Auto-dismiss notifications after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Debug: Log user permissions
  console.log('User permissions:', user?.permissions);
  console.log('User role:', user?.role);
  console.log('User department:', user?.department);

  // Check if user has access to attendance page - managers, leads, and HR employees
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
              You don't have permission to access the attendance page. Only <strong>managers, team leads, unit heads, senior, and junior HR employees</strong> can view and manage attendance data.
            </p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Mark and track employee attendance for the selected date
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Date:
                </label>
                <input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* HR Buttons */}
              {user && (user.role === 'admin' || user.role === 'dep_manager' || user.role === 'team_lead' || user.role === 'unit_head') && (
                <div className="flex items-center space-x-2">
                  {/* Employee Requests - Visible to managers and leads only */}
                  <button
                    onClick={() => navigate('/employee-requests')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Employee Requests
                  </button>
                  
                  {/* HR Logs - Only visible to department managers */}
                  {user.role === 'dep_manager' && (
                    <button
                      onClick={() => navigate('/hr-logs')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      HR Logs
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="mb-8">
          <DataStatistics 
            title={`Attendance Statistics for ${new Date(selectedDate).toLocaleDateString()}`}
            cards={statisticsCards} 
            loading={isLoading}
          />
        </div>

        {/* Bulk Actions */}
        <div className="mb-6">
          <BulkActions
            selectedItems={selectedEmployees}
            actions={bulkActions}
            onClearSelection={() => setSelectedEmployees([])}
          />
        </div>

        {/* Attendance Table */}
        <DataTable
          columns={columns}
          data={attendanceRecords}
          searchable={true}
          sortable={true}
          paginated={true}
          serverSidePagination={false}
          rowsPerPage={20}
          selectable={true}
          emptyMessage="No employees found"
          loading={isLoading}
          onBulkSelect={handleBulkSelect}
          selectedRows={selectedEmployees}
        />

        {/* Bulk Mark Present Modal */}
        {showBulkMarkModal && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowBulkMarkModal(false)}></div>
              
              <div 
                className={`relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all ${
                  isNavbarOpen ? 'navbar-open-modal' : 'navbar-closed-modal'
                }`}
                style={{
                  width: '500px',
                  maxWidth: '90vw',
                  marginLeft: isNavbarOpen ? '200px' : '0px'
                }}
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Bulk Mark Attendance
                    </h3>
                    <button
                      onClick={() => setShowBulkMarkModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Mark attendance for {selectedEmployees.length} selected employees for {new Date(selectedDate).toLocaleDateString()}
                    </p>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason (Optional)
                      </label>
                      <textarea
                        value={bulkMarkReason}
                        onChange={(e) => setBulkMarkReason(e.target.value)}
                        placeholder="Enter reason for bulk marking..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={() => setShowBulkMarkModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkMarkAttendance}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Mark Attendance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
            notification.type === 'success' ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'
          }`}>
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
                  <p className={`text-sm font-medium ${
                    notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={handleCloseNotification}
                    className={`bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      notification.type === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'
                    }`}
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

        {/* Status Change Modal */}
        {showStatusModal && selectedEmployeeForStatus && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowStatusModal(false)}></div>
              
              <div 
                className={`relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all ${
                  isNavbarOpen ? 'navbar-open-modal' : 'navbar-closed-modal'
                }`}
                style={{
                  width: '500px',
                  maxWidth: '90vw',
                  marginLeft: isNavbarOpen ? '200px' : '0px'
                }}
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Change Attendance Status
                    </h3>
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Employee: <span className="font-medium">{selectedEmployeeForStatus.name}</span>
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Current Status: <span className="font-medium">{selectedEmployeeForStatus.currentStatus}</span>
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="present">Present</option>
                        <option value="late">Late</option>
                        <option value="half_day">Half Day</option>
                        <option value="absent">Absent</option>
                      </select>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Change
                      </label>
                      <textarea
                        value={statusChangeReason}
                        onChange={(e) => setStatusChangeReason(e.target.value)}
                        rows={3}
                        placeholder="Enter reason for status change..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowStatusModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleStatusChange}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Change Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Late Management Modal */}
        {showLateModal && selectedEmployeeForLate && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowLateModal(false)}></div>
              
              <div 
                className={`relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all ${
                  isNavbarOpen ? 'navbar-open-modal' : 'navbar-closed-modal'
                }`}
                style={{
                  width: '500px',
                  maxWidth: '90vw',
                  marginLeft: isNavbarOpen ? '200px' : '0px'
                }}
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Manage Late Attendance
                    </h3>
                    <button
                      onClick={() => setShowLateModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Employee: <span className="font-medium">{selectedEmployeeForLate.name}</span>
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Minutes Late: <span className="font-medium">{selectedEmployeeForLate.lateDetails?.minutes_late || 'N/A'}</span>
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Action
                      </label>
                      <select
                        value={lateAction}
                        onChange={(e) => setLateAction(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="approve">Approve (Paid)</option>
                        <option value="reject">Reject (Unpaid)</option>
                      </select>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        HR Notes
                      </label>
                      <textarea
                        value={lateActionReason}
                        onChange={(e) => setLateActionReason(e.target.value)}
                        rows={3}
                        placeholder="Enter HR notes for this late attendance..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowLateModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleLateAction}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          lateAction === 'approve' 
                            ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                            : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                        }`}
                      >
                        {lateAction === 'approve' ? 'Approve Late' : 'Reject Late'}
                      </button>
                    </div>
                  </div>
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
