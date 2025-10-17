import { apiGetJson, apiPostJson } from '../utils/apiClient';

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
    console.log('Fetching active industries from: /industries/active');

    const data = await apiGetJson<any>('/industries/active');
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
    console.log('Creating industry:', industryData);

    const data = await apiPostJson<any>('/industries', industryData);
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
