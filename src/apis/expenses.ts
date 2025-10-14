// API Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

import type { Expense, ExpensesResponse, ExpenseResponse, ApiResponse } from '../types';
import { getAuthData } from '../utils/cookieUtils';

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
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query parameters (backend doesn't use page/limit)
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
    if (filters.toDate) queryParams.append('toDate', filters.toDate);
    if (filters.createdBy) queryParams.append('createdBy', filters.createdBy);
    if (filters.minAmount) queryParams.append('minAmount', filters.minAmount);
    if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount);
    if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);
    if (filters.processedByRole) queryParams.append('processedByRole', filters.processedByRole);

    const url = queryParams.toString() 
      ? `${API_BASE_URL}/accountant/expense?${queryParams.toString()}`
      : `${API_BASE_URL}/accountant/expense`;

    console.log('📤 Fetching expenses:', {
      url,
      filters,
      queryParams: queryParams.toString()
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Expenses API HTTP Error:', response.status, errorData);
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch expenses`);
    }

    const data: ExpensesResponse = await response.json();
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
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Creating expense with data:', expenseData);

    const response = await fetch(`${API_BASE_URL}/accountant/expense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(expenseData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create expense');
    }

    const data = await response.json();
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
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Fetching expense by ID:', expenseId);

    const response = await fetch(`${API_BASE_URL}/accountant/expense/${expenseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch expense');
    }

    const data: ExpenseResponse = await response.json();
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
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Updating expense:', expenseId, 'with data:', updates);

    // Backend expects PATCH to /accountant/expense with expense_id in body
    const response = await fetch(`${API_BASE_URL}/accountant/expense`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        expense_id: expenseId,
        ...updates
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update expense');
    }

    const data = await response.json();
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
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/accountant/expense/${expenseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete expense');
    }

    const data: ApiResponse<void> = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while deleting expense');
  }
};

