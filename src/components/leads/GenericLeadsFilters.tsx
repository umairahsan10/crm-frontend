/**
 * NEW GENERIC LEADS FILTERS
 * Demonstrates the generic filter system
 * 
 * This replaces the 940-line LeadsSearchFilters.tsx with just configuration!
 * Works for ALL lead tabs: regular, cracked, archived
 */

import React, { useState, useEffect, useRef } from 'react';
import { useFilters } from '../../hooks/useFilters';
import { getSalesUnitsApi, getFilterEmployeesApi } from '../../apis/leads';
import { getActiveIndustriesApi } from '../../apis/industries';

/**
 * Generic filter props - works for ANY tab type!
 */
interface GenericLeadsFiltersProps {
  // What filters to show (configure per tab)
  showFilters: {
    status?: boolean;
    type?: boolean;
    salesUnit?: boolean;
    assignedTo?: boolean;
    dateRange?: boolean;
    industry?: boolean;
    amountRange?: boolean;
    closedBy?: boolean;
    currentPhase?: boolean;
    totalPhases?: boolean;
    source?: boolean;
    outcome?: boolean;
    qualityRating?: boolean;
    archivedDateRange?: boolean;
  };
  
  // Callbacks - only pass the ones you need
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  
  // Data sharing callbacks
  onEmployeesLoaded?: (employees: any[]) => void;
  
  // UI customization
  theme?: {
    primary: string;
    secondary: string;
    ring: string;
    bg: string;
    text: string;
  };
  searchPlaceholder?: string;
}

