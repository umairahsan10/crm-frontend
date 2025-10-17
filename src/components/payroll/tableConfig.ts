/**
 * Payroll Table Configuration for DynamicTable
 * Following the exact pattern of leads/tableConfigs.ts
 */

import { type ColumnConfig } from '../common/DynamicTable/DynamicTable';

export const payrollTableConfig: ColumnConfig[] = [
  {
    key: 'id',
    label: 'ID',
    type: 'text',
    sortable: true,
    width: '80px',
    render: (value) => `#${value}`
  },
  {
    key: 'employee',
    label: 'Employee',
    type: 'text',
    sortable: true,
    className: 'font-medium text-gray-900',
    render: (value) => {
      if (typeof value === 'object' && value) {
        return `${value.firstName} ${value.lastName}`;
      }
      return value || 'N/A';
    }
  },
  {
    key: 'month',
    label: 'Month',
    type: 'text',
    sortable: true
  },
  {
    key: 'year',
    label: 'Year',
    type: 'text',
    sortable: true
  },
  {
    key: 'baseSalary',
    label: 'Base Salary',
    type: 'currency',
    sortable: true,
    render: (value) => value !== undefined ? `$${value.toLocaleString()}` : 'N/A'
  },
  {
    key: 'totalDeductions',
    label: 'Deductions',
    type: 'currency',
    sortable: true,
    render: (value) => value !== undefined ? `$${value.toLocaleString()}` : 'N/A'
  },
  {
    key: 'netSalary',
    label: 'Net Salary',
    type: 'currency',
    sortable: true,
    className: 'font-bold text-green-600',
    render: (value) => value !== undefined ? `$${value.toLocaleString()}` : 'N/A'
  },
  {
    key: 'isPaid',
    label: 'Payment Status',
    type: 'badge',
    sortable: true,
    badgeConfig: {
      true: {
        className: 'bg-green-100 text-green-800',
        text: 'PAID'
      },
      false: {
        className: 'bg-yellow-100 text-yellow-800',
        text: 'PENDING'
      }
    },
    render: (value) => value ? 'true' : 'false'
  },
  {
    key: 'createdAt',
    label: 'Created',
    type: 'date',
    sortable: true
  }
];

