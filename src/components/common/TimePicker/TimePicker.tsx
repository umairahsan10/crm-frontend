import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import './TimePicker.css';

// Time format variants
export type TimeFormat = '12h' | '24h';

// Time picker size variants
export type TimePickerSize = 'sm' | 'md' | 'lg';

// Time picker theme variants
export type TimePickerTheme = 'light' | 'dark' | 'primary' | 'secondary' | 'minimal';

// Time picker variant types
export type TimePickerVariant = 'default' | 'outlined' | 'filled' | 'borderless';

// Time interface
export interface Time {
  hours: number;
  minutes: number;
  seconds?: number;
  period?: 'AM' | 'PM';
}

// Props interface
export interface TimePickerProps {
  /** Current time value (for controlled component) */
  value?: Time | string;
  /** Default time value (for uncontrolled component) */
  defaultValue?: Time | string;
  /** Whether the component is controlled */
  controlled?: boolean;
  /** Time format (12h or 24h) */
  format?: TimeFormat;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the time picker is disabled */
  disabled?: boolean;
  /** Whether the time picker is read-only */
  readOnly?: boolean;
  /** Whether to show seconds */
  showSeconds?: boolean;
  /** Whether to show period (AM/PM) for 12h format */
  showPeriod?: boolean;
  /** Step interval in minutes */
  step?: number;
  /** Minimum selectable time */
  minTime?: Time | string;
  /** Maximum selectable time */
  maxTime?: Time | string;
  /** Whether to show clear button */
  showClearButton?: boolean;
  /** Whether to show now button */
  showNowButton?: boolean;
  /** Whether to auto-focus the input */
  autoFocus?: boolean;
  /** Whether to show time picker dropdown */
  showDropdown?: boolean;
  /** Whether to close dropdown on selection */
  closeOnSelect?: boolean;
  /** Whether to show time validation */
  showValidation?: boolean;
  /** Whether to allow manual input */
  allowManualInput?: boolean;
  /** Whether to show time format hint */
  showFormatHint?: boolean;
  /** Whether to show time zone */
  showTimeZone?: boolean;
  /** Time zone to display */
  timeZone?: string;
  
  // Display props
  /** Size variant */
  size?: TimePickerSize;
  /** Theme variant */
  theme?: TimePickerTheme;
  /** Visual variant */
  variant?: TimePickerVariant;
  /** Whether to show border */
  bordered?: boolean;
  /** Whether to show focus ring */
  showFocusRing?: boolean;
  /** Whether to show shadow */
  shadowed?: boolean;
  /** Whether to show background */
  backgrounded?: boolean;
  
  // Customization props
  /** Custom CSS class name */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Custom CSS class for input */
  inputClassName?: string;
  /** Custom CSS class for dropdown */
  dropdownClassName?: string;
  /** Custom CSS class for time option */
  timeOptionClassName?: string;
  /** Custom CSS class for clear button */
  clearButtonClassName?: string;
  /** Custom CSS class for now button */
  nowButtonClassName?: string;
  
  // Event handlers
  /** Callback when time changes */
  onChange?: (time: Time, timeString: string) => void;
  /** Callback when input value changes */
  onInputChange?: (value: string) => void;
  /** Callback when dropdown opens */
  onOpen?: () => void;
  /** Callback when dropdown closes */
  onClose?: () => void;
  /** Callback when input focuses */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Callback when input blurs */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Callback when time is cleared */
  onClear?: () => void;
  /** Callback when now button is clicked */
  onNow?: () => void;
  /** Callback when validation fails */
  onValidationError?: (error: string) => void;
  
  // Accessibility props
  /** ARIA label */
  'aria-label'?: string;
  /** ARIA described by */
  'aria-describedby'?: string;
  /** ARIA live region */
  'aria-live'?: 'polite' | 'assertive' | 'off';
  /** Role attribute */
  role?: string;
  /** Input name attribute */
  name?: string;
  /** Input id attribute */
  id?: string;
  
