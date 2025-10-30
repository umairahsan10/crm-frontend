import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SalesUnitsTable from '../../components/sales/units/SalesUnitsTable';
import GenericSalesUnitsFilters from '../../components/sales/units/GenericSalesUnitsFilters';
import SalesUnitDetailsDrawer from '../../components/sales/units/SalesUnitDetailsDrawer';
import CreateSalesUnitForm from '../../components/sales/units/CreateSalesUnitForm';
import { useAuth } from '../../context/AuthContext';
import { getPageTitle } from '../../utils/pageTitles';
import { 
  useSalesUnits,
  useAvailableSalesUnitHeads,
  useCreateSalesUnit,
  useUpdateSalesUnit,
  useDeleteSalesUnit
} from '../../hooks/queries/useSalesUnitsQueries';
import type { SalesUnit } from '../../types/sales/units';

const SalesUnitsManagementPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Set dynamic page title
  useEffect(() => {
    const pageTitle = getPageTitle(location.pathname);
    document.title = pageTitle || 'Sales Units Management';
  }, [location.pathname]);
  
  // UI State management
  const [selectedUnit, setSelectedUnit] = useState<SalesUnit | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [unitToEdit, setUnitToEdit] = useState<SalesUnit | null>(null);

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
    hasLeads: '',
    hasEmployees: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Role-based access control
  const canSeeAllUnits = user?.role === 'dep_manager' || user?.role === 'admin';
  const canCreateUnits = user?.role === 'dep_manager' || user?.role === 'admin';
  const canUpdateUnits = user?.role === 'dep_manager' || user?.role === 'admin' || user?.role === 'unit_head';
  const canDeleteUnits = user?.role === 'dep_manager' || user?.role === 'admin';
  const showFilters = canSeeAllUnits; // Only show filters if user can see all units


  // Fetch data with current filters and pagination
  const { 
    data: unitsData, 
    isLoading: isLoadingUnits
  } = useSalesUnits(pagination.currentPage, pagination.itemsPerPage, filters);

  // Only fetch available heads when creating or updating units (for department managers)
  // Use assigned=false to get only unassigned heads (available for assignment)
  const { 
    data: availableHeadsData
  } = useAvailableSalesUnitHeads(false, { 
    enabled: canCreateUnits && (showCreateForm || !!unitToEdit) 
  });

  // Mutations
  const createUnitMutation = useCreateSalesUnit();
  const updateUnitMutation = useUpdateSalesUnit();
  const deleteUnitMutation = useDeleteSalesUnit();

  // Update pagination when data changes
  React.useEffect(() => {
    if ((unitsData as any)?.data) {
      setPagination(prev => ({
        ...prev,
        totalItems: (unitsData as any).data?.total || (unitsData as any).data?.length || 0,
        totalPages: (unitsData as any).data?.pagination?.totalPages || 1
      }));
    }
  }, [unitsData]);

  // Extract data exactly like production
  const units = (unitsData as any)?.data || [];
  const availableHeads = (availableHeadsData as any)?.data?.heads || [];

  // Event handlers
  const handleUnitClick = useCallback((unit: SalesUnit) => {
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
      hasLeads: '',
      hasEmployees: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Handle successful unit creation - form calls mutation directly
  React.useEffect(() => {
    if (createUnitMutation.isSuccess) {
      setShowCreateForm(false);
      setNotification({ type: 'success', message: 'Sales unit created successfully!' });
      setTimeout(() => setNotification(null), 3000);
      createUnitMutation.reset();
    }
  }, [createUnitMutation.isSuccess, createUnitMutation]);

  const handleUpdateUnit = useCallback(async (unitId: number, unitData: any) => {
    try {
      await updateUnitMutation.mutateAsync({ id: unitId, unitData });
      setUnitToEdit(null);
      setNotification({ type: 'success', message: 'Sales unit updated successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to update sales unit' });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [updateUnitMutation]);

  const handleDeleteUnit = useCallback(async (unit: SalesUnit) => {
    try {
      await deleteUnitMutation.mutateAsync(unit.id);
      setNotification({ type: 'success', message: 'Sales unit deleted successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: `Failed to delete sales unit: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [deleteUnitMutation]);


  return (
    <div className="sales-units-management-page p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-900">
              {canSeeAllUnits 
                ? 'Manage sales units, teams, and employees'
                : 'View your assigned sales unit details'
              }
            </p>
          </div>
          {canCreateUnits && (
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
          )}
        </div>
      </div>


      {/* Filters - Only show for users who can see all units */}
      {showFilters && (
        <GenericSalesUnitsFilters
          showFilters={{
            hasHead: true,
            hasTeams: true,
            hasLeads: true,
            hasEmployees: true,
            sortBy: true
          }}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          availableHeads={availableHeads}
          searchPlaceholder="Search sales units by name..."
        />
      )}

      {/* Role-based information for limited access users */}
      {!canSeeAllUnits && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                {user?.role === 'unit_head' && 'Unit Head View'}
                {user?.role === 'team_lead' && 'Team Lead View'}
                {(user?.role === 'senior' || user?.role === 'junior') && 'Sales Employee View'}
              </h3>
              <p className="text-sm text-blue-600 mt-1">
                {user?.role === 'unit_head' && 'You can view and manage your assigned sales unit.'}
                {user?.role === 'team_lead' && 'You can view sales units where you lead teams.'}
                {(user?.role === 'senior' || user?.role === 'junior') && 'You can view sales units where you are assigned as a sales employee.'}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                Showing {units.length} unit{units.length !== 1 ? 's' : ''} based on your role and assignments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Debug information for department managers */}
      {canSeeAllUnits && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-800">Department Manager View</h3>
              <p className="text-sm text-green-600 mt-1">
                You have full access to manage all sales units. Showing {units.length} unit{units.length !== 1 ? 's' : ''} in the system.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <SalesUnitsTable
        units={units}
        isLoading={isLoadingUnits}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={handlePageChange}
        onUnitClick={handleUnitClick}
        onDeleteUnit={canDeleteUnits ? handleDeleteUnit : undefined}
      />

      {/* Create Unit Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateForm(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <CreateSalesUnitForm
                isOpen={showCreateForm}
                onClose={() => {
                  setShowCreateForm(false);
                  createUnitMutation.reset();
                }}
                onSubmit={() => {}} // Form handles mutation directly
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
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Edit Sales Unit
                    </h3>
                    <CreateSalesUnitForm
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
      <SalesUnitDetailsDrawer
        unit={selectedUnit}
        isOpen={!!selectedUnit}
        onClose={() => setSelectedUnit(null)}
        canUpdate={canUpdateUnits}
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

export default SalesUnitsManagementPage;


