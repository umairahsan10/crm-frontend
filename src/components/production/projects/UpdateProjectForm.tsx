import React, { useState, useEffect, useMemo } from 'react';
import { useUpdateProject, useAvailableTeamsForProject } from '../../../hooks/queries/useProjectsQueries';
import { useAuth } from '../../../context/AuthContext';
import type { Project, UnifiedUpdateProjectDto, DifficultyLevel, ProjectStatus } from '../../../types/production/projects';
import { validateFieldPermissions } from '../../../utils/projectValidation';

interface UpdateProjectFormProps {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
  onCancel: () => void;
}

const UpdateProjectForm: React.FC<UpdateProjectFormProps> = ({
  project,
  onUpdate,
  onCancel
}) => {
  const { user } = useAuth();
  const updateProjectMutation = useUpdateProject();
  
  // Fetch available teams if user can update team
  const canUpdateTeam = validateFieldPermissions(user?.role, 'teamId', project, user?.id ? parseInt(user.id, 10) : undefined).valid;
  const { data: teamsData, isLoading: isLoadingTeams } = useAvailableTeamsForProject({
    enabled: canUpdateTeam
  });

  // Extract available teams from API response
  const availableTeams = useMemo(() => {
    if (!teamsData) return [];
    const response = teamsData as any;
    
    // Handle API response structure: { success: true, data: [...], total: number, message: string }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    // Fallback for direct array
    if (Array.isArray(response)) {
      return response;
    }
    return [];
  }, [teamsData]);
  
  // Validate project has an ID
  if (!project?.id) {
    console.error('UpdateProjectForm: Project ID is missing!', project);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">
          Error: Project ID is missing. Cannot update project.
        </p>
      </div>
    );
  }
  
  // Determine which fields user can update based on role (pass currentUserId for unit head validation)
  // Note: paymentStage and liveProgress are automatic - NOT in update form
  // Convert user.id (string) to number for comparison
  const userId = user?.id ? parseInt(user.id, 10) : undefined;
  const canUpdateDescription = validateFieldPermissions(user?.role, 'description', project, userId).valid;
  const canUpdateDifficulty = validateFieldPermissions(user?.role, 'difficultyLevel', project, userId).valid;
  const canUpdateStatus = validateFieldPermissions(user?.role, 'status', project, userId).valid;
  const canUpdateDeadline = validateFieldPermissions(user?.role, 'deadline', project, userId).valid;

  const [formData, setFormData] = useState<UnifiedUpdateProjectDto>({
    description: project.description || '',
    difficulty: project.difficultyLevel || undefined,
    deadline: project.deadline || undefined,
    status: (project.status || 'pending_assignment') as ProjectStatus,
    teamId: project.teamId || undefined
    // Note: paymentStage and liveProgress are automatic - not included in form
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  // Find selected team from available teams or project team
  const selectedTeam = useMemo(() => {
    if (formData.teamId) {
      // First try to find in available teams
      const team = availableTeams.find((t: any) => t.id === formData.teamId);
      if (team) return team;
      
      // Fallback to project team if available
      if (project.team && project.team.id === formData.teamId) {
        return project.team;
      }
    }
    return null;
  }, [formData.teamId, availableTeams, project.team]);

  // Update form data when project changes
  useEffect(() => {
    setFormData({
      description: project.description || '',
      difficulty: project.difficultyLevel || undefined,
      deadline: project.deadline || undefined,
      status: (project.status || 'pending_assignment') as ProjectStatus,
      teamId: project.teamId || undefined
      // Note: paymentStage and liveProgress are automatic - not included in form
    });
    setShowTeamDropdown(false);
  }, [project]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTeamDropdown) {
        const target = event.target as HTMLElement;
        const dropdown = target.closest('.team-dropdown-container');
        if (!dropdown) {
          setShowTeamDropdown(false);
        }
      }
    };

    if (showTeamDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTeamDropdown]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

      // Note: liveProgress validation removed - it's automatic

    if (canUpdateDeadline && formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      if (isNaN(deadlineDate.getTime())) {
        newErrors.deadline = 'Invalid deadline date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Clear previous errors
      setErrors({});
      
      // Debug logging
      console.log('Update attempt by user:', {
        role: user?.role,
        userId: user?.id,
        projectUnitHeadId: project.unitHeadId,
        canUpdateFields: {
          description: canUpdateDescription,
          difficulty: canUpdateDifficulty,
          status: canUpdateStatus,
          deadline: canUpdateDeadline,
          team: canUpdateTeam
        },
        note: 'paymentStage and liveProgress are automatic and not editable'
      });

      // Only send fields user has permission to update
      const updateData: UnifiedUpdateProjectDto = {};
      
      if (canUpdateDescription && formData.description !== project.description) {
        updateData.description = formData.description;
      }
      if (canUpdateDifficulty && formData.difficulty !== project.difficultyLevel) {
        updateData.difficulty = formData.difficulty;
      }
      if (canUpdateStatus && formData.status !== project.status) {
        updateData.status = formData.status;
      }
      if (canUpdateDeadline && formData.deadline !== project.deadline) {
        updateData.deadline = formData.deadline;
      }
      if (canUpdateTeam && formData.teamId !== project.teamId) {
        updateData.teamId = formData.teamId;
      }
      // Note: paymentStage and liveProgress are automatic - not included in updates
      
      console.log('Update data to send:', updateData);

      // Only call API if there are changes
      if (Object.keys(updateData).length > 0) {
        // Ensure project ID is valid
        if (!project.id) {
          console.error('Project ID is missing!', project);
          throw new Error('Project ID is required. Please refresh the page and try again.');
        }
        
        console.log('Calling update mutation with:', {
          projectId: project.id,
          updateData,
          projectIdType: typeof project.id
        });
        
        const response = await updateProjectMutation.mutateAsync({
          projectId: project.id,
          updateData
        });
        // Extract project from response if it's wrapped
        const updatedProject = (response && typeof response === 'object' && 'data' in response)
          ? (response.data as Project)
          : (response as Project);
        onUpdate(updatedProject);
      } else {
        // No changes, just close
        onCancel();
      }
    } catch (error: any) {
      console.error('Error updating project:', error);
      // Set error message to display to user
      const errorMessage = error?.message || 'Failed to update project. Please check your permissions and try again.';
      setErrors({ submit: errorMessage });
      
      // Show error notification (you can add toast notification here if available)
      if (error?.message?.includes('Access denied')) {
        setErrors({ 
          submit: 'Access denied: You do not have permission to update this project. Make sure you are assigned as the unit head for this project.' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof UnifiedUpdateProjectDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const difficultyOptions: { value: DifficultyLevel; label: string }[] = [
    { value: 'very_easy', label: 'Very Easy' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
    { value: 'difficult', label: 'Difficult' }
  ];

  // Note: paymentStageOptions removed - payment stage is automatic

  const statusOptions: { value: ProjectStatus; label: string }[] = [
    { value: 'pending_assignment', label: 'Pending Assignment' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'onhold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Description */}
      {canUpdateDescription && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter project description"
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>
      )}

      {/* Status */}
      {canUpdateStatus && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.status ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status}</p>
          )}
        </div>
      )}

      {/* Difficulty Level */}
      {canUpdateDifficulty && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={formData.difficulty || ''}
            onChange={(e) => handleInputChange('difficulty', e.target.value || undefined)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.difficulty ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          >
            <option value="">Select difficulty level</option>
            {difficultyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.difficulty && (
            <p className="mt-1 text-sm text-red-600">{errors.difficulty}</p>
          )}
        </div>
      )}

      {/* Note: Payment Stage removed - it's automatic based on payment phases */}

      {/* Deadline */}
      {canUpdateDeadline && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deadline
          </label>
          <input
            type="date"
            value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ''}
            onChange={(e) => handleInputChange('deadline', e.target.value || undefined)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.deadline ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.deadline && (
            <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
          )}
        </div>
      )}

      {/* Note: Live Progress removed - it's automatic based on payment phases */}

      {/* Team Selection */}
      {canUpdateTeam && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team
          </label>
          <div className="relative team-dropdown-container">
            {/* Selected Team Display / Dropdown Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowTeamDropdown(!showTeamDropdown);
              }}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.teamId ? 'border-red-300' : 'border-gray-300'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {selectedTeam ? (
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-white">
                      {selectedTeam.name?.charAt(0) || 'T'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedTeam.name}
                    </p>
                    {selectedTeam.teamLead && (
                      <p className="text-xs text-gray-500 truncate">
                        Lead: {selectedTeam.teamLead.firstName} {selectedTeam.teamLead.lastName}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Select a team</span>
              )}
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showTeamDropdown && (
              <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
                <div className="p-4">
                  {isLoadingTeams ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading available teams...</span>
                    </div>
                  ) : availableTeams.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">No available teams found</p>
                      <p className="text-gray-400 text-xs mt-1">All teams may already be assigned</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Available Teams */}
                      {availableTeams.map((team: any) => (
                        <div
                          key={team.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleInputChange('teamId', team.id);
                            setShowTeamDropdown(false);
                          }}
                          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                            formData.teamId === team.id
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {team.name?.charAt(0) || 'T'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {team.name}
                              </h3>
                              {team.teamLead && (
                                <p className="text-sm text-gray-500 truncate">
                                  Lead: {team.teamLead.firstName} {team.teamLead.lastName}
                                </p>
                              )}
                              {team.employeeCount !== undefined && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {team.employeeCount} member{team.employeeCount !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {errors.teamId && (
            <p className="mt-1 text-sm text-red-600">{errors.teamId}</p>
          )}
        </div>
      )}

      {/* Error Message */}
      {(updateProjectMutation.error || errors.submit) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            {errors.submit || updateProjectMutation.error?.message || 'Failed to update project'}
          </p>
          {updateProjectMutation.error?.message?.includes('Access denied') && (
            <p className="text-xs text-red-500 mt-1">
              Tip: Unit Heads can only update projects assigned to them. Managers can update any project.
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Update Project'}
        </button>
      </div>
    </form>
  );
};

export default UpdateProjectForm;

