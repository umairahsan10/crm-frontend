import React, { useState, useEffect } from 'react';
import type { Team } from '../../../types/production/teams';
import { useProductionTeam, useAddTeamMembers, useRemoveTeamMember, useAvailableEmployees } from '../../../hooks/queries/useProductionTeamsQueries';
import { useNavbar } from '../../../context/NavbarContext';
import UpdateTeamForm from './UpdateTeamForm';

interface ProductionTeamDetailsDrawerProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onTeamUpdated?: (updatedTeam: Team) => void;
  viewMode?: 'full' | 'details-only';  // full = all tabs, details-only = just Details tab
  canUpdate?: boolean; // Whether user can update teams
}

const ProductionTeamDetailsDrawer: React.FC<ProductionTeamDetailsDrawerProps> = ({
  team,
  isOpen,
  onClose,
  viewMode = 'full',
  canUpdate = false
}) => {
  const { isNavbarOpen } = useNavbar();
  const [activeTab, setActiveTab] = useState<'details' | 'members' | 'projects' | 'update'>('details');
  const [isMobile, setIsMobile] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [showRemoveMemberConfirmation, setShowRemoveMemberConfirmation] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);

  // Fetch detailed data if team is provided (includes members, projects, lead, unit)
  const { data: teamData, isLoading: isLoadingTeam } = useProductionTeam(
    team?.id?.toString() || '', 
    { enabled: !!team?.id }
  );

  // Member management mutations
  const addMembersMutation = useAddTeamMembers();
  const removeMemberMutation = useRemoveTeamMember();
  
  // Fetch available employees (unassigned employees)
  const { data: availableEmployeesData, isLoading: isLoadingAvailableEmployees } = useAvailableEmployees(false, {
    enabled: showAddMembersModal && !!team?.id
  });
  const availableEmployees = (availableEmployeesData as any)?.data?.employees || [];

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset active tab when team changes
  useEffect(() => {
    if (team) {
      setActiveTab('details');
    }
  }, [team]);

  // Member management handlers
  const handleRemoveMember = async (employeeId: number) => {
    if (!team?.id) return;
    
    try {
      await removeMemberMutation.mutateAsync({ teamId: team.id, employeeId });
      setShowRemoveMemberConfirmation(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleRemoveMemberClick = (member: any) => {
    setMemberToRemove(member);
    setShowRemoveMemberConfirmation(true);
  };

  const handleCancelRemoveMember = () => {
    setShowRemoveMemberConfirmation(false);
    setMemberToRemove(null);
  };

  const handleAddMembers = async () => {
    if (!team?.id || selectedEmployeeIds.length === 0) return;
    
    try {
      await addMembersMutation.mutateAsync({ 
        teamId: team.id, 
        membersData: { employeeIds: selectedEmployeeIds } 
      });
      setShowAddMembersModal(false);
      setSelectedEmployeeIds([]);
    } catch (error) {
      console.error('Failed to add members:', error);
    }
  };

  const handleOpenAddMembersModal = () => {
    setShowAddMembersModal(true);
    setSelectedEmployeeIds([]);
  };

  const handleCloseAddMembersModal = () => {
    setShowAddMembersModal(false);
    setSelectedEmployeeIds([]);
  };

  const handleEmployeeSelect = (employeeId: number) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  if (!isOpen || !team) return null;

  const currentTeam = (teamData && typeof teamData === 'object' && 'data' in teamData) ? (teamData.data as Team) : team;
  
  // Ensure we have valid team data
  if (!currentTeam) {
    return null;
  }
  
  // Get all data from team details API (includes members, projects, lead, unit)
  const members = (teamData as any)?.data?.members || [];
  const projects = (teamData as any)?.data?.projects || [];

  return (
    <>
      {/* Add Members Modal - Overlay over drawer */}
      {showAddMembersModal && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 z-[60] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Add Members to Team</h2>
                </div>
                <button
                  onClick={handleCloseAddMembersModal}
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
              {/* Selected Count */}
              {selectedEmployeeIds.length > 0 && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    {selectedEmployeeIds.length} employee{selectedEmployeeIds.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}

              {/* Available Employees List */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Employees to Add
                </label>
                {isLoadingAvailableEmployees ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading available employees...</span>
                  </div>
                ) : availableEmployees.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {availableEmployees.map((employee: any) => (
                      <div
                        key={employee.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedEmployeeIds.includes(employee.id)
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleEmployeeSelect(employee.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedEmployeeIds.includes(employee.id)}
                              onChange={() => handleEmployeeSelect(employee.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {employee.firstName?.charAt(0) || 'E'}{employee.lastName?.charAt(0) || 'M'}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {employee.firstName} {employee.lastName}
                              </h3>
                              <p className="text-sm text-gray-500">{employee.email}</p>
                              <p className="text-xs text-gray-400">Role: {employee.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              employee.isAssigned 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {employee.isAssigned ? 'Assigned' : 'Available'}
                            </span>
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
                    <p className="text-gray-500 text-sm">No available employees found</p>
                    <p className="text-gray-400 text-xs mt-1">All employees may already be assigned to teams</p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {addMembersMutation.error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">
                        {addMembersMutation.error.message || 'Failed to add members to team'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseAddMembersModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={addMembersMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMembers}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedEmployeeIds.length === 0 || addMembersMutation.isPending}
                >
                  {addMembersMutation.isPending ? 'Adding...' : `Add ${selectedEmployeeIds.length} Member${selectedEmployeeIds.length !== 1 ? 's' : ''}`}
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
                    T
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Team Details
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
                  { id: 'members', name: 'Members' },
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
                {/* Team Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Team Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
                      <p className="text-lg text-gray-900 font-medium">{currentTeam.name}</p>
                    </div>
                    
                    {currentTeam.teamLead && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Team Lead</label>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {currentTeam.teamLead?.firstName?.[0] || 'T'}{currentTeam.teamLead?.lastName?.[0] || 'L'}
                            </span>
                          </div>
                          <div>
                            <p className="text-lg text-gray-900 font-medium">
                              {currentTeam.teamLead?.firstName || 'Unknown'} {currentTeam.teamLead?.lastName || 'Lead'}
                            </p>
                            <p className="text-sm text-gray-500">{currentTeam.teamLead?.email || 'No email'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Production Unit</label>
                      <p className="text-lg text-gray-900 font-medium">{currentTeam.productionUnit?.name || 'N/A'}</p>
                      {currentTeam.productionUnit?.head && (
                        <p className="text-sm text-gray-500">
                          Unit Head: {currentTeam.productionUnit.head.firstName} {currentTeam.productionUnit.head.lastName}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Members Count</label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {currentTeam.membersCount || 0}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Projects Count</label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {currentTeam.projectsCount || 0}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {currentTeam.createdAt ? new Date(currentTeam.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'full' && activeTab === 'members' && (
              <div className="space-y-4">
                 <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                       <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                       </svg>
                       Team Members
                     </h3>
                     {canUpdate && (
                       <button
                         onClick={handleOpenAddMembersModal}
                         className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                       >
                         <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                         </svg>
                         Add Members
                       </button>
                     )}
                   </div>
                  {isLoadingTeam ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading members...</span>
                    </div>
                  ) : members.length > 0 ? (
                    <div className="space-y-3">
                      {members.map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {member.firstName?.charAt(0) || 'M'}{member.lastName?.charAt(0) || 'M'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                              <p className="text-sm text-gray-500">{member.email}</p>
                              <p className="text-xs text-gray-400">Role: {member.role?.name || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="text-sm text-gray-900">{member.role?.name || 'N/A'}</p>
                            </div>
                            {canUpdate && (
                              <button
                                onClick={() => handleRemoveMemberClick(member)}
                                disabled={removeMemberMutation.isPending}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                              >
                                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove
                              </button>
                            )}
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
                      <p className="text-gray-500 text-sm">No members found in this team</p>
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
                    Team Projects
                  </h3>
                  {isLoadingTeam ? (
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
                                <span>Sales Rep: {project.salesRep?.firstName} {project.salesRep?.lastName}</span>
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
                      <p className="text-gray-500 text-sm">No projects found for this team</p>
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
                    Update Production Team
                  </h3>
                  
                  {/* Update Form */}
                  <UpdateTeamForm 
                    team={currentTeam}
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

      {/* Remove Member Confirmation Modal */}
      {showRemoveMemberConfirmation && memberToRemove && (
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
                  <h2 className="text-lg font-semibold text-gray-900">Remove Member</h2>
                </div>
                <button
                  onClick={handleCancelRemoveMember}
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
                    {memberToRemove.firstName?.charAt(0) || 'M'}{memberToRemove.lastName?.charAt(0) || 'M'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{memberToRemove.firstName} {memberToRemove.lastName}</h3>
                  <p className="text-sm text-gray-500">{memberToRemove.email}</p>
                  <p className="text-xs text-gray-400">Role: {memberToRemove.role?.name || 'N/A'}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to remove <strong>"{memberToRemove.firstName} {memberToRemove.lastName}"</strong> from this team? 
                This action will remove the member from the team and all team projects.
              </p>

              {/* Error Message */}
              {removeMemberMutation.error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">
                    {removeMemberMutation.error.message || 'Failed to remove member from team'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancelRemoveMember}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={removeMemberMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveMember(memberToRemove.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={removeMemberMutation.isPending}
                >
                  {removeMemberMutation.isPending ? 'Removing...' : 'Remove Member'}
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

export default ProductionTeamDetailsDrawer;
