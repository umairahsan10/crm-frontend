import type { ColumnConfig } from '../common/DynamicTable/DynamicTable';

export const employeesTableConfig: ColumnConfig[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'custom',
    sortable: true,
    render: (_value: any, row: any) => (
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {row.firstName.charAt(0)}{row.lastName.charAt(0)}
            </span>
          </div>
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">
            {row.firstName} {row.lastName}
          </div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      </div>
    )
  },
  {
    key: 'department',
    label: 'Department',
    type: 'custom',
    sortable: true,
    render: (value: any) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {value.name}
      </span>
    )
  },
  {
    key: 'role',
    label: 'Role',
    type: 'custom',
    sortable: true,
    render: (value: any) => (
      <span className="text-sm text-gray-900">{value.name}</span>
    )
  },
  {
    key: 'manager',
    label: 'Manager',
    type: 'custom',
    render: (value: any) => (
      <span className="text-sm text-gray-900">
        {value ? `${value.firstName} ${value.lastName}` : 'N/A'}
      </span>
    )
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    sortable: true,
    badgeConfig: {
      'active': {
        className: 'bg-green-100 text-green-800',
        text: 'Active'
      },
      'inactive': {
        className: 'bg-yellow-100 text-yellow-800',
        text: 'Inactive'
      },
      'terminated': {
        className: 'bg-red-100 text-red-800',
        text: 'Terminated'
      }
    }
  },
  {
    key: 'startDate',
    label: 'Start Date',
    type: 'date',
    sortable: true
  }
];
