import { apiGetJson, apiPostJson, apiPutJson, apiDeleteJson, apiPatchJson } from '../utils/apiClient';

export interface Company {
    monthlyLeaveAccrual?: number;
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  createdAt: string;
  updatedAt: string;
  quarterlyLeavesDays: number;
  monthlyLatesDays: number;
  absentDeduction: number;
  lateDeduction: number;
  halfDeduction: number;
  taxId: string;
  lateTime: number;
  halfTime: number;
  absentTime: number;
  status: 'active' | 'inactive';
  // Additional fields for UI compatibility
  industry?: string;
  size?: string;
  type?: string;
  location?: string;
  revenue?: string;
  employees?: number;
  founded?: string;
  description?: string;
  assignedTo?: string;
}

export interface CompanyFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  country?: string;
  name?: string;
}

export interface CompanyResponse {
  companies: Company[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Get all companies with pagination
export const getCompaniesApi = async (filters: CompanyFilters = {}): Promise<CompanyResponse> => {
  const params = new URLSearchParams();
  
  // Pass page, limit, and status parameters
  params.append('page', (filters.page || 1).toString());
  params.append('limit', (filters.limit || 20).toString());
  
  if (filters.status) {
    params.append('status', filters.status);
  }

  const url = `/company?${params.toString()}`;
  console.log('🔍 Company API URL:', url);
  console.log('🔍 Company API Params:', Object.fromEntries(params.entries()));
  console.log('🔍 Company API Filters:', filters);

  return apiGetJson<CompanyResponse>(url);
};

// Get company by ID
export const getCompanyByIdApi = async (id: number): Promise<Company> => {
  return apiGetJson<Company>(`/company/${id}`);
};

// Create new company
export const createCompanyApi = async (companyData: Partial<Company>): Promise<Company> => {
  return apiPostJson<Company>('/company', companyData);
};

// Update company
export const updateCompanyApi = async (id: number, companyData: Partial<Company>): Promise<Company> => {
  return apiPutJson<Company>(`/company/${id}`, companyData);
};

// Delete company
export const deleteCompanyApi = async (id: number): Promise<void> => {
  await apiDeleteJson(`/company/${id}`);
};

// Bulk update companies
export const bulkUpdateCompaniesApi = async (ids: number[], updateData: Partial<Company>): Promise<void> => {
  await apiPatchJson('/company/bulk', { ids, updateData });
};

// Bulk delete companies
export const bulkDeleteCompaniesApi = async (ids: number[]): Promise<void> => {
  await apiPostJson('/company/bulk-delete', { ids });
};

// Get company statistics
export const getCompanyStatisticsApi = async (): Promise<{
  total: number;
  active: number;
  inactive: number;
  byCountry: { [key: string]: number };
  byStatus: { [key: string]: number };
}> => {
  try {
    console.log('🔍 Company Statistics API URL: /company/statistics');
    // Try the statistics endpoint first
    return await apiGetJson('/company/statistics');
  } catch (error) {
    console.warn('Company statistics endpoint not available, using fallback');
    console.log('🔍 Statistics API Error:', error);
    // Fallback: calculate statistics from the companies list
    const companies = await getCompaniesApi({ page: 1, limit: 1000 });
    const total = companies.companies.length;
    const active = companies.companies.filter(c => c.status === 'active').length;
    const inactive = companies.companies.filter(c => c.status === 'inactive').length;
    
    // Calculate by country
    const byCountry: { [key: string]: number } = {};
    companies.companies.forEach(company => {
      const country = company.country || 'Unknown';
      byCountry[country] = (byCountry[country] || 0) + 1;
    });
    
    // Calculate by status
    const byStatus: { [key: string]: number } = {};
    companies.companies.forEach(company => {
      const status = company.status || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });
    
    return {
      total,
      active,
      inactive,
      byCountry,
      byStatus
    };
  }
};