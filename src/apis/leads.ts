// API Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

import type { CreateLeadRequest, CreateLeadResponse, UpdateLeadRequest, Lead, ApiResponse } from '../types';

export interface ApiError {
  message: string;
  status?: number;
}

// Create a new lead
export const createLeadApi = async (leadData: CreateLeadRequest): Promise<CreateLeadResponse> => {
  try {
    const token = localStorage.getItem('crm_token');
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
  } = {}
): Promise<ApiResponse<Lead[]>> => {
  try {
    const token = localStorage.getItem('crm_token');
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
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
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
    const token = localStorage.getItem('crm_token');
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
export const updateLeadApi = async (leadId: string, leadData: UpdateLeadRequest): Promise<ApiResponse<Lead>> => {
  try {
    const token = localStorage.getItem('crm_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Sending update request to:', `${API_BASE_URL}/leads/${leadId}`);
    console.log('Update payload:', leadData);
    
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update lead');
    }

    const data: ApiResponse<Lead> = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating the lead');
  }
};

// Delete a lead
export const deleteLeadApi = async (leadId: string): Promise<ApiResponse<void>> => {
  try {
    const token = localStorage.getItem('crm_token');
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
    const token = localStorage.getItem('crm_token');
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
    const token = localStorage.getItem('crm_token');
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

// Statistics
export const getLeadsStatisticsApi = async (): Promise<ApiResponse<{
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  conversionRate: number;
  thisMonth: {
    new: number;
    inProgress: number;
    completed: number;
    failed: number;
  };
}>> => {
  try {
    const token = localStorage.getItem('crm_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/leads/statistics/overview`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch statistics');
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
      message: 'Statistics fetched successfully'
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching statistics');
  }
};

// Get employees for assignment
export const getEmployeesApi = async (): Promise<ApiResponse<Array<{ id: string; name: string }>>> => {
  try {
    const token = localStorage.getItem('crm_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch employees');
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
      message: 'Employees fetched successfully'
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching employees');
  }
};

