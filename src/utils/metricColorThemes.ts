import type { MetricCardColorTheme } from '../components/common/Dashboard/MetricCard';

// Color themes matching FinancePage pattern
export const metricColorThemes: Record<string, MetricCardColorTheme> = {
  // Financial metrics (Green)
  profit: {
    background: 'bg-gradient-to-br from-green-50 to-emerald-50',
    border: 'border-green-200',
    iconBg: 'bg-green-200',
    iconColor: 'text-green-600',
    iconHoverBg: 'group-hover:bg-green-500',
    iconHoverColor: 'group-hover:text-white'
  },
  revenue: {
    background: 'bg-gradient-to-br from-green-50 to-emerald-50',
    border: 'border-green-200',
    iconBg: 'bg-green-200',
    iconColor: 'text-green-600',
    iconHoverBg: 'group-hover:bg-green-500',
    iconHoverColor: 'group-hover:text-white'
  },
  income: {
    background: 'bg-gradient-to-br from-green-50 to-emerald-50',
    border: 'border-green-200',
    iconBg: 'bg-green-200',
    iconColor: 'text-green-600',
    iconHoverBg: 'group-hover:bg-green-500',
    iconHoverColor: 'group-hover:text-white'
  },
  commission: {
    background: 'bg-gradient-to-br from-green-50 to-emerald-50',
    border: 'border-green-200',
    iconBg: 'bg-green-200',
    iconColor: 'text-green-600',
    iconHoverBg: 'group-hover:bg-green-500',
    iconHoverColor: 'group-hover:text-white'
  },
  budget: {
    background: 'bg-gradient-to-br from-green-50 to-emerald-50',
    border: 'border-green-200',
    iconBg: 'bg-green-200',
    iconColor: 'text-green-600',
    iconHoverBg: 'group-hover:bg-green-500',
    iconHoverColor: 'group-hover:text-white'
  },
  roi: {
    background: 'bg-gradient-to-br from-green-50 to-emerald-50',
    border: 'border-green-200',
    iconBg: 'bg-green-200',
    iconColor: 'text-green-600',
    iconHoverBg: 'group-hover:bg-green-500',
    iconHoverColor: 'group-hover:text-white'
  },

  // Expense/Spending metrics (Blue)
  expense: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-200',
    iconColor: 'text-blue-600',
    iconHoverBg: 'group-hover:bg-blue-500',
    iconHoverColor: 'group-hover:text-white'
  },
  expenses: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-200',
    iconColor: 'text-blue-600',
    iconHoverBg: 'group-hover:bg-blue-500',
    iconHoverColor: 'group-hover:text-white'
  },
  spending: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-200',
    iconColor: 'text-blue-600',
    iconHoverBg: 'group-hover:bg-blue-500',
    iconHoverColor: 'group-hover:text-white'
  },

  // Cash Flow/Assets (Indigo/Purple)
  'cash flow': {
    background: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-200',
    iconColor: 'text-indigo-600',
    iconHoverBg: 'group-hover:bg-indigo-500',
    iconHoverColor: 'group-hover:text-white'
  },
  cashflow: {
    background: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-200',
    iconColor: 'text-indigo-600',
    iconHoverBg: 'group-hover:bg-indigo-500',
    iconHoverColor: 'group-hover:text-white'
  },
  assets: {
    background: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-200',
    iconColor: 'text-indigo-600',
    iconHoverBg: 'group-hover:bg-indigo-500',
    iconHoverColor: 'group-hover:text-white'
  },

  // Performance/Rate metrics (Indigo/Purple)
  'conversion rate': {
    background: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-200',
    iconColor: 'text-indigo-600',
    iconHoverBg: 'group-hover:bg-indigo-500',
    iconHoverColor: 'group-hover:text-white'
  },
  rate: {
    background: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-200',
    iconColor: 'text-indigo-600',
    iconHoverBg: 'group-hover:bg-indigo-500',
    iconHoverColor: 'group-hover:text-white'
  },
  efficiency: {
    background: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-200',
    iconColor: 'text-indigo-600',
    iconHoverBg: 'group-hover:bg-indigo-500',
    iconHoverColor: 'group-hover:text-white'
  },
  performance: {
    background: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-200',
    iconColor: 'text-indigo-600',
    iconHoverBg: 'group-hover:bg-indigo-500',
    iconHoverColor: 'group-hover:text-white'
  },
  quality: {
    background: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-200',
    iconColor: 'text-indigo-600',
    iconHoverBg: 'group-hover:bg-indigo-500',
    iconHoverColor: 'group-hover:text-white'
  },

  // Active/Operational metrics (Blue)
  active: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-200',
    iconColor: 'text-blue-600',
    iconHoverBg: 'group-hover:bg-blue-500',
    iconHoverColor: 'group-hover:text-white'
  },
  employees: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-200',
    iconColor: 'text-blue-600',
    iconHoverBg: 'group-hover:bg-blue-500',
    iconHoverColor: 'group-hover:text-white'
  },
  users: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-200',
    iconColor: 'text-blue-600',
    iconHoverBg: 'group-hover:bg-blue-500',
    iconHoverColor: 'group-hover:text-white'
  },
  teams: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-200',
    iconColor: 'text-blue-600',
    iconHoverBg: 'group-hover:bg-blue-500',
    iconHoverColor: 'group-hover:text-white'
  },
  projects: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-200',
    iconColor: 'text-blue-600',
    iconHoverBg: 'group-hover:bg-blue-500',
    iconHoverColor: 'group-hover:text-white'
  },
  campaigns: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-200',
    iconColor: 'text-blue-600',
    iconHoverBg: 'group-hover:bg-blue-500',
    iconHoverColor: 'group-hover:text-white'
  },
  units: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-200',
    iconColor: 'text-blue-600',
    iconHoverBg: 'group-hover:bg-blue-500',
    iconHoverColor: 'group-hover:text-white'
  },
  departments: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-200',
    iconColor: 'text-blue-600',
    iconHoverBg: 'group-hover:bg-blue-500',
    iconHoverColor: 'group-hover:text-white'
  },
  leads: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-200',
    iconColor: 'text-blue-600',
    iconHoverBg: 'group-hover:bg-blue-500',
    iconHoverColor: 'group-hover:text-white'
  },
  deals: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-200',
    iconColor: 'text-blue-600',
    iconHoverBg: 'group-hover:bg-blue-500',
    iconHoverColor: 'group-hover:text-white'
  },

  // Attendance/Status metrics (Orange/Yellow)
  attendance: {
    background: 'bg-gradient-to-br from-orange-50 to-amber-50',
    border: 'border-orange-200',
    iconBg: 'bg-orange-200',
    iconColor: 'text-orange-600',
    iconHoverBg: 'group-hover:bg-orange-500',
    iconHoverColor: 'group-hover:text-white'
  },
  pending: {
    background: 'bg-gradient-to-br from-orange-50 to-amber-50',
    border: 'border-orange-200',
    iconBg: 'bg-orange-200',
    iconColor: 'text-orange-600',
    iconHoverBg: 'group-hover:bg-orange-500',
    iconHoverColor: 'group-hover:text-white'
  },
  request: {
    background: 'bg-gradient-to-br from-orange-50 to-amber-50',
    border: 'border-orange-200',
    iconBg: 'bg-orange-200',
    iconColor: 'text-orange-600',
    iconHoverBg: 'group-hover:bg-orange-500',
    iconHoverColor: 'group-hover:text-white'
  },
  leave: {
    background: 'bg-gradient-to-br from-orange-50 to-amber-50',
    border: 'border-orange-200',
    iconBg: 'bg-orange-200',
    iconColor: 'text-orange-600',
    iconHoverBg: 'group-hover:bg-orange-500',
    iconHoverColor: 'group-hover:text-white'
  },

  // System/Health metrics (Teal/Cyan)
  health: {
    background: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    border: 'border-teal-200',
    iconBg: 'bg-teal-200',
    iconColor: 'text-teal-600',
    iconHoverBg: 'group-hover:bg-teal-500',
    iconHoverColor: 'group-hover:text-white'
  },
  system: {
    background: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    border: 'border-teal-200',
    iconBg: 'bg-teal-200',
    iconColor: 'text-teal-600',
    iconHoverBg: 'group-hover:bg-teal-500',
    iconHoverColor: 'group-hover:text-white'
  },
  completed: {
    background: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    border: 'border-teal-200',
    iconBg: 'bg-teal-200',
    iconColor: 'text-teal-600',
    iconHoverBg: 'group-hover:bg-teal-500',
    iconHoverColor: 'group-hover:text-white'
  }
};

/**
 * Get color theme for a metric based on its title
 * @param title - The metric title
 * @returns Color theme or undefined if no match found
 */
export const getColorThemeForMetric = (title: string): MetricCardColorTheme | undefined => {
  const normalizedTitle = title.trim().toLowerCase();
  
  // Try exact match first
  if (metricColorThemes[normalizedTitle]) {
    return metricColorThemes[normalizedTitle];
  }
  
  // Try partial match (for titles with additional context)
  for (const [key, theme] of Object.entries(metricColorThemes)) {
    if (normalizedTitle.includes(key) || key.includes(normalizedTitle)) {
      return theme;
    }
  }
  
  return undefined;
};

/**
 * Get color themes for an array of metrics
 * @param metrics - Array of metric data
 * @returns Array of color themes (may include undefined values)
 */
export const getColorThemesForMetrics = (metrics: Array<{ title: string }>): (MetricCardColorTheme | undefined)[] => {
  return metrics.map(metric => getColorThemeForMetric(metric.title));
};

