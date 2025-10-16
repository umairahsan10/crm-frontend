import React, { useMemo } from 'react';
import { DateRangePicker, DateRangeValue } from './DateRangePicker';
import { AmountRangePicker, AmountRangeValue } from './AmountRangePicker';

/**
 * All supported filter field types
 */
export type FilterFieldType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'multiselect'
  | 'date' 
  | 'daterange'
  | 'amount-range'
  | 'checkbox'
  | 'radio';

/**
 * Option for select/multiselect fields
 */
export interface FilterOption {
  value: string | number;
  label: string;
}

/**
 * Configuration for a filter field
 */
export interface FilterFieldConfig {
  type: FilterFieldType;
  label?: string;
  placeholder?: string;
  options?: FilterOption[] | string[] | number[];
  min?: number;
  max?: number;
  disabled?: boolean;
  required?: boolean;
  currency?: string;
  className?: string;
}

/**
 * Props for FilterField component
 */
export interface FilterFieldProps {
  name: string;
  value: any;
  config: FilterFieldConfig;
  onChange: (value: any) => void;
  theme?: 'blue' | 'green' | 'purple' | 'red' | 'indigo';
}

/**
 * Generic FilterField Component
 * Renders any type of filter input based on config
 * 100% Generic - works with any data type!
 */
export const FilterField: React.FC<FilterFieldProps> = ({
  name,
  value,
  config,
  onChange,
  theme = 'blue'
}) => {
  // Theme colors
  const themeColors = {
    blue: 'focus:ring-blue-500 focus:border-blue-500',
    green: 'focus:ring-green-500 focus:border-green-500',
    purple: 'focus:ring-purple-500 focus:border-purple-500',
    red: 'focus:ring-red-500 focus:border-red-500',
    indigo: 'focus:ring-indigo-500 focus:border-indigo-500'
  };

  const focusClasses = themeColors[theme] || themeColors.blue;
  const baseInputClasses = `block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none ${focusClasses} sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed`;

  // Normalize options to FilterOption[]
  const normalizedOptions = useMemo(() => {
    if (!config.options) return [];
    
    return config.options.map(opt => {
      if (typeof opt === 'object' && 'value' in opt) {
        return opt as FilterOption;
      }
      return { value: opt, label: String(opt) };
    });
  }, [config.options]);

  // Render based on type
  switch (config.type) {
    case 'text':
      return (
        <div className={config.className}>
          {config.label && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.label}
            </label>
          )}
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={config.placeholder}
            disabled={config.disabled}
            required={config.required}
            className={baseInputClasses}
          />
        </div>
      );

    case 'number':
      return (
        <div className={config.className}>
          {config.label && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.label}
            </label>
          )}
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={config.placeholder}
            min={config.min}
            max={config.max}
            disabled={config.disabled}
            required={config.required}
            className={baseInputClasses}
          />
        </div>
      );

    case 'select':
      return (
        <div className={config.className}>
          {config.label && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.label}
            </label>
          )}
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={config.disabled}
            required={config.required}
            className={baseInputClasses}
          >
            <option value="">{config.placeholder || 'Select...'}</option>
            {normalizedOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case 'multiselect':
      return (
        <div className={config.className}>
          {config.label && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.label}
            </label>
          )}
          <select
            multiple
            value={value || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
              onChange(selected);
            }}
            disabled={config.disabled}
            className={`${baseInputClasses} min-h-[100px]`}
          >
            {normalizedOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case 'date':
      return (
        <div className={config.className}>
          {config.label && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.label}
            </label>
          )}
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={config.disabled}
            required={config.required}
            className={baseInputClasses}
          />
        </div>
      );

    case 'daterange':
      return (
        <DateRangePicker
          value={value || { from: '', to: '' }}
          onChange={onChange}
          fromLabel={config.label ? `${config.label} (From)` : undefined}
          toLabel={config.label ? `${config.label} (To)` : undefined}
          disabled={config.disabled}
          className={config.className}
        />
      );

    case 'amount-range':
      return (
        <AmountRangePicker
          value={value || { min: '', max: '' }}
          onChange={onChange}
          minLabel={config.label ? `${config.label} (Min)` : undefined}
          maxLabel={config.label ? `${config.label} (Max)` : undefined}
          currency={config.currency}
          disabled={config.disabled}
          className={config.className}
        />
      );

    case 'checkbox':
      return (
        <div className={`flex items-center ${config.className}`}>
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            disabled={config.disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          {config.label && (
            <label className="ml-2 block text-sm text-gray-700">
              {config.label}
            </label>
          )}
        </div>
      );

    case 'radio':
      return (
        <div className={config.className}>
          {config.label && (
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {config.label}
            </label>
          )}
          <div className="space-y-2">
            {normalizedOptions.map((opt) => (
              <div key={opt.value} className="flex items-center">
                <input
                  type="radio"
                  checked={value === opt.value}
                  onChange={() => onChange(opt.value)}
                  disabled={config.disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      console.warn(`Unknown filter type: ${config.type}`);
      return null;
  }
};

