import React from 'react';

interface ProjectStatusProps {
  className?: string;
}

export const ProjectStatus: React.FC<ProjectStatusProps> = ({ className = '' }) => {
  const projects = [
    { name: 'E-commerce Platform', progress: 85, status: 'on-track', deadline: '2024-10-15', team: 'Frontend Team' },
    { name: 'Mobile App Redesign', progress: 60, status: 'on-track', deadline: '2024-11-30', team: 'Mobile Team' },
    { name: 'API Integration', progress: 92, status: 'ahead', deadline: '2024-09-30', team: 'Backend Team' },
    { name: 'Database Optimization', progress: 40, status: 'delayed', deadline: '2024-10-20', team: 'DevOps Team' },
  ];

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

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {projects.map((project, index) => (
          <div key={index} className="p-6 hover:bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                <p className="text-xs text-gray-500">{project.team}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status.replace('-', ' ')}
                </span>
                <p className="text-xs text-gray-500 mt-1">Due: {project.deadline}</p>
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
    </div>
  );
};
