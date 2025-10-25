/**
 * Clients Management Page - Optimized with React Query
 * Follows EXACT same structure as LeadsManagementPage
 */

import React, { useState, useCallback } from 'react';
import { 
  ClientsTable, 
  ClientDetailsDrawer, 
  BulkActions, 
  ClientsStatistics,
  AddClientModal
} from '../../components/clients';
import GenericClientsFilters from '../../components/clients/GenericClientsFilters';
import { 
  useClients, 
  useClientsStatistics,
  useBulkUpdateClients,
  useBulkDeleteClients
} from '../../hooks/queries/useClientsQueries';
import type { Client } from '../../types';

const ClientsManagementPage: React.FC = () => {
  // State management
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Filter state - Updated to match API parameters
  const [filters, setFilters] = useState({
    search: '',
    accountStatus: '',
    clientType: '',
    phone: '',
    industryId: '',
    createdBy: '',
    createdAfter: '',
    createdBefore: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // React Query hooks - Data fetching with automatic caching
  const clientsQuery = useClients(
    pagination.currentPage,
    pagination.itemsPerPage,
    filters
  );
  const statisticsQuery = useClientsStatistics();

  // Mutation hooks for CRUD operations
  const bulkUpdateClientsMutation = useBulkUpdateClients();
  const bulkDeleteClientsMutation = useBulkDeleteClients();

  // Extract data and loading states from queries
  const clients = (clientsQuery.data as any)?.data || [];
  const statistics = (statisticsQuery.data as any)?.data || {
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    prospect: 0
  };
  const isLoading = clientsQuery.isLoading;

  // Update pagination when React Query data changes
  React.useEffect(() => {
    if (clientsQuery.data) {
      const data = clientsQuery.data as any;
      const paginationData = data.pagination || data;
      setPagination(prev => ({
        ...prev,
        currentPage: paginationData.page || prev.currentPage,
        totalPages: paginationData.totalPages || prev.totalPages,
        totalItems: paginationData.total || prev.totalItems,
      }));
    }
  }, [clientsQuery.data]);

  // Handlers
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
  };

  const handleBulkSelect = (clientIds: string[]) => {
    setSelectedClients(clientIds);
  };

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 on filter change
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      accountStatus: '',
      clientType: '',
      phone: '',
      industryId: '',
      createdBy: '',
      createdAfter: '',
      createdBefore: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleBulkAssign = async (clientIds: string[], assignedTo: string) => {
    try {
      await bulkUpdateClientsMutation.mutateAsync({
        clientIds,
        updates: { assignedTo }
      });
      setNotification({
        type: 'success',
        message: `Successfully assigned ${clientIds.length} clients to ${assignedTo}`
      });
      setTimeout(() => setNotification(null), 3000);
      setSelectedClients([]);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to assign clients'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleBulkStatusChange = async (clientIds: string[], status: string) => {
    try {
      await bulkUpdateClientsMutation.mutateAsync({
        clientIds,
        updates: { accountStatus: status }
      });
      setNotification({
        type: 'success',
        message: `Successfully updated status for ${clientIds.length} clients`
      });
      setTimeout(() => setNotification(null), 3000);
      setSelectedClients([]);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to update client status'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleBulkDelete = async (clientIds: string[]) => {
    try {
      await bulkDeleteClientsMutation.mutateAsync(clientIds);
      setNotification({
        type: 'success',
        message: `Successfully deleted ${clientIds.length} clients`
      });
      setTimeout(() => setNotification(null), 3000);
      setSelectedClients([]);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to delete clients'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
            <ClientsStatistics 
              statistics={statistics} 
              isLoading={statisticsQuery.isLoading} 
            />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <GenericClientsFilters
            onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
        </div>

        {/* Bulk Actions */}
        <BulkActions
          selectedClients={selectedClients}
          onBulkAssign={handleBulkAssign}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedClients([])}
          employees={[]}
        />

        {/* Clients Table */}
        <ClientsTable
          clients={clients}
          isLoading={isLoading}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
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
          onClientCreated={() => {
            setNotification({
              type: 'success',
              message: 'Client created successfully!'
            });
            setTimeout(() => setNotification(null), 3000);
            setShowAddClientModal(false);
            // React Query will automatically refetch
          }}
        />

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
            notification.type === 'success' ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'
          }`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
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
                    onClick={() => setNotification(null)}
                    className={`bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      notification.type === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'
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
