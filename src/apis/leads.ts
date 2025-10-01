// API Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

import type { CreateLeadRequest, CreateLeadResponse, Lead, ApiResponse } from '../types';
import { getAuthData } from '../utils/cookieUtils';

export interface ApiError {
  message: string;
  status?: number;
}

// Create a new lead
export const createLeadApi = async (leadData: CreateLeadRequest): Promise<CreateLeadResponse> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Making API call to:', `${API_BASE_URL}/leads`);
    console.log('API Base URL:', API_BASE_URL);
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.substring(0, 20)}...`
    });
    console.log('Request body:', leadData);
    
    // Test if the API endpoint is reachable
    try {
      const testResponse = await fetch(`${API_BASE_URL}/leads`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('API endpoint test (OPTIONS):', testResponse.status);
    } catch (testError) {
      console.warn('API endpoint test failed:', testError);
    }

    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(leadData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = 'Failed to create lead';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      } catch (parseError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Raw API Response data:', data);
    
    // Handle different response formats
    let formattedResponse: CreateLeadResponse;
    
    // If the response is already in the expected format
    if (typeof data === 'object' && 'success' in data) {
      formattedResponse = data as CreateLeadResponse;
    } 
    // If the response is just the lead data directly
    else if (data && typeof data === 'object' && 'id' in data) {
      formattedResponse = {
        success: true,
        data: data as Lead,
        message: 'Lead created successfully'
      };
    }
    // If the response is an array or other format
    else {
      formattedResponse = {
        success: true,
        data: data as any,
        message: 'Lead created successfully'
      };
    }
    
    console.log('Formatted API Response:', formattedResponse);
    return formattedResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while creating the lead');
  }
};

// Get all leads with pagination and filters
export const getLeadsApi = async (
  page: number = 1, 
  limit: number = 10, 
  filters: {
    search?: string;
    status?: string;
    type?: string;
    salesUnitId?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    outcome?: string;
    userId?: string; // Add userId filter
  } = {}
): Promise<ApiResponse<Lead[]>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type }),
      ...(filters.salesUnitId && { salesUnitId: filters.salesUnitId }),
      ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      ...(filters.outcome && { outcome: filters.outcome }),
      ...(filters.userId && { userId: filters.userId })
    });

    const response = await fetch(`${API_BASE_URL}/leads?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch leads');
    }

    const data = await response.json();
    console.log('Raw GET leads response:', data);
    
    // Handle different response formats
    let formattedResponse: ApiResponse<Lead[]>;
    
    // If the response is already in the expected format
    if (typeof data === 'object' && 'success' in data) {
      formattedResponse = data as ApiResponse<Lead[]>;
    } 
    // If the response has leads array (your backend format)
    else if (data && typeof data === 'object' && 'leads' in data && Array.isArray(data.leads)) {
      formattedResponse = {
        success: true,
        data: data.leads as Lead[],
        message: 'Leads fetched successfully',
        // Include pagination metadata
        pagination: (data as any).pagination
      };
    }
    // If the response is an array directly
    else if (Array.isArray(data)) {
      formattedResponse = {
        success: true,
        data: data as Lead[],
        message: 'Leads fetched successfully'
      };
    }
    // Fallback for other formats
    else {
      formattedResponse = {
        success: true,
        data: data as any,
        message: 'Leads fetched successfully'
      };
    }
    
    console.log('Formatted GET leads response:', formattedResponse);
    return formattedResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching leads');
  }
};

// Get a specific lead by ID
export const getLeadByIdApi = async (leadId: string): Promise<ApiResponse<Lead>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch lead');
    }

    const data: ApiResponse<Lead> = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching the lead');
  }
};

// Update a lead
export const updateLeadApi = async (leadId: string, updates: Partial<Lead>): Promise<ApiResponse<Lead>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Updating lead:', leadId, 'with data:', updates);

    const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    console.log('Update response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to update lead';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error('Update lead API error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Update lead response:', data);
    
    // Handle different response formats from your backend
    let updatedLead;
    if (data.lead) {
      // If response has a 'lead' property
      updatedLead = data.lead;
    } else if (data.data) {
      // If response has a 'data' property
      updatedLead = data.data;
    } else if (data.id) {
      // If response is the lead object directly
      updatedLead = data;
    } else {
      // Fallback - use the original lead data
      updatedLead = updates;
    }
    
    return {
      success: true,
      data: updatedLead,
      message: data.message || 'Lead updated successfully'
    };
  } catch (error) {
    console.error('Update lead error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating the lead');
  }
};


// Delete a lead
export const deleteLeadApi = async (leadId: string): Promise<ApiResponse<void>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete lead');
    }

    const data: ApiResponse<void> = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while deleting the lead');
  }
};

// Bulk operations
export const bulkUpdateLeadsApi = async (leadIds: string[], updates: Partial<Lead>): Promise<ApiResponse<void>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/leads/bulk-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ leadIds, updates }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update leads');
    }

    const data: ApiResponse<void> = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating leads');
  }
};

