import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useHrPermissions, useUpdateHrPermissions, useDeleteHrPermissions } from '../../../hooks/queries/useAdminSettingsQueries';
import HRPermissionsTable from './HRPermissionsTable';
import GenericHRPermissionsFilters from './GenericHRPermissionsFilters';
import { useNotification } from '../../../hooks/useNotification';
import type { HrPermissionsResponse } from '../../../apis/admin-settings';

const HRPermissionsTab: React.FC = () => {
  const notification = useNotification();
  const [limit] = useState(20);
  const [filters, setFilters] = useState({ search: '' });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<HrPermissionsResponse | null>(null);
  const [formData, setFormData] = useState({
    attendancePermission: false,
    salaryPermission: false,
    commissionPermission: false,
    employeeAddPermission: false,
    terminationsHandle: false,
    monthlyRequestApprovals: false,
    targetsSet: false,
    bonusesSet: false,
    shiftTimingSet: false,
  });

  // Fetch all HR permissions for client-side filtering
  const { data, isLoading } = useHrPermissions(1, 100, {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const updateMutation = useUpdateHrPermissions();
  const deleteMutation = useDeleteHrPermissions();

  // Client-side filtering
  const filteredPermissions = useMemo(() => {
    let filtered = data?.hrRecords || [];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((perm: HrPermissionsResponse) => {
        const employee = perm.employee;
        if (!employee) return false;
        const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
        const email = employee.email?.toLowerCase() || '';
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }

    return filtered;
  }, [data?.hrRecords, filters]);

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
      notification.show({ message: 'HR permissions updated successfully', type: 'success' });
      setEditModalOpen(false);
      setSelectedPermission(null);
    } catch (error: any) {
      notification.show({ message: error.message || 'Failed to update HR permissions', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedPermission) return;
    try {
      await deleteMutation.mutateAsync(selectedPermission.id);
      notification.show({ message: 'HR permissions deleted successfully', type: 'success' });
      setDeleteConfirmOpen(false);
      setSelectedPermission(null);
    } catch (error: any) {
      notification.show({ message: error.message || 'Failed to delete HR permissions', type: 'error' });
    }
  };

  const openEditModal = (permission: HrPermissionsResponse) => {
    setSelectedPermission(permission);
    setFormData({
      attendancePermission: permission.attendancePermission || false,
      salaryPermission: permission.salaryPermission || false,
      commissionPermission: permission.commissionPermission || false,
      employeeAddPermission: permission.employeeAddPermission || false,
      terminationsHandle: permission.terminationsHandle || false,
      monthlyRequestApprovals: permission.monthlyRequestApprovals || false,
      targetsSet: permission.targetsSet || false,
      bonusesSet: permission.bonusesSet || false,
      shiftTimingSet: permission.shiftTimingSet || false,
    });
    setEditModalOpen(true);
  };

  return (
    <div>
      {/* Filters */}
      <GenericHRPermissionsFilters
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Table */}
      <HRPermissionsTable
        hrPermissions={paginatedPermissions}
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
              <h3 className="text-lg font-medium text-gray-900">Edit HR Permissions</h3>
            </div>
            <form onSubmit={handleUpdate} className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.attendancePermission} 
                    onChange={(e) => setFormData({ ...formData, attendancePermission: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Attendance Permission</span>
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
                    checked={formData.commissionPermission} 
                    onChange={(e) => setFormData({ ...formData, commissionPermission: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Commission Permission</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.employeeAddPermission} 
                    onChange={(e) => setFormData({ ...formData, employeeAddPermission: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Employee Add Permission</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.terminationsHandle} 
                    onChange={(e) => setFormData({ ...formData, terminationsHandle: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Terminations Handle</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.monthlyRequestApprovals} 
                    onChange={(e) => setFormData({ ...formData, monthlyRequestApprovals: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Monthly Request Approvals</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.targetsSet} 
                    onChange={(e) => setFormData({ ...formData, targetsSet: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Targets Set</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.bonusesSet} 
                    onChange={(e) => setFormData({ ...formData, bonusesSet: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Bonuses Set</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.shiftTimingSet} 
                    onChange={(e) => setFormData({ ...formData, shiftTimingSet: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Shift Timing Set</span>
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
              <h3 className="text-lg font-medium text-gray-900">Delete HR Permissions</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-500">Are you sure you want to remove HR permissions for this employee?</p>
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

export default HRPermissionsTab;
