import type { ColumnConfig } from '../../../components/common/DynamicTable/DynamicTable';

// Departments Table Config
export const departmentsTableConfig: ColumnConfig[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    sortable: true,
  },
  {
    key: 'description',
    label: 'Description',
    type: 'text',
    sortable: true,
  },
  {
    key: 'manager',
    label: 'Manager',
    type: 'custom',
    render: (value: any) => (
      <span className="text-sm text-gray-900">
        {value ? `${value.firstName} ${value.lastName}` : 'Not assigned'}
      </span>
    ),
  },
  {
    key: 'employeeCount',
    label: 'Employees',
    type: 'text',
    sortable: true,
    render: (value: any) => (
      <span className="text-sm text-gray-900">{value || 0}</span>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'custom',
    render: (_value: any, row: any) => (
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (row.onDelete) row.onDelete(row);
          }}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    ),
  },
];

// Roles Table Config
export const rolesTableConfig: ColumnConfig[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'custom',
    sortable: true,
    render: (value: string) => {
      const roleMap: Record<string, string> = {
        'dep_manager': 'Department Manager',
        'team_lead': 'Team Lead',
        'senior': 'Senior',
        'junior': 'Junior',
        'unit_head': 'Unit Head',
      };
      return (
        <span className="text-sm font-medium text-gray-900">
          {roleMap[value] || value}
        </span>
      );
    },
  },
  {
    key: 'description',
    label: 'Description',
    type: 'text',
    sortable: true,
  },
  {
    key: 'employeeCount',
    label: 'Employees',
    type: 'text',
    sortable: true,
    render: (value: any) => (
      <span className="text-sm text-gray-900">{value || 0}</span>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'custom',
    render: (_value: any, row: any) => (
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (row.onDelete) row.onDelete(row);
          }}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    ),
  },
];

// HR Permissions Table Config
export const hrPermissionsTableConfig: ColumnConfig[] = [
  {
    key: 'employee',
    label: 'Employee',
    type: 'custom',
    render: (value: any) => (
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {value?.firstName?.charAt(0) || ''}{value?.lastName?.charAt(0) || ''}
            </span>
          </div>
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">
            {value ? `${value.firstName} ${value.lastName}` : 'N/A'}
          </div>
          <div className="text-sm text-gray-500">{value?.email || 'N/A'}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'department',
    label: 'Department',
    type: 'custom',
    render: (_value: any, row: any) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {row.employee?.department?.name || 'N/A'}
      </span>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'custom',
    render: (_value: any, row: any) => (
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (row.onEdit) row.onEdit(row);
          }}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (row.onDelete) row.onDelete(row);
          }}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    ),
  },
];

// Accountant Permissions Table Config
export const accountantPermissionsTableConfig: ColumnConfig[] = [
  {
    key: 'employee',
    label: 'Employee',
    type: 'custom',
    render: (value: any) => (
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {value?.firstName?.charAt(0) || ''}{value?.lastName?.charAt(0) || ''}
            </span>
          </div>
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">
            {value ? `${value.firstName} ${value.lastName}` : 'N/A'}
          </div>
          <div className="text-sm text-gray-500">{value?.email || 'N/A'}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'department',
    label: 'Department',
    type: 'custom',
    render: (_value: any, row: any) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {row.employee?.department?.name || 'N/A'}
      </span>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'custom',
    render: (_value: any, row: any) => (
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (row.onEdit) row.onEdit(row);
          }}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (row.onDelete) row.onDelete(row);
          }}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    ),
  },
];

