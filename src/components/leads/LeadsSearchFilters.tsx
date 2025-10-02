import React, { useState, useEffect } from 'react';
import { getSalesUnitsApi, getFilterEmployeesApi } from '../../apis/leads';
import { getActiveIndustriesApi } from '../../apis/industries';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFiltersConfig {
  tabType: 'regular' | 'cracked' | 'archived';
  searchPlaceholder: string;
  theme: {
    primary: string;
    secondary: string;
    ring: string;
    bg: string;
    text: string;
  };
  filters: {
    showStatus?: boolean;
    showType?: boolean;
    showSalesUnit?: boolean;
    showAssignedTo?: boolean;
    showDateRange?: boolean;
    showIndustry?: boolean;
    showAmountRange?: boolean;
    showClosedBy?: boolean;
    showCurrentPhase?: boolean;
    showTotalPhases?: boolean;
    showSource?: boolean;
    showOutcome?: boolean;
    showQualityRating?: boolean;
    showArchivedDateRange?: boolean;
  };
  customOptions?: {
    statusOptions?: FilterOption[];
    typeOptions?: FilterOption[];
    sourceOptions?: FilterOption[];
    outcomeOptions?: FilterOption[];
    qualityRatingOptions?: FilterOption[];
    phaseOptions?: FilterOption[];
    totalPhasesOptions?: FilterOption[];
  };
}

interface LeadsSearchFiltersProps {
  config: SearchFiltersConfig;
  onSearch: (search: string) => void;
  onStatusFilter?: (status: string) => void;
  onTypeFilter?: (type: string) => void;
  onSalesUnitFilter?: (salesUnitId: string) => void;
  onAssignedToFilter?: (assignedTo: string) => void;
  onDateRangeFilter?: (startDate: string, endDate: string) => void;
  onIndustryFilter?: (industryId: string) => void;
  onMinAmountFilter?: (minAmount: string) => void;
  onMaxAmountFilter?: (maxAmount: string) => void;
  onClosedByFilter?: (closedBy: string) => void;
  onCurrentPhaseFilter?: (currentPhase: string) => void;
  onTotalPhasesFilter?: (totalPhases: string) => void;
  onSourceFilter?: (source: string) => void;
  onOutcomeFilter?: (outcome: string) => void;
  onQualityRatingFilter?: (qualityRating: string) => void;
  onArchivedDateRangeFilter?: (archivedFrom: string, archivedTo: string) => void;
  onClearFilters: () => void;
}

