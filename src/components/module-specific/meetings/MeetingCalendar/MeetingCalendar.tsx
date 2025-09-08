import React, { useState, useCallback, useMemo } from 'react';
import './MeetingCalendar.css';

// Type definitions
export type UserRole = 'HR Manager' | 'Unit Head' | 'Team Lead' | 'Employee' | 'Admin';

export type MeetingStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Postponed';

export type MeetingPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  status: MeetingStatus;
  priority: MeetingPriority;
  organizer: string;
  attendees: string[];
  location?: string;
  meetingType: 'One-on-One' | 'Team Meeting' | 'Client Meeting' | 'Training' | 'Review';
  notes?: string;
}

export interface MeetingCalendarProps {
  meetingData: Meeting[];
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  showLegend?: boolean;
  showTodayButton?: boolean;
  userRole?: UserRole;
  editable?: boolean;
  onMeetingClick?: (meeting: Meeting) => void;
  onMeetingEdit?: (meeting: Meeting) => void;
  onMeetingDelete?: (meetingId: string) => void;
  onDateSelect?: (date: Date) => void;
  onFilterChange?: (filters: MeetingFilters) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'minimal' | 'detailed';
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export interface MeetingFilters {
  status: MeetingStatus[];
  priority: MeetingPriority[];
  meetingType: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

const MeetingCalendar: React.FC<MeetingCalendarProps> = ({
  meetingData = [],
  title = 'Meeting Calendar',
  subtitle = 'View and manage your meetings',
  showFilters = true,
  showLegend = true,
  showTodayButton = true,
  userRole = 'Employee',
  editable = false,
  onMeetingClick,
  onMeetingEdit,
  onMeetingDelete,
  onDateSelect,
  onFilterChange,
  className = '',
  size = 'medium',
  variant = 'default',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}) => {
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filters, setFilters] = useState<MeetingFilters>({
    status: [],
    priority: [],
    meetingType: [],
    dateRange: { start: null, end: null }
  });
  const [hoveredMeeting, setHoveredMeeting] = useState<string | null>(null);

  // Role-based access control
  const canView = useMemo(() => {
    return ['HR Manager', 'Unit Head', 'Admin'].includes(userRole);
  }, [userRole]);

  const canEdit = useMemo(() => {
    return editable && ['HR Manager', 'Unit Head', 'Admin'].includes(userRole);
  }, [editable, userRole]);

  // Calendar navigation
  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  }, []);

  // Date handling
  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  }, []);

  // Filter meetings
  const filteredMeetings = useMemo(() => {
    return meetingData.filter(meeting => {
      const meetingDate = new Date(meeting.startTime);
      
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(meeting.status)) {
        return false;
      }
      
      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(meeting.priority)) {
        return false;
      }
      
      // Meeting type filter
      if (filters.meetingType.length > 0 && !filters.meetingType.includes(meeting.meetingType)) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange.start && meetingDate < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && meetingDate > filters.dateRange.end) {
        return false;
      }
      
      return true;
    });
  }, [meetingData, filters]);

  // Get meetings for a specific date
  const getMeetingsForDate = useCallback((date: Date) => {
    return filteredMeetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime);
      return meetingDate.toDateString() === date.toDateString();
    });
  }, [filteredMeetings]);

  // Event handlers
  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  }, [onDateSelect]);

  const handleMeetingClick = useCallback((meeting: Meeting, event: React.MouseEvent) => {
    event.stopPropagation();
    onMeetingClick?.(meeting);
  }, [onMeetingClick]);

  const handleMeetingEdit = useCallback((meeting: Meeting, event: React.MouseEvent) => {
    event.stopPropagation();
    onMeetingEdit?.(meeting);
  }, [onMeetingEdit]);

  const handleMeetingDelete = useCallback((meetingId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onMeetingDelete?.(meetingId);
  }, [onMeetingDelete]);

  const handleFilterChange = useCallback((newFilters: Partial<MeetingFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  }, [filters, onFilterChange]);

  // Utility functions
  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  const isSelected = useCallback((date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  }, [selectedDate]);

  const getPriorityColor = useCallback((priority: MeetingPriority) => {
    switch (priority) {
      case 'Urgent': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      case 'Low': return '#22c55e';
      default: return '#6b7280';
    }
  }, []);

  const getStatusColor = useCallback((status: MeetingStatus) => {
    switch (status) {
      case 'Scheduled': return '#3b82f6';
      case 'In Progress': return '#f59e0b';
      case 'Completed': return '#22c55e';
      case 'Cancelled': return '#ef4444';
      case 'Postponed': return '#8b5cf6';
      default: return '#6b7280';
    }
  }, []);

  // If user doesn't have permission to view, show access denied
  if (!canView) {
    return (
      <div 
        className={`meeting-calendar meeting-calendar--${size} meeting-calendar--${variant} ${className}`}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      >
        <div className="meeting-calendar-access-denied">
          <div className="access-denied-icon">🔒</div>
          <h3>Access Restricted</h3>
          <p>You don't have permission to view the meeting calendar.</p>
          <p>Contact your HR Manager or Unit Head for access.</p>
        </div>
      </div>
    );
  }

  const calendarDays = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div 
      className={`meeting-calendar meeting-calendar--${size} meeting-calendar--${variant} ${className}`}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {/* Header */}
      <div className="meeting-calendar-header">
        <div className="calendar-title-section">
          <h2 className="calendar-title">{title}</h2>
          {subtitle && <p className="calendar-subtitle">{subtitle}</p>}
        </div>
        
        <div className="calendar-controls">
          <button 
            className="calendar-nav-btn"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            ‹
          </button>
          
          <h3 className="current-month">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
          
          <button 
            className="calendar-nav-btn"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            ›
          </button>
          
          {showTodayButton && (
            <button 
              className="today-btn"
              onClick={goToToday}
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="meeting-calendar-filters">
          <div className="filter-group">
            <label className="filter-label">Status:</label>
            <select 
              className="filter-select"
              value={filters.status.length > 0 ? filters.status[0] : ''}
              onChange={(e) => {
                const selected = e.target.value ? [e.target.value as MeetingStatus] : [];
                handleFilterChange({ status: selected });
              }}
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Priority:</label>
            <select 
              className="filter-select"
              value={filters.priority.length > 0 ? filters.priority[0] : ''}
              onChange={(e) => {
                const selected = e.target.value ? [e.target.value as MeetingPriority] : [];
                handleFilterChange({ priority: selected });
              }}
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Type:</label>
            <select 
              className="filter-select"
              value={filters.meetingType.length > 0 ? filters.meetingType[0] : ''}
              onChange={(e) => {
                const selected = e.target.value ? [e.target.value] : [];
                handleFilterChange({ meetingType: selected });
              }}
            >
              <option value="">All Types</option>
              <option value="One-on-One">One-on-One</option>
              <option value="Team Meeting">Team Meeting</option>
              <option value="Client Meeting">Client Meeting</option>
              <option value="Training">Training</option>
            </select>
          </div>
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="meeting-calendar-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
            <span>Urgent</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#f97316' }}></span>
            <span>High</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#eab308' }}></span>
            <span>Medium</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#22c55e' }}></span>
            <span>Low</span>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="meeting-calendar-grid">
        {/* Week day headers */}
        <div className="calendar-weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday-header">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="calendar-days">
          {calendarDays.map(({ date, isCurrentMonth }, index) => {
            const dayMeetings = getMeetingsForDate(date);
            const isCurrentDay = isToday(date);
            const isSelectedDay = isSelected(date);
            
            return (
              <div
                key={index}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${
                  isCurrentDay ? 'today' : ''
                } ${isSelectedDay ? 'selected' : ''}`}
                onClick={() => handleDateClick(date)}
              >
                <div className="day-number">{date.getDate()}</div>
                
                <div className="day-meetings">
                  {dayMeetings.slice(0, 3).map(meeting => (
                                         <div
                       key={meeting.id}
                       className={`meeting-item meeting-item--${meeting.priority.toLowerCase()}`}
                       style={{
                         borderLeftColor: getPriorityColor(meeting.priority),
                         backgroundColor: getStatusColor(meeting.status) + '20'
                       }}
                       onClick={(e) => handleMeetingClick(meeting, e)}
                       onMouseEnter={() => setHoveredMeeting(meeting.id)}
                       onMouseLeave={() => setHoveredMeeting(null)}
                     >
                       <div className="meeting-title">
                         {meeting.title}
                         {meeting.priority === 'Urgent' && (
                           <span className="urgent-badge">URGENT</span>
                         )}
                       </div>
                       <div className="meeting-time">
                         {new Date(meeting.startTime).toLocaleTimeString('en-US', {
                           hour: '2-digit',
                           minute: '2-digit'
                         })}
                       </div>
                      
                      {canEdit && hoveredMeeting === meeting.id && (
                        <div className="meeting-actions">
                          <button
                            className="meeting-action-btn edit-btn"
                            onClick={(e) => handleMeetingEdit(meeting, e)}
                            aria-label="Edit meeting"
                          >
                            ✏️
                          </button>
                          <button
                            className="meeting-action-btn delete-btn"
                            onClick={(e) => handleMeetingDelete(meeting.id, e)}
                            aria-label="Delete meeting"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {dayMeetings.length > 3 && (
                    <div className="more-meetings">
                      +{dayMeetings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meeting Details Tooltip */}
      {hoveredMeeting && (
        <div className="meeting-tooltip">
          {(() => {
            const meeting = meetingData.find(m => m.id === hoveredMeeting);
            if (!meeting) return null;
            
            return (
              <>
                <h4>{meeting.title}</h4>
                <p><strong>Time:</strong> {new Date(meeting.startTime).toLocaleString()}</p>
                <p><strong>Status:</strong> {meeting.status}</p>
                <p><strong>Priority:</strong> {meeting.priority}</p>
                <p><strong>Organizer:</strong> {meeting.organizer}</p>
                {meeting.location && <p><strong>Location:</strong> {meeting.location}</p>}
                {meeting.description && <p><strong>Description:</strong> {meeting.description}</p>}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default MeetingCalendar; 