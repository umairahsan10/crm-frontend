import type { Asset, ApiResponse } from '../types';
import { apiClient } from '../services/apiClient';

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
  } = {}
): Promise<ApiResponse<Asset[]>> => {
  console.log('📤 [ASSET API] Fetching assets - Page:', page, 'Limit:', limit, 'Filters:', filters);
  
  return apiClient.get<Asset[]>('/accountant/asset', {
    page,
    limit,
    ...filters
  });
};

// Get asset by ID
export const getAssetByIdApi = async (assetId: string | number): Promise<ApiResponse<Asset>> => {
  console.log('📤 [ASSET API] Fetching asset by ID:', assetId);
  
  return apiClient.get<Asset>(`/accountant/asset/${assetId}`);
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
  console.log('📤 [ASSET API] Creating asset:', assetData);
  
  return apiClient.post<Asset>('/accountant/asset', assetData);
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
  console.log('📤 [ASSET API] Updating asset:', assetId, updates);
  
  const response = await apiClient.patch<any>('/accountant/asset', {
    asset_id: assetId,
    ...updates
  });
  
  // Backend wraps asset in data.asset
  return {
    ...response,
    data: response.data?.asset || response.data
  };
};

// Delete asset
export const deleteAssetApi = async (assetId: string): Promise<ApiResponse<void>> => {
  console.log('📤 [ASSET API] Deleting asset:', assetId);
  
  return apiClient.delete<void>(`/accountant/asset/${assetId}`);
};
