/**
 * Clients API - Real backend integration
 * Following the same pattern as leads API implementation
 */

import type { Client, ClientStatistics, ApiResponse } from '../types';
import { 
  apiGetJson, 
  apiPostJson, 
  apiPatchJson,
  apiDeleteJson
} from '../utils/apiClient';

export interface GetClientsDto {
  page?: number;
  limit?: number;
  search?: string;
  clientType?: string;
  companyName?: string;
  clientName?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  industryId?: number;
  accountStatus?: string;
  createdBy?: number;
  createdAfter?: string;
  createdBefore?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ClientsResponse {
  data: Client[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClientStatisticsResponse {
  data: ClientStatistics;
}

/**
 * Get clients with pagination and filters
 */
export const getClientsApi = async (query: GetClientsDto = {}): Promise<ApiResponse<Client[]>> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: (query.page || 1).toString(),
      limit: (query.limit || 20).toString(),
      ...(query.search && { search: query.search }),
      ...(query.clientType && { clientType: query.clientType }),
      ...(query.companyName && { companyName: query.companyName }),
      ...(query.clientName && { clientName: query.clientName }),
      ...(query.email && { email: query.email }),
      ...(query.phone && { phone: query.phone }),
      ...(query.city && { city: query.city }),
      ...(query.state && { state: query.state }),
      ...(query.country && { country: query.country }),
      ...(query.industryId && { industryId: query.industryId.toString() }),
      ...(query.accountStatus && { accountStatus: query.accountStatus }),
      ...(query.createdBy && { createdBy: query.createdBy.toString() }),
      ...(query.createdAfter && { createdAfter: query.createdAfter }),
      ...(query.createdBefore && { createdBefore: query.createdBefore }),
      ...(query.sortBy && { sortBy: query.sortBy }),
      ...(query.sortOrder && { sortOrder: query.sortOrder })
    });

    console.log('Making API call to: /clients');
    console.log('Query params:', queryParams.toString());

    const data = await apiGetJson<any>(`/clients?${queryParams.toString()}`);
    console.log('Raw GET clients response:', data);
    
    // Handle different response formats
    let formattedResponse: ApiResponse<Client[]>;
    
    // If the response is already in the expected format
    if (typeof data === 'object' && 'status' in data && data.status === 'success') {
      formattedResponse = {
        success: true,
        data: data.data.clients || data.data,
        message: data.message || 'Clients fetched successfully',
        pagination: {
          page: data.data.page || query.page || 1,
          limit: data.data.limit || query.limit || 20,
          total: data.data.total || 0,
          totalPages: data.data.totalPages || 1,
          hasNext: (data.data.page || query.page || 1) < (data.data.totalPages || 1),
          hasPrev: (data.data.page || query.page || 1) > 1
        }
      };
    } 
    // If the response has clients array directly
    else if (data && typeof data === 'object' && 'clients' in data && Array.isArray(data.clients)) {
      formattedResponse = {
        success: true,
        data: data.clients as Client[],
        message: 'Clients fetched successfully',
        pagination: {
          page: data.page || query.page || 1,
          limit: data.limit || query.limit || 20,
          total: data.total || 0,
          totalPages: data.totalPages || 1,
          hasNext: (data.page || query.page || 1) < (data.totalPages || 1),
          hasPrev: (data.page || query.page || 1) > 1
        }
      };
    }
    // If the response is an array directly
    else if (Array.isArray(data)) {
      formattedResponse = {
        success: true,
        data: data as Client[],
        message: 'Clients fetched successfully'
      };
    }
    // Fallback for other formats
    else {
      formattedResponse = {
        success: true,
        data: data as any,
        message: 'Clients fetched successfully'
      };
    }
    
    console.log('Formatted GET clients response:', formattedResponse);
    return formattedResponse;
  } catch (error) {
    console.error('Get clients API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching clients');
  }
};

/**
 * Get clients statistics
 */
export const getClientsStatisticsApi = async (): Promise<ApiResponse<ClientStatistics>> => {
  try {
    console.log('Fetching clients statistics from: /clients/stats');

    const data = await apiGetJson<any>('/clients/stats');
    console.log('Statistics API raw data:', data);
    
    // Handle the API response format: { status, message, data: { total, active, inactive, suspended, prospect } }
    let statisticsData;
    
    if (data && typeof data === 'object' && 'status' in data && data.status === 'success') {
      // API response format: { status: 'success', message: '...', data: { total: 8, active: 0, ... } }
      statisticsData = data.data;
    } else if (data && typeof data === 'object' && 'data' in data) {
      // Alternative format: { data: { total: 8, active: 0, ... } }
      statisticsData = data.data;
    } else {
      // Direct format: { total: 8, active: 0, ... }
      statisticsData = data;
    }
    
    console.log('Processed statistics data:', statisticsData);

  return {
      success: true,
      data: statisticsData,
      message: data.message || 'Statistics fetched successfully'
    };
  } catch (error) {
    console.error('Statistics API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching statistics');
  }
};

/**
 * Get client by ID
 */
