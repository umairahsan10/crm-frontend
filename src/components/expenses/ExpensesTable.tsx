import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { regularExpensesTableConfig } from './tableConfigs';
import type { Expense } from '../../types';

interface ExpensesTableProps {
  expenses: Expense[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onExpenseClick: (expense: Expense) => void;
  onBulkSelect: (expenseIds: string[]) => void;
  selectedExpenses: string[];
}

const ExpensesTable: React.FC<ExpensesTableProps> = ({
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
  // No transformation needed - vendor data is accessed via custom render in table config
  const transformedExpenses = expenses;
    
  return (
    <DynamicTable
      data={transformedExpenses}
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
        primary: 'blue',
        secondary: 'gray',
        accent: 'blue'
      }}
      emptyMessage="No expenses available"
    />
  );
};

export default ExpensesTable;

