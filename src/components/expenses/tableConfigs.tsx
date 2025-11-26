import type { ColumnConfig } from '../common/DynamicTable/DynamicTable';

// Badge configurations for payment method
const paymentMethodBadgeConfig = {
  bank: { className: 'bg-blue-100 text-blue-800', text: 'BANK' },
  cash: { className: 'bg-green-100 text-green-800', text: 'CASH' },
  credit_card: { className: 'bg-purple-100 text-purple-800', text: 'CREDIT CARD' },
  online: { className: 'bg-indigo-100 text-indigo-800', text: 'ONLINE' }
};

const categoryBadgeConfig = {
  'Office Expenses': { className: 'bg-blue-100 text-blue-800', text: 'OFFICE' },
  'Salary': { className: 'bg-purple-100 text-purple-800', text: 'SALARY' },
  'Marketing': { className: 'bg-orange-100 text-orange-800', text: 'MARKETING' },
  'Utilities': { className: 'bg-cyan-100 text-cyan-800', text: 'UTILITIES' },
  'Travel': { className: 'bg-indigo-100 text-indigo-800', text: 'TRAVEL' },
  'Equipment': { className: 'bg-gray-100 text-gray-800', text: 'EQUIPMENT' },
  'Rent': { className: 'bg-pink-100 text-pink-800', text: 'RENT' },
  'Software': { className: 'bg-green-100 text-green-800', text: 'SOFTWARE' },
  'Other': { className: 'bg-gray-100 text-gray-800', text: 'OTHER' }
};

// Regular Expenses Table Configuration (matching API structure)
export const regularExpensesTableConfig: ColumnConfig[] = [
  {
    key: 'title',
    label: 'Title',
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
    key: 'paymentMethod',
    label: 'Payment Method',
    type: 'badge',
    badgeConfig: paymentMethodBadgeConfig,
    width: '15%'
  },
  {
    key: 'paidOn',
    label: 'Paid On',
    type: 'date',
    width: '15%'
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


