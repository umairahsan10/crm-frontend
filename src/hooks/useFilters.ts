import { useState, useMemo, useCallback } from 'react';

/**
 * Generic type for any filter value
 */
export type FilterValue = string | number | boolean | null | undefined | string[];

/**
 * Generic filter state - can be any shape!
 */
export type FilterState = Record<string, FilterValue>;

/**
 * 100% Generic useFilters Hook
 * Works with ANY data structure - no changes needed for future modules!
 * 
 * @example
 * // Revenue filters
 * const { filters, updateFilter } = useFilters({
 *   search: '', category: '', fromDate: '', toDate: ''
 * });
 * 
 * @example
 * // Orders filters (future module)
 * const { filters, updateFilter } = useFilters({
 *   status: '', priority: '', customerId: '', isPaid: false
 * });
 */
export const useFilters = <T extends FilterState>(
  initialValues: T,
  onChange?: (filters: T) => void
) => {
  const [filters, setFilters] = useState<T>(initialValues);
  const [showAdvanced, setShowAdvanced] = useState(false);

  /**
   * Update a single filter field
   */
  const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      onChange?.(newFilters);
      return newFilters;
    });
  }, [onChange]);

  /**
   * Update multiple filters at once
   */
  const updateFilters = useCallback((updates: Partial<T>) => {
    setFilters(prev => {
      const newFilters = { ...prev, ...updates };
      onChange?.(newFilters);
      return newFilters;
    });
  }, [onChange]);

  /**
   * Reset all filters to initial values
   */
  const resetFilters = useCallback(() => {
    setFilters(initialValues);
    onChange?.(initialValues);
  }, [initialValues, onChange]);

  /**
   * Check if any filter has a non-empty value
   */
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      const initial = initialValues[key as keyof T];
      
      // Handle arrays
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      
      // Handle other values
      return value !== initial && 
             value !== '' && 
             value !== null && 
             value !== undefined;
    });
  }, [filters, initialValues]);

  /**
   * Count of active (non-empty) filters
   */
  const activeCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      const initial = initialValues[key as keyof T];
      
      // Handle arrays
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      
      // Handle other values
      return value !== initial && 
             value !== '' && 
             value !== null && 
             value !== undefined;
    }).length;
  }, [filters, initialValues]);

  /**
   * Get only active filters (with non-empty values)
   * Useful for API calls
   */
  const activeFilters = useMemo(() => {
    return Object.entries(filters).reduce((acc, [key, value]) => {
      // Skip empty values
      if (Array.isArray(value)) {
        if (value.length > 0) acc[key] = value;
      } else if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
  }, [filters]);

  /**
   * Get filter by key
   */
  const getFilter = useCallback(<K extends keyof T>(key: K): T[K] => {
    return filters[key];
  }, [filters]);

  /**
   * Set a filter to empty/initial value
   */
  const clearFilter = useCallback(<K extends keyof T>(key: K) => {
    updateFilter(key, initialValues[key]);
  }, [updateFilter, initialValues]);

  return {
    // Filter state
    filters,
    activeFilters,
    
    // Actions
    updateFilter,
    updateFilters,
    resetFilters,
    getFilter,
    clearFilter,
    
    // UI state
    showAdvanced,
    setShowAdvanced,
    
    // Computed
    hasActiveFilters,
    activeCount
  };
};

