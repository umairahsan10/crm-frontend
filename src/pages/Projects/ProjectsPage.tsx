import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProjectsTable from '../../components/production/projects/ProjectsTable';
import GenericProductionProjectsFilters from '../../components/production/projects/GenericProductionProjectsFilters';
import ProjectDetailsDrawer from '../../components/production/projects/ProjectDetailsDrawer';
import { useAuth } from '../../context/AuthContext';
import { getPageTitle } from '../../utils/pageTitles';
import {
  useProjects,
  useUpdateProject,
  useAssignUnitHead
} from '../../hooks/queries/useProjectsQueries';
import type { Project, ProjectQueryParams, ConfirmationModalData, ProjectListResponse } from '../../types/production/projects';
import ConfirmationModal from '../../components/production/projects/ConfirmationModals';

const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Set dynamic page title
  useEffect(() => {
    const pageTitle = getPageTitle(location.pathname);
    document.title = pageTitle || 'Projects Management';
  }, [location.pathname]);
  
  // UI State management
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{ isOpen: boolean; data: ConfirmationModalData | null }>({
    isOpen: false,
    data: null
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Filter state
  const [filters, setFilters] = useState<ProjectQueryParams>({
    search: '',
    status: undefined,
    difficulty: undefined,
    paymentStage: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Role-based access control
  const canSeeAllProjects = user?.role === 'dep_manager' || user?.role === 'admin';
  const canAssignUnitHead = user?.role === 'dep_manager' || user?.role === 'admin';
  // Only Unit Heads can assign teams (enforced by ProjectAssignmentGuard)
  const canAssignTeam = user?.role === 'unit_head';
  const showFilters = canSeeAllProjects;

  // Convert filters to API format
  const apiFilters: ProjectQueryParams = {
    ...filters,
    filterBy: canSeeAllProjects ? 'all' : undefined,
    status: filters.status as any,
    difficulty: filters.difficulty as any,
    paymentStage: filters.paymentStage as any,
    sortBy: filters.sortBy as any,
    sortOrder: filters.sortOrder
  };

  // Fetch data with current filters and pagination
  const {
    data: projectsData,
    isLoading: isLoadingProjects
  } = useProjects(pagination.currentPage, pagination.itemsPerPage, apiFilters);

  // Mutations
  // Note: createProjectMutation removed - create functionality not yet implemented
  const updateProjectMutation = useUpdateProject();
  const assignUnitHeadMutation = useAssignUnitHead();

  // Update pagination when data changes
  useEffect(() => {
    if (projectsData && typeof projectsData === 'object' && 'data' in projectsData && 'pagination' in projectsData) {
      const data = projectsData as ProjectListResponse;
      setPagination(prev => ({
        ...prev,
        totalItems: data.total || 0,
        totalPages: (data.pagination?.totalPages || 1)
      }));
    }
  }, [projectsData]);

  // Event handlers
  const handleProjectClick = useCallback((project: Project) => {
    setSelectedProject(project);
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
      status: undefined,
      difficulty: undefined,
      paymentStage: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Note: handleCompleteProject and handleStatusChange removed - Actions section removed from Details tab
  // Note: handleConfirmStatusChange kept for potential future use in Update tab

  const handleConfirmStatusChange = useCallback(async () => {
    if (!confirmationModal.data?.data) return;

    const { project, newStatus } = confirmationModal.data.data as { project: Project; newStatus: string };
    try {
      await updateProjectMutation.mutateAsync({
        projectId: project.id,
        updateData: { status: newStatus as any }
      });
      setNotification({
        type: 'success',
        message: 'Project status updated successfully!'
      });
      setConfirmationModal({ isOpen: false, data: null });
      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to update project status'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [confirmationModal, updateProjectMutation]);

  const handleConfirmModal = useCallback(() => {
    if (!confirmationModal.data) return;

    switch (confirmationModal.data.type) {
      case 'statusChange':
        handleConfirmStatusChange();
        break;
      default:
        setConfirmationModal({ isOpen: false, data: null });
    }
  }, [confirmationModal, handleConfirmStatusChange]);

  const projects = (projectsData && typeof projectsData === 'object' && 'data' in projectsData) 
    ? (projectsData as ProjectListResponse).data as Project[] 
    : [];

  return (
    <div className="production-projects-management-page p-6">

      {/* Filters - Only show for users who can see all projects */}
      {showFilters && (
        <GenericProductionProjectsFilters
          showFilters={{
            status: true,
            difficulty: true,
            paymentStage: true,
            sortBy: true
          }}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          searchPlaceholder="Search projects..."
        />
      )}

      {/* Role-based information for limited access users */}
      {!canSeeAllProjects && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                {user?.role === 'unit_head' && 'Unit Head View'}
                {user?.role === 'team_lead' && 'Team Lead View'}
                {(user?.role === 'senior' || user?.role === 'junior') && 'Production Employee View'}
              </h3>
              <p className="text-sm text-blue-600 mt-1">
                {user?.role === 'unit_head' && 'You can view and manage projects assigned to you.'}
                {user?.role === 'team_lead' && 'You can view projects assigned to your team.'}
                {(user?.role === 'senior' || user?.role === 'junior') && 'You can view projects assigned to your team.'}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                Showing {projects.length} project{projects.length !== 1 ? 's' : ''} based on your role and assignments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <ProjectsTable
        projects={projects}
        isLoading={isLoadingProjects}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={handlePageChange}
        onProjectClick={handleProjectClick}
      />

      {/* Project Details Drawer */}
      <ProjectDetailsDrawer
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        onProjectUpdated={(updatedProject) => {
          setSelectedProject(updatedProject);
          setNotification({
            type: 'success',
            message: 'Project updated successfully!'
          });
          setTimeout(() => setNotification(null), 3000);
        }}
        canUpdate={canSeeAllProjects || (user?.role === 'unit_head' && selectedProject?.unitHeadId === (user?.id ? parseInt(user.id, 10) : undefined))}
        // Note: Team leads have read-only access, so they don't get canUpdate=true
        canAssignUnitHead={canAssignUnitHead}
        canAssignTeam={canAssignTeam}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        modalData={confirmationModal.data}
        onClose={() => setConfirmationModal({ isOpen: false, data: null })}
        onConfirm={handleConfirmModal}
        loading={updateProjectMutation.isPending || assignUnitHeadMutation.isPending}
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
            <div className="ml-auto pl-3">
              <button
                onClick={() => setNotification(null)}
                className="inline-flex text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
