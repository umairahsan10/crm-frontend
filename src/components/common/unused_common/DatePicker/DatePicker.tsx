import React, { useState, useEffect, useRef, useCallback } from 'react';
import './DatePicker.css';

interface DatePickerProps {
  value?: Date | null;
  placeholder?: string;
  onChange?: (date: Date | null) => void;
  disabled?: boolean;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  placeholder = 'Select Date',
  onChange,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const [inputValue, setInputValue] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Format date for display
  const formatDate = useCallback((date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }, []);

  // Get calendar days for current month
  const getCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    const current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setInputValue(formatDate(date));
    setIsOpen(false);
    onChange?.(date);
  }, [formatDate, onChange]);

  // Handle input click
  const handleInputClick = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }, [disabled, isOpen]);

  // Handle previous month
  const handlePrevMonth = useCallback(() => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }, [currentDate]);

  // Handle next month
  const handleNextMonth = useCallback(() => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }, [currentDate]);

  // Handle today button
  const handleToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    handleDateSelect(today);
  }, [handleDateSelect]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Update input value when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setInputValue(formatDate(selectedDate));
    } else {
      setInputValue('');
    }
  }, [selectedDate, formatDate]);

  // Update when value prop changes
  useEffect(() => {
    setSelectedDate(value || null);
  }, [value]);

  // Get month name
  const getMonthName = (month: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  };

  // Get day name
  const getDayName = (day: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  const calendarDays = getCalendarDays();

  return (
    <div className={`datepicker ${className}`}>
      {/* Input Field */}
      <div className="datepicker-input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          placeholder={placeholder}
          onClick={handleInputClick}
          readOnly
          disabled={disabled}
          className="datepicker-input"
        />
        <button
          type="button"
          onClick={handleInputClick}
          disabled={disabled}
          className="datepicker-icon"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
        </button>
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div ref={calendarRef} className="datepicker-calendar">
          {/* Calendar Header */}
          <div className="calendar-header">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="calendar-nav-button"
              aria-label="Previous month"
            >
              ‹
            </button>
            <div className="calendar-month-year">
              {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="calendar-nav-button"
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          {/* Calendar Body */}
          <div className="calendar-body">
            {/* Day Headers */}
            <div className="calendar-days-header">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="calendar-day-header">
                  {getDayName(i)}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="calendar-days-grid">
              {calendarDays.map((date, index) => {
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    className={`calendar-day ${
                      isToday ? 'calendar-day-today' : ''
                    } ${
                      isSelected ? 'calendar-day-selected' : ''
                    } ${
                      !isCurrentMonth ? 'calendar-day-other-month' : ''
                    }`}
                    disabled={!isCurrentMonth}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar Footer */}
          <div className="calendar-footer">
            <button
              type="button"
              onClick={handleToday}
              className="calendar-today-button"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker; 