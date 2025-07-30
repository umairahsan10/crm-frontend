import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './datepicker.css';

// Types for date formats
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM-DD-YYYY' | 'DD-MM-YYYY';

// Size variants
export type DatePickerSize = 'sm' | 'md' | 'lg';

// Theme variants
export type DatePickerTheme = 'light' | 'dark';

// Props interface
export interface DatePickerProps {
  /** Current selected date */
  value?: Date | null;
  /** Default date */
  defaultValue?: Date | null;
  /** Date format for display */
  format?: DateFormat;
  /** Placeholder text */
  placeholder?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Whether the datepicker is disabled */
  disabled?: boolean;
  /** Whether the datepicker is read-only */
  readOnly?: boolean;
  /** Whether to show the calendar popup */
  showCalendar?: boolean;
  /** Whether to allow clearing the date */
  clearable?: boolean;
  /** Whether to show today's date highlighted */
  highlightToday?: boolean;
  /** Whether to show week numbers */
  showWeekNumbers?: boolean;
  /** Whether to show time selection */
  showTime?: boolean;
  /** Whether to allow date range selection */
  range?: boolean;
  /** Range start date */
  rangeStart?: Date | null;
  /** Range end date */
  rangeEnd?: Date | null;
  
  // Display props
  /** Size variant */
  size?: DatePickerSize;
  /** Theme variant */
  theme?: DatePickerTheme;
  /** Whether to show the calendar icon */
  showIcon?: boolean;
  /** Custom calendar icon */
  icon?: React.ReactNode;
  
  // Customization props
  /** Custom CSS class name */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Custom CSS class for the input */
  inputClassName?: string;
  /** Custom CSS class for the calendar */
  calendarClassName?: string;
  
  // Event handlers
  /** Callback when date changes */
  onChange?: (date: Date | null) => void;
  /** Callback when date range changes */
  onRangeChange?: (start: Date | null, end: Date | null) => void;
  /** Callback when calendar opens */
  onOpen?: () => void;
  /** Callback when calendar closes */
  onClose?: () => void;
  /** Callback when input is focused */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Callback when input is blurred */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Callback when input value changes */
  onInputChange?: (value: string) => void;
  
  // Accessibility props
  /** ARIA label */
  'aria-label'?: string;
  /** ARIA described by */
  'aria-describedby'?: string;
  /** Input name attribute */
  name?: string;
  /** Input id attribute */
  id?: string;
  
