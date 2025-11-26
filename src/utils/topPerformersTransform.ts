import type { ChartData } from '../types/dashboard';
import type { TopPerformersApiResponse, CrossDepartmentTopPerformersResponseDto } from '../apis/dashboard';
import type { PerformanceMember, PerformanceMetric } from '../components/common/Leaderboard/Leaderboard';

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

    // Calculate metrics - always show all 5 fields for consistency, even if values are 0
    const metrics = [];

    // Get all metric values (use 0 if not available)
    const safeValue = safeNumber(performer.value);
    const safeRevenue = safeNumber(performer.additionalMetrics.revenue);
    const safeLeads = safeNumber(performer.additionalMetrics.leads);
    const safeConversionRate = safeNumber(performer.additionalMetrics.conversionRate);
    const safeAverageDealSize = safeNumber(performer.additionalMetrics.averageDealSize);

    // 1. Deals Closed - always show
    // If primary metric is deals, use that value; otherwise use 0
    const dealsValue = performer.metric === 'deals' ? safeValue : 0;
    const targetDeals = dealsValue > 0 ? Math.ceil(dealsValue * 1.2) : 20; // Default target of 20 if value is 0
    const dealsProgress = safeCalculateProgress(dealsValue, targetDeals, 150);
    metrics.push({
      label: 'Deals Closed',
      currentValue: dealsValue,
      targetValue: targetDeals,
      progress: dealsProgress,
      status: dealsValue >= targetDeals ? 'exceeded' as const : 
              dealsValue >= targetDeals * 0.8 ? 'on-track' as const : 'below-target' as const,
      unit: 'deals'
    });

    // 2. Sales Amount (Revenue) - always show
    // If primary metric is revenue, use that value; otherwise use additionalMetrics.revenue
    const revenueValue = performer.metric === 'revenue' ? safeValue : safeRevenue;
    const targetRevenue = revenueValue > 0 ? Math.ceil(revenueValue * 1.2) : 100000; // Default target of 100k if value is 0
    const revenueProgress = safeCalculateProgress(revenueValue, targetRevenue, 150);
    metrics.push({
      label: 'Sales Amount',
      currentValue: revenueValue,
      targetValue: targetRevenue,
      progress: revenueProgress,
      status: revenueValue >= targetRevenue ? 'exceeded' as const : 
              revenueValue >= targetRevenue * 0.8 ? 'on-track' as const : 'below-target' as const,
      unit: '$'
    });

    // 3. Leads Handled - always show
    // If primary metric is leads, use that value; otherwise use additionalMetrics.leads
    const leadsValue = performer.metric === 'leads' ? safeValue : safeLeads;
    const targetLeads = leadsValue > 0 ? Math.ceil(leadsValue * 1.2) : 50; // Default target of 50 if value is 0
    const leadsProgress = safeCalculateProgress(leadsValue, targetLeads, 150);
    metrics.push({
      label: 'Leads Handled',
      currentValue: leadsValue,
      targetValue: targetLeads,
      progress: leadsProgress,
      status: leadsValue >= targetLeads ? 'exceeded' as const : 
              leadsValue >= targetLeads * 0.8 ? 'on-track' as const : 'below-target' as const,
      unit: 'leads'
    });

    // 4. Conversion Rate - always show
    // If primary metric is conversion_rate, use that value; otherwise use additionalMetrics.conversionRate
    const conversionRateValue = performer.metric === 'conversion_rate' ? safeValue : safeConversionRate;
    const targetConversion = 30; // 30% conversion rate target
    const conversionProgress = safeCalculateProgress(conversionRateValue, targetConversion, 150);
    metrics.push({
      label: 'Conversion Rate',
      currentValue: conversionRateValue,
      targetValue: targetConversion,
      progress: conversionProgress,
      status: conversionRateValue >= targetConversion ? 'exceeded' as const : 
              conversionRateValue >= targetConversion * 0.8 ? 'on-track' as const : 'below-target' as const,
      unit: '%'
    });

    // 5. Average Deal Size - always show
    const targetAverageDealSize = safeAverageDealSize > 0 ? Math.ceil(safeAverageDealSize * 1.2) : 5000; // Default target of 5k if value is 0
    const averageDealSizeProgress = safeCalculateProgress(safeAverageDealSize, targetAverageDealSize, 150);
    metrics.push({
      label: 'Average Deal Size',
      currentValue: safeAverageDealSize,
      targetValue: targetAverageDealSize,
      progress: averageDealSizeProgress,
      status: safeAverageDealSize >= targetAverageDealSize ? 'exceeded' as const : 
              safeAverageDealSize >= targetAverageDealSize * 0.8 ? 'on-track' as const : 'below-target' as const,
      unit: '$'
    });

    return {
      id: performer.employeeId.toString(),
      name: performer.employeeName,
      avatar: initials,
      department: apiData.department || 'Sales',
      role: 'Sales Rep', // Could be enhanced to get actual role from API
      metrics: metrics
    };
  })
  // Sort by overall performance (descending) - calculate average of all metric progress values
  .sort((a, b) => {
    // Calculate overall performance for member a
    const totalProgressA = a.metrics.reduce((acc, m) => {
      const progress = isNaN(m.progress) ? 0 : m.progress;
      return acc + progress;
    }, 0);
    const metricsCountA = a.metrics.length || 1;
    const overallPerformanceA = isNaN(totalProgressA / metricsCountA) ? 0 : totalProgressA / metricsCountA;

    // Calculate overall performance for member b
    const totalProgressB = b.metrics.reduce((acc, m) => {
      const progress = isNaN(m.progress) ? 0 : m.progress;
      return acc + progress;
    }, 0);
    const metricsCountB = b.metrics.length || 1;
    const overallPerformanceB = isNaN(totalProgressB / metricsCountB) ? 0 : totalProgressB / metricsCountB;

    // Sort descending by overall performance
    return overallPerformanceB - overallPerformanceA;
  });
};

