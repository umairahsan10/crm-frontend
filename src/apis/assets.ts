// API Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

import type { Asset, AssetsResponse, AssetResponse, ApiResponse } from '../types';
import { getAuthData } from '../utils/cookieUtils';

export interface ApiError {
  message: string;
  status?: number;
}

// Get all assets with filters
export const getAssetsApi = async (
  page: number = 1,
  limit: number = 20,
  filters: {
    category?: string;
    fromDate?: string;
    toDate?: string;
    createdBy?: string;
    minPurchaseValue?: string;
    maxPurchaseValue?: string;
    minCurrentValue?: string;
    maxCurrentValue?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<ApiResponse<Asset[]>> => {
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
      ...(filters.minPurchaseValue && { minPurchaseValue: filters.minPurchaseValue }),
      ...(filters.maxPurchaseValue && { maxPurchaseValue: filters.maxPurchaseValue }),
      ...(filters.minCurrentValue && { minCurrentValue: filters.minCurrentValue }),
      ...(filters.maxCurrentValue && { maxCurrentValue: filters.maxCurrentValue }),
      ...(filters.search && { search: filters.search }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    });

    console.log('Fetching assets with filters:', filters);

    const response = await fetch(`${API_BASE_URL}/accountant/assets?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch assets');
    }

    const data: AssetsResponse = await response.json();
    console.log('Assets response:', data);
    
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
    console.error('Assets API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching assets');
  }
};

// Get asset by ID
export const getAssetByIdApi = async (assetId: string): Promise<ApiResponse<Asset>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Fetching asset by ID:', assetId);

    const response = await fetch(`${API_BASE_URL}/accountant/assets/${assetId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch asset');
    }

    const data: AssetResponse = await response.json();
    console.log('Asset detail response:', data);
    
    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    console.error('Asset detail API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching asset');
  }
};

// Update asset
export const updateAssetApi = async (assetId: string, updates: Partial<Asset>): Promise<ApiResponse<Asset>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Updating asset:', assetId, 'with data:', updates);

    const response = await fetch(`${API_BASE_URL}/accountant/assets/${assetId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update asset');
    }

    const data = await response.json();
    console.log('Update asset response:', data);
    
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Asset updated successfully'
    };
  } catch (error) {
    console.error('Update asset error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating asset');
  }
};

// Delete asset
export const deleteAssetApi = async (assetId: string): Promise<ApiResponse<void>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accountant/assets/${assetId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete asset');
    }

    const data: ApiResponse<void> = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while deleting asset');
  }
};

