import type { ColumnConfig } from '../../common/DynamicTable/DynamicTable';

// Badge configurations for salary status
const statusBadgeConfig = {
  paid: { className: 'bg-green-100 text-green-800', text: 'PAID' },
  pending: { className: 'bg-yellow-100 text-yellow-800', text: 'PENDING' },
  processing: { className: 'bg-blue-100 text-blue-800', text: 'PROCESSING' }
};

const departmentBadgeConfig = {
  'Sales': { className: 'bg-blue-100 text-blue-800', text: 'SALES' },
  'Marketing': { className: 'bg-purple-100 text-purple-800', text: 'MARKETING' },
  'HR': { className: 'bg-pink-100 text-pink-800', text: 'HR' },
  'Finance': { className: 'bg-green-100 text-green-800', text: 'FINANCE' },
  'Production': { className: 'bg-orange-100 text-orange-800', text: 'PRODUCTION' },
  'Accounts': { className: 'bg-indigo-100 text-indigo-800', text: 'ACCOUNTS' }
};

// Salary Table Configuration (matching API structure)
export const salaryTableConfig: ColumnConfig[] = [
  {
    key: 'employeeName',
    label: 'Employee Name',
    type: 'text',
    width: '20%'
  },
  {
    key: 'department',
    label: 'Department',
    type: 'badge',
    badgeConfig: departmentBadgeConfig,
    width: '15%'
  },
  {
    key: 'baseSalary',
    label: 'Base Salary',
    type: 'currency',
    width: '15%'
  },
  {
    key: 'commission',
    label: 'Commission',
    type: 'currency',
    width: '15%'
  },
  {
    key: 'bonus',
    label: 'Bonus',
    type: 'currency',
    width: '15%'
  },
  {
    key: 'finalSalary',
    label: 'Final Salary',
    type: 'currency',
    width: '15%'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    badgeConfig: statusBadgeConfig,
    width: '10%'
  },
  {
    key: 'paidOn',
    label: 'Paid On',
    type: 'date',
    width: '15%'
  }
];
