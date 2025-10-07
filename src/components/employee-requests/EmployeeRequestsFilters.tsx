import React from 'react';

interface EmployeeRequestsFiltersProps {
  statusFilter: string;
  priorityFilter: string;
  departmentFilter: string;
  requestTypeFilter: string;
  exportFormat: 'csv' | 'json';
  onStatusFilter: (status: string) => void;
  onPriorityFilter: (priority: string) => void;
  onDepartmentFilter: (department: string) => void;
  onRequestTypeFilter: (type: string) => void;
  onExportFormatChange: (format: 'csv' | 'json') => void;
  onClearFilters: () => void;
}

const EmployeeRequestsFilters: React.FC<EmployeeRequestsFiltersProps> = ({
  statusFilter,
  priorityFilter,
  departmentFilter,
  requestTypeFilter,
  exportFormat,
  onStatusFilter,
  onPriorityFilter,
  onDepartmentFilter,
  onRequestTypeFilter,
  onExportFormatChange,
  onClearFilters
}) => {
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Status">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In_Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Priority">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => onDepartmentFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Departments">All Departments</option>
              <option value="Development">Development</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Production">Production</option>
              <option value="HR">HR</option>
              <option value="Accounts">Accounts</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Request Type</label>
            <select
              value={requestTypeFilter}
              onChange={(e) => onRequestTypeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Types">All Types</option>
              <option value="Leave Request">Leave Request</option>
              <option value="Salary Request">Salary Request</option>
              <option value="Equipment Request">Equipment Request</option>
              <option value="Training Request">Training Request</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => onExportFormatChange(e.target.value as 'csv' | 'json')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRequestsFilters;

