import { apiGetJson, ApiError } from '../utils/apiClient';

// API Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ProfileData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  startDate?: string;
  department: {
    id: number;
    name: string;
  };
  role: {
    id: number;
    name: string;
  };
  manager?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  teamLead?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  message: string;
  data: ProfileData;
}

export const getMyProfileApi = async (): Promise<ProfileData> => {
  try {
    console.log('Fetching profile from:', `${API_BASE_URL}/employee/my-profile`);
    const response = await apiGetJson<ProfileResponse>(`${API_BASE_URL}/employee/my-profile`);
    console.log('Profile API response:', response);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }
    throw new Error('Failed to fetch profile');
  }
};

export const updateProfileApi = async (_profileData: Partial<ProfileData>): Promise<ProfileData> => {
  try {
    throw new Error('Update profile endpoint not implemented yet');
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
    throw new Error('Failed to update profile');
  }
};
