import type { ApiResponse } from '../types';
import { apiGetJson } from '../utils/apiClient';

export interface PeriodData {
  count: number;
  amount: number;
  average: number;
  changePercent: number;
}

export interface ComparisonData {
  current: PeriodData;
  previous: PeriodData;
  difference: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface RevenuesData {
  today: PeriodData;
  thisWeek: PeriodData;
  thisMonth: PeriodData;
  thisQuarter: PeriodData;
  thisYear: PeriodData;
  monthOverMonth: ComparisonData;
  yearOverYear: ComparisonData;
  topCategories: Array<{ name: string; amount: number; count: number }>;
  topSources: Array<{ name: string; amount: number; count: number }>;
}

export interface ExpensesData {
  today: PeriodData;
  thisWeek: PeriodData;
  thisMonth: PeriodData;
  thisQuarter: PeriodData;
  thisYear: PeriodData;
  monthOverMonth: ComparisonData;
  yearOverYear: ComparisonData;
  topCategories: Array<{ name: string; amount: number; count: number }>;
  topPaymentMethods: Array<{ name: string; amount: number; count: number }>;
}

export interface TrendDataPoint {
  date: string;
  revenue: number;
  expense: number;
  net: number;
  count: number;
}

export interface TrendsData {
  daily: TrendDataPoint[];
  weekly: TrendDataPoint[];
  monthly: TrendDataPoint[];
}

export interface KeyMetric {
  title: string;
  value: number;
  previousValue: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

export interface WidgetsData {
  keyMetrics: KeyMetric[];
  revenueBreakdown: Array<{ name: string; amount: number; percentage: number }>;
  expenseBreakdown: Array<{ name: string; amount: number; percentage: number }>;
  paymentMethodDistribution: Array<{ name: string; amount: number; percentage: number }>;
}

export interface PeriodInfo {
  currentPeriod: string;
  previousPeriod: string;
  generatedAt: string;
}

export interface AnalyticsDashboardSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalAssets: number;
  totalLiabilities: number;
  netPosition: number;
  unpaidLiabilities: number;
  availableCash: number;
}

export interface AnalyticsDashboardResponse {
  summary: AnalyticsDashboardSummary;
  revenues: RevenuesData;
  expenses: ExpensesData;
  trends: TrendsData;
  widgets: WidgetsData;
  periodInfo: PeriodInfo;
}

// Get accountant analytics dashboard
export const getAccountantAnalyticsApi = async (
  params?: {
    fromDate?: string;
    toDate?: string;
    period?: 'monthly' | 'quarterly' | 'yearly';
  }
): Promise<ApiResponse<AnalyticsDashboardResponse>> => {
  try {
    console.log('📊 Fetching accountant analytics dashboard...');
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.period) queryParams.append('period', params.period);

    const url = queryParams.toString() 
      ? `/accountant/analytics/dashboard?${queryParams.toString()}`
      : `/accountant/analytics/dashboard`;

    console.log('📤 Fetching analytics from:', url);

    const data = await apiGetJson<any>(url);
    console.log('✅ Analytics dashboard received:', data);
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to fetch analytics dashboard');
    }
    
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Analytics dashboard fetched successfully'
    };
  } catch (error) {
    console.error('❌ Analytics dashboard API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching analytics dashboard');
  }
};