export const getClientByIdApi = async (clientId: string): Promise<ApiResponse<Client>> => {
  try {
    console.log('📡 Fetching client by ID:', clientId);

    const data = await apiGetJson<any>(`/clients/${clientId}`);
    console.log('✅ getClientByIdApi raw response:', data);
    
    // Handle different response formats
    let formattedResponse: ApiResponse<Client>;
    
    // If the response is already in the expected format with success property
    if (typeof data === 'object' && 'status' in data && data.status === 'success') {
      formattedResponse = {
        success: true,
        data: data.data.client || data.data,
        message: data.message || 'Client fetched successfully'
      };
    } 
    // If the response is the client object directly (most common)
    else if (data && typeof data === 'object' && 'id' in data) {
      formattedResponse = {
        success: true,
        data: data as Client,
        message: 'Client fetched successfully'
      };
    }
    // Fallback
    else {
      formattedResponse = {
        success: true,
        data: data as any,
        message: 'Client fetched successfully'
      };
    }
    
    console.log('📦 Formatted response:', formattedResponse);
    return formattedResponse;
  } catch (error) {
    console.error('💥 getClientByIdApi error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching the client');
  }
};

/**
 * Create new client
 */
export const createClientApi = async (clientData: {
  passwordHash: string;
  clientType?: string;
  companyName?: string;
  clientName?: string;
  email?: string;
  phone?: string;
  altPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  industryId?: number;
  taxId?: string;
  accountStatus?: 'active' | 'inactive' | 'suspended' | 'prospect';
  notes?: string;
}): Promise<ApiResponse<Client>> => {
  try {
    console.log('Making API call to: /clients');
    console.log('Request body:', clientData);

    const data = await apiPostJson<any>('/clients', clientData);
    console.log('Raw API Response data:', data);
    
    // Handle different response formats
    let formattedResponse: ApiResponse<Client>;
    
    // If the response is already in the expected format
    if (typeof data === 'object' && 'status' in data && data.status === 'success') {
      formattedResponse = {
        success: true,
        data: data.data.client || data.data,
        message: data.message || 'Client created successfully'
      };
    } 
    // If the response is just the client data directly
    else if (data && typeof data === 'object' && 'id' in data) {
      formattedResponse = {
        success: true,
        data: data as Client,
        message: 'Client created successfully'
      };
    }
    // Fallback for other formats
    else {
      formattedResponse = {
        success: true,
        data: data as any,
        message: 'Client created successfully'
      };
    }
    
    console.log('Formatted API Response:', formattedResponse);
    return formattedResponse;
  } catch (error) {
    console.error('Create client error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while creating the client');
  }
};

/**
 * Update existing client
 */
export const updateClientApi = async (id: string, clientData: {
  clientType?: string;
  companyName?: string;
  clientName?: string;
  email?: string;
  phone?: string;
  altPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  industryId?: number;
  taxId?: string;
  accountStatus?: 'active' | 'inactive' | 'suspended' | 'prospect';
  notes?: string;
  passwordHash?: string;
}): Promise<ApiResponse<Client>> => {
  try {
    console.log('=== UPDATE CLIENT API CALL ===');
    console.log('Client ID:', id);
    console.log('Client Data:', clientData);
    console.log('API Endpoint:', `/clients/${id}`);
    console.log('Request Method: PATCH');

    const data = await apiPatchJson<any>(`/clients/${id}`, clientData);
    console.log('Update client response:', data);
    console.log('Response status:', data.status);
    console.log('Response message:', data.message);
    
    // Handle different response formats from your backend
    let updatedClient;
    if (data.client) {
      // If response has a 'client' property
      updatedClient = data.client;
    } else if (data.data) {
      // If response has a 'data' property
      updatedClient = data.data;
    } else if (data.id) {
      // If response is the client object directly
      updatedClient = data;
    } else {
      // Fallback - use the original client data
      updatedClient = clientData;
    }
    
    return {
      success: true,
      data: updatedClient,
      message: data.message || 'Client updated successfully'
    };
  } catch (error) {
    console.error('=== UPDATE CLIENT ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error:', error);
    
    if (error instanceof Error) {
      // Check if it's an API error with status code
      if ('status' in error) {
        console.error('API Error Status:', (error as any).status);
        console.error('API Error Response:', (error as any).response);
      }
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating the client');
  }
};

/**
 * Delete client
 */
export const deleteClientApi = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const data = await apiDeleteJson<ApiResponse<void>>(`/clients/${id}`);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while deleting the client');
  }
};

/**
 * Search companies
 */
export const searchCompaniesApi = async (query: string): Promise<ApiResponse<any[]>> => {
  try {
    console.log('Searching companies with query:', query);

    const data = await apiGetJson<any>(`/clients/search/companies?q=${encodeURIComponent(query)}`);
    console.log('Search companies response:', data);
    
    return {
      success: true,
      data: data.data?.companies || data.companies || data.data || data,
      message: data.message || 'Companies found successfully'
    };
  } catch (error) {
    console.error('Search companies error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while searching companies');
  }
};

/**
 * Search contacts
 */
export const searchContactsApi = async (query: string): Promise<ApiResponse<any[]>> => {
  try {
    console.log('Searching contacts with query:', query);

    const data = await apiGetJson<any>(`/clients/search/contacts?q=${encodeURIComponent(query)}`);
    console.log('Search contacts response:', data);
    
    return {
      success: true,
      data: data.data?.contacts || data.contacts || data.data || data,
      message: data.message || 'Contacts found successfully'
    };
  } catch (error) {
    console.error('Search contacts error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while searching contacts');
  }
};

/**
 * Bulk operations
 */
export const bulkUpdateClientsApi = async (clientIds: string[], updates: Partial<Client>): Promise<ApiResponse<void>> => {
  try {
    const data = await apiPostJson<ApiResponse<void>>('/clients/bulk-update', { clientIds, updates });
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating clients');
  }
};

export const bulkDeleteClientsApi = async (clientIds: string[]): Promise<ApiResponse<void>> => {
  try {
    const data = await apiPostJson<ApiResponse<void>>('/clients/bulk-delete', { clientIds });
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while deleting clients');
  }
};

