import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './FilterBar.css';

// Types
export type FilterType = 'text' | 'select' | 'checkbox' | 'radio' | 'slider' | 'date' | 'button' | 'custom';
export type FilterLayout = 'vertical' | 'horizontal' | 'grid';
export type FilterSize = 'sm' | 'md' | 'lg';
export type FilterTheme = 'default' | 'minimal' | 'dark';
export type FilterActionType = 'primary' | 'secondary' | 'danger';

export interface FilterOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: string;
  color?: string;
}

export interface FilterItem {
  id: string;
  type: FilterType;
  label: string;
  key: string;
  placeholder?: string;
  options?: FilterOption[];
  defaultValue?: any;
  value?: any;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  layout?: 'vertical' | 'horizontal';
  className?: string;
  style?: React.CSSProperties;
  renderCustom?: (props: FilterItemProps) => React.ReactNode;
  validation?: (value: any) => string | null;
  transform?: (value: any) => any;
}

export interface FilterItemProps {
  item: FilterItem;
  value: any;
  onChange: (value: any) => void;
  disabled: boolean;
}

export interface FilterAction {
  id: string;
  label: string;
  type?: FilterActionType;
  icon?: string;
  disabled?: boolean;
  onClick: () => void;
}

export interface FilterBarProps {
  // Basic props
  title?: string;
  subtitle?: string;
  filters: FilterItem[];
  layout?: FilterLayout;
  size?: FilterSize;
  theme?: FilterTheme;
  className?: string;
  style?: React.CSSProperties;
  
  // State management
  defaultValues?: Record<string, any>;
  values?: Record<string, any>;
  controlled?: boolean;
  
  // Actions
  actions?: FilterAction[];
  showReset?: boolean;
  showSubmit?: boolean;
  showActiveFilters?: boolean;
  
  // Event handlers
  onChange?: (values: Record<string, any>, changedKey: string) => void;
  onReset?: () => void;
  onSubmit?: (values: Record<string, any>) => void;
  onFilterChange?: (filterId: string, value: any) => void;
  
  // Loading and error states
  loading?: boolean;
  error?: string;
  
  // Customization
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  showCount?: boolean;
  maxVisibleFilters?: number;
  
  // URL integration
  syncWithUrl?: boolean;
  urlParamPrefix?: string;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  title,
  subtitle,
  filters,
  layout = 'vertical',
  size = 'md',
  theme = 'default',
  className = '',
  style = {},
  
  defaultValues = {},
  values,
  controlled = false,
  
  actions = [],
  showReset = true,
  showSubmit = true,
  showActiveFilters = true,
  
  onChange,
  onReset,
  onSubmit,
  onFilterChange,
  
  loading = false,
  error,
  
  collapsible = false,
  defaultCollapsed = false,
  showCount = false,
  maxVisibleFilters,
  
  syncWithUrl = false,
  urlParamPrefix = 'filter_',
  
