import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavbar } from '../../context/NavbarContext';
import {
  getAttendanceLogsApi,
  getLateLogs,
  updateLateLogAction,
  getHalfDayLogs,
  updateHalfDayLogAction,
  getLeaveLogs,
  updateLeaveLogAction,
  getMonthlyAttendance,
  getLateLogsStats,
  getHalfDayLogsStats,
  getLeaveLogsStats,
} from '../../apis/attendance';
import {
  LateLogsTab,
  HalfDayLogsTab,
  LeaveLogsTab,
  MonthlySummaryTab,
  StatisticsTab
} from './DrawerTabs';
import AttendanceCalendar from './AttendanceCalendar';
import './EmployeeAttendanceDrawer.css';

interface EmployeeAttendanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  employeeName: string;
  currentDate?: string;
}

interface AttendanceEvent {
  date: number;
  status: 'present' | 'late' | 'half_day' | 'absent' | null;
  checkin: string | null;
  checkout: string | null;
  logId?: number;
}

const EmployeeAttendanceDrawer: React.FC<EmployeeAttendanceDrawerProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName
}) => {
  const { user } = useAuth();
  const { isNavbarOpen } = useNavbar();
  const [activeTab, setActiveTab] = useState<'calendar' | 'late' | 'halfday' | 'leave' | 'monthly' | 'statistics'>('calendar');
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // State for different data types
  const [attendanceEvents, setAttendanceEvents] = useState<AttendanceEvent[]>([]);
  const [lateLogs, setLateLogs] = useState<any[]>([]);
  const [halfDayLogs, setHalfDayLogs] = useState<any[]>([]);
  const [leaveLogs, setLeaveLogs] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>({});

  // Month filter
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch data when drawer opens or tab/month changes
  useEffect(() => {
    if (isOpen && employeeId) {
      fetchTabData(activeTab);
    }
  }, [isOpen, employeeId, activeTab, selectedMonth]);

  const fetchTabData = async (tab: string) => {
    setLoading(true);
    try {
      switch (tab) {
        case 'calendar':
          await fetchAttendanceCalendar();
          break;
        case 'late':
          await fetchLateLogs();
          break;
        case 'halfday':
          await fetchHalfDayLogs();
          break;
        case 'leave':
          await fetchLeaveLogs();
          break;
        case 'monthly':
          await fetchMonthlyData();
          break;
        case 'statistics':
          await fetchStatistics();
          break;
      }
    } catch (error) {
      showNotification('error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceCalendar = async () => {
    const [year, month] = selectedMonth.split('-');
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    const logs = await getAttendanceLogsApi({
      employee_id: employeeId,
      start_date: startDate,
      end_date: endDate
    });

    const events: AttendanceEvent[] = (logs || []).map(log => ({
      date: log.date ? new Date(log.date).getDate() : 0,
      status: log.status,
      checkin: log.checkin,
      checkout: log.checkout,
      logId: log.id
    }));

    setAttendanceEvents(events);
  };

  const fetchLateLogs = async () => {
    const logs = await getLateLogs({
      employee_id: employeeId
    });
    setLateLogs(logs || []);
  };

  const fetchHalfDayLogs = async () => {
    const logs = await getHalfDayLogs({
      employee_id: employeeId
    });
    setHalfDayLogs(logs || []);
  };

  const fetchLeaveLogs = async () => {
    const logs = await getLeaveLogs({
      employee_id: employeeId
    });
    setLeaveLogs(logs || []);
  };

  const fetchMonthlyData = async () => {
    const data = await getMonthlyAttendance(employeeId, { month: selectedMonth });
    setMonthlyData(data);
  };

  const fetchStatistics = async () => {
    const [year, month] = selectedMonth.split('-');
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    const [lateStats, halfDayStats, leaveStats] = await Promise.all([
      getLateLogsStats({ employee_id: employeeId, start_date: startDate, end_date: endDate }),
      getHalfDayLogsStats({ employee_id: employeeId, start_date: startDate, end_date: endDate }),
      getLeaveLogsStats({ employee_id: employeeId, start_date: startDate, end_date: endDate })
    ]);
    setStatistics({ lateStats, halfDayStats, leaveStats });
  };

  const handleLateAction = async (logId: number, action: string, lateType?: string) => {
    try {
      await updateLateLogAction(logId, {
        action: action as any,
        reviewer_id: user?.id ? parseInt(user.id) : undefined,
        late_type: lateType as any
      });
      showNotification('success', `Late log ${action.toLowerCase()}d`);
      fetchLateLogs();
    } catch (error) {
      showNotification('error', 'Failed to update late log');
    }
  };

  const handleHalfDayAction = async (logId: number, action: string, halfDayType?: string) => {
    try {
      await updateHalfDayLogAction(logId, {
        action: action as any,
        reviewer_id: user?.id ? parseInt(user.id) : undefined,
        half_day_type: halfDayType as any
      });
      showNotification('success', `Half-day log ${action.toLowerCase()}d`);
      fetchHalfDayLogs();
    } catch (error) {
      showNotification('error', 'Failed to update half-day log');
    }
  };

  const handleLeaveAction = async (logId: number, action: string, reason?: string) => {
    try {
      await updateLeaveLogAction(logId, {
        action: action as any,
        reviewer_id: user?.id ? parseInt(user.id) : undefined,
        confirmation_reason: reason
      });
      showNotification('success', `Leave ${action.toLowerCase()}d`);
      fetchLeaveLogs();
    } catch (error) {
      showNotification('error', 'Failed to update leave');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75" onClick={onClose}></div>
      
      <div 
        className="relative mx-auto h-full bg-white shadow-2xl rounded-lg border border-gray-200 transform transition-all duration-300 ease-out"
        style={{
          marginLeft: isMobile ? '0' : (isNavbarOpen ? '280px' : '100px'),
          width: isMobile ? '100vw' : (isNavbarOpen ? 'calc(100vw - 350px)' : 'calc(100vw - 150px)'),
          maxWidth: isMobile ? '100vw' : '1200px',
          marginRight: isMobile ? '0' : '50px',
          marginTop: isMobile ? '0' : '20px',
          marginBottom: isMobile ? '0' : '20px',
          height: isMobile ? '100vh' : 'calc(100vh - 40px)'
        }}
      >
        <div className="flex h-full flex-col">
            {/* Header */}
          <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg`}>
              <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">
                    {employeeName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{employeeName}</h2>
                  <p className="text-sm text-gray-600">Employee ID: {employeeId}</p>
                </div>
                </div>
                <button
                  onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

            {/* Month Selector */}
            <div className="mt-4">
                  <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  const [year, month] = e.target.value.split('-').map(Number);
                  setCurrentCalendarDate(new Date(year, month - 1));
                }}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              </div>
            </div>

            {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className={`-mb-px flex space-x-8 ${isMobile ? 'px-4' : 'px-6'}`}>
              {[
                { id: 'calendar', name: 'Attendance' },
                { id: 'late', name: 'Late' },
                { id: 'halfday', name: 'Half-Day' },
                { id: 'leave', name: 'Leave' },
                { id: 'monthly', name: 'Monthly' },
                { id: 'statistics', name: 'Statistics' }
              ].map((tab) => (
                  <button
                    key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                  {tab.name}
                  </button>
                ))}
            </nav>
            </div>

            {/* Content */}
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-4'}`}>
              {loading ? (
              <div className="text-center py-8">
                <svg className="animate-spin mx-auto h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-sm text-gray-500">Loading...</p>
                </div>
              ) : (
                <>
                {activeTab === 'calendar' && (
                  <AttendanceCalendar
                    attendanceEvents={attendanceEvents}
                    selectedMonth={selectedMonth}
                    currentCalendarDate={currentCalendarDate}
                    isMobile={isMobile}
                  />
                )}

                {activeTab === 'late' && (
                  <LateLogsTab 
                    logs={lateLogs} 
                    onAction={handleLateAction}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                )}

                {activeTab === 'halfday' && (
                  <HalfDayLogsTab 
                    logs={halfDayLogs} 
                    onAction={handleHalfDayAction}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                )}

                {activeTab === 'leave' && (
                  <LeaveLogsTab 
                    logs={leaveLogs} 
                    onAction={handleLeaveAction}
                    formatDate={formatDate}
                  />
                )}

                {activeTab === 'monthly' && (
                  <MonthlySummaryTab data={monthlyData} />
                )}

                {activeTab === 'statistics' && (
                  <StatisticsTab stats={statistics} />
                )}
                </>
              )}
          </div>
            </div>

            {/* Notification */}
            {notification && (
          <div className={`fixed ${isMobile ? 'bottom-4 left-4 right-4' : 'top-4 right-4'} z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
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
                    onClick={() => setNotification(null)}
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
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

export default EmployeeAttendanceDrawer;
