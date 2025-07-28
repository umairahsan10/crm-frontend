import React, { useState, useMemo } from 'react';
import './EmployeeList.css';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  cnic: string;
  department: string;
  role_id: string;
  manager: string;
  team_lead: string;
  address: string;
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  status: 'active' | 'inactive' | 'pending' | 'terminated';
  start_date: string;
  end_date?: string;
  mode_of_work: 'office' | 'remote' | 'hybrid';
  remote_days_allowed?: number;
  dob: string;
  emergency_contact: string;
  shift_start: string;
  shift_end: string;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'intern';
  date_of_confirmation?: string;
  period_type: 'permanent' | 'probation' | 'contract';
  created_at: string;
  updated_at: string;
  password_hash: string;
  bonus?: number;
  [key: string]: any; // Allow additional custom fields
}

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, employee: Employee) => React.ReactNode;
}

export interface FilterOption {
  key: string;
  label: string;
  value: string;
}

export interface EmployeeListProps {
  // Data props
  employees: Employee[];
  columns?: Column[];
  
  // Styling props
  className?: string;
  containerClassName?: string;
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
  
  // Configuration props
  showSearch?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  itemsPerPage?: number;
  sortable?: boolean;
  
  // Filter options
  departmentFilters?: FilterOption[];
  statusFilters?: FilterOption[];
  
  // Callback props
  onRowClick?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  onStatusChange?: (employee: Employee, newStatus: string) => void;
  
  // Custom render props
  renderActions?: (employee: Employee) => React.ReactNode;
  renderStatus?: (status: string) => React.ReactNode;
  
