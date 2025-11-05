import type { CreateLeadRequest, CreateLeadResponse, Lead, ApiResponse } from '../types';
import { 
  apiGetJson, 
  apiPostJson, 
  apiPutJson, 
  apiDeleteJson,
  apiPatchJson
} from '../utils/apiClient';

export interface ApiError {
  message: string;
  status?: number;
}

// Create a new lead
export const createLeadApi = async (leadData: CreateLeadRequest): Promise<CreateLeadResponse> => {
  try {
    console.log('Making API call to: /leads');
    console.log('Request body:', leadData);

    const data = await apiPostJson<any>('/leads', leadData);
    console.log('Raw API Response data:', data);
    
    // Handle different response formats
    let formattedResponse: CreateLeadResponse;
    
    // If the response is already in the expected format
    if (typeof data === 'object' && 'success' in data) {
      formattedResponse = data as CreateLeadResponse;
    } 
    // If the response is just the lead data directly
    else if (data && typeof data === 'object' && 'id' in data) {
      formattedResponse = {
        success: true,
        data: data as Lead,
        message: 'Lead created successfully'
      };
    }
    // If the response is an array or other format
    else {
      formattedResponse = {
        success: true,
        data: data as any,
        message: 'Lead created successfully'
      };
    }
    
    console.log('Formatted API Response:', formattedResponse);
    return formattedResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while creating the lead');
  }
};

// Get all leads with pagination and filters
export const getLeadsApi = async (
  page: number = 1, 
  limit: number = 10, 
  filters: {
    search?: string;
    status?: string;
    type?: string;
    salesUnitId?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    outcome?: string;
    userId?: string; // Add userId filter
  } = {}
): Promise<ApiResponse<Lead[]>> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type }),
      ...(filters.salesUnitId && { salesUnitId: filters.salesUnitId }),
      ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      ...(filters.outcome && { outcome: filters.outcome }),
      ...(filters.userId && { userId: filters.userId })
    });

    const data = await apiGetJson<any>(`/leads?${queryParams.toString()}`);
    console.log('Raw GET leads response:', data);
    
    // Handle different response formats
    let formattedResponse: ApiResponse<Lead[]>;
    
    // If the response is already in the expected format
    if (typeof data === 'object' && 'success' in data) {
      formattedResponse = data as ApiResponse<Lead[]>;
    } 
    // If the response has leads array (your backend format)
    else if (data && typeof data === 'object' && 'leads' in data && Array.isArray(data.leads)) {
      formattedResponse = {
        success: true,
        data: data.leads as Lead[],
        message: 'Leads fetched successfully',
        // Include pagination metadata
        pagination: (data as any).pagination
      };
    }
    // If the response is an array directly
    else if (Array.isArray(data)) {
      formattedResponse = {
        success: true,
        data: data as Lead[],
        message: 'Leads fetched successfully'
      };
    }
    // Fallback for other formats
    else {
      formattedResponse = {
        success: true,
        data: data as any,
        message: 'Leads fetched successfully'
      };
    }
    
    console.log('Formatted GET leads response:', formattedResponse);
    return formattedResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching leads');
  }
};

// Get a specific lead by ID
export const getLeadByIdApi = async (leadId: string): Promise<ApiResponse<Lead>> => {
  try {
    console.log('📡 Fetching lead by ID:', leadId);

    const data = await apiGetJson<any>(`/leads/${leadId}`);
    console.log('✅ getLeadByIdApi raw response:', data);
    console.log('📝 Comments in response:', data.comments || 'NOT FOUND');
    console.log('📅 Outcome history in response:', data.outcomeHistory || 'NOT FOUND');
    
    // Handle different response formats
    let formattedResponse: ApiResponse<Lead>;
    
    // If the response is already in the expected format with success property
    if (typeof data === 'object' && 'success' in data && data.data) {
      formattedResponse = {
        success: true,
        data: data.data,
        message: data.message || 'Lead fetched successfully'
      };
    } 
    // If the response is the lead object directly (most common)
    else if (data && typeof data === 'object' && 'id' in data) {
      formattedResponse = {
        success: true,
        data: data as Lead,
        message: 'Lead fetched successfully'
      };
    }
    // Fallback
    else {
      formattedResponse = {
        success: true,
        data: data as any,
        message: 'Lead fetched successfully'
      };
    }
    
    console.log('📦 Formatted response:', formattedResponse);
    return formattedResponse;
  } catch (error) {
    console.error('💥 getLeadByIdApi error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching the lead');
  }
};

