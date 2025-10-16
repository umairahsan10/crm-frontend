import type { Revenue, ApiResponse } from '../types';
import { apiClient } from '../services/apiClient';

// Get all revenues with filters (backend uses page/limit in query params)
export const getRevenuesApi = async (
  page: number = 1,
  limit: number = 20,
  filters: {
    category?: string;
    source?: string;
    fromDate?: string;
    toDate?: string;
    createdBy?: string;
    minAmount?: string;
    maxAmount?: string;
    paymentMethod?: string;
    receivedFrom?: string;
    relatedInvoiceId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<ApiResponse<Revenue[]>> => {
  console.log('📤 [REVENUE API] Fetching revenues - Page:', page, 'Limit:', limit, 'Filters:', filters);
  
  return apiClient.get<Revenue[]>('/accountant/revenue', {
    page,
    limit,
    ...filters
  });
};

// Create revenue
export const createRevenueApi = async (revenueData: {
  source: string;
  category: string;
  amount: number;
  receivedFrom?: number;
  receivedOn?: string;
  paymentMethod?: 'cash' | 'bank' | 'online';
  relatedInvoiceId?: number;
  transactionId?: number;
}): Promise<ApiResponse<Revenue>> => {
  console.log('📤 [REVENUE API] Creating revenue:', revenueData);
  
  const response = await apiClient.post<any>('/accountant/revenue', revenueData);
  
  // Backend wraps revenue in data.revenue
  return {
    ...response,
    data: response.data?.revenue || response.data
  };
};

// Get revenue by ID
export const getRevenueByIdApi = async (revenueId: string | number): Promise<ApiResponse<Revenue>> => {
  console.log('📤 [REVENUE API] Fetching revenue by ID:', revenueId);
  
  return apiClient.get<Revenue>(`/accountant/revenue/${revenueId}`);
};

// Update revenue (PATCH method with revenue_id in body)
export const updateRevenueApi = async (
  revenueId: number,
  updates: {
    source?: string;
    category?: string;
    amount?: number;
    receivedFrom?: number;
    receivedOn?: string;
    paymentMethod?: 'cash' | 'bank' | 'online';
    relatedInvoiceId?: number;
  }
): Promise<ApiResponse<Revenue>> => {
  console.log('📤 [REVENUE API] Updating revenue:', revenueId, updates);
  
  // Backend expects PATCH to /accountant/revenue with revenue_id in body
  const response = await apiClient.patch<any>('/accountant/revenue', {
    revenue_id: revenueId,
    ...updates
  });
  
  // Backend wraps revenue in data.revenue
  return {
    ...response,
    data: response.data?.revenue || response.data
  };
};

// Delete revenue
export const deleteRevenueApi = async (revenueId: string): Promise<ApiResponse<void>> => {
  console.log('📤 [REVENUE API] Deleting revenue:', revenueId);
  
  return apiClient.delete<void>(`/accountant/revenue/${revenueId}`);
};

