import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import './SearchBar.css';

// Search bar size variants
export type SearchBarSize = 'sm' | 'md' | 'lg';

// Search bar theme variants
export type SearchBarTheme = 'light' | 'dark' | 'minimal';

// Search bar variant types
export type SearchBarVariant = 'default' | 'rounded' | 'pill' | 'outlined';

// Props interface
export interface SearchBarProps {
  /** Input value (for controlled component) */
  value?: string;
  /** Default input value (for uncontrolled component) */
  defaultValue?: string;
  /** Whether the component is controlled */
  controlled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the search bar is disabled */
  disabled?: boolean;
  /** Whether the search bar is read-only */
  readOnly?: boolean;
  /** Whether to show loading indicator */
  loading?: boolean;
  /** Whether to show clear button */
  showClearButton?: boolean;
  /** Whether to show search button */
  showSearchButton?: boolean;
  /** Whether to show dropdown results */
  showDropdown?: boolean;
  /** Whether to auto-focus the input */
  autoFocus?: boolean;
  /** Maximum length of input */
  maxLength?: number;
  /** Minimum length for search */
  minSearchLength?: number;
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
  /** Whether to search on input change */
  searchOnInput?: boolean;
  /** Whether to search on enter key */
  searchOnEnter?: boolean;
  /** Whether to search on clear */
  searchOnClear?: boolean;
  
  // Display props
  /** Size variant */
  size?: SearchBarSize;
  /** Theme variant */
  theme?: SearchBarTheme;
  /** Visual variant */
  variant?: SearchBarVariant;
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
  /** Custom CSS class for search button */
  searchButtonClassName?: string;
  /** Custom CSS class for clear button */
  clearButtonClassName?: string;
  /** Custom CSS class for dropdown */
  dropdownClassName?: string;
  /** Custom CSS class for loading indicator */
  loadingClassName?: string;
  
  // Event handlers
  /** Callback when input value changes */
  onChange?: (value: string) => void;
  /** Callback when search is triggered */
  onSearch?: (value: string) => void;
  /** Callback when input is cleared */
  onClear?: () => void;
  /** Callback when input focuses */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Callback when input blurs */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Callback when enter key is pressed */
  onEnter?: (value: string) => void;
  /** Callback when escape key is pressed */
  onEscape?: () => void;
  /** Callback when dropdown item is selected */
  onDropdownSelect?: (item: any) => void;
  
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
  /** Custom search icon */
  searchIcon?: React.ReactNode;
  /** Custom clear icon */
  clearIcon?: React.ReactNode;
  /** Custom loading indicator */
  loadingIndicator?: React.ReactNode;
  /** Custom render function for dropdown results */
  renderDropdown?: (results: any[], isLoading: boolean, onSelect: (item: any) => void) => React.ReactNode;
  /** Custom render function for no results */
  renderNoResults?: () => React.ReactNode;
  /** Custom render function for search button */
  renderSearchButton?: (onClick: () => void, disabled: boolean) => React.ReactNode;
  /** Custom render function for clear button */
  renderClearButton?: (onClick: () => void, disabled: boolean) => React.ReactNode;
  
