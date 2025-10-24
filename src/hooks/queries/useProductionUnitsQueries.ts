import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProductionUnitsApi,
  getProductionUnitByIdApi,
  createProductionUnitApi,
  updateProductionUnitApi,
  deleteProductionUnitApi,
  getAvailableUnitHeadsApi,
  getAvailableTeamsApi,
  addTeamToUnitApi,
  removeTeamFromUnitApi
} from '../../apis/production-units';
import type { 
  CreateUnitRequest, 
  UpdateUnitRequest, 
  UnitFilters
} from '../../types/production/units';

// ===== QUERY KEYS =====

export const productionUnitsQueryKeys = {
  all: ['production-units'] as const,
  lists: () => [...productionUnitsQueryKeys.all, 'list'] as const,
  list: (filters: UnitFilters, page: number, limit: number) => 
    [...productionUnitsQueryKeys.lists(), { filters, page, limit }] as const,
  details: () => [...productionUnitsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...productionUnitsQueryKeys.details(), id] as const,
  teams: (unitId: number) => [...productionUnitsQueryKeys.all, 'teams', unitId] as const,
  availableHeads: () => [...productionUnitsQueryKeys.all, 'available-heads'] as const,
  availableTeams: () => [...productionUnitsQueryKeys.all, 'available-teams'] as const,
};

// ===== QUERY HOOKS =====

// Get all production units with filtering and pagination
export const useProductionUnits = (
  page: number = 1,
  limit: number = 20,
  filters: UnitFilters = {},
  options: any = {}
) => {
  return useQuery({
    queryKey: productionUnitsQueryKeys.list(filters, page, limit),
    queryFn: () => getProductionUnitsApi(page, limit, filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    ...options,
  });
};

// Get specific production unit by ID
export const useProductionUnit = (unitId: string, options: any = {}) => {
  return useQuery({
    queryKey: productionUnitsQueryKeys.detail(unitId),
    queryFn: () => getProductionUnitByIdApi(unitId),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    enabled: !!unitId && options.enabled !== false,
    ...options,
  });
};

// Get available unit heads
export const useAvailableUnitHeads = (assigned?: boolean, options: any = {}) => {
  return useQuery({
    queryKey: [...productionUnitsQueryKeys.availableHeads(), { assigned }],
    queryFn: () => getAvailableUnitHeadsApi(assigned),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Get available teams
export const useAvailableTeams = (assigned?: boolean, options: any = {}) => {
  return useQuery({
    queryKey: [...productionUnitsQueryKeys.availableTeams(), { assigned }],
    queryFn: () => getAvailableTeamsApi(assigned),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};


// Note: getUnitTeamsApi was removed as it's not part of the documented API
// Teams are now included in the unit details API response


// ===== MUTATION HOOKS =====

// Create production unit
export const useCreateProductionUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unitData: CreateUnitRequest) => createProductionUnitApi(unitData),
    onSuccess: () => {
      // Invalidate and refetch production units list
      queryClient.invalidateQueries({ queryKey: productionUnitsQueryKeys.lists() });
    },
  });
};

// Update production unit
export const useUpdateProductionUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, unitData }: { id: number; unitData: UpdateUnitRequest }) => 
      updateProductionUnitApi(id, unitData),
    onSuccess: (_, variables) => {
      // Invalidate and refetch production units list and specific unit
      queryClient.invalidateQueries({ queryKey: productionUnitsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionUnitsQueryKeys.detail(variables.id.toString()) });
    },
  });
};

// Delete production unit
export const useDeleteProductionUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unitId: number) => deleteProductionUnitApi(unitId),
    onSuccess: (_, variables) => {
      // Invalidate and refetch production units list
      queryClient.invalidateQueries({ queryKey: productionUnitsQueryKeys.lists() });
      // Remove specific unit from cache
      queryClient.removeQueries({ queryKey: productionUnitsQueryKeys.detail(variables.toString()) });
    },
  });
};

// Add team to unit
export const useAddTeamToUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ unitId, teamId }: { unitId: number; teamId: number }) => 
      addTeamToUnitApi(unitId, teamId),
    onSuccess: (_, variables) => {
      // Invalidate and refetch production units list and specific unit
      queryClient.invalidateQueries({ queryKey: productionUnitsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionUnitsQueryKeys.detail(variables.unitId.toString()) });
      // Invalidate available teams to refresh the list
      queryClient.invalidateQueries({ queryKey: productionUnitsQueryKeys.availableTeams() });
    },
  });
};

// Remove team from unit
export const useRemoveTeamFromUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ unitId, teamId }: { unitId: number; teamId: number }) => 
      removeTeamFromUnitApi(unitId, teamId),
    onSuccess: (_, variables) => {
      // Invalidate and refetch production units list and specific unit
      queryClient.invalidateQueries({ queryKey: productionUnitsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionUnitsQueryKeys.detail(variables.unitId.toString()) });
      // Invalidate available teams to refresh the list
      queryClient.invalidateQueries({ queryKey: productionUnitsQueryKeys.availableTeams() });
    },
  });
};