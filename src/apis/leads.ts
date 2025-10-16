import type { CreateLeadRequest, CreateLeadResponse, Lead, ApiResponse } from '../types';
import { apiClient } from '../services/apiClient';

// ============================================
// INTERFACES
// ============================================

export interface CrackLeadRequest {
  status: 'cracked';
  outcome?: string;
  notes?: string;
}

export interface PushLeadRequest {
  status: 'push';
  notes?: string;
}

// ============================================
// LEAD CRUD OPERATIONS
// ============================================

// Create a new lead
export const createLeadApi = async (leadData: CreateLeadRequest): Promise<CreateLeadResponse> => {
  console.log('📤 [LEAD API] Creating lead:', leadData);
  
  const response = await apiClient.post<Lead>('/leads', leadData);
  
  return {
    success: response.success,
    data: response.data,
    message: response.message,
    error: response.error
  };
};

// Get all leads with filters and pagination
export const getLeadsApi = async (
  page: number = 1, 
  limit: number = 20,
  filters: {
    search?: string;
    source?: string;
    type?: string;
    status?: string;
    salesUnitId?: number;
    assignedTo?: string;
    fromDate?: string;
    toDate?: string;
  } = {}
): Promise<ApiResponse<Lead[]>> => {
  console.log('📤 [LEAD API] Fetching leads - Page:', page, 'Limit:', limit, 'Filters:', filters);
  
  return apiClient.get<Lead[]>('/leads', {
    page,
    limit,
    ...filters
  });
};

// Get lead by ID
export const getLeadByIdApi = async (leadId: string): Promise<ApiResponse<Lead>> => {
  console.log('📤 [LEAD API] Fetching lead by ID:', leadId);
  
  return apiClient.get<Lead>(`/leads/${leadId}`);
};

// Update lead
export const updateLeadApi = async (leadId: string, updates: Partial<Lead>): Promise<ApiResponse<Lead>> => {
  console.log('📤 [LEAD API] Updating lead:', leadId, updates);
  
  return apiClient.patch<Lead>(`/leads/${leadId}`, updates);
};

// Delete lead
export const deleteLeadApi = async (leadId: string): Promise<ApiResponse<void>> => {
  console.log('📤 [LEAD API] Deleting lead:', leadId);
  
  return apiClient.delete<void>(`/leads/${leadId}`);
};

// ============================================
// BULK OPERATIONS
// ============================================

// Bulk update leads
export const bulkUpdateLeadsApi = async (leadIds: string[], updates: Partial<Lead>): Promise<ApiResponse<void>> => {
  console.log('📤 [LEAD API] Bulk updating leads:', leadIds.length, 'leads');
  
  return apiClient.post<void>('/leads/bulk-update', {
    leadIds,
    updates
  });
};

// Bulk delete leads
export const bulkDeleteLeadsApi = async (leadIds: string[]): Promise<ApiResponse<void>> => {
  console.log('📤 [LEAD API] Bulk deleting leads:', leadIds.length, 'leads');
  
  return apiClient.post<void>('/leads/bulk-delete', {
    leadIds
  });
};

// ============================================
// STATISTICS & ANALYTICS
// ============================================

// Get leads statistics
export const getLeadsStatisticsApi = async (): Promise<ApiResponse<{
  total: number;
  bySource: Record<string, number>;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  conversion: number;
}>> => {
  console.log('📤 [LEAD API] Fetching leads statistics');
  
  return apiClient.get('/leads/statistics');
};

// ============================================
// SALES UNITS
// ============================================

// Get all sales units
export const getSalesUnitsApi = async (): Promise<ApiResponse<Array<{ id: number; name: string }>>> => {
  console.log('📤 [LEAD API] Fetching sales units');
  
  return apiClient.get('/sales-units');
};

// ============================================
// MY LEADS (USER-SPECIFIC)
// ============================================

// Get my assigned leads
export const getMyLeadsApi = async (
  page: number = 1, 
  limit: number = 20, 
  filters: {
    search?: string;
    status?: string;
    type?: string;
  } = {}
): Promise<ApiResponse<Lead[]>> => {
  console.log('📤 [LEAD API] Fetching my leads - Page:', page, 'Limit:', limit);
  
  return apiClient.get<Lead[]>('/leads/my-leads', {
    page,
    limit,
    ...filters
  });
};

// ============================================
// LEAD DISTRIBUTION & REQUESTS
// ============================================

// Request new leads
export const requestLeadApi = async (
  keptLeadIds: number[], 
  includePushLeads: boolean = false
): Promise<ApiResponse<{
  assigned: Lead[];
  message: string;
}>> => {
  console.log('📤 [LEAD API] Requesting leads - Kept:', keptLeadIds.length, 'Include push:', includePushLeads);
  
  return apiClient.post('/leads/request', {
      keptLeadIds,
      includePushLeads
  });
};

// Get filter employees
export const getFilterEmployeesApi = async (salesUnitId?: number): Promise<ApiResponse<Array<{ 
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}>>> => {
  console.log('📤 [LEAD API] Fetching filter employees for sales unit:', salesUnitId);
  
  return apiClient.get('/employees/filter', salesUnitId ? { salesUnitId } : {});
};

// ============================================
// LEAD ACTIONS (CRACK, PUSH)
// ============================================

// Crack a lead (mark as successful)
export const crackLeadApi = async (leadId: string, crackData: CrackLeadRequest): Promise<ApiResponse<Lead>> => {
  console.log('📤 [LEAD API] Cracking lead:', leadId, crackData);
  
  return apiClient.patch<Lead>(`/leads/${leadId}/crack`, crackData);
};

// Push a lead (defer/reassign)
export const pushLeadApi = async (leadId: string, pushData: PushLeadRequest): Promise<ApiResponse<Lead>> => {
  console.log('📤 [LEAD API] Pushing lead:', leadId, pushData);
  
  return apiClient.patch<Lead>(`/leads/${leadId}/push`, pushData);
};

// ============================================
// CRACKED LEADS
// ============================================

// Get all cracked leads
export const getCrackedLeadsApi = async (
  page: number = 1, 
  limit: number = 20, 
  filters: {
    search?: string;
    fromDate?: string;
    toDate?: string;
  } = {}
): Promise<ApiResponse<Lead[]>> => {
  console.log('📤 [LEAD API] Fetching cracked leads - Page:', page, 'Limit:', limit);
  
  return apiClient.get<Lead[]>('/leads/cracked', {
    page,
    limit,
    ...filters
  });
};

// Get cracked lead by ID
export const getCrackedLeadApi = async (crackedLeadId: number): Promise<ApiResponse<any>> => {
  console.log('📤 [LEAD API] Fetching cracked lead by ID:', crackedLeadId);
  
  return apiClient.get(`/leads/cracked/${crackedLeadId}`);
};

// ============================================
// ARCHIVED LEADS
// ============================================

// Get all archived leads
export const getArchivedLeadsApi = async (
  page: number = 1, 
  limit: number = 20, 
  filters: {
    search?: string;
    fromDate?: string;
    toDate?: string;
  } = {}
): Promise<ApiResponse<Lead[]>> => {
  console.log('📤 [LEAD API] Fetching archived leads - Page:', page, 'Limit:', limit);
  
  return apiClient.get<Lead[]>('/leads/archived', {
    page,
    limit,
    ...filters
  });
};
