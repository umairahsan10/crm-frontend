export interface MetricData {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  subtitle?: string;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  user?: string;
}

export interface QuickActionItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color?: string;
}
