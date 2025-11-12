import React, { useState, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import type { ChartData } from '../../../types/dashboard';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface DepartmentDistributionChartProps {
  data: ChartData[];
  className?: string;
  title?: string;
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

export const DepartmentDistributionChart: React.FC<DepartmentDistributionChartProps> = ({ 
  data, 
  className = '',
  title = 'Department-wise Employee Distribution'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Calculate total employees
  const totalEmployees = data.reduce((sum, dept) => sum + dept.value, 0);

  // Calculate percentages
  const dataWithPercentages = data.map(dept => ({
    ...dept,
    percentage: ((dept.value / totalEmployees) * 100).toFixed(1)
  }));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
      animateScale: isVisible,
      duration: isVisible ? 1000 : 0,
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
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = ((value / totalEmployees) * 100).toFixed(1);
            return `${label.split(' (')[0]}: ${value} employees (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div 
      ref={chartRef}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
            <h2 className="text-md font-bold text-gray-900">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
              {totalEmployees} Total
            </div>
          </div>
        </div>
      </div>
      <div className="p-6" style={{ height: '250px' }}>
        <Pie data={chartData} options={options} />
      </div>
      {/* Summary Stats */}
      <div className="px-6 pb-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3 mt-4">
          {dataWithPercentages.slice(0, 4).map((dept) => (
            <div key={dept.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getDepartmentColor(dept.name) }}
              />
              <span className="text-xs text-gray-600 font-medium">{dept.name}</span>
              <span className="text-xs text-gray-400 ml-auto">{dept.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

