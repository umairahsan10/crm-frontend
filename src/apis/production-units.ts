import { apiGetJson, apiPostJson, apiPatchJson, apiDeleteJson } from '../utils/apiClient';
import type {
  Unit,
  CreateUnitRequest,
  UpdateUnitRequest
} from '../types/production/units';

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Response interfaces for specific endpoints
interface AvailableHeadsResponse {
  heads: { id: number; firstName: string; lastName: string; email: string; isAssigned: boolean; currentUnit?: any }[];
}

// 1. Get all production units with basic info
export const getProductionUnitsApi = async (
  page: number = 1, 
  limit: number = 20, 
  filters: {
    hasHead?: string;
    hasTeams?: string;
    hasProjects?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<ApiResponse<Unit[]>> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.hasHead && { hasHead: filters.hasHead }),
      ...(filters.hasTeams && { hasTeams: filters.hasTeams }),
      ...(filters.hasProjects && { hasProjects: filters.hasProjects }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    });

    const data = await apiGetJson<any>(`/production/units?${queryParams.toString()}`);
    console.log('Raw GET production units response:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Production units fetched successfully',
        data: data.data,
        pagination: data.pagination
      };
    }
    
    throw new Error('Invalid response format from production units API');
  } catch (error) {
    console.error('Error fetching production units:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching production units');
  }
};

// 2. Get specific production unit with all related data
export const getProductionUnitByIdApi = async (unitId: string): Promise<ApiResponse<Unit>> => {
  try {
    console.log(`Fetching production unit with ID: ${unitId} and all related data`);
    const data = await apiGetJson<any>(`/production/units?unitId=${unitId}&include=employees,projects,teams,head`);
    console.log('Production unit with all data fetched successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Production unit fetched successfully',
        data: data.data[0] || data.data // Handle single unit response
      };
    }
    
    throw new Error('Invalid response format from production unit API');
  } catch (error) {
    console.error('Error fetching production unit with all data:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching the production unit');
  }
};

// 3. Create production unit
export const createProductionUnitApi = async (unitData: CreateUnitRequest): Promise<ApiResponse<Unit>> => {
  try {
    console.log('Creating production unit:', unitData);
    const data = await apiPostJson<any>('/production/units', unitData);
    console.log('Production unit created successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Production unit created successfully',
        data: data.data || unitData as any
      };
    }
    
    throw new Error('Invalid response format from create production unit API');
  } catch (error) {
    console.error('Error creating production unit:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while creating the production unit');
  }
};

// 4. Update production unit
export const updateProductionUnitApi = async (id: number, unitData: UpdateUnitRequest): Promise<ApiResponse<Unit>> => {
  try {
    console.log(`Updating production unit ${id}:`, unitData);
    const data = await apiPatchJson<any>(`/production/units/${id}`, unitData);
    console.log('Production unit updated successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Production unit updated successfully',
        data: data.data || unitData as any
      };
    }
    
    throw new Error('Invalid response format from update production unit API');
  } catch (error) {
    console.error('Error updating production unit:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating the production unit');
  }
};

// 5. Delete production unit
export const deleteProductionUnitApi = async (id: number): Promise<ApiResponse<null>> => {
  try {
    console.log(`Deleting production unit ${id}`);
    const data = await apiDeleteJson<any>(`/production/units/${id}`);
    console.log('Production unit deleted successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Production unit deleted successfully',
        data: null
      };
    }
    
    throw new Error('Invalid response format from delete production unit API');
  } catch (error) {
    console.error('Error deleting production unit:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while deleting the production unit');
  }
};

// 6. Get available unit heads
export const getAvailableUnitHeadsApi = async (assigned?: boolean): Promise<ApiResponse<AvailableHeadsResponse>> => {
  try {
    console.log('Fetching available unit heads...');
    const queryParams = assigned !== undefined ? `?assigned=${assigned}` : '';
    const data = await apiGetJson<any>(`/production/units/available-heads${queryParams}`);
    console.log('Available unit heads fetched successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Available unit heads fetched successfully',
        data: { heads: data.data }
      };
    }
    
    throw new Error('Invalid response format from available heads API');
  } catch (error) {
    console.error('Error fetching available unit heads:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching available unit heads');
  }
};


// 9. Get teams in unit
export const getUnitTeamsApi = async (id: number): Promise<ApiResponse<any>> => {
  try {
    console.log(`Fetching teams in unit ${id}`);
    const data = await apiGetJson<any>(`/production/teams/unit/${id}`);
    console.log('Unit teams fetched successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Unit teams fetched successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from unit teams API');
  } catch (error) {
    console.error('Error fetching unit teams:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching unit teams');
  }
};