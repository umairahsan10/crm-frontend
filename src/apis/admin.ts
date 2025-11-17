import { apiGetJson, apiPutJson, ApiError } from '../utils/apiClient';

export type AdminRole = 'admin' | 'super_manager';

export interface AdminData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

export interface AdminResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAdminDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: AdminRole;
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
    console.log('Fetching admin profile from: /admin');
    const response = await apiGetJson<any>('/admin');
    console.log('Admin profile API response:', response);
    
    // Handle different response formats
    // If response is a list with admins array (AdminListResponse format)
    if (response && typeof response === 'object' && 'admins' in response && Array.isArray(response.admins)) {
      if (response.admins.length > 0) {
        return response.admins[0] as AdminData;
      }
      throw new Error('No admin found in response');
    }
    // If response is wrapped in a data property (like employee profile)
    if (response && typeof response === 'object' && 'data' in response && response.data) {
      return response.data as AdminData;
    }
    // If response is the admin object directly
    if (response && typeof response === 'object' && 'id' in response) {
      return response as AdminData;
    }
    
    // Fallback: return response as-is
    return response as AdminData;
  } catch (error) {
    console.error('Admin API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch admin profile: ${error.message}`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch admin profile');
  }
};

export const getAllAdminsApi = async (page: number = 1, limit: number = 10): Promise<AdminListResponse> => {
  try {
    const response = await apiGetJson<AdminListResponse>(`/admin?page=${page}&limit=${limit}`);
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
    const response = await apiGetJson<AdminResponse>(`/admin/${id}`);
    return response;
  } catch (error) {
    console.error('Admin by ID API Error:', error);
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch admin: ${error.message}`);
    }
    throw new Error('Failed to fetch admin');
  }
};

export const updateAdminProfileApi = async (adminData: UpdateAdminDto): Promise<AdminData> => {
  try {
    console.log('Updating admin profile via: PUT /admin/:id');
    console.log('Admin data to update:', adminData);
    
    // First, get the current admin to get the ID
    const currentAdmin = await getMyAdminProfileApi();
    const adminId = currentAdmin.id;
    
    if (!adminId) {
      throw new Error('Admin ID not found');
    }
    
    // Update using PUT to /admin/{id}
    // According to API spec, response is the admin object directly
    const response = await apiPutJson<AdminResponse>(`/admin/${adminId}`, adminData);
    console.log('Update admin profile API response:', response);
    
    // According to API spec, response is the admin object directly (200 OK)
    // Handle different response formats for safety
    if (response && typeof response === 'object' && 'data' in response && response.data) {
      return response.data as AdminData;
    }
    // If response is the admin object directly (expected format)
    if (response && typeof response === 'object' && 'id' in response) {
      return response as AdminData;
    }
    
    // Fallback: return response as-is
    return response as AdminData;
  } catch (error) {
    console.error('Admin update API Error:', error);
    if (error instanceof ApiError) {
      // Handle specific error cases from API
      if (error.status === 404) {
        throw new Error('Admin not found');
      }
      if (error.status === 400) {
        throw new Error(`Validation error: ${error.message}`);
      }
      throw new Error(`Failed to update admin profile: ${error.message}`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update admin profile');
  }
};
