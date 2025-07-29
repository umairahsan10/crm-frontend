import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './Dropdown.css';

// Option interface
export interface DropdownOption {
  value: string | number;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  [key: string]: any; // Allow additional custom properties
}

// Size variants
export type DropdownSize = 'sm' | 'md' | 'lg';

// Style variants
export type DropdownVariant = 'outlined' | 'filled' | 'bordered';

// Position variants
export type DropdownPosition = 'down' | 'up';

// Props interface
export interface DropdownProps {
  // Core props
  options: DropdownOption[];
  value?: string | number | null;
  placeholder?: string;
  disabled?: boolean;
  
  // Styling props
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  size?: DropdownSize;
  variant?: DropdownVariant;
  position?: DropdownPosition;
  
  // Behavior props
  searchable?: boolean;
  searchPlaceholder?: string;
  clearable?: boolean;
  multiple?: boolean;
  maxHeight?: string | number;
  autoClose?: boolean;
  
  // Loading and empty states
  loading?: boolean;
  loadingText?: string;
  noOptionsText?: string;
  
  // Custom render props
  renderTrigger?: (props: {
    isOpen: boolean;
    selectedOption: DropdownOption | null;
    placeholder: string;
    disabled: boolean;
  }) => React.ReactNode;
  renderOption?: (option: DropdownOption, props: {
    isSelected: boolean;
    isDisabled: boolean;
  }) => React.ReactNode;
  renderSelected?: (option: DropdownOption) => React.ReactNode;
  
  // Event handlers
  onSelect?: (value: string | number, option: DropdownOption) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onSearch?: (searchTerm: string) => void;
  onChange?: (value: string | number | null, option: DropdownOption | null) => void;
  
  // Accessibility
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  
  // Custom props
  [key: string]: any;
}

