import type { ChartData } from '../types/dashboard';
import type { TopPerformersApiResponse } from '../apis/dashboard';
import type { PerformanceMember } from '../components/common/Leaderboard/Leaderboard';

/**
 * Transforms API response to ChartData format for chart visualization
 * Maps backend top performers structure to frontend ChartData interface
 * @param apiData - API response data
 */
export const transformTopPerformersResponse = (
  apiData: TopPerformersApiResponse
): ChartData[] => {
  return apiData.data.map((performer) => ({
    name: performer.employeeName,  // Employee name for chart label
    value: performer.value,          // Primary metric value (deals, revenue, etc.)
    // Include additional data for enhanced tooltips and features
    employeeId: performer.employeeId,
    metric: performer.metric,
    rank: performer.rank,
    revenue: performer.additionalMetrics.revenue,
    leads: performer.additionalMetrics.leads,
    conversionRate: performer.additionalMetrics.conversionRate,
    averageDealSize: performer.additionalMetrics.averageDealSize,
    change: performer.change,
  }));
};

/**
 * Helper function to safely calculate progress percentage, returning 0 if NaN
 * @param current - Current value
 * @param target - Target value
 * @param maxProgress - Maximum progress to cap at (default: 150)
 */
const safeCalculateProgress = (current: number, target: number, maxProgress: number = 150): number => {
  if (!target || target === 0 || isNaN(current) || isNaN(target)) {
    return 0;
  }
  const progress = (current / target) * 100;
  return isNaN(progress) ? 0 : Math.min(progress, maxProgress);
};

/**
 * Helper function to safely get numeric value, returning 0 if NaN or undefined
 */
const safeNumber = (value: number | undefined | null): number => {
  if (value === undefined || value === null || isNaN(value)) {
    return 0;
  }
  return value;
};

/**
 * Transforms API response to PerformanceMember format for PerformanceLeaderboard component
 * Maps backend top performers structure to frontend PerformanceMember interface
 * @param apiData - API response data
 */
export const transformTopPerformersToLeaderboard = (
  apiData: TopPerformersApiResponse
): PerformanceMember[] => {
  return apiData.data.map((performer) => {
    // Get initials for avatar
    const initials = performer.employeeName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    // Calculate metrics based on available data
    const metrics = [];

    // Primary metric (deals, revenue, etc.)
    const safeValue = safeNumber(performer.value);
    if (performer.metric === 'deals' && safeValue > 0) {
      const targetDeals = Math.ceil(safeValue * 1.2); // Set target 20% higher
      const progress = safeCalculateProgress(safeValue, targetDeals, 150);
      metrics.push({
        label: 'Deals Closed',
        currentValue: safeValue,
        targetValue: targetDeals,
        progress: progress,
        status: safeValue >= targetDeals ? 'exceeded' as const : 
                safeValue >= targetDeals * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: 'deals'
      });
    } else if (performer.metric === 'revenue' && safeValue > 0) {
      const targetRevenue = Math.ceil(safeValue * 1.2);
      const progress = safeCalculateProgress(safeValue, targetRevenue, 150);
      metrics.push({
        label: 'Revenue Generated',
        currentValue: safeValue,
        targetValue: targetRevenue,
        progress: progress,
        status: safeValue >= targetRevenue ? 'exceeded' as const : 
                safeValue >= targetRevenue * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: '$'
      });
    }

    // Additional metrics from additionalMetrics
    const safeRevenue = safeNumber(performer.additionalMetrics.revenue);
    if (safeRevenue > 0) {
      const targetRevenue = Math.ceil(safeRevenue * 1.2);
      const progress = safeCalculateProgress(safeRevenue, targetRevenue, 150);
      metrics.push({
        label: 'Sales Amount',
        currentValue: safeRevenue,
        targetValue: targetRevenue,
        progress: progress,
        status: safeRevenue >= targetRevenue ? 'exceeded' as const : 
                safeRevenue >= targetRevenue * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: '$'
      });
    }

    const safeLeads = safeNumber(performer.additionalMetrics.leads);
    if (safeLeads > 0) {
      const targetLeads = Math.ceil(safeLeads * 1.2);
      const progress = safeCalculateProgress(safeLeads, targetLeads, 150);
      metrics.push({
        label: 'Leads Handled',
        currentValue: safeLeads,
        targetValue: targetLeads,
        progress: progress,
        status: safeLeads >= targetLeads ? 'exceeded' as const : 
                safeLeads >= targetLeads * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: 'leads'
      });
    }

    const safeConversionRate = safeNumber(performer.additionalMetrics.conversionRate);
    if (safeConversionRate > 0) {
      const targetConversion = 30; // 30% conversion rate target
      const progress = safeCalculateProgress(safeConversionRate, targetConversion, 150);
      metrics.push({
        label: 'Conversion Rate',
        currentValue: safeConversionRate,
        targetValue: targetConversion,
        progress: progress,
        status: safeConversionRate >= targetConversion ? 'exceeded' as const : 
                safeConversionRate >= targetConversion * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: '%'
      });
    }

    // If no metrics were created, add a default one
    if (metrics.length === 0) {
      const safeDefaultValue = safeNumber(performer.value);
      const defaultTarget = safeDefaultValue > 0 ? Math.ceil(safeDefaultValue * 1.2) : 1;
      const defaultProgress = safeCalculateProgress(safeDefaultValue, defaultTarget, 150);
      metrics.push({
        label: 'Performance Score',
        currentValue: safeDefaultValue,
        targetValue: defaultTarget,
        progress: defaultProgress,
        status: safeDefaultValue >= defaultTarget ? 'exceeded' as const : 
                safeDefaultValue >= defaultTarget * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: ''
      });
    }

    return {
      id: performer.employeeId.toString(),
      name: performer.employeeName,
      avatar: initials,
      department: apiData.department || 'Sales',
      role: 'Sales Rep', // Could be enhanced to get actual role from API
      metrics: metrics
    };
  });
};

