/**
 * HR Admin Requests Table Configuration for DynamicTable
 * Following the exact pattern of leads/tableConfigs.ts
 */

import { type ColumnConfig } from '../common/DynamicTable/DynamicTable';

export const adminHRRequestsTableConfig: ColumnConfig[] = [
  {
    key: 'request_id',
    label: 'ID',
    type: 'text',
    sortable: true,
    width: '80px',
    render: (value) => `#${value}`
  },
  {
    key: 'type',
    label: 'Request Type',
    type: 'badge',
    sortable: true,
    badgeConfig: {
      salary_increase: {
        className: 'bg-purple-100 text-purple-800',
        text: 'SALARY INCREASE'
      },
      late_approval: {
        className: 'bg-indigo-100 text-indigo-800',
        text: 'LATE APPROVAL'
      },
      others: {
        className: 'bg-gray-100 text-gray-800',
        text: 'OTHERS'
      }
    }
  },
  {
    key: 'description',
    label: 'Description',
    type: 'text',
    sortable: false,
    className: 'text-sm text-gray-700'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    sortable: true,
    badgeConfig: {
      pending: {
        className: 'bg-yellow-100 text-yellow-800',
        text: 'PENDING'
      },
      approved: {
        className: 'bg-green-100 text-green-800',
        text: 'APPROVED'
      },
      rejected: {
        className: 'bg-red-100 text-red-800',
        text: 'REJECTED'
      }
    }
  },
  {
    key: 'hr_employee_name',
    label: 'HR Employee',
    type: 'text',
    sortable: true,
    className: 'font-medium text-gray-900'
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'date',
    sortable: true
  },
  {
    key: 'updated_at',
    label: 'Updated',
    type: 'date',
    sortable: true
  }
];

