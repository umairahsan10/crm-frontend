import { apiGetJson, apiPostJson, apiPutJson, apiPatchJson, apiDeleteJson, ApiError } from '../utils/apiClient';
import { API_BASE_URL } from '../config/constants';

/**
 * HR Employee Management API
 * 
 * This module contains all API functions for HR-specific employee management.
 * These APIs interact with the HR employees controller on the backend.
 * 
 * Endpoints:
 * - GET /hr/employees - Get all employees with pagination and filters
 * - GET /hr/employees/:id - Get specific employee
 * - POST /hr/employees - Create new employee
 * - PUT /hr/employees/:id - Update employee
 * - PATCH /hr/employees/:id/bonus - Update employee bonus
 * - PATCH /hr/employees/:id/shift - Update employee shift
 * - DELETE /hr/employees/:id - Delete employee
 * - POST /hr/terminate - Terminate employee
 */

// HR Employee Management Types - Updated to match backend exactly
export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  cnic?: string;
  departmentId: number;
  roleId: number;
  managerId?: number;
  teamLeadId?: number;
  address?: string;
  maritalStatus?: boolean;
  status: string;
  startDate: string;
  endDate?: string;
  modeOfWork?: string;
  remoteDaysAllowed?: number;
  dob?: string;
  emergencyContact?: string;
  shiftStart?: string;
  shiftEnd?: string;
  employmentType?: string;
  dateOfConfirmation?: string;
  periodType?: string;
  bonus?: number;
  createdAt: string;
  updatedAt: string;
  department: {
    id: number;
    name: string;
    description?: string;
  };
  role: {
    id: number;
    name: string;
    description?: string;
  };
  manager?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  teamLead?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Minimal employee data for table display (returned by GET /hr/employees)
export interface EmployeeSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  startDate: string;
  department: {
    id: number;
    name: string;
  };
  role: {
    id: number;
    name: string;
  };
  manager?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  cnic?: string;
  departmentId: number;
  roleId: number;
  managerId?: number;
  teamLeadId?: number;
  address?: string;
  maritalStatus?: boolean;
  status?: string;
  startDate: string;
  endDate?: string;
  modeOfWork?: string;
  remoteDaysAllowed?: number;
  dob?: string;
  emergencyContact?: string;
  shiftStart?: string;
  shiftEnd?: string;
  employmentType?: string;
  dateOfConfirmation?: string;
  periodType?: string;
  passwordHash?: string;
  bonus?: number;
}

export interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  cnic?: string;
  departmentId?: number;
  roleId?: number;
  managerId?: number;
  teamLeadId?: number;
  address?: string;
  maritalStatus?: boolean;
  status?: string;
  startDate?: string;
  endDate?: string;
  modeOfWork?: string;
  remoteDaysAllowed?: number;
  dob?: string;
  emergencyContact?: string;
  shiftStart?: string;
  shiftEnd?: string;
  employmentType?: string;
  dateOfConfirmation?: string;
  periodType?: string;
  bonus?: number;
}

export interface UpdateBonusDto {
  bonus: number;
}

export interface UpdateShiftDto {
  shift_start: string;
  shift_end: string;
}

export interface TerminateEmployeeDto {
  employee_id: number;
  termination_date: string;
  description?: string;
}

// Updated to match backend query parameters exactly
export interface GetEmployeesDto {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: number;
  roleId?: number;
  status?: string;
  gender?: 'male' | 'female';
  employmentType?: 'full_time' | 'part_time';
  modeOfWork?: 'hybrid' | 'on_site' | 'remote';
}

