import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SalesTeamsTable from '../../components/sales/teams/SalesTeamsTable';
import GenericSalesTeamsFilters from '../../components/sales/teams/GenericSalesTeamsFilters';
import SalesTeamDetailsDrawer from '../../components/sales/teams/SalesTeamDetailsDrawer';
import CreateSalesTeamForm from '../../components/sales/teams/CreateSalesTeamForm';
import { useAuth } from '../../context/AuthContext';
import { getPageTitle } from '../../utils/pageTitles';
import { 
  useSalesTeams,
  useAvailableTeamLeads,
  useCreateSalesTeam,
  useUpdateSalesTeam,
  useDeleteSalesTeam
} from '../../hooks/queries/useSalesTeamsQueries';
import type { Team } from '../../types/sales/teams';

const SalesTeamsManagementPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Set dynamic page title
  useEffect(() => {
    const pageTitle = getPageTitle(location.pathname);
    document.title = pageTitle || 'Sales Teams Management';
  }, [location.pathname]);
  
  // UI State management
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);

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
    hasLead: '',
    hasMembers: '',
    hasLeads: '',
    minCompletedLeads: undefined as number | undefined,
    maxCompletedLeads: undefined as number | undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Role-based access control
  const canSeeAllTeams = user?.role === 'dep_manager' || user?.role === 'admin';
  const canCreateTeams = user?.role === 'dep_manager' || user?.role === 'admin';
  const canUpdateTeams = user?.role === 'dep_manager' || user?.role === 'admin' || user?.role === 'unit_head';
  const canDeleteTeams = user?.role === 'dep_manager' || user?.role === 'admin';
  const showFilters = canSeeAllTeams; // Only show filters if user can see all teams

  // Fetch data with current filters and pagination
  const { 
    data: teamsData, 
    isLoading: isLoadingTeams
  } = useSalesTeams(pagination.currentPage, pagination.itemsPerPage, filters);

  // Only fetch available leads when creating or updating teams (for department managers)
  // Use assigned=false to get only unassigned leads (available for assignment)
  const { 
    data: availableLeadsData
  } = useAvailableTeamLeads(false, { 
    enabled: canCreateTeams && (showCreateForm || !!teamToEdit) 
  });

  // Mutations
  const createTeamMutation = useCreateSalesTeam();
  const updateTeamMutation = useUpdateSalesTeam();
  const deleteTeamMutation = useDeleteSalesTeam();

  // Update pagination when data changes
  React.useEffect(() => {
    if ((teamsData as any)?.data) {
      setPagination(prev => ({
        ...prev,
        totalItems: (teamsData as any).data?.total || (teamsData as any).data?.length || 0,
        totalPages: (teamsData as any).data?.pagination?.totalPages || 1
      }));
    }
  }, [teamsData]);

  // Event handlers
  const handleTeamClick = useCallback((team: Team) => {
    setSelectedTeam(team);
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
      hasLead: '',
      hasMembers: '',
      hasLeads: '',
      minCompletedLeads: undefined,
      maxCompletedLeads: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleCreateTeam = useCallback(async (teamData: any) => {
    try {
      await createTeamMutation.mutateAsync(teamData);
      setShowCreateForm(false);
      setNotification({ type: 'success', message: 'Sales team created successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to create sales team' });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [createTeamMutation]);

  const handleUpdateTeam = useCallback(async (teamId: number, teamData: any) => {
    try {
      await updateTeamMutation.mutateAsync({ id: teamId, teamData });
      setTeamToEdit(null);
      setNotification({ type: 'success', message: 'Sales team updated successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to update sales team' });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [updateTeamMutation]);

  const handleDeleteTeam = useCallback(async (team: Team) => {
    try {
      await deleteTeamMutation.mutateAsync(team.id);
      setNotification({ type: 'success', message: 'Sales team deleted successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: `Failed to delete sales team: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [deleteTeamMutation]);

  const teams = (teamsData as any)?.data || [];
  const availableLeads = (availableLeadsData as any)?.data?.leads || [];

  return (
    <div className="sales-teams-management-page p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-900">
              {canSeeAllTeams 
                ? 'Manage sales teams, members, and leads'
                : 'View your assigned sales teams'
              }
            </p>
          </div>
          {canCreateTeams && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Team
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters - Only show for users who can see all teams */}
      {showFilters && (
        <GenericSalesTeamsFilters
          showFilters={{
            hasLead: true,
            hasMembers: true,
            hasLeads: true,
            completedLeadsRange: true,
            sortBy: true
          }}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          availableLeads={availableLeads}
          searchPlaceholder="Search sales teams by name..."
        />
      )}

      {/* Role-based information for limited access users */}
      {!canSeeAllTeams && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-800">
                {user?.role === 'unit_head' && 'Unit Head View'}
                {user?.role === 'team_lead' && 'Team Lead View'}
                {(user?.role === 'senior' || user?.role === 'junior') && 'Sales Employee View'}
              </h3>
              <p className="text-sm text-green-600 mt-1">
                {user?.role === 'unit_head' && 'You can view and manage teams in your sales unit.'}
                {user?.role === 'team_lead' && 'You can view and manage teams you lead.'}
                {(user?.role === 'senior' || user?.role === 'junior') && 'You can view teams you belong to.'}
              </p>
              <p className="text-xs text-green-500 mt-1">
                Showing {teams.length} team{teams.length !== 1 ? 's' : ''} based on your role and assignments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Debug information for department managers */}
      {canSeeAllTeams && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-emerald-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-emerald-800">Department Manager View</h3>
              <p className="text-sm text-emerald-600 mt-1">
                You have full access to manage all sales teams. Showing {teams.length} team{teams.length !== 1 ? 's' : ''} in the system.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <SalesTeamsTable
        teams={teams}
        isLoading={isLoadingTeams}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={handlePageChange}
        onTeamClick={handleTeamClick}
        onDeleteTeam={canDeleteTeams ? handleDeleteTeam : undefined}
      />

      {/* Create Team Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateForm(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <CreateSalesTeamForm
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                onSubmit={handleCreateTeam}
                loading={createTeamMutation.isPending}
                error={createTeamMutation.error?.message || null}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {teamToEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setTeamToEdit(null)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Edit Sales Team
                    </h3>
                    <CreateSalesTeamForm
                      isOpen={true}
                      onSubmit={(data) => handleUpdateTeam(teamToEdit.id, data)}
                      onClose={() => setTeamToEdit(null)}
                      loading={false}
                      error={null}
                      initialData={teamToEdit}
                      availableLeads={availableLeads}
                      isEditing={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Details Drawer */}
      <SalesTeamDetailsDrawer
        team={selectedTeam}
        isOpen={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
        canUpdate={canUpdateTeams}
        onTeamUpdated={(updatedTeam) => {
          setSelectedTeam(updatedTeam);
          setNotification({
            type: 'success',
            message: 'Team updated successfully!'
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

export default SalesTeamsManagementPage;
