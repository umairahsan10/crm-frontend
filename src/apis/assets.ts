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

    // Build query parameters (backend doesn't use pagination params)
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
    if (filters.toDate) queryParams.append('toDate', filters.toDate);
    if (filters.createdBy) queryParams.append('createdBy', filters.createdBy);
    if (filters.minPurchaseValue) queryParams.append('minPurchaseValue', filters.minPurchaseValue);
    if (filters.maxPurchaseValue) queryParams.append('maxPurchaseValue', filters.maxPurchaseValue);
    if (filters.minCurrentValue) queryParams.append('minCurrentValue', filters.minCurrentValue);
    if (filters.maxCurrentValue) queryParams.append('maxCurrentValue', filters.maxCurrentValue);

    const url = queryParams.toString() 
      ? `${API_BASE_URL}/accountant/assets?${queryParams.toString()}`
      : `${API_BASE_URL}/accountant/assets`;

    console.log('📤 Fetching assets:', {
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
      console.error('❌ Assets API HTTP Error:', response.status, errorData);
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch assets`);
    }

    const data: AssetsResponse = await response.json();
    console.log('✅ Assets API Response:', data);
    
    // Backend returns { status, message, data: [], total }
    if (data.status === 'error') {
      console.error('❌ Backend Error:', data);
      throw new Error(data.message || 'Backend error: Failed to fetch assets');
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
    console.error('Assets API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching assets');
  }
};

// Get asset by ID
export const getAssetByIdApi = async (assetId: string | number): Promise<ApiResponse<Asset>> => {
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
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to fetch asset');
    }
    
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

// Create asset
export const createAssetApi = async (assetData: {
  title: string;
  category: string;
  purchaseDate?: string;
  purchaseValue: number;
  currentValue: number;
  vendorId: number;
}): Promise<ApiResponse<Asset>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Creating asset with data:', assetData);

    const response = await fetch(`${API_BASE_URL}/accountant/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(assetData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create asset');
    }

    const data = await response.json();
    console.log('Create asset response:', data);
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to create asset');
    }
    
    return {
      success: true,
      data: data.data.asset,
      message: data.message || 'Asset created successfully'
    };
  } catch (error) {
    console.error('Create asset error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while creating asset');
  }
};

// Update asset
export const updateAssetApi = async (
  assetId: number,
  updates: {
    title?: string;
    category?: string;
    purchaseDate?: string;
    purchaseValue?: number;
    currentValue?: number;
    vendorId?: number;
  }
): Promise<ApiResponse<Asset>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Updating asset:', assetId, 'with data:', updates);

    // Backend expects PATCH to /accountant/assets with asset_id in body
    const response = await fetch(`${API_BASE_URL}/accountant/assets`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        asset_id: assetId,
        ...updates
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update asset');
    }

    const data = await response.json();
    console.log('Update asset response:', data);
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to update asset');
    }
    
    return {
      success: true,
      data: data.data.asset,
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

// Delete asset (if needed in future)
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
