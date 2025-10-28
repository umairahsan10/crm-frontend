import { apiGetJson, apiPostJson, apiPatchJson, apiDeleteJson } from '../utils/apiClient';
import type {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddMembersRequest
} from '../types/production/teams';

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
interface AvailableTeamLeadsResponse {
  leads: { id: number; firstName: string; lastName: string; email: string; isAssigned: boolean; currentTeam?: any }[];
}

interface AvailableEmployeesResponse {
  employees: { id: number; firstName: string; lastName: string; email: string; role: string; isAssigned: boolean; currentTeamLead?: any }[];
}

// 1. Get all production teams with comprehensive filtering
export const getProductionTeamsApi = async (
  page: number = 1, 
  limit: number = 20, 
  filters: {
    teamId?: number;
    unitId?: number;
    hasLead?: string;
    hasMembers?: string;
    hasProjects?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    leadEmail?: string;
    leadName?: string;
    teamName?: string;
    unitName?: string;
    minMembers?: number;
    maxMembers?: number;
    minProjects?: number;
    maxProjects?: number;
  } = {}
): Promise<ApiResponse<Team[]>> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.teamId && { teamId: filters.teamId.toString() }),
      ...(filters.unitId && { unitId: filters.unitId.toString() }),
      ...(filters.hasLead && { hasLead: filters.hasLead }),
      ...(filters.hasMembers && { hasMembers: filters.hasMembers }),
      ...(filters.hasProjects && { hasProjects: filters.hasProjects }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      ...(filters.leadEmail && { leadEmail: filters.leadEmail }),
      ...(filters.leadName && { leadName: filters.leadName }),
      ...(filters.teamName && { teamName: filters.teamName }),
      ...(filters.unitName && { unitName: filters.unitName }),
      ...(filters.minMembers && { minMembers: filters.minMembers.toString() }),
      ...(filters.maxMembers && { maxMembers: filters.maxMembers.toString() }),
      ...(filters.minProjects && { minProjects: filters.minProjects.toString() }),
      ...(filters.maxProjects && { maxProjects: filters.maxProjects.toString() })
    });

    const data = await apiGetJson<any>(`/production/teams?${queryParams.toString()}`);
    console.log('Raw GET production teams response:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Production teams fetched successfully',
        data: data.data,
        pagination: data.pagination
      };
    }
    
    throw new Error('Invalid response format from production teams API');
  } catch (error) {
    console.error('Error fetching production teams:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching production teams');
  }
};

// 2. Get specific production team with all related data
export const getProductionTeamByIdApi = async (teamId: string): Promise<ApiResponse<Team>> => {
  try {
    console.log(`Fetching production team with ID: ${teamId}`);
    const data = await apiGetJson<any>(`/production/teams/${teamId}`);
    console.log('Production team fetched successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Production team fetched successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from production team API');
  } catch (error) {
    console.error('Error fetching production team:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching the production team');
  }
};

// 3. Create production team
export const createProductionTeamApi = async (teamData: CreateTeamRequest): Promise<ApiResponse<Team>> => {
  try {
    console.log('Creating production team:', teamData);
    const data = await apiPostJson<any>('/production/teams', teamData);
    console.log('Production team created successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Production team created successfully',
        data: data.data || teamData as any
      };
    }
    
    throw new Error('Invalid response format from create production team API');
  } catch (error) {
    console.error('Error creating production team:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while creating the production team');
  }
};

// 4. Update production team
export const updateProductionTeamApi = async (id: number, teamData: UpdateTeamRequest): Promise<ApiResponse<Team>> => {
  try {
    console.log(`Updating production team ${id}:`, teamData);
    const data = await apiPatchJson<any>(`/production/teams/${id}`, teamData);
    console.log('Production team updated successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Production team updated successfully',
        data: data.data || teamData as any
      };
    }
    
    throw new Error('Invalid response format from update production team API');
  } catch (error) {
    console.error('Error updating production team:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating the production team');
  }
};

