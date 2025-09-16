import React, { useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  date: number;
  type: 'leave' | 'meeting' | 'holiday' | 'training';
  employee?: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: number) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
  title?: string;
}

export const Calendar: React.FC<CalendarProps> = ({ 
  events = [], 
  onDateClick, 
  onEventClick,
  className = '',
  title = 'Team Calendar'
}) => {
  const [currentDate] = useState(new Date());
  
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'leave':
        return 'bg-gradient-to-br from-sky-50 to-blue-100 text-sky-800 border-sky-200';
      case 'meeting':
        return 'bg-gradient-to-br from-violet-50 to-purple-100 text-violet-800 border-violet-200';
      case 'holiday':
        return 'bg-gradient-to-br from-rose-50 to-red-100 text-rose-800 border-rose-200';
      case 'training':
        return 'bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gradient-to-br from-slate-50 to-gray-100 text-slate-700 border-slate-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'leave':
        return '🌴';
      case 'meeting':
        return '💼';
      case 'holiday':
        return '🎉';
      case 'training':
        return '📚';
      default:
        return '📌';
    }
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const days = generateCalendarDays();
  const dayAbbrevs = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDate = (date: number) => {
    return events.filter(event => event.date === date);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden backdrop-blur-sm ${className}`}>
      {/* Header with Gradient */}
      <div className="px-8 py-6 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-4 left-8 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-2 right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/40 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/50">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-700 tracking-tight">{title}</h2>
              <p className="text-slate-600 text-sm font-medium">{monthName}</p>
            </div>
          </div>
          <div className="hidden sm:flex space-x-2">
            <button className="px-4 py-2 bg-white/40 hover:bg-white/60 text-slate-700 rounded-lg backdrop-blur-sm border border-white/60 transition-all duration-200 text-sm font-medium hover:scale-105 hover:shadow-md">
              Today
            </button>
            <button className="px-4 py-2 bg-white/40 hover:bg-white/60 text-slate-700 rounded-lg backdrop-blur-sm border border-white/60 transition-all duration-200 text-sm font-medium hover:scale-105 hover:shadow-md">
              View
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-3 mb-6">
          {dayAbbrevs.map((day) => (
            <div key={day} className="text-center">
              <div className="text-sm font-semibold text-slate-600 mb-2">{day}</div>
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-3">
          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDate(day) : [];
            const isToday = day === new Date().getDate() && 
                           currentDate.getMonth() === new Date().getMonth() &&
                           currentDate.getFullYear() === new Date().getFullYear();
            const isWeekend = day && (index % 7 === 0 || index % 7 === 6);
            
            return (
              <div
                key={index}
                className={`min-h-[100px] p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                  day 
                    ? `cursor-pointer hover:border-slate-300 ${
                        isToday 
                          ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-300 ring-2 ring-blue-200' 
                          : isWeekend
                          ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }` 
                    : 'bg-slate-50/50 border-slate-100'
                }`}
                onClick={() => day && onDateClick?.(day)}
              >
                {day && (
                  <>
                    <div className={`text-base font-bold mb-3 flex items-center justify-between ${
                      isToday ? 'text-blue-700' : isWeekend ? 'text-slate-500' : 'text-slate-700'
                    }`}>
                      <span>{day}</span>
                      {isToday && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs px-3 py-2 rounded-lg border cursor-pointer hover:scale-105 transition-all duration-200 ${getEventTypeColor(event.type)}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{getEventIcon(event.type)}</span>
                            <span className="font-semibold truncate">{event.title}</span>
                          </div>
                          {event.employee && (
                            <div className="text-xs opacity-80 truncate font-medium pl-5">{event.employee}</div>
                          )}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-slate-500 text-center bg-slate-100 py-1 px-2 rounded-md font-medium">
                          +{dayEvents.length - 2} more events
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Enhanced Legend */}
      <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
        <div className="flex flex-wrap gap-6 text-sm">
          {[
            { type: 'leave', label: 'Time Off', icon: '🌴' },
            { type: 'meeting', label: 'Meetings', icon: '💼' },
            { type: 'holiday', label: 'Holidays', icon: '🎉' },
            { type: 'training', label: 'Training', icon: '📚' }
          ].map(({ type, label, icon }) => (
            <div key={type} className="flex items-center gap-3 group">
              <div className={`w-4 h-4 rounded-full border-2 ${getEventTypeColor(type)} group-hover:scale-110 transition-transform duration-200`}></div>
              <span className="font-medium text-slate-700 flex items-center gap-2">
                <span>{icon}</span>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
