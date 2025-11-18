import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRoles, useCreateRole, useDeleteRole } from '../../../hooks/queries/useAdminSettingsQueries';
import RolesTable from './RolesTable';
import GenericRolesFilters from './GenericRolesFilters';
import { useNotification } from '../../../hooks/useNotification';
import type { RoleResponse, RoleName } from '../../../apis/admin-settings';

const RolesTab: React.FC = () => {
  const notification = useNotification();
  const [limit] = useState(20);
  const [filters, setFilters] = useState({ search: '' });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);
  const [formData, setFormData] = useState({ name: 'dep_manager' as RoleName, description: '' });

  const roleOptions: { value: RoleName; label: string }[] = [
    { value: 'dep_manager', label: 'Department Manager' },
    { value: 'team_lead', label: 'Team Lead' },
    { value: 'senior', label: 'Senior' },
    { value: 'junior', label: 'Junior' },
    { value: 'unit_head', label: 'Unit Head' },
  ];

  // Fetch all roles for client-side filtering
  const { data, isLoading } = useRoles(1, 100, undefined, {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const createMutation = useCreateRole();
  const deleteMutation = useDeleteRole();

  // Client-side filtering
  const filteredRoles = useMemo(() => {
    let filtered = data?.roles || [];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((role: RoleResponse) =>
        role.name.toLowerCase().includes(searchLower) ||
        (role.description && role.description.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [data?.roles, filters]);

  // Client-side pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
  });

  useEffect(() => {
    const totalItems = filteredRoles.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    setPagination(prev => ({
      ...prev,
      totalPages,
      totalItems,
      // Reset to page 1 if current page is out of bounds
      currentPage: prev.currentPage > totalPages ? 1 : prev.currentPage
    }));
  }, [filteredRoles.length, limit]);

  const paginatedRoles = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredRoles.slice(startIndex, endIndex);
  }, [filteredRoles, pagination.currentPage, pagination.itemsPerPage]);

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ search: '' });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      notification.show({ message: 'Role created successfully', type: 'success' });
      setCreateModalOpen(false);
      setFormData({ name: 'dep_manager', description: '' });
    } catch (error: any) {
      notification.show({ message: error.message || 'Failed to create role', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    try {
      await deleteMutation.mutateAsync(selectedRole.id);
      notification.show({ message: 'Role deleted successfully', type: 'success' });
      setDeleteConfirmOpen(false);
      setSelectedRole(null);
    } catch (error: any) {
      notification.show({ message: error.message || 'Failed to delete role', type: 'error' });
    }
  };

  return (
    <div>
      {/* Filters */}
      <GenericRolesFilters
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        onCreateClick={() => setCreateModalOpen(true)}
      />

      {/* Table */}
      <RolesTable
        roles={paginatedRoles}
        isLoading={isLoading}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={handlePageChange}
        onRoleClick={(role: RoleResponse) => {
          setSelectedRole(role);
          setDeleteConfirmOpen(true);
        }}
      />

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" onClick={() => setCreateModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create Role</h3>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                <select 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value as RoleName })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmOpen && selectedRole && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" onClick={() => setDeleteConfirmOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Delete Role</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-500">Are you sure you want to delete this role?</p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setDeleteConfirmOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700" disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesTab;
