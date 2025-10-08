import type { ColumnConfig } from '../common/DynamicTable/DynamicTable';

// Badge configurations for asset categories
const categoryBadgeConfig = {
  'IT Equipment': { className: 'bg-blue-100 text-blue-800', text: 'IT EQUIPMENT' },
  'Furniture': { className: 'bg-brown-100 text-brown-800', text: 'FURNITURE' },
  'Vehicles': { className: 'bg-purple-100 text-purple-800', text: 'VEHICLES' },
  'Machinery': { className: 'bg-gray-100 text-gray-800', text: 'MACHINERY' },
  'Office Equipment': { className: 'bg-cyan-100 text-cyan-800', text: 'OFFICE' },
  'Software': { className: 'bg-green-100 text-green-800', text: 'SOFTWARE' },
  'Property': { className: 'bg-indigo-100 text-indigo-800', text: 'PROPERTY' },
  'Other': { className: 'bg-gray-100 text-gray-800', text: 'OTHER' }
};

// Assets Table Configuration (matching API structure)
export const assetsTableConfig: ColumnConfig[] = [
  {
    key: 'name',
    label: 'Asset Name',
    type: 'text',
    width: '25%'
  },
  {
    key: 'category',
    label: 'Category',
    type: 'badge',
    badgeConfig: categoryBadgeConfig,
    width: '15%'
  },
  {
    key: 'purchaseValue',
    label: 'Purchase Value',
    type: 'currency',
    width: '15%'
  },
  {
    key: 'currentValue',
    label: 'Current Value',
    type: 'currency',
    width: '15%'
  },
  {
    key: 'purchaseDate',
    label: 'Purchase Date',
    type: 'date',
    width: '15%'
  },
  {
    key: 'vendor',
    label: 'Vendor',
    type: 'assignment',
    width: '15%'
  }
];

