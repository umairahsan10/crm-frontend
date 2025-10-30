import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getSalesUnitsApi,
  getSalesUnitByIdApi,
  createSalesUnitApi,
  updateSalesUnitApi,
  deleteSalesUnitApi,
  getSalesAvailableHeadsApi,
  getSalesAvailableTeamsApi,
  assignTeamToSalesUnitApi,
  removeTeamFromSalesUnitApi
} from '../../apis/sales-units';

export const salesUnitsQueryKeys = {
  all: ['sales-units'] as const,
  lists: () => [...salesUnitsQueryKeys.all, 'list'] as const,
  list: (filters: any, page: number, limit: number) => 
    [...salesUnitsQueryKeys.lists(), { filters, page, limit }] as const,
  details: () => [...salesUnitsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...salesUnitsQueryKeys.details(), id] as const,
  availableHeads: () => [...salesUnitsQueryKeys.all, 'available-heads'] as const,
  availableTeams: () => [...salesUnitsQueryKeys.all, 'available-teams'] as const,
};

export const useSalesUnits = (
  page: number = 1,
  limit: number = 20,
  filters: any = {},
  options: any = {}
) => {
  return useQuery({
    queryKey: salesUnitsQueryKeys.list(filters, page, limit),
    queryFn: () => getSalesUnitsApi(page, limit, filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    ...options,
  });
};

export const useSalesUnit = (unitId: string, options: any = {}) => {
  return useQuery({
    queryKey: salesUnitsQueryKeys.detail(unitId),
    queryFn: () => getSalesUnitByIdApi(unitId),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    enabled: !!unitId && options.enabled !== false,
    ...options,
  });
};

export const useCreateSalesUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (unitData: any) => createSalesUnitApi(unitData),
    onSuccess: () => {
      // Invalidate and refetch sales units list
      queryClient.invalidateQueries({ queryKey: salesUnitsQueryKeys.lists() });
    },
  });
};

export const useUpdateSalesUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, unitData }: { id: number; unitData: any }) => 
      updateSalesUnitApi(id, unitData),
    onSuccess: (_, variables) => {
      // Invalidate and refetch sales units list and specific unit
      queryClient.invalidateQueries({ queryKey: salesUnitsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salesUnitsQueryKeys.detail(variables.id.toString()) });
    },
  });
};

// Delete sales unit
export const useDeleteSalesUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unitId: number) => deleteSalesUnitApi(unitId),
    onSuccess: (_, variables) => {
      // Invalidate and refetch sales units list
      queryClient.invalidateQueries({ queryKey: salesUnitsQueryKeys.lists() });
      // Remove specific unit from cache
      queryClient.removeQueries({ queryKey: salesUnitsQueryKeys.detail(variables.toString()) });
    },
  });
};

export const useAvailableSalesUnitHeads = (assigned?: boolean, options: any = {}) => {
  return useQuery({
    queryKey: [...salesUnitsQueryKeys.availableHeads(), { assigned }],
    queryFn: () => getSalesAvailableHeadsApi(assigned),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useAvailableSalesTeams = (assigned?: boolean, options: any = {}) => {
  return useQuery({
    queryKey: [...salesUnitsQueryKeys.availableTeams(), { assigned }],
    queryFn: () => getSalesAvailableTeamsApi(assigned),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useAssignTeamToSalesUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ unitId, teamId }: { unitId: number; teamId: number }) => 
      assignTeamToSalesUnitApi(unitId, teamId),
    onSuccess: (_, variables) => {
      // Invalidate and refetch sales units list and specific unit
      queryClient.invalidateQueries({ queryKey: salesUnitsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salesUnitsQueryKeys.detail(variables.unitId.toString()) });
      // Invalidate available teams to refresh the list
      queryClient.invalidateQueries({ queryKey: salesUnitsQueryKeys.availableTeams() });
    },
  });
};

export const useRemoveTeamFromSalesUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ unitId, teamId }: { unitId: number; teamId: number }) => 
      removeTeamFromSalesUnitApi(unitId, teamId),
    onSuccess: (_, variables) => {
      // Invalidate and refetch sales units list and specific unit
      queryClient.invalidateQueries({ queryKey: salesUnitsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salesUnitsQueryKeys.detail(variables.unitId.toString()) });
      // Invalidate available teams to refresh the list
      queryClient.invalidateQueries({ queryKey: salesUnitsQueryKeys.availableTeams() });
    },
  });
};


