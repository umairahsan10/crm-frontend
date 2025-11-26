import type { ColumnConfig } from '../common/DynamicTable/DynamicTable';

// Badge configurations for payment method
const paymentMethodBadgeConfig = {
  bank: { className: 'bg-blue-100 text-blue-800', text: 'BANK' },
  cash: { className: 'bg-green-100 text-green-800', text: 'CASH' },
  credit_card: { className: 'bg-purple-100 text-purple-800', text: 'CREDIT CARD' },
  online: { className: 'bg-indigo-100 text-indigo-800', text: 'ONLINE' }
};

const categoryBadgeConfig = {
  'Software Development': { className: 'bg-blue-100 text-blue-800', text: 'SOFTWARE DEV' },
  'Consulting': { className: 'bg-purple-100 text-purple-800', text: 'CONSULTING' },
  'Product Sales': { className: 'bg-green-100 text-green-800', text: 'PRODUCT' },
  'Subscription': { className: 'bg-indigo-100 text-indigo-800', text: 'SUBSCRIPTION' },
  'Support': { className: 'bg-cyan-100 text-cyan-800', text: 'SUPPORT' },
  'Training': { className: 'bg-orange-100 text-orange-800', text: 'TRAINING' },
  'License': { className: 'bg-pink-100 text-pink-800', text: 'LICENSE' },
  'Other': { className: 'bg-gray-100 text-gray-800', text: 'OTHER' }
};

// Revenue Table Configuration (matching API structure)
export const revenueTableConfig: ColumnConfig[] = [
  {
    key: 'source',
    label: 'Source',
    type: 'text',
    width: '20%'
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
    key: 'receivedOn',
    label: 'Received On',
    type: 'date',
    width: '15%'
  },
  {
    key: 'client',
    label: 'Client',
    type: 'custom',
    width: '20%',
    render: (_value: any, row: any) => {
      const client = row.transaction?.client;
      if (!client) {
        return (
          <div className="text-sm text-gray-400 italic">No client</div>
        );
      }
      return (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500">
                {client.companyName?.charAt(0).toUpperCase() || client.clientName?.charAt(0).toUpperCase() || 'C'}
              </span>
            </div>
          </div>
          <div className="ml-3 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {client.companyName || client.clientName || 'N/A'}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {client.email || 'N/A'}
            </div>
          </div>
        </div>
      );
    }
  }
];

