// API Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

import type { Liability, LiabilitiesResponse, LiabilityResponse, ApiResponse } from '../types';
import { getAuthData } from '../utils/cookieUtils';

export interface ApiError {
  message: string;
  status?: number;
}

// Get all liabilities with filters
export const getLiabilitiesApi = async (
  page: number = 1,
  limit: number = 20,
  filters: {
    isPaid?: string;
    relatedVendorId?: string;
    category?: string;
    fromDate?: string;
    toDate?: string;
    createdBy?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<ApiResponse<Liability[]>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.isPaid && { isPaid: filters.isPaid }),
      ...(filters.relatedVendorId && { relatedVendorId: filters.relatedVendorId }),
      ...(filters.category && { category: filters.category }),
      ...(filters.fromDate && { fromDate: filters.fromDate }),
      ...(filters.toDate && { toDate: filters.toDate }),
      ...(filters.createdBy && { createdBy: filters.createdBy }),
      ...(filters.search && { search: filters.search }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    });

    console.log('Fetching liabilities with filters:', filters);

    const response = await fetch(`${API_BASE_URL}/accountant/liabilities?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch liabilities');
    }

    const data: LiabilitiesResponse = await response.json();
    console.log('Liabilities response:', data);
    
    return {
      success: true,
      data: data.data,
      message: data.message,
      pagination: {
        page: page,
        limit: limit,
        total: data.total,
        totalPages: Math.ceil(data.total / limit),
        hasNext: page * limit < data.total,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Liabilities API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching liabilities');
  }
};

// Get liability by ID
export const getLiabilityByIdApi = async (liabilityId: string): Promise<ApiResponse<Liability>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Fetching liability by ID:', liabilityId);

    const response = await fetch(`${API_BASE_URL}/accountant/liabilities/${liabilityId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch liability');
    }

    const data: LiabilityResponse = await response.json();
    console.log('Liability detail response:', data);
    
    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    console.error('Liability detail API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching liability');
  }
};

// Update liability
export const updateLiabilityApi = async (liabilityId: string, updates: Partial<Liability>): Promise<ApiResponse<Liability>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Updating liability:', liabilityId, 'with data:', updates);

    const response = await fetch(`${API_BASE_URL}/accountant/liabilities/${liabilityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update liability');
    }

    const data = await response.json();
    console.log('Update liability response:', data);
    
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Liability updated successfully'
    };
  } catch (error) {
    console.error('Update liability error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating liability');
  }
};

// Delete liability
export const deleteLiabilityApi = async (liabilityId: string): Promise<ApiResponse<void>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accountant/liabilities/${liabilityId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete liability');
    }

    const data: ApiResponse<void> = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while deleting liability');
  }
};

