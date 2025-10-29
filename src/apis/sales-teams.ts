import { apiGetJson, apiPostJson, apiPatchJson, apiDeleteJson } from '../utils/apiClient';
import type {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddMembersRequest,
  TeamDetailsResponse,
  AvailableTeamLeadsResponse,
  AvailableEmployeesResponse,
  ApiResponse
} from '../types/sales/teams';

// 1. Get all sales teams with comprehensive filtering
export const getSalesTeamsApi = async (
  page: number = 1, 
  limit: number = 20, 
  filters: {
    teamId?: number;
    salesUnitId?: number;
    hasLead?: string;
    hasMembers?: string;
    hasLeads?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    leadEmail?: string;
    leadName?: string;
    teamName?: string;
    unitName?: string;
    minMembers?: number;
    maxMembers?: number;
    minCompletedLeads?: number;
    maxCompletedLeads?: number;
    minLeads?: number;
    maxLeads?: number;
    assigned?: boolean;
    include?: string;
    search?: string;
  } = {}
): Promise<ApiResponse<Team[]>> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.teamId && { teamId: filters.teamId.toString() }),
      ...(filters.salesUnitId && { salesUnitId: filters.salesUnitId.toString() }),
      ...(filters.hasLead && { hasLead: filters.hasLead }),
      ...(filters.hasMembers && { hasMembers: filters.hasMembers }),
      ...(filters.hasLeads && { hasLeads: filters.hasLeads }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      ...(filters.leadEmail && { leadEmail: filters.leadEmail }),
      ...(filters.leadName && { leadName: filters.leadName }),
      ...(filters.teamName && { teamName: filters.teamName }),
      ...(filters.unitName && { unitName: filters.unitName }),
      ...(filters.minMembers && { minMembers: filters.minMembers.toString() }),
      ...(filters.maxMembers && { maxMembers: filters.maxMembers.toString() }),
      ...(filters.minCompletedLeads && { minCompletedLeads: filters.minCompletedLeads.toString() }),
      ...(filters.maxCompletedLeads && { maxCompletedLeads: filters.maxCompletedLeads.toString() }),
      ...(filters.minLeads && { minLeads: filters.minLeads.toString() }),
      ...(filters.maxLeads && { maxLeads: filters.maxLeads.toString() }),
      ...(filters.assigned !== undefined && { assigned: filters.assigned.toString() }),
      ...(filters.include && { include: filters.include }),
      ...(filters.search && { search: filters.search })
    });

    const data = await apiGetJson<any>(`/sales/teams?${queryParams.toString()}`);
    console.log('Raw GET sales teams response:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Sales teams fetched successfully',
        data: data.data,
        pagination: data.pagination
      };
    }
    
    throw new Error('Invalid response format from sales teams API');
  } catch (error) {
    console.error('Error fetching sales teams:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching sales teams');
  }
};

// 2. Get specific sales team with all related data
export const getSalesTeamByIdApi = async (teamId: string): Promise<ApiResponse<TeamDetailsResponse>> => {
  try {
    console.log(`Fetching sales team with ID: ${teamId}`);
    const data = await apiGetJson<any>(`/sales/teams/${teamId}`);
    console.log('Sales team fetched successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Sales team fetched successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from sales team API');
  } catch (error) {
    console.error('Error fetching sales team:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching the sales team');
  }
};

// 3. Create sales team
export const createSalesTeamApi = async (teamData: CreateTeamRequest): Promise<ApiResponse<Team>> => {
  try {
    console.log('Creating sales team:', teamData);
    const data = await apiPostJson<any>('/sales/teams', teamData);
    console.log('Sales team created successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Sales team created successfully',
        data: data.data || teamData as any
      };
    }
    
    throw new Error('Invalid response format from create sales team API');
  } catch (error) {
    console.error('Error creating sales team:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while creating the sales team');
  }
};

// 4. Update sales team
export const updateSalesTeamApi = async (id: number, teamData: UpdateTeamRequest): Promise<ApiResponse<Team>> => {
  try {
    console.log(`Updating sales team ${id}:`, teamData);
    const data = await apiPatchJson<any>(`/sales/teams/${id}`, teamData);
    console.log('Sales team updated successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Sales team updated successfully',
        data: data.data || teamData as any
      };
    }
    
    throw new Error('Invalid response format from update sales team API');
  } catch (error) {
    console.error('Error updating sales team:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating the sales team');
  }
};

