import type { ChartData } from '../types/dashboard';
import type { SalesTrendsApiResponse } from '../apis/dashboard';

/**
 * Transforms API response to ChartData format for chart visualization
 * Maps backend sales trends structure to frontend ChartData interface
 * @param apiData - API response data
 */
export const transformSalesTrendsResponse = (
  apiData: SalesTrendsApiResponse
): ChartData[] => {
  return apiData.data.map((point) => ({
    name: point.label,        // "Jan", "Feb", etc.
    value: point.chartValue,   // Revenue value for chart
    // Include additional data for enhanced tooltips and features
    date: point.date,
    fullLabel: point.fullLabel,
    revenue: point.revenue,
    deals: point.deals,
    conversionRate: point.conversionRate,
    averageDealSize: point.averageDealSize,
    monthNumber: point.monthNumber,
    year: point.year,
  }));
};

