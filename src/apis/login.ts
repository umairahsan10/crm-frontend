import { getAuthData } from '../utils/cookieUtils';
import { apiPostJson, apiGetJson, ApiError as ApiClientError } from '../utils/apiClient';

// API Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    sub: number;
    role: string;
    type: 'admin' | 'employee';
    department?: string;
    permissions?: Record<string, boolean>;
  };
}

export interface ApiError {
  message: string;
  status?: number;
}

export const loginApi = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    // Check for dummy credentials first
    if (credentials.email === 'admin@gmail.com' && credentials.password === 'admin') {
      // Return mock response for dummy credentials
      const mockResponse: LoginResponse = {
        access_token: 'dummy_jwt_token_for_admin',
        user: {
          sub: 1,
          role: 'admin',
          type: 'admin',
          department: 'admin',
          permissions: {
            'read': true,
            'write': true,
            'delete': true,
            'manage_users': true,
            'manage_roles': true,
            'view_reports': true,
            'manage_settings': true,
            'manage_employees': true,
            'manage_attendance': true,
            'manage_financial': true,
            'manage_sales': true,
            'manage_production': true,
            'manage_marketing': true,
            'approve_chargebacks': true,
            'manage_department': true,
            'manage_team': true,
            'approve_requests': true,
            'manage_unit': true,
          }
        }
      };
      return mockResponse;
    }

    // For other credentials, make actual API call
    const data = await apiPostJson<LoginResponse>(`${API_BASE_URL}/auth/login`, credentials, {
      requireAuth: false,
    });
    
    return data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw new Error(error.message);
    }
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred during login');
  }
};

export const logoutApi = async (): Promise<void> => {
  try {
    const { token } = getAuthData();
    if (!token) return;

    await apiPostJson(`${API_BASE_URL}/auth/logout`, {});
  } catch (error) {
    console.error('Logout API error:', error);
    // Don't throw error for logout as it's not critical
  }
};

export const verifyTokenApi = async (token: string): Promise<boolean> => {
  try {
    await apiGetJson(`${API_BASE_URL}/auth/profile`, {
      requireAuth: false,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return true;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};
