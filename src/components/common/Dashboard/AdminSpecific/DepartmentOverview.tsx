import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useDepartmentDistribution } from '../../../../hooks/queries/useDepartmentDistribution';
// ChartData type not needed - using inline type

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
  const { data: departmentDistributionApiData, isLoading, isError, error } = useDepartmentDistribution();

  // Use API data for department distribution, show empty array if API fails (no hardcoded fallback)
  const departmentData = departmentDistributionApiData && departmentDistributionApiData.length > 0
    ? departmentDistributionApiData
    : []; // Empty array - will show error/empty state in UI

  // Calculate total employees (handle empty data)
  const totalEmployees = departmentData.length > 0 
    ? departmentData.reduce((sum, dept) => sum + dept.value, 0)
    : 0;

  // Calculate percentages
  const dataWithPercentages = departmentData.length > 0
    ? departmentData.map(dept => ({
        ...dept,
        percentage: totalEmployees > 0 ? ((dept.value / totalEmployees) * 100).toFixed(1) : '0'
      }))
    : [];

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

  if (isError) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-red-200 ${className}`}>
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
            <h2 className="text-md font-bold text-gray-900">Department Distribution</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Failed to load department distribution</h3>
            <p className="mt-1 text-sm text-gray-500">{error?.message || 'Unknown error occurred'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (departmentData.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
            <h2 className="text-md font-bold text-gray-900">Department Distribution</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No department data available</h3>
            <p className="mt-1 text-sm text-gray-500">No department distribution data found</p>
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
