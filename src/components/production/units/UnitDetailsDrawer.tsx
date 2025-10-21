import React, { useState } from 'react';
import { useProductionUnit, useUnitEmployees, useUnitProjects, useDeleteProductionUnit } from '../../../hooks/queries/useProductionUnitsQueries';
import type { UnitDetailsDrawerProps } from '../../../types/production/units';

const UnitDetailsDrawer: React.FC<UnitDetailsDrawerProps> = ({
  unit,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  loading: externalLoading,
  error: externalError
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'projects'>('overview');
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: unitData, isLoading: loadingUnit } = useUnit(unit?.id || 0);
  const { data: employees = [], isLoading: loadingEmployees } = useUnitEmployees(unit?.id || 0);
  const { data: projects = [], isLoading: loadingProjects } = useUnitProjects(unit?.id || 0);
  const deleteUnitMutation = useDeleteProductionUnit();

  const isLoading = externalLoading || loadingUnit;
  const error = externalError;

  const handleDelete = async () => {
    if (!unit) return;
    
    if (window.confirm(`Are you sure you want to delete "${unit.name}"? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await deleteUnitMutation.mutateAsync(unit.id);
        onDelete(unit.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete unit:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !unit) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-0 right-0 h-full w-96 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Unit Details</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(unit)}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Edit Unit"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-lg m-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading unit</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Unit Info */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-lg font-medium text-blue-600">
                          {unit.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900">{unit.name}</h3>
                      <p className="text-sm text-gray-500">Unit ID: {unit.id}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Unit Head</p>
                      <p className="text-sm text-gray-900">{unit.head.firstName} {unit.head.lastName}</p>
                      <p className="text-xs text-gray-500">{unit.head.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <p className="text-sm text-gray-900">{formatDate(unit.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'overview'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('employees')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'employees'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Employees ({employees.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'projects'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Projects ({projects.length})
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{unit.teamCount}</div>
                          <div className="text-sm text-blue-800">Teams</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{unit.employeeCount}</div>
                          <div className="text-sm text-green-800">Employees</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Unit Information</h4>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-2">
                          <div>
                            <dt className="text-sm text-gray-500">Created</dt>
                            <dd className="text-sm text-gray-900">{formatDate(unit.createdAt)}</dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Last Updated</dt>
                            <dd className="text-sm text-gray-900">{formatDate(unit.updatedAt)}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  )}

                  {activeTab === 'employees' && (
                    <div className="space-y-4">
                      {loadingEmployees ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      ) : employees.length === 0 ? (
                        <div className="text-center py-8">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No employees</h3>
                          <p className="mt-1 text-sm text-gray-500">No employees are currently assigned to this unit.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {employees.map((employee) => (
                            <div key={employee.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {employee.firstName} {employee.lastName}
                                </p>
                                <p className="text-sm text-gray-500">{employee.role}</p>
                              </div>
                              {employee.teamName && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {employee.teamName}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'projects' && (
                    <div className="space-y-4">
                      {loadingProjects ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      ) : projects.length === 0 ? (
                        <div className="text-center py-8">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
                          <p className="mt-1 text-sm text-gray-500">No projects are currently assigned to this unit.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {projects.map((project) => (
                            <div key={project.id} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {project.description}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {project.teamName ? `Team: ${project.teamName}` : 'No team assigned'}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {project.status}
                                  </span>
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">{project.liveProgress}%</div>
                                    <div className="text-xs text-gray-500">Progress</div>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>Difficulty: {project.difficultyLevel}</span>
                                  <span>Due: {formatDate(project.deadline)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDeleting || isLoading}
            >
              {isDeleting ? 'Deleting...' : 'Delete Unit'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitDetailsDrawer;
