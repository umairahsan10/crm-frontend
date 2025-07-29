import { useState, useCallback, useMemo } from 'react';
import type { FilterItem } from '../components/common/FilterBar/FilterBar';

export interface UseFilterBarOptions {
  filters: FilterItem[];
  defaultValues?: Record<string, any>;
  values?: Record<string, any>;
  controlled?: boolean;
  syncWithUrl?: boolean;
  urlParamPrefix?: string;
  autoSubmit?: boolean;
  debounceMs?: number;
  onSubmit?: (values: Record<string, any>) => void;
}

export interface UseFilterBarReturn {
  // State
  values: Record<string, any>;
  setValues: (values: Record<string, any>) => void;
  
  // Actions
  reset: () => void;
  clear: () => void;
  setFilter: (key: string, value: any) => void;
  getFilter: (key: string) => any;
  
  // Computed
  activeFilters: Record<string, any>;
  activeFiltersCount: number;
  hasActiveFilters: boolean;
  isFilterActive: (key: string) => boolean;
  
  // Utilities
  getFilterConfig: (key: string) => FilterItem | undefined;
  validateFilters: () => Record<string, string>;
  transformValues: (values: Record<string, any>) => Record<string, any>;
  
  // URL sync
  syncToUrl: () => void;
  syncFromUrl: () => void;
}

export const useFilterBar = (options: UseFilterBarOptions): UseFilterBarReturn => {
  const {
    filters,
    defaultValues = {},
    controlled = false,
    syncWithUrl = false,
    urlParamPrefix = 'filter_',
    autoSubmit = false,
    debounceMs = 300
  } = options;

  // State management
  const [internalValues, setInternalValues] = useState<Record<string, any>>(defaultValues);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);

  // Use controlled or uncontrolled values
  const values = controlled ? (options.values || {}) : internalValues;

  // Set values (internal or external)
  const setValues = useCallback((newValues: Record<string, any>) => {
    if (!controlled) {
      setInternalValues(newValues);
    }
  }, [controlled]);

  // Reset to default values
  const reset = useCallback(() => {
    setValues(defaultValues);
  }, [defaultValues, setValues]);

  // Clear all filters
  const clear = useCallback(() => {
    setValues({});
  }, [setValues]);

  // Set individual filter value
  const setFilter = useCallback((key: string, value: any) => {
    const filter = filters.find(f => f.key === key);
    if (!filter) return;

    // Transform value if needed
    const transformedValue = filter.transform ? filter.transform(value) : value;
    
    const newValues = { ...values, [key]: transformedValue };
    setValues(newValues);

    // Auto-submit with debounce
    if (autoSubmit) {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      const timer = setTimeout(() => {
        // Trigger submit callback if provided
        if (options.onSubmit) {
          options.onSubmit(newValues);
        }
      }, debounceMs);
      setDebounceTimer(timer);
    }
  }, [values, filters, setValues, autoSubmit, debounceTimer, debounceMs, options]);

  // Get individual filter value
  const getFilter = useCallback((key: string) => {
    return values[key];
  }, [values]);

  // Get active filters (non-empty values)
  const activeFilters = useMemo(() => {
    const active: Record<string, any> = {};
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && 
          (Array.isArray(value) ? value.length > 0 : true)) {
        active[key] = value;
      }
    });
    return active;
  }, [values]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return Object.keys(activeFilters).length;
  }, [activeFilters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return activeFiltersCount > 0;
  }, [activeFiltersCount]);

  // Check if specific filter is active
  const isFilterActive = useCallback((key: string) => {
    const value = values[key];
    return value !== undefined && value !== null && value !== '' && 
           (Array.isArray(value) ? value.length > 0 : true);
  }, [values]);

  // Get filter configuration
  const getFilterConfig = useCallback((key: string) => {
    return filters.find(f => f.key === key);
  }, [filters]);

  // Validate all filters
  const validateFilters = useCallback(() => {
    const errors: Record<string, string> = {};
    
    filters.forEach(filter => {
      if (filter.required && filter.validation) {
        const value = values[filter.key];
        const error = filter.validation(value);
        if (error) {
          errors[filter.key] = error;
        }
      }
    });
    
    return errors;
  }, [filters, values]);

  // Transform all values using filter transforms
  const transformValues = useCallback((inputValues: Record<string, any>) => {
    const transformed: Record<string, any> = {};
    
    Object.entries(inputValues).forEach(([key, value]) => {
      const filter = filters.find(f => f.key === key);
      if (filter && filter.transform) {
        transformed[key] = filter.transform(value);
      } else {
        transformed[key] = value;
      }
    });
    
    return transformed;
  }, [filters]);

  // Sync to URL
  const syncToUrl = useCallback(() => {
    if (!syncWithUrl) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    
    Object.entries(values).forEach(([key, value]) => {
      const paramKey = `${urlParamPrefix}${key}`;
      if (value !== undefined && value !== null && value !== '') {
        urlParams.set(paramKey, JSON.stringify(value));
      } else {
        urlParams.delete(paramKey);
      }
    });
    
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [values, syncWithUrl, urlParamPrefix]);

  // Sync from URL
  const syncFromUrl = useCallback(() => {
    if (!syncWithUrl) return;
    
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
      setValues({ ...values, ...urlValues });
    }
  }, [filters, syncWithUrl, urlParamPrefix, values, setValues]);

  return {
    // State
    values,
    setValues,
    
    // Actions
    reset,
    clear,
    setFilter,
    getFilter,
    
    // Computed
    activeFilters,
    activeFiltersCount,
    hasActiveFilters,
    isFilterActive,
    
    // Utilities
    getFilterConfig,
    validateFilters,
    transformValues,
    
    // URL sync
    syncToUrl,
    syncFromUrl
  };
};

