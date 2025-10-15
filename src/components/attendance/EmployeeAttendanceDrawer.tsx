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

  // Calendar helper functions
  const generateCalendarDays = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const getEventsForDate = (date: number) => {
    return attendanceEvents.filter(event => event.date === date);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'present':
        return 'bg-gradient-to-br from-green-50 to-emerald-100 text-green-800 border-green-200';
      case 'late':
        return 'bg-gradient-to-br from-yellow-50 to-amber-100 text-yellow-800 border-yellow-200';
      case 'half_day':
        return 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-800 border-orange-200';
      case 'absent':
        return 'bg-gradient-to-br from-red-50 to-rose-100 text-red-800 border-red-200';
      default:
        return 'bg-gradient-to-br from-slate-50 to-gray-100 text-slate-700 border-slate-200';
    }
  };


  const monthName = currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const days = generateCalendarDays();
  const dayAbbrevs = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
                  <div className="space-y-6">
                    {/* Calendar View */}
                    <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                        <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {monthName}
                      </h3>

                      {/* Day Headers */}
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {dayAbbrevs.map((day) => (
                          <div key={day} className="text-center">
                            <div className="text-sm font-semibold text-slate-600">{day}</div>
                          </div>
                        ))}
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-2">
                        {days.map((day, index) => {
                          const dayEvents = day ? getEventsForDate(day) : [];
                          const isToday = day === new Date().getDate() && 
                                         currentCalendarDate.getMonth() === new Date().getMonth() &&
                                         currentCalendarDate.getFullYear() === new Date().getFullYear();
                          const isWeekend = day && (index % 7 === 0 || index % 7 === 6);
                          
                          return (
                            <div
                              key={index}
                              className={`min-h-[100px] p-2 rounded-lg border transition-all duration-200 ${
                                day 
                                  ? `cursor-pointer hover:shadow-md ${
                                      isToday 
                                        ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-300 ring-2 ring-blue-200' 
                                        : isWeekend
                                        ? 'bg-slate-50 border-slate-200'
                                        : 'bg-white border-slate-200'
                                    }` 
                                  : 'bg-slate-50/50 border-slate-100'
                              }`}
                            >
                              {day && (
                                <>
                                  <div className={`text-sm font-bold mb-2 flex items-center justify-between ${
                                    isToday ? 'text-blue-700' : isWeekend ? 'text-slate-500' : 'text-slate-700'
                                  }`}>
                                    <span>{day}</span>
                                    {isToday && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    {dayEvents.map((event) => (
                                      <div
                                        key={event.date}
                                        className={`text-xs px-2 py-1.5 rounded-md border ${getStatusColor(event.status)}`}
                                      >
                                        <div className="mb-0.5">
                                          <span className="font-semibold truncate">
                                            {event.status ? event.status.replace('_', ' ').toUpperCase() : 'N/A'}
                                          </span>
                                        </div>
                                        {event.checkin && (
                                          <div className="text-xs opacity-80 truncate">
                                            In: {formatTime(event.checkin)}
                                          </div>
                                        )}
                                        {event.checkout && (
                                          <div className="text-xs opacity-80 truncate">
                                            Out: {formatTime(event.checkout)}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    {dayEvents.length === 0 && !isWeekend && (
                                      <div className="text-xs text-slate-400 text-center py-1">
                                        No record
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex flex-wrap gap-4 text-sm">
                          {[
                            { 
                              status: 'present', 
                              label: 'Present',
                              icon: <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            },
                            { 
                              status: 'late', 
                              label: 'Late',
                              icon: <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            },
                            { 
                              status: 'half_day', 
                              label: 'Half Day',
                              icon: <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v9l4 4m4-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            },
                            { 
                              status: 'absent', 
                              label: 'Absent',
                              icon: <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            }
                          ].map(({ status, label, icon }) => (
                            <div key={status} className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full border-2 ${getStatusColor(status)}`}></div>
                              <span className="font-medium text-slate-700 flex items-center gap-1">
                                {icon}
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
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