export const bulkDeleteLeadsApi = async (leadIds: string[]): Promise<ApiResponse<void>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/leads/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ leadIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete leads');
    }

    const data: ApiResponse<void> = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while deleting leads');
  }
};

// Statistics - Overview API
export const getLeadsStatisticsApi = async (): Promise<ApiResponse<{
  totalLeads: number;
  activeLeads: number;
  completedLeads: number;
  failedLeads: number;
  conversionRate: string;
  completionRate: string;
  byStatus: {
    new: number;
    inProgress: number;
    completed: number;
    failed: number;
  };
  byType: {
    warm: number;
    cold: number;
    push: number;
    upsell: number;
  };
  today: {
    new: number;
    completed: number;
    inProgress: number;
  };
}>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Fetching leads statistics from:', `${API_BASE_URL}/leads/statistics/overview`);

    const response = await fetch(`${API_BASE_URL}/leads/statistics/overview`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Statistics API response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch statistics';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error('Statistics API error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Statistics API raw data:', data);
    
    return {
      success: true,
      data: data,
      message: 'Statistics fetched successfully'
    };
  } catch (error) {
    console.error('Statistics API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching statistics');
  }
};

// Note: getEmployeesApi removed - use getFilterEmployeesApi instead

// Get sales units for filter dropdown
export const getSalesUnitsApi = async (): Promise<ApiResponse<Array<{ id: number; name: string }>>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = `${API_BASE_URL}/leads/filter-options/sales-units`;
    console.log('Fetching sales units from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Sales units response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Failed to fetch sales units';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error('Sales units API error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Sales units raw data:', data);
    
    // Ensure data is an array
    const salesUnitsData = Array.isArray(data) ? data : (data.data || data.salesUnits || []);
    console.log('Processed sales units data:', salesUnitsData);
    
    return {
      success: true,
      data: salesUnitsData,
      message: 'Sales units fetched successfully'
    };
  } catch (error) {
    console.error('Sales units API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching sales units');
  }
};

// Get user's assigned leads
export const getMyLeadsApi = async (
  page: number = 1, 
  limit: number = 20, 
  filters: {
    status?: string;
    type?: string;
    outcome?: string;
    salesUnitId?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<ApiResponse<Lead[]>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type }),
      ...(filters.outcome && { outcome: filters.outcome }),
      ...(filters.salesUnitId && { salesUnitId: filters.salesUnitId.toString() }),
      ...(filters.search && { search: filters.search }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    });

    const response = await fetch(`${API_BASE_URL}/leads/my-leads?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch my leads');
    }

    const data = await response.json();
    console.log('Raw GET my-leads response:', data);
    
    // Handle the response format from your backend
    let formattedResponse: ApiResponse<Lead[]>;
    
    if (data && typeof data === 'object' && 'leads' in data && Array.isArray(data.leads)) {
      formattedResponse = {
        success: true,
        data: data.leads as Lead[],
        message: 'My leads fetched successfully',
        pagination: {
          page: data.page || page,
          limit: data.limit || limit,
          total: data.total || 0,
          totalPages: data.totalPages || 1,
          hasNext: (data.page || page) < (data.totalPages || 1),
          hasPrev: (data.page || page) > 1
        }
      };
    } else {
      formattedResponse = {
        success: true,
        data: data as any,
        message: 'My leads fetched successfully'
      };
    }
    
    console.log('Formatted GET my-leads response:', formattedResponse);
    return formattedResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching my leads');
  }
};

// Request new leads
export const requestLeadApi = async (keptLeadIds: number[], includePushLeads: boolean = false): Promise<ApiResponse<{
  assignedLeads: Lead[];
  keptLeads: Lead[];
  totalActiveLeads: number;
  circulatedLeads: number;
  leadBreakdown: {
    warmColdLeads: number;
    pushLeads: number;
    totalAssigned: number;
  };
  includePushLeads: boolean;
}>> => {
  console.log('🚀 requestLeadApi called with:', {
    keptLeadIds,
    includePushLeads,
    apiUrl: `${API_BASE_URL}/leads/request`
  });
  
  try {
    const { token } = getAuthData();
    if (!token) {
      console.log('❌ No authentication token found');
      throw new Error('No authentication token found');
    }

    console.log('🔐 Token found, making API request...');
    const requestBody = {
      keptLeadIds,
      includePushLeads
    };
    
    console.log('📤 Request body:', requestBody);
    console.log('📡 Making POST request to:', `${API_BASE_URL}/leads/request`);

    const response = await fetch(`${API_BASE_URL}/leads/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ API Error:', errorData);
      throw new Error(errorData.message || 'Failed to request leads');
    }

    const data = await response.json();
    console.log('✅ API Success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Leads requested successfully'
    };
  } catch (error) {
    console.error('💥 requestLeadApi error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while requesting leads');
  }
};

