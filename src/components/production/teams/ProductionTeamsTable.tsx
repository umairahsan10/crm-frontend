import React from 'react';
import DynamicTable from '../../common/DynamicTable/DynamicTable';
import { productionTeamsTableConfig } from './tableConfigs';
import type { Team } from '../../../types/production/teams';

interface ProductionTeamsTableProps {
  teams: Team[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onTeamClick: (team: Team) => void;
  onDeleteTeam?: (team: Team) => void;
  onBulkSelect?: (selectedIds: string[]) => void;
  selectedTeams?: string[];
}

const ProductionTeamsTable: React.FC<ProductionTeamsTableProps> = ({
  teams,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onTeamClick,
  onDeleteTeam,
  onBulkSelect,
  selectedTeams
}) => {
  // Debug logging
  console.log('ProductionTeamsTable - Raw teams data:', teams);
  console.log('ProductionTeamsTable - First team structure:', teams[0]);
  if (teams[0]) {
    console.log('ProductionTeamsTable - First team counts:', {
      membersCount: teams[0].membersCount,
      projectsCount: teams[0].projectsCount
    });
  }
  
  // Transform teams data to include proper formatting
  const transformedTeams = teams.map(team => ({
    ...team,
    // Ensure team lead data is properly formatted for assignment column
    teamLead: team.teamLead ? {
      id: team.teamLead.id,
      firstName: team.teamLead.firstName,
      lastName: team.teamLead.lastName,
      email: team.teamLead.email || '',
      name: `${team.teamLead.firstName} ${team.teamLead.lastName}`,
      avatar: `https://ui-avatars.com/api/?name=${team.teamLead.firstName}+${team.teamLead.lastName}&background=random`
    } : null,
    // Add status based on team lead assignment
    status: team.teamLead ? 'active' : 'inactive',
    // Ensure counts are properly displayed (convert to string to avoid falsy 0 issue)
    membersCount: team.membersCount?.toString() ?? '0',
    projectsCount: team.projectsCount?.toString() ?? '0',
    // Format production unit name
    productionUnit: team.productionUnit?.name || 'N/A',
    // Format dates
    createdAt: team.createdAt ? (() => {
      try {
        const date = new Date(team.createdAt);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
      } catch {
        return 'N/A';
      }
    })() : 'N/A'
  }));

  // Debug logging for transformed data
  console.log('ProductionTeamsTable - Transformed teams:', transformedTeams);
  console.log('ProductionTeamsTable - First transformed team:', transformedTeams[0]);
  if (transformedTeams[0]) {
    console.log('ProductionTeamsTable - First transformed team counts:', {
      membersCount: transformedTeams[0].membersCount,
      projectsCount: transformedTeams[0].projectsCount
    });
  }

  // Create custom table configuration with delete handler
  const customTableConfig = productionTeamsTableConfig.map(config => {
    if (config.key === 'actions') {
      return {
        ...config,
        render: (_value: any, row: any) => (
          <div className="flex items-center space-x-2">
            {onDeleteTeam ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Delete button clicked for team:', row.id);
                  console.log('Team data:', row);
                  console.log('Members count:', row.membersCount);
                  console.log('Projects count:', row.projectsCount);
                  onDeleteTeam(row);
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={row.membersCount > 0 || row.projectsCount > 0} // Disable if team has members or projects
                title={row.membersCount > 0 || row.projectsCount > 0 ? 'Cannot delete team with members or projects' : 'Delete team'}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            ) : (
              <span className="text-gray-400 text-sm">No actions</span>
            )}
          </div>
        )
      };
    }
    return config;
  });
    
  return (
    <DynamicTable
      data={transformedTeams}
      columns={customTableConfig}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      selectedItems={selectedTeams || []}
      onPageChange={onPageChange}
      onRowClick={onTeamClick}
      onBulkSelect={onBulkSelect}
      theme={{
        primary: 'blue',
        secondary: 'gray',
        accent: 'blue'
      }}
      emptyMessage="No production teams available"
      selectable={!!onBulkSelect}
    />
  );
};

export default ProductionTeamsTable;
