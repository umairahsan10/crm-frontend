import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { regularExpensesTableConfig } from './tableConfigs';

interface ApprovedExpensesTableProps {
  expenses: any[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onExpenseClick: (expense: any) => void;
  onBulkSelect: (expenseIds: string[]) => void;
  selectedExpenses: string[];
}

const ApprovedExpensesTable: React.FC<ApprovedExpensesTableProps> = ({
  expenses,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onExpenseClick,
  onBulkSelect,
  selectedExpenses
}) => {
  return (
    <DynamicTable
      data={expenses}
      columns={regularExpensesTableConfig}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      selectedItems={selectedExpenses}
      onPageChange={onPageChange}
      onRowClick={onExpenseClick}
      onBulkSelect={onBulkSelect}
      theme={{
        primary: 'green',
        secondary: 'gray',
        accent: 'green'
      }}
      emptyMessage="No approved expenses available"
    />
  );
};

export default ApprovedExpensesTable;

