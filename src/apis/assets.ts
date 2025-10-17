import type { Asset, AssetsResponse, AssetResponse, ApiResponse } from '../types';
import { 
  apiGetJson, 
  apiPostJson, 
  apiPatchJson, 
  apiDeleteJson
} from '../utils/apiClient';

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
    // Build query parameters (backend doesn't use pagination params)
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
    if (filters.toDate) queryParams.append('toDate', filters.toDate);
    if (filters.createdBy) queryParams.append('createdBy', filters.createdBy);
    if (filters.minPurchaseValue) queryParams.append('minPurchaseValue', filters.minPurchaseValue);
    if (filters.maxPurchaseValue) queryParams.append('maxPurchaseValue', filters.maxPurchaseValue);
    if (filters.minCurrentValue) queryParams.append('minCurrentValue', filters.minCurrentValue);
    if (filters.maxCurrentValue) queryParams.append('maxCurrentValue', filters.maxCurrentValue);

    const url = queryParams.toString() 
      ? `/accountant/assets?${queryParams.toString()}`
      : `/accountant/assets`;

    console.log('📤 Fetching assets:', {
      url,
      filters,
      queryParams: queryParams.toString()
    });

    const data: AssetsResponse = await apiGetJson<AssetsResponse>(url);
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
    console.log('Fetching asset by ID:', assetId);

    const data: AssetResponse = await apiGetJson<AssetResponse>(`/accountant/assets/${assetId}`);
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
    console.log('Creating asset with data:', assetData);

    const data = await apiPostJson<any>('/accountant/assets', assetData);
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
    console.log('Updating asset:', assetId, 'with data:', updates);

    // Backend expects PATCH to /accountant/assets with asset_id in body
    const data = await apiPatchJson<any>('/accountant/assets', {
      asset_id: assetId,
      ...updates
    });
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
    const data: ApiResponse<void> = await apiDeleteJson<ApiResponse<void>>(`/accountant/assets/${assetId}`);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while deleting asset');
  }
};

// Statistics API
export const getAssetsStatisticsApi = async (): Promise<ApiResponse<{
  totalAssets: number;
  totalValue: number;
  totalPurchaseValue: number;
  totalDepreciation: number;
  byCategory: { [key: string]: number };
  recentAssets: Asset[];
}>> => {
  try {
    console.log('📊 Fetching assets statistics...');
    
    const data = await apiGetJson<any>('/accountant/assets/statistics');
    console.log('✅ Assets statistics received:', data);
    
    return {
      success: true,
      data: data.data || data,
      message: 'Assets statistics fetched successfully'
    };
  } catch (error) {
    console.error('❌ Assets statistics API error:', error);
    throw new Error('Failed to fetch assets statistics');
  }
};