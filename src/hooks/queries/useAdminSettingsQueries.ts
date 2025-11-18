/**
 * React Query hooks for Admin Settings
 * 
 * This file contains all the query hooks for admin settings APIs.
 * Handles company settings, departments, roles, HR permissions, and accountant permissions.
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  // Company Settings
  getCompanySettingsApi,
  updateCompanySettingsApi,
  // Departments
  getDepartmentsApi,
  getDepartmentByIdApi,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
  // Roles
  getRolesApi,
  getRoleByIdApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
  // HR Permissions
  getHrPermissionsApi,
  getHrPermissionsByIdApi,
  createHrPermissionsApi,
  updateHrPermissionsApi,
  deleteHrPermissionsApi,
  // Accountant Permissions
  getAccountantPermissionsApi,
  getAccountantPermissionsByIdApi,
  createAccountantPermissionsApi,
  updateAccountantPermissionsApi,
  deleteAccountantPermissionsApi,
  type UpdateCompanySettingsDto,
  type CreateDepartmentDto,
  type UpdateDepartmentDto,
  type CreateRoleDto,
  type UpdateRoleDto,
  type CreateHrPermissionsDto,
  type UpdateHrPermissionsDto,
  type CreateAccountantPermissionsDto,
  type UpdateAccountantPermissionsDto,
} from '../../apis/admin-settings';
import { createAdminApi, deleteAdminApi, getAllAdminsApi, getAdminByIdApi, updateAdminProfileApi } from '../../apis/admin';

// ============================================================================
// Query Keys
// ============================================================================

export const adminSettingsQueryKeys = {
  all: ['adminSettings'] as const,
  company: () => [...adminSettingsQueryKeys.all, 'company'] as const,
  departments: () => [...adminSettingsQueryKeys.all, 'departments'] as const,
  department: (id: number) => [...adminSettingsQueryKeys.departments(), id] as const,
  departmentList: (page: number, limit: number, search?: string) =>
    [...adminSettingsQueryKeys.departments(), 'list', { page, limit, search }] as const,
  roles: () => [...adminSettingsQueryKeys.all, 'roles'] as const,
  role: (id: number) => [...adminSettingsQueryKeys.roles(), id] as const,
  roleList: (page: number, limit: number, search?: string) =>
    [...adminSettingsQueryKeys.roles(), 'list', { page, limit, search }] as const,
  hrPermissions: () => [...adminSettingsQueryKeys.all, 'hrPermissions'] as const,
  hrPermission: (id: number) => [...adminSettingsQueryKeys.hrPermissions(), id] as const,
  hrPermissionList: (page: number, limit: number) =>
    [...adminSettingsQueryKeys.hrPermissions(), 'list', { page, limit }] as const,
  accountantPermissions: () => [...adminSettingsQueryKeys.all, 'accountantPermissions'] as const,
  accountantPermission: (id: number) =>
    [...adminSettingsQueryKeys.accountantPermissions(), id] as const,
  accountantPermissionList: (page: number, limit: number) =>
    [...adminSettingsQueryKeys.accountantPermissions(), 'list', { page, limit }] as const,
  admins: () => [...adminSettingsQueryKeys.all, 'admins'] as const,
  admin: (id: number) => [...adminSettingsQueryKeys.admins(), id] as const,
  adminList: (page: number, limit: number) =>
    [...adminSettingsQueryKeys.admins(), 'list', { page, limit }] as const,
};

// ============================================================================
// Company Settings
// ============================================================================

export const useCompanySettings = (
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: adminSettingsQueryKeys.company(),
    queryFn: async () => {
      return await getCompanySettingsApi();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...options,
  });
};

export const useUpdateCompanySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCompanySettingsDto) => {
      return await updateCompanySettingsApi(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.company() });
    },
  });
};

// ============================================================================
// Departments
// ============================================================================

export const useDepartments = (
  page: number = 1,
  limit: number = 10,
  search?: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: adminSettingsQueryKeys.departmentList(page, limit, search),
    queryFn: async () => {
      return await getDepartmentsApi(page, limit, search);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
};

export const useDepartment = (
  id: number,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: adminSettingsQueryKeys.department(id),
    queryFn: async () => {
      return await getDepartmentByIdApi(id);
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    ...options,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDepartmentDto) => {
      return await createDepartmentApi(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.departments() });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateDepartmentDto }) => {
      return await updateDepartmentApi(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.departments() });
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.department(variables.id) });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteDepartmentApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.departments() });
    },
  });
};

// ============================================================================
// Roles
// ============================================================================

export const useRoles = (
  page: number = 1,
  limit: number = 10,
  search?: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: adminSettingsQueryKeys.roleList(page, limit, search),
    queryFn: async () => {
      return await getRolesApi(page, limit, search);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
};

export const useRole = (
  id: number,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: adminSettingsQueryKeys.role(id),
    queryFn: async () => {
      return await getRoleByIdApi(id);
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    ...options,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleDto) => {
      return await createRoleApi(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.roles() });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateRoleDto }) => {
      return await updateRoleApi(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.roles() });
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.role(variables.id) });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteRoleApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.roles() });
    },
  });
};

// ============================================================================
// HR Permissions
// ============================================================================

export const useHrPermissions = (
  page: number = 1,
  limit: number = 10,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: adminSettingsQueryKeys.hrPermissionList(page, limit),
    queryFn: async () => {
      return await getHrPermissionsApi(page, limit);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
};

export const useHrPermission = (
  id: number,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: adminSettingsQueryKeys.hrPermission(id),
    queryFn: async () => {
      return await getHrPermissionsByIdApi(id);
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    ...options,
  });
};

export const useCreateHrPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateHrPermissionsDto) => {
      return await createHrPermissionsApi(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.hrPermissions() });
    },
  });
};

export const useUpdateHrPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateHrPermissionsDto }) => {
      return await updateHrPermissionsApi(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.hrPermissions() });
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.hrPermission(variables.id) });
    },
  });
};

export const useDeleteHrPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteHrPermissionsApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.hrPermissions() });
    },
  });
};

// ============================================================================
// Accountant Permissions
// ============================================================================

export const useAccountantPermissions = (
  page: number = 1,
  limit: number = 10,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: adminSettingsQueryKeys.accountantPermissionList(page, limit),
    queryFn: async () => {
      return await getAccountantPermissionsApi(page, limit);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
};

export const useAccountantPermission = (
  id: number,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: adminSettingsQueryKeys.accountantPermission(id),
    queryFn: async () => {
      return await getAccountantPermissionsByIdApi(id);
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    ...options,
  });
};

export const useCreateAccountantPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAccountantPermissionsDto) => {
      return await createAccountantPermissionsApi(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.accountantPermissions() });
    },
  });
};

export const useUpdateAccountantPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateAccountantPermissionsDto }) => {
      return await updateAccountantPermissionsApi(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.accountantPermissions() });
      queryClient.invalidateQueries({
        queryKey: adminSettingsQueryKeys.accountantPermission(variables.id),
      });
    },
  });
};

export const useDeleteAccountantPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteAccountantPermissionsApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.accountantPermissions() });
    },
  });
};

// ============================================================================
// Admin Users
// ============================================================================

export const useAdmins = (
  page: number = 1,
  limit: number = 10,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: adminSettingsQueryKeys.adminList(page, limit),
    queryFn: async () => {
      return await getAllAdminsApi(page, limit);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
};

export const useAdmin = (
  id: number,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: adminSettingsQueryKeys.admin(id),
    queryFn: async () => {
      return await getAdminByIdApi(id);
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    ...options,
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      return await createAdminApi(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.admins() });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id: _id, data }: { id: number; data: any }) => {
      return await updateAdminProfileApi(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.admins() });
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.admin(variables.id) });
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteAdminApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.admins() });
    },
  });
};

