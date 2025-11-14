import React from 'react';
import { useCurrentProjects } from '../../../hooks/queries/useCurrentProjects';

interface ProjectStatusProps {
  className?: string;
}

export const ProjectStatus: React.FC<ProjectStatusProps> = ({ className = '' }) => {
  const { data: projects = [], isLoading, isError } = useCurrentProjects();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'text-green-600 bg-green-100';
      case 'on-track': return 'text-blue-600 bg-blue-100';
      case 'delayed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Format deadline for display
  const formatDeadline = (deadline: string) => {
    try {
      const date = new Date(deadline);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return deadline;
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
      </div>
      
      {isLoading && (
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isError && (
        <div className="p-4 text-center">
          <p className="text-sm text-red-600">Failed to load projects. Please try again later.</p>
        </div>
      )}

      {!isLoading && !isError && projects.length === 0 && (
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500">No active projects found.</p>
        </div>
      )}

      {!isLoading && !isError && projects.length > 0 && (
        <div className="divide-y divide-gray-200">
          {projects.map((project, index) => (
            <div key={index} className="px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                  <p className="text-xs text-gray-500">{project.team}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Due: {formatDeadline(project.deadline)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-600">{project.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
