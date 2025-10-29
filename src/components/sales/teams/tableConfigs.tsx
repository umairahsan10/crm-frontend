import type { ColumnConfig } from '../../common/DynamicTable/DynamicTable';

// Badge configurations for different team statuses
const teamLeadStatusBadgeConfig = {
  assigned: { className: 'bg-green-100 text-green-800', text: 'ASSIGNED' },
  unassigned: { className: 'bg-gray-100 text-gray-800', text: 'UNASSIGNED' },
  pending: { className: 'bg-yellow-100 text-yellow-800', text: 'PENDING' }
};

const teamStatusBadgeConfig = {
  active: { className: 'bg-green-100 text-green-800', text: 'ACTIVE' },
  inactive: { className: 'bg-red-100 text-red-800', text: 'INACTIVE' },
  pending: { className: 'bg-yellow-100 text-yellow-800', text: 'PENDING' }
};

// Sales Teams Table Configuration
export const salesTeamsTableConfig: ColumnConfig[] = [
  {
    key: 'name',
    label: 'Team Name',
    type: 'text',
    width: '25%',
    sortable: true
  },
  {
    key: 'teamLead',
    label: 'Team Lead',
    type: 'assignment',
    width: '20%'
  },
  {
    key: 'salesUnit',
    label: 'Sales Unit',
    type: 'text',
    width: '18%',
    sortable: true
  },
  {
    key: 'membersCount',
    label: 'Members',
    type: 'text',
    width: '12%',
    sortable: true
  },
  {
    key: 'leadsCount',
    label: 'Active Leads',
    type: 'text',
    width: '12%',
    sortable: true
  },
  {
    key: 'completedLeads',
    label: 'Completed Leads',
    type: 'text',
    width: '12%',
    sortable: true
  },
  {
    key: 'createdAt',
    label: 'Created',
    type: 'date',
    width: '12%',
    sortable: true
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    badgeConfig: teamStatusBadgeConfig,
    width: '10%'
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'custom',
    width: '10%'
  }
];

// Team Lead Assignment Configuration
export const teamLeadAssignmentConfig: ColumnConfig[] = [
  {
    key: 'name',
    label: 'Team Name',
    type: 'text',
    width: '30%',
    sortable: true
  },
  {
    key: 'teamLead',
    label: 'Current Lead',
    type: 'assignment',
    width: '25%'
  },
  {
    key: 'leadStatus',
    label: 'Lead Status',
    type: 'badge',
    badgeConfig: teamLeadStatusBadgeConfig,
    width: '20%'
  },
  {
    key: 'membersCount',
    label: 'Members',
    type: 'text',
    width: '15%'
  },
  {
    key: 'leadsCount',
    label: 'Active Leads',
    type: 'text',
    width: '10%'
  }
];

// Team Statistics Configuration
export const teamStatisticsConfig: ColumnConfig[] = [
  {
    key: 'name',
    label: 'Team Name',
    type: 'text',
    width: '25%'
  },
  {
    key: 'membersCount',
    label: 'Members',
    type: 'text',
    width: '15%'
  },
  {
    key: 'leadsCount',
    label: 'Active Leads',
    type: 'text',
    width: '15%'
  },
  {
    key: 'completedLeads',
    label: 'Completed Leads',
    type: 'text',
    width: '15%'
  },
  {
    key: 'conversionRate',
    label: 'Conversion Rate',
    type: 'text',
    width: '15%'
  },
  {
    key: 'lastActivity',
    label: 'Last Activity',
    type: 'date',
    width: '15%'
  },
  {
    key: 'teamLead',
    label: 'Team Lead',
    type: 'assignment',
    width: '15%'
  }
];