  // Dropdown props
  /** Dropdown results */
  dropdownResults?: any[];
  /** Whether dropdown is loading */
  dropdownLoading?: boolean;
  /** Whether dropdown is visible */
  dropdownVisible?: boolean;
  /** Maximum dropdown height */
  dropdownMaxHeight?: string | number;
  /** Whether to highlight search term in results */
  highlightSearchTerm?: boolean;
  /** Search term for highlighting */
  searchTerm?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  defaultValue = '',
  controlled = false,
  placeholder = 'Search...',
  disabled = false,
  readOnly = false,
  loading = false,
  showClearButton = true,
  showSearchButton = true,
  showDropdown = false,
  autoFocus = false,
  maxLength,
  minSearchLength = 0,
  debounceDelay = 300,
  searchOnInput = true,
  searchOnEnter = true,
  searchOnClear = false,
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
  searchButtonClassName = '',
  clearButtonClassName = '',
  dropdownClassName = '',
  loadingClassName = '',
  onChange,
  onSearch,
  onClear,
  onFocus,
  onBlur,
  onEnter,
  onEscape,
  onDropdownSelect,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-live': ariaLive = 'polite',
  role = 'search',
  name,
  id,
  searchIcon,
  clearIcon,
  loadingIndicator,
  renderDropdown,
  renderNoResults,
  renderSearchButton,
  renderClearButton,
  dropdownResults = [],
  dropdownLoading = false,
  dropdownVisible = false,
  dropdownMaxHeight: _dropdownMaxHeight = '300px',
  highlightSearchTerm: _highlightSearchTerm = false,
  searchTerm: _searchTerm
}) => {
  // State
  const [inputValue, setInputValue] = useState(controlled ? value || '' : defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(dropdownVisible);
  const [_debouncedValue, setDebouncedValue] = useState('');

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<number | null>(null);

  // Update input value when controlled value changes
  useEffect(() => {
    if (controlled && value !== undefined) {
      setInputValue(value);
    }
  }, [controlled, value]);

  // Update dropdown visibility when prop changes
  useEffect(() => {
    setIsDropdownVisible(dropdownVisible);
  }, [dropdownVisible]);

  // Debounced search effect
  useEffect(() => {
    if (debounceDelay > 0 && searchOnInput) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = window.setTimeout(() => {
        setDebouncedValue(inputValue);
        if (inputValue.length >= minSearchLength && onSearch) {
          onSearch(inputValue);
        }
      }, debounceDelay);

      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
      };
    }
  }, [inputValue, debounceDelay, searchOnInput, minSearchLength, onSearch]);

  // Handle input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    if (controlled) {
      onChange?.(newValue);
    } else {
      setInputValue(newValue);
      onChange?.(newValue);
    }

    // Immediate search if no debounce
    if (debounceDelay === 0 && searchOnInput && newValue.length >= minSearchLength && onSearch) {
      onSearch(newValue);
    }
  }, [controlled, onChange, debounceDelay, searchOnInput, minSearchLength, onSearch]);

  // Handle search button click
  const handleSearchClick = useCallback(() => {
    if (disabled || readOnly) return;
    
    if (onSearch) {
      onSearch(inputValue);
    }
    
    inputRef.current?.focus();
  }, [disabled, readOnly, inputValue, onSearch]);

  // Handle clear button click
  const handleClearClick = useCallback(() => {
    if (disabled || readOnly) return;

    const newValue = '';
    
    if (controlled) {
      onChange?.(newValue);
    } else {
      setInputValue(newValue);
      onChange?.(newValue);
    }

    onClear?.();
    
    if (searchOnClear && onSearch) {
      onSearch(newValue);
    }
    
    inputRef.current?.focus();
  }, [disabled, readOnly, controlled, onChange, onClear, searchOnClear, onSearch]);

  // Handle input focus
  const handleInputFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setIsDropdownVisible(true);
    onFocus?.(event);
  }, [onFocus]);

  // Handle input blur
  const handleInputBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      setIsFocused(false);
      setIsDropdownVisible(false);
    }, 200);
    onBlur?.(event);
  }, [onBlur]);

  // Handle key down
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchOnEnter) {
      event.preventDefault();
      if (onEnter) {
        onEnter(inputValue);
      } else if (onSearch) {
        onSearch(inputValue);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onEscape?.();
      setIsDropdownVisible(false);
      inputRef.current?.blur();
    }
  }, [searchOnEnter, onEnter, onSearch, inputValue, onEscape]);

  // Handle dropdown item selection
  const handleDropdownSelect = useCallback((item: any) => {
    onDropdownSelect?.(item);
    setIsDropdownVisible(false);
    inputRef.current?.blur();
  }, [onDropdownSelect]);

  // CSS classes
  const cssClasses = useMemo(() => {
    const baseClasses = ['search-bar'];
    if (size) baseClasses.push(`search-bar--${size}`);
    if (theme) baseClasses.push(`search-bar--${theme}`);
    if (variant) baseClasses.push(`search-bar--${variant}`);
    if (bordered) baseClasses.push('search-bar--bordered');
    if (showFocusRing) baseClasses.push('search-bar--focus-ring');
    if (shadowed) baseClasses.push('search-bar--shadowed');
    if (backgrounded) baseClasses.push('search-bar--backgrounded');
    if (disabled) baseClasses.push('search-bar--disabled');
    if (readOnly) baseClasses.push('search-bar--readonly');
    if (isFocused) baseClasses.push('search-bar--focused');
    if (loading) baseClasses.push('search-bar--loading');
    if (className) baseClasses.push(className);
    return baseClasses.filter(Boolean).join(' ');
  }, [size, theme, variant, bordered, showFocusRing, shadowed, backgrounded, disabled, readOnly, isFocused, loading, className]);

  // Default search icon
  const defaultSearchIcon = useMemo(() => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ), []);

  // Default clear icon
  const defaultClearIcon = useMemo(() => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ), []);

  // Default loading indicator
  const defaultLoadingIndicator = useMemo(() => (
    <div className={`search-bar__loading ${loadingClassName}`}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="search-bar__loading-spinner"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  ), [loadingClassName]);

  // Default search button
  const defaultSearchButton = useCallback((onClick: () => void, disabled: boolean) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`search-bar__search-button ${searchButtonClassName}`}
      aria-label="Search"
    >
      {searchIcon || defaultSearchIcon}
    </button>
  ), [searchIcon, defaultSearchIcon, searchButtonClassName]);

  // Default clear button
  const defaultClearButton = useCallback((onClick: () => void, disabled: boolean) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`search-bar__clear-button ${clearButtonClassName}`}
      aria-label="Clear search"
    >
      {clearIcon || defaultClearIcon}
    </button>
  ), [clearIcon, defaultClearIcon, clearButtonClassName]);

  // Default dropdown
  const defaultDropdown = useCallback((results: any[], isLoading: boolean, onSelect: (item: any) => void) => {
    if (isLoading) {
      return (
        <div className={`search-bar__dropdown ${dropdownClassName}`}>
          <div className="search-bar__dropdown-loading">
            {loadingIndicator || defaultLoadingIndicator}
            <span>Searching...</span>
          </div>
        </div>
      );
    }

    if (results.length === 0) {
      return renderNoResults ? renderNoResults() : (
        <div className={`search-bar__dropdown ${dropdownClassName}`}>
          <div className="search-bar__dropdown-empty">
            No results found
          </div>
        </div>
      );
    }

    return (
      <div className={`search-bar__dropdown ${dropdownClassName}`}>
        {results.map((item, index) => (
          <div
            key={index}
            className="search-bar__dropdown-item"
            onClick={() => onSelect(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(item);
              }
            }}
          >
            {typeof item === 'string' ? item : item.label || item.name || JSON.stringify(item)}
          </div>
        ))}
      </div>
    );
  }, [dropdownClassName, loadingIndicator, defaultLoadingIndicator, renderNoResults]);

  // Container styles
  const containerStyles = useMemo(() => {
    const styles: React.CSSProperties = { ...style };
    return styles;
  }, [style]);

  return (
    <div className={cssClasses} style={containerStyles} role={role}>
      <div className="search-bar__container">
        {/* Search icon */}
        <div className="search-bar__search-icon">
          {searchIcon || defaultSearchIcon}
        </div>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={controlled ? value || '' : inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          autoFocus={autoFocus}
          name={name}
          id={id}
          className={`search-bar__input ${inputClassName}`}
          aria-label={ariaLabel || 'Search'}
          aria-describedby={ariaDescribedBy}
          aria-live={ariaLive}
          aria-autocomplete="list"
          aria-expanded={isDropdownVisible}
          aria-haspopup="listbox"
          role="combobox"
          tabIndex={disabled || readOnly ? -1 : 0}
        />

        {/* Loading indicator */}
        {loading && (
          <div className="search-bar__loading-container">
            {loadingIndicator || defaultLoadingIndicator}
          </div>
        )}

        {/* Clear button */}
        {showClearButton && inputValue && !disabled && !readOnly && (
          renderClearButton 
            ? renderClearButton(handleClearClick, false)
            : defaultClearButton(handleClearClick, false)
        )}

        {/* Search button */}
        {showSearchButton && (
          renderSearchButton 
            ? renderSearchButton(handleSearchClick, disabled || readOnly)
            : defaultSearchButton(handleSearchClick, disabled || readOnly)
        )}
      </div>

      {/* Dropdown results */}
      {showDropdown && isDropdownVisible && (dropdownResults.length > 0 || dropdownLoading) && (
        renderDropdown 
          ? renderDropdown(dropdownResults, dropdownLoading, handleDropdownSelect)
          : defaultDropdown(dropdownResults, dropdownLoading, handleDropdownSelect)
      )}
    </div>
  );
};

export default SearchBar; 