const Dropdown: React.FC<DropdownProps> = ({
  options = [],
  value = null,
  placeholder = 'Select an option...',
  disabled = false,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  optionClassName = '',
  size = 'md',
  variant = 'outlined',
  position = 'down',
  searchable = false,
  searchPlaceholder = 'Search...',
  clearable = false,
  multiple = false,
  maxHeight = 200,
  autoClose = true,
  loading = false,
  loadingText = 'Loading...',
  noOptionsText = 'No options available',
  renderTrigger,
  renderOption,
  renderSelected,
  onSelect,
  onOpen,
  onClose,
  onSearch,
  onChange,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...restProps
}) => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Memoized values
  const selectedOption = useMemo(() => {
    return options.find(option => option.value === value) || null;
  }, [options, value]);
  
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [options, searchTerm]);
  
  const visibleOptions = useMemo(() => {
    return filteredOptions.filter(option => !option.disabled);
  }, [filteredOptions]);
  
  // Event handlers
  const handleTriggerClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }, [disabled, isOpen]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen) {
          if (focusedIndex >= 0 && focusedIndex < visibleOptions.length) {
            handleOptionSelect(visibleOptions[focusedIndex]);
          }
        } else {
          openDropdown();
        }
        break;
        
      case 'Escape':
        closeDropdown();
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else {
          setFocusedIndex(prev => 
            prev < visibleOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : visibleOptions.length - 1
          );
        }
        break;
        
      case 'Tab':
        closeDropdown();
        break;
    }
  }, [disabled, isOpen, focusedIndex, visibleOptions]);
  
  const handleOptionClick = useCallback((option: DropdownOption) => {
    if (option.disabled) return;
    handleOptionSelect(option);
  }, []);
  
  const handleOptionSelect = useCallback((option: DropdownOption) => {
    if (onSelect) {
      onSelect(option.value, option);
    }
    if (onChange) {
      onChange(option.value, option);
    }
    
    if (autoClose && !multiple) {
      closeDropdown();
    }
  }, [onSelect, onChange, autoClose, multiple]);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setFocusedIndex(-1);
    
    if (onSearch) {
      onSearch(newSearchTerm);
    }
  }, [onSearch]);
  

  
  const openDropdown = useCallback(() => {
    setIsOpen(true);
    setFocusedIndex(-1);
    setSearchTerm('');
    
    if (onOpen) {
      onOpen();
    }
    
    // Focus search input if searchable
    setTimeout(() => {
      if (searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  }, [onOpen, searchable]);
  
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    setSearchTerm('');
    
    if (onClose) {
      onClose();
    }
  }, [onClose]);
  
  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, closeDropdown]);
  
  // Menu content render
  const renderMenuContent = () => {
    if (loading) {
      return (
        <div className="dropdown__loading">
          {loadingText}
        </div>
      );
    }
    
    if (filteredOptions.length === 0) {
      return (
        <div className="dropdown__no-options">
          {noOptionsText}
        </div>
      );
    }
    
    return (
      <>
        {searchable && (
          <div className="dropdown__search">
            <input
              ref={searchInputRef}
              type="text"
              className="dropdown__search-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        
        {visibleOptions.map((option, index) => {
          const isSelected = option.value === value;
          const isFocused = index === focusedIndex;
          
          return (
            <button
              key={option.value}
              type="button"
              className={`dropdown__option ${optionClassName} ${
                isSelected ? 'dropdown__option--selected' : ''
              } ${option.disabled ? 'dropdown__option--disabled' : ''} ${
                isFocused ? 'dropdown__option--focused' : ''
              }`}
              onClick={() => handleOptionClick(option)}
              disabled={option.disabled}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              {renderOption ? (
                renderOption(option, { isSelected, isDisabled: !!option.disabled })
              ) : (
                <div className="dropdown__option-content">
                  {option.icon && (
                    <span className="dropdown__option-icon">
                      {option.icon}
                    </span>
                  )}
                  <div className="dropdown__option-text">
                    <div>{option.label}</div>
                    {option.description && (
                      <div className="dropdown__option-description">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </>
    );
  };

  // Focus management
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && menuRef.current) {
      const optionElements = menuRef.current.querySelectorAll('.dropdown__option');
      const focusedElement = optionElements[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen, focusedIndex]);
  
  // Custom trigger render
  if (renderTrigger) {
    return (
      <div 
        ref={dropdownRef}
        className={`dropdown dropdown--${size} dropdown--${variant} ${className}`}
        {...restProps}
      >
        <div onClick={handleTriggerClick}>
          {renderTrigger({
            isOpen,
            selectedOption,
            placeholder,
            disabled
          })}
        </div>
        {isOpen && (
          <div 
            ref={menuRef}
            className={`dropdown__menu dropdown__menu--${position} ${menuClassName}`}
            style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
          >
            {renderMenuContent()}
          </div>
        )}
      </div>
    );
  }
  
  // Default trigger render
  const renderDefaultTrigger = () => (
    <button
      ref={triggerRef}
      type="button"
      className={`dropdown__trigger ${triggerClassName} ${
        isOpen ? 'dropdown__trigger--open' : ''
      } ${disabled ? 'dropdown__trigger--disabled' : ''}`}
      onClick={handleTriggerClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      id={id}
      name={name}
    >
      <span className="dropdown__trigger-content">
        {selectedOption ? (
          renderSelected ? (
            renderSelected(selectedOption)
          ) : (
            <span className="dropdown__selected-value">{selectedOption.label}</span>
          )
        ) : (
          <span className="dropdown__placeholder">{placeholder}</span>
        )}
      </span>
      
      <span className={`dropdown__icon ${isOpen ? 'dropdown__icon--open' : ''} ${disabled ? 'dropdown__icon--disabled' : ''}`}>
        ▼
      </span>
    </button>
  );
  

  
  return (
    <div 
      ref={dropdownRef}
      className={`dropdown dropdown--${size} dropdown--${variant} ${className}`}
      {...restProps}
    >
      {renderDefaultTrigger()}
      
      {isOpen && (
        <div 
          ref={menuRef}
          className={`dropdown__menu dropdown__menu--${position} dropdown__menu--open ${menuClassName}`}
          style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
        >
          {renderMenuContent()}
        </div>
      )}
    </div>
  );
};

export default Dropdown; 