// 5. Delete production team
export const deleteProductionTeamApi = async (id: number): Promise<ApiResponse<null>> => {
  try {
    console.log(`Deleting production team ${id}`);
    const data = await apiDeleteJson<any>(`/production/teams/${id}`);
    console.log('Production team deleted successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Production team deleted successfully',
        data: null
      };
    }
    
    throw new Error('Invalid response format from delete production team API');
  } catch (error: any) {
    console.error('Error deleting production team:', error);
    
    // Handle different types of errors
    if (error?.response?.status === 409) {
      throw new Error('Cannot delete team: Team has members or projects assigned. Please remove all members and projects first.');
    } else if (error?.response?.status === 403) {
      throw new Error('Access denied: You do not have permission to delete this team.');
    } else if (error?.response?.status === 404) {
      throw new Error('Team not found: The team you are trying to delete does not exist.');
    } else if (error?.response?.status === 401) {
      throw new Error('Authentication required: Please login again.');
    } else if (error?.message) {
      throw new Error(error.message);
    } else {
      throw new Error('An unexpected error occurred while deleting the production team');
    }
  }
};

// 6. Get available team leads
export const getAvailableTeamLeadsApi = async (assigned?: boolean): Promise<ApiResponse<AvailableTeamLeadsResponse>> => {
  try {
    console.log('Fetching available team leads with assigned filter:', assigned);
    const queryParams = assigned !== undefined ? `?assigned=${assigned}` : '';
    const data = await apiGetJson<any>(`/production/teams/available-leads${queryParams}`);
    console.log('Available team leads fetched successfully:', data);
    console.log('Raw leads data:', data?.data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      const leads = data.data || [];
      console.log('Filtered leads count:', leads.length);
      console.log('Leads details:', leads.map((lead: any) => ({
        id: lead.id,
        name: `${lead.firstName} ${lead.lastName}`,
        isAssigned: lead.isAssigned,
        currentTeam: lead.currentTeam
      })));
      
      return {
        success: data.success,
        message: data.message || 'Available team leads fetched successfully',
        data: { leads: leads }
      };
    }
    
    throw new Error('Invalid response format from available team leads API');
  } catch (error: any) {
    console.error('Error fetching available team leads:', error);
    
    // Handle different types of errors
    if (error?.response?.status === 403) {
      throw new Error('Access denied: You do not have permission to view available team leads.');
    } else if (error?.response?.status === 401) {
      throw new Error('Authentication required: Please login again.');
    } else if (error?.message) {
      throw new Error(error.message);
    } else {
      throw new Error('An unexpected error occurred while fetching available team leads');
    }
  }
};

// 7. Get available employees
export const getAvailableEmployeesApi = async (assigned?: boolean): Promise<ApiResponse<AvailableEmployeesResponse>> => {
  try {
    console.log('Fetching available employees with assigned filter:', assigned);
    const queryParams = assigned !== undefined ? `?assigned=${assigned}` : '';
    const data = await apiGetJson<any>(`/production/teams/available-employees${queryParams}`);
    console.log('Available employees fetched successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Available employees fetched successfully',
        data: { employees: data.data || [] }
      };
    }
    
    throw new Error('Invalid response format from available employees API');
  } catch (error: any) {
    console.error('Error fetching available employees:', error);
    
    // Handle different types of errors
    if (error?.response?.status === 403) {
      throw new Error('Access denied: You do not have permission to view available employees.');
    } else if (error?.response?.status === 401) {
      throw new Error('Authentication required: Please login again.');
    } else if (error?.message) {
      throw new Error(error.message);
    } else {
      throw new Error('An unexpected error occurred while fetching available employees');
    }
  }
};

// 8. Add members to team
export const addTeamMembersApi = async (teamId: number, membersData: AddMembersRequest): Promise<ApiResponse<any>> => {
  try {
    console.log(`Adding members to team ${teamId}:`, membersData);
    const data = await apiPostJson<any>(`/production/teams/${teamId}/members`, membersData);
    console.log('Members added to team successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Members added to team successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from add members to team API');
  } catch (error) {
    console.error('Error adding members to team:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while adding members to team');
  }
};

// 9. Remove member from team
export const removeTeamMemberApi = async (teamId: number, employeeId: number): Promise<ApiResponse<any>> => {
  try {
    console.log(`Removing employee ${employeeId} from team ${teamId}`);
    const data = await apiDeleteJson<any>(`/production/teams/${teamId}/members/${employeeId}`);
    console.log('Member removed from team successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Member removed from team successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from remove member from team API');
  } catch (error) {
    console.error('Error removing member from team:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while removing member from team');
  }
};
