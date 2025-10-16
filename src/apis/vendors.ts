import { apiClient } from '../services/apiClient';
import type { ApiResponse } from '../types';

export interface Vendor {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  bank_account?: string;
  status?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVendorRequest {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  bank_account?: string;
  status?: string;
  notes?: string;
}

// Get all vendors
export const getVendorsApi = async (): Promise<ApiResponse<Vendor[]>> => {
  console.log('📤 [VENDOR API] Fetching all vendors');
  
  return apiClient.get<Vendor[]>('/accountant/vendor');
};

// Get vendor by ID
export const getVendorByIdApi = async (vendorId: number): Promise<ApiResponse<Vendor>> => {
  console.log('📤 [VENDOR API] Fetching vendor by ID:', vendorId);
  
  return apiClient.get<Vendor>(`/accountant/vendor/${vendorId}`);
};

// Create vendor
export const createVendorApi = async (vendorData: CreateVendorRequest): Promise<ApiResponse<Vendor>> => {
  console.log('📤 [VENDOR API] Creating vendor:', vendorData);
  
  return apiClient.post<Vendor>('/accountant/vendor', vendorData);
};

// Update vendor
export const updateVendorApi = async (
  vendorId: number,
  updates: Partial<CreateVendorRequest>
): Promise<ApiResponse<Vendor>> => {
  console.log('📤 [VENDOR API] Updating vendor:', vendorId, updates);
  
  return apiClient.patch<Vendor>(`/accountant/vendor/${vendorId}`, updates);
};

// Delete vendor
export const deleteVendorApi = async (vendorId: number): Promise<ApiResponse<void>> => {
  console.log('📤 [VENDOR API] Deleting vendor:', vendorId);
  
  return apiClient.delete<void>(`/accountant/vendor/${vendorId}`);
};