export interface EmployeeResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  cnic?: string;
  departmentId: number;
  roleId: number;
  managerId?: number;
  teamLeadId?: number;
  address?: string;
  maritalStatus?: boolean;
  status: string;
  startDate: string;
  endDate?: string;
  modeOfWork?: string;
  remoteDaysAllowed?: number;
  dob?: string;
  emergencyContact?: string;
  shiftStart?: string;
  shiftEnd?: string;
  employmentType?: string;
  dateOfConfirmation?: string;
  periodType?: string;
  bonus?: number;
  createdAt: string;
  updatedAt: string;
  department: {
    id: number;
    name: string;
    description?: string;
  };
  role: {
    id: number;
    name: string;
    description?: string;
  };
  manager?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  teamLead?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface EmployeesListResponseDto {
  employees: EmployeeSummary[]; // Minimal data for table display
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Department and Role Types
export interface Department {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentResponseDto {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentsListResponseDto {
  departments: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RoleResponseDto {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RolesListResponseDto {
  roles: Role[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetDepartmentsDto {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetRolesDto {
  page?: number;
  limit?: number;
  search?: string;
}

// HR Employee Management API Functions
export const getEmployeesApi = async (query: GetEmployeesDto = {}): Promise<EmployeesListResponseDto> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (query.page) queryParams.append('page', query.page.toString());
    if (query.limit) queryParams.append('limit', query.limit.toString());
    if (query.search) queryParams.append('search', query.search);
    if (query.departmentId) queryParams.append('departmentId', query.departmentId.toString());
    if (query.roleId) queryParams.append('roleId', query.roleId.toString());
    if (query.status) queryParams.append('status', query.status);
    if (query.gender) queryParams.append('gender', query.gender);
    if (query.employmentType) queryParams.append('employmentType', query.employmentType);
    if (query.modeOfWork) queryParams.append('modeOfWork', query.modeOfWork);

    const url = `${API_BASE_URL}/hr/employees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Fetching HR employees from:', url);
    
    const response = await apiGetJson<EmployeesListResponseDto>(url);
    console.log('HR Employees API response:', response);
    
    return response;
  } catch (error) {
    console.error('HR Employees API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch HR employees: ${error.message}`);
    }
    throw new Error('Failed to fetch HR employees');
  }
};

export const getEmployeeByIdApi = async (id: number): Promise<EmployeeResponseDto> => {
  try {
    console.log('Fetching HR employee by ID:', id);
    const response = await apiGetJson<EmployeeResponseDto>(`${API_BASE_URL}/hr/employees/${id}`);
    console.log('HR Employee by ID API response:', response);
    return response;
  } catch (error) {
    console.error('HR Employee by ID API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch HR employee: ${error.message}`);
    }
    throw new Error('Failed to fetch HR employee');
  }
};

export const createEmployeeApi = async (employeeData: CreateEmployeeDto): Promise<EmployeeResponseDto> => {
  try {
    console.log('Creating employee:', employeeData);
    const response = await apiPostJson<EmployeeResponseDto>(`${API_BASE_URL}/hr/employees`, employeeData);
    console.log('Create employee API response:', response);
    return response;
  } catch (error) {
    console.error('Create employee API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to create employee: ${error.message}`);
    }
    throw new Error('Failed to create employee');
  }
};

export const updateEmployeeApi = async (id: number, employeeData: UpdateEmployeeDto): Promise<EmployeeResponseDto> => {
  try {
    console.log('Updating employee:', id, employeeData);
    const response = await apiPutJson<EmployeeResponseDto>(`${API_BASE_URL}/hr/employees/${id}`, employeeData);
    console.log('Update employee API response:', response);
    return response;
  } catch (error) {
    console.error('Update employee API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to update employee: ${error.message}`);
    }
    throw new Error('Failed to update employee');
  }
};

export const updateEmployeeBonusApi = async (id: number, bonusData: UpdateBonusDto): Promise<EmployeeResponseDto> => {
  try {
    console.log('Updating employee bonus:', id, bonusData);
    const response = await apiPatchJson<EmployeeResponseDto>(`${API_BASE_URL}/hr/employees/${id}/bonus`, bonusData);
    console.log('Update employee bonus API response:', response);
    return response;
  } catch (error) {
    console.error('Update employee bonus API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to update employee bonus: ${error.message}`);
    }
    throw new Error('Failed to update employee bonus');
  }
};

export const updateEmployeeShiftApi = async (id: number, shiftData: UpdateShiftDto): Promise<EmployeeResponseDto> => {
  try {
    console.log('Updating employee shift:', id, shiftData);
    const response = await apiPatchJson<EmployeeResponseDto>(`${API_BASE_URL}/hr/employees/${id}/shift`, shiftData);
    console.log('Update employee shift API response:', response);
    return response;
  } catch (error) {
    console.error('Update employee shift API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to update employee shift: ${error.message}`);
    }
    throw new Error('Failed to update employee shift');
  }
};

export const deleteEmployeeApi = async (id: number): Promise<{ message: string }> => {
  try {
    console.log('Deleting employee:', id);
    const response = await apiDeleteJson<{ message: string }>(`${API_BASE_URL}/hr/employees/${id}`);
    console.log('Delete employee API response:', response);
    return response;
  } catch (error) {
    console.error('Delete employee API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to delete employee: ${error.message}`);
    }
    throw new Error('Failed to delete employee');
  }
};

// Statistics Types
export interface EmployeeStatistics {
  total: number;
  active: number;
  inactive: number;
  terminated: number;
  byDepartment: Record<string, number>;
  byRole: Record<string, number>;
  byGender: Record<string, number>;
  byEmploymentType: Record<string, number>;
  byModeOfWork: Record<string, number>;
  byMaritalStatus: Record<string, number>;
  averageAge: number;
  averageBonus: number;
  thisMonth: {
    new: number;
    active: number;
    inactive: number;
  };
}

export interface EmployeeStatisticsResponseDto {
  statistics: EmployeeStatistics;
}

// Get employee statistics from API
export const getEmployeeStatisticsApi = async (): Promise<EmployeeStatisticsResponseDto> => {
  try {
    const response = await apiGetJson<EmployeeStatisticsResponseDto>(`${API_BASE_URL}/hr/employees/stats`);
    console.log('Employee Statistics API response:', response);
    return response;
  } catch (error) {
    console.error('Employee Statistics API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch employee statistics: ${error.message}`);
    }
    throw new Error('Failed to fetch employee statistics');
  }
};

export const terminateEmployeeApi = async (terminateData: TerminateEmployeeDto): Promise<{ message: string }> => {
  try {
    console.log('Terminating employee:', terminateData);
    const response = await apiPostJson<{ message: string }>(`${API_BASE_URL}/hr/terminate`, terminateData);
    console.log('Terminate employee API response:', response);
    return response;
  } catch (error) {
    console.error('Terminate employee API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to terminate employee: ${error.message}`);
    }
    throw new Error('Failed to terminate employee');
  }
};

// Department Management API Functions
export const getDepartmentsApi = async (query: GetDepartmentsDto = {}): Promise<DepartmentsListResponseDto> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (query.page) queryParams.append('page', query.page.toString());
    if (query.limit) queryParams.append('limit', query.limit.toString());
    if (query.search) queryParams.append('search', query.search);

    const url = `${API_BASE_URL}/departments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Fetching departments from:', url);
    
    const response = await apiGetJson<DepartmentsListResponseDto>(url);
    console.log('Departments API response:', response);
    
    return response;
  } catch (error) {
    console.error('Departments API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch departments: ${error.message}`);
    }
    throw new Error('Failed to fetch departments');
  }
};

