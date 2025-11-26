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
    width: '15%',
    render: (_value: any, row: any) => {
      const isPaid = row.isPaid;
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isPaid ? 'PAID' : 'UNPAID'}
        </span>
      );
    }
  },
  {
    key: 'vendor',
    label: 'Vendor',
    type: 'custom',
    width: '15%',
    render: (_value: any, row: any) => {
      const vendor = row.vendor;
      if (!vendor) {
        return (
          <div className="text-sm text-gray-400 italic">No vendor</div>
        );
      }
      return (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500">
                {vendor.name?.charAt(0).toUpperCase() || 'V'}
              </span>
            </div>
          </div>
          <div className="ml-3 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {vendor.name || 'N/A'}
            </div>
            {vendor.email && (
              <div className="text-xs text-gray-500 truncate">
                {vendor.email}
              </div>
            )}
          </div>
        </div>
      );
    }
  }
];