// Update a lead
export const updateLeadApi = async (leadId: string, updates: Partial<Lead>): Promise<ApiResponse<Lead>> => {
  try {
    console.log('Updating lead:', leadId, 'with data:', updates);

    const data = await apiPutJson<any>(`/leads/${leadId}`, updates);
    console.log('Update lead response:', data);
    
    // Handle different response formats from your backend
    let updatedLead;
    if (data.lead) {
      // If response has a 'lead' property
      updatedLead = data.lead;
    } else if (data.data) {
      // If response has a 'data' property
      updatedLead = data.data;
    } else if (data.id) {
      // If response is the lead object directly
      updatedLead = data;
    } else {
      // Fallback - use the original lead data
      updatedLead = updates;
    }
    
    return {
      success: true,
      data: updatedLead,
      message: data.message || 'Lead updated successfully'
    };
  } catch (error) {
    console.error('Update lead error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating the lead');
  }
};


// Delete a lead
export const deleteLeadApi = async (leadId: string): Promise<ApiResponse<void>> => {
  try {
    const data = await apiDeleteJson<ApiResponse<void>>(`/leads/${leadId}`);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while deleting the lead');
  }
};

// Bulk operations
export const bulkUpdateLeadsApi = async (leadIds: string[], updates: Partial<Lead>): Promise<ApiResponse<void>> => {
  try {
    const data = await apiPostJson<ApiResponse<void>>('/leads/bulk-update', { leadIds, updates });
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating leads');
  }
};

export const bulkDeleteLeadsApi = async (leadIds: string[]): Promise<ApiResponse<void>> => {
  try {
    const data = await apiPostJson<ApiResponse<void>>('/leads/bulk-delete', { leadIds });
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while deleting leads');
  }
};

// Statistics - Overview API
export const getLeadsStatisticsApi = async (): Promise<ApiResponse<{
  totalLeads: number;
  activeLeads: number;
  completedLeads: number;
  failedLeads: number;
  conversionRate: string;
  completionRate: string;
  byStatus: {
    new: number;
    inProgress: number;
    completed: number;
    failed: number;
  };
  byType: {
    warm: number;
    cold: number;
    push: number;
    upsell: number;
  };
  today: {
    new: number;
    completed: number;
    inProgress: number;
  };
}>> => {
  try {
    console.log('Fetching leads statistics from: /leads/statistics/overview');

    const data = await apiGetJson<any>('/leads/statistics/overview');
    console.log('Statistics API raw data:', data);
    
    return {
      success: true,
      data: data,
      message: 'Statistics fetched successfully'
    };
  } catch (error) {
    console.error('Statistics API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching statistics');
  }
};

// Note: getEmployeesApi removed - use getFilterEmployeesApi instead

// Get sales units for filter dropdown
export const getSalesUnitsApi = async (): Promise<ApiResponse<Array<{ id: number; name: string }>>> => {
  try {
    console.log('Fetching sales units from: /leads/filter-options/sales-units');
    
    const data = await apiGetJson<any>('/leads/filter-options/sales-units');
    console.log('Sales units raw data:', data);
    
    // Ensure data is an array
    const salesUnitsData = Array.isArray(data) ? data : (data.data || data.salesUnits || []);
    console.log('Processed sales units data:', salesUnitsData);
    
    return {
      success: true,
      data: salesUnitsData,
      message: 'Sales units fetched successfully'
    };
  } catch (error) {
    console.error('Sales units API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching sales units');
  }
};

// Get user's assigned leads
export const getMyLeadsApi = async (
  page: number = 1, 
  limit: number = 20, 
  filters: {
    status?: string;
    type?: string;
    outcome?: string;
    salesUnitId?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<ApiResponse<Lead[]>> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type }),
      ...(filters.outcome && { outcome: filters.outcome }),
      ...(filters.salesUnitId && { salesUnitId: filters.salesUnitId.toString() }),
      ...(filters.search && { search: filters.search }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    });

    const data = await apiGetJson<any>(`/leads/my-leads?${queryParams.toString()}`);
    console.log('Raw GET my-leads response:', data);
    
    // Handle the response format from your backend
    let formattedResponse: ApiResponse<Lead[]>;
    
    if (data && typeof data === 'object' && 'leads' in data && Array.isArray(data.leads)) {
      formattedResponse = {
        success: true,
        data: data.leads as Lead[],
        message: 'My leads fetched successfully',
        pagination: {
          page: data.page || page,
          limit: data.limit || limit,
          total: data.total || 0,
          totalPages: data.totalPages || 1,
          hasNext: (data.page || page) < (data.totalPages || 1),
          hasPrev: (data.page || page) > 1
        }
      };
    } else {
      formattedResponse = {
        success: true,
        data: data as any,
        message: 'My leads fetched successfully'
      };
    }
    
    console.log('Formatted GET my-leads response:', formattedResponse);
    return formattedResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching my leads');
  }
};

