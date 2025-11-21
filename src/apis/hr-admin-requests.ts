import { apiRequest, apiGetJson } from '../utils/apiClient';

// Types for HR Admin Requests
export interface CreateHRAdminRequestDto {
  description: string;
  type: 'salary_increase' | 'late_approval' | 'others';
}

export interface AdminRequestResponseDto {
  id: number;
  hrId: number;
  description: string;
  type: string;
  hrLogId?: number;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
  updatedAt: string;
  hr: {
    id: number;
    employeeId: number;
  };
  hrLog?: any;
}

export interface HRAdminRequestStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  salary_increase_requests: number;
  late_approval_requests: number;
  others_requests: number;
}

// API Functions
export const createHRAdminRequestApi = async (
  requestData: CreateHRAdminRequestDto
): Promise<AdminRequestResponseDto> => {
  console.log('API: Creating HR admin request', requestData);

  const requestBody = {
    type: requestData.type,
    description: requestData.description,
  };

  console.log('API: Request body being sent:', requestBody);

  const response = await apiRequest('/hr/admin-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to create HR admin request';
    try {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      console.error('Could not parse error response');
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// List item interface (limited fields from list endpoint)
export interface AdminRequestListItemDto {
  id: number;
  description: string;
  type: string;
  status: 'pending' | 'approved' | 'declined';
  hrId: number | null;
  hrFirstName: string | null;
  hrLastName: string | null;
  hrLogId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface HRAdminRequestsResponse {
  adminRequests: AdminRequestListItemDto[];
  total: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const getHRAdminRequestsApi = async (): Promise<HRAdminRequestsResponse> => {
  const url = '/hr/admin-requests';
  console.log('API: Fetching HR admin requests from', url);
  return apiGetJson<HRAdminRequestsResponse>(url);
};

export interface MyHRAdminRequestsResponse {
  adminRequests: AdminRequestResponseDto[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MyHRAdminRequestsFilters {
  hrId: number;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export const getMyHRAdminRequestsApi = async (filters: MyHRAdminRequestsFilters): Promise<MyHRAdminRequestsResponse> => {
  const params = new URLSearchParams();
  params.append('hrId', filters.hrId.toString());
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.fromDate) params.append('fromDate', filters.fromDate);
  if (filters.toDate) params.append('toDate', filters.toDate);
  
  const url = `/hr/admin-requests/my-requests?${params.toString()}`;
  console.log('API: Fetching my HR admin requests from', url);
  return apiGetJson<MyHRAdminRequestsResponse>(url);
};

export const getHRAdminRequestStatsApi = async (): Promise<HRAdminRequestStats> => {
  const url = '/hr/admin-requests/stats';
  console.log('API: Fetching HR admin request stats from', url);
  return apiGetJson<HRAdminRequestStats>(url);
};

export const updateHRAdminRequestApi = async (
  requestId: number,
  status: 'approved' | 'declined',
  notes?: string
): Promise<AdminRequestResponseDto> => {
  console.log('API: Updating HR admin request', { requestId, status, notes });

  const response = await apiRequest(`/hr/admin-requests/${requestId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to update HR admin request';
    try {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      console.error('Could not parse error response');
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// Get single admin request by ID (full details with hr and hrLog objects)
export const getHRAdminRequestByIdApi = async (
  requestId: number
): Promise<AdminRequestResponseDto> => {
  const url = `/hr/admin-requests/${requestId}`;
  console.log('API: Fetching HR admin request by ID from', url);
  return apiGetJson<AdminRequestResponseDto>(url);
};