// Get employees for filter dropdown (all employees or filtered by sales unit)
export const getFilterEmployeesApi = async (salesUnitId?: number): Promise<ApiResponse<Array<{ 
  id?: string | number; 
  employeeId?: string | number;
  userId?: string | number;
  _id?: string | number;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  [key: string]: any;
}>>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (salesUnitId) {
      queryParams.append('salesUnitId', salesUnitId.toString());
    }

    const url = salesUnitId 
      ? `${API_BASE_URL}/leads/filter-options/employees?${queryParams.toString()}`
      : `${API_BASE_URL}/leads/filter-options/employees`;

    console.log('Fetching employees from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Employees response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch employees';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error('Employees API error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Employees raw data:', data);
    
    // Ensure data is an array and handle different response formats
    let employeesData = [];
    if (Array.isArray(data)) {
      employeesData = data;
    } else if (data && typeof data === 'object') {
      employeesData = data.data || data.employees || data.users || data.results || [];
    }
    
    console.log('Employees processed:', employeesData.length, 'items');
    
    return {
      success: true,
      data: employeesData,
      message: 'Employees fetched successfully'
    };
  } catch (error) {
    console.error('Employees API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching employees');
  }
};

// Crack Lead API - Convert interested lead to cracked status
export interface CrackLeadRequest {
  status: 'cracked';
  comment: string;
  totalAmount: number;
  industryId: number;
  description: string;
  totalPhases: number;
  currentPhase: number;
}

export const crackLeadApi = async (leadId: string, crackData: CrackLeadRequest): Promise<ApiResponse<Lead>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Cracking lead:', leadId, 'with data:', crackData);

    const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(crackData),
    });

    console.log('Crack lead response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to crack lead';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error('Crack lead API error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Crack lead response:', data);
    
    return {
      success: true,
      data: data,
      message: data.message || 'Lead cracked successfully'
    };
  } catch (error) {
    console.error('Crack lead error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while cracking the lead');
  }
};

// Push Lead API - Push lead for senior sales rep attention
export interface PushLeadRequest {
  action: 'push';
  comment: string;
}

export const pushLeadApi = async (leadId: string, pushData: PushLeadRequest): Promise<ApiResponse<Lead>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Pushing lead:', leadId, 'with data:', pushData);

    const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(pushData),
    });

    console.log('Push lead response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to push lead';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error('Push lead API error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Push lead response:', data);
    
    return {
      success: true,
      data: data,
      message: data.message || 'Lead pushed successfully'
    };
  } catch (error) {
    console.error('Push lead error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while pushing the lead');
  }
};

// Get cracked leads
export const getCrackedLeadsApi = async (
  page: number = 1, 
  limit: number = 20, 
  filters: {
    search?: string;
    industryId?: string;
    minAmount?: string;
    maxAmount?: string;
    closedBy?: string;
    currentPhase?: string;
    totalPhases?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<ApiResponse<any[]>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.search && { search: filters.search }),
      ...(filters.industryId && { industryId: filters.industryId }),
      ...(filters.minAmount && { minAmount: filters.minAmount }),
      ...(filters.maxAmount && { maxAmount: filters.maxAmount }),
      ...(filters.closedBy && { closedBy: filters.closedBy }),
      ...(filters.currentPhase && { currentPhase: filters.currentPhase }),
      ...(filters.totalPhases && { totalPhases: filters.totalPhases }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    });

    console.log('Fetching cracked leads with filters:', filters);

    const response = await fetch(`${API_BASE_URL}/leads/cracked?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch cracked leads');
    }

    const data = await response.json();
    console.log('Cracked leads response:', data);
    
    return {
      success: true,
      data: data.crackedLeads || data.data || data,
      message: 'Cracked leads fetched successfully',
      pagination: data.pagination
    };
  } catch (error) {
    console.error('Cracked leads API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching cracked leads');
  }
};

// Get archived leads
export const getArchivedLeadsApi = async (
  page: number = 1, 
  limit: number = 20, 
  filters: {
    search?: string;
    unitId?: string;  // Changed from salesUnitId to unitId for archived leads
    assignedTo?: string;
    source?: string;
    outcome?: string;
    qualityRating?: string;
    archivedFrom?: string;
    archivedTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<ApiResponse<any[]>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.search && { search: filters.search }),
      ...(filters.unitId && { unitId: filters.unitId }),  // Changed to unitId
      ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
      ...(filters.source && { source: filters.source }),
      ...(filters.outcome && { outcome: filters.outcome }),
      ...(filters.qualityRating && { qualityRating: filters.qualityRating }),
      ...(filters.archivedFrom && { archivedFrom: filters.archivedFrom }),
      ...(filters.archivedTo && { archivedTo: filters.archivedTo }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    });

    console.log('Fetching archived leads with filters:', filters);

    const response = await fetch(`${API_BASE_URL}/leads/archived?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch archived leads');
    }

    const data = await response.json();
    console.log('Archived leads response:', data);
    
    return {
      success: true,
      data: data.archivedLeads || data.data || data,
      message: 'Archived leads fetched successfully',
      pagination: data.pagination
    };
  } catch (error) {
    console.error('Archived leads API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching archived leads');
  }
};
