import type { Revenue, RevenuesResponse, RevenueResponse, ApiResponse } from '../types';
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
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.source) queryParams.append('source', filters.source);
    if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
    if (filters.toDate) queryParams.append('toDate', filters.toDate);
    if (filters.createdBy) queryParams.append('createdBy', filters.createdBy);
    if (filters.minAmount) queryParams.append('minAmount', filters.minAmount);
    if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount);
    if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);
    if (filters.receivedFrom) queryParams.append('receivedFrom', filters.receivedFrom);
    if (filters.relatedInvoiceId) queryParams.append('relatedInvoiceId', filters.relatedInvoiceId);

    const url = queryParams.toString() 
      ? `/accountant/revenue?${queryParams.toString()}`
      : `/accountant/revenue`;

    console.log('📤 [API] Fetching revenues from:', url);
    console.log('📤 [API] Filters:', filters);
    console.log('📤 [API] Query params:', queryParams.toString());
    console.log('📤 [API] Page:', page, 'Limit:', limit);

    const data: RevenuesResponse = await apiGetJson<RevenuesResponse>(url);
    console.log('✅ Revenues API Response:', data);
    
    // Backend returns { status, message, data: [], total, page, limit }
    if (data.status === 'error') {
      console.error('❌ Backend Error:', data);
      throw new Error(data.message || 'Backend error: Failed to fetch revenues');
    }
    
    return {
      success: true,
      data: data.data,
      message: data.message,
      pagination: {
        page: data.page || page,
        limit: data.limit || limit,
        total: data.total,
        totalPages: Math.ceil(data.total / (data.limit || limit)),
        hasNext: (data.page || page) * (data.limit || limit) < data.total,
        hasPrev: (data.page || page) > 1
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
  try {
    console.log('Creating revenue with data:', revenueData);

    const data = await apiPostJson<any>('/accountant/revenue', revenueData);
    console.log('Create revenue response:', data);
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to create revenue');
    }
    
    return {
      success: true,
      data: data.data.revenue,
      message: data.message || 'Revenue created successfully'
    };
  } catch (error) {
    console.error('Create revenue error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while creating revenue');
  }
};

// Get revenue by ID
export const getRevenueByIdApi = async (revenueId: string | number): Promise<ApiResponse<Revenue>> => {
  try {
    console.log('Fetching revenue by ID:', revenueId);

    const data: RevenueResponse = await apiGetJson<RevenueResponse>(`/accountant/revenue/${revenueId}`);
    console.log('Revenue detail response:', data);
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to fetch revenue');
    }
    
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
  try {
    console.log('Updating revenue:', revenueId, 'with data:', updates);

    // Backend expects PATCH to /accountant/revenue with revenue_id in body
    const data = await apiPatchJson<any>('/accountant/revenue', {
      revenue_id: revenueId,
      ...updates
    });
    console.log('Update revenue response:', data);
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to update revenue');
    }
    
    return {
      success: true,
      data: data.data.revenue,
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
    const data: ApiResponse<void> = await apiDeleteJson<ApiResponse<void>>(`/accountant/revenue/${revenueId}`);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while deleting revenue');
  }
};