// Convenience hooks for common filter patterns

export const useProductFilters = (options?: Partial<UseFilterBarOptions>) => {
  const productFilters: FilterItem[] = [
    {
      id: 'category',
      type: 'select',
      label: 'Category',
      key: 'category',
      placeholder: 'Select category',
      options: [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'books', label: 'Books' },
        { value: 'home', label: 'Home & Garden' },
        { value: 'sports', label: 'Sports' }
      ],
      clearable: true
    },
    {
      id: 'priceRange',
      type: 'slider',
      label: 'Price Range',
      key: 'priceRange',
      min: 0,
      max: 1000,
      step: 10,
      defaultValue: 50
    },
    {
      id: 'brand',
      type: 'checkbox',
      label: 'Brand',
      key: 'brand',
      options: [
        { value: 'apple', label: 'Apple' },
        { value: 'samsung', label: 'Samsung' },
        { value: 'nike', label: 'Nike' },
        { value: 'adidas', label: 'Adidas' }
      ],
      multiple: true,
      layout: 'horizontal'
    },
    {
      id: 'inStock',
      type: 'checkbox',
      label: 'In Stock Only',
      key: 'inStock'
    }
  ];

  return useFilterBar({
    filters: productFilters,
    ...options
  });
};

export const useUserFilters = (options?: Partial<UseFilterBarOptions>) => {
  const userFilters: FilterItem[] = [
    {
      id: 'role',
      type: 'select',
      label: 'Role',
      key: 'role',
      placeholder: 'Select role',
      options: [
        { value: 'admin', label: 'Administrator' },
        { value: 'manager', label: 'Manager' },
        { value: 'employee', label: 'Employee' },
        { value: 'intern', label: 'Intern' }
      ],
      clearable: true
    },
    {
      id: 'status',
      type: 'button',
      label: 'Status',
      key: 'status',
      options: [
        { value: 'active', label: 'Active', color: '#10b981' },
        { value: 'inactive', label: 'Inactive', color: '#6b7280' },
        { value: 'suspended', label: 'Suspended', color: '#ef4444' }
      ]
    },
    {
      id: 'department',
      type: 'checkbox',
      label: 'Department',
      key: 'department',
      options: [
        { value: 'engineering', label: 'Engineering' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'sales', label: 'Sales' },
        { value: 'hr', label: 'Human Resources' }
      ],
      multiple: true
    }
  ];

  return useFilterBar({
    filters: userFilters,
    ...options
  });
};

export const useOrderFilters = (options?: Partial<UseFilterBarOptions>) => {
  const orderFilters: FilterItem[] = [
    {
      id: 'status',
      type: 'button',
      label: 'Order Status',
      key: 'status',
      options: [
        { value: 'pending', label: 'Pending', color: '#f59e0b' },
        { value: 'processing', label: 'Processing', color: '#3b82f6' },
        { value: 'shipped', label: 'Shipped', color: '#10b981' },
        { value: 'delivered', label: 'Delivered', color: '#059669' },
        { value: 'cancelled', label: 'Cancelled', color: '#ef4444' }
      ]
    },
    {
      id: 'paymentMethod',
      type: 'select',
      label: 'Payment Method',
      key: 'paymentMethod',
      placeholder: 'Select payment method',
      options: [
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'cash', label: 'Cash on Delivery' }
      ],
      clearable: true
    },
    {
      id: 'amount',
      type: 'slider',
      label: 'Order Amount',
      key: 'amount',
      min: 0,
      max: 10000,
      step: 100,
      defaultValue: 100
    }
  ];

  return useFilterBar({
    filters: orderFilters,
    ...options
  });
};

export const useSearchFilters = (options?: Partial<UseFilterBarOptions>) => {
  const searchFilters: FilterItem[] = [
    {
      id: 'query',
      type: 'text',
      label: 'Search',
      key: 'query',
      placeholder: 'Enter search term...',
      clearable: true
    },
    {
      id: 'dateRange',
      type: 'date',
      label: 'Date Range',
      key: 'dateRange'
    },
    {
      id: 'sortBy',
      type: 'select',
      label: 'Sort By',
      key: 'sortBy',
      options: [
        { value: 'relevance', label: 'Relevance' },
        { value: 'date', label: 'Date' },
        { value: 'name', label: 'Name' },
        { value: 'price', label: 'Price' }
      ],
      defaultValue: 'relevance'
    }
  ];

  return useFilterBar({
    filters: searchFilters,
    autoSubmit: true,
    debounceMs: 500,
    ...options
  });
}; 