import { apiGetJson, ApiError } from '../utils/apiClient';
import { API_BASE_URL } from '../config/constants';

export interface AdminData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminListResponse {
  admins: AdminData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getMyAdminProfileApi = async (): Promise<AdminData> => {
  try {
    console.log('Fetching admin profile from:', `${API_BASE_URL}/admin/my-profile`);
    const response = await apiGetJson<AdminResponse>(`${API_BASE_URL}/admin/my-profile`);
    console.log('Admin profile API response:', response);
    return response;
  } catch (error) {
    console.error('Admin API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch admin profile: ${error.message}`);
    }
    throw new Error('Failed to fetch admin profile');
  }
};

export const getAllAdminsApi = async (page: number = 1, limit: number = 10): Promise<AdminListResponse> => {
  try {
    const response = await apiGetJson<AdminListResponse>(`${API_BASE_URL}/admin?page=${page}&limit=${limit}`);
    return response;
  } catch (error) {
    console.error('Admin list API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch admins: ${error.message}`);
    }
    throw new Error('Failed to fetch admins');
  }
};

export const getAdminByIdApi = async (id: number): Promise<AdminData> => {
  try {
    const response = await apiGetJson<AdminResponse>(`${API_BASE_URL}/admin/${id}`);
    return response;
  } catch (error) {
    console.error('Admin by ID API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch admin: ${error.message}`);
    }
    throw new Error('Failed to fetch admin');
  }
};

export const updateAdminProfileApi = async (_adminData: Partial<AdminData>): Promise<AdminData> => {
  try {
    // This would be implemented when you add the update endpoint
    // const response = await apiPutJson<AdminResponse>('/admin/my-profile', adminData);
    // return response;
    throw new Error('Update admin profile endpoint not implemented yet');
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(`Failed to update admin profile: ${error.message}`);
    }
    throw new Error('Failed to update admin profile');
  }
};
