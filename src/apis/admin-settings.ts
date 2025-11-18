/**
 * Admin Settings API
 * 
 * All endpoints for admin settings management:
 * - Company Settings
 * - Departments
 * - Roles
 * - HR Permissions
 * - Accountant Permissions
 */

import { apiGetJson, apiPostJson, apiPutJson, apiDeleteJson, ApiError } from '../utils/apiClient';

// ============================================================================
// Company Settings
// ============================================================================

export interface CompanySettingsResponse {
  id: number;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  status?: string;
  lateTime?: number;
  halfTime?: number;
  absentTime?: number;
  quarterlyLeavesDays?: number;
  monthlyLatesDays?: number;
  absentDeduction?: number;
  lateDeduction?: number;
  halfDeduction?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCompanySettingsDto {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  status?: string;
  lateTime?: number;
  halfTime?: number;
  absentTime?: number;
  quarterlyLeavesDays?: number;
  monthlyLatesDays?: number;
  absentDeduction?: number;
  lateDeduction?: number;
  halfDeduction?: number;
}

export const getCompanySettingsApi = async (): Promise<CompanySettingsResponse> => {
  try {
    const response = await apiGetJson<CompanySettingsResponse>('/admin/settings/company');
    return response;
  } catch (error) {
    console.error('Get company settings API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch company settings: ${error.message}`);
    }
    throw new Error('Failed to fetch company settings');
  }
};

export const updateCompanySettingsApi = async (data: UpdateCompanySettingsDto): Promise<CompanySettingsResponse> => {
  try {
    const response = await apiPutJson<CompanySettingsResponse>('/admin/settings/company', data);
    return response;
  } catch (error) {
    console.error('Update company settings API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to update company settings: ${error.message}`);
    }
    throw new Error('Failed to update company settings');
  }
};

// ============================================================================
// Departments
// ============================================================================

export interface DepartmentResponse {
  id: number;
  name: string;
  description?: string;
  managerId?: number;
  manager?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  employeeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentListResponse {
  departments: DepartmentResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
  managerId?: number;
}

export interface UpdateDepartmentDto {
  name?: string;
  description?: string;
  managerId?: number;
}

export const getDepartmentsApi = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<DepartmentListResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    const response = await apiGetJson<DepartmentListResponse>(`/admin/settings/departments?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Get departments API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch departments: ${error.message}`);
    }
    throw new Error('Failed to fetch departments');
  }
};

export const getDepartmentByIdApi = async (id: number): Promise<DepartmentResponse> => {
  try {
    const response = await apiGetJson<DepartmentResponse>(`/admin/settings/departments/${id}`);
    return response;
  } catch (error) {
    console.error('Get department by ID API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch department: ${error.message}`);
    }
    throw new Error('Failed to fetch department');
  }
};

export const createDepartmentApi = async (data: CreateDepartmentDto): Promise<DepartmentResponse> => {
  try {
    const response = await apiPostJson<DepartmentResponse>('/admin/settings/departments', data);
    return response;
  } catch (error) {
    console.error('Create department API Error:', error);
    if (error instanceof ApiError) {
      if (error.status === 409) {
        throw new Error('Department name already exists');
      }
      throw new Error(`Failed to create department: ${error.message}`);
    }
    throw new Error('Failed to create department');
  }
};

export const updateDepartmentApi = async (id: number, data: UpdateDepartmentDto): Promise<DepartmentResponse> => {
  try {
    const response = await apiPutJson<DepartmentResponse>(`/admin/settings/departments/${id}`, data);
    return response;
  } catch (error) {
    console.error('Update department API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to update department: ${error.message}`);
    }
    throw new Error('Failed to update department');
  }
};

export const deleteDepartmentApi = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await apiDeleteJson<{ message: string }>(`/admin/settings/departments/${id}`);
    return response;
  } catch (error) {
    console.error('Delete department API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to delete department: ${error.message}`);
    }
    throw new Error('Failed to delete department');
  }
};

// ============================================================================
// Roles
// ============================================================================

export type RoleName = 'dep_manager' | 'team_lead' | 'senior' | 'junior' | 'unit_head';

export interface RoleResponse {
  id: number;
  name: RoleName;
  description?: string;
  employeeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleListResponse {
  roles: RoleResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateRoleDto {
  name: RoleName;
  description?: string;
}

export interface UpdateRoleDto {
  description?: string;
}

export const getRolesApi = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<RoleListResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    const response = await apiGetJson<RoleListResponse>(`/admin/settings/roles?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Get roles API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch roles: ${error.message}`);
    }
    throw new Error('Failed to fetch roles');
  }
};

