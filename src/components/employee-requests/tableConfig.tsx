import type { ColumnConfig } from '../common/DynamicTable/DynamicTable';

export const employeeRequestsTableConfig: ColumnConfig[] = [
  {
    key: 'request_id',
    label: 'Request ID',
    type: 'custom',
    sortable: true,
    render: (value: number) => (
      <span className="text-sm font-medium text-gray-900">#{value}</span>
    )
  },
  {
    key: 'employee',
    label: 'Employee',
    type: 'custom',
    render: (_value: any, row: any) => (
      <div className="max-w-xs">
        <div className="text-sm font-medium text-gray-900">{row.employee_name}</div>
        <div className="text-sm text-gray-500">{row.employee_email}</div>
      </div>
    )
  },
  {
    key: 'department_name',
    label: 'Department',
    type: 'text',
    sortable: true
  },
  {
    key: 'request_type',
    label: 'Request Type',
    type: 'text',
    sortable: true
  },
  {
    key: 'subject',
    label: 'Subject',
    type: 'custom',
    render: (value: string) => (
      <div className="max-w-xs">
        <span className="text-sm text-gray-900 truncate block" title={value}>
          {value}
        </span>
      </div>
    )
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'badge',
    sortable: true,
    badgeConfig: {
      'Urgent': {
        className: 'bg-red-100 text-red-800',
        text: 'Urgent'
      },
      'High': {
        className: 'bg-orange-100 text-orange-800',
        text: 'High'
      },
      'Medium': {
        className: 'bg-yellow-100 text-yellow-800',
        text: 'Medium'
      },
      'Low': {
        className: 'bg-green-100 text-green-800',
        text: 'Low'
      }
    }
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    sortable: true,
    badgeConfig: {
      'Pending': {
        className: 'bg-yellow-100 text-yellow-800',
        text: 'Pending'
      },
      'In_Progress': {
        className: 'bg-blue-100 text-blue-800',
        text: 'In Progress'
      },
      'Resolved': {
        className: 'bg-green-100 text-green-800',
        text: 'Resolved'
      },
      'Rejected': {
        className: 'bg-red-100 text-red-800',
        text: 'Rejected'
      },
      'Cancelled': {
        className: 'bg-gray-100 text-gray-800',
        text: 'Cancelled'
      }
    }
  },
  {
    key: 'assigned_to_name',
    label: 'Assigned To',
    type: 'text'
  },
  {
    key: 'requested_on',
    label: 'Requested On',
    type: 'date',
    sortable: true
  }
];

