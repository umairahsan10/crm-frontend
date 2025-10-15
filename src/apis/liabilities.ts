// API Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

import type { Liability, LiabilitiesResponse, LiabilityResponse, ApiResponse } from '../types';
import { getAuthData } from '../utils/cookieUtils';

export interface ApiError {
  message: string;
  status?: number;
}

// Get all liabilities with filters (backend doesn't use pagination params in query)
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

    // Build query parameters (backend doesn't use page/limit)
    const queryParams = new URLSearchParams();
    if (filters.isPaid) queryParams.append('isPaid', filters.isPaid);
    if (filters.relatedVendorId) queryParams.append('relatedVendorId', filters.relatedVendorId);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
    if (filters.toDate) queryParams.append('toDate', filters.toDate);
    if (filters.createdBy) queryParams.append('createdBy', filters.createdBy);

    const url = queryParams.toString() 
      ? `${API_BASE_URL}/accountant/liabilities?${queryParams.toString()}`
      : `${API_BASE_URL}/accountant/liabilities`;

    console.log('📤 Fetching liabilities:', {
      url,
      filters,
      queryParams: queryParams.toString()
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Liabilities API HTTP Error:', response.status, errorData);
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch liabilities`);
    }

    const data: LiabilitiesResponse = await response.json();
    console.log('✅ Liabilities API Response:', data);
    
    // Backend returns { status, message, data: [], total }
    if (data.status === 'error') {
      console.error('❌ Backend Error:', data);
      throw new Error(data.message || 'Backend error: Failed to fetch liabilities');
    }
    
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

// Create liability
export const createLiabilityApi = async (liabilityData: {
  name: string;
  category: string;
  amount: number;
  dueDate: string;
  relatedVendorId?: number;
}): Promise<ApiResponse<Liability>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Creating liability with data:', liabilityData);

    const response = await fetch(`${API_BASE_URL}/accountant/liabilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(liabilityData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create liability');
    }

    const data = await response.json();
    console.log('Create liability response:', data);
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to create liability');
    }
    
    return {
      success: true,
      data: data.data.liability,
      message: data.message || 'Liability created successfully'
    };
  } catch (error) {
    console.error('Create liability error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while creating liability');
  }
};

// Get liability by ID
export const getLiabilityByIdApi = async (liabilityId: string | number): Promise<ApiResponse<Liability>> => {
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
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to fetch liability');
    }
    
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

// Update liability (PATCH method with liability_id in body)
export const updateLiabilityApi = async (
  liabilityId: number,
  updates: {
    name?: string;
    category?: string;
    amount?: number;
    dueDate?: string;
    relatedVendorId?: number;
  }
): Promise<ApiResponse<Liability>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Updating liability:', liabilityId, 'with data:', updates);

    // Backend expects PATCH to /accountant/liabilities with liability_id in body
    const response = await fetch(`${API_BASE_URL}/accountant/liabilities`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        liability_id: liabilityId,
        ...updates
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update liability');
    }

    const data = await response.json();
    console.log('Update liability response:', data);
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to update liability');
    }
    
    return {
      success: true,
      data: data.data.liability,
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

// Mark liability as paid (special workflow - updates liability, transaction, and creates expense)
export const markLiabilityAsPaidApi = async (
  liabilityId: number,
  transactionId?: number
): Promise<ApiResponse<{ liability: Liability; transaction: any; expense: any }>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Marking liability as paid:', liabilityId, 'transactionId:', transactionId);

    const requestBody: any = {
      liability_id: liabilityId
    };

    if (transactionId) {
      requestBody.transactionId = transactionId;
    }

    const response = await fetch(`${API_BASE_URL}/accountant/liabilities/mark-paid`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to mark liability as paid');
    }

    const data = await response.json();
    console.log('Mark as paid response:', data);
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to mark liability as paid');
    }
    
    return {
      success: true,
      data: data.data,
      message: data.message || 'Liability marked as paid successfully'
    };
  } catch (error) {
    console.error('Mark as paid error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while marking liability as paid');
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

