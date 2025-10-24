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

// 1. Get all production units with comprehensive filtering
export const getProductionUnitsApi = async (
  page: number = 1, 
  limit: number = 20, 
  filters: {
    hasHead?: string;
    hasTeams?: string;
    hasProjects?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    headEmail?: string;
    headName?: string;
    unitName?: string;
    minTeams?: number;
    maxTeams?: number;
    minProjects?: number;
    maxProjects?: number;
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
      ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      ...(filters.headEmail && { headEmail: filters.headEmail }),
      ...(filters.headName && { headName: filters.headName }),
      ...(filters.unitName && { unitName: filters.unitName }),
      ...(filters.minTeams && { minTeams: filters.minTeams.toString() }),
      ...(filters.maxTeams && { maxTeams: filters.maxTeams.toString() }),
      ...(filters.minProjects && { minProjects: filters.minProjects.toString() }),
      ...(filters.maxProjects && { maxProjects: filters.maxProjects.toString() })
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
    console.log(`Fetching production unit with ID: ${unitId}`);
    const data = await apiGetJson<any>(`/production/units/${unitId}`);
    console.log('Production unit fetched successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Production unit fetched successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from production unit API');
  } catch (error) {
    console.error('Error fetching production unit:', error);
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
  } catch (error: any) {
    console.error('Error deleting production unit:', error);
    
    // Handle different types of errors
    if (error?.response?.status === 409) {
      throw new Error('Cannot delete unit: Unit has teams assigned. Please remove all teams first.');
    } else if (error?.response?.status === 403) {
      throw new Error('Access denied: You do not have permission to delete this unit.');
    } else if (error?.response?.status === 404) {
      throw new Error('Unit not found: The unit you are trying to delete does not exist.');
    } else if (error?.response?.status === 401) {
      throw new Error('Authentication required: Please login again.');
    } else if (error?.message) {
      throw new Error(error.message);
    } else {
      throw new Error('An unexpected error occurred while deleting the production unit');
    }
  }
};

// 6. Get available unit heads
export const getAvailableUnitHeadsApi = async (assigned?: boolean): Promise<ApiResponse<AvailableHeadsResponse>> => {
  try {
    console.log('Fetching available unit heads with assigned filter:', assigned);
    const queryParams = assigned !== undefined ? `?assigned=${assigned}` : '';
    const data = await apiGetJson<any>(`/production/units/available-heads${queryParams}`);
    console.log('Available unit heads fetched successfully:', data);
    console.log('Raw heads data:', data?.data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      const heads = data.data || [];
      console.log('Filtered heads count:', heads.length);
      console.log('Heads details:', heads.map((head: any) => ({
        id: head.id,
        name: `${head.firstName} ${head.lastName}`,
        isAssigned: head.isAssigned,
        hasTeams: head.teamsCount > 0
      })));
      
      return {
        success: data.success,
        message: data.message || 'Available unit heads fetched successfully',
        data: { heads: heads }
      };
    }
    
    throw new Error('Invalid response format from available heads API');
  } catch (error: any) {
    console.error('Error fetching available unit heads:', error);
    
    // Handle different types of errors
    if (error?.response?.status === 403) {
      throw new Error('Access denied: You do not have permission to view available heads.');
    } else if (error?.response?.status === 401) {
      throw new Error('Authentication required: Please login again.');
    } else if (error?.message) {
      throw new Error(error.message);
    } else {
      throw new Error('An unexpected error occurred while fetching available unit heads');
    }
  }
};


// 7. Add team to unit
export const addTeamToUnitApi = async (unitId: number, teamId: number): Promise<ApiResponse<any>> => {
  try {
    console.log(`Adding team ${teamId} to unit ${unitId}`);
    const data = await apiPostJson<any>(`/production/units/${unitId}/teams`, { teamId });
    console.log('Team added to unit successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Team added to unit successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from add team to unit API');
  } catch (error) {
    console.error('Error adding team to unit:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while adding team to unit');
  }
};

// 8. Remove team from unit
export const removeTeamFromUnitApi = async (unitId: number, teamId: number): Promise<ApiResponse<any>> => {
  try {
    console.log(`Removing team ${teamId} from unit ${unitId}`);
    const data = await apiDeleteJson<any>(`/production/units/${unitId}/teams/${teamId}`);
    console.log('Team removed from unit successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Team removed from unit successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from remove team from unit API');
  } catch (error) {
    console.error('Error removing team from unit:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while removing team from unit');
  }
};

// 9. Get available teams
export const getAvailableTeamsApi = async (assigned?: boolean): Promise<ApiResponse<any[]>> => {
  try {
    console.log('Fetching available teams with assigned filter:', assigned);
    const queryParams = assigned !== undefined ? `?assigned=${assigned}` : '';
    const data = await apiGetJson<any>(`/production/units/available-teams${queryParams}`);
    console.log('Available teams fetched successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Available teams fetched successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from available teams API');
  } catch (error: any) {
    console.error('Error fetching available teams:', error);
    
    // Handle different types of errors
    if (error?.response?.status === 403) {
      throw new Error('Access denied: You do not have permission to view available teams.');
    } else if (error?.response?.status === 401) {
      throw new Error('Authentication required: Please login again.');
    } else if (error?.message) {
      throw new Error(error.message);
    } else {
      throw new Error('An unexpected error occurred while fetching available teams');
    }
  }
};