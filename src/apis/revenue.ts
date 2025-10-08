// API Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

import type { Revenue, RevenuesResponse, RevenueResponse, ApiResponse } from '../types';
import { getAuthData } from '../utils/cookieUtils';

export interface ApiError {
  message: string;
  status?: number;
}

// Get all revenues with filters
export const getRevenuesApi = async (
  page: number = 1,
  limit: number = 20,
  filters: {
    category?: string;
    fromDate?: string;
    toDate?: string;
    createdBy?: string;
    minAmount?: string;
    maxAmount?: string;
    paymentMethod?: string;
    source?: string;
    receivedFrom?: string;
    relatedInvoiceId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<ApiResponse<Revenue[]>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.category && { category: filters.category }),
      ...(filters.fromDate && { fromDate: filters.fromDate }),
      ...(filters.toDate && { toDate: filters.toDate }),
      ...(filters.createdBy && { createdBy: filters.createdBy }),
      ...(filters.minAmount && { minAmount: filters.minAmount }),
      ...(filters.maxAmount && { maxAmount: filters.maxAmount }),
      ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
      ...(filters.source && { source: filters.source }),
      ...(filters.receivedFrom && { receivedFrom: filters.receivedFrom }),
      ...(filters.relatedInvoiceId && { relatedInvoiceId: filters.relatedInvoiceId }),
      ...(filters.search && { search: filters.search }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    });

    console.log('Fetching revenues with filters:', filters);

    const response = await fetch(`${API_BASE_URL}/accountant/revenue?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch revenues');
    }

    const data: RevenuesResponse = await response.json();
    console.log('Revenues response:', data);
    
    return {
      success: true,
      data: data.data,
      message: data.message,
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: Math.ceil(data.total / data.limit),
        hasNext: data.page * data.limit < data.total,
        hasPrev: data.page > 1
      }
    };
  } catch (error) {
    console.error('Revenues API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching revenues');
  }
};

// Get revenue by ID
export const getRevenueByIdApi = async (revenueId: string): Promise<ApiResponse<Revenue>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Fetching revenue by ID:', revenueId);

    const response = await fetch(`${API_BASE_URL}/accountant/revenue/${revenueId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch revenue');
    }

    const data: RevenueResponse = await response.json();
    console.log('Revenue detail response:', data);
    
    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    console.error('Revenue detail API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching revenue');
  }
};

// Update revenue
export const updateRevenueApi = async (revenueId: string, updates: Partial<Revenue>): Promise<ApiResponse<Revenue>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Updating revenue:', revenueId, 'with data:', updates);

    const response = await fetch(`${API_BASE_URL}/accountant/revenue/${revenueId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update revenue');
    }

    const data = await response.json();
    console.log('Update revenue response:', data);
    
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Revenue updated successfully'
    };
  } catch (error) {
    console.error('Update revenue error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating revenue');
  }
};

// Delete revenue
export const deleteRevenueApi = async (revenueId: string): Promise<ApiResponse<void>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accountant/revenue/${revenueId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete revenue');
    }

    const data: ApiResponse<void> = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while deleting revenue');
  }
};

