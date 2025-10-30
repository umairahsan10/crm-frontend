import { apiGetJson, apiPostJson, apiPatchJson, apiDeleteJson } from '../utils/apiClient';
import type {
  SalesUnit,
  CreateSalesUnitRequest,
  UpdateSalesUnitRequest,
  SalesUnitsListResponse,
  SalesUnitObjectResponse
} from '../types/sales/units';

// List units with advanced filters
export const getSalesUnitsApi = async (
  page: number = 1,
  limit: number = 20,
  filters: Record<string, any> = {}
): Promise<SalesUnitsListResponse> => {
  try {
    // Build query parameters - exactly like production
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.search && { search: filters.search }),
      ...(filters.hasHead && { hasHead: filters.hasHead }),
      ...(filters.hasTeams && { hasTeams: filters.hasTeams }),
      ...(filters.hasLeads && { hasLeads: filters.hasLeads }),
      ...(filters.hasEmployees && { hasEmployees: filters.hasEmployees }),
      ...(filters.headEmail && { headEmail: filters.headEmail }),
      ...(filters.headName && { headName: filters.headName }),
      ...(filters.unitName && { unitName: filters.unitName }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
    });

    const data = await apiGetJson<any>(`/sales/units?${queryParams.toString()}`);
    console.log('Raw GET sales units response:', data);
    
    // Handle API response format - exactly like production
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Sales units fetched successfully',
        data: data.data,
        pagination: data.pagination,
        total: data.total || data.data?.length || 0
      };
    }
    
    throw new Error('Invalid response format from sales units API');
  } catch (error) {
    console.error('Error fetching sales units:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching sales units');
  }
};

// Get unit details
export const getSalesUnitByIdApi = async (id: string): Promise<SalesUnitObjectResponse> => {
  try {
    console.log(`Fetching sales unit with ID: ${id}`);
    const data = await apiGetJson<any>(`/sales/units/${id}`);
    console.log('Sales unit fetched successfully:', data);
    
    // Handle API response format - exactly like production
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Sales unit fetched successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from sales unit API');
  } catch (error) {
    console.error('Error fetching sales unit:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching the sales unit');
  }
};

// Create unit
export const createSalesUnitApi = async (
  unitData: CreateSalesUnitRequest
): Promise<{ success: boolean; message: string; data?: SalesUnit }> => {
  try {
    console.log('Creating sales unit:', unitData);
    const data = await apiPostJson<any>('/sales/units', unitData);
    console.log('Sales unit created successfully:', data);
    
    // Handle API response format - exactly like production
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Sales unit created successfully',
        data: data.data || unitData as any
      };
    }
    
    throw new Error('Invalid response format from create sales unit API');
  } catch (error) {
    console.error('Error creating sales unit:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while creating the sales unit');
  }
};

// Update unit
export const updateSalesUnitApi = async (
  id: number,
  unitData: UpdateSalesUnitRequest
): Promise<{ success: boolean; message: string; data?: SalesUnit }> => {
  try {
    console.log(`Updating sales unit ${id}:`, unitData);
    const data = await apiPatchJson<any>(`/sales/units/${id}`, unitData);
    console.log('Sales unit updated successfully:', data);
    
    // Handle API response format - exactly like production
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Sales unit updated successfully',
        data: data.data || unitData as any
      };
    }
    
    throw new Error('Invalid response format from update sales unit API');
  } catch (error) {
    console.error('Error updating sales unit:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating the sales unit');
  }
};

