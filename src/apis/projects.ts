import { apiGetJson, apiPostJson, apiPutJson } from '../utils/apiClient';
import type {
  Project,
  CreateProjectFromPaymentRequest,
  AssignUnitHeadRequest,
  UnifiedUpdateProjectDto,
  ProjectQueryParams,
  ApiResponse,
  ProjectListResponse,
  ProjectDetailResponse
} from '../types/production/projects';

// 1. Get all projects with filtering, pagination, and sorting
export const getProjectsApi = async (
  page: number = 1,
  limit: number = 10,
  filters: ProjectQueryParams = {}
): Promise<ProjectListResponse> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.filterBy && { filterBy: filters.filterBy }),
      ...(filters.status && { status: filters.status }),
      ...(filters.difficulty && { difficulty: filters.difficulty }),
      ...(filters.paymentStage && { paymentStage: filters.paymentStage }),
      ...(filters.teamId && { teamId: filters.teamId.toString() }),
      ...(filters.unitHeadId && { unitHeadId: filters.unitHeadId.toString() }),
      ...(filters.employeeId && { employeeId: filters.employeeId.toString() }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      ...(filters.search && { search: filters.search })
    });

    const data = await apiGetJson<any>(`/projects?${queryParams.toString()}`);
    console.log('Raw GET projects response:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Projects fetched successfully',
        data: data.data || [],
        total: data.total || data.data?.length || 0,
        pagination: data.pagination || {
          page: page,
          limit: limit,
          totalPages: Math.ceil((data.total || 0) / limit)
        }
      };
    }
    
    throw new Error('Invalid response format from projects API');
  } catch (error) {
    console.error('Error fetching projects:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching projects');
  }
};

// 2. Get specific project by ID
export const getProjectByIdApi = async (projectId: string): Promise<ProjectDetailResponse> => {
  try {
    console.log(`Fetching project with ID: ${projectId}`);
    const data = await apiGetJson<any>(`/projects/${projectId}`);
    console.log('Project fetched successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Project fetched successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from project API');
  } catch (error) {
    console.error('Error fetching project:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching the project');
  }
};

// 3. Create project from payment
export const createProjectFromPaymentApi = async (
  projectData: CreateProjectFromPaymentRequest
): Promise<ApiResponse<Project>> => {
  try {
    console.log('Creating project from payment:', projectData);
    const data = await apiPostJson<any>('/projects/create-from-payment', projectData);
    console.log('Project created successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Project created successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from create project API');
  } catch (error: any) {
    console.error('Error creating project:', error);
    
    // Handle different types of errors
    if (error?.response?.status === 400) {
      throw new Error(error.message || 'Invalid data provided');
    } else if (error?.response?.status === 403) {
      throw new Error('Access denied: You do not have permission to create projects');
    } else if (error?.response?.status === 404) {
      throw new Error('Cracked lead, client, or sales rep not found');
    } else if (error?.response?.status === 401) {
      throw new Error('Authentication required: Please login again');
    } else if (error?.message) {
      throw new Error(error.message);
    }
    
    throw new Error('An unexpected error occurred while creating the project');
  }
};

// 4. Assign unit head to project
export const assignUnitHeadApi = async (
  projectId: number,
  assignData: AssignUnitHeadRequest
): Promise<ApiResponse<Project>> => {
  try {
    console.log(`Assigning unit head to project ${projectId}:`, assignData);
    const data = await apiPutJson<any>(`/projects/${projectId}/assign-unit-head`, assignData);
    console.log('Unit head assigned successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Unit head assigned successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from assign unit head API');
  } catch (error: any) {
    console.error('Error assigning unit head:', error);
    
    // Handle different types of errors
    if (error?.response?.status === 400) {
      throw new Error(error.message || 'Invalid data provided');
    } else if (error?.response?.status === 403) {
      throw new Error('Access denied: Only managers can assign unit heads');
    } else if (error?.response?.status === 404) {
      throw new Error('Project or unit head not found');
    } else if (error?.response?.status === 401) {
      throw new Error('Authentication required: Please login again');
    } else if (error?.message) {
      throw new Error(error.message);
    }
    
    throw new Error('An unexpected error occurred while assigning unit head');
  }
};

// 5. Update project (unified endpoint)
export const updateProjectApi = async (
  projectId: number,
  updateData: UnifiedUpdateProjectDto
): Promise<ApiResponse<Project>> => {
  try {
    console.log(`Updating project ${projectId}:`, updateData);
    const data = await apiPutJson<any>(`/projects/${projectId}`, updateData);
    console.log('Project updated successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Project updated successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from update project API');
  } catch (error: any) {
    console.error('Error updating project:', error);
    console.error('Update data sent:', updateData);
    console.error('Error response:', error?.response);
    
    // Handle different types of errors
    if (error?.status === 400 || error?.response?.status === 400) {
      const errorMessage = error?.message || error?.response?.data?.message || 'Invalid data or invalid status transition';
      throw new Error(errorMessage);
    } else if (error?.status === 403 || error?.response?.status === 403) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Access denied: You do not have permission to update this project';
      throw new Error(errorMessage);
    } else if (error?.status === 404 || error?.response?.status === 404) {
      throw new Error('Project not found');
    } else if (error?.status === 401 || error?.response?.status === 401) {
      throw new Error('Authentication required: Please login again');
    } else if (error?.message) {
      throw new Error(error.message);
    }
    
    throw new Error('An unexpected error occurred while updating the project');
  }
};

