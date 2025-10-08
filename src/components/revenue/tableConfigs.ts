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
    key: 'lead',
    label: 'Client',
    type: 'assignment',
    width: '20%'
  }
];