// Available heads
export const getSalesAvailableHeadsApi = async (assigned?: boolean) => {
  try {
    console.log('Fetching available sales unit heads with assigned filter:', assigned);
    const queryParams = assigned !== undefined ? `?assigned=${assigned}` : '';
    const data = await apiGetJson<any>(`/sales/units/available-heads${queryParams}`);
    console.log('Available sales unit heads fetched successfully:', data);
    console.log('Raw heads data:', data?.data);
    
    // Handle API response format - exactly like production
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      // Handle both structures: data.data as array or data.data.heads
      let heads = [];
      if (Array.isArray(data.data)) {
        heads = data.data;
      } else if (data.data?.heads && Array.isArray(data.data.heads)) {
        heads = data.data.heads;
      } else if (data.data?.data && Array.isArray(data.data.data)) {
        heads = data.data.data;
      }
      
      console.log('Filtered heads count:', heads.length);
      console.log('Heads details:', heads.map((head: any) => ({
        id: head.id,
        name: `${head.firstName} ${head.lastName}`,
        isAssigned: head.isAssigned,
        hasTeams: head.teamsCount > 0
      })));
      
      return {
        success: data.success,
        message: data.message || 'Available sales unit heads fetched successfully',
        data: { heads: heads }
      };
    }
    
    throw new Error('Invalid response format from available heads API');
  } catch (error: any) {
    console.error('Error fetching available sales unit heads:', error);
    
    // Handle different types of errors - exactly like production
    if (error?.response?.status === 403) {
      throw new Error('Access denied: You do not have permission to view available heads.');
    } else if (error?.response?.status === 401) {
      throw new Error('Authentication required: Please login again.');
    } else if (error?.message) {
      throw new Error(error.message);
    } else {
      throw new Error('An unexpected error occurred while fetching available sales unit heads');
    }
  }
};

// Available teams
export const getSalesAvailableTeamsApi = async (assigned?: boolean) => {
  try {
    console.log('Fetching available sales teams with assigned filter:', assigned);
    const queryParams = assigned !== undefined ? `?assigned=${assigned}` : '';
    const data = await apiGetJson<any>(`/sales/units/available-teams${queryParams}`);
    console.log('Available sales teams fetched successfully:', data);
    
    // Handle API response format - exactly like production
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Available sales teams fetched successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from available teams API');
  } catch (error: any) {
    console.error('Error fetching available sales teams:', error);
    
    // Handle different types of errors - exactly like production
    if (error?.response?.status === 403) {
      throw new Error('Access denied: You do not have permission to view available teams.');
    } else if (error?.response?.status === 401) {
      throw new Error('Authentication required: Please login again.');
    } else if (error?.message) {
      throw new Error(error.message);
    } else {
      throw new Error('An unexpected error occurred while fetching available sales teams');
    }
  }
};

// Assign team
export const assignTeamToSalesUnitApi = async (unitId: number, teamId: number) => {
  try {
    console.log(`Adding team ${teamId} to sales unit ${unitId}`);
    const data = await apiPostJson<any>(`/sales/units/${unitId}/teams`, { teamId });
    console.log('Team added to sales unit successfully:', data);
    
    // Handle API response format - exactly like production
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Team added to sales unit successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from add team to sales unit API');
  } catch (error) {
    console.error('Error adding team to sales unit:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while adding team to sales unit');
  }
};

// Remove team
export const removeTeamFromSalesUnitApi = async (unitId: number, teamId: number) => {
  try {
    console.log(`Removing team ${teamId} from sales unit ${unitId}`);
    const data = await apiDeleteJson<any>(`/sales/units/${unitId}/teams/${teamId}`);
    console.log('Team removed from sales unit successfully:', data);
    
    // Handle API response format - exactly like production
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Team removed from sales unit successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from remove team from sales unit API');
  } catch (error) {
    console.error('Error removing team from sales unit:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while removing team from sales unit');
  }
};

// Delete unit
export const deleteSalesUnitApi = async (id: number): Promise<{ success: boolean; message: string; data?: null }> => {
  try {
    console.log(`Deleting sales unit ${id}`);
    const data = await apiDeleteJson<any>(`/sales/units/${id}`);
    console.log('Sales unit deleted successfully:', data);
    
    // Handle API response format - exactly like production
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Sales unit deleted successfully',
        data: null
      };
    }
    
    throw new Error('Invalid response format from delete sales unit API');
  } catch (error: any) {
    console.error('Error deleting sales unit:', error);
    
    // Handle different types of errors - exactly like production
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
      throw new Error('An unexpected error occurred while deleting the sales unit');
    }
  }
};

// Completed leads from deleted units (for admin views)
export const getCompletedLeadsFromDeletedUnitsApi = async () => {
  const data = await apiGetJson<any>(`/sales/units/deleted/completed-leads`);
  return data;
};


