// API Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

import type { Expense, ExpensesResponse, ExpenseResponse, ApiResponse } from '../types';
import { getAuthData } from '../utils/cookieUtils';

export interface ApiError {
  message: string;
  status?: number;
}

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

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.category && { category: filters.category }),
      ...(filters.fromDate && { fromDate: filters.fromDate }),
      ...(filters.toDate && { toDate: filters.toDate }),
      ...(filters.createdBy && { createdBy: filters.createdBy }),
      ...(filters.minAmount && { minAmount: filters.minAmount }),
      ...(filters.maxAmount && { maxAmount: filters.maxAmount }),
      ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
      ...(filters.search && { search: filters.search }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    });

    console.log('Fetching expenses with filters:', filters);

    const response = await fetch(`${API_BASE_URL}/accountant/expense?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch expenses');
    }

    const data: ExpensesResponse = await response.json();
    console.log('Expenses response:', data);
    
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

// Get expense by ID
export const getExpenseByIdApi = async (expenseId: string): Promise<ApiResponse<Expense>> => {
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

// Update expense
export const updateExpenseApi = async (expenseId: string, updates: Partial<Expense>): Promise<ApiResponse<Expense>> => {
  try {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Updating expense:', expenseId, 'with data:', updates);

    const response = await fetch(`${API_BASE_URL}/accountant/expense/${expenseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update expense');
    }

    const data = await response.json();
    console.log('Update expense response:', data);
    
    return {
      success: true,
      data: data.data || data,
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

