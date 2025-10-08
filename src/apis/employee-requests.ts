import { apiGetJson, apiRequest } from '../utils/apiClient';

// Types for HR Communication Requests
export interface EmployeeRequest {
  id: number;
  empId: number;
  departmentId: number;
  requestType: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In_Progress' | 'Resolved' | 'Rejected' | 'Cancelled';
  assignedTo: number;
  requestedOn: string;
  resolvedOn: string | null;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    department: {
      id: number;
      name: string;
    };
    role: {
      id: number;
      name: string;
    };
  };
  department: {
    id: number;
    name: string;
  };
  assignedToEmployee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface EmployeeRequestAction {
  status: 'Pending' | 'In_Progress' | 'Resolved' | 'Rejected' | 'Cancelled';
  responseNotes: string;
  assignedTo?: number;
  requestType?: string;
  subject?: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  departmentId?: number;
}

export interface EmployeeRequestStats {
  total_requests: number;
  pending_requests: number;
  in_progress_requests: number;
  resolved_requests: number;
  rejected_requests: number;
  on_hold_requests: number;
  critical_requests: number;
  high_priority_requests: number;
  medium_priority_requests: number;
  low_priority_requests: number;
  avg_resolution_time: number;
  department_breakdown: Array<{
    department_id: number;
    department_name: string;
    total_requests: number;
    pending_requests: number;
    resolved_requests: number;
  }>;
  request_type_breakdown: Array<{
    request_type: string;
    count: number;
    resolution_rate: number;
  }>;
}

export interface GetEmployeeRequestsDto {
  status?: 'Pending' | 'In_Progress' | 'Resolved' | 'Rejected' | 'Cancelled';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  department_id?: number;
  employee_id?: number;
  assigned_to?: number;
  start_date?: string;
  end_date?: string;
  request_type?: string;
}

// API Functions
export const getEmployeeRequestsApi = async (query?: GetEmployeeRequestsDto): Promise<EmployeeRequest[]> => {
  const params = new URLSearchParams();
  
  if (query?.status) params.append('status', query.status);
  if (query?.priority) params.append('priority', query.priority);
  if (query?.department_id) params.append('departmentId', query.department_id.toString());
  if (query?.employee_id) params.append('empId', query.employee_id.toString()); // Changed to empId to match backend
  if (query?.assigned_to) params.append('assignedTo', query.assigned_to.toString());
  if (query?.start_date) params.append('startDate', query.start_date);
  if (query?.end_date) params.append('endDate', query.end_date);
  if (query?.request_type) params.append('requestType', query.request_type);

  const queryString = params.toString();
  const url = queryString ? `/communication/employee/hr-requests?${queryString}` : '/communication/employee/hr-requests';
  
  console.log('API call URL:', url);
  console.log('Query parameters:', query);
  
  return apiGetJson<EmployeeRequest[]>(url);
};

export const getEmployeeRequestsByStatusApi = async (status: string): Promise<EmployeeRequest[]> => {
  return apiGetJson<EmployeeRequest[]>(`/communication/employee/hr-requests/status/${status}`);
};

export const getEmployeeRequestsByPriorityApi = async (priority: string): Promise<EmployeeRequest[]> => {
  return apiGetJson<EmployeeRequest[]>(`/communication/employee/hr-requests/priority/${priority}`);
};

// Get current employee's own requests
export const getMyEmployeeRequestsApi = async (employeeId: number): Promise<EmployeeRequest[]> => {
  const url = `/communication/employee/hr-requests/my-requests?employeeId=${employeeId}`;
  console.log('API: Fetching my requests from', url);
  return apiGetJson<EmployeeRequest[]>(url);
};

export const getEmployeeRequestByIdApi = async (id: number): Promise<EmployeeRequest> => {
  return apiGetJson<EmployeeRequest>(`/communication/employee/hr-requests/${id}`);
};

export const takeEmployeeRequestActionApi = async (
  id: number, 
  hrEmployeeId: number, 
  action: EmployeeRequestAction
): Promise<EmployeeRequest> => {
  const response = await apiRequest(`/communication/employee/hr-requests/${id}/action?hrEmployeeId=${hrEmployeeId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(action),
  });

  if (!response.ok) {
    throw new Error(`Failed to take action on request ${id}`);
  }

  return response.json();
};

export const updateEmployeeRequestActionApi = async (
  id: number, 
  hrEmployeeId: number, 
  action: EmployeeRequestAction
): Promise<EmployeeRequest> => {
  const response = await apiRequest(`/communication/employee/hr-requests/${id}/action?hrEmployeeId=${hrEmployeeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(action),
  });

  if (!response.ok) {
    throw new Error(`Failed to update action on request ${id}`);
  }

  return response.json();
};


export const exportEmployeeRequestsApi = async (query: GetEmployeeRequestsDto & { format?: 'csv' | 'json' }): Promise<Blob> => {
  const params = new URLSearchParams();
  
  if (query.status) params.append('status', query.status);
  if (query.priority) params.append('priority', query.priority);
  if (query.department_id) params.append('department_id', query.department_id.toString());
  if (query.employee_id) params.append('employee_id', query.employee_id.toString());
  if (query.assigned_to) params.append('assigned_to', query.assigned_to.toString());
  if (query.start_date) params.append('start_date', query.start_date);
  if (query.end_date) params.append('end_date', query.end_date);
  if (query.request_type) params.append('request_type', query.request_type);
  if (query.format) params.append('format', query.format);

  const queryString = params.toString();
  const url = queryString ? `/communication/employee/hr-requests/export?${queryString}` : '/communication/employee/hr-requests/export';
  
  const response = await apiRequest(url, {
    method: 'GET',
    headers: {
      'Accept': query.format === 'json' ? 'application/json' : 'text/csv',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to export employee requests');
  }

  return response.blob();
};

// Create new employee request
export interface CreateEmployeeRequestDto {
  request_type: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

export const createEmployeeRequestApi = async (
  empId: number,
  requestData: CreateEmployeeRequestDto
): Promise<EmployeeRequest> => {
  console.log('API: Creating employee request', { empId, requestData });
  
  const requestBody = {
    empId: empId,
    requestType: requestData.request_type,
    subject: requestData.subject,
    description: requestData.description,
    priority: requestData.priority,
  };
  
  console.log('API: Request body being sent:', requestBody);
  
  const response = await apiRequest('/communication/employee/hr-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    // Try to get error details from response
    let errorMessage = 'Failed to create employee request';
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