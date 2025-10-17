/**
 * Clients API - Mock implementation (ready for backend integration)
 * TODO: Replace mock data with real API calls when backend is ready
 */

import type { Client, ClientStatistics } from '../types';

export interface GetClientsDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  industry?: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ClientsResponse {
  data: Client[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClientStatisticsResponse {
  data: ClientStatistics;
}

/**
 * Get clients with pagination and filters
 * TODO: Replace with real API call
 */
export const getClientsApi = async (query: GetClientsDto = {}): Promise<ClientsResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock data (same as in ClientsManagementPage)
  const mockClients: Client[] = [
    {
      id: '1',
      clientType: 'enterprise',
      companyName: 'TechCorp Inc.',
      clientName: 'John Smith',
      email: 'john.smith@techcorp.com',
      phone: '+1-555-0123',
      altPhone: '+1-555-0124',
      address: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'USA',
      industryId: 1,
      industry: 'Technology',
      taxId: 'TAX123456',
      accountStatus: 'active',
      notes: 'High-value enterprise client',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:45:00Z',
      assignedTo: 'John Doe',
      salesUnitId: 1,
      lastContactDate: '2024-01-20T14:45:00Z',
      totalRevenue: 150000,
      satisfactionScore: 4.8
    },
    // Add more mock clients as needed
  ];

  // Apply filters (basic implementation)
  let filtered = [...mockClients];
  
  if (query.search) {
    const searchLower = query.search.toLowerCase();
    filtered = filtered.filter(c => 
      c.clientName.toLowerCase().includes(searchLower) ||
      c.companyName?.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower)
    );
  }

  if (query.status) {
    filtered = filtered.filter(c => c.accountStatus === query.status);
  }

  if (query.type) {
    filtered = filtered.filter(c => c.clientType === query.type);
  }

  // Pagination
  const page = query.page || 1;
  const limit = query.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    data: paginated,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit)
  };
};

/**
 * Get clients statistics
 * TODO: Replace with real API call
 */
export const getClientsStatisticsApi = async (): Promise<ClientStatisticsResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    data: {
      totalClients: 150,
      activeClients: 120,
      prospectClients: 20,
      inactiveClients: 8,
      churnedClients: 2,
      totalRevenue: 5000000,
      averageSatisfaction: 4.5,
      byStatus: {
        prospect: 20,
        active: 120,
        inactive: 8,
        suspended: 0,
        churned: 2
      },
      byType: {
        individual: 30,
        enterprise: 50,
        smb: 60,
        startup: 10
      },
      byIndustry: {
        technology: 60,
        healthcare: 30,
        finance: 25,
        retail: 20,
        manufacturing: 10,
        education: 3,
        other: 2
      },
      today: {
        new: 5,
        contacted: 12,
        converted: 3
      }
    }
  };
};

/**
 * Create new client
 * TODO: Replace with real API call
 */
export const createClientApi = async (clientData: Partial<Client>): Promise<Client> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newClient: Client = {
    id: Date.now().toString(),
    ...clientData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Client;

  return newClient;
};

/**
 * Update existing client
 * TODO: Replace with real API call
 */
export const updateClientApi = async (id: string, clientData: Partial<Client>): Promise<Client> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const updatedClient: Client = {
    id,
    ...clientData,
    updatedAt: new Date().toISOString(),
  } as Client;

  return updatedClient;
};

/**
 * Delete client
 * TODO: Replace with real API call
 */
export const deleteClientApi = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Client deleted:', id);
};

