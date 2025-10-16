import { apiClient } from '../services/apiClient';
import type { ApiResponse } from '../types';

export interface Industry {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Get all industries
export const getIndustriesApi = async (): Promise<ApiResponse<Industry[]>> => {
  console.log('📤 [INDUSTRY API] Fetching all industries');
  
  return apiClient.get<Industry[]>('/industries');
};

// Get only active industries (for dropdowns/filters)
export const getActiveIndustriesApi = async (): Promise<ApiResponse<Industry[]>> => {
  console.log('📤 [INDUSTRY API] Fetching active industries');
  
  return apiClient.get<Industry[]>('/industries', { isActive: true });
};

// Get industry by ID
export const getIndustryByIdApi = async (industryId: number): Promise<ApiResponse<Industry>> => {
  console.log('📤 [INDUSTRY API] Fetching industry by ID:', industryId);
  
  return apiClient.get<Industry>(`/industries/${industryId}`);
};

// Create industry
export const createIndustryApi = async (industryData: {
  name: string;
  description?: string;
  isActive?: boolean;
}): Promise<ApiResponse<Industry>> => {
  console.log('📤 [INDUSTRY API] Creating industry:', industryData);
  
  return apiClient.post<Industry>('/industries', industryData);
};

// Update industry
export const updateIndustryApi = async (
  industryId: number,
  updates: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }
): Promise<ApiResponse<Industry>> => {
  console.log('📤 [INDUSTRY API] Updating industry:', industryId, updates);
  
  return apiClient.patch<Industry>(`/industries/${industryId}`, updates);
};

// Delete industry
export const deleteIndustryApi = async (industryId: number): Promise<ApiResponse<void>> => {
  console.log('📤 [INDUSTRY API] Deleting industry:', industryId);
  
  return apiClient.delete<void>(`/industries/${industryId}`);
};
