/**
 * HR Admin Requests Table Configuration for DynamicTable
 * Following the exact pattern of leads/tableConfigs.ts
 */

import React from 'react';
import { type ColumnConfig } from '../common/DynamicTable/DynamicTable';

// Helper function to format date as MM/DD/YYYY
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch {
    return 'N/A';
  }
};

// Helper function to get initials from name
const getInitials = (firstName: string | null, lastName: string | null): string => {
  const first = firstName?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return first + last || 'N/A';
};

export const adminHRRequestsTableConfig: ColumnConfig[] = [
  {
    key: 'hr_employee_name',
    label: 'NAME',
    type: 'custom',
    sortable: true,
    render: (_value: any, row: any) => {
      const firstName = row.hrFirstName || '';
      const lastName = row.hrLastName || '';
      const name = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || 'N/A';
      const email = row.hr_employee_email || 'N/A';
      const initials = getInitials(firstName, lastName);

      return React.createElement('div', { className: 'flex items-center' },
        React.createElement('div', { className: 'flex-shrink-0 h-10 w-10' },
          React.createElement('div', { className: 'h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center' },
            React.createElement('span', { className: 'text-sm font-medium text-gray-700' }, initials)
          )
        ),
        React.createElement('div', { className: 'ml-4' },
          React.createElement('div', { className: 'text-sm font-medium text-gray-900' }, name),
          React.createElement('div', { className: 'text-sm text-gray-500' }, email)
        )
      );
    }
  },
  {
    key: 'type',
    label: 'Type',
    type: 'badge',
    sortable: true,
    badgeConfig: {
      salary_increase: {
        className: 'bg-purple-100 text-purple-800',
        text: 'SALARY INCREASE'
      },
      late_approval: {
        className: 'bg-indigo-100 text-indigo-800',
        text: 'LATE APPROVAL'
      },
      others: {
        className: 'bg-gray-100 text-gray-800',
        text: 'OTHERS'
      }
    }
  },
  {
    key: 'description',
    label: 'Description',
    type: 'text',
    sortable: false,
    className: 'text-sm text-gray-700'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    sortable: true,
    badgeConfig: {
      pending: {
        className: 'bg-yellow-100 text-yellow-800',
        text: 'PENDING'
      },
      approved: {
        className: 'bg-green-100 text-green-800',
        text: 'APPROVED'
      },
      declined: {
        className: 'bg-red-100 text-red-800',
        text: 'DECLINED'
      }
    }
  },
  {
    key: 'created_at',
    label: 'Date',
    type: 'custom',
    sortable: true,
    render: (value: string) => 
      React.createElement('span', { className: 'text-sm text-gray-900' }, formatDate(value))
  }
];

