import React, { useState, useEffect } from 'react';
import { 
  ClientsTable, 
  ClientsFilters, 
  ClientDetailsDrawer, 
  BulkActions, 
  ClientsStatistics,
  AddClientModal
} from '../../components/clients';
import type { Client, ClientStatistics } from '../../types';

const ClientsManagementPage: React.FC = () => {
  // State management
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    industry: '',
    assignedTo: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Data state
  const [employees, setEmployees] = useState<Array<{ 
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
  }>>([]);
  const [statistics, setStatistics] = useState<ClientStatistics>({
    totalClients: 0,
    activeClients: 0,
    prospectClients: 0,
    inactiveClients: 0,
    churnedClients: 0,
    totalRevenue: 0,
    averageSatisfaction: 0,
    byStatus: {
      prospect: 0,
      active: 0,
      inactive: 0,
      suspended: 0,
      churned: 0
    },
    byType: {
      individual: 0,
      enterprise: 0,
      smb: 0,
      startup: 0
    },
    byIndustry: {
      technology: 0,
      healthcare: 0,
      finance: 0,
      retail: 0,
      manufacturing: 0,
      education: 0,
      other: 0
    },
    today: {
      new: 0,
      contacted: 0,
      converted: 0
    }
  });

  // Mock dummy data
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
      notes: 'High-value enterprise client with multiple projects',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:45:00Z',
      assignedTo: 'John Doe',
      salesUnitId: 1,
      lastContactDate: '2024-01-20T14:45:00Z',
      totalRevenue: 150000,
      satisfactionScore: 4.8
    },
    {
      id: '2',
      clientType: 'smb',
      companyName: 'HealthPlus Clinic',
      clientName: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@healthplus.com',
      phone: '+1-555-0456',
      address: '456 Medical Blvd',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'USA',
      industryId: 2,
      industry: 'Healthcare',
      taxId: 'TAX789012',
      accountStatus: 'prospect',
      notes: 'Potential client interested in our healthcare solutions',
      createdAt: '2024-01-18T09:15:00Z',
      updatedAt: '2024-01-18T09:15:00Z',
      assignedTo: 'Jane Smith',
      salesUnitId: 2,
      totalRevenue: 0,
      satisfactionScore: 0
    },
    {
      id: '3',
      clientType: 'individual',
      companyName: '',
      clientName: 'Mike Wilson',
      email: 'mike.wilson@email.com',
      phone: '+1-555-0789',
      address: '789 Personal Ave',
      city: 'Austin',
      state: 'TX',
      postalCode: '73301',
      country: 'USA',
      industryId: 3,
      industry: 'Finance',
      accountStatus: 'active',
      notes: 'Individual client with personal investment needs',
      createdAt: '2024-01-10T16:20:00Z',
      updatedAt: '2024-01-19T11:30:00Z',
      assignedTo: 'Bob Johnson',
      salesUnitId: 1,
      lastContactDate: '2024-01-19T11:30:00Z',
      totalRevenue: 25000,
      satisfactionScore: 4.5
    },
    {
      id: '4',
      clientType: 'startup',
      companyName: 'InnovateStart',
      clientName: 'Emily Davis',
      email: 'emily.davis@innovatestart.com',
      phone: '+1-555-0321',
      altPhone: '+1-555-0322',
      address: '321 Startup Lane',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'USA',
      industryId: 1,
      industry: 'Technology',
      taxId: 'TAX456789',
      accountStatus: 'inactive',
      notes: 'Startup client, temporarily inactive due to funding issues',
      createdAt: '2024-01-05T08:45:00Z',
      updatedAt: '2024-01-15T13:20:00Z',
      assignedTo: 'Alice Brown',
      salesUnitId: 3,
      lastContactDate: '2024-01-15T13:20:00Z',
      totalRevenue: 5000,
      satisfactionScore: 3.2
    },
    {
      id: '5',
      clientType: 'enterprise',
      companyName: 'Global Manufacturing Co.',
      clientName: 'Robert Chen',
      email: 'robert.chen@globalmfg.com',
      phone: '+1-555-0654',
      address: '654 Industrial Way',
      city: 'Detroit',
      state: 'MI',
      postalCode: '48201',
      country: 'USA',
      industryId: 5,
      industry: 'Manufacturing',
      taxId: 'TAX987654',
      accountStatus: 'churned',
      notes: 'Former client who switched to competitor',
      createdAt: '2023-12-01T12:00:00Z',
      updatedAt: '2024-01-10T10:15:00Z',
      assignedTo: 'Tom Wilson',
      salesUnitId: 1,
      lastContactDate: '2024-01-10T10:15:00Z',
      totalRevenue: 75000,
      satisfactionScore: 2.1
    }
  ];

  // Mock statistics data
  const mockStatistics: ClientStatistics = {
    totalClients: 5,
    activeClients: 2,
    prospectClients: 1,
    inactiveClients: 1,
    churnedClients: 1,
    totalRevenue: 255000,
    averageSatisfaction: 3.7,
    byStatus: {
      prospect: 1,
      active: 2,
      inactive: 1,
      suspended: 0,
      churned: 1
    },
    byType: {
      individual: 1,
      enterprise: 2,
      smb: 1,
      startup: 1
    },
    byIndustry: {
      technology: 2,
      healthcare: 1,
      finance: 1,
      retail: 0,
      manufacturing: 1,
      education: 0,
      other: 0
    },
    today: {
      new: 0,
      contacted: 1,
      converted: 0
    }
  };

  // Mock employees data
  const mockEmployees = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Bob Johnson' },
    { id: '4', name: 'Alice Brown' },
    { id: '5', name: 'Tom Wilson' }
  ];

  // Fetch clients with current filters (mock implementation)
  const fetchClients = async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock filtering logic
      let filteredClients = [...mockClients];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredClients = filteredClients.filter(client => 
          client.clientName.toLowerCase().includes(searchLower) ||
          client.companyName?.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.phone.includes(searchLower)
        );
      }
      
      if (filters.status) {
        filteredClients = filteredClients.filter(client => client.accountStatus === filters.status);
      }
      
      if (filters.type) {
        filteredClients = filteredClients.filter(client => client.clientType === filters.type);
      }
      
      if (filters.industry) {
        filteredClients = filteredClients.filter(client => client.industry?.toLowerCase() === filters.industry);
      }
      
      // Mock pagination
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedClients = filteredClients.slice(startIndex, endIndex);
      
      setClients(paginatedClients);
      setTotalPages(Math.ceil(filteredClients.length / itemsPerPage));
      setTotalItems(filteredClients.length);
      setCurrentPage(page);
      
    } catch (error) {
      console.error('Error fetching clients:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load clients'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics (mock implementation)
  const fetchStatistics = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setStatistics(mockStatistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchClients();
    fetchStatistics();
    setEmployees(mockEmployees);
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchClients(1);
  }, [filters]);

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchClients(page);
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
  };

  const handleBulkSelect = (clientIds: string[]) => {
    console.log('handleBulkSelect called:', { clientIds });
    setSelectedClients(clientIds);
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleTypeFilter = (type: string) => {
    setFilters(prev => ({ ...prev, type }));
  };

  const handleIndustryFilter = (industry: string) => {
    setFilters(prev => ({ ...prev, industry }));
  };


  const handleAssignedToFilter = (assignedTo: string) => {
    setFilters(prev => ({ ...prev, assignedTo }));
  };

  const handleDateRangeFilter = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      type: '',
      industry: '',
      assignedTo: '',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const handleBulkAssign = async (clientIds: string[], assignedTo: string) => {
    try {
      console.log('handleBulkAssign called:', { clientIds, assignedTo });
      // Mock bulk assign
      setNotification({
        type: 'success',
        message: `Successfully assigned ${clientIds.length} clients to employee ${assignedTo}`
      });
      setSelectedClients([]);
      fetchClients(currentPage);
    } catch (error) {
      console.error('Error in handleBulkAssign:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to assign clients'
      });
    }
  };

  const handleBulkStatusChange = async (clientIds: string[], status: string) => {
    try {
      console.log('handleBulkStatusChange called:', { clientIds, status });
      // Mock bulk status change
      setNotification({
        type: 'success',
        message: `Successfully updated status to ${status} for ${clientIds.length} clients`
      });
      setSelectedClients([]);
      fetchClients(currentPage);
    } catch (error) {
      console.error('Error in handleBulkStatusChange:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update clients'
      });
    }
  };

  const handleBulkDelete = async (clientIds: string[]) => {
    try {
      console.log('handleBulkDelete called:', { clientIds });
      // Mock bulk delete
      setNotification({
        type: 'success',
        message: `Successfully deleted ${clientIds.length} clients`
      });
      setSelectedClients([]);
      fetchClients(currentPage);
    } catch (error) {
      console.error('Error in handleBulkDelete:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete clients'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleClientCreated = (newClient: Client) => {
    // Add the new client to the beginning of the list
    setClients(prev => [newClient, ...prev]);
    
    // Update total items count
    setTotalItems(prev => prev + 1);
    
    // Show success notification
    setNotification({
      type: 'success',
      message: 'Client created successfully!'
    });
    
    // Close modal
    setShowAddClientModal(false);
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clients Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage and track your clients with advanced filtering and bulk operations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showStatistics ? 'Hide Stats' : 'Show Stats'}
              </button>
              <button
                onClick={() => setShowAddClientModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Client
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {showStatistics && (
          <div className="mb-8">
            <ClientsStatistics statistics={statistics} isLoading={false} />
          </div>
        )}

        {/* Filters */}
        <ClientsFilters
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onTypeFilter={handleTypeFilter}
          onIndustryFilter={handleIndustryFilter}
          onAssignedToFilter={handleAssignedToFilter}
          onDateRangeFilter={handleDateRangeFilter}
          onClearFilters={handleClearFilters}
        />

        {/* Bulk Actions */}
        <BulkActions
          selectedClients={selectedClients}
          onBulkAssign={handleBulkAssign}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedClients([])}
          employees={employees}
        />

        {/* Clients Table */}
        <ClientsTable
          clients={clients}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onClientClick={handleClientClick}
          onBulkSelect={handleBulkSelect}
          selectedClients={selectedClients}
        />

        {/* Client Details Drawer */}
        <ClientDetailsDrawer
          client={selectedClient}
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          onClientUpdated={(updatedClient) => {
            setClients(prev => prev.map(client => 
              client.id === updatedClient.id ? updatedClient : client
            ));
            setSelectedClient(updatedClient);
            setNotification({
              type: 'success',
              message: 'Client updated successfully!'
            });
            setTimeout(() => setNotification(null), 3000);
          }}
        />

        {/* Add Client Modal */}
        <AddClientModal
          isOpen={showAddClientModal}
          onClose={() => setShowAddClientModal(false)}
          onClientCreated={handleClientCreated}
        />

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className={`text-sm font-medium ${
                    notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={handleCloseNotification}
                    className={`rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      notification.type === 'success' 
                        ? 'bg-green-50 hover:bg-green-100 focus:ring-green-500' 
                        : 'bg-red-50 hover:bg-red-100 focus:ring-red-500'
                    }`}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsManagementPage;
