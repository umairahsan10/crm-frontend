import React, { useState, useCallback } from 'react';
import ProductionUnitsTable from '../../components/production/units/ProductionUnitsTable';
import GenericProductionUnitsFilters from '../../components/production/units/GenericProductionUnitsFilters';
import ProductionUnitDetailsDrawer from '../../components/production/units/ProductionUnitDetailsDrawer';
import CreateUnitForm from '../../components/production/units/CreateUnitForm';
import { 
  useProductionUnits,
  useAvailableUnitHeads,
  useCreateProductionUnit,
  useUpdateProductionUnit
} from '../../hooks/queries/useProductionUnitsQueries';
import type { Unit } from '../../types/production/units';

const ProductionUnitsManagementPage: React.FC = () => {
  
  // UI State management
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [unitToEdit, setUnitToEdit] = useState<Unit | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    hasHead: '',
    hasTeams: '',
    hasProjects: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });


  // Fetch data with current filters and pagination
  const { 
    data: unitsData, 
    isLoading: isLoadingUnits
  } = useProductionUnits(pagination.currentPage, pagination.itemsPerPage, filters);

  const { 
    data: availableHeadsData
  } = useAvailableUnitHeads();

  // Mutations
  const createUnitMutation = useCreateProductionUnit();
  const updateUnitMutation = useUpdateProductionUnit();

  // Update pagination when data changes
  React.useEffect(() => {
    if (unitsData && typeof unitsData === 'object' && 'data' in unitsData && unitsData.data) {
      const data = unitsData.data as any[];
      setPagination(prev => ({
        ...prev,
        totalItems: (unitsData as any).pagination?.total || data.length,
        totalPages: (unitsData as any).pagination?.totalPages || 1
      }));
    }
  }, [unitsData]);

  // Event handlers
  const handleUnitClick = useCallback((unit: Unit) => {
    setSelectedUnit(unit);
  }, []);


  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      hasHead: '',
      hasTeams: '',
      hasProjects: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleCreateUnit = useCallback(async (unitData: any) => {
    try {
      await createUnitMutation.mutateAsync(unitData);
      setShowCreateForm(false);
      setNotification({ type: 'success', message: 'Production unit created successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to create production unit' });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [createUnitMutation]);

  const handleUpdateUnit = useCallback(async (unitId: number, unitData: any) => {
    try {
      await updateUnitMutation.mutateAsync({ id: unitId, unitData });
      setUnitToEdit(null);
      setNotification({ type: 'success', message: 'Production unit updated successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to update production unit' });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [updateUnitMutation]);



  const units = (unitsData && typeof unitsData === 'object' && 'data' in unitsData) ? (unitsData.data as Unit[]) : [];
  const availableHeads = (availableHeadsData && typeof availableHeadsData === 'object' && 'data' in availableHeadsData && availableHeadsData.data && typeof availableHeadsData.data === 'object' && 'heads' in availableHeadsData.data) ? (availableHeadsData.data as any).heads : [];

  return (
    <div className="production-units-management-page p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Production Units Management</h1>
            <p className="text-gray-600 mt-1">
              Manage production units, teams, and employees
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Unit
            </button>
          </div>
        </div>
      </div>


      {/* Filters */}
      <GenericProductionUnitsFilters
        showFilters={{
          hasHead: true,
          hasTeams: true,
          hasProjects: true,
          sortBy: true
        }}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        availableHeads={availableHeads}
        searchPlaceholder="Search production units by name..."
        theme={{
          primary: 'bg-blue-600',
          secondary: 'hover:bg-blue-700',
          ring: 'ring-blue-500',
          bg: 'bg-blue-100',
          text: 'text-blue-800'
        }}
      />


      {/* Table */}
      <ProductionUnitsTable
        units={units}
        isLoading={isLoadingUnits}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={handlePageChange}
        onUnitClick={handleUnitClick}
      />

      {/* Create Unit Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateForm(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <CreateUnitForm
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                onSubmit={handleCreateUnit}
                loading={createUnitMutation.isPending}
                error={createUnitMutation.error?.message || null}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Unit Modal */}
      {unitToEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setUnitToEdit(null)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Production Unit</h3>
                <p className="text-sm text-gray-500">Edit form would go here...</p>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setUnitToEdit(null)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Unit Modal */}
      {unitToEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setUnitToEdit(null)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Edit Production Unit
                    </h3>
                    <CreateUnitForm
                      isOpen={true}
                      onSubmit={(data) => handleUpdateUnit(unitToEdit.id, data)}
                      onClose={() => setUnitToEdit(null)}
                      loading={false}
                      error={null}
                      initialData={unitToEdit}
                      availableHeads={availableHeads}
                      isEditing={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unit Details Drawer */}
      <ProductionUnitDetailsDrawer
        unit={selectedUnit}
        isOpen={!!selectedUnit}
        onClose={() => setSelectedUnit(null)}
        onUnitUpdated={(updatedUnit) => {
          setSelectedUnit(updatedUnit);
          setNotification({
            type: 'success',
            message: 'Unit updated successfully!'
          });
          setTimeout(() => setNotification(null), 3000);
        }}
      />


      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex">
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
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionUnitsManagementPage;