const LeadsSearchFilters: React.FC<LeadsSearchFiltersProps> = ({
  config,
  onSearch,
  onStatusFilter,
  onTypeFilter,
  onSalesUnitFilter,
  onAssignedToFilter,
  onDateRangeFilter,
  onIndustryFilter,
  onMinAmountFilter,
  onMaxAmountFilter,
  onClosedByFilter,
  onCurrentPhaseFilter,
  onTotalPhasesFilter,
  onSourceFilter,
  onOutcomeFilter,
  onQualityRatingFilter,
  onArchivedDateRangeFilter,
  onClearFilters
}) => {
  // Common state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states - all possible filters
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSalesUnit, setSelectedSalesUnit] = useState('');
  const [selectedAssignedTo, setSelectedAssignedTo] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedClosedBy, setSelectedClosedBy] = useState('');
  const [currentPhase, setCurrentPhase] = useState('');
  const [totalPhases, setTotalPhases] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [selectedQualityRating, setSelectedQualityRating] = useState('');
  const [archivedFrom, setArchivedFrom] = useState('');
  const [archivedTo, setArchivedTo] = useState('');
  
  // API data states
  const [salesUnits, setSalesUnits] = useState<Array<{ id: number; name: string }>>(() => [
    { id: 1, name: 'Sales Unit 1' },
    { id: 2, name: 'Sales Unit 2' },
    { id: 3, name: 'Enterprise Sales' },
    { id: 4, name: 'SMB Sales' }
  ]);
  const [employees, setEmployees] = useState<Array<{ 
    id?: string | number; 
    employeeId?: string | number;
    userId?: string | number;
    _id?: string | number;
    name?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    [key: string]: any;
  }>>(() => [
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Sarah Johnson' },
    { id: '3', name: 'Mike Wilson' },
    { id: '4', name: 'Emily Davis' }
  ]);
  const [industries, setIndustries] = useState<Array<{ id: number; name: string; description?: string }>>([]);
  
  const [isLoadingSalesUnits, setIsLoadingSalesUnits] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(false);

  // Default options
  const defaultStatusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'payment_link_generated', label: 'Payment Link Generated' },
    { value: 'failed', label: 'Failed' },
    { value: 'cracked', label: 'Cracked' }
  ];

  const defaultTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'warm', label: 'Warm' },
    { value: 'cold', label: 'Cold' },
    { value: 'upsell', label: 'Upsell' },
    { value: 'push', label: 'Push' }
  ];

  const defaultSourceOptions = [
    { value: '', label: 'All Sources' },
    { value: 'PPC', label: 'PPC' },
    { value: 'SMM', label: 'SMM' }
  ];

  const defaultOutcomeOptions = [
    { value: '', label: 'All Outcomes' },
    { value: 'voice_mail', label: 'Voice Mail' },
    { value: 'interested', label: 'Interested' },
    { value: 'not_answered', label: 'Not Answered' },
    { value: 'busy', label: 'Busy' },
    { value: 'denied', label: 'Denied' }
  ];

  const defaultQualityRatingOptions = [
    { value: '', label: 'All Ratings' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'very_good', label: 'Very Good' },
    { value: 'good', label: 'Good' },
    { value: 'bad', label: 'Bad' },
    { value: 'useless', label: 'Useless' }
  ];

  const defaultPhaseOptions = [
    { value: '', label: 'All Phases' },
    { value: '1', label: 'Phase 1' },
    { value: '2', label: 'Phase 2' },
    { value: '3', label: 'Phase 3' },
    { value: '4', label: 'Phase 4' },
    { value: '5', label: 'Phase 5' }
  ];

  const defaultTotalPhasesOptions = [
    { value: '', label: 'All Total Phases' },
    { value: '1', label: '1 Phase' },
    { value: '2', label: '2 Phases' },
    { value: '3', label: '3 Phases' },
    { value: '4', label: '4 Phases' },
    { value: '5', label: '5 Phases' }
  ];

  // Use custom options or defaults
  const statusOptions = config.customOptions?.statusOptions || defaultStatusOptions;
  const typeOptions = config.customOptions?.typeOptions || defaultTypeOptions;
  const sourceOptions = config.customOptions?.sourceOptions || defaultSourceOptions;
  const outcomeOptions = config.customOptions?.outcomeOptions || defaultOutcomeOptions;
  const qualityRatingOptions = config.customOptions?.qualityRatingOptions || defaultQualityRatingOptions;
  const phaseOptions = config.customOptions?.phaseOptions || defaultPhaseOptions;
  const totalPhasesOptions = config.customOptions?.totalPhasesOptions || defaultTotalPhasesOptions;

  // Fetch sales units when needed
  useEffect(() => {
    if (config.filters.showSalesUnit) {
      const fetchSalesUnits = async () => {
        try {
          setIsLoadingSalesUnits(true);
          const response = await getSalesUnitsApi();
          
          if (response.success && response.data && Array.isArray(response.data)) {
            setSalesUnits(response.data);
          } else {
            setSalesUnits([
              { id: 1, name: 'Sales Unit 1' },
              { id: 2, name: 'Sales Unit 2' },
              { id: 3, name: 'Enterprise Sales' },
              { id: 4, name: 'SMB Sales' }
            ]);
          }
        } catch (error) {
          console.error('Error fetching sales units:', error);
          setSalesUnits([
            { id: 1, name: 'Sales Unit 1' },
            { id: 2, name: 'Sales Unit 2' },
            { id: 3, name: 'Enterprise Sales' },
            { id: 4, name: 'SMB Sales' }
          ]);
        } finally {
          setIsLoadingSalesUnits(false);
        }
      };

      fetchSalesUnits();
    }
  }, [config.filters.showSalesUnit]);

  // Fetch industries when needed
  useEffect(() => {
    if (config.filters.showIndustry) {
      const fetchIndustries = async () => {
        try {
          setIsLoadingIndustries(true);
          const response = await getActiveIndustriesApi();
          
          if (response.success && response.data && Array.isArray(response.data)) {
            setIndustries(response.data);
          } else {
            setIndustries([
              { id: 1, name: 'Technology' },
              { id: 2, name: 'Healthcare' },
              { id: 3, name: 'Finance' },
              { id: 4, name: 'E-commerce' }
            ]);
          }
        } catch (error) {
          console.error('Error fetching industries:', error);
          setIndustries([
            { id: 1, name: 'Technology' },
            { id: 2, name: 'Healthcare' },
            { id: 3, name: 'Finance' },
            { id: 4, name: 'E-commerce' }
          ]);
        } finally {
          setIsLoadingIndustries(false);
        }
      };

      fetchIndustries();
    }
  }, [config.filters.showIndustry]);

  // Fetch employees when needed
  useEffect(() => {
    if (config.filters.showAssignedTo || config.filters.showClosedBy) {
      const fetchEmployees = async () => {
        try {
          setIsLoadingEmployees(true);
          const salesUnitId = selectedSalesUnit ? parseInt(selectedSalesUnit) : undefined;
          const response = await getFilterEmployeesApi(salesUnitId);
          
          if (response.success && response.data && Array.isArray(response.data)) {
            setEmployees(response.data);
          } else {
            setEmployees([
              { id: '1', name: 'John Smith' },
              { id: '2', name: 'Sarah Johnson' },
              { id: '3', name: 'Mike Wilson' },
              { id: '4', name: 'Emily Davis' }
            ]);
          }
        } catch (error) {
          console.error('Error fetching employees:', error);
          setEmployees([
            { id: '1', name: 'John Smith' },
            { id: '2', name: 'Sarah Johnson' },
            { id: '3', name: 'Mike Wilson' },
            { id: '4', name: 'Emily Davis' }
          ]);
        } finally {
          setIsLoadingEmployees(false);
        }
      };

      fetchEmployees();
    }
  }, [config.filters.showAssignedTo, config.filters.showClosedBy, selectedSalesUnit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedType('');
    setSelectedSalesUnit('');
    setSelectedAssignedTo('');
    setStartDate('');
    setEndDate('');
    setSelectedIndustry('');
    setMinAmount('');
    setMaxAmount('');
    setSelectedClosedBy('');
    setCurrentPhase('');
    setTotalPhases('');
    setSelectedSource('');
    setSelectedOutcome('');
    setSelectedQualityRating('');
    setArchivedFrom('');
    setArchivedTo('');
    onClearFilters();
  };

  const handleDateRangeChange = () => {
    if (startDate && endDate && onDateRangeFilter) {
      onDateRangeFilter(startDate, endDate);
    }
  };

  const handleArchivedDateRangeChange = () => {
    if (archivedFrom && archivedTo && onArchivedDateRangeFilter) {
      onArchivedDateRangeFilter(archivedFrom, archivedTo);
    }
  };

  const handleSalesUnitChange = (salesUnitId: string) => {
    setSelectedSalesUnit(salesUnitId);
    setSelectedAssignedTo(''); // Reset employee selection
    if (onSalesUnitFilter) {
      onSalesUnitFilter(salesUnitId);
    }
  };

  const handleAmountChange = (type: 'min' | 'max', value: string) => {
    // Only allow positive numbers
    const numericValue = value.replace(/[^0-9.]/g, '');
    if (numericValue === '' || (parseFloat(numericValue) >= 0)) {
      if (type === 'min') {
        setMinAmount(numericValue);
        if (onMinAmountFilter) {
          onMinAmountFilter(numericValue);
        }
      } else {
        setMaxAmount(numericValue);
        if (onMaxAmountFilter) {
          onMaxAmountFilter(numericValue);
        }
      }
    }
  };

  const hasActiveFilters = selectedStatus || selectedType || selectedSalesUnit || selectedAssignedTo || 
    startDate || endDate || selectedIndustry || minAmount || maxAmount || selectedClosedBy || 
    currentPhase || totalPhases || selectedSource || selectedOutcome || selectedQualityRating || 
    archivedFrom || archivedTo;

  // Count active filters for grid layout
  const activeFiltersCount = [
    config.filters.showStatus,
    config.filters.showType,
    config.filters.showSalesUnit,
    config.filters.showAssignedTo,
    config.filters.showDateRange,
    config.filters.showIndustry,
    config.filters.showAmountRange,
    config.filters.showClosedBy,
    config.filters.showCurrentPhase,
    config.filters.showTotalPhases,
    config.filters.showSource,
    config.filters.showOutcome,
    config.filters.showQualityRating,
    config.filters.showArchivedDateRange
  ].filter(Boolean).length;

  // Determine grid columns based on filter count
  const getGridCols = () => {
    if (activeFiltersCount <= 3) return 'xl:grid-cols-3';
    if (activeFiltersCount <= 4) return 'xl:grid-cols-4';
    if (activeFiltersCount <= 5) return 'xl:grid-cols-5';
    if (activeFiltersCount <= 6) return 'xl:grid-cols-6';
    return 'xl:grid-cols-7';
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <form onSubmit={handleSearch} className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={config.searchPlaceholder}
                className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm`}
              />
            </div>
          </div>
          <button
            type="submit"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${config.theme.primary} hover:${config.theme.secondary} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${config.theme.ring}`}
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.theme.bg} ${config.theme.text}`}>
                Active
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-6 py-4 bg-gray-50">
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${getGridCols()} gap-4`}>
            
            {/* Status Filter */}
            {config.filters.showStatus && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    if (onStatusFilter) onStatusFilter(e.target.value);
                  }}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm`}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Type Filter */}
            {config.filters.showType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    if (onTypeFilter) onTypeFilter(e.target.value);
                  }}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm`}
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sales Unit Filter */}
            {config.filters.showSalesUnit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sales Unit
                </label>
                <select
                  value={selectedSalesUnit}
                  onChange={(e) => handleSalesUnitChange(e.target.value)}
                  disabled={isLoadingSalesUnits}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {isLoadingSalesUnits ? 'Loading...' : 'All Sales Units'}
                  </option>
                  {Array.isArray(salesUnits) && salesUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Assigned To Filter */}
            {config.filters.showAssignedTo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <select
                  value={selectedAssignedTo}
                  onChange={(e) => {
                    setSelectedAssignedTo(e.target.value);
                    if (onAssignedToFilter) onAssignedToFilter(e.target.value);
                  }}
                  disabled={isLoadingEmployees}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {isLoadingEmployees ? 'Loading...' : 'All Employees'}
                  </option>
                  {Array.isArray(employees) && employees.map((employee, index) => {
                    const employeeId = (employee.id || employee.employeeId || employee.userId || employee._id || index.toString()).toString();
                    const employeeName = employee.name || employee.fullName || 
                      (employee.firstName && employee.lastName ? `${employee.firstName} ${employee.lastName}` : null) || 
                      employee.email || `Employee ${index + 1}`;
                    
                    return (
                      <option key={employeeId} value={employeeId}>
                        {employeeName}
                      </option>
                    );
                  })}
                </select>
                {selectedSalesUnit && (
                  <p className="mt-1 text-xs text-gray-500">
                    Showing employees from selected sales unit
                  </p>
                )}
              </div>
            )}

            {/* Date Range Filter */}
            {config.filters.showDateRange && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onBlur={handleDateRangeChange}
                    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onBlur={handleDateRangeChange}
                    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm`}
                  />
                </div>
              </>
            )}

            {/* Industry Filter */}
            {config.filters.showIndustry && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => {
                    setSelectedIndustry(e.target.value);
                    if (onIndustryFilter) onIndustryFilter(e.target.value);
                  }}
                  disabled={isLoadingIndustries}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {isLoadingIndustries ? 'Loading...' : 'All Industries'}
                  </option>
                  {Array.isArray(industries) && industries.map((industry) => (
                    <option key={industry.id} value={industry.id}>
                      {industry.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Amount Range Filter */}
            {config.filters.showAmountRange && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Amount
                  </label>
                  <input
                    type="text"
                    value={minAmount}
                    onChange={(e) => handleAmountChange('min', e.target.value)}
                    placeholder="0.00"
                    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Amount
                  </label>
                  <input
                    type="text"
                    value={maxAmount}
                    onChange={(e) => handleAmountChange('max', e.target.value)}
                    placeholder="0.00"
                    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm`}
                  />
                </div>
              </>
            )}

            {/* Closed By Filter */}
            {config.filters.showClosedBy && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Closed By
                </label>
                <select
                  value={selectedClosedBy}
                  onChange={(e) => {
                    setSelectedClosedBy(e.target.value);
                    if (onClosedByFilter) onClosedByFilter(e.target.value);
                  }}
                  disabled={isLoadingEmployees}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {isLoadingEmployees ? 'Loading...' : 'All Employees'}
                  </option>
                  {Array.isArray(employees) && employees.map((employee, index) => {
                    const employeeId = (employee.id || employee.employeeId || employee.userId || employee._id || index.toString()).toString();
                    const employeeName = employee.name || employee.fullName || 
                      (employee.firstName && employee.lastName ? `${employee.firstName} ${employee.lastName}` : null) || 
                      employee.email || `Employee ${index + 1}`;
                    
                    return (
                      <option key={employeeId} value={employeeId}>
                        {employeeName}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Current Phase Filter */}
            {config.filters.showCurrentPhase && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Phase
                </label>
                <select
                  value={currentPhase}
                  onChange={(e) => {
                    setCurrentPhase(e.target.value);
                    if (onCurrentPhaseFilter) onCurrentPhaseFilter(e.target.value);
                  }}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm`}
                >
                  {phaseOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Total Phases Filter */}
            {config.filters.showTotalPhases && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Phases
                </label>
                <select
                  value={totalPhases}
                  onChange={(e) => {
                    setTotalPhases(e.target.value);
                    if (onTotalPhasesFilter) onTotalPhasesFilter(e.target.value);
                  }}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm`}
                >
                  {totalPhasesOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Source Filter */}
            {config.filters.showSource && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select
                  value={selectedSource}
                  onChange={(e) => {
                    setSelectedSource(e.target.value);
                    if (onSourceFilter) onSourceFilter(e.target.value);
                  }}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm`}
                >
                  {sourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Outcome Filter */}
            {config.filters.showOutcome && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outcome
                </label>
                <select
                  value={selectedOutcome}
                  onChange={(e) => {
                    setSelectedOutcome(e.target.value);
                    if (onOutcomeFilter) onOutcomeFilter(e.target.value);
                  }}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm`}
                >
                  {outcomeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quality Rating Filter */}
            {config.filters.showQualityRating && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quality Rating
                </label>
                <select
                  value={selectedQualityRating}
                  onChange={(e) => {
                    setSelectedQualityRating(e.target.value);
                    if (onQualityRatingFilter) onQualityRatingFilter(e.target.value);
                  }}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm`}
                >
                  {qualityRatingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Archived Date Range Filter */}
            {config.filters.showArchivedDateRange && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Archived From
                  </label>
                  <input
                    type="date"
                    value={archivedFrom}
                    onChange={(e) => setArchivedFrom(e.target.value)}
                    onBlur={handleArchivedDateRangeChange}
                    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Archived To
                  </label>
                  <input
                    type="date"
                    value={archivedTo}
                    onChange={(e) => setArchivedTo(e.target.value)}
                    onBlur={handleArchivedDateRangeChange}
                    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:${config.theme.ring} focus:${config.theme.primary} sm:text-sm`}
                  />
                </div>
              </>
            )}

          </div>

          {/* Filter Actions */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // Refresh data from API
                  window.location.reload();
                }}
                className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${config.theme.ring}`}
              >
                🔄 Refresh Data
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClearFilters}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${config.theme.ring}`}
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${config.theme.primary} hover:${config.theme.secondary} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${config.theme.ring}`}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsSearchFilters;
