import { type ColumnConfig } from '../common/DynamicTable/DynamicTable';

export const payrollTableConfig: ColumnConfig[] = [
  {
    key: 'employeeName',
    label: 'Employee Name',
    type: 'custom',
    sortable: true,
  },
  {
    key: 'department',
    label: 'Department',
    type: 'text',
    sortable: true,
  },
  {
    key: 'role',
    label: 'Role',
    type: 'text',
    sortable: true,
  },
  {
    key: 'month',
    label: 'Month',
    type: 'custom',
    sortable: true,
  },
  {
    key: 'basicSalary',
    label: 'Basic Salary',
    type: 'custom',
    sortable: true,
  },
  {
    key: 'allowances',
    label: 'Allowances',
    type: 'custom',
    sortable: true,
  },
  {
    key: 'deductions',
    label: 'Deductions',
    type: 'custom',
    sortable: true,
  },
  {
    key: 'netAmount',
    label: 'Net Salary',
    type: 'custom',
    sortable: true,
  },
  {
    key: 'isPaid',
    label: 'Payment Status',
    type: 'custom',
    sortable: true,
  },
  {
    key: 'paidOn',
    label: 'Paid On',
    type: 'custom',
    sortable: true,
  },
];

