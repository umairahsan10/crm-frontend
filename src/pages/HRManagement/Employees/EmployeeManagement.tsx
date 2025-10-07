import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavbar } from '../../../context/NavbarContext';
import BulkActions, { type BulkAction } from '../../../components/common/BulkActions/BulkActions';
import DataStatistics from '../../../components/common/Statistics/DataStatistics';
import EmployeesTable from '../../../components/employees/EmployeesTable';
import EmployeesFilters from '../../../components/employees/EmployeesFilters';
import EmployeeDetailsDrawer from '../../../components/employees/EmployeeDetailsDrawer';
import CreateEmployeeForm from '../../../components/previous_components/EmployeeForm/EmployeeForm';
import CreateEmployeeWizard from '../../../components/employees/CreateEmployeeWizard/CreateEmployeeWizard';
import { 
  getEmployeesApi, 
  terminateEmployeeApi,
  updateEmployeeApi,
  createEmployeeApi,
  getDepartmentsApi,
  getRolesApi,
  getEmployeeStatisticsApi,
  type Employee,
  type Department,
  type Role,
  type GetEmployeesDto,
  type UpdateEmployeeDto,
  type EmployeeStatistics
} from '../../../apis/hr-employees';
import './EmployeeManagement.css';

const EmployeeManagement: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { isNavbarOpen } = useNavbar();
  
  // State management
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [employeeToTerminate, setEmployeeToTerminate] = useState<Employee | null>(null);
  const [terminationData, setTerminationData] = useState({
    termination_date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    departmentId: '',
    roleId: '',
    status: '',
    employmentType: '',
    modeOfWork: ''
  });

  // Data state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [statistics, setStatistics] = useState<EmployeeStatistics>({
    total: 0,
    active: 0,
    inactive: 0,
    byDepartment: {},
    byRole: {},
    byGender: {},
    byEmploymentType: {},
    byModeOfWork: {},
    byMaritalStatus: {},
    averageAge: 0,
    averageBonus: 0,
    thisMonth: {
      new: 0,
      active: 0,
      inactive: 0
    }
  });

  // Statistics cards
  const statisticsCards = [
    {
      title: 'Total Employees',
      value: statistics.total,
      color: 'blue' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      )
    },
    {
      title: `Page ${currentPage} Employees`,
      value: employees.length,
      color: 'blue' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Active Employees',
      value: statistics.active,
      color: 'green' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Inactive Employees',
      value: statistics.inactive,
      color: 'red' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'New This Month',
      value: statistics.thisMonth.new,
      color: 'purple' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Average Age',
      value: `${statistics.averageAge} years`,
      color: 'indigo' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Average Bonus',
      value: `$${statistics.averageBonus.toLocaleString()}`,
      color: 'yellow' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  // Bulk actions configuration
  const bulkActions: BulkAction[] = [
    {
      id: 'activate',
      label: 'Activate',
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
      variant: 'primary',
      onClick: (selectedIds) => handleBulkActivate(selectedIds),
      confirmMessage: `Are you sure you want to activate the selected employee(s)?`
    },
    {
      id: 'deactivate',
      label: 'Deactivate',
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>,
      variant: 'warning',
      onClick: (selectedIds) => handleBulkDeactivate(selectedIds),
      confirmMessage: `Are you sure you want to deactivate the selected employee(s)?`
    },
    {
      id: 'terminate',
      label: 'Terminate Selected',
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" clipRule="evenodd" /></svg>,
      variant: 'danger',
      onClick: (selectedIds) => handleBulkTerminate(selectedIds),
      confirmMessage: `Are you sure you want to terminate the selected employee(s)? This will process their final salary and mark them as terminated.`
    }
  ];

  // Fetch employees with current filters
  const fetchEmployees = useCallback(async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      
      const queryParams: GetEmployeesDto = {
        page,
        limit: itemsPerPage,
        search: filters.search || undefined,
        departmentId: filters.departmentId ? parseInt(filters.departmentId) : undefined,
        roleId: filters.roleId ? parseInt(filters.roleId) : undefined,
        status: filters.status || undefined,
        employmentType: filters.employmentType || undefined,
        modeOfWork: filters.modeOfWork || undefined
      };
      
      const response = await getEmployeesApi(queryParams);
      
      setEmployees(response.employees);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
      setCurrentPage(response.page);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load employees'
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, itemsPerPage]);

  // Fetch statistics from API
  const fetchStatistics = async () => {
    try {
      const response = await getEmployeeStatisticsApi();
      console.log('📊 Statistics response:', response);
      
      if (response && response.statistics) {
        setStatistics(response.statistics);
      } else {
        console.warn('Statistics response has unexpected format:', response);
        // Set empty statistics if response is malformed
        setStatistics({
          total: 0,
          active: 0,
          inactive: 0,
          byDepartment: {},
          byRole: {},
          byGender: {},
          byEmploymentType: {},
          byModeOfWork: {},
          byMaritalStatus: {},
          averageAge: 0,
          averageBonus: 0,
          thisMonth: {
            new: 0,
            active: 0,
            inactive: 0
          }
        });
      }
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      
      // Don't show error notification, just log it
      console.warn('Statistics endpoint not available, using default values');
      
      // Set default statistics
      setStatistics({
        total: 0,
        active: 0,
        inactive: 0,
        byDepartment: {},
        byRole: {},
        byGender: {},
        byEmploymentType: {},
        byModeOfWork: {},
        byMaritalStatus: {},
        averageAge: 0,
        averageBonus: 0,
        thisMonth: {
          new: 0,
          active: 0,
          inactive: 0
        }
      });
    }
  };

  // Fetch departments from API
  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const response = await getDepartmentsApi({ limit: 100 });
      setDepartments(response.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load departments'
      });
      setDepartments([
        { id: 1, name: 'Sales' },
        { id: 2, name: 'Accounts' },
        { id: 3, name: 'HR' },
        { id: 4, name: 'Production' },
        { id: 5, name: 'Marketing' }
      ]);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await getRolesApi({ limit: 100 });
      setRoles(response.roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load roles'
      });
      setRoles([
        { id: 1, name: 'Manager' },
        { id: 2, name: 'Team Lead' },
        { id: 3, name: 'Unit Head' },
        { id: 4, name: 'Senior' },
        { id: 5, name: 'Junior' }
      ]);
    } finally {
      setRolesLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDepartments();
    fetchRoles();
    fetchEmployees();
    fetchStatistics();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchEmployees(1);
  }, [filters, fetchEmployees]);

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchEmployees(page);
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDrawerOpen(true);
  };

  const handleBulkSelect = (employeeIds: string[]) => {
    setSelectedEmployees(employeeIds);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      departmentId: '',
      roleId: '',
      status: '',
      employmentType: '',
      modeOfWork: ''
    });
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setShowWizard(true);
  };

  const handleWizardSuccess = () => {
    setNotification({
      type: 'success',
      message: 'Employee created successfully with all related records!'
    });
    setShowWizard(false);
    fetchEmployees(currentPage);
    fetchStatistics();
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDrawerOpen(false);
    setShowCreateForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setSelectedEmployee(null);
  };

  const handleTerminateEmployee = async (employee: Employee) => {
    setEmployeeToTerminate(employee);
    setDrawerOpen(false);
    setShowTerminateModal(true);
  };

  const handleConfirmTermination = async () => {
    if (!employeeToTerminate) return;
    
    setIsDeleting(true);
    try {
      await terminateEmployeeApi({
        employee_id: employeeToTerminate.id,
        termination_date: terminationData.termination_date,
        description: terminationData.description || 'Employee terminated'
      });
      
      setNotification({
        type: 'success',
        message: 'Employee terminated successfully and final salary processed'
      });
      
      setShowTerminateModal(false);
      setSelectedEmployee(null);
      setEmployeeToTerminate(null);
      setTerminationData({
        termination_date: new Date().toISOString().split('T')[0],
        description: ''
      });
      
      fetchEmployees(currentPage);
      fetchStatistics();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to terminate employee'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkActivate = async (employeeIds: string[]) => {
    try {
      const updatePromises = employeeIds.map(id => 
        updateEmployeeApi(parseInt(id), { status: 'active' } as UpdateEmployeeDto)
      );
      await Promise.all(updatePromises);
      
      setNotification({
        type: 'success',
        message: `Successfully activated ${employeeIds.length} employees`
      });
      setSelectedEmployees([]);
      fetchEmployees(currentPage);
      fetchStatistics();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to activate employees'
      });
    }
  };

  const handleBulkDeactivate = async (employeeIds: string[]) => {
    try {
      const updatePromises = employeeIds.map(id => 
        updateEmployeeApi(parseInt(id), { status: 'inactive' } as UpdateEmployeeDto)
      );
      await Promise.all(updatePromises);
      
      setNotification({
        type: 'success',
        message: `Successfully deactivated ${employeeIds.length} employees`
      });
      setSelectedEmployees([]);
      fetchEmployees(currentPage);
      fetchStatistics();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to deactivate employees'
      });
    }
  };

  const handleBulkTerminate = async (employeeIds: string[]) => {
    try {
      const terminatePromises = employeeIds.map(id => 
        terminateEmployeeApi({
          employee_id: parseInt(id),
          termination_date: new Date().toISOString().split('T')[0],
          description: 'Bulk termination'
        })
      );
      await Promise.all(terminatePromises);
      
      setNotification({
        type: 'success',
        message: `Successfully terminated ${employeeIds.length} employees`
      });
      setSelectedEmployees([]);
      fetchEmployees(currentPage);
      fetchStatistics();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to terminate employees'
      });
    }
  };

  const handleEmployeeCreated = async (employeeData: any) => {
    try {
      const requiredPermission = employeeData.isEdit ? 'employee_edit_permission' : 'employee_add_permission';
      if (!hasPermission(requiredPermission)) {
        setNotification({
          type: 'error',
          message: `Missing required permissions: ${requiredPermission}`
        });
        return;
      }

      if (employeeData.isEdit && employeeData.employeeId) {
        const updateData: UpdateEmployeeDto = {
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          email: employeeData.email,
          phone: employeeData.phone,
          gender: employeeData.gender,
          cnic: employeeData.cnic,
          address: employeeData.address,
          maritalStatus: employeeData.maritalStatus,
          dob: employeeData.dob,
          emergencyContact: employeeData.emergencyContact,
          departmentId: employeeData.departmentId,
          roleId: employeeData.roleId,
          managerId: employeeData.managerId,
          teamLeadId: employeeData.teamLeadId,
          status: employeeData.status,
          startDate: employeeData.startDate,
          endDate: employeeData.endDate,
          employmentType: employeeData.employmentType,
          modeOfWork: employeeData.modeOfWork,
          remoteDaysAllowed: employeeData.remoteDaysAllowed,
          periodType: employeeData.periodType,
          dateOfConfirmation: employeeData.dateOfConfirmation,
          shiftStart: employeeData.shiftStart,
          shiftEnd: employeeData.shiftEnd,
          bonus: employeeData.bonus
        };

        await updateEmployeeApi(employeeData.employeeId, updateData);
        
        setNotification({
          type: 'success',
          message: 'Employee updated successfully!'
        });
      } else {
        const createData = {
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          email: employeeData.email,
          gender: employeeData.gender,
          departmentId: employeeData.departmentId,
          roleId: employeeData.roleId,
          ...(employeeData.passwordHash && { passwordHash: employeeData.passwordHash }),
          ...(employeeData.phone && { phone: employeeData.phone }),
          ...(employeeData.cnic && { cnic: employeeData.cnic }),
          ...(employeeData.address && { address: employeeData.address }),
          ...(employeeData.maritalStatus !== undefined && { maritalStatus: employeeData.maritalStatus }),
          ...(employeeData.dob && { dob: employeeData.dob }),
          ...(employeeData.emergencyContact && { emergencyContact: employeeData.emergencyContact }),
          ...(employeeData.managerId && { managerId: employeeData.managerId }),
          ...(employeeData.teamLeadId && { teamLeadId: employeeData.teamLeadId }),
          ...(employeeData.status && { status: employeeData.status }),
          ...(employeeData.startDate && { startDate: employeeData.startDate }),
          ...(employeeData.endDate && { endDate: employeeData.endDate }),
          ...(employeeData.employmentType && { employmentType: employeeData.employmentType }),
          ...(employeeData.modeOfWork && { modeOfWork: employeeData.modeOfWork }),
          ...(employeeData.remoteDaysAllowed && { remoteDaysAllowed: employeeData.remoteDaysAllowed }),
          ...(employeeData.periodType && { periodType: employeeData.periodType }),
          ...(employeeData.dateOfConfirmation && { dateOfConfirmation: employeeData.dateOfConfirmation }),
          ...(employeeData.shiftStart && { shiftStart: employeeData.shiftStart }),
          ...(employeeData.shiftEnd && { shiftEnd: employeeData.shiftEnd }),
          ...(employeeData.bonus && { bonus: employeeData.bonus })
        };

        await createEmployeeApi(createData);
        
        setNotification({
          type: 'success',
          message: 'Employee created successfully!'
        });
      }
      
      fetchEmployees(currentPage);
      fetchStatistics();
      setShowCreateForm(false);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save employee'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Auto-dismiss notifications after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Check if user has access to employees page
  const hasAccess = user && (
    user.role === 'admin' || 
    user.role === 'dept_manager' || 
    user.role === 'team_leads' ||
    (user.department && user.department.toLowerCase() === 'hr')
  );

  // Access denied
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to access the employees page. Only HR department employees and managers can view this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage and track your employees with advanced filtering and bulk operations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showStatistics ? 'Hide Stats' : 'Show Stats'}
              </button>
              <button
                onClick={handleAddEmployee}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Employee
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {showStatistics && (
          <div className="mb-8">
            <DataStatistics 
              title={`Employee Statistics - Overall (Page ${currentPage} of ${totalPages} showing ${employees.length} of ${totalItems} employees)`}
              cards={statisticsCards} 
              loading={isLoading}
            />
            
            {/* Page Information */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Current Page Information</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing employees {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} total employees
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
                  <div className="text-sm text-gray-500">employees on this page</div>
                </div>
              </div>
            </div>

            {/* Additional Statistics Sections */}
            <div className="mt-8">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Breakdown by Category (Overall)</h3>
                <p className="text-sm text-gray-600">Statistics from all employees in the system</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Breakdown */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">By Department</h3>
                  <div className="space-y-3">
                    {Object.entries(statistics.byDepartment).map(([dept, count]) => (
                      <div key={dept} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">{dept}</span>
                        <span className="text-sm font-bold text-blue-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

              {/* Role Breakdown */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">By Role</h3>
                <div className="space-y-3">
                  {Object.entries(statistics.byRole).map(([role, count]) => (
                    <div key={role} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 capitalize">{role.replace('_', ' ')}</span>
                      <span className="text-sm font-bold text-green-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Breakdown */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">By Gender</h3>
                <div className="space-y-3">
                  {Object.entries(statistics.byGender).map(([gender, count]) => (
                    <div key={gender} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 capitalize">{gender}</span>
                      <span className="text-sm font-bold text-purple-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employment Type Breakdown */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">By Employment Type</h3>
                <div className="space-y-3">
                  {Object.entries(statistics.byEmploymentType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                      <span className="text-sm font-bold text-yellow-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mode of Work Breakdown */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">By Mode of Work</h3>
                <div className="space-y-3">
                  {Object.entries(statistics.byModeOfWork).map(([mode, count]) => (
                    <div key={mode} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 capitalize">{mode.replace('_', ' ')}</span>
                      <span className="text-sm font-bold text-indigo-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marital Status Breakdown */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">By Marital Status</h3>
                <div className="space-y-3">
                  {Object.entries(statistics.byMaritalStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">{status}</span>
                      <span className="text-sm font-bold text-pink-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
              </div>
        )}

        {/* Filters */}
        <EmployeesFilters
          search={filters.search}
          departmentId={filters.departmentId}
          roleId={filters.roleId}
          status={filters.status}
          employmentType={filters.employmentType}
          modeOfWork={filters.modeOfWork}
          onSearchChange={(value: string) => setFilters(prev => ({ ...prev, search: value }))}
          onDepartmentFilter={(value: string) => setFilters(prev => ({ ...prev, departmentId: value }))}
          onRoleFilter={(value: string) => setFilters(prev => ({ ...prev, roleId: value }))}
          onStatusFilter={(value: string) => setFilters(prev => ({ ...prev, status: value }))}
          onEmploymentTypeFilter={(value: string) => setFilters(prev => ({ ...prev, employmentType: value }))}
          onModeOfWorkFilter={(value: string) => setFilters(prev => ({ ...prev, modeOfWork: value }))}
          onClearFilters={handleClearFilters}
          departments={departments}
          roles={roles}
          departmentsLoading={departmentsLoading}
          rolesLoading={rolesLoading}
        />

        {/* Bulk Actions */}
        <div className="mb-6">
          <BulkActions
            selectedItems={selectedEmployees}
            actions={bulkActions}
            onClearSelection={() => setSelectedEmployees([])}
          />
        </div>

        {/* Employees Table */}
        <EmployeesTable
          employees={employees}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onEmployeeClick={handleEmployeeClick}
          onBulkSelect={handleBulkSelect}
          selectedEmployees={selectedEmployees}
        />

        {/* Employee Details Drawer */}
        <EmployeeDetailsDrawer
          employee={selectedEmployee}
          isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedEmployee(null);
          }}
          onEdit={handleEditEmployee}
          onTerminate={handleTerminateEmployee}
          isDeleting={isDeleting}
        />

        {/* Create Employee Wizard */}
        {showWizard && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowWizard(false)}></div>
              
              <div 
                className={`relative bg-white rounded-lg text-left shadow-xl transform transition-all ${
                  isNavbarOpen ? 'navbar-open-modal' : 'navbar-closed-modal'
                }`}
                style={{
                  width: '900px',
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  marginLeft: isNavbarOpen ? '200px' : '0px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CreateEmployeeWizard
                  onClose={() => setShowWizard(false)}
                  onSuccess={handleWizardSuccess}
                />
              </div>
            </div>
          </div>
        )}

        {/* Edit Employee Modal (Old Form) */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseForm}></div>
              
              <div 
                className={`relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all ${
                  isNavbarOpen ? 'navbar-open-modal' : 'navbar-closed-modal'
                }`}
                style={{
                  width: '800px',
                  maxWidth: '90vw',
                  maxHeight: '85vh',
                  marginLeft: isNavbarOpen ? '200px' : '0px'
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedEmployee ? 'Edit Employee' : 'Create New Employee'}
                    </h3>
                    <button
                      onClick={handleCloseForm}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <CreateEmployeeForm
                      onClose={handleCloseForm}
                      onSave={handleEmployeeCreated}
                      employee={selectedEmployee}
                      departments={departments}
                      roles={roles}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
            notification.type === 'success' ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'
          }`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className={`text-sm font-medium ${
                    notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={handleCloseNotification}
                    className={`bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      notification.type === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'
                    }`}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Termination Modal */}
        {showTerminateModal && employeeToTerminate && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
            style={{
              paddingLeft: isNavbarOpen ? '250px' : '70px',
              paddingRight: '20px'
            }}
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <div 
                className={`p-5 border w-96 shadow-lg rounded-md bg-white ${
                  isNavbarOpen ? 'navbar-open-modal' : 'navbar-closed-modal'
                }`}
              >
                <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Terminate Employee</h3>
                  <button
                    onClick={() => setShowTerminateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Terminating: <span className="font-semibold">{employeeToTerminate.firstName} {employeeToTerminate.lastName}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    This will process their final salary and mark them as terminated.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Termination Date
                  </label>
                  <input
                    type="date"
                    value={terminationData.termination_date}
                    onChange={(e) => setTerminationData(prev => ({ ...prev, termination_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason/Description
                  </label>
                  <textarea
                    value={terminationData.description}
                    onChange={(e) => setTerminationData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter termination reason..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowTerminateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmTermination}
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    {isDeleting ? 'Terminating...' : 'Terminate Employee'}
                  </button>
                </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;
