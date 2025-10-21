import type { ColumnConfig } from '../common/DynamicTable/DynamicTable';

// Badge configurations for different types
const statusBadgeConfig = {
  active: { className: 'bg-green-100 text-green-800', text: 'ACTIVE' },
  inactive: { className: 'bg-red-100 text-red-800', text: 'INACTIVE' }
};



// Company Table Configuration
export const companyTableConfig: ColumnConfig[] = [
  {
    key: 'contact',
    label: 'Company Information',
    type: 'contact',
    width: '25%'
  },
  {
    key: 'website',
    label: 'Website',
    type: 'website',
    width: '20%'
  },
  {
    key: 'address',
    label: 'Address',
    type: 'text',
    width: '20%'
  },
  {
    key: 'country',
    label: 'Country',
    type: 'text',
    width: '10%'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    badgeConfig: statusBadgeConfig,
    width: '10%'
  }
];

