import type { Liability, ApiResponse } from '../types';
import { apiClient } from '../services/apiClient';

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
  console.log('📤 [LIABILITY API] Fetching liabilities - Page:', page, 'Limit:', limit, 'Filters:', filters);
  
  return apiClient.get<Liability[]>('/accountant/liability', {
    page,
    limit,
    ...filters
  });
};

// Get liability by ID
export const getLiabilityByIdApi = async (liabilityId: string | number): Promise<ApiResponse<Liability>> => {
  console.log('📤 [LIABILITY API] Fetching liability by ID:', liabilityId);
  
  return apiClient.get<Liability>(`/accountant/liability/${liabilityId}`);
};

// Create liability
export const createLiabilityApi = async (liabilityData: {
  name: string;
  category: string;
  amount: number;
  dueDate: string;
  isPaid?: boolean;
  paidOn?: string | null;
  relatedVendorId?: number;
}): Promise<ApiResponse<Liability>> => {
  console.log('📤 [LIABILITY API] Creating liability:', liabilityData);
  
  return apiClient.post<Liability>('/accountant/liability', liabilityData);
};

// Update liability
export const updateLiabilityApi = async (
  liabilityId: number,
  updates: {
    name?: string;
    category?: string;
    amount?: number;
    dueDate?: string;
    isPaid?: boolean;
    paidOn?: string | null;
    relatedVendorId?: number;
  }
): Promise<ApiResponse<Liability>> => {
  console.log('📤 [LIABILITY API] Updating liability:', liabilityId, updates);
  
  const response = await apiClient.patch<any>('/accountant/liability', {
    liability_id: liabilityId,
    ...updates
  });
  
  // Backend wraps liability in data.liability
  return {
    ...response,
    data: response.data?.liability || response.data
  };
};

// Delete liability
export const deleteLiabilityApi = async (liabilityId: string): Promise<ApiResponse<void>> => {
  console.log('📤 [LIABILITY API] Deleting liability:', liabilityId);
  
  return apiClient.delete<void>(`/accountant/liability/${liabilityId}`);
};

// Mark liability as paid
export const markLiabilityAsPaidApi = async (liabilityId: number): Promise<ApiResponse<Liability>> => {
  console.log('📤 [LIABILITY API] Marking liability as paid:', liabilityId);
  
  return updateLiabilityApi(liabilityId, {
    isPaid: true,
    paidOn: new Date().toISOString()
  });
};
