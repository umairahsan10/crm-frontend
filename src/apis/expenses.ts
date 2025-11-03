import type { Expense, ExpensesResponse, ExpenseResponse, ApiResponse } from '../types';
import { 
  apiGetJson, 
  apiPostJson, 
  apiPatchJson, 
  apiDeleteJson
} from '../utils/apiClient';

export interface ApiError {
  message: string;
  status?: number;
}

// Get all expenses with filters (backend doesn't use pagination params in query)
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
  try {
    // Build query parameters (backend doesn't use page/limit)
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
    if (filters.toDate) queryParams.append('toDate', filters.toDate);
    if (filters.createdBy) queryParams.append('createdBy', filters.createdBy);
    if (filters.minAmount) queryParams.append('minAmount', filters.minAmount);
    if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount);
    if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);
    if (filters.processedByRole) queryParams.append('processedByRole', filters.processedByRole);

    const url = queryParams.toString() 
      ? `/accountant/expense?${queryParams.toString()}`
      : `/accountant/expense`;

    console.log('📤 Fetching expenses:', {
      url,
      filters,
      queryParams: queryParams.toString()
    });

    const data: ExpensesResponse = await apiGetJson<ExpensesResponse>(url);
    console.log('✅ Expenses API Response:', data);
    
    // Backend returns { status, message, data: [], total }
    if (data.status === 'error') {
      console.error('❌ Backend Error:', data);
      throw new Error(data.message || 'Backend error: Failed to fetch expenses');
    }
    
    return {
      success: true,
      data: data.data,
      message: data.message,
      pagination: {
        page: page,
        limit: limit,
        total: data.total,
        totalPages: Math.ceil(data.total / limit),
        hasNext: page * limit < data.total,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Expenses API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching expenses');
  }
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
  try {
    console.log('Creating expense with data:', expenseData);

    const data = await apiPostJson<any>('/accountant/expense', expenseData);
    console.log('Create expense response:', data);
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to create expense');
    }
    
    return {
      success: true,
      data: data.data.expense,
      message: data.message || 'Expense created successfully'
    };
  } catch (error) {
    console.error('Create expense error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while creating expense');
  }
};

// Get expense by ID
export const getExpenseByIdApi = async (expenseId: string | number): Promise<ApiResponse<Expense>> => {
  try {
    console.log('Fetching expense by ID:', expenseId);

    const data: ExpenseResponse = await apiGetJson<ExpenseResponse>(`/accountant/expense/${expenseId}`);
    console.log('Expense detail response:', data);
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to fetch expense');
    }
    
    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    console.error('Expense detail API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching expense');
  }
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
  try {
    console.log('Updating expense:', expenseId, 'with data:', updates);

    // Backend expects PATCH to /accountant/expense with expense_id in body
    const data = await apiPatchJson<any>('/accountant/expense', {
      expense_id: expenseId,
      ...updates
    });
    console.log('Update expense response:', data);
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to update expense');
    }
    
    return {
      success: true,
      data: data.data.expense,
      message: data.message || 'Expense updated successfully'
    };
  } catch (error) {
    console.error('Update expense error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating expense');
  }
};

// Delete expense
export const deleteExpenseApi = async (expenseId: string): Promise<ApiResponse<void>> => {
  try {
    const data: ApiResponse<void> = await apiDeleteJson<ApiResponse<void>>(`/accountant/expense/${expenseId}`);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while deleting expense');
  }
};

// Statistics API
export const getExpensesStatisticsApi = async (): Promise<ApiResponse<{
  totalExpenses: number;
  totalAmount: number;
  thisMonthAmount: number;
  lastMonthAmount: number;
  growthRate: number;
  byCategory: { [key: string]: number };
  byPaymentMethod: { [key: string]: number };
  recentExpenses: Expense[];
}>> => {
  try {
    console.log('📊 Fetching expenses statistics...');
    
    const data = await apiGetJson<any>('/accountant/expense/stats');
    console.log('✅ Expenses statistics received:', data);
    
    return {
      success: true,
      data: data.data || data,
      message: 'Expenses statistics fetched successfully'
    };
  } catch (error) {
    console.error('❌ Expenses statistics API error:', error);
    throw new Error('Failed to fetch expenses statistics');
  }
};

