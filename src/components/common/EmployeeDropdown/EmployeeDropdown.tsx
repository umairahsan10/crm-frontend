import React, { useState, useEffect, useRef } from 'react';
import { apiGetJson } from '../../../utils/apiClient';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department?: {
    id: number;
    name: string;
  };
  role?: {
    id: number;
    name: string;
  };
}

interface EmployeeDropdownProps {
  value?: string;
  onChange: (employeeId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showDetails?: boolean; // Show name, email, department, role in dropdown
  filterByDepartment?: string; // Optional department filter
}

const EmployeeDropdown: React.FC<EmployeeDropdownProps> = ({
  value,
  onChange,
  placeholder = 'All Employees',
  disabled = false,
  className = '',
  showDetails = true,
  filterByDepartment,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const responseData = await apiGetJson<any>('/employee/all-employees');
        const employeesData = responseData.data || [];
        
        let filteredEmployees = employeesData;
        
        // Filter by department if specified
        if (filterByDepartment) {
          filteredEmployees = employeesData.filter((emp: Employee) => 
            emp.department?.name?.toLowerCase() === filterByDepartment.toLowerCase()
          );
        }
        
        setEmployees(filteredEmployees);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [filterByDepartment]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter employees based on search query
  const filteredEmployees = React.useMemo(() => {
    if (!searchQuery.trim()) return employees;
    
    const query = searchQuery.toLowerCase();
    return employees.filter(employee => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const email = employee.email.toLowerCase();
      const department = employee.department?.name?.toLowerCase() || '';
      const role = employee.role?.name?.toLowerCase() || '';
      
      return fullName.includes(query) || 
             email.includes(query) || 
             department.includes(query) ||
             role.includes(query);
    });
  }, [employees, searchQuery]);

  const selectedEmployee = employees.find(emp => emp.id.toString() === value);

  const handleSelect = (employeeId: string) => {
    onChange(employeeId);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`
          w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          disabled:opacity-50 disabled:cursor-not-allowed
          bg-white hover:bg-gray-50
          ${className}
        `}
      >
        {isLoading ? (
          <span className="text-gray-500">Loading employees...</span>
        ) : selectedEmployee ? (
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {showDetails ? (
                <div>
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {selectedEmployee.email}
                    {selectedEmployee.department && ` • ${selectedEmployee.department.name}`}
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-900">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </span>
              )}
            </div>
            <svg className="ml-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Employee List */}
          <div className="py-1">
            {/* All Employees Option */}
            <button
              type="button"
              onClick={() => handleSelect('')}
              className={`
                w-full px-4 py-2 text-left text-sm hover:bg-gray-100
                ${!value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
              `}
            >
              {placeholder}
            </button>

            {/* Employee Options */}
            {filteredEmployees.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 text-center">
                No employees found
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => handleSelect(employee.id.toString())}
                  className={`
                    w-full px-4 py-2 text-left hover:bg-gray-100
                    ${value === employee.id.toString() ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
                  `}
                >
                  {showDetails ? (
                    <div>
                      <div className="text-sm font-medium">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {employee.email}
                        {employee.department && ` • ${employee.department.name}`}
                        {employee.role && ` • ${employee.role.name}`}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm">
                      {employee.firstName} {employee.lastName}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDropdown;

