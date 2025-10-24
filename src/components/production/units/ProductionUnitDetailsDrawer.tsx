import React, { useState, useEffect } from 'react';
import type { Unit } from '../../../types/production/units';
import { useProductionUnit, useRemoveTeamFromUnit, useAddTeamToUnit, useAvailableTeams } from '../../../hooks/queries/useProductionUnitsQueries';
import { useNavbar } from '../../../context/NavbarContext';
import UpdateUnitForm from './UpdateUnitForm';

interface ProductionUnitDetailsDrawerProps {
  unit: Unit | null;
  isOpen: boolean;
  onClose: () => void;
  onUnitUpdated?: (updatedUnit: Unit) => void;
  viewMode?: 'full' | 'details-only';  // full = all tabs, details-only = just Details tab
  canUpdate?: boolean; // Whether user can update units
}

const ProductionUnitDetailsDrawer: React.FC<ProductionUnitDetailsDrawerProps> = ({
  unit,
  isOpen,
  onClose,
  viewMode = 'full',
  canUpdate = false
}) => {
  const { isNavbarOpen } = useNavbar();
  const [activeTab, setActiveTab] = useState<'details' | 'teams' | 'projects' | 'update'>('details');
  const [isMobile, setIsMobile] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [showRemoveTeamConfirmation, setShowRemoveTeamConfirmation] = useState(false);
  const [teamToRemove, setTeamToRemove] = useState<any>(null);


  // Fetch detailed data if unit is provided (includes employees, projects, teams, head)
  const { data: unitData, isLoading: isLoadingUnit } = useProductionUnit(
    unit?.id?.toString() || '', 
    { enabled: !!unit?.id }
  );

  // Team management mutations
  const removeTeamMutation = useRemoveTeamFromUnit();
  const addTeamMutation = useAddTeamToUnit();
  
  // Fetch available teams (unassigned teams)
  const { data: availableTeamsData, isLoading: isLoadingAvailableTeams } = useAvailableTeams(false, {
    enabled: showAddTeamModal && !!unit?.id
  });
  const availableTeams = (availableTeamsData as any)?.data || [];

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


  // Team management handlers
  const handleRemoveTeam = async (teamId: number) => {
    if (!unit?.id) return;
    
    try {
      await removeTeamMutation.mutateAsync({ unitId: unit.id, teamId });
      setShowRemoveTeamConfirmation(false);
      setTeamToRemove(null);
    } catch (error) {
      console.error('Failed to remove team:', error);
    }
  };

  const handleRemoveTeamClick = (team: any) => {
    setTeamToRemove(team);
    setShowRemoveTeamConfirmation(true);
  };

  const handleCancelRemoveTeam = () => {
    setShowRemoveTeamConfirmation(false);
    setTeamToRemove(null);
  };

  const handleAddTeam = async () => {
    if (!unit?.id || !selectedTeamId) return;
    
    try {
      await addTeamMutation.mutateAsync({ unitId: unit.id, teamId: selectedTeamId });
      setShowAddTeamModal(false);
      setSelectedTeamId(null);
    } catch (error) {
      console.error('Failed to add team:', error);
    }
  };

  const handleOpenAddTeamModal = () => {
    setShowAddTeamModal(true);
    setSelectedTeamId(null);
  };

  const handleCloseAddTeamModal = () => {
    setShowAddTeamModal(false);
    setSelectedTeamId(null);
  };

  if (!isOpen || !unit) return null;

  const currentUnit = (unitData && typeof unitData === 'object' && 'data' in unitData) ? (unitData.data as Unit) : unit;
  
  // Ensure we have valid unit data
  if (!currentUnit) {
    return null;
  }
  
  // Get all data from unit details API (includes employees, projects, teams, head)
  // const employees = (unitData as any)?.data?.productionEmployees || []; // Removed - employees tab not needed
  const teams = (unitData as any)?.data?.teams || [];
  const projects = (unitData as any)?.data?.allProjects || [];

  return (
    <>

      {/* Add Team Modal - Overlay over drawer */}
      {showAddTeamModal && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 z-[60] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4 border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Add Team to Unit</h2>
                </div>
                <button
                  onClick={handleCloseAddTeamModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Available Teams List */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Team to Add
                </label>
                {isLoadingAvailableTeams ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading available teams...</span>
                  </div>
                ) : availableTeams.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {availableTeams.map((team: any) => (
                      <div
                        key={team.id}
                        onClick={() => setSelectedTeamId(team.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedTeamId === team.id
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {team.name?.charAt(0) || 'T'}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{team.name}</h3>
                              <p className="text-sm text-gray-500">
                                Lead: {team.teamLead?.firstName} {team.teamLead?.lastName}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900">{team.employeeCount} members</p>
                            {/* <p className="text-xs text-gray-500">{team.currentProject ? 1 : 0} projects</p> */}
                          </div>
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
                    <p className="text-gray-500 text-sm">No available teams found</p>
                    <p className="text-gray-400 text-xs mt-1">All teams may already be assigned to units</p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {addTeamMutation.error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">
                        {addTeamMutation.error.message || 'Failed to add team to unit'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseAddTeamModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={addTeamMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTeam}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedTeamId || addTeamMutation.isPending}
                >
                  {addTeamMutation.isPending ? 'Adding...' : 'Add Team'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                // For full mode - show all tabs (conditionally show update tab)
                [
                  { id: 'details', name: 'Details' },
                  { id: 'teams', name: 'Teams' },
                  { id: 'projects', name: 'Projects' },
                  ...(canUpdate ? [{ id: 'update', name: 'Update' }] : [])
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


            {viewMode === 'full' && activeTab === 'teams' && (
              <div className="space-y-4">
                 <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                       <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                       </svg>
                       Unit Teams
                     </h3>
                     {canUpdate && (
                       <button
                         onClick={handleOpenAddTeamModal}
                         className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                       >
                         <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                         </svg>
                         Add Team
                       </button>
                     )}
                   </div>
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
                              <p className="text-sm text-gray-500">
                                Lead: {team.teamLead?.firstName} {team.teamLead?.lastName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="text-sm text-gray-900">{team.employeeCount || 0} members</p>
                              <p className="text-xs text-gray-500">{team.completedLeads || 0} Completed Leads</p>
                            </div>
                            <button
                              onClick={() => handleRemoveTeamClick(team)}
                              disabled={removeTeamMutation.isPending}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </button>
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
                              <h4 className="text-sm font-medium text-gray-900">{project.description}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Client: {project.client?.companyName || 'Unknown'}
                              </p>
                              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                <span>Status: {project.status}</span>
                                <span>Progress: {project.liveProgress}%</span>
                                <span>Difficulty: {project.difficultyLevel}</span>
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              project.status === 'completed' ? 'bg-green-100 text-green-800' :
                              project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
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

            {viewMode === 'full' && activeTab === 'update' && canUpdate && (
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

      {/* Remove Team Confirmation Modal */}
      {showRemoveTeamConfirmation && teamToRemove && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 z-[70] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Remove Team</h2>
                </div>
                <button
                  onClick={handleCancelRemoveTeam}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {teamToRemove.name?.charAt(0) || 'T'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{teamToRemove.name}</h3>
                  <p className="text-sm text-gray-500">
                    Lead: {teamToRemove.teamLead?.firstName} {teamToRemove.teamLead?.lastName}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to remove <strong>"{teamToRemove.name}"</strong> from this unit? 
                This action will unassign the team from the unit but won't delete the team itself.
              </p>

              {/* Team Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Team Members:</span>
                  <span className="font-medium">{teamToRemove.employeeCount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed Leads:</span>
                  <span className="font-medium">{teamToRemove.completedLeads || 0}</span>
                </div>
              </div>

              {/* Error Message */}
              {removeTeamMutation.error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">
                    {removeTeamMutation.error.message || 'Failed to remove team from unit'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancelRemoveTeam}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={removeTeamMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveTeam(teamToRemove.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={removeTeamMutation.isPending}
                >
                  {removeTeamMutation.isPending ? 'Removing...' : 'Remove Team'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
};

export default ProductionUnitDetailsDrawer;