// Request new leads
export const requestLeadApi = async (keptLeadIds: number[], includePushLeads: boolean = false): Promise<ApiResponse<{
  assignedLeads: Lead[];
  keptLeads: Lead[];
  totalActiveLeads: number;
  circulatedLeads: number;
  leadBreakdown: {
    warmColdLeads: number;
    pushLeads: number;
    totalAssigned: number;
  };
  includePushLeads: boolean;
}>> => {
  console.log('🚀 requestLeadApi called with:', {
    keptLeadIds,
    includePushLeads
  });
  
  try {
    console.log('🔐 Making API request...');
    const requestBody = {
      keptLeadIds,
      includePushLeads
    };
    
    console.log('📤 Request body:', requestBody);

    const data = await apiPostJson<any>('/leads/request', requestBody);
    console.log('✅ API Success:', data);
    
    return {
      success: true,
      data: data,
      message: 'Leads requested successfully'
    };
  } catch (error) {
    console.error('💥 requestLeadApi error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while requesting leads');
  }
};

// Get employees for filter dropdown (all employees or filtered by sales unit)
export const getFilterEmployeesApi = async (salesUnitId?: number): Promise<ApiResponse<Array<{ 
  id?: string | number; 
  employeeId?: string | number;
  userId?: string | number;
  _id?: string | number;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  [key: string]: any;
}>>> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (salesUnitId) {
      queryParams.append('salesUnitId', salesUnitId.toString());
    }

    const url = salesUnitId 
      ? `/leads/filter-options/employees?${queryParams.toString()}`
      : `/leads/filter-options/employees`;

    console.log('Fetching employees from:', url);

    const data = await apiGetJson<any>(url);
    console.log('Employees raw data:', data);
    
    // Ensure data is an array and handle different response formats
    let employeesData = [];
    if (Array.isArray(data)) {
      employeesData = data;
    } else if (data && typeof data === 'object') {
      employeesData = data.data || data.employees || data.users || data.results || [];
    }
    
    console.log('Employees processed:', employeesData.length, 'items');
    
    return {
      success: true,
      data: employeesData,
      message: 'Employees fetched successfully'
    };
  } catch (error) {
    console.error('Employees API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching employees');
  }
};

// Crack Lead API - Convert interested lead to cracked status
export interface CrackLeadRequest {
  status: 'cracked';
  comment: string;
  totalAmount: number;
  industryId: number;
  description: string;
  totalPhases: number;
  currentPhase: number;
}

export const crackLeadApi = async (leadId: string, crackData: CrackLeadRequest): Promise<ApiResponse<Lead>> => {
  try {
    console.log('Cracking lead:', leadId, 'with data:', crackData);

    const data = await apiPutJson<any>(`/leads/${leadId}`, crackData);
    console.log('Crack lead response:', data);
    
    return {
      success: true,
      data: data,
      message: data.message || 'Lead cracked successfully'
    };
  } catch (error) {
    console.error('Crack lead error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while cracking the lead');
  }
};

// Push Lead API - Push lead for senior sales rep attention
export interface PushLeadRequest {
  action: 'push';
  comment: string;
}

export const pushLeadApi = async (leadId: string, pushData: PushLeadRequest): Promise<ApiResponse<Lead>> => {
  try {
    console.log('Pushing lead:', leadId, 'with data:', pushData);

    const data = await apiPutJson<any>(`/leads/${leadId}`, pushData);
    console.log('Push lead response:', data);
    
    return {
      success: true,
      data: data,
      message: data.message || 'Lead pushed successfully'
    };
  } catch (error) {
    console.error('Push lead error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while pushing the lead');
  }
};

// Get cracked leads
export const getCrackedLeadsApi = async (
  page: number = 1, 
  limit: number = 20, 
  filters: {
    search?: string;
    industryId?: string;
    minAmount?: string;
    maxAmount?: string;
    closedBy?: string;
    currentPhase?: string;
    totalPhases?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<ApiResponse<any[]>> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.search && { search: filters.search }),
      ...(filters.industryId && { industryId: filters.industryId }),
      ...(filters.minAmount && { minAmount: filters.minAmount }),
      ...(filters.maxAmount && { maxAmount: filters.maxAmount }),
      ...(filters.closedBy && { closedBy: filters.closedBy }),
      ...(filters.currentPhase && { currentPhase: filters.currentPhase }),
      ...(filters.totalPhases && { totalPhases: filters.totalPhases }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    });

    console.log('Fetching cracked leads with filters:', filters);

    const data = await apiGetJson<any>(`/leads/cracked?${queryParams.toString()}`);
    console.log('Cracked leads response:', data);
    
    return {
      success: true,
      data: data.crackedLeads || data.data || data,
      message: 'Cracked leads fetched successfully',
      pagination: data.pagination
    };
  } catch (error) {
    console.error('Cracked leads API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching cracked leads');
  }
};

// Get archived leads
export const getArchivedLeadsApi = async (
  page: number = 1, 
  limit: number = 20, 
  filters: {
    search?: string;
    unitId?: string;  // Changed from salesUnitId to unitId for archived leads
    assignedTo?: string;
    source?: string;
    outcome?: string;
    qualityRating?: string;
    archivedFrom?: string;
    archivedTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<ApiResponse<any[]>> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.search && { search: filters.search }),
      ...(filters.unitId && { unitId: filters.unitId }),  // Changed to unitId
      ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
      ...(filters.source && { source: filters.source }),
      ...(filters.outcome && { outcome: filters.outcome }),
      ...(filters.qualityRating && { qualityRating: filters.qualityRating }),
      ...(filters.archivedFrom && { archivedFrom: filters.archivedFrom }),
      ...(filters.archivedTo && { archivedTo: filters.archivedTo }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    });

    console.log('Fetching archived leads with filters:', filters);

    const data = await apiGetJson<any>(`/leads/archived?${queryParams.toString()}`);
    console.log('Archived leads response:', data);
    
    return {
      success: true,
      data: data.archivedLeads || data.data || data,
      message: 'Archived leads fetched successfully',
      pagination: data.pagination
    };
  } catch (error) {
    console.error('Archived leads API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching archived leads');
  }
};

// Get single cracked lead details
export const getCrackedLeadApi = async (crackedLeadId: number): Promise<ApiResponse<any>> => {
  try {
    console.log('Fetching single cracked lead:', crackedLeadId);

    const data = await apiGetJson<any>(`/leads/cracked/${crackedLeadId}`);
    console.log('Single cracked lead response:', data);
    
    return {
      success: true,
      data: data,
      message: 'Cracked lead details fetched successfully'
    };
  } catch (error) {
    console.error('Single cracked lead API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching cracked lead details');
  }
};

// Payment API functions
export interface PaymentDetails {
  id: number;
  amount: number;
  transactionType: string;
  paymentMethod?: string;
  status: string;
  client?: {
    id: number;
    clientName: string;
    companyName?: string;
    email: string;
  };
  employee?: {
    id: number;
    name: string;
  };
}

export interface CompletePaymentRequest {
  paymentMethod?: string;
  category?: string;
}

export interface GeneratePaymentLinkRequest {
  leadId: number;
  clientName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  postalCode: string;
  amount: number;
  companyName?: string;
  type?: string;
  method?: string;
  clientId?: number;
}

export interface UpdatePaymentLinkRequest {
  clientName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  country?: string;
  state?: string;
  postalCode?: string;
  amount?: number;
  type?: string;
  method?: string;
}

// Generate payment link (creates transaction)
export const generatePaymentLinkApi = async (
  paymentData: GeneratePaymentLinkRequest
): Promise<ApiResponse<any>> => {
  try {
    console.log('Generating payment link with data:', paymentData);

    const data = await apiPostJson<any>('/leads/payment-link-generate', paymentData);
    console.log('Generate payment link response:', data);
    
    return {
      success: true,
      data: data,
      message: data.message || 'Payment link generated successfully'
    };
  } catch (error) {
    console.error('Generate payment link API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while generating payment link');
  }
};

// Get payment details by transaction ID
export const getPaymentDetailsApi = async (transactionId: number): Promise<ApiResponse<PaymentDetails>> => {
  try {
    console.log('Fetching payment details for transaction:', transactionId);

    const data = await apiGetJson<any>(`/leads/transaction/${transactionId}`);
    console.log('Payment details response:', data);
    
    return {
      success: true,
      data: data,
      message: 'Payment details fetched successfully'
    };
  } catch (error) {
    console.error('Get payment details API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching payment details');
  }
};

// Update payment link details
export const updatePaymentLinkApi = async (
  transactionId: number,
  updateData: UpdatePaymentLinkRequest
): Promise<ApiResponse<any>> => {
  try {
    console.log('Updating payment link for transaction:', transactionId, 'with data:', updateData);

    const data = await apiPatchJson<any>(`/leads/payment-link-generate/${transactionId}`, updateData);
    console.log('Update payment link response:', data);
    
    return {
      success: true,
      data: data,
      message: data.message || 'Payment link updated successfully'
    };
  } catch (error) {
    console.error('Update payment link API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating payment link');
  }
};

// Complete payment
export const completePaymentApi = async (
  transactionId: number,
  paymentData: CompletePaymentRequest = {}
): Promise<ApiResponse<any>> => {
  try {
    console.log('Completing payment for transaction:', transactionId, 'with data:', paymentData);

    const data = await apiPostJson<any>(`/leads/payment-link-complete/${transactionId}`, paymentData);
    console.log('Complete payment response:', data);
    
    return {
      success: true,
      data: data,
      message: data.message || 'Payment completed successfully'
    };
  } catch (error) {
    console.error('Complete payment API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while completing payment');
  }
};