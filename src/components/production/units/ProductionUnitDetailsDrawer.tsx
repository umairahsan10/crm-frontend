import React, { useState, useEffect } from 'react';
import type { Unit } from '../../../types/production/units';
import { useProductionUnit } from '../../../hooks/queries/useProductionUnitsQueries';
import { useNavbar } from '../../../context/NavbarContext';
import UpdateUnitForm from './UpdateUnitForm';

interface ProductionUnitDetailsDrawerProps {
  unit: Unit | null;
  isOpen: boolean;
  onClose: () => void;
  onUnitUpdated?: (updatedUnit: Unit) => void;
  viewMode?: 'full' | 'details-only';  // full = all tabs, details-only = just Details tab
}

const ProductionUnitDetailsDrawer: React.FC<ProductionUnitDetailsDrawerProps> = ({
  unit,
  isOpen,
  onClose,
  viewMode = 'full'
}) => {
  const { isNavbarOpen } = useNavbar();
  const [activeTab, setActiveTab] = useState<'details' | 'employees' | 'teams' | 'projects' | 'update'>('details');
  const [isMobile, setIsMobile] = useState(false);

  // Fetch detailed data if unit is provided (includes employees, projects, teams, head)
  const { data: unitData, isLoading: isLoadingUnit } = useProductionUnit(
    unit?.id?.toString() || '', 
    { enabled: !!unit?.id }
  );

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset active tab when unit changes
  useEffect(() => {
    if (unit) {
      setActiveTab('details');
    }
  }, [unit]);

  if (!isOpen || !unit) return null;

  const currentUnit = (unitData && typeof unitData === 'object' && 'data' in unitData) ? (unitData.data as Unit) : unit;
  
  // Ensure we have valid unit data
  if (!currentUnit) {
    return null;
  }
  
  // Get all data from unit details API (includes employees, projects, teams, head)
  const employees = (unitData && typeof unitData === 'object' && 'data' in unitData && unitData.data && typeof unitData.data === 'object' && 'productionEmployees' in unitData.data) ? (unitData.data as any).productionEmployees : [];
  const teams = (unitData && typeof unitData === 'object' && 'data' in unitData && unitData.data && typeof unitData.data === 'object' && 'teams' in unitData.data) ? (unitData.data as any).teams : [];
  const projects = (unitData && typeof unitData === 'object' && 'data' in unitData && unitData.data && typeof unitData.data === 'object' && 'projects' in unitData.data) ? (unitData.data as any).projects : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75" onClick={onClose}></div>
      
      <div 
        className="relative mx-auto h-full bg-white shadow-2xl rounded-lg border border-gray-200 transform transition-all duration-300 ease-out"
        style={{
          marginLeft: isMobile ? '0' : (isNavbarOpen ? '280px' : '100px'),
          width: isMobile ? '100vw' : (isNavbarOpen ? 'calc(100vw - 350px)' : 'calc(100vw - 150px)'),
          maxWidth: isMobile ? '100vw' : '1200px',
          marginRight: isMobile ? '0' : '50px',
          marginTop: isMobile ? '0' : '20px',
          marginBottom: isMobile ? '0' : '20px',
          height: isMobile ? '100vh' : 'calc(100vh - 40px)'
        }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">
                    U
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Unit Details
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className={`-mb-px flex space-x-8 ${isMobile ? 'px-4' : 'px-6'}`}>
              {viewMode === 'details-only' ? (
                // For details-only mode - only show Details tab
                <button
                  className="py-4 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600"
                >
                  Details
                </button>
              ) : (
                // For full mode - show all tabs
                [
                  { id: 'details', name: 'Details' },
                  { id: 'employees', name: 'Employees' },
                  { id: 'teams', name: 'Teams' },
                  { id: 'projects', name: 'Projects' },
                  { id: 'update', name: 'Update' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))
              )}
            </nav>
          </div>

          {/* Content */}
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-4'}`}>
            {(viewMode === 'details-only' || activeTab === 'details') && (
              <div className="space-y-6">
                {/* Unit Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Unit Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit Name</label>
                      <p className="text-lg text-gray-900 font-medium">{currentUnit.name}</p>
                    </div>
                    
                    {currentUnit.head && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Unit Head</label>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {currentUnit.head?.firstName?.[0] || 'U'}{currentUnit.head?.lastName?.[0] || 'H'}
                            </span>
                          </div>
                          <div>
                            <p className="text-lg text-gray-900 font-medium">
                              {currentUnit.head?.firstName || 'Unknown'} {currentUnit.head?.lastName || 'Head'}
                            </p>
                            <p className="text-sm text-gray-500">{currentUnit.head?.email || 'No email'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teams Count</label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {currentUnit.teamsCount || 0}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Employees Count</label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {currentUnit.employeesCount || 0}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {currentUnit.createdAt ? new Date(currentUnit.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {currentUnit.updatedAt ? new Date(currentUnit.updatedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'full' && activeTab === 'employees' && (
              <div className="space-y-4">
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Unit Employees
                  </h3>
                  {isLoadingUnit ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading employees...</span>
                    </div>
                  ) : employees.length > 0 ? (
                    <div className="space-y-3">
                      {employees.map((employee: any) => (
                        <div key={employee.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {employee.firstName?.[0] || 'E'}{employee.lastName?.[0] || 'M'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{employee.email}</p>
                            {employee.role && (
                              <p className="text-xs text-blue-600">{employee.role}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">No employees found in this unit</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {viewMode === 'full' && activeTab === 'teams' && (
              <div className="space-y-4">
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Unit Teams
                  </h3>
                  {isLoadingUnit ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading teams...</span>
                    </div>
                  ) : teams.length > 0 ? (
                    <div className="space-y-3">
                      {teams.map((team: any) => (
                        <div key={team.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {team.name?.charAt(0) || 'T'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{team.name}</p>
                              <p className="text-sm text-gray-500">Lead: {team.teamLead}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900">{team.employeeCount} members</p>
                            <p className="text-xs text-gray-500">{team.currentProjects} projects</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">No teams found in this unit</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {viewMode === 'full' && activeTab === 'projects' && (
              <div className="space-y-4">
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Unit Projects
                  </h3>
                  {isLoadingUnit ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading projects...</span>
                    </div>
                  ) : projects.length > 0 ? (
                    <div className="space-y-3">
                      {projects.map((project: any) => (
                        <div key={project.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">{project.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                <span>Client: {project.client}</span>
                                <span>Status: {project.status}</span>
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                {project.startDate} - {project.endDate}
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">No projects found in this unit</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {viewMode === 'full' && activeTab === 'update' && (
              <div className="space-y-4">
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Production Unit
                  </h3>
                  
                  {/* Update Form */}
                  <UpdateUnitForm 
                    unit={currentUnit}
                    onUpdate={() => {
                      // Handle update success - switch back to details tab
                      setActiveTab('details');
                    }}
                    onCancel={() => setActiveTab('details')}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionUnitDetailsDrawer;