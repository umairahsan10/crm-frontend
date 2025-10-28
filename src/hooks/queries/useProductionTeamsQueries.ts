import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProductionTeamsApi,
  getProductionTeamByIdApi,
  createProductionTeamApi,
  updateProductionTeamApi,
  deleteProductionTeamApi,
  getAvailableTeamLeadsApi,
  getAvailableEmployeesApi,
  addTeamMembersApi,
  removeTeamMemberApi
} from '../../apis/production-teams';
import type { 
  CreateTeamRequest, 
  UpdateTeamRequest, 
  AddMembersRequest,
  TeamFilters
} from '../../types/production/teams';

// ===== QUERY KEYS =====

export const productionTeamsQueryKeys = {
  all: ['production-teams'] as const,
  lists: () => [...productionTeamsQueryKeys.all, 'list'] as const,
  list: (filters: TeamFilters, page: number, limit: number) => 
    [...productionTeamsQueryKeys.lists(), { filters, page, limit }] as const,
  details: () => [...productionTeamsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...productionTeamsQueryKeys.details(), id] as const,
  availableLeads: () => [...productionTeamsQueryKeys.all, 'available-leads'] as const,
  availableEmployees: () => [...productionTeamsQueryKeys.all, 'available-employees'] as const,
};

// ===== QUERY HOOKS =====

// Get all production teams with filtering and pagination
export const useProductionTeams = (
  page: number = 1,
  limit: number = 20,
  filters: TeamFilters = {},
  options: any = {}
) => {
  return useQuery({
    queryKey: productionTeamsQueryKeys.list(filters, page, limit),
    queryFn: () => getProductionTeamsApi(page, limit, filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    ...options,
  });
};

// Get specific production team by ID
export const useProductionTeam = (teamId: string, options: any = {}) => {
  return useQuery({
    queryKey: productionTeamsQueryKeys.detail(teamId),
    queryFn: () => getProductionTeamByIdApi(teamId),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    enabled: !!teamId && options.enabled !== false,
    ...options,
  });
};

// Get available team leads
export const useAvailableTeamLeads = (assigned?: boolean, options: any = {}) => {
  return useQuery({
    queryKey: [...productionTeamsQueryKeys.availableLeads(), { assigned }],
    queryFn: () => getAvailableTeamLeadsApi(assigned),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Get available employees
export const useAvailableEmployees = (assigned?: boolean, options: any = {}) => {
  return useQuery({
    queryKey: [...productionTeamsQueryKeys.availableEmployees(), { assigned }],
    queryFn: () => getAvailableEmployeesApi(assigned),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// ===== MUTATION HOOKS =====

// Create production team
export const useCreateProductionTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamData: CreateTeamRequest) => createProductionTeamApi(teamData),
    onSuccess: () => {
      // Invalidate and refetch production teams list
      queryClient.invalidateQueries({ queryKey: productionTeamsQueryKeys.lists() });
      // Invalidate available leads to refresh the list
      queryClient.invalidateQueries({ queryKey: productionTeamsQueryKeys.availableLeads() });
    },
  });
};

// Update production team
export const useUpdateProductionTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, teamData }: { id: number; teamData: UpdateTeamRequest }) => 
      updateProductionTeamApi(id, teamData),
    onSuccess: (_, variables) => {
      // Invalidate and refetch production teams list and specific team
      queryClient.invalidateQueries({ queryKey: productionTeamsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionTeamsQueryKeys.detail(variables.id.toString()) });
      // Invalidate available leads to refresh the list
      queryClient.invalidateQueries({ queryKey: productionTeamsQueryKeys.availableLeads() });
    },
  });
};

// Delete production team
export const useDeleteProductionTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: number) => deleteProductionTeamApi(teamId),
    onSuccess: (_, variables) => {
      // Invalidate and refetch production teams list
      queryClient.invalidateQueries({ queryKey: productionTeamsQueryKeys.lists() });
      // Remove specific team from cache
      queryClient.removeQueries({ queryKey: productionTeamsQueryKeys.detail(variables.toString()) });
      // Invalidate available leads to refresh the list
      queryClient.invalidateQueries({ queryKey: productionTeamsQueryKeys.availableLeads() });
    },
  });
};

// Add members to team
export const useAddTeamMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, membersData }: { teamId: number; membersData: AddMembersRequest }) => 
      addTeamMembersApi(teamId, membersData),
    onSuccess: (_, variables) => {
      // Invalidate and refetch production teams list and specific team
      queryClient.invalidateQueries({ queryKey: productionTeamsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionTeamsQueryKeys.detail(variables.teamId.toString()) });
      // Invalidate available employees to refresh the list
      queryClient.invalidateQueries({ queryKey: productionTeamsQueryKeys.availableEmployees() });
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
      // Invalidate and refetch production teams list and specific team
      queryClient.invalidateQueries({ queryKey: productionTeamsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionTeamsQueryKeys.detail(variables.teamId.toString()) });
      // Invalidate available employees to refresh the list
      queryClient.invalidateQueries({ queryKey: productionTeamsQueryKeys.availableEmployees() });
    },
  });
};
