import { apiGetJson, apiPostJson } from '../utils/apiClient';

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
  created_by?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateVendorRequest {
  name?: string;
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Get all vendors
export const getVendorsApi = async (): Promise<ApiResponse<Vendor[]>> => {
  try {
    console.log('Fetching vendors from: /accountant/vendors/display');

    const data = await apiGetJson<any>('/accountant/vendors/display');
    console.log('Vendors response:', data);

    // Handle response format: { status, message, vendors: [], metadata }
    let vendors: Vendor[] = [];
    if (data.vendors && Array.isArray(data.vendors)) {
      vendors = data.vendors;
    } else if (Array.isArray(data)) {
      vendors = data;
    } else if (data.data && Array.isArray(data.data)) {
      vendors = data.data;
    }

    return {
      success: true,
      data: vendors,
      message: data.message || 'Vendors fetched successfully'
    };
  } catch (error) {
    console.error('Vendors API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching vendors');
  }
};

// Create a new vendor
export const createVendorApi = async (vendorData: CreateVendorRequest): Promise<ApiResponse<Vendor>> => {
  try {
    console.log('Creating vendor:', vendorData);

    const data = await apiPostJson<any>('/accountant/vendor/create', vendorData);
    console.log('Create vendor response:', data);

    // Handle response format: { status, message, vendor_id, vendor_data }
    let vendor: Vendor | undefined;
    if (data.vendor_data) {
      vendor = data.vendor_data;
    } else if (data.data) {
      vendor = data.data;
    } else if (data.id) {
      vendor = data;
    }

    return {
      success: true,
      data: vendor,
      message: data.message || 'Vendor created successfully'
    };
  } catch (error) {
    console.error('Create vendor error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while creating the vendor');
  }
};
