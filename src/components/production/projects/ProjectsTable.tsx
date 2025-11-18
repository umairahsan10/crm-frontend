import React, { useCallback } from 'react';
import DynamicTable from '../../common/DynamicTable/DynamicTable';
import { productionProjectsTableConfig } from './tableConfigs';
import ProjectProgressBar from './ProjectProgressBar';
import type { Project } from '../../../types/production/projects';

interface ProjectsTableProps {
  projects: Project[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onProjectClick: (project: Project) => void;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onProjectClick
}) => {
  // Transform projects data for display
  const transformedProjects = projects.map(project => {
    // Handle null status as "pending_assignment"
    const status = project.status || 'pending_assignment';
    
    // Format sales rep for assignment column
    const salesRep = project.salesRep ? {
      id: project.salesRep.id,
      firstName: project.salesRep.firstName,
      lastName: project.salesRep.lastName,
      email: project.salesRep.email,
      name: `${project.salesRep.firstName} ${project.salesRep.lastName}`,
      avatar: `https://ui-avatars.com/api/?name=${project.salesRep.firstName}+${project.salesRep.lastName}&background=random`
    } : null;

    // Format unit head for assignment column
    const unitHead = project.unitHead ? {
      id: project.unitHead.id,
      firstName: project.unitHead.firstName,
      lastName: project.unitHead.lastName,
      email: project.unitHead.email,
      name: `${project.unitHead.firstName} ${project.unitHead.lastName}`,
      avatar: `https://ui-avatars.com/api/?name=${project.unitHead.firstName}+${project.unitHead.lastName}&background=random`
    } : null;

    // Format team name
    const team = project.team?.name || 'Unassigned';

    // Keep deadline as raw string - DynamicTable will format it
    // The deadline field is already in ISO format from API: "2025-11-20T00:00:00.000Z"
    const deadline = project.deadline || null;

    return {
      ...project,
      status,
      salesRep,
      unitHead,
      team,
      deadline,
      // Store progress for custom render
      _progress: project.liveProgress
    };
  });

  // Create custom table configuration
  const customTableConfig = productionProjectsTableConfig.map(config => {
    // Custom render for progress column
    if (config.key === 'liveProgress') {
      return {
        ...config,
        render: (_value: any, row: any) => (
          <ProjectProgressBar
            progress={row._progress}
            showPercentage={true}
            size="xs"
          />
        )
      };
    }

    // Custom render for actions column
    if (config.key === 'actions') {
      return {
        ...config,
        render: (_value: any, row: any) => (
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Find original project
                const originalProject = projects.find((p: Project) => p.id === row.id);
                if (originalProject) {
                  onProjectClick(originalProject);
                }
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              title="View project details"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        )
      };
    }

    return config;
  });
    
  // Handle row click - ensure we pass the correct project object
  const handleRowClick = useCallback((row: any) => {
    // The row contains all project data from transformation
    // Cast it back to Project type for type safety
    onProjectClick(row as Project);
  }, [onProjectClick]);

  return (
    <DynamicTable
      data={transformedProjects}
      columns={customTableConfig}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      selectedItems={[]}
      onPageChange={onPageChange}
      onRowClick={handleRowClick}
      theme={{
        primary: 'blue',
        secondary: 'gray',
        accent: 'blue'
      }}
      emptyMessage="No projects available"
      selectable={false}
    />
  );
};

export default ProjectsTable;

