import React from 'react';

interface AttendanceEvent {
  date: number;
  status: 'present' | 'late' | 'half_day' | 'absent' | null;
  checkin: string | null;
  checkout: string | null;
  logId?: number;
}

interface AttendanceCalendarProps {
  attendanceEvents: AttendanceEvent[];
  selectedMonth: string;
  currentCalendarDate: Date;
  isMobile?: boolean;
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  attendanceEvents,
  selectedMonth,
  currentCalendarDate,
  isMobile = false
}) => {
  
  const formatTime = (dateString: string) => {
    // Extract time part from ISO string (e.g., "2025-10-30T01:56:24.000Z" -> "01:56")
    const timeMatch = dateString.match(/T(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : dateString;
  };

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

  return (
    <div>
      {/* Calendar View */}
      <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-3' : 'p-4'}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {monthName}
        </h3>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayAbbrevs.map((day) => (
            <div key={day} className="text-center">
              <div className="text-xs font-semibold text-slate-600">{day}</div>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDate(day) : [];
            const isToday = day === new Date().getDate() && 
                           currentCalendarDate.getMonth() === new Date().getMonth() &&
                           currentCalendarDate.getFullYear() === new Date().getFullYear();
            const isWeekend = day && (index % 7 === 0 || index % 7 === 6);
            
            return (
              <div
                key={index}
                className={`min-h-[70px] p-1.5 rounded-md border transition-all duration-200 ${
                  day 
                    ? `cursor-pointer hover:shadow-sm ${
                        isToday 
                          ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-300 ring-1 ring-blue-200' 
                          : isWeekend
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-white border-slate-200'
                      }` 
                    : 'bg-slate-50/50 border-slate-100'
                }`}
              >
                {day && (
                  <>
                    <div className={`text-xs font-bold mb-1 flex items-center justify-between ${
                      isToday ? 'text-blue-700' : isWeekend ? 'text-slate-500' : 'text-slate-700'
                    }`}>
                      <span>{day}</span>
                      {isToday && (
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.date}
                          className={`text-[10px] px-1.5 py-1 rounded border ${getStatusColor(event.status)}`}
                        >
                          <div className="font-semibold truncate">
                            {event.status ? event.status.replace('_', ' ').toUpperCase() : 'N/A'}
                          </div>
                          {event.checkin && (
                            <div className="text-[9px] opacity-80 truncate">
                              {formatTime(event.checkin)}
                            </div>
                          )}
                        </div>
                      ))}
                      {dayEvents.length === 0 && !isWeekend && (
                        <div className="text-[10px] text-slate-400 text-center">
                          -
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
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-3 text-xs">
            {[
              { 
                status: 'present', 
                label: 'Present',
                icon: <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              },
              { 
                status: 'late', 
                label: 'Late',
                icon: <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              },
              { 
                status: 'half_day', 
                label: 'Half Day',
                icon: <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v9l4 4m4-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              },
              { 
                status: 'absent', 
                label: 'Absent',
                icon: <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              }
            ].map(({ status, label, icon }) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full border ${getStatusColor(status)}`}></div>
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
  );
};

export default AttendanceCalendar;

