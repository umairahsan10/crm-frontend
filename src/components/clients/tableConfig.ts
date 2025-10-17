/**
 * Clients Table Configuration for DynamicTable
 * Following the exact pattern of leads/tableConfigs.ts
 */

import { type ColumnConfig } from '../common/DynamicTable/DynamicTable';

export const clientsTableConfig: ColumnConfig[] = [
  {
    key: 'id',
    label: 'ID',
    type: 'text',
    sortable: true,
    width: '80px',
    render: (value) => `#${value}`
  },
  {
    key: 'clientName',
    label: 'Client Name',
    type: 'text',
    sortable: true,
    className: 'font-medium text-gray-900'
  },
  {
    key: 'companyName',
    label: 'Company',
    type: 'text',
    sortable: true
  },
  {
    key: 'email',
    label: 'Email',
    type: 'text',
    sortable: true,
    className: 'text-sm text-gray-600'
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'text',
    sortable: false
  },
  {
    key: 'clientType',
    label: 'Type',
    type: 'badge',
    sortable: true,
    badgeConfig: {
      individual: {
        className: 'bg-purple-100 text-purple-800',
        text: 'INDIVIDUAL'
      },
      enterprise: {
        className: 'bg-indigo-100 text-indigo-800',
        text: 'ENTERPRISE'
      },
      smb: {
        className: 'bg-green-100 text-green-800',
        text: 'SMB'
      },
      startup: {
        className: 'bg-orange-100 text-orange-800',
        text: 'STARTUP'
      }
    }
  },
  {
    key: 'accountStatus',
    label: 'Status',
    type: 'badge',
    sortable: true,
    badgeConfig: {
      prospect: {
        className: 'bg-blue-100 text-blue-800',
        text: 'PROSPECT'
      },
      active: {
        className: 'bg-green-100 text-green-800',
        text: 'ACTIVE'
      },
      inactive: {
        className: 'bg-gray-100 text-gray-800',
        text: 'INACTIVE'
      },
      suspended: {
        className: 'bg-yellow-100 text-yellow-800',
        text: 'SUSPENDED'
      },
      churned: {
        className: 'bg-red-100 text-red-800',
        text: 'CHURNED'
      }
    }
  },
  {
    key: 'industry',
    label: 'Industry',
    type: 'text',
    sortable: true
  },
  {
    key: 'totalRevenue',
    label: 'Revenue',
    type: 'currency',
    sortable: true,
    render: (value) => value !== undefined ? `$${value.toLocaleString()}` : 'N/A'
  },
  {
    key: 'createdAt',
    label: 'Created',
    type: 'date',
    sortable: true
  }
];