const GenericLeadsFilters: React.FC<GenericLeadsFiltersProps> = ({
  showFilters,
  onFiltersChange,
  onClearFilters,
  onEmployeesLoaded,
  theme = {
    primary: 'bg-blue-600',
    secondary: 'hover:bg-blue-700',
    ring: 'ring-blue-500',
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  },
  searchPlaceholder = 'Search leads...'
}) => {
  // Generic filter state - automatically works with any combination!
  const { 
    filters, 
    updateFilter, 
    resetFilters, 
    hasActiveFilters,
    activeCount 
  } = useFilters(
    {
      search: '',
      status: '',
      type: '',
      salesUnit: '',
      assignedTo: '',
      startDate: '',
      endDate: '',
      industry: '',
      minAmount: '',
      maxAmount: '',
      closedBy: '',
      currentPhase: '',
      totalPhases: '',
      source: '',
      outcome: '',
      qualityRating: '',
      archivedFrom: '',
      archivedTo: ''
    },
    (newFilters) => {
      // Auto-trigger when filters change
      onFiltersChange(newFilters);
    }
  );

  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Dynamic data states
  const [salesUnits, setSalesUnits] = useState<Array<{ id: number; name: string }>>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs to prevent duplicate API calls
  const salesUnitsFetched = useRef(false);
  const employeesFetched = useRef(false);
  const industriesFetched = useRef(false);

  // Fetch sales units when needed
  useEffect(() => {
    if (showFilters.salesUnit && !salesUnitsFetched.current) {
      salesUnitsFetched.current = true;
      const fetchSalesUnits = async () => {
        try {
          const response = await getSalesUnitsApi();
          if (response.success && response.data) {
            setSalesUnits(response.data);
          }
        } catch (error) {
          console.error('Error fetching sales units:', error);
        }
      };
      fetchSalesUnits();
    }
  }, [showFilters.salesUnit]);

  // Fetch industries when needed
  useEffect(() => {
    if (showFilters.industry && !industriesFetched.current) {
      industriesFetched.current = true;
      const fetchIndustries = async () => {
        try {
          const response = await getActiveIndustriesApi();
          if (response.success && response.data) {
            setIndustries(response.data);
          }
        } catch (error) {
          console.error('Error fetching industries:', error);
        }
      };
      fetchIndustries();
    }
  }, [showFilters.industry]);

  // Fetch employees when needed
  useEffect(() => {
    if ((showFilters.assignedTo || showFilters.closedBy) && !employeesFetched.current) {
      employeesFetched.current = true;
      const fetchEmployees = async () => {
        try {
          setIsLoading(true);
          const salesUnitId = filters.salesUnit ? parseInt(filters.salesUnit as string) : undefined;
          const response = await getFilterEmployeesApi(salesUnitId);
          if (response.success && response.data) {
            setEmployees(response.data);
            // Share employees data with parent component for bulk actions
            onEmployeesLoaded?.(response.data);
          }
        } catch (error) {
          console.error('Error fetching employees:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchEmployees();
    }
  }, [showFilters.assignedTo, showFilters.closedBy, filters.salesUnit, onEmployeesLoaded]);

  const handleClearAll = () => {
    resetFilters();
    onClearFilters();
  };

  // Render helper for select fields
  const renderSelect = (
    key: keyof typeof filters,
    label: string,
    options: Array<{value: string | number; label: string}>,
    loading?: boolean
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={(filters[key] as string) || ''}
        onChange={(e) => updateFilter(key as any, e.target.value)}
        disabled={loading}
        className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${theme.ring} sm:text-sm disabled:opacity-50`}
      >
        <option value="">All {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const renderInput = (key: keyof typeof filters, label: string, type: 'text' | 'date' | 'number' = 'text', placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={(filters[key] as string) || ''}
        onChange={(e) => updateFilter(key as any, e.target.value)}
        placeholder={placeholder}
        className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${theme.ring} sm:text-sm`}
      />
    </div>
  );

  // Pre-defined options
  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' }
  ];

  const typeOptions = [
    { value: 'warm', label: 'Warm' },
    { value: 'cold', label: 'Cold' },
    { value: 'upsell', label: 'Upsell' },
    { value: 'push', label: 'Push' }
  ];

  const sourceOptions = [
    { value: 'PPC', label: 'PPC' },
    { value: 'SMM', label: 'SMM' }
  ];

  const outcomeOptions = [
    { value: 'interested', label: 'Interested' },
    { value: 'not_answered', label: 'Not Answered' },
    { value: 'voice_mail', label: 'Voice Mail' },
    { value: 'busy', label: 'Busy' },
    { value: 'denied', label: 'Denied' }
  ];

  const qualityOptions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'very_good', label: 'Very Good' },
    { value: 'good', label: 'Good' },
    { value: 'bad', label: 'Bad' },
    { value: 'useless', label: 'Useless' }
  ];

  const phaseOptions = Array.from({ length: 5 }, (_, i) => ({ 
    value: String(i + 1), 
    label: `Phase ${i + 1}` 
  }));

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={(filters.search as string) || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder={searchPlaceholder}
                className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:${theme.ring} sm:text-sm`}
              />
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${theme.bg} ${theme.text}`}>
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters - Rendered based on configuration */}
      {showAdvanced && (
        <div className="px-6 py-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Only render filters that are configured to show */}
            {showFilters.status && renderSelect('status', 'Status', statusOptions)}
            {showFilters.type && renderSelect('type', 'Type', typeOptions)}
            
            {showFilters.salesUnit && renderSelect(
              'salesUnit', 
              'Sales Unit', 
              salesUnits.map(u => ({ value: u.id, label: u.name }))
            )}
            
            {showFilters.assignedTo && renderSelect(
              'assignedTo', 
              'Assigned To', 
              employees.map(e => ({
                value: (e.id || e.employeeId || e.userId || '').toString(),
                label: e.name || e.fullName || `${e.firstName} ${e.lastName}` || e.email || 'Unknown'
              })),
              isLoading
            )}
            
            {showFilters.dateRange && (
              <>
                {renderInput('startDate', 'Start Date', 'date')}
                {renderInput('endDate', 'End Date', 'date')}
              </>
            )}
            
            {showFilters.industry && renderSelect(
              'industry', 
              'Industry', 
              industries.map(i => ({ value: i.id, label: i.name }))
            )}
            
            {showFilters.amountRange && (
              <>
                {renderInput('minAmount', 'Min Amount', 'number', '0.00')}
                {renderInput('maxAmount', 'Max Amount', 'number', '0.00')}
              </>
            )}
            
            {showFilters.closedBy && renderSelect(
              'closedBy', 
              'Closed By', 
              employees.map(e => ({
                value: (e.id || e.employeeId || '').toString(),
                label: e.name || e.fullName || `${e.firstName} ${e.lastName}` || 'Unknown'
              })),
              isLoading
            )}
            
            {showFilters.currentPhase && renderSelect(
              'currentPhase', 
              'Current Phase', 
              phaseOptions
            )}
            
            {showFilters.totalPhases && renderSelect(
              'totalPhases', 
              'Total Phases', 
              phaseOptions
            )}
            
            {showFilters.source && renderSelect('source', 'Source', sourceOptions)}
            {showFilters.outcome && renderSelect('outcome', 'Outcome', outcomeOptions)}
            {showFilters.qualityRating && renderSelect('qualityRating', 'Quality Rating', qualityOptions)}
            
            {showFilters.archivedDateRange && (
              <>
                {renderInput('archivedFrom', 'Archived From', 'date')}
                {renderInput('archivedTo', 'Archived To', 'date')}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex justify-end gap-3">
            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Clear All ({activeCount})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericLeadsFilters;