export const getDepartmentByIdApi = async (id: number): Promise<DepartmentResponseDto> => {
  try {
    console.log('Fetching department by ID:', id);
    const response = await apiGetJson<DepartmentResponseDto>(`${API_BASE_URL}/departments/${id}`);
    console.log('Department by ID API response:', response);
    return response;
  } catch (error) {
    console.error('Department by ID API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch department: ${error.message}`);
    }
    throw new Error('Failed to fetch department');
  }
};

// Role Management API Functions
export const getRolesApi = async (query: GetRolesDto = {}): Promise<RolesListResponseDto> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (query.page) queryParams.append('page', query.page.toString());
    if (query.limit) queryParams.append('limit', query.limit.toString());
    if (query.search) queryParams.append('search', query.search);

    const url = `${API_BASE_URL}/roles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Fetching roles from:', url);
    
    const response = await apiGetJson<RolesListResponseDto>(url);
    console.log('Roles API response:', response);
    
    return response;
  } catch (error) {
    console.error('Roles API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch roles: ${error.message}`);
    }
    throw new Error('Failed to fetch roles');
  }
};

export const getRoleByIdApi = async (id: number): Promise<RoleResponseDto> => {
  try {
    console.log('Fetching role by ID:', id);
    const response = await apiGetJson<RoleResponseDto>(`${API_BASE_URL}/roles/${id}`);
    console.log('Role by ID API response:', response);
    return response;
  } catch (error) {
    console.error('Role by ID API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch role: ${error.message}`);
    }
    throw new Error('Failed to fetch role');
  }
};

// Unit Types
export interface Unit {
  id: number;
  name: string;
  headId?: number;
  departmentId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Get units by department ID
// API returns an array of units directly
export const getUnitsByDepartmentApi = async (departmentId: number): Promise<Unit[]> => {
  try {
    console.log('Fetching units for department:', departmentId);
    const response = await apiGetJson<Unit[]>(`${API_BASE_URL}/hr/employees/${departmentId}/department`);
    console.log('Units by department API response:', response);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Units by department API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch units: ${error.message}`);
    }
    throw new Error('Failed to fetch units');
  }
};