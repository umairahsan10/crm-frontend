import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import BulkActions, { type BulkAction } from '../../../components/common/BulkActions/BulkActions';
import DataStatistics from '../../../components/common/Statistics/DataStatistics';
import EmployeesTable from '../../../components/employees/EmployeesTable';
import GenericEmployeeFilters from '../../../components/employees/GenericEmployeeFilters';
import EmployeeDetailsDrawer from '../../../components/employees/EmployeeDetailsDrawer';
import CreateEmployeeDrawer from '../../../components/employees/CreateEmployeeDrawer';
import EditEmployeeDrawer from '../../../components/employees/EditEmployeeDrawer';
import Loading from '../../../components/common/Loading/Loading';
import {
  useEmployeeStatistics,
  useDepartments,
  useRoles,
  useTerminateEmployee,
  useUpdateEmployee,
  useActiveEmployees,
  useTerminatedEmployees,
  useInactiveEmployees
} from '../../../hooks/queries/useHRQueries';
import {
  type Employee,
  type EmployeeStatistics
} from '../../../apis/hr-employees';
import './EmployeeManagement.css';

const EmployeeManagement: React.FC = () => {
  const { hasPermission } = useAuth();

  // State management
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [employeeToTerminate, setEmployeeToTerminate] = useState<Employee | null>(null);
  const [terminationData, setTerminationData] = useState({
    termination_date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive' | 'terminated'>('active');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    departmentId: '',
    roleId: '',
    gender: '',
    employmentType: '',
    modeOfWork: '',
  });

  // Fetch ALL employees once for client-side filtering (like Request Admin page)
  const activeEmployeesQuery = useActiveEmployees(
    1, // Always page 1
    100, // Backend guard limit - get all data for client-side filtering
    {}, // No filters - we'll filter client-side
    {
      staleTime: 5 * 60 * 1000, // 5 minutes - keep data fresh longer
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch when component mounts if data exists
    }
  );

  const terminatedEmployeesQuery = useTerminatedEmployees(
    1, // Always page 1
    100, // Backend guard limit - get all data for client-side filtering
    {}, // No filters - we'll filter client-side
    {
      staleTime: 5 * 60 * 1000, // 5 minutes - keep data fresh longer
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch when component mounts if data exists
    }
  );

  const inactiveEmployeesQuery = useInactiveEmployees(
    1, // Always page 1
    100, // Backend guard limit - get all data for client-side filtering
    {}, // No filters - we'll filter client-side
    {
      staleTime: 5 * 60 * 1000, // 5 minutes - keep data fresh longer
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch when component mounts if data exists
    }
  );

  const statisticsQuery = useEmployeeStatistics({
    staleTime: 5 * 60 * 1000, // 5 minutes - keep data fresh longer
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
  });
  const departmentsQuery = useDepartments({ limit: 100 }, {
    staleTime: 10 * 60 * 1000, // 10 minutes - departments change rarely
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const rolesQuery = useRoles({ limit: 100 }, {
    staleTime: 10 * 60 * 1000, // 10 minutes - roles change rarely
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Mutations
  const terminateMutation = useTerminateEmployee();
  const updateMutation = useUpdateEmployee();

  const statistics: EmployeeStatistics = statisticsQuery.data?.statistics || {
    total: 0,
    active: 0,
    inactive: 0,
    terminated: 0,
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
      inactive: 0,
    },
  };

  const departments = departmentsQuery.data?.departments || [];
  const roles = rolesQuery.data?.roles || [];

  // Client-side filtering and pagination
  const filteredEmployees = useMemo(() => {
    // Extract all employees data (no pagination from API)
    const allActiveEmployees = activeEmployeesQuery.data?.employees || [];
    const allInactiveEmployees = inactiveEmployeesQuery.data?.employees || [];
    const allTerminatedEmployees = terminatedEmployeesQuery.data?.employees || [];
    
    let allEmployees: Employee[] = [];
    
    // Get the appropriate employee list based on active tab
    switch (activeTab) {
      case 'active':
        allEmployees = allActiveEmployees;
        break;
      case 'inactive':
        allEmployees = allInactiveEmployees;
        break;
      case 'terminated':
        allEmployees = allTerminatedEmployees;
        break;
      default:
        allEmployees = allActiveEmployees;
    }

    // Apply ALL filters client-side
    return allEmployees.filter((employee: Employee) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
        const email = employee.email?.toLowerCase() || '';
        
        if (!fullName.includes(searchLower) && 
            !email.includes(searchLower)) {
          return false;
        }
      }

      // Department filter
      if (filters.departmentId && employee.departmentId !== parseInt(filters.departmentId)) {
        return false;
      }

      // Role filter
      if (filters.roleId && employee.roleId !== parseInt(filters.roleId)) {
        return false;
      }

      // Gender filter
      if (filters.gender && employee.gender !== filters.gender) {
        return false;
      }

      // Employment type filter
      if (filters.employmentType && employee.employmentType !== filters.employmentType) {
        return false;
      }

      // Mode of work filter
      if (filters.modeOfWork && employee.modeOfWork !== filters.modeOfWork) {
        return false;
      }

      return true;
    });
  }, [activeTab, activeEmployeesQuery.data?.employees, inactiveEmployeesQuery.data?.employees, terminatedEmployeesQuery.data?.employees, filters]);

  // Update pagination state based on filtered results
  useEffect(() => {
    const totalFilteredItems = filteredEmployees.length;
    const totalPages = Math.ceil(totalFilteredItems / pagination.itemsPerPage);
    setPagination(prev => ({
      ...prev,
      totalPages: totalPages,
      totalItems: totalFilteredItems
    }));
  }, [filteredEmployees.length, pagination.itemsPerPage]);

  // Client-side pagination
  const paginatedEmployees = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, pagination.currentPage, pagination.itemsPerPage]);

  // Use paginated employees for the table
  const employees = paginatedEmployees;

  const isLoading = activeEmployeesQuery.isLoading || inactiveEmployeesQuery.isLoading || terminatedEmployeesQuery.isLoading;


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
      title: 'Terminated Employees',
      value: statistics.inactive,
      color: 'red' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'This Month',
      value: statistics.thisMonth.new,
      color: 'purple' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
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
    },
    {
      title: 'Average Age',
      value: `${statistics.averageAge} years`,
      color: 'indigo' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Female Employees',
      value: statistics.byGender.female || 0,
      color: 'purple' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Male Employees',
      value: statistics.byGender.male || 0,
      color: 'blue' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  // Bulk actions configuration (tab-aware)
  const bulkActions: BulkAction[] = activeTab === 'active' ? [
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
  ] : activeTab === 'inactive' ? [
    {
      id: 'reactivate',
      label: 'Reactivate',
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
      variant: 'primary',
      onClick: (selectedIds) => handleBulkActivate(selectedIds),
      confirmMessage: `Are you sure you want to reactivate the selected employee(s)?`
    },
    {
      id: 'terminate',
      label: 'Terminate Selected',
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" clipRule="evenodd" /></svg>,
      variant: 'danger',
      onClick: (selectedIds) => handleBulkTerminate(selectedIds),
      confirmMessage: `Are you sure you want to terminate the selected employee(s)? This will process their final salary and mark them as terminated.`
    }
  ] : [
    {
      id: 'reactivate',
      label: 'Reactivate',
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
      variant: 'primary',
      onClick: (selectedIds) => handleBulkActivate(selectedIds),
      confirmMessage: `Are you sure you want to reactivate the selected employee(s)?`
    }
  ];

  // Handlers
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDrawerOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setShowEditDrawer(true);
    // Don't close the details drawer - keep it open in background
  };

  const handleBulkSelect = (employeeIds: string[]) => {
    setSelectedEmployees(employeeIds);
  };

  const handleFiltersChange = useCallback((newFilters: Record<string, string>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 on filter change
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      departmentId: '',
      roleId: '',
      gender: '',
      employmentType: '',
      modeOfWork: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleTabChange = (tab: 'active' | 'inactive' | 'terminated') => {
    setActiveTab(tab);
    setSelectedEmployees([]); // Clear bulk selection when switching tabs
    setSelectedEmployee(null); // Clear selected employee when switching tabs
    setDrawerOpen(false); // Close drawer when switching tabs
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1
    // No API call needed - using client-side filtering
  };

  const handleBulkActivate = async (selectedIds: string[]) => {
    try {
      // Implementation for bulk activate
      for (const id of selectedIds) {
        await updateMutation.mutateAsync({
          id: parseInt(id),
          data: { status: 'active' }
        });
      }
      setNotification({
        type: 'success',
        message: `${selectedIds.length} employee(s) activated successfully`
      });
      setSelectedEmployees([]);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to activate employees'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleBulkDeactivate = async (selectedIds: string[]) => {
    try {
      // Implementation for bulk deactivate
      for (const id of selectedIds) {
        await updateMutation.mutateAsync({
          id: parseInt(id),
          data: { status: 'inactive' }
        });
      }
      setNotification({
        type: 'success',
        message: `${selectedIds.length} employee(s) deactivated successfully`
      });
      setSelectedEmployees([]);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to deactivate employees'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleBulkTerminate = (selectedIds: string[]) => {
    // For bulk termination, show a modal to get termination details
    setNotification({
      type: 'error',
      message: `Please terminate ${selectedIds.length} employee(s) individually to provide termination details`
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleTerminateEmployee = async (employee: Employee) => {
    setEmployeeToTerminate(employee);
    setShowTerminateModal(true);
  };

  const confirmTermination = async () => {
    if (!employeeToTerminate) return;

    try {
      await terminateMutation.mutateAsync({
        employeeId: employeeToTerminate.id,
        termination_date: terminationData.termination_date,
        description: terminationData.description
      });

      setNotification({
        type: 'success',
        message: `Employee ${employeeToTerminate.firstName} ${employeeToTerminate.lastName} terminated successfully`
      });
      setShowTerminateModal(false);
      setEmployeeToTerminate(null);
      setTerminationData({
        termination_date: new Date().toISOString().split('T')[0],
        description: ''
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to terminate employee'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    // Don't clear selectedEmployee - keep it for table state
  };

  const handleClearSelection = () => {
    setSelectedEmployee(null);
    setDrawerOpen(false);
  };

  const handleEmployeeCreated = async () => {
    try {
      setIsRefreshing(true);
      // Refetch all employee data to get the new employee
      await Promise.all([
        activeEmployeesQuery.refetch(),
        inactiveEmployeesQuery.refetch(),
        terminatedEmployeesQuery.refetch(),
        statisticsQuery.refetch()
      ]);
      setNotification({
        type: 'success',
        message: 'Employee created successfully'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error refreshing employee data:', error);
      setNotification({
        type: 'error',
        message: 'Employee created but failed to refresh data'
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEmployeeUpdated = async () => {
    try {
      setIsRefreshing(true);
      // Refetch all employee data to get the updated employee
      await Promise.all([
        activeEmployeesQuery.refetch(),
        inactiveEmployeesQuery.refetch(),
        terminatedEmployeesQuery.refetch(),
        statisticsQuery.refetch()
      ]);
      
      // Update the selected employee with fresh data if it exists
      if (selectedEmployee) {
        const updatedEmployee = [
          ...activeEmployeesQuery.data?.employees || [],
          ...inactiveEmployeesQuery.data?.employees || [],
          ...terminatedEmployeesQuery.data?.employees || []
        ].find(emp => emp.id === selectedEmployee.id);
        
        if (updatedEmployee) {
          setSelectedEmployee(updatedEmployee);
        }
      }
      
      setNotification({
        type: 'success',
        message: 'Employee updated successfully'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error refreshing employee data:', error);
      setNotification({
        type: 'error',
        message: 'Employee updated but failed to refresh data'
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check permissions
  const canManageEmployees = hasPermission('employee_add_permission');
  const canCreateEmployee = hasPermission('employee_add_permission');
  
  // Fallback for HR department users (temporary until permissions are properly set)
  const { user } = useAuth();
  const isHRUser = user?.department === 'HR' || user?.role === 'admin';
  
  // Debug permissions
  console.log('Permissions Debug:', {
    canManageEmployees,
    canCreateEmployee,
    isHRUser,
    userRole: user?.role,
    userDepartment: user?.department,
    userType: user?.type,
    userPermissions: user?.permissions,
    allPermissions: JSON.stringify(localStorage.getItem('permissions'))
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="mt-2 text-gray-600">
                Manage your workforce with comprehensive employee lifecycle management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
              </button>
              {selectedEmployee && (
                <button
                  onClick={handleClearSelection}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Selection
                </button>
              )}
              {(canCreateEmployee || isHRUser) && (
                 <button
                   onClick={() => setShowCreateDrawer(true)}
                   className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                 >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Employee
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        {showStatistics && (
          <div className="mb-8">
            <DataStatistics
              title="Employee Statistics"
              cards={statisticsCards}
              loading={statisticsQuery.isLoading}
            />
          </div>
        )}

        {/* Filters */}
        <GenericEmployeeFilters
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          departments={departments}
          roles={roles}
          departmentsLoading={departmentsQuery.isLoading}
          rolesLoading={rolesQuery.isLoading}
        />

        {/* Tab Navigation */}
        <div className="w-full border-b border-gray-200 mb-4">
          <div className="flex w-full justify-between">
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium border-b-2 transition-colors ${activeTab === 'active'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-blue-600'
                }`}
              onClick={() => handleTabChange('active')}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Active Employees ({statistics.active})
            </button>

            <button
              className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium border-b-2 transition-colors ${activeTab === 'inactive'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-yellow-600'
                }`}
              onClick={() => handleTabChange('inactive')}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              Inactive Employees ({statistics.inactive})
            </button>

            <button
              className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium border-b-2 transition-colors ${activeTab === 'terminated'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-red-600'
                }`}
              onClick={() => handleTabChange('terminated')}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              Terminated Employees ({statistics.terminated})
            </button>
          </div>
        </div>



        {/* Bulk Actions */}
        {selectedEmployees.length > 0 && canManageEmployees && (
          <div className="mb-4">
            <BulkActions
              selectedItems={selectedEmployees}
              actions={bulkActions}
              onClearSelection={() => setSelectedEmployees([])}
            />
          </div>
        )}

        {/* Employees Table */}
        <EmployeesTable
          employees={employees}
          isLoading={isLoading}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onEmployeeClick={handleEmployeeClick}
          onBulkSelect={handleBulkSelect}
          selectedEmployees={selectedEmployees}
        />

        {/* Employee Details Drawer */}
        <EmployeeDetailsDrawer
          employee={selectedEmployee}
          isOpen={drawerOpen}
          onClose={handleDrawerClose}
          onEdit={handleEditEmployee}
          onTerminate={handleTerminateEmployee}
          onEmployeeUpdated={() => { }}
        />

         {/* Create Employee Drawer */}
        <CreateEmployeeDrawer
          isOpen={showCreateDrawer}
          onClose={() => setShowCreateDrawer(false)}
          onEmployeeCreated={handleEmployeeCreated}
        />

        {/* Edit Employee Drawer */}
        <EditEmployeeDrawer
          employee={employeeToEdit}
          isOpen={showEditDrawer}
          onClose={() => {
            setShowEditDrawer(false);
            setEmployeeToEdit(null);
            // Reopen the details drawer if we have a selected employee
            if (selectedEmployee) {
              setDrawerOpen(true);
            }
          }}
          onEmployeeUpdated={() => {
            handleEmployeeUpdated();
            setShowEditDrawer(false);
            setEmployeeToEdit(null);
            // Reopen the details drawer
            if (selectedEmployee) {
              setDrawerOpen(true);
            }
          }}
        />

        {/* Overlay during refetch to avoid lag perception */}
        <Loading
          isLoading={isRefreshing}
          position="overlay"
          size="lg"
          theme="primary"
          backdropBlur
          message="Refreshing employees..."
        />

        {/* Terminate Modal */}
        {showTerminateModal && employeeToTerminate && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Terminate Employee</h3>
                <button onClick={() => setShowTerminateModal(false)} className="close-button">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                <p className="warning-text">
                  Are you sure you want to terminate {employeeToTerminate.firstName} {employeeToTerminate.lastName}?
                </p>
                <div className="form-group">
                  <label>Termination Date</label>
                  <input
                    type="date"
                    value={terminationData.termination_date}
                    onChange={(e) => setTerminationData(prev => ({ ...prev, termination_date: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Reason (Optional)</label>
                  <textarea
                    value={terminationData.description}
                    onChange={(e) => setTerminationData(prev => ({ ...prev, description: e.target.value }))}
                    className="form-input"
                    rows={3}
                    placeholder="Enter termination reason..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowTerminateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={confirmTermination} className="btn-danger" disabled={terminateMutation.isPending}>
                  {terminateMutation.isPending ? 'Terminating...' : 'Terminate Employee'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className={`notification notification-${notification.type}`}>
            <div className="notification-content">
              <div className="notification-icon">
                {notification.type === 'success' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className="notification-message">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="notification-close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;
