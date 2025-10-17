/**
 * Attendance Table Configuration for DynamicTable
 * Following the exact pattern of leads/tableConfigs.ts
 */

import { type ColumnConfig } from '../common/DynamicTable/DynamicTable';

export const attendanceTableConfig: ColumnConfig[] = [
  {
    key: 'id',
    label: 'ID',
    type: 'text',
    sortable: true,
    width: '80px',
    render: (value) => `#${value}`
  },
  {
    key: 'employee',
    label: 'Employee',
    type: 'text',
    sortable: true,
    className: 'font-medium text-gray-900',
    render: (value) => {
      if (typeof value === 'object' && value) {
        return `${value.firstName} ${value.lastName}`;
      }
      return value || 'N/A';
    }
  },
  {
    key: 'date',
    label: 'Date',
    type: 'date',
    sortable: true
  },
  {
    key: 'checkIn',
    label: 'Check In',
    type: 'text',
    sortable: true,
    render: (value) => value || 'N/A'
  },
  {
    key: 'checkOut',
    label: 'Check Out',
    type: 'text',
    sortable: true,
    render: (value) => value || 'N/A'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    sortable: true,
    badgeConfig: {
      present: {
        className: 'bg-green-100 text-green-800',
        text: 'PRESENT'
      },
      absent: {
        className: 'bg-red-100 text-red-800',
        text: 'ABSENT'
      },
      late: {
        className: 'bg-yellow-100 text-yellow-800',
        text: 'LATE'
      },
      half_day: {
        className: 'bg-orange-100 text-orange-800',
        text: 'HALF DAY'
      },
      leave: {
        className: 'bg-blue-100 text-blue-800',
        text: 'LEAVE'
      }
    }
  },
  {
    key: 'totalHours',
    label: 'Hours',
    type: 'text',
    sortable: true,
    render: (value) => value ? `${value}h` : 'N/A'
  },
  {
    key: 'remarks',
    label: 'Remarks',
    type: 'text',
    sortable: false
  }
];