  // Loading and empty states
  loading?: boolean;
  emptyMessage?: string;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  columns = [],
  className = '',
  containerClassName = '',
  tableClassName = '',
  headerClassName = '',
  rowClassName = '',
  showSearch = true,
  showFilters = true,
  showPagination = true,
  itemsPerPage = 10,
  sortable = true,
  departmentFilters = [],
  statusFilters = [],
  onRowClick,
  onEdit,
  onDelete,
  renderActions,
  renderStatus,
  loading = false,
  emptyMessage = 'No employees found'
}) => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Default columns if none provided
  const defaultColumns: Column[] = [
    { key: 'name', label: 'First Name', sortable: true, filterable: true, width: '120px' },
    { key: 'lastname', label: 'Last Name', sortable: true, filterable: true, width: '120px' },
    { key: 'email', label: 'Email', sortable: true, filterable: true, width: '180px' },
    { key: 'phone', label: 'Phone', sortable: true, filterable: true, width: '130px' },
    { key: 'gender', label: 'Gender', sortable: true, filterable: true, width: '80px' },
    { key: 'cnic', label: 'CNIC', sortable: true, filterable: false, width: '140px' },
    { key: 'department', label: 'Department', sortable: true, filterable: true, width: '120px' },
    { key: 'role_id', label: 'Role', sortable: true, filterable: true, width: '100px' },
    { key: 'manager', label: 'Manager', sortable: true, filterable: false, width: '100px' },
    { key: 'team_lead', label: 'Team Lead', sortable: true, filterable: false, width: '100px' },
    { key: 'address', label: 'Address', sortable: false, filterable: false, width: '200px' },
    { key: 'marital_status', label: 'Marital Status', sortable: true, filterable: false, width: '120px' },
    { key: 'status', label: 'Status', sortable: true, filterable: true, width: '100px' },
    { key: 'start_date', label: 'Start Date', sortable: true, filterable: false, width: '100px' },
    { key: 'end_date', label: 'End Date', sortable: true, filterable: false, width: '100px' },
    { key: 'mode_of_work', label: 'Mode of Work', sortable: true, filterable: false, width: '120px' },
    { key: 'remote_days_allowed', label: 'Remote Days', sortable: true, filterable: false, width: '100px' },
    { key: 'dob', label: 'Date of Birth', sortable: true, filterable: false, width: '120px' },
    { key: 'emergency_contact', label: 'Emergency Contact', sortable: false, filterable: false, width: '140px' },
    { key: 'shift_start', label: 'Shift Start', sortable: true, filterable: false, width: '100px' },
    { key: 'shift_end', label: 'Shift End', sortable: true, filterable: false, width: '100px' },
    { key: 'employment_type', label: 'Employment Type', sortable: true, filterable: true, width: '120px' },
    { key: 'date_of_confirmation', label: 'Confirmation Date', sortable: true, filterable: false, width: '140px' },
    { key: 'period_type', label: 'Period Type', sortable: true, filterable: false, width: '100px' },
    { key: 'created_at', label: 'Created At', sortable: true, filterable: false, width: '120px' },
    { key: 'updated_at', label: 'Updated At', sortable: true, filterable: false, width: '120px' },
    { key: 'password_hash', label: 'Password Hash', sortable: false, filterable: false, width: '150px' },
    { key: 'bonus', label: 'Bonus', sortable: true, filterable: false, width: '80px' },
    { key: 'actions', label: 'Actions', sortable: false, filterable: false, width: '120px' }
  ];

  const displayColumns = columns.length > 0 ? columns : defaultColumns;

  // Filter and sort employees
  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees.filter(employee => {
      const matchesSearch = !searchTerm || 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.role_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employment_type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !selectedDepartment || employee.department === selectedDepartment;
      const matchesStatus = !selectedStatus || employee.status === selectedStatus;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });

    // Sort employees
    if (sortField && sortable) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [employees, searchTerm, selectedDepartment, selectedStatus, sortField, sortDirection, sortable]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = showPagination 
    ? filteredAndSortedEmployees.slice(startIndex, startIndex + itemsPerPage)
    : filteredAndSortedEmployees;

  // Handle sorting
  const handleSort = (field: string) => {
    if (!sortable) return;
    
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle row click
  const handleRowClick = (employee: Employee) => {
    if (onRowClick) {
      onRowClick(employee);
    }
  };

  // Render cell content
  const renderCell = (employee: Employee, column: Column) => {
    const value = employee[column.key];
    
    if (column.render) {
      return column.render(value, employee);
    }

    switch (column.key) {
      case 'status':
        return renderStatus ? renderStatus(value) : (
          <span className={`status-badge status-${value}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      
      case 'start_date':
      case 'end_date':
      case 'date_of_confirmation':
      case 'created_at':
      case 'updated_at':
        return value ? new Date(value).toLocaleDateString() : '-';
      
      case 'employment_type':
        return (
          <span className={`employment-badge employment-${value.replace('-', '-')}`}>
            {value.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </span>
        );
      
      case 'phone':
        return value || '-';
      
      case 'gender':
        return value ? value.charAt(0).toUpperCase() + value.slice(1) : '-';
      
      case 'dob':
        return value ? new Date(value).toLocaleDateString() : '-';
      
      case 'shift_start':
      case 'shift_end':
        return value || '-';
      
      case 'mode_of_work':
        return value ? value.charAt(0).toUpperCase() + value.slice(1) : '-';
      
      case 'marital_status':
        return value ? value.charAt(0).toUpperCase() + value.slice(1) : '-';
      
      case 'period_type':
        return value ? value.charAt(0).toUpperCase() + value.slice(1) : '-';
      
      case 'bonus':
        return value ? `$${value.toLocaleString()}` : '-';
      
      case 'password_hash':
        return value ? '••••••••' : '-';
      
      case 'actions':
        return renderActions ? renderActions(employee) : (
          <div className="action-buttons">
            {onEdit && (
              <button 
                className="action-btn edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(employee);
                }}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button 
                className="action-btn delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(employee);
                }}
              >
                Delete
              </button>
            )}
          </div>
        );
      
      default:
        return value || '-';
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedStatus('');
    setSortField('');
    setSortDirection('asc');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className={`employee-list-container ${containerClassName}`}>
        <div className="loading-spinner">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className={`employee-list ${className}`}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="employee-list-controls">
          {showSearch && (
            <div className="search-container">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          )}
          
          {showFilters && (
            <div className="filters-container">
              {departmentFilters.length > 0 && (
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Departments</option>
                  {departmentFilters.map(filter => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              )}
              
              {statusFilters.length > 0 && (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Statuses</option>
                  {statusFilters.map(filter => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              )}
              
              <button onClick={resetFilters} className="reset-filters-btn">
                Reset
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="results-count">
        Showing {filteredAndSortedEmployees.length} of {employees.length} employees
      </div>

      {/* Employee Table */}
      <div className={`employee-table-container ${containerClassName}`}>
        <table className={`employee-table ${tableClassName}`}>
          <thead className={headerClassName}>
            <tr>
              {displayColumns.map(column => (
                <th
                  key={column.key}
                  className={`table-header ${column.sortable && sortable ? 'sortable' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  {column.label}
                  {column.sortable && sortable && sortField === column.key && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map(employee => (
                <tr
                  key={employee.id}
                  className={`table-row ${rowClassName} ${onRowClick ? 'clickable' : ''}`}
                  onClick={() => handleRowClick(employee)}
                >
                  {displayColumns.map(column => (
                    <td key={column.key} className="table-cell">
                      {renderCell(employee, column)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={displayColumns.length} className="empty-message">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeList; 