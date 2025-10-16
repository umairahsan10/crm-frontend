import type { Expense, ApiResponse } from '../types';
import { apiClient } from '../services/apiClient';

// Get all expenses with filters
export const getExpensesApi = async (
  page: number = 1,
  limit: number = 20,
  filters: {
    category?: string;
    fromDate?: string;
    toDate?: string;
    createdBy?: string;
    minAmount?: string;
    maxAmount?: string;
    paymentMethod?: string;
    processedByRole?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<ApiResponse<Expense[]>> => {
  console.log('📤 [EXPENSE API] Fetching expenses - Page:', page, 'Limit:', limit, 'Filters:', filters);
  
  return apiClient.get<Expense[]>('/accountant/expense', {
    page,
    limit,
    ...filters
  });
};

// Create expense
export const createExpenseApi = async (expenseData: {
  title: string;
  category: string;
  amount: number;
  paidOn?: string;
  notes?: string;
  paymentMethod?: 'cash' | 'bank' | 'online';
  processedByRole?: 'Employee' | 'Admin';
  vendorId?: number;
}): Promise<ApiResponse<Expense>> => {
  console.log('📤 [EXPENSE API] Creating expense:', expenseData);
  
  const response = await apiClient.post<any>('/accountant/expense', expenseData);
  
  // Backend wraps expense in data.expense
  return {
    ...response,
    data: response.data?.expense || response.data
  };
};

// Get expense by ID
export const getExpenseByIdApi = async (expenseId: string | number): Promise<ApiResponse<Expense>> => {
  console.log('📤 [EXPENSE API] Fetching expense by ID:', expenseId);
  
  return apiClient.get<Expense>(`/accountant/expense/${expenseId}`);
};

// Update expense (PATCH method with expense_id in body)
export const updateExpenseApi = async (
  expenseId: number,
  updates: {
    title?: string;
    category?: string;
    amount?: number;
    paidOn?: string;
    notes?: string;
    paymentMethod?: 'cash' | 'bank' | 'online';
    processedByRole?: 'Employee' | 'Admin';
    vendorId?: number;
  }
): Promise<ApiResponse<Expense>> => {
  console.log('📤 [EXPENSE API] Updating expense:', expenseId, updates);
  
  // Backend expects PATCH to /accountant/expense with expense_id in body
  const response = await apiClient.patch<any>('/accountant/expense', {
    expense_id: expenseId,
    ...updates
  });
  
  // Backend wraps expense in data.expense
  return {
    ...response,
    data: response.data?.expense || response.data
  };
};

// Delete expense
export const deleteExpenseApi = async (expenseId: string): Promise<ApiResponse<void>> => {
  console.log('📤 [EXPENSE API] Deleting expense:', expenseId);
  
  return apiClient.delete<void>(`/accountant/expense/${expenseId}`);
};