export const getRoleByIdApi = async (id: number): Promise<RoleResponse> => {
  try {
    const response = await apiGetJson<RoleResponse>(`/admin/settings/roles/${id}`);
    return response;
  } catch (error) {
    console.error('Get role by ID API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch role: ${error.message}`);
    }
    throw new Error('Failed to fetch role');
  }
};

export const createRoleApi = async (data: CreateRoleDto): Promise<RoleResponse> => {
  try {
    const response = await apiPostJson<RoleResponse>('/admin/settings/roles', data);
    return response;
  } catch (error) {
    console.error('Create role API Error:', error);
    if (error instanceof ApiError) {
      if (error.status === 409) {
        throw new Error('Role name already exists');
      }
      throw new Error(`Failed to create role: ${error.message}`);
    }
    throw new Error('Failed to create role');
  }
};

export const updateRoleApi = async (id: number, data: UpdateRoleDto): Promise<RoleResponse> => {
  try {
    const response = await apiPutJson<RoleResponse>(`/admin/settings/roles/${id}`, data);
    return response;
  } catch (error) {
    console.error('Update role API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to update role: ${error.message}`);
    }
    throw new Error('Failed to update role');
  }
};

export const deleteRoleApi = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await apiDeleteJson<{ message: string }>(`/admin/settings/roles/${id}`);
    return response;
  } catch (error) {
    console.error('Delete role API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to delete role: ${error.message}`);
    }
    throw new Error('Failed to delete role');
  }
};

// ============================================================================
// HR Permissions
// ============================================================================

export interface HrPermissionsResponse {
  id: number;
  employeeId: number;
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    department?: {
      id: number;
      name: string;
    };
  };
  attendancePermission?: boolean;
  salaryPermission?: boolean;
  commissionPermission?: boolean;
  employeeAddPermission?: boolean;
  terminationsHandle?: boolean;
  monthlyRequestApprovals?: boolean;
  targetsSet?: boolean;
  bonusesSet?: boolean;
  shiftTimingSet?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HrPermissionsListResponse {
  hrRecords: HrPermissionsResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateHrPermissionsDto {
  employeeId: number;
  attendancePermission?: boolean;
  salaryPermission?: boolean;
  commissionPermission?: boolean;
  employeeAddPermission?: boolean;
  terminationsHandle?: boolean;
  monthlyRequestApprovals?: boolean;
  targetsSet?: boolean;
  bonusesSet?: boolean;
  shiftTimingSet?: boolean;
}

export interface UpdateHrPermissionsDto {
  attendancePermission?: boolean;
  salaryPermission?: boolean;
  commissionPermission?: boolean;
  employeeAddPermission?: boolean;
  terminationsHandle?: boolean;
  monthlyRequestApprovals?: boolean;
  targetsSet?: boolean;
  bonusesSet?: boolean;
  shiftTimingSet?: boolean;
}

export const getHrPermissionsApi = async (
  page: number = 1,
  limit: number = 10
): Promise<HrPermissionsListResponse> => {
  try {
    const response = await apiGetJson<HrPermissionsListResponse>(
      `/admin/settings/hr-permissions?page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error('Get HR permissions API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch HR permissions: ${error.message}`);
    }
    throw new Error('Failed to fetch HR permissions');
  }
};

export const getHrPermissionsByIdApi = async (id: number): Promise<HrPermissionsResponse> => {
  try {
    const response = await apiGetJson<HrPermissionsResponse>(`/admin/settings/hr-permissions/${id}`);
    return response;
  } catch (error) {
    console.error('Get HR permissions by ID API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch HR permissions: ${error.message}`);
    }
    throw new Error('Failed to fetch HR permissions');
  }
};

export const createHrPermissionsApi = async (data: CreateHrPermissionsDto): Promise<HrPermissionsResponse> => {
  try {
    const response = await apiPostJson<HrPermissionsResponse>('/admin/settings/hr-permissions', data);
    return response;
  } catch (error) {
    console.error('Create HR permissions API Error:', error);
    if (error instanceof ApiError) {
      if (error.status === 400) {
        throw new Error('Employee must be in HR department');
      }
      if (error.status === 409) {
        throw new Error('Employee already has HR permissions');
      }
      throw new Error(`Failed to create HR permissions: ${error.message}`);
    }
    throw new Error('Failed to create HR permissions');
  }
};

