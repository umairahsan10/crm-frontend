import React, { useState, useEffect } from 'react';
import type { Project } from '../../../types/production/projects';
import { useProject } from '../../../hooks/queries/useProjectsQueries';
import { useNavbar } from '../../../context/NavbarContext';
import { useAuth } from '../../../context/AuthContext';
import PhaseProgressBar from './PhaseProgressBar';
import PhaseProgressEditor from './PhaseProgressEditor';
import UpdateProjectForm from './UpdateProjectForm';

interface ProjectDetailsDrawerProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated?: (updatedProject: Project) => void;
  canUpdate?: boolean;
  canAssignUnitHead?: boolean;
  canAssignTeam?: boolean;
}

const ProjectDetailsDrawer: React.FC<ProjectDetailsDrawerProps> = ({
  project,
  isOpen,
  onClose,
  onProjectUpdated,
  canUpdate = false,
  canAssignUnitHead = false,
  canAssignTeam = false
}) => {
  const { isNavbarOpen } = useNavbar();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'employees' | 'update'>('details');
  const [isMobile, setIsMobile] = useState(false);

  // Fetch detailed project data
  const { data: projectData, isLoading: isLoadingProject } = useProject(
    project?.id?.toString() || '',
    { enabled: !!project?.id && isOpen }
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

  // Reset active tab when project changes
  useEffect(() => {
    if (project) {
      setActiveTab('details');
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const currentProject = (projectData && typeof projectData === 'object' && 'data' in projectData)
    ? (projectData.data as Project)
    : project;

  if (!currentProject) {
    return null;
  }

  // Display status
  const displayStatus = currentProject.status || 'pending_assignment';
  const statusLabels: Record<string, string> = {
    pending_assignment: 'Pending Assignment',
    in_progress: 'In Progress',
    onhold: 'On Hold',
    completed: 'Completed'
  };

  const paymentStageLabels: Record<string, string> = {
    initial: 'Initial',
    in_between: 'In Between',
    final: 'Final',
    approved: 'Approved'
  };

  const difficultyLabels: Record<string, string> = {
    very_easy: 'Very Easy',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    difficult: 'Difficult'
  };

  // Check if user is team lead and can update progress
  const isTeamLead = user?.role === 'team_lead' || user?.role === 'team_leads';
  const canUpdateProgress = isTeamLead && currentProject.team?.teamLead?.id === parseInt(user?.id || '0', 10);

   // Note: canCompleteProject removed - Actions section removed from Details tab

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
                    P
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Project Details
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
              {[
                { id: 'details', name: 'Details' },
                { id: 'employees', name: 'Employees' },
                ...(canUpdate || canUpdateProgress ? [{ id: 'update', name: 'Update' }] : [])
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
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-4'}`}>
            {isLoadingProject ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading project details...</span>
              </div>
            ) : (
              <>
                {activeTab === 'details' && (
                  <div className="space-y-6">

                    {/* Progress Section */}
                    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${isMobile ? 'p-4' : 'p-6'}`}>
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Project Progress
                        </h3>
                      </div>

                      {/* Phase Progress Bar - Read Only */}
                      <PhaseProgressBar
                        project={currentProject}
                        showLabels={true}
                        size="md"
                      />
                    </div>
                    
                    {/* Project Information */}
                    <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Project Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            displayStatus === 'completed' ? 'bg-green-100 text-green-800' :
                            displayStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            displayStatus === 'onhold' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {statusLabels[displayStatus] || displayStatus}
                          </span>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Stage</label>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            currentProject.paymentStage === 'approved' ? 'bg-green-100 text-green-800' :
                            currentProject.paymentStage === 'final' ? 'bg-blue-100 text-blue-800' :
                            currentProject.paymentStage === 'in_between' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {currentProject.paymentStage ? paymentStageLabels[currentProject.paymentStage] : 'Not Set'}
                          </span>
                        </div>

                        

                        {currentProject.difficultyLevel && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                            <p className="text-lg text-gray-900 font-medium">
                              {difficultyLabels[currentProject.difficultyLevel] || currentProject.difficultyLevel}
                            </p>
                          </div>
                        )}

                        {currentProject.deadline && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                            <p className="text-lg text-gray-900 font-medium">
                              {new Date(currentProject.deadline).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        {currentProject.description && (
                          <div className="md:col-span-2 lg:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <p className="text-gray-900">{currentProject.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Assignments */}
                    <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Assignments
                      </h3>
                      <div className="space-y-4">
                        {/* Sales Rep */}
                        {currentProject.salesRep && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {currentProject.salesRep.firstName?.[0] || 'S'}{currentProject.salesRep.lastName?.[0] || 'R'}
                                </span>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500">Sales Representative</label>
                                <p className="text-sm font-medium text-gray-900">
                                  {currentProject.salesRep.firstName} {currentProject.salesRep.lastName}
                                </p>
                                <p className="text-xs text-gray-500">{currentProject.salesRep.email}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Unit Head */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {currentProject.unitHead ? (
                              <>
                                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {currentProject.unitHead.firstName?.[0] || 'U'}{currentProject.unitHead.lastName?.[0] || 'H'}
                                  </span>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500">Unit Head</label>
                                  <p className="text-sm font-medium text-gray-900">
                                    {currentProject.unitHead.firstName} {currentProject.unitHead.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500">{currentProject.unitHead.email}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500">Unit Head</label>
                                  <p className="text-sm font-medium text-gray-500">Not Assigned</p>
                                </div>
                              </>
                            )}
                          </div>
                          {canAssignUnitHead && !currentProject.unitHead && (
                            <button
                              onClick={() => {
                                // TODO: Open assign unit head modal
                                console.log('Assign unit head clicked');
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                              Assign
                            </button>
                          )}
                        </div>

                        {/* Team */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {currentProject.team ? (
                              <>
                                <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">T</span>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500">Team</label>
                                  <p className="text-sm font-medium text-gray-900">{currentProject.team.name}</p>
                                  {currentProject.team.teamLead && (
                                    <p className="text-xs text-gray-500">
                                      Lead: {currentProject.team.teamLead.firstName} {currentProject.team.teamLead.lastName}
                                    </p>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500">Team</label>
                                  <p className="text-sm font-medium text-gray-500">Not Assigned</p>
                                </div>
                              </>
                            )}
                          </div>
                          {canAssignTeam && !currentProject.team && (
                            <button
                              onClick={() => {
                                // TODO: Open assign team modal
                                console.log('Assign team clicked');
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                              Assign
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {activeTab === 'employees' && (
                  <div className="space-y-4">
                    <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Project Employees
                      </h3>
                      {isLoadingProject ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-gray-600">Loading employees...</span>
                        </div>
                      ) : currentProject.relatedEmployees && currentProject.relatedEmployees.length > 0 ? (
                        <div className="space-y-3">
                          {currentProject.relatedEmployees.map((employee) => (
                            <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {employee.firstName?.[0] || 'E'}{employee.lastName?.[0] || 'M'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {employee.firstName} {employee.lastName}
                                  </p>
                                  <p className="text-sm text-gray-500">{employee.email}</p>
                                  {employee.role && (
                                    <p className="text-xs text-gray-400">Role: {employee.role.name}</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                {employee.department && (
                                  <p className="text-sm text-gray-900">{employee.department.name}</p>
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
                          <p className="text-gray-500 text-sm">No employees found for this project</p>
                          <p className="text-gray-400 text-xs mt-1">
                            Employees will appear here once a team is assigned to the project
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'update' && (canUpdate || canUpdateProgress) && (
                  <div className="space-y-4">
                    {/* Progress Editor for Team Leads */}
                    {canUpdateProgress && (
                      <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Update Project Progress
                        </h3>
                        
                        <PhaseProgressEditor
                          project={currentProject}
                          onUpdate={(updatedProject) => {
                            if (onProjectUpdated) {
                              onProjectUpdated(updatedProject);
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* Update Form for Others with Update Permission */}
                    {canUpdate && !canUpdateProgress && (
                      <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Update Project
                        </h3>
                        
                        {/* Update Form */}
                        <UpdateProjectForm 
                          project={currentProject}
                          onUpdate={(updatedProject) => {
                            if (onProjectUpdated) {
                              onProjectUpdated(updatedProject);
                            }
                            setActiveTab('details');
                          }}
                          onCancel={() => setActiveTab('details')}
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsDrawer;