/**
 * Helper function to transform department-specific metrics to PerformanceMetric format
 * Handles different metric types based on department
 */
const transformDepartmentMetrics = (
  metrics: { [key: string]: any },
  department: string,
  performancePercentage: number
): PerformanceMetric[] => {
  const performanceMetrics: PerformanceMetric[] = [];
  
  // Use performancePercentage as the primary metric
  const targetPerformance = 100; // 100% is the baseline target
  const progress = safeCalculateProgress(performancePercentage, targetPerformance, 200);
  performanceMetrics.push({
    label: 'Overall Performance',
    currentValue: performancePercentage,
    targetValue: targetPerformance,
    progress: progress,
    status: performancePercentage >= 120 ? 'exceeded' as const :
            performancePercentage >= 100 ? 'on-track' as const : 'below-target' as const,
    unit: '%'
  });

  // Department-specific metrics
  if (department === 'Sales') {
    if (metrics.deals !== undefined) {
      const targetDeals = metrics.deals > 0 ? Math.ceil(metrics.deals * 1.2) : 20;
      const progress = safeCalculateProgress(metrics.deals, targetDeals, 150);
      performanceMetrics.push({
        label: 'Deals Closed',
        currentValue: safeNumber(metrics.deals),
        targetValue: targetDeals,
        progress: progress,
        status: metrics.deals >= targetDeals ? 'exceeded' as const :
                metrics.deals >= targetDeals * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: 'deals'
      });
    }
    if (metrics.revenue !== undefined) {
      const targetRevenue = metrics.revenue > 0 ? Math.ceil(metrics.revenue * 1.2) : 100000;
      const progress = safeCalculateProgress(metrics.revenue, targetRevenue, 150);
      performanceMetrics.push({
        label: 'Revenue Generated',
        currentValue: safeNumber(metrics.revenue),
        targetValue: targetRevenue,
        progress: progress,
        status: metrics.revenue >= targetRevenue ? 'exceeded' as const :
                metrics.revenue >= targetRevenue * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: '$'
      });
    }
    if (metrics.leads !== undefined) {
      const targetLeads = metrics.leads > 0 ? Math.ceil(metrics.leads * 1.2) : 50;
      const progress = safeCalculateProgress(metrics.leads, targetLeads, 150);
      performanceMetrics.push({
        label: 'Leads Handled',
        currentValue: safeNumber(metrics.leads),
        targetValue: targetLeads,
        progress: progress,
        status: metrics.leads >= targetLeads ? 'exceeded' as const :
                metrics.leads >= targetLeads * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: 'leads'
      });
    }
    if (metrics.conversionRate !== undefined) {
      const targetConversion = 30;
      const progress = safeCalculateProgress(metrics.conversionRate, targetConversion, 150);
      performanceMetrics.push({
        label: 'Conversion Rate',
        currentValue: safeNumber(metrics.conversionRate),
        targetValue: targetConversion,
        progress: progress,
        status: metrics.conversionRate >= targetConversion ? 'exceeded' as const :
                metrics.conversionRate >= targetConversion * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: '%'
      });
    }
  } else if (department === 'Marketing') {
    if (metrics.campaignsRun !== undefined) {
      const targetCampaigns = metrics.campaignsRun > 0 ? Math.ceil(metrics.campaignsRun * 1.2) : 6;
      const progress = safeCalculateProgress(metrics.campaignsRun, targetCampaigns, 150);
      performanceMetrics.push({
        label: 'Campaigns Run',
        currentValue: safeNumber(metrics.campaignsRun),
        targetValue: targetCampaigns,
        progress: progress,
        status: metrics.campaignsRun >= targetCampaigns ? 'exceeded' as const :
                metrics.campaignsRun >= targetCampaigns * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: 'campaigns'
      });
    }
    if (metrics.leadQualityScore !== undefined) {
      const targetScore = 4.0;
      const progress = safeCalculateProgress(metrics.leadQualityScore, targetScore, 150);
      performanceMetrics.push({
        label: 'Lead Quality Score',
        currentValue: safeNumber(metrics.leadQualityScore),
        targetValue: targetScore,
        progress: progress,
        status: metrics.leadQualityScore >= targetScore ? 'exceeded' as const :
                metrics.leadQualityScore >= targetScore * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: '/5'
      });
    }
    if (metrics.leadGeneration !== undefined) {
      const targetLeads = metrics.leadGeneration > 0 ? Math.ceil(metrics.leadGeneration * 1.2) : 120;
      const progress = safeCalculateProgress(metrics.leadGeneration, targetLeads, 150);
      performanceMetrics.push({
        label: 'Lead Generation',
        currentValue: safeNumber(metrics.leadGeneration),
        targetValue: targetLeads,
        progress: progress,
        status: metrics.leadGeneration >= targetLeads ? 'exceeded' as const :
                metrics.leadGeneration >= targetLeads * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: 'leads'
      });
    }
  } else if (department === 'Production') {
    if (metrics.projectsCompleted !== undefined) {
      const targetProjects = metrics.projectsCompleted > 0 ? Math.ceil(metrics.projectsCompleted * 1.2) : 10;
      const progress = safeCalculateProgress(metrics.projectsCompleted, targetProjects, 150);
      performanceMetrics.push({
        label: 'Projects Completed',
        currentValue: safeNumber(metrics.projectsCompleted),
        targetValue: targetProjects,
        progress: progress,
        status: metrics.projectsCompleted >= targetProjects ? 'exceeded' as const :
                metrics.projectsCompleted >= targetProjects * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: 'projects'
      });
    }
    if (metrics.taskCompletion !== undefined || metrics.tasksCompleted !== undefined) {
      const taskCompletion = metrics.taskCompletion || (metrics.tasksCompleted && metrics.totalTasks 
        ? (metrics.tasksCompleted / metrics.totalTasks) * 100 : 0);
      const targetCompletion = 90;
      const progress = safeCalculateProgress(taskCompletion, targetCompletion, 150);
      performanceMetrics.push({
        label: 'Task Completion',
        currentValue: safeNumber(taskCompletion),
        targetValue: targetCompletion,
        progress: progress,
        status: taskCompletion >= targetCompletion ? 'exceeded' as const :
                taskCompletion >= targetCompletion * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: '%'
      });
    }
  } else if (department === 'HR') {
    if (metrics.recruitments !== undefined) {
      const targetRecruitments = metrics.recruitments > 0 ? Math.ceil(metrics.recruitments * 1.2) : 6;
      const progress = safeCalculateProgress(metrics.recruitments, targetRecruitments, 150);
      performanceMetrics.push({
        label: 'Recruitments',
        currentValue: safeNumber(metrics.recruitments),
        targetValue: targetRecruitments,
        progress: progress,
        status: metrics.recruitments >= targetRecruitments ? 'exceeded' as const :
                metrics.recruitments >= targetRecruitments * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: 'hires'
      });
    }
    if (metrics.requestProcessing !== undefined) {
      const targetRequests = metrics.requestProcessing > 0 ? Math.ceil(metrics.requestProcessing * 1.2) : 40;
      const progress = safeCalculateProgress(metrics.requestProcessing, targetRequests, 150);
      performanceMetrics.push({
        label: 'Request Processing',
        currentValue: safeNumber(metrics.requestProcessing),
        targetValue: targetRequests,
        progress: progress,
        status: metrics.requestProcessing >= targetRequests ? 'exceeded' as const :
                metrics.requestProcessing >= targetRequests * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: 'requests'
      });
    }
    if (metrics.employeeSatisfaction !== undefined) {
      const targetSatisfaction = 4.0;
      const progress = safeCalculateProgress(metrics.employeeSatisfaction, targetSatisfaction, 150);
      performanceMetrics.push({
        label: 'Employee Satisfaction',
        currentValue: safeNumber(metrics.employeeSatisfaction),
        targetValue: targetSatisfaction,
        progress: progress,
        status: metrics.employeeSatisfaction >= targetSatisfaction ? 'exceeded' as const :
                metrics.employeeSatisfaction >= targetSatisfaction * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: '/5'
      });
    }
  } else if (department === 'Accounts' || department === 'Finance' || department === 'Accounting') {
    if (metrics.transactionsProcessed !== undefined) {
      const targetTransactions = metrics.transactionsProcessed > 0 ? Math.ceil(metrics.transactionsProcessed * 1.2) : 50;
      const progress = safeCalculateProgress(metrics.transactionsProcessed, targetTransactions, 150);
      performanceMetrics.push({
        label: 'Transactions Processed',
        currentValue: safeNumber(metrics.transactionsProcessed),
        targetValue: targetTransactions,
        progress: progress,
        status: metrics.transactionsProcessed >= targetTransactions ? 'exceeded' as const :
                metrics.transactionsProcessed >= targetTransactions * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: 'transactions'
      });
    }
    if (metrics.invoicesProcessed !== undefined) {
      const targetInvoices = metrics.invoicesProcessed > 0 ? Math.ceil(metrics.invoicesProcessed * 1.2) : 25;
      const progress = safeCalculateProgress(metrics.invoicesProcessed, targetInvoices, 150);
      performanceMetrics.push({
        label: 'Invoices Processed',
        currentValue: safeNumber(metrics.invoicesProcessed),
        targetValue: targetInvoices,
        progress: progress,
        status: metrics.invoicesProcessed >= targetInvoices ? 'exceeded' as const :
                metrics.invoicesProcessed >= targetInvoices * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: 'invoices'
      });
    }
    if (metrics.transactionAmount !== undefined) {
      const targetAmount = metrics.transactionAmount > 0 ? Math.ceil(metrics.transactionAmount * 1.2) : 1000000;
      const progress = safeCalculateProgress(metrics.transactionAmount, targetAmount, 150);
      performanceMetrics.push({
        label: 'Transaction Amount',
        currentValue: safeNumber(metrics.transactionAmount),
        targetValue: targetAmount,
        progress: progress,
        status: metrics.transactionAmount >= targetAmount ? 'exceeded' as const :
                metrics.transactionAmount >= targetAmount * 0.8 ? 'on-track' as const : 'below-target' as const,
        unit: '$'
      });
    }
  }

  return performanceMetrics;
};

/**
 * Transforms cross-department top performers API response to PerformanceMember format
 * Maps backend cross-department structure to frontend PerformanceMember interface
 * @param apiData - API response data
 */
export const transformCrossDepartmentTopPerformersToLeaderboard = (
  apiData: CrossDepartmentTopPerformersResponseDto
): PerformanceMember[] => {
  return apiData.data.map((performer) => {
    // Get initials for avatar
    const initials = performer.employeeName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    // Transform department-specific metrics
    const metrics = transformDepartmentMetrics(
      performer.metrics,
      performer.department,
      performer.performancePercentage
    );

    return {
      id: performer.employeeId.toString(),
      name: performer.employeeName,
      avatar: initials,
      department: performer.department,
      role: performer.role,
      metrics: metrics
    };
  });
};

