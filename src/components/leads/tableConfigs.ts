import type { ColumnConfig } from '../common/DynamicTable/DynamicTable';

// Badge configurations for different types
const statusBadgeConfig = {
  new: { className: 'bg-blue-100 text-blue-800', text: 'NEW' },
  in_progress: { className: 'bg-yellow-100 text-yellow-800', text: 'IN PROGRESS' },
  completed: { className: 'bg-green-100 text-green-800', text: 'COMPLETED' },
  payment_link_generated: { className: 'bg-purple-100 text-purple-800', text: 'PAYMENT LINK' },
  failed: { className: 'bg-red-100 text-red-800', text: 'FAILED' },
  cracked: { className: 'bg-green-100 text-green-800', text: 'CRACKED' }
};

const typeBadgeConfig = {
  warm: { className: 'bg-orange-100 text-orange-800', text: 'WARM' },
  cold: { className: 'bg-blue-100 text-blue-800', text: 'COLD' },
  upsell: { className: 'bg-indigo-100 text-indigo-800', text: 'UPSELL' },
  push: { className: 'bg-purple-100 text-purple-800', text: 'PUSH' }
};

const outcomeBadgeConfig = {
  interested: { className: 'bg-green-100 text-green-800', text: 'INTERESTED' },
  denied: { className: 'bg-red-100 text-red-800', text: 'DENIED' },
  voice_mail: { className: 'bg-blue-100 text-blue-800', text: 'VOICE MAIL' },
  busy: { className: 'bg-orange-100 text-orange-800', text: 'BUSY' },
  not_answered: { className: 'bg-gray-100 text-gray-800', text: 'NOT ANSWERED' }
};

const qualityRatingBadgeConfig = {
  excellent: { className: 'bg-green-100 text-green-800', text: 'EXCELLENT' },
  very_good: { className: 'bg-blue-100 text-blue-800', text: 'VERY GOOD' },
  good: { className: 'bg-yellow-100 text-yellow-800', text: 'GOOD' },
  bad: { className: 'bg-orange-100 text-orange-800', text: 'BAD' },
  useless: { className: 'bg-red-100 text-red-800', text: 'USELESS' }
};

// Regular Leads Table Configuration
export const regularLeadsTableConfig: ColumnConfig[] = [
  {
    key: 'contact',
    label: 'Contact Information',
    type: 'contact',
    width: '25%'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    badgeConfig: statusBadgeConfig,
    width: '15%'
  },
  {
    key: 'type',
    label: 'Type',
    type: 'badge',
    badgeConfig: typeBadgeConfig,
    width: '15%'
  },
  {
    key: 'outcome',
    label: 'Outcome',
    type: 'badge',
    badgeConfig: outcomeBadgeConfig,
    width: '15%'
  },
  {
    key: 'assignedTo',
    label: 'Assigned To',
    type: 'assignment',
    width: '20%'
  }
];

// Cracked Leads Table Configuration
export const crackedLeadsTableConfig: ColumnConfig[] = [
  {
    key: 'lead',
    label: 'Contact Information',
    type: 'contact',
    width: '25%'
  },
  {
    key: 'amount',
    label: 'Deal Amount',
    type: 'currency',
    width: '20%'
  },
  {
    key: 'phase',
    label: 'Phase Progress',
    type: 'phase',
    width: '20%'
  },
  {
    key: 'commission',
    label: 'Commission',
    type: 'commission',
    width: '20%'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    badgeConfig: { cracked: { className: 'bg-green-100 text-green-800', text: 'CRACKED' } },
    width: '15%'
  }
];

// Archived Leads Table Configuration
export const archivedLeadsTableConfig: ColumnConfig[] = [
  {
    key: 'contact',
    label: 'Contact Information',
    type: 'contact',
    width: '25%'
  },
  {
    key: 'source',
    label: 'Source & Outcome',
    type: 'custom',
    width: '20%'
  },
  {
    key: 'qualityRating',
    label: 'Quality Rating',
    type: 'badge',
    badgeConfig: qualityRatingBadgeConfig,
    width: '15%'
  },
  {
    key: 'archivedOn',
    label: 'Archived On',
    type: 'date',
    width: '20%'
  },
  {
    key: 'employee',
    label: 'Assigned To',
    type: 'assignment',
    width: '20%'
  }
];
