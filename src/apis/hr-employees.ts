import { apiGetJson, apiPostJson, apiPutJson, apiPatchJson, apiDeleteJson, ApiError } from '../utils/apiClient';

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

// API Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// HR Employee Management Types
export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
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
    email: string;
  };
  teamLead?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  salary?: number;
  bonus?: number;
  shiftStart?: string;
  shiftEnd?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Backend Employee format (what we actually receive from API)
export interface BackendEmployee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  gender?: string;
  cnic?: string;
  departmentId: number;
  roleId: number;
  managerId?: number;
  teamLeadId?: number;
  maritalStatus?: boolean;
  status: string;
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
  createdAt: string;
  updatedAt: string;
  passwordHash: string;
  bonus?: number;
  department: {
    id: number;
    name: string;
    description?: string;
    managerId?: number;
    createdAt: string;
    updatedAt: string;
  };
  role: {
    id: number;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
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

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  departmentId: number;
  roleId: number;
  managerId?: number;
  teamLeadId?: number;
  salary?: number;
  shiftStart?: string;
  shiftEnd?: string;
}

export interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  departmentId?: number;
  roleId?: number;
  managerId?: number;
  teamLeadId?: number;
  salary?: number;
  shiftStart?: string;
  shiftEnd?: string;
}

export interface UpdateBonusDto {
  bonus: number;
}

export interface UpdateShiftDto {
  shiftStart: string;
  shiftEnd: string;
}

export interface TerminateEmployeeDto {
  employee_id: number;
  termination_date: string;
  description?: string;
}

export interface GetEmployeesDto {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface EmployeeResponseDto {
  success: boolean;
  data: Employee;
  message: string;
}

export interface EmployeesListResponseDto {
  success: boolean;
  data: {
    employees: Employee[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

// Backend response format (what we actually receive)
export interface BackendEmployeesResponse {
  employees: BackendEmployee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper function to transform backend employee to frontend employee format
const transformBackendEmployee = (backendEmployee: BackendEmployee): Employee => {
  return {
    id: backendEmployee.id,
    firstName: backendEmployee.firstName,
    lastName: backendEmployee.lastName,
    email: backendEmployee.email,
    phone: backendEmployee.phone,
    address: backendEmployee.address,
    startDate: backendEmployee.startDate || '',
    department: {
      id: backendEmployee.department.id,
      name: backendEmployee.department.name
    },
    role: {
      id: backendEmployee.role.id,
      name: backendEmployee.role.name
    },
    manager: backendEmployee.manager ? {
      id: backendEmployee.manager.id,
      firstName: backendEmployee.manager.firstName,
      lastName: backendEmployee.manager.lastName,
      email: backendEmployee.manager.email
    } : undefined,
    teamLead: backendEmployee.teamLead ? {
      id: backendEmployee.teamLead.id,
      firstName: backendEmployee.teamLead.firstName,
      lastName: backendEmployee.teamLead.lastName,
      email: backendEmployee.teamLead.email
    } : undefined,
    bonus: backendEmployee.bonus,
    shiftStart: backendEmployee.shiftStart,
    shiftEnd: backendEmployee.shiftEnd,
    isActive: backendEmployee.status === 'active',
    createdAt: backendEmployee.createdAt,
    updatedAt: backendEmployee.updatedAt
  };
};

// HR Employee Management API Functions
export const getEmployeesApi = async (query: GetEmployeesDto = {}): Promise<EmployeesListResponseDto> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (query.page) queryParams.append('page', query.page.toString());
    if (query.limit) queryParams.append('limit', query.limit.toString());
    if (query.search) queryParams.append('search', query.search);
    if (query.department) queryParams.append('department', query.department);
    if (query.role) queryParams.append('role', query.role);
    if (query.sortBy) queryParams.append('sortBy', query.sortBy);
    if (query.sortOrder) queryParams.append('sortOrder', query.sortOrder);

    const url = `${API_BASE_URL}/hr/employees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Fetching HR employees from:', url);
    
    const response = await apiGetJson<BackendEmployeesResponse>(url);
    console.log('HR Employees API response:', response);
    
    // Transform the backend response to match the expected frontend format
    const transformedResponse: EmployeesListResponseDto = {
      success: true,
      data: {
        employees: response.employees.map(transformBackendEmployee),
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages
      },
      message: 'Employees fetched successfully'
    };
    
    return transformedResponse;
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
