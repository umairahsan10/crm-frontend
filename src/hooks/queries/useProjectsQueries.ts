import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjectsApi,
  getProjectByIdApi,
  createProjectFromPaymentApi,
  assignUnitHeadApi,
  updateProjectApi
} from '../../apis/projects';
import type {
  CreateProjectFromPaymentRequest,
  AssignUnitHeadRequest,
  UnifiedUpdateProjectDto,
  ProjectQueryParams
} from '../../types/production/projects';

// ===== QUERY KEYS =====

export const projectsQueryKeys = {
  all: ['projects'] as const,
  lists: () => [...projectsQueryKeys.all, 'list'] as const,
  list: (filters: ProjectQueryParams, page: number, limit: number) =>
    [...projectsQueryKeys.lists(), { filters, page, limit }] as const,
  details: () => [...projectsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectsQueryKeys.details(), id] as const,
};

// ===== QUERY HOOKS =====

// Get all projects with filtering, pagination, and sorting
export const useProjects = (
  page: number = 1,
  limit: number = 10,
  filters: ProjectQueryParams = {},
  options: any = {}
) => {
  return useQuery({
    queryKey: projectsQueryKeys.list(filters, page, limit),
    queryFn: () => getProjectsApi(page, limit, filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    ...options,
  });
};

// Get specific project by ID
export const useProject = (projectId: string, options: any = {}) => {
  return useQuery({
    queryKey: projectsQueryKeys.detail(projectId),
    queryFn: () => getProjectByIdApi(projectId),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    enabled: !!projectId && options.enabled !== false,
    ...options,
  });
};

// ===== MUTATION HOOKS =====

// Create project from payment
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectData: CreateProjectFromPaymentRequest) =>
      createProjectFromPaymentApi(projectData),
    onSuccess: () => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.lists() });
    },
  });
};

// Assign unit head to project
export const useAssignUnitHead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, assignData }: { projectId: number; assignData: AssignUnitHeadRequest }) =>
      assignUnitHeadApi(projectId, assignData),
    onSuccess: (_, variables) => {
      // Invalidate and refetch projects list and specific project
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.detail(variables.projectId.toString()) });
    },
  });
};

// Update project
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, updateData }: { projectId: number; updateData: UnifiedUpdateProjectDto }) =>
      updateProjectApi(projectId, updateData),
    onSuccess: (_, variables) => {
      // Invalidate and refetch projects list and specific project
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.detail(variables.projectId.toString()) });
    },
  });
};

