import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { type NetSalary } from '../../apis/payroll';
import { payrollTableConfig } from './payrollTableConfig';

interface PayrollTableProps {
  salaries: NetSalary[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onRowClick: (salary: NetSalary) => void;
}

const PayrollTable: React.FC<PayrollTableProps> = ({
  salaries,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onRowClick,
}) => {
  // Format month name
  const getMonthName = (month: number, year: number) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Transform salaries to table data
  const tableData = salaries.map((salary) => ({
    id: salary.id.toString(),
    employeeName: (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-sm font-medium text-indigo-600">
            {salary.employee.firstName.charAt(0)}
            {salary.employee.lastName.charAt(0)}
          </span>
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {salary.employee.firstName} {salary.employee.lastName}
          </div>
          <div className="text-sm text-gray-500">{salary.employee.email}</div>
        </div>
      </div>
    ),
    department: salary.employee.department.name,
    role: salary.employee.role.title,
    month: (
      <span className="font-medium text-gray-700">
        {getMonthName(salary.month, salary.year)}
      </span>
    ),
    basicSalary: (
      <span className="text-gray-900 font-medium">
        {formatCurrency(salary.basicSalary)}
      </span>
    ),
    allowances: (
      <span className="text-green-600 font-medium">
        {salary.allowances > 0 ? `+${formatCurrency(salary.allowances)}` : '-'}
      </span>
    ),
    deductions: (
      <span className="text-red-600 font-medium">
        {salary.deductions > 0 ? `-${formatCurrency(salary.deductions)}` : '-'}
      </span>
    ),
    netAmount: (
      <span className="text-lg font-semibold text-gray-900">
        {formatCurrency(salary.netAmount)}
      </span>
    ),
    isPaid: (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          salary.isPaid
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        {salary.isPaid ? '✓ Paid' : '⏳ Pending'}
      </span>
    ),
    paidOn: (
      <span className={salary.paidOn ? 'text-gray-900' : 'text-gray-400'}>
        {formatDate(salary.paidOn)}
      </span>
    ),
    _original: salary,
  }));

  const handleRowClick = (row: any) => {
    onRowClick(row._original);
  };

  return (
    <DynamicTable
      columns={payrollTableConfig}
      data={tableData}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={onPageChange}
      onRowClick={handleRowClick}
      emptyMessage="No salary records found"
      theme={{
        primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        accent: 'text-indigo-600',
      }}
    />
  );
};

export default PayrollTable;