  // Custom render props
  /** Custom time icon */
  timeIcon?: React.ReactNode;
  /** Custom clear icon */
  clearIcon?: React.ReactNode;
  /** Custom now icon */
  nowIcon?: React.ReactNode;
  /** Custom render function for time option */
  renderTimeOption?: (time: Time, timeString: string, isSelected: boolean) => React.ReactNode;
  /** Custom render function for dropdown header */
  renderDropdownHeader?: () => React.ReactNode;
  /** Custom render function for dropdown footer */
  renderDropdownFooter?: () => React.ReactNode;
  /** Custom render function for clear button */
  renderClearButton?: (onClear: () => void) => React.ReactNode;
  /** Custom render function for now button */
  renderNowButton?: (onNow: () => void) => React.ReactNode;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value: propValue,
  defaultValue,
  controlled = false,
  format = '24h',
  placeholder = 'Select time',
  disabled = false,
  readOnly = false,
  showSeconds = false,
  showPeriod = true,
  step = 15,
  minTime,
  maxTime,
  showClearButton = false,
  showNowButton = false,
  autoFocus = false,
  showDropdown = true,
  closeOnSelect = true,
  showValidation = true,
  allowManualInput = true,
  showFormatHint = false,
  showTimeZone: _showTimeZone = false,
  timeZone: _timeZone = 'local',
  size = 'md',
  theme = 'light',
  variant = 'default',
  bordered = true,
  showFocusRing = true,
  shadowed = false,
  backgrounded = true,
  className = '',
  style = {},
  inputClassName = '',
  dropdownClassName = '',
  timeOptionClassName = '',
  clearButtonClassName = '',
  nowButtonClassName = '',
  onChange,
  onInputChange,
  onOpen,
  onClose,
  onFocus,
  onBlur,
  onClear,
  onNow,
  onValidationError,
  'aria-label': ariaLabel = 'Time picker',
  'aria-describedby': ariaDescribedBy,
  'aria-live': ariaLive = 'polite',
  role = 'combobox',
  name,
  id,
  timeIcon,
  clearIcon,
  nowIcon,
  renderTimeOption,
  renderDropdownHeader,
  renderDropdownFooter,
  renderClearButton,
  renderNowButton
}) => {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedTime, setSelectedTime] = useState<Time | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse time string to Time object
  const parseTime = useCallback((timeString: string): Time | null => {
    if (!timeString) return null;

    // Handle 24h format (HH:MM or HH:MM:SS)
    const time24Regex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9]))?$/;
    const time24Match = timeString.match(time24Regex);
    
    if (time24Match) {
      const hours = parseInt(time24Match[1], 10);
      const minutes = parseInt(time24Match[2], 10);
      const seconds = time24Match[4] ? parseInt(time24Match[4], 10) : 0;
      
      return { hours, minutes, seconds };
    }

    // Handle 12h format (HH:MM AM/PM or HH:MM:SS AM/PM)
    const time12Regex = /^([0-9]|1[0-2]):([0-5][0-9])(:([0-5][0-9]))?\s?(AM|PM|am|pm)$/;
    const time12Match = timeString.match(time12Regex);
    
    if (time12Match) {
      let hours = parseInt(time12Match[1], 10);
      const minutes = parseInt(time12Match[2], 10);
      const seconds = time12Match[4] ? parseInt(time12Match[4], 10) : 0;
      const period = time12Match[5]?.toUpperCase() as 'AM' | 'PM';
      
      // Convert 12h to 24h
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return { hours, minutes, seconds, period };
    }

    return null;
  }, []);

  // Format Time object to string
  const formatTime = useCallback((time: Time): string => {
    if (!time) return '';

    let { hours, minutes, seconds = 0, period } = time;

    if (format === '12h') {
      // Convert 24h to 12h
      if (hours === 0) {
        hours = 12;
        period = 'AM';
      } else if (hours === 12) {
        period = 'PM';
      } else if (hours > 12) {
        hours -= 12;
        period = 'PM';
      } else {
        period = 'AM';
      }

      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const secondsString = showSeconds ? `:${seconds.toString().padStart(2, '0')}` : '';
      const periodString = showPeriod ? ` ${period}` : '';
      
      return `${timeString}${secondsString}${periodString}`;
    } else {
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const secondsString = showSeconds ? `:${seconds.toString().padStart(2, '0')}` : '';
      
      return `${timeString}${secondsString}`;
    }
  }, [format, showSeconds, showPeriod]);

  // Initialize time value
  useEffect(() => {
    let initialTime: Time | null = null;

    if (controlled && propValue) {
      if (typeof propValue === 'string') {
        initialTime = parseTime(propValue);
      } else {
        initialTime = propValue;
      }
    } else if (defaultValue) {
      if (typeof defaultValue === 'string') {
        initialTime = parseTime(defaultValue);
      } else {
        initialTime = defaultValue;
      }
    }

    if (initialTime) {
      setSelectedTime(initialTime);
      setInputValue(formatTime(initialTime));
    }
  }, [controlled, propValue, defaultValue, parseTime, formatTime]);

  // Update when controlled value changes
  useEffect(() => {
    if (controlled && propValue) {
      let time: Time | null = null;
      
      if (typeof propValue === 'string') {
        time = parseTime(propValue);
      } else {
        time = propValue;
      }

      if (time) {
        setSelectedTime(time);
        setInputValue(formatTime(time));
      }
    }
  }, [controlled, propValue, parseTime, formatTime]);

  // Generate time options based on step
  const timeOptions = useMemo(() => {
    const options: Time[] = [];
    const totalMinutes = 24 * 60;
    
    for (let minutes = 0; minutes < totalMinutes; minutes += step) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      
      const time: Time = { hours, minutes: mins };
      
      // Apply min/max constraints
      if (minTime) {
        const min = typeof minTime === 'string' ? parseTime(minTime) : minTime;
        if (min && (hours < min.hours || (hours === min.hours && mins < min.minutes))) {
          continue;
        }
      }
      
      if (maxTime) {
        const max = typeof maxTime === 'string' ? parseTime(maxTime) : maxTime;
        if (max && (hours > max.hours || (hours === max.hours && mins > max.minutes))) {
          continue;
        }
      }
      
      options.push(time);
    }
    
    return options;
  }, [step, minTime, maxTime, parseTime]);

  // Handle time selection
  const handleTimeSelect = useCallback((time: Time) => {
    const timeString = formatTime(time);
    
    setSelectedTime(time);
    setInputValue(timeString);
    setValidationError('');
    
    if (!controlled) {
      onChange?.(time, timeString);
    }
    
    if (closeOnSelect) {
      setIsOpen(false);
      onClose?.();
    }
  }, [formatTime, controlled, onChange, closeOnSelect, onClose]);

  // Handle input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    onInputChange?.(value);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  }, [onInputChange, validationError]);

  // Handle input blur with validation
  const handleInputBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    if (value && allowManualInput) {
      const parsedTime = parseTime(value);
      
      if (parsedTime) {
        // Validate against min/max constraints
        let isValid = true;
        let errorMessage = '';
        
        if (minTime) {
          const min = typeof minTime === 'string' ? parseTime(minTime) : minTime;
          if (min && (parsedTime.hours < min.hours || (parsedTime.hours === min.hours && parsedTime.minutes < min.minutes))) {
            isValid = false;
            errorMessage = `Time must be after ${formatTime(min)}`;
          }
        }
        
        if (maxTime && isValid) {
          const max = typeof maxTime === 'string' ? parseTime(maxTime) : maxTime;
          if (max && (parsedTime.hours > max.hours || (parsedTime.hours === max.hours && parsedTime.minutes > max.minutes))) {
            isValid = false;
            errorMessage = `Time must be before ${formatTime(max)}`;
          }
        }
        
        if (isValid) {
          handleTimeSelect(parsedTime);
        } else {
          setValidationError(errorMessage);
          onValidationError?.(errorMessage);
        }
      } else {
        setValidationError('Invalid time format');
        onValidationError?.('Invalid time format');
      }
    }
    
    onBlur?.(event);
  }, [allowManualInput, parseTime, minTime, maxTime, formatTime, handleTimeSelect, onValidationError, onBlur]);

  // Handle dropdown toggle
  const handleDropdownToggle = useCallback(() => {
    if (disabled || readOnly) return;
    
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [disabled, readOnly, isOpen, onOpen, onClose]);

  // Handle clear
  const handleClear = useCallback(() => {
    setSelectedTime(null);
    setInputValue('');
    setValidationError('');
    
    if (!controlled) {
      onChange?.({ hours: 0, minutes: 0 }, '');
    }
    
    onClear?.();
    inputRef.current?.focus();
  }, [controlled, onChange, onClear]);

  // Handle now button
  const handleNow = useCallback(() => {
    const now = new Date();
    const time: Time = {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: showSeconds ? now.getSeconds() : 0
    };
    
    handleTimeSelect(time);
    onNow?.();
  }, [handleTimeSelect, showSeconds, onNow]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // CSS classes
  const containerClasses = useMemo(() => {
    const baseClasses = ['time-picker'];
    if (size) baseClasses.push(`time-picker--${size}`);
    if (theme) baseClasses.push(`time-picker--${theme}`);
    if (variant) baseClasses.push(`time-picker--${variant}`);
    if (bordered) baseClasses.push('time-picker--bordered');
    if (shadowed) baseClasses.push('time-picker--shadowed');
    if (backgrounded) baseClasses.push('time-picker--backgrounded');
    if (showFocusRing) baseClasses.push('time-picker--focus-ring');
    if (disabled) baseClasses.push('time-picker--disabled');
    if (readOnly) baseClasses.push('time-picker--readonly');
    if (validationError) baseClasses.push('time-picker--error');
    if (isOpen) baseClasses.push('time-picker--open');
    if (className) baseClasses.push(className);
    return baseClasses.filter(Boolean).join(' ');
  }, [size, theme, variant, bordered, shadowed, backgrounded, showFocusRing, disabled, readOnly, validationError, isOpen, className]);

  const inputClasses = useMemo(() => {
    const baseClasses = ['time-picker__input'];
    if (inputClassName) baseClasses.push(inputClassName);
    return baseClasses.filter(Boolean).join(' ');
  }, [inputClassName]);

  const dropdownClasses = useMemo(() => {
    const baseClasses = ['time-picker__dropdown'];
    if (dropdownClassName) baseClasses.push(dropdownClassName);
    return baseClasses.filter(Boolean).join(' ');
  }, [dropdownClassName]);

  // Default icons
  const defaultTimeIcon = useMemo(() => {
    return timeIcon || (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12,6 12,12 16,14"/>
      </svg>
    );
  }, [timeIcon]);

  const defaultClearIcon = useMemo(() => {
    return clearIcon || '×';
  }, [clearIcon]);

  const defaultNowIcon = useMemo(() => {
    return nowIcon || (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12,6 12,12 16,14"/>
      </svg>
    );
  }, [nowIcon]);

  // Default renderers
  const defaultTimeOptionRenderer = useCallback((time: Time, timeString: string, isSelected: boolean) => {
    const optionClasses = [
      'time-picker__option',
      isSelected ? 'time-picker__option--selected' : '',
      timeOptionClassName
    ].filter(Boolean).join(' ');

    return (
      <div
        key={timeString}
        className={optionClasses}
        onClick={() => handleTimeSelect(time)}
        role="option"
        aria-selected={isSelected}
      >
        {timeString}
      </div>
    );
  }, [handleTimeSelect, timeOptionClassName]);

  const defaultClearButtonRenderer = useCallback((onClear: () => void) => {
    return (
      <button
        type="button"
        className={`time-picker__clear-button ${clearButtonClassName}`}
        onClick={onClear}
        aria-label="Clear time"
        title="Clear time"
      >
        {defaultClearIcon}
      </button>
    );
  }, [defaultClearIcon, clearButtonClassName]);

  const defaultNowButtonRenderer = useCallback((onNow: () => void) => {
    return (
      <button
        type="button"
        className={`time-picker__now-button ${nowButtonClassName}`}
        onClick={onNow}
        aria-label="Set to current time"
        title="Set to current time"
      >
        {defaultNowIcon}
        <span>Now</span>
      </button>
    );
  }, [defaultNowIcon, nowButtonClassName]);

  return (
    <div className={containerClasses} style={style} ref={dropdownRef}>
      <div className="time-picker__input-container">
        <div className="time-picker__icon">
          {defaultTimeIcon}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          className={inputClasses}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={onFocus}
          onBlur={handleInputBlur}
          onClick={handleDropdownToggle}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={autoFocus}
          name={name}
          id={id}
          role={role}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-live={ariaLive}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-haspopup="listbox"
        />
        
        {showClearButton && selectedTime && (
          renderClearButton ? renderClearButton(handleClear) : defaultClearButtonRenderer(handleClear)
        )}
        
        <button
          type="button"
          className="time-picker__toggle"
          onClick={handleDropdownToggle}
          disabled={disabled || readOnly}
          aria-label="Open time picker"
          aria-expanded={isOpen}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </button>
      </div>
      
      {validationError && showValidation && (
        <div className="time-picker__error">
          {validationError}
        </div>
      )}
      
      {showFormatHint && (
        <div className="time-picker__hint">
          Format: {format === '12h' ? 'HH:MM AM/PM' : 'HH:MM'}
        </div>
      )}
      
      {isOpen && showDropdown && (
        <div className={dropdownClasses} role="listbox">
          {renderDropdownHeader?.()}
          
          <div className="time-picker__options">
            {timeOptions.map((time) => {
              const timeString = formatTime(time);
              const isSelected = selectedTime && 
                selectedTime.hours === time.hours && 
                selectedTime.minutes === time.minutes;
              
              return renderTimeOption ? 
                renderTimeOption(time, timeString, !!isSelected) : 
                defaultTimeOptionRenderer(time, timeString, !!isSelected);
            })}
          </div>
          
          {showNowButton && (
            renderNowButton ? renderNowButton(handleNow) : defaultNowButtonRenderer(handleNow)
          )}
          
          {renderDropdownFooter?.()}
        </div>
      )}
    </div>
  );
};

export default TimePicker; 