// 5. Delete sales team
export const deleteSalesTeamApi = async (id: number): Promise<ApiResponse<null>> => {
  try {
    console.log(`Deleting sales team ${id}`);
    const data = await apiDeleteJson<any>(`/sales/teams/${id}`);
    console.log('Sales team deleted successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Sales team deleted successfully',
        data: null
      };
    }
    
    throw new Error('Invalid response format from delete sales team API');
  } catch (error: any) {
    console.error('Error deleting sales team:', error);
    
    // Handle different types of errors
    if (error?.response?.status === 409) {
      throw new Error('Cannot delete team: Team has members or team lead assigned. Please remove all members and team lead first.');
    } else if (error?.response?.status === 403) {
      throw new Error('Access denied: You do not have permission to delete this team.');
    } else if (error?.response?.status === 404) {
      throw new Error('Team not found: The team you are trying to delete does not exist.');
    } else if (error?.response?.status === 401) {
      throw new Error('Authentication required: Please login again.');
    } else if (error?.message) {
      throw new Error(error.message);
    } else {
      throw new Error('An unexpected error occurred while deleting the sales team');
    }
  }
};

// 6. Get available team leads
export const getAvailableTeamLeadsApi = async (assigned?: boolean): Promise<ApiResponse<AvailableTeamLeadsResponse>> => {
  try {
    console.log('Fetching available team leads with assigned filter:', assigned);
    const queryParams = assigned !== undefined ? `?assigned=${assigned}` : '';
    const data = await apiGetJson<any>(`/sales/teams/available-leads${queryParams}`);
    console.log('Available team leads fetched successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data && 'data' in data) {
      return {
        success: data.success,
        message: data.message || 'Available team leads fetched successfully',
        data: { leads: data.data || [] }
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
    
    // Try the sales teams specific endpoint first
    try {
      const queryParams = assigned !== undefined ? `?assigned=${assigned}` : '';
      const data = await apiGetJson<any>(`/sales/teams/available-employees${queryParams}`);
      console.log('Sales teams available employees fetched successfully:', data);
      
      // Handle API response format
      if (typeof data === 'object' && 'success' in data && 'data' in data) {
        return {
          success: data.success,
          message: data.message || 'Available employees fetched successfully',
          data: { employees: data.data || [] }
        };
      }
    } catch (salesError) {
      console.log('Sales teams endpoint failed, trying fallback:', salesError);
      
      // Fallback to general employees API
      try {
        const data = await apiGetJson<any>('/employee/all-employees');
        console.log('General employees API response:', data);
        
        // Transform the employee data to match expected format
        const employeesData = data.data || [];
        const transformedEmployees = employeesData.map((emp: any) => ({
          id: emp.id,
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          email: emp.email || '',
          role: emp.role || { name: emp.role?.name || 'Employee' },
          department: emp.department || { name: emp.department?.name || 'Unknown' },
          isAssigned: false // We don't have this info from general API, assume available
        }));
        
        return {
          success: true,
          message: 'Available employees fetched successfully (fallback)',
          data: { employees: transformedEmployees }
        };
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
        throw fallbackError;
      }
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

// 8. Add members to team (bulk operation)
export const addTeamMembersApi = async (teamId: number, membersData: AddMembersRequest): Promise<ApiResponse<any>> => {
  try {
    console.log(`Adding members to team ${teamId}:`, membersData);
    const data = await apiPostJson<any>(`/sales/teams/${teamId}/members`, membersData);
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

// 9. Add single employee to team
export const addEmployeeToTeamApi = async (teamId: number, employeeId: number): Promise<ApiResponse<any>> => {
  try {
    console.log(`Adding employee ${employeeId} to team ${teamId}`);
    const data = await apiPostJson<any>(`/sales/teams/${teamId}/add-employee`, { employeeId });
    console.log('Employee added to team successfully:', data);
    
    // Handle API response format
    if (typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        message: data.message || 'Employee added to team successfully',
        data: data.data
      };
    }
    
    throw new Error('Invalid response format from add employee to team API');
  } catch (error) {
    console.error('Error adding employee to team:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while adding employee to team');
  }
};

// 10. Remove member from team
export const removeTeamMemberApi = async (teamId: number, employeeId: number): Promise<ApiResponse<any>> => {
  try {
    console.log(`Removing employee ${employeeId} from team ${teamId}`);
    const data = await apiDeleteJson<any>(`/sales/teams/${teamId}/members/${employeeId}`);
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