  ariaLabel,
  ariaDescribedBy
}) => {
  // State management
  const [internalValues, setInternalValues] = useState<Record<string, any>>(defaultValues);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [visibleFilters, setVisibleFilters] = useState<number | undefined>(maxVisibleFilters);

  // Use controlled or uncontrolled values
  const currentValues = controlled ? (values || {}) : internalValues;

  // URL sync effect
  useEffect(() => {
    if (syncWithUrl) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlValues: Record<string, any> = {};
      
      filters.forEach(filter => {
        const paramKey = `${urlParamPrefix}${filter.key}`;
        const paramValue = urlParams.get(paramKey);
        if (paramValue !== null) {
          try {
            urlValues[filter.key] = JSON.parse(paramValue);
          } catch {
            urlValues[filter.key] = paramValue;
          }
        }
      });
      
      if (Object.keys(urlValues).length > 0) {
        setInternalValues(prev => ({ ...prev, ...urlValues }));
      }
    }
  }, [syncWithUrl, urlParamPrefix, filters]);

  // Update URL when values change
  useEffect(() => {
    if (syncWithUrl) {
      const urlParams = new URLSearchParams(window.location.search);
      
      Object.entries(currentValues).forEach(([key, value]) => {
        const paramKey = `${urlParamPrefix}${key}`;
        if (value !== undefined && value !== null && value !== '') {
          urlParams.set(paramKey, JSON.stringify(value));
        } else {
          urlParams.delete(paramKey);
        }
      });
      
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [currentValues, syncWithUrl, urlParamPrefix]);

  // Handle filter value changes
  const handleFilterChange = useCallback((filterId: string, value: any) => {
    const filter = filters.find(f => f.id === filterId);
    if (!filter) return;

    // Transform value if needed
    const transformedValue = filter.transform ? filter.transform(value) : value;
    
    // Update values
    const newValues = { ...currentValues, [filter.key]: transformedValue };
    
    if (!controlled) {
      setInternalValues(newValues);
    }
    
    // Call event handlers
    onChange?.(newValues, filter.key);
    onFilterChange?.(filterId, transformedValue);
  }, [currentValues, filters, controlled, onChange, onFilterChange]);

  // Handle reset
  const handleReset = useCallback(() => {
    const resetValues = { ...defaultValues };
    
    if (!controlled) {
      setInternalValues(resetValues);
    }
    
    onReset?.();
    onChange?.(resetValues, 'reset');
  }, [defaultValues, controlled, onReset, onChange]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    onSubmit?.(currentValues);
  }, [currentValues, onSubmit]);

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.values(currentValues).filter(value => 
      value !== undefined && value !== null && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  }, [currentValues]);

  // Get visible filters
  const visibleFiltersList = useMemo(() => {
    if (!maxVisibleFilters) return filters;
    return filters.slice(0, visibleFilters);
  }, [filters, visibleFilters, maxVisibleFilters]);

  // Render filter input based on type
  const renderFilterInput = (item: FilterItem) => {
    const value = currentValues[item.key];
    const disabled = item.disabled || loading;

    if (item.renderCustom) {
      return item.renderCustom({
        item,
        value,
        onChange: (newValue) => handleFilterChange(item.id, newValue),
        disabled
      });
    }

    switch (item.type) {
      case 'text':
        return (
          <input
            type="text"
            className="filterbar__filter-input"
            placeholder={item.placeholder}
            value={value || ''}
            onChange={(e) => handleFilterChange(item.id, e.target.value)}
            disabled={disabled}
          />
        );

      case 'select':
        return (
          <select
            className="filterbar__filter-select"
            value={value || ''}
            onChange={(e) => handleFilterChange(item.id, e.target.value)}
            disabled={disabled}
            multiple={item.multiple}
          >
            {item.placeholder && (
              <option value="" disabled>
                {item.placeholder}
              </option>
            )}
            {item.options?.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        if (item.multiple) {
          return (
            <div className={`filterbar__checkbox-group ${item.layout === 'horizontal' ? 'filterbar__checkbox-group--horizontal' : ''}`}>
              {item.options?.map((option) => (
                <label key={option.value} className="filterbar__checkbox-item">
                  <input
                    type="checkbox"
                    className="filterbar__checkbox-input"
                    checked={Array.isArray(value) ? value.includes(option.value) : false}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value);
                      handleFilterChange(item.id, newValues);
                    }}
                    disabled={disabled || option.disabled}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          );
        } else {
          return (
            <div className="filterbar__checkbox-group">
              <label className="filterbar__checkbox-item">
                <input
                  type="checkbox"
                  className="filterbar__checkbox-input"
                  checked={!!value}
                  onChange={(e) => handleFilterChange(item.id, e.target.checked)}
                  disabled={disabled}
                />
                {item.label}
              </label>
            </div>
          );
        }

      case 'radio':
        return (
          <div className={`filterbar__radio-group ${item.layout === 'horizontal' ? 'filterbar__radio-group--horizontal' : ''}`}>
            {item.options?.map((option) => (
              <label key={option.value} className="filterbar__radio-item">
                <input
                  type="radio"
                  className="filterbar__radio-input"
                  name={item.key}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleFilterChange(item.id, e.target.value)}
                  disabled={disabled || option.disabled}
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      case 'slider':
        return (
          <div className="filterbar__slider-container">
            <input
              type="range"
              className="filterbar__slider"
              min={item.min || 0}
              max={item.max || 100}
              step={item.step || 1}
              value={value || item.min || 0}
              onChange={(e) => handleFilterChange(item.id, Number(e.target.value))}
              disabled={disabled}
            />
            <div className="filterbar__slider-values">
              <span>{item.min || 0}</span>
              <span>{value || item.min || 0}</span>
              <span>{item.max || 100}</span>
            </div>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            className="filterbar__date-input"
            value={value || ''}
            onChange={(e) => handleFilterChange(item.id, e.target.value)}
            disabled={disabled}
          />
        );

      case 'button':
        return (
          <div className="filterbar__button-group">
            {item.options?.map((option) => (
              <button
                key={option.value}
                className={`filterbar__button ${value === option.value ? 'filterbar__button--active' : ''}`}
                onClick={() => handleFilterChange(item.id, option.value)}
                disabled={disabled || option.disabled}
                style={option.color ? { backgroundColor: option.color, borderColor: option.color } : undefined}
              >
                {option.icon && <span>{option.icon}</span>}
                {option.label}
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // Render active filters
  const renderActiveFilters = () => {
    if (!showActiveFilters || activeFiltersCount === 0) return null;

    const activeFilters = filters.filter(filter => {
      const value = currentValues[filter.key];
      return value !== undefined && value !== null && value !== '' && 
             (Array.isArray(value) ? value.length > 0 : true);
    });

    return (
      <div className="filterbar__active-filters">
        {activeFilters.map(filter => {
          const value = currentValues[filter.key];
          let displayValue = value;
          
          if (Array.isArray(value)) {
            const options = filter.options?.filter(opt => value.includes(opt.value));
            displayValue = options?.map(opt => opt.label).join(', ');
          } else if (filter.options) {
            const option = filter.options.find(opt => opt.value === value);
            displayValue = option?.label || value;
          }

          return (
            <span key={filter.key} className="filterbar__active-filter">
              {filter.label}: {displayValue}
              <button
                className="filterbar__active-filter-remove"
                onClick={() => handleFilterChange(filter.id, filter.multiple ? [] : undefined)}
                aria-label={`Remove ${filter.label} filter`}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div className={`filterbar filterbar--${size} filterbar--${theme} ${className}`} style={style}>
        <div className="filterbar__loading">
          <div className="filterbar__loading-spinner" />
          Loading filters...
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`filterbar filterbar--${size} filterbar--${theme} ${className}`} style={style}>
        <div className="filterbar__empty">
          Error: {error}
        </div>
      </div>
    );
  }

  // Render empty state
  if (filters.length === 0) {
    return (
      <div className={`filterbar filterbar--${size} filterbar--${theme} ${className}`} style={style}>
        <div className="filterbar__empty">
          No filters available
        </div>
      </div>
    );
  }

  return (
    <div
      className={`filterbar filterbar--${size} filterbar--${theme} ${className}`}
      style={style}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {/* Header */}
      {(title || actions.length > 0 || showReset || showSubmit) && (
        <div className="filterbar__header">
          {title && (
            <h3 className="filterbar__title">
              {title}
              {showCount && activeFiltersCount > 0 && (
                <span>({activeFiltersCount})</span>
              )}
            </h3>
          )}
          
          <div className="filterbar__actions">
            {actions.map(action => (
              <button
                key={action.id}
                className={`filterbar__action ${action.type ? `filterbar__action--${action.type}` : ''}`}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.icon && <span>{action.icon}</span>}
                {action.label}
              </button>
            ))}
            
            {showReset && (
              <button
                className="filterbar__action filterbar__action--danger"
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </button>
            )}
            
            {showSubmit && (
              <button
                className="filterbar__action filterbar__action--primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                Apply
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active filters */}
      {renderActiveFilters()}

      {/* Filters */}
      {collapsible ? (
        <div className="filterbar__collapsible">
          <button
            className="filterbar__collapsible-header"
            onClick={() => setCollapsed(!collapsed)}
            aria-expanded={!collapsed}
          >
            <span className="filterbar__collapsible-title">
              {subtitle || 'Filters'}
              {showCount && activeFiltersCount > 0 && (
                <span> ({activeFiltersCount})</span>
              )}
            </span>
            <span className={`filterbar__collapsible-icon ${!collapsed ? 'filterbar__collapsible-icon--expanded' : ''}`}>
              ▼
            </span>
          </button>
          
          {!collapsed && (
            <div className="filterbar__collapsible-content">
              <div className={`filterbar__filters ${layout !== 'vertical' ? `filterbar__filters--${layout}` : ''}`}>
                {visibleFiltersList.map(item => (
                  <div
                    key={item.id}
                    className={`filterbar__filter ${layout === 'horizontal' ? 'filterbar__filter--horizontal' : ''} ${item.className || ''}`}
                    style={item.style}
                  >
                    <label className="filterbar__filter-label">
                      {item.label}
                      {item.required && <span style={{ color: '#ef4444' }}> *</span>}
                    </label>
                    {renderFilterInput(item)}
                  </div>
                ))}
                
                {maxVisibleFilters && filters.length > maxVisibleFilters && (
                  <button
                    className="filterbar__action"
                    onClick={() => setVisibleFilters(visibleFilters ? undefined : maxVisibleFilters)}
                  >
                    {visibleFilters ? 'Show More' : 'Show Less'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={`filterbar__filters ${layout !== 'vertical' ? `filterbar__filters--${layout}` : ''}`}>
          {visibleFiltersList.map(item => (
            <div
              key={item.id}
              className={`filterbar__filter ${layout === 'horizontal' ? 'filterbar__filter--horizontal' : ''} ${item.className || ''}`}
              style={item.style}
            >
              <label className="filterbar__filter-label">
                {item.label}
                {item.required && <span style={{ color: '#ef4444' }}> *</span>}
              </label>
              {renderFilterInput(item)}
            </div>
          ))}
          
          {maxVisibleFilters && filters.length > maxVisibleFilters && (
            <button
              className="filterbar__action"
              onClick={() => setVisibleFilters(visibleFilters ? undefined : maxVisibleFilters)}
            >
              {visibleFilters ? 'Show More' : 'Show Less'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar; 