import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useDepartmentDistribution } from '../../../../hooks/queries/useDepartmentDistribution';
import type { ChartData } from '../../../../types/dashboard';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface DepartmentOverviewProps {
  className?: string;
}

// Department-specific color palette
const getDepartmentColor = (department: string): string => {
  const colorMap: Record<string, string> = {
    'Sales': '#3B82F6',      // Blue
    'Marketing': '#8B5CF6',   // Purple
    'Production': '#10B981',  // Emerald
    'HR': '#F59E0B',         // Amber
    'Accounting': '#EF4444', // Red
    'Accounts': '#EF4444',    // Red (for API response)
  };
  return colorMap[department] || '#6B7280'; // Gray as default
};

export const DepartmentOverview: React.FC<DepartmentOverviewProps> = ({ className = '' }) => {

  // Fetch department distribution data from API
  const { data: departmentDistributionApiData, isLoading } = useDepartmentDistribution();

  // Fallback dummy data for department distribution (used when API data is not available)
  const departmentDistributionFallbackData: ChartData[] = [
    { name: 'Sales', value: 35 },
    { name: 'Production', value: 28 },
    { name: 'HR', value: 15 },
    { name: 'Marketing', value: 12 },
    { name: 'Accounting', value: 10 },
  ];

  // Use API data for department distribution, fallback to dummy data if API is loading or fails
  const departmentData = departmentDistributionApiData && departmentDistributionApiData.length > 0
    ? departmentDistributionApiData
    : departmentDistributionFallbackData;

  // Calculate total employees
  const totalEmployees = departmentData.reduce((sum, dept) => sum + dept.value, 0);

  // Calculate percentages
  const dataWithPercentages = departmentData.map(dept => ({
    ...dept,
    percentage: ((dept.value / totalEmployees) * 100).toFixed(1)
  }));

  // Prepare chart data with department-specific colors
  const chartData = {
    labels: dataWithPercentages.map(item => `${item.name} (${item.percentage}%)`),
    datasets: [
      {
        label: 'Employees',
        data: dataWithPercentages.map(item => item.value),
        backgroundColor: dataWithPercentages.map(item => getDepartmentColor(item.name)),
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 5,
        hoverOffset: 15,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12,
            weight: 500,
          },
          color: '#374151',
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, index: number) => {
                const value = data.datasets[0].data[index];
                const backgroundColor = data.datasets[0].backgroundColor[index];
                const departmentName = label.split(' (')[0]; // Extract department name
                return {
                  text: `${departmentName}: ${value}`,
                  fillStyle: backgroundColor,
                  strokeStyle: backgroundColor,
                  lineWidth: 0,
                  hidden: false,
                  index: index,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: (context: any) => {
            const label = context[0]?.label || '';
            const departmentName = label.split(' (')[0];
            return departmentName;
          },
          label: (context: any) => {
            const value = context.parsed || 0;
            const percentage = ((value / totalEmployees) * 100).toFixed(1);
            return `${value} employees (${percentage}%)`;
          },
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
            <h2 className="text-md font-bold text-gray-900">Department Distribution</h2>
          </div>
        </div>
        <div className="p-4 pb-6">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
    >
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
            <h2 className="text-md font-bold text-gray-900">Department Distribution</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
              {totalEmployees} Total
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 pb-6" style={{ height: '400px' }}>
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};
