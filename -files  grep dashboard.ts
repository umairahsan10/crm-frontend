import React from 'react';

// Dashboard Types
export interface MetricData {
  value: string | number;
  change: string | number;
  changeType: 'positive' | 'negative' | 'neutral';
  label?: string;
  title?: string;
  subtitle?: string;
  icon?: string | React.ReactElement;
  format?: 'number' | 'currency' | 'percentage';
}

export interface ChartData {
  labels?: string[];
  datasets?: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
  // Support for simple chart data format
  name?: string;
  value?: number;
}

export interface ActivityItem {
  id: string;
  type?: 'user' | 'system' | 'notification' | 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
  timestamp?: string;
  time?: string;
  user?: string;
  icon?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

export interface QuickActionItem {
  id?: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color?: string;
  badge?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeToday: number;
  totalSales: number;
  totalBonuses: number;
  totalDeductions: number;
  pendingApprovals: number;
  missedMeetings: number;
}

export interface WidgetProps {
  title: string;
  data: MetricData;
  className?: string;
}