  // Custom render props
  /** Custom render function for calendar header */
  renderHeader?: (date: Date, onPrevMonth: () => void, onNextMonth: () => void) => React.ReactNode;
  /** Custom render function for day cells */
  renderDay?: (date: Date, isSelected: boolean, isToday: boolean, isDisabled: boolean) => React.ReactNode;
  /** Custom render function for time input */
  renderTime?: (time: string, onChange: (time: string) => void) => React.ReactNode;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  defaultValue,
  format = 'MM/DD/YYYY',
  placeholder = 'Select date...',
  minDate,
  maxDate,
  disabled = false,
  readOnly = false,
  showCalendar = true,
  clearable = true,
  highlightToday = true,
  showWeekNumbers = false,
  showTime = false,
  range = false,
  rangeStart,
  rangeEnd,
  size = 'md',
  theme = 'light',
  showIcon = true,
  icon,
  className = '',
  style = {},
  inputClassName = '',
  calendarClassName = '',
  onChange,
  onRangeChange,
  onOpen,
  onClose,
  onFocus,
  onBlur,
  onInputChange,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  name,
  id,
  renderHeader,
  renderDay,
  renderTime
}) => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(value || defaultValue || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || defaultValue || null);
  const [inputValue, setInputValue] = useState<string>('');
  const [timeValue, setTimeValue] = useState<string>('12:00');
  const [rangeStartDate, setRangeStartDate] = useState<Date | null>(rangeStart || null);
  const [rangeEndDate, setRangeEndDate] = useState<Date | null>(rangeEnd || null);
  const [isSelectingRange, setIsSelectingRange] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Memoized values
  const currentYear = useMemo(() => currentDate.getFullYear(), [currentDate]);
  const currentMonth = useMemo(() => currentDate.getMonth(), [currentDate]);

  // Format date to string
  const formatDate = useCallback((date: Date, formatStr: DateFormat): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    switch (formatStr) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM-DD-YYYY':
        return `${month}-${day}-${year}`;
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`;
      default:
        return `${month}/${day}/${year}`;
    }
  }, []);

  // Parse date from string
  const parseDate = useCallback((dateStr: string, formatStr: DateFormat): Date | null => {
    if (!dateStr) return null;

    try {
      let day: string, month: string, year: string;

      switch (formatStr) {
        case 'MM/DD/YYYY':
          [, month, day, year] = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/) || [];
          break;
        case 'DD/MM/YYYY':
          [, day, month, year] = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/) || [];
          break;
        case 'YYYY-MM-DD':
          [, year, month, day] = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/) || [];
          break;
        case 'MM-DD-YYYY':
          [, month, day, year] = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/) || [];
          break;
        case 'DD-MM-YYYY':
          [, day, month, year] = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/) || [];
          break;
        default:
          return null;
      }

      if (day && month && year) {
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return isNaN(date.getTime()) ? null : date;
      }
    } catch (error) {
      console.warn('Failed to parse date:', dateStr);
    }

    return null;
  }, []);

  // Get calendar days for current month
  const getCalendarDays = useMemo(() => {
    const year = currentYear;
    const month = currentMonth;
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
  }, [currentYear, currentMonth]);

  // Check if date is disabled
  const isDateDisabled = useCallback((date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  }, [minDate, maxDate]);

  // Check if date is in range
  const isDateInRange = useCallback((date: Date): boolean => {
    if (!range || !rangeStartDate || !rangeEndDate) return false;
    return date >= rangeStartDate && date <= rangeEndDate;
  }, [range, rangeStartDate, rangeEndDate]);

  // Check if date is range start
  const isRangeStart = useCallback((date: Date): boolean => {
    if (!range || !rangeStartDate) return false;
    return date.toDateString() === rangeStartDate.toDateString();
  }, [range, rangeStartDate]);

  // Check if date is range end
  const isRangeEnd = useCallback((date: Date): boolean => {
    if (!range || !rangeEndDate) return false;
    return date.toDateString() === rangeEndDate.toDateString();
  }, [range, rangeEndDate]);

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    if (isDateDisabled(date)) return;

    if (range) {
      if (!isSelectingRange || !rangeStartDate) {
        setRangeStartDate(date);
        setRangeEndDate(null);
        setIsSelectingRange(true);
      } else {
        if (date < rangeStartDate) {
          setRangeEndDate(rangeStartDate);
          setRangeStartDate(date);
        } else {
          setRangeEndDate(date);
        }
        setIsSelectingRange(false);
        
        if (onRangeChange) {
          onRangeChange(rangeStartDate, date);
        }
      }
    } else {
      const newDate = new Date(date);
      if (showTime && timeValue) {
        const [hours, minutes] = timeValue.split(':').map(Number);
        newDate.setHours(hours, minutes, 0, 0);
      }
      
      setSelectedDate(newDate);
      setInputValue(formatDate(newDate, format));
      
      if (onChange) {
        onChange(newDate);
      }
      
      setIsOpen(false);
    }
  }, [range, isSelectingRange, rangeStartDate, showTime, timeValue, format, onChange, onRangeChange, isDateDisabled, formatDate]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (onInputChange) {
      onInputChange(value);
    }
  }, [onInputChange]);

  // Handle input blur
  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const parsedDate = parseDate(inputValue, format);
    if (parsedDate && !isDateDisabled(parsedDate)) {
      setSelectedDate(parsedDate);
      if (onChange) {
        onChange(parsedDate);
      }
    }
    
    if (onBlur) {
      onBlur(e);
    }
  }, [inputValue, format, parseDate, isDateDisabled, onChange, onBlur]);

  // Handle calendar toggle
  const handleCalendarToggle = useCallback(() => {
    if (disabled || readOnly) return;
    
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen && onOpen) {
      onOpen();
    } else if (!newIsOpen && onClose) {
      onClose();
    }
  }, [isOpen, disabled, readOnly, onOpen, onClose]);

  // Handle clear
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(null);
    setInputValue('');
    setRangeStartDate(null);
    setRangeEndDate(null);
    
    if (onChange) {
      onChange(null);
    }
    if (onRangeChange) {
      onRangeChange(null, null);
    }
  }, [onChange, onRangeChange]);

  // Handle previous month
  const handlePrevMonth = useCallback(() => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  }, [currentYear, currentMonth]);

  // Handle next month
  const handleNextMonth = useCallback(() => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  }, [currentYear, currentMonth]);

  // Handle time change
  const handleTimeChange = useCallback((time: string) => {
    setTimeValue(time);
    if (selectedDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      setSelectedDate(newDate);
      
      if (onChange) {
        onChange(newDate);
      }
    }
  }, [selectedDate, onChange]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onClose) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Update input value when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setInputValue(formatDate(selectedDate, format));
    }
  }, [selectedDate, format, formatDate]);

  // Update range dates when props change
  useEffect(() => {
    if (rangeStart !== undefined) {
      setRangeStartDate(rangeStart);
    }
    if (rangeEnd !== undefined) {
      setRangeEndDate(rangeEnd);
    }
  }, [rangeStart, rangeEnd]);

  // Default calendar icon
  const defaultIcon = useMemo(() => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
    </svg>
  ), []);

  // CSS classes
  const cssClasses = useMemo(() => {
    const baseClasses = ['datepicker'];
    if (size) baseClasses.push(`datepicker--${size}`);
    if (theme) baseClasses.push(`datepicker--${theme}`);
    if (disabled) baseClasses.push('datepicker--disabled');
    if (readOnly) baseClasses.push('datepicker--readonly');
    if (isOpen) baseClasses.push('datepicker--open');
    if (className) baseClasses.push(className);
    return baseClasses.filter(Boolean).join(' ');
  }, [size, theme, disabled, readOnly, isOpen, className]);

  // Get month name
  const getMonthName = useCallback((month: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  }, []);

  // Get day name
  const getDayName = useCallback((day: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  }, []);

  return (
    <div className={cssClasses} style={style}>
      {/* Input field */}
      <div className="datepicker__input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={onFocus}
          onBlur={handleInputBlur}
          onClick={handleCalendarToggle}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={`datepicker__input ${inputClassName}`}
          aria-label={ariaLabel || 'Date picker'}
          aria-describedby={ariaDescribedBy}
          name={name}
          id={id}
        />
        
        {/* Calendar icon */}
        {showIcon && (
          <button
            type="button"
            onClick={handleCalendarToggle}
            disabled={disabled || readOnly}
            className="datepicker__icon"
            aria-label="Open calendar"
          >
            {icon || defaultIcon}
          </button>
        )}
        
        {/* Clear button */}
        {clearable && (selectedDate || (range && (rangeStartDate || rangeEndDate))) && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled || readOnly}
            className="datepicker__clear"
            aria-label="Clear date"
          >
            ×
          </button>
        )}
      </div>

      {/* Calendar popup */}
      {isOpen && showCalendar && (
        <div ref={calendarRef} className={`datepicker__calendar ${calendarClassName}`}>
          {/* Calendar header */}
          <div className="datepicker__header">
            {renderHeader ? (
              renderHeader(currentDate, handlePrevMonth, handleNextMonth)
            ) : (
              <>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="datepicker__nav-button"
                  aria-label="Previous month"
                >
                  ‹
                </button>
                <div className="datepicker__current-month">
                  {getMonthName(currentMonth)} {currentYear}
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="datepicker__nav-button"
                  aria-label="Next month"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Calendar body */}
          <div className="datepicker__body">
            {/* Day headers */}
            <div className="datepicker__days-header">
              {showWeekNumbers && <div className="datepicker__week-number-header">Wk</div>}
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="datepicker__day-header">
                  {getDayName(i)}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="datepicker__days-grid">
              {getCalendarDays.map((date, index) => {
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                const isDisabled = isDateDisabled(date);
                const isInRange = isDateInRange(date);
                const isStart = isRangeStart(date);
                const isEnd = isRangeEnd(date);
                const isCurrentMonth = date.getMonth() === currentMonth;

                return (
                  <div
                    key={index}
                    className={`datepicker__day ${
                      isToday ? 'datepicker__day--today' : ''
                    } ${
                      isSelected ? 'datepicker__day--selected' : ''
                    } ${
                      isDisabled ? 'datepicker__day--disabled' : ''
                    } ${
                      isInRange ? 'datepicker__day--in-range' : ''
                    } ${
                      isStart ? 'datepicker__day--range-start' : ''
                    } ${
                      isEnd ? 'datepicker__day--range-end' : ''
                    } ${
                      !isCurrentMonth ? 'datepicker__day--other-month' : ''
                    }`}
                    onClick={() => handleDateSelect(date)}
                    role="button"
                    tabIndex={isDisabled ? -1 : 0}
                    aria-label={`${date.toDateString()}${isSelected ? ' (selected)' : ''}`}
                  >
                    {renderDay ? (
                      renderDay(date, !!isSelected, isToday, isDisabled)
                    ) : (
                      date.getDate()
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time picker */}
          {showTime && (
            <div className="datepicker__time">
              {renderTime ? (
                renderTime(timeValue, handleTimeChange)
              ) : (
                <input
                  type="time"
                  value={timeValue}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="datepicker__time-input"
                />
              )}
            </div>
          )}

          {/* Today button */}
          {highlightToday && (
            <div className="datepicker__footer">
              <button
                type="button"
                onClick={() => handleDateSelect(new Date())}
                className="datepicker__today-button"
              >
                Today
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker; 