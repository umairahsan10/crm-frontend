import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAccountantPermissions, useUpdateAccountantPermissions, useDeleteAccountantPermissions } from '../../../hooks/queries/useAdminSettingsQueries';
import AccountantPermissionsTable from './AccountantPermissionsTable';
import GenericAccountantPermissionsFilters from './GenericAccountantPermissionsFilters';
import { useNotification } from '../../../hooks/useNotification';
import type { AccountantPermissionsResponse } from '../../../apis/admin-settings';

const AccountantPermissionsTab: React.FC = () => {
  const notification = useNotification();
  const [limit] = useState(20);
  const [filters, setFilters] = useState({ search: '' });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<AccountantPermissionsResponse | null>(null);
  const [formData, setFormData] = useState({
    liabilitiesPermission: false,
    salaryPermission: false,
    salesPermission: false,
    invoicesPermission: false,
    expensesPermission: false,
    assetsPermission: false,
    revenuesPermission: false,
  });

  // Fetch all accountant permissions for client-side filtering
  const { data, isLoading } = useAccountantPermissions(1, 100, {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const updateMutation = useUpdateAccountantPermissions();
  const deleteMutation = useDeleteAccountantPermissions();

  // Client-side filtering
  const filteredPermissions = useMemo(() => {
    let filtered = data?.accountants || [];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((perm: AccountantPermissionsResponse) => {
        const employee = perm.employee;
        if (!employee) return false;
        const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
        const email = employee.email?.toLowerCase() || '';
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }

    return filtered;
  }, [data?.accountants, filters]);

  // Client-side pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
  });

  useEffect(() => {
    const totalItems = filteredPermissions.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    setPagination(prev => ({
      ...prev,
      totalPages,
      totalItems,
      // Reset to page 1 if current page is out of bounds
      currentPage: prev.currentPage > totalPages ? 1 : prev.currentPage
    }));
  }, [filteredPermissions.length, limit]);

  const paginatedPermissions = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredPermissions.slice(startIndex, endIndex);
  }, [filteredPermissions, pagination.currentPage, pagination.itemsPerPage]);

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPermission) return;
    try {
      await updateMutation.mutateAsync({ id: selectedPermission.id, data: formData });
      notification.show({ message: 'Accountant permissions updated successfully', type: 'success' });
      setEditModalOpen(false);
      setSelectedPermission(null);
    } catch (error: any) {
      notification.show({ message: error.message || 'Failed to update accountant permissions', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedPermission) return;
    try {
      await deleteMutation.mutateAsync(selectedPermission.id);
      notification.show({ message: 'Accountant permissions deleted successfully', type: 'success' });
      setDeleteConfirmOpen(false);
      setSelectedPermission(null);
    } catch (error: any) {
      notification.show({ message: error.message || 'Failed to delete accountant permissions', type: 'error' });
    }
  };

  const openEditModal = (permission: AccountantPermissionsResponse) => {
    setSelectedPermission(permission);
    setFormData({
      liabilitiesPermission: permission.liabilitiesPermission || false,
      salaryPermission: permission.salaryPermission || false,
      salesPermission: permission.salesPermission || false,
      invoicesPermission: permission.invoicesPermission || false,
      expensesPermission: permission.expensesPermission || false,
      assetsPermission: permission.assetsPermission || false,
      revenuesPermission: permission.revenuesPermission || false,
    });
    setEditModalOpen(true);
  };

  return (
    <div>
      {/* Filters */}
      <GenericAccountantPermissionsFilters
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Table */}
      <AccountantPermissionsTable
        accountantPermissions={paginatedPermissions}
        isLoading={isLoading}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={handlePageChange}
        onEdit={openEditModal}
        onDelete={(perm) => {
          setSelectedPermission(perm);
          setDeleteConfirmOpen(true);
        }}
      />

      {/* Edit Modal */}
      {editModalOpen && selectedPermission && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" onClick={() => setEditModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Edit Accountant Permissions</h3>
            </div>
            <form onSubmit={handleUpdate} className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.liabilitiesPermission} 
                    onChange={(e) => setFormData({ ...formData, liabilitiesPermission: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Liabilities Permission</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.salaryPermission} 
                    onChange={(e) => setFormData({ ...formData, salaryPermission: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Salary Permission</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.salesPermission} 
                    onChange={(e) => setFormData({ ...formData, salesPermission: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Sales Permission</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.invoicesPermission} 
                    onChange={(e) => setFormData({ ...formData, invoicesPermission: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Invoices Permission</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.expensesPermission} 
                    onChange={(e) => setFormData({ ...formData, expensesPermission: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Expenses Permission</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.assetsPermission} 
                    onChange={(e) => setFormData({ ...formData, assetsPermission: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Assets Permission</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.revenuesPermission} 
                    onChange={(e) => setFormData({ ...formData, revenuesPermission: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Revenues Permission</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmOpen && selectedPermission && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" onClick={() => setDeleteConfirmOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Delete Accountant Permissions</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-500">Are you sure you want to remove accountant permissions for this employee?</p>
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

export default AccountantPermissionsTab;