export const updateHrPermissionsApi = async (
  id: number,
  data: UpdateHrPermissionsDto
): Promise<HrPermissionsResponse> => {
  try {
    const response = await apiPutJson<HrPermissionsResponse>(`/admin/settings/hr-permissions/${id}`, data);
    return response;
  } catch (error) {
    console.error('Update HR permissions API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to update HR permissions: ${error.message}`);
    }
    throw new Error('Failed to update HR permissions');
  }
};

export const deleteHrPermissionsApi = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await apiDeleteJson<{ message: string }>(`/admin/settings/hr-permissions/${id}`);
    return response;
  } catch (error) {
    console.error('Delete HR permissions API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to delete HR permissions: ${error.message}`);
    }
    throw new Error('Failed to delete HR permissions');
  }
};

// ============================================================================
// Accountant Permissions
// ============================================================================

export interface AccountantPermissionsResponse {
  id: number;
  employeeId: number;
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    department?: {
      id: number;
      name: string;
    };
  };
  liabilitiesPermission?: boolean;
  salaryPermission?: boolean;
  salesPermission?: boolean;
  invoicesPermission?: boolean;
  expensesPermission?: boolean;
  assetsPermission?: boolean;
  revenuesPermission?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountantPermissionsListResponse {
  accountants: AccountantPermissionsResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAccountantPermissionsDto {
  employeeId: number;
  liabilitiesPermission?: boolean;
  salaryPermission?: boolean;
  salesPermission?: boolean;
  invoicesPermission?: boolean;
  expensesPermission?: boolean;
  assetsPermission?: boolean;
  revenuesPermission?: boolean;
}

export interface UpdateAccountantPermissionsDto {
  liabilitiesPermission?: boolean;
  salaryPermission?: boolean;
  salesPermission?: boolean;
  invoicesPermission?: boolean;
  expensesPermission?: boolean;
  assetsPermission?: boolean;
  revenuesPermission?: boolean;
}

export const getAccountantPermissionsApi = async (
  page: number = 1,
  limit: number = 10
): Promise<AccountantPermissionsListResponse> => {
  try {
    const response = await apiGetJson<AccountantPermissionsListResponse>(
      `/admin/settings/accountant-permissions?page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error('Get accountant permissions API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch accountant permissions: ${error.message}`);
    }
    throw new Error('Failed to fetch accountant permissions');
  }
};

export const getAccountantPermissionsByIdApi = async (
  id: number
): Promise<AccountantPermissionsResponse> => {
  try {
    const response = await apiGetJson<AccountantPermissionsResponse>(
      `/admin/settings/accountant-permissions/${id}`
    );
    return response;
  } catch (error) {
    console.error('Get accountant permissions by ID API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch accountant permissions: ${error.message}`);
    }
    throw new Error('Failed to fetch accountant permissions');
  }
};

export const createAccountantPermissionsApi = async (
  data: CreateAccountantPermissionsDto
): Promise<AccountantPermissionsResponse> => {
  try {
    const response = await apiPostJson<AccountantPermissionsResponse>(
      '/admin/settings/accountant-permissions',
      data
    );
    return response;
  } catch (error) {
    console.error('Create accountant permissions API Error:', error);
    if (error instanceof ApiError) {
      if (error.status === 400) {
        throw new Error('Employee must be in Accounts department');
      }
      if (error.status === 409) {
        throw new Error('Employee already has accountant permissions');
      }
      throw new Error(`Failed to create accountant permissions: ${error.message}`);
    }
    throw new Error('Failed to create accountant permissions');
  }
};

export const updateAccountantPermissionsApi = async (
  id: number,
  data: UpdateAccountantPermissionsDto
): Promise<AccountantPermissionsResponse> => {
  try {
    const response = await apiPutJson<AccountantPermissionsResponse>(
      `/admin/settings/accountant-permissions/${id}`,
      data
    );
    return response;
  } catch (error) {
    console.error('Update accountant permissions API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to update accountant permissions: ${error.message}`);
    }
    throw new Error('Failed to update accountant permissions');
  }
};

export const deleteAccountantPermissionsApi = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await apiDeleteJson<{ message: string }>(
      `/admin/settings/accountant-permissions/${id}`
    );
    return response;
  } catch (error) {
    console.error('Delete accountant permissions API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to delete accountant permissions: ${error.message}`);
    }
    throw new Error('Failed to delete accountant permissions');
  }
};

