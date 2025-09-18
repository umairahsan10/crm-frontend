import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import EmployeeList from '../../components/previous_components/EmployeeList/EmployeeList';
import EmployeeForm from '../../components/previous_components/EmployeeForm/EmployeeForm';
import { 
  getEmployeesApi, 
  createEmployeeApi, 
  updateEmployeeApi, 
  deleteEmployeeApi,
  type Employee,
  type CreateEmployeeDto,
  type UpdateEmployeeDto,
  type GetEmployeesDto
} from '../../apis/hr-employees';
import Loading from '../../components/common/Loading/Loading';
import './EmployeesPage.css';

const EmployeesPage: React.FC = () => {
  const { user } = useAuth();
  
  // State management
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<GetEmployeesDto>({
    page: 1,
    limit: 10
  });

  // Fetch employees from API
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching employees with filters:', filters);
      
      const response = await getEmployeesApi(filters);
      
      if (response.success && response.data) {
        setEmployees(response.data.employees);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages
        });
      } else {
        throw new Error('Failed to fetch employees');
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load employees on component mount and when filters change
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Handle employee operations
  const handleEdit = (employee: any) => {
    // Find the original employee from our state using the ID
    const originalEmployee = employees.find(emp => emp.id.toString() === employee.id);
    if (originalEmployee) {
      console.log('Edit employee:', originalEmployee);
      setEditingEmployee(originalEmployee);
      setShowEmployeeForm(true);
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowEmployeeForm(true);
  };

  const handleCloseEmployeeForm = () => {
    setShowEmployeeForm(false);
    setEditingEmployee(null);
  };

  const handleSaveEmployee = async (employeeData: CreateEmployeeDto | UpdateEmployeeDto) => {
    try {
      if (editingEmployee) {
        // Update existing employee
        await updateEmployeeApi(editingEmployee.id, employeeData as UpdateEmployeeDto);
        console.log('Employee updated successfully');
      } else {
        // Create new employee
        await createEmployeeApi(employeeData as CreateEmployeeDto);
        console.log('Employee created successfully');
      }
      
      // Refresh the employee list
      await fetchEmployees();
      handleCloseEmployeeForm();
    } catch (err) {
      console.error('Error saving employee:', err);
      setError(err instanceof Error ? err.message : 'Failed to save employee');
    }
  };

  const handleDeleteEmployee = async (employee: any) => {
    const employeeId = parseInt(employee.id);
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployeeApi(employeeId);
        console.log('Employee deleted successfully');
        // Refresh the employee list
        await fetchEmployees();
      } catch (err) {
        console.error('Error deleting employee:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete employee');
      }
    }
  };


  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Check if user has access to employees page
  const hasAccess = user && (
    user.role === 'admin' || 
    user.role === 'dept_manager' || 
    user.role === 'team_leads' ||
    (user.department && user.department.toLowerCase() === 'hr')
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Loading
          isLoading={true}
          position="centered"
          text="Loading employees..."
          theme="light"
          size="lg"
          minHeight="100vh"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error loading employees</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
            <div className="mt-4">
              <button
                onClick={() => fetchEmployees()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You don't have permission to access the employees page. Only HR department employees and managers can view this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  const getPageTitle = () => {
    if (user?.role === 'admin') return 'Admin Employee Management';
    if (user?.department?.toLowerCase() === 'hr') return 'HR Employee Management';
    return 'Employee Management';
  };

  return (
    <>
      <div className="employees-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1>{getPageTitle()}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Total: {pagination.total} employees
            </span>
          </div>
        </div>
        
        <div className="table-with-button">
          <div className="table-button-container">
            <h2 className="section-label">Employee List</h2>
            <button className="btn-add-employee" onClick={handleAddEmployee}>
              Add Employee
            </button>
          </div>
          
          <EmployeeList 
            employees={employees.map(emp => ({
              id: emp.id.toString(),
              name: `${emp.firstName} ${emp.lastName}`,
              email: emp.email,
              phone: emp.phone || '',
              gender: 'other' as const,
              cnic: '',
              department: emp.department.name,
              role_id: emp.role.name,
              manager: emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : '',
              team_lead: emp.teamLead ? `${emp.teamLead.firstName} ${emp.teamLead.lastName}` : '',
              address: emp.address || '',
              marital_status: 'single' as const,
              status: emp.isActive ? 'active' as const : 'inactive' as const,
              start_date: emp.startDate,
              mode_of_work: 'office' as const,
              dob: '',
              emergency_contact: '',
              shift_start: emp.shiftStart || '09:00',
              shift_end: emp.shiftEnd || '17:00',
              employment_type: 'full-time' as const,
              period_type: 'permanent' as const,
              created_at: emp.createdAt,
              updated_at: emp.updatedAt,
              password_hash: ''
            }))} 
            onEdit={handleEdit}
            onDelete={handleDeleteEmployee}
          />
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination-container">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Employee Form Modal */}
      {showEmployeeForm && (
        <div className="modal-overlay" onClick={handleCloseEmployeeForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>{editingEmployee ? 'Edit Employee' : 'New Employee'}</span>
              <button className="close-btn" type="button" onClick={handleCloseEmployeeForm}>×</button>
            </div>
            <div className="modal-body">
              <EmployeeForm 
                onClose={handleCloseEmployeeForm}
                onSave={handleSaveEmployee}
                employee={editingEmployee}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeesPage; 