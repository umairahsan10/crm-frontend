import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDepartments, useCreateDepartment, useDeleteDepartment } from '../../../hooks/queries/useAdminSettingsQueries';
import DepartmentsTable from './DepartmentsTable';
import GenericDepartmentsFilters from './GenericDepartmentsFilters';
import { useNotification } from '../../../hooks/useNotification';
import type { DepartmentResponse } from '../../../apis/admin-settings';

const DepartmentsTab: React.FC = () => {
  const notification = useNotification();
  const [limit] = useState(20);
  const [filters, setFilters] = useState({ search: '' });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<DepartmentResponse | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', managerId: undefined as number | undefined });

  // Fetch all departments for client-side filtering
  const { data, isLoading } = useDepartments(1, 100, undefined, {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const createMutation = useCreateDepartment();
  const deleteMutation = useDeleteDepartment();

  // Client-side filtering
  const filteredDepartments = useMemo(() => {
    let filtered = data?.departments || [];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((dept: DepartmentResponse) =>
        dept.name.toLowerCase().includes(searchLower) ||
        (dept.description && dept.description.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [data?.departments, filters]);

  // Client-side pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
  });

  useEffect(() => {
    const totalItems = filteredDepartments.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    setPagination(prev => ({
      ...prev,
      totalPages,
      totalItems,
      // Reset to page 1 if current page is out of bounds
      currentPage: prev.currentPage > totalPages ? 1 : prev.currentPage
    }));
  }, [filteredDepartments.length, limit]);

  const paginatedDepartments = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredDepartments.slice(startIndex, endIndex);
  }, [filteredDepartments, pagination.currentPage, pagination.itemsPerPage]);

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
      notification.show({ message: 'Department created successfully', type: 'success' });
      setCreateModalOpen(false);
      setFormData({ name: '', description: '', managerId: undefined });
    } catch (error: any) {
      notification.show({ message: error.message || 'Failed to create department', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedDept) return;
    try {
      await deleteMutation.mutateAsync(selectedDept.id);
      notification.show({ message: 'Department deleted successfully', type: 'success' });
      setDeleteConfirmOpen(false);
      setSelectedDept(null);
    } catch (error: any) {
      notification.show({ message: error.message || 'Failed to delete department', type: 'error' });
    }
  };

  return (
    <div>
      {/* Filters */}
      <GenericDepartmentsFilters
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        onCreateClick={() => setCreateModalOpen(true)}
      />

      {/* Table - Skeleton loader is built into DynamicTable */}
      <DepartmentsTable
        departments={paginatedDepartments}
        isLoading={isLoading}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={handlePageChange}
        onDepartmentClick={(dept: DepartmentResponse) => {
          setSelectedDept(dept);
          setDeleteConfirmOpen(true);
        }}
      />

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" onClick={() => setCreateModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create Department</h3>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
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
      {deleteConfirmOpen && selectedDept && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" onClick={() => setDeleteConfirmOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Delete Department</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-500">Are you sure you want to delete {selectedDept.name}?</p>
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

export default DepartmentsTab;
