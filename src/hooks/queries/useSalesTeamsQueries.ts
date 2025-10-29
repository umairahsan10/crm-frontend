import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSalesTeamsApi,
  getSalesTeamByIdApi,
  createSalesTeamApi,
  updateSalesTeamApi,
  deleteSalesTeamApi,
  getAvailableTeamLeadsApi,
  getAvailableEmployeesApi,
  addTeamMembersApi,
  addEmployeeToTeamApi,
  removeTeamMemberApi
} from '../../apis/sales-teams';
import type { 
  CreateTeamRequest, 
  UpdateTeamRequest, 
  AddMembersRequest,
  TeamFilters
} from '../../types/sales/teams';

// ===== QUERY KEYS =====

export const salesTeamsQueryKeys = {
  all: ['sales-teams'] as const,
  lists: () => [...salesTeamsQueryKeys.all, 'list'] as const,
  list: (filters: TeamFilters, page: number, limit: number) => 
    [...salesTeamsQueryKeys.lists(), { filters, page, limit }] as const,
  details: () => [...salesTeamsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...salesTeamsQueryKeys.details(), id] as const,
  availableLeads: () => [...salesTeamsQueryKeys.all, 'available-leads'] as const,
  availableEmployees: () => [...salesTeamsQueryKeys.all, 'available-employees'] as const,
};

// ===== QUERY HOOKS =====

// Get all sales teams with filtering and pagination
export const useSalesTeams = (
  page: number = 1,
  limit: number = 20,
  filters: TeamFilters = {},
  options: any = {}
) => {
  return useQuery({
    queryKey: salesTeamsQueryKeys.list(filters, page, limit),
    queryFn: () => getSalesTeamsApi(page, limit, filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    ...options,
  });
};

// Get specific sales team by ID
export const useSalesTeam = (teamId: string, options: any = {}) => {
  return useQuery({
    queryKey: salesTeamsQueryKeys.detail(teamId),
    queryFn: () => getSalesTeamByIdApi(teamId),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    enabled: !!teamId && options.enabled !== false,
    ...options,
  });
};

// Get available team leads
export const useAvailableTeamLeads = (assigned?: boolean, options: any = {}) => {
  return useQuery({
    queryKey: [...salesTeamsQueryKeys.availableLeads(), { assigned }],
    queryFn: () => getAvailableTeamLeadsApi(assigned),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Get available employees
export const useAvailableEmployees = (assigned?: boolean, options: any = {}) => {
  return useQuery({
    queryKey: [...salesTeamsQueryKeys.availableEmployees(), { assigned }],
    queryFn: () => getAvailableEmployeesApi(assigned),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// ===== MUTATION HOOKS =====

// Create sales team
export const useCreateSalesTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamData: CreateTeamRequest) => createSalesTeamApi(teamData),
    onSuccess: () => {
      // Invalidate and refetch sales teams list
      queryClient.invalidateQueries({ queryKey: salesTeamsQueryKeys.lists() });
      // Invalidate available leads to refresh the list
      queryClient.invalidateQueries({ queryKey: salesTeamsQueryKeys.availableLeads() });
    },
  });
};

// Update sales team
export const useUpdateSalesTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, teamData }: { id: number; teamData: UpdateTeamRequest }) => 
      updateSalesTeamApi(id, teamData),
    onSuccess: (_, variables) => {
      // Invalidate and refetch sales teams list and specific team
      queryClient.invalidateQueries({ queryKey: salesTeamsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salesTeamsQueryKeys.detail(variables.id.toString()) });
      // Invalidate available leads to refresh the list
      queryClient.invalidateQueries({ queryKey: salesTeamsQueryKeys.availableLeads() });
    },
  });
};

// Delete sales team
export const useDeleteSalesTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: number) => deleteSalesTeamApi(teamId),
    onSuccess: (_, variables) => {
      // Invalidate and refetch sales teams list
      queryClient.invalidateQueries({ queryKey: salesTeamsQueryKeys.lists() });
      // Remove specific team from cache
      queryClient.removeQueries({ queryKey: salesTeamsQueryKeys.detail(variables.toString()) });
      // Invalidate available leads to refresh the list
      queryClient.invalidateQueries({ queryKey: salesTeamsQueryKeys.availableLeads() });
    },
  });
};

// Add members to team (bulk operation)
export const useAddTeamMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, membersData }: { teamId: number; membersData: AddMembersRequest }) => 
      addTeamMembersApi(teamId, membersData),
    onSuccess: (_, variables) => {
      // Invalidate and refetch sales teams list and specific team
      queryClient.invalidateQueries({ queryKey: salesTeamsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salesTeamsQueryKeys.detail(variables.teamId.toString()) });
      // Invalidate available employees to refresh the list
      queryClient.invalidateQueries({ queryKey: salesTeamsQueryKeys.availableEmployees() });
    },
  });
};

// Add single employee to team
export const useAddEmployeeToTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, employeeId }: { teamId: number; employeeId: number }) => 
      addEmployeeToTeamApi(teamId, employeeId),
    onSuccess: (_, variables) => {
      // Invalidate and refetch sales teams list and specific team
      queryClient.invalidateQueries({ queryKey: salesTeamsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salesTeamsQueryKeys.detail(variables.teamId.toString()) });
      // Invalidate available employees to refresh the list
      queryClient.invalidateQueries({ queryKey: salesTeamsQueryKeys.availableEmployees() });
    },
  });
};

// Remove member from team
export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, employeeId }: { teamId: number; employeeId: number }) => 
      removeTeamMemberApi(teamId, employeeId),
    onSuccess: (_, variables) => {
      // Invalidate and refetch sales teams list and specific team
      queryClient.invalidateQueries({ queryKey: salesTeamsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salesTeamsQueryKeys.detail(variables.teamId.toString()) });
      // Invalidate available employees to refresh the list
      queryClient.invalidateQueries({ queryKey: salesTeamsQueryKeys.availableEmployees() });
    },
  });
};
