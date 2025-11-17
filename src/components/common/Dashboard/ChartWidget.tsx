import React, { useState, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import type { ChartData } from '../../../types/dashboard';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartWidgetProps {
  title: string;
  data: ChartData[];
  type: 'bar' | 'line' | 'pie';
  height?: number;
  className?: string;
  loading?: boolean;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ 
  title,
  data,
  type,
  height = 350,
  className = '',
  loading = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

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

  const COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
  ];

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Value',
        data: data.map(item => item.value),
        backgroundColor: type === 'pie' 
          ? COLORS.slice(0, data.length) 
          : type === 'bar' 
            ? COLORS[0] 
            : COLORS[0],
        borderColor: type === 'pie' 
          ? COLORS.slice(0, data.length) 
          : type === 'bar' 
            ? COLORS[0] 
            : COLORS[0],
        borderWidth: type === 'pie' ? 2 : 1,
        hoverBackgroundColor: type === 'pie' 
          ? COLORS.slice(0, data.length).map(color => color + 'CC') 
          : COLORS[0] + 'CC',
        hoverBorderColor: type === 'pie' 
          ? COLORS.slice(0, data.length) 
          : COLORS[0],
        hoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: isVisible ? 1000 : 0,
      easing: 'easeInOutQuart' as const,
      delay: (context: any) => {
        return isVisible && context.type === 'data' && context.mode === 'default' ? context.dataIndex * 100 : 0;
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'normal' as const,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        animation: {
          duration: 200,
        },
      },
    },
    scales: type !== 'pie' ? {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
      },
    } : {},
    elements: {
      bar: {
        borderRadius: 4,
        borderSkipped: false,
        hoverBackgroundColor: (context: any) => {
          const colors = type === 'pie' 
            ? COLORS.slice(0, data.length) 
            : [COLORS[0]];
          return colors[context.dataIndex % colors.length] + 'CC';
        },
        hoverBorderColor: (context: any) => {
          const colors = type === 'pie' 
            ? COLORS.slice(0, data.length) 
            : [COLORS[0]];
          return colors[context.dataIndex % colors.length];
        },
        hoverBorderWidth: 2,
      },
      line: {
        tension: 0.4,
        borderWidth: 3,
        hoverBorderWidth: 4,
      },
      point: {
        radius: 4,
        hoverRadius: 8,
        hoverBorderWidth: 2,
        hoverBorderColor: '#ffffff',
      },
      arc: {
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff',
      },
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      default:
        return null;
    }
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
      <div className="p-4 py-2 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full" />
            <h2 className="text-md font-bold text-gray-900">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-lg bg-orange-100 text-orange-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6" style={{ height: `${height}px` }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          renderChart()
        )}
      </div>
    </div>
  );
};