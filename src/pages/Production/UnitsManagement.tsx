import React, { useState } from 'react';
import { useUnits, useRefreshUnits } from '../../hooks/queries/useProductionUnitsQueries';
import UnitsList from '../../components/production/units/UnitsList';
import CreateUnitForm from '../../components/production/units/CreateUnitForm';
import UnitDetailsDrawer from '../../components/production/units/UnitDetailsDrawer';
import type { Unit } from '../../types/production/units';

const UnitsManagement: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const { data: units = [], isLoading, error } = useUnits();
  const refreshUnits = useRefreshUnits();

  const handleUnitSelect = (unit: Unit) => {
    setSelectedUnit(unit);
    setShowDetailsDrawer(true);
  };

  const handleUnitEdit = (unit: Unit) => {
    setEditingUnit(unit);
    // TODO: Implement edit functionality
    console.log('Edit unit:', unit);
  };

  const handleUnitDelete = (unitId: number) => {
    // The delete functionality is handled in UnitsList component
    refreshUnits();
  };

  const handleCreateUnit = (unitData: any) => {
    console.log('Unit created:', unitData);
    setShowCreateForm(false);
    refreshUnits();
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
  };

  const handleCloseDetailsDrawer = () => {
    setShowDetailsDrawer(false);
    setSelectedUnit(null);
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    // TODO: Implement edit functionality
    console.log('Edit unit from drawer:', unit);
  };

  const handleDeleteUnit = (unitId: number) => {
    handleUnitDelete(unitId);
    setShowDetailsDrawer(false);
    setSelectedUnit(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Production Units</h1>
            <p className="text-gray-600 mt-1">
              Manage production units, assign unit heads, and track team performance
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Unit
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Units</dt>
                  <dd className="text-lg font-medium text-gray-900">{units.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Teams</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {units.reduce((sum, unit) => sum + unit.teamCount, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {units.reduce((sum, unit) => sum + unit.employeeCount, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {units.reduce((sum, unit) => sum + (unit.teamCount * 2), 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Units List */}
      <div className="bg-white shadow rounded-lg">
        <UnitsList
          units={units}
          loading={isLoading}
          error={error}
          onUnitSelect={handleUnitSelect}
          onUnitEdit={handleUnitEdit}
          onUnitDelete={handleUnitDelete}
          onRefresh={refreshUnits}
        />
      </div>

      {/* Create Unit Form Modal */}
      <CreateUnitForm
        isOpen={showCreateForm}
        onClose={handleCloseCreateForm}
        onSubmit={handleCreateUnit}
        loading={false}
        error={null}
      />

      {/* Unit Details Drawer */}
      <UnitDetailsDrawer
        unit={selectedUnit}
        isOpen={showDetailsDrawer}
        onClose={handleCloseDetailsDrawer}
        onEdit={handleEditUnit}
        onDelete={handleDeleteUnit}
        loading={false}
        error={null}
      />
    </div>
  );
};

export default UnitsManagement;
