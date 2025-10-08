import type { ColumnConfig } from '../common/DynamicTable/DynamicTable';

// Badge configurations for liability categories
const categoryBadgeConfig = {
  'Rent': { className: 'bg-pink-100 text-pink-800', text: 'RENT' },
  'Loan': { className: 'bg-purple-100 text-purple-800', text: 'LOAN' },
  'Credit Card': { className: 'bg-blue-100 text-blue-800', text: 'CREDIT CARD' },
  'Utilities': { className: 'bg-cyan-100 text-cyan-800', text: 'UTILITIES' },
  'Salary': { className: 'bg-orange-100 text-orange-800', text: 'SALARY' },
  'Vendor Payment': { className: 'bg-indigo-100 text-indigo-800', text: 'VENDOR' },
  'Tax': { className: 'bg-red-100 text-red-800', text: 'TAX' },
  'Other': { className: 'bg-gray-100 text-gray-800', text: 'OTHER' }
};

const statusBadgeConfig = {
  paid: { className: 'bg-green-100 text-green-800', text: 'PAID' },
  unpaid: { className: 'bg-red-100 text-red-800', text: 'UNPAID' },
  overdue: { className: 'bg-orange-100 text-orange-800', text: 'OVERDUE' }
};

// Liabilities Table Configuration (matching API structure)
export const liabilitiesTableConfig: ColumnConfig[] = [
  {
    key: 'name',
    label: 'Liability Name',
    type: 'text',
    width: '25%'
  },
  {
    key: 'amount',
    label: 'Amount',
    type: 'currency',
    width: '15%'
  },
  {
    key: 'category',
    label: 'Category',
    type: 'badge',
    badgeConfig: categoryBadgeConfig,
    width: '15%'
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    type: 'date',
    width: '15%'
  },
  {
    key: 'isPaid',
    label: 'Status',
    type: 'custom',
    width: '15%'
  },
  {
    key: 'vendor',
    label: 'Vendor',
    type: 'assignment',
    width: '15%'
  }
];

