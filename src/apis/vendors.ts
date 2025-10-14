// API Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

import { getAuthData } from '../utils/cookieUtils';

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
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Fetching vendors from:', `${API_BASE_URL}/accountant/vendors/display`);

    const response = await fetch(`${API_BASE_URL}/accountant/vendors/display`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Vendors response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch vendors';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error('Vendors API error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
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
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Creating vendor:', vendorData);

    const response = await fetch(`${API_BASE_URL}/accountant/vendor/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(vendorData),
    });

    console.log('Create vendor response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to create vendor';
      try {
        const errorData = await response.json();
        
        // Handle validation errors (400)
        if (response.status === 400) {
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(', ');
          }
        } 
        // Handle other errors
        else {
          errorMessage = errorData.message || errorMessage;
        }
      } catch (parseError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error('Create vendor API error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
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

