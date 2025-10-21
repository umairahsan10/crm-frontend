import type { ColumnConfig } from '../../common/DynamicTable/DynamicTable';

// Badge configurations for different unit statuses
const headStatusBadgeConfig = {
  assigned: { className: 'bg-green-100 text-green-800', text: 'ASSIGNED' },
  unassigned: { className: 'bg-gray-100 text-gray-800', text: 'UNASSIGNED' },
  pending: { className: 'bg-yellow-100 text-yellow-800', text: 'PENDING' }
};

const unitStatusBadgeConfig = {
  active: { className: 'bg-green-100 text-green-800', text: 'ACTIVE' },
  inactive: { className: 'bg-red-100 text-red-800', text: 'INACTIVE' },
  pending: { className: 'bg-yellow-100 text-yellow-800', text: 'PENDING' }
};

// Production Units Table Configuration
export const productionUnitsTableConfig: ColumnConfig[] = [
  {
    key: 'name',
    label: 'Unit Name',
    type: 'text',
    width: '25%',
    sortable: true
  },
  {
    key: 'head',
    label: 'Unit Head',
    type: 'assignment',
    width: '20%'
  },
  {
    key: 'teamsCount',
    label: 'Teams',
    type: 'text',
    width: '15%',
    sortable: true
  },
  {
    key: 'employeeCount',
    label: 'Employees',
    type: 'text',
    width: '15%',
    sortable: true
  },
  {
    key: 'createdAt',
    label: 'Created',
    type: 'date',
    width: '15%',
    sortable: true
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    badgeConfig: unitStatusBadgeConfig,
    width: '10%'
  }
];

// Unit Head Assignment Configuration
export const unitHeadAssignmentConfig: ColumnConfig[] = [
  {
    key: 'name',
    label: 'Unit Name',
    type: 'text',
    width: '30%',
    sortable: true
  },
  {
    key: 'head',
    label: 'Current Head',
    type: 'assignment',
    width: '25%'
  },
  {
    key: 'headStatus',
    label: 'Head Status',
    type: 'badge',
    badgeConfig: headStatusBadgeConfig,
    width: '20%'
  },
  {
    key: 'teamsCount',
    label: 'Teams',
    type: 'text',
    width: '15%'
  },
  {
    key: 'employeeCount',
    label: 'Employees',
    type: 'text',
    width: '10%'
  }
];

// Unit Statistics Configuration
export const unitStatisticsConfig: ColumnConfig[] = [
  {
    key: 'name',
    label: 'Unit Name',
    type: 'text',
    width: '25%'
  },
  {
    key: 'teamsCount',
    label: 'Teams',
    type: 'text',
    width: '15%'
  },
  {
    key: 'employeeCount',
    label: 'Employees',
    type: 'text',
    width: '15%'
  },
  {
    key: 'projectsCount',
    label: 'Active Projects',
    type: 'text',
    width: '15%'
  },
  {
    key: 'completionRate',
    label: 'Completion Rate',
    type: 'text',
    width: '15%'
  },
  {
    key: 'lastActivity',
    label: 'Last Activity',
    type: 'date',
    width: '15%'
  }
];
