import type { ColumnConfig } from '../../common/DynamicTable/DynamicTable';

// Badge configurations for different project statuses
const projectStatusBadgeConfig = {
  pending_assignment: { className: 'bg-yellow-100 text-yellow-800', text: 'PENDING ASSIGNMENT' },
  in_progress: { className: 'bg-blue-100 text-blue-800', text: 'IN PROGRESS' },
  onhold: { className: 'bg-orange-100 text-orange-800', text: 'ON HOLD' },
  completed: { className: 'bg-green-100 text-green-800', text: 'COMPLETED' }
};

const paymentStageBadgeConfig = {
  initial: { className: 'bg-gray-100 text-gray-800', text: 'INITIAL' },
  in_between: { className: 'bg-yellow-100 text-yellow-800', text: 'IN BETWEEN' },
  final: { className: 'bg-blue-100 text-blue-800', text: 'FINAL' },
  approved: { className: 'bg-green-100 text-green-800', text: 'APPROVED' }
};

// Production Projects Table Configuration
export const productionProjectsTableConfig: ColumnConfig[] = [
  
  {
    key: 'salesRep',
    label: 'Sales Rep',
    type: 'assignment',
    width: '15%'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    badgeConfig: projectStatusBadgeConfig,
    width: '12%',
    sortable: true
  },
  {
    key: 'liveProgress',
    label: 'Progress',
    type: 'custom',
    width: '12%',
    sortable: true
  },
  {
    key: 'unitHead',
    label: 'Unit Head',
    type: 'assignment',
    width: '15%'
  },
  {
    key: 'team',
    label: 'Team',
    type: 'text',
    width: '15%'
  },
  {
    key: 'deadline',
    label: 'Deadline',
    type: 'date',
    width: '12%',
    sortable: true
  },
  {
    key: 'paymentStage',
    label: 'Payment Stage',
    type: 'badge',
    badgeConfig: paymentStageBadgeConfig,
    width: '11%'
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'custom',
    width: '10%'
  }
];

