// API Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

import { getAuthData } from '../utils/cookieUtils';

export interface Industry {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  clientsCount?: number;
  crackedLeadsCount?: number;
}

export interface CreateIndustryRequest {
  name: string;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Get all active industries
export const getActiveIndustriesApi = async (): Promise<ApiResponse<Industry[]>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Fetching active industries from:', `${API_BASE_URL}/industries/active`);

    const response = await fetch(`${API_BASE_URL}/industries/active`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Active industries response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch industries';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error('Active industries API error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Active industries response:', data);

    // Handle different response formats
    let industries: Industry[] = [];
    if (data.data && Array.isArray(data.data.industries)) {
      industries = data.data.industries;
    } else if (data.industries && Array.isArray(data.industries)) {
      industries = data.industries;
    } else if (Array.isArray(data)) {
      industries = data;
    }

    return {
      success: true,
      data: industries,
      message: data.message || 'Industries fetched successfully'
    };
  } catch (error) {
    console.error('Active industries API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching industries');
  }
};

// Create a new industry
export const createIndustryApi = async (industryData: CreateIndustryRequest): Promise<ApiResponse<Industry>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Creating industry:', industryData);

    const response = await fetch(`${API_BASE_URL}/industries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(industryData),
    });

    console.log('Create industry response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to create industry';
      try {
        const errorData = await response.json();
        
        // Handle validation errors (400)
        if (response.status === 400 && Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(', ');
        } 
        // Handle duplicate error (409)
        else if (response.status === 409) {
          errorMessage = errorData.message || 'Industry already exists';
        } 
        else {
          errorMessage = errorData.message || errorMessage;
        }
      } catch (parseError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error('Create industry API error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Create industry response:', data);

    // Handle different response formats
    let industry: Industry | undefined;
    if (data.data && data.data.industry) {
      industry = data.data.industry;
    } else if (data.industry) {
      industry = data.industry;
    } else if (data.id) {
      industry = data;
    }

    return {
      success: true,
      data: industry,
      message: data.message || 'Industry created successfully'
    };
  } catch (error) {
    console.error('Create industry error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while creating the industry');
  }
};

