import type { ColumnConfig } from '../../common/DynamicTable/DynamicTable';

const unitStatusBadgeConfig = {
  active: { className: 'bg-green-100 text-green-800', text: 'ACTIVE' },
  inactive: { className: 'bg-red-100 text-red-800', text: 'INACTIVE' },
  pending: { className: 'bg-yellow-100 text-yellow-800', text: 'PENDING' }
};

export const salesUnitsTableConfig: ColumnConfig[] = [
  { key: 'name', label: 'Unit Name', type: 'text', width: '25%', sortable: true },
  { key: 'head', label: 'Unit Head', type: 'assignment', width: '20%' },
  { key: 'teamsCount', label: 'Teams', type: 'text', width: '12%', sortable: true },
  { key: 'employeesCount', label: 'Employees', type: 'text', width: '12%', sortable: true },
  { key: 'leadsCount', label: 'Leads', type: 'text', width: '12%', sortable: true },
  { key: 'crackedLeadsCount', label: 'Completed Leads', type: 'text', width: '12%', sortable: true },
  { key: 'createdAt', label: 'Created', type: 'date', width: '12%', sortable: true },
  { key: 'status', label: 'Status', type: 'badge', badgeConfig: unitStatusBadgeConfig, width: '12%' },
  { key: 'actions', label: 'Actions', type: 'custom', width: '12%' }
];


