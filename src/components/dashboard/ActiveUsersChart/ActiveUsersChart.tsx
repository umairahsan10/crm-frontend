import React from 'react';
import Chart from '../../common/Chart/Chart';

interface ActiveUsersData {
  date: string;
  activeUsers: number;
  newRegistrations: number;
}

interface ActiveUsersChartProps {
  data: ActiveUsersData[];
}

const ActiveUsersChart: React.FC<ActiveUsersChartProps> = ({ data }) => {
  const chartConfig = {
    type: 'line' as const,
    data: [
      {
        label: 'Active Users',
        data: data.map(item => ({
          label: item.date,
          value: item.activeUsers
        })),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3B82F6',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: 'New Registrations',
        data: data.map(item => ({
          label: item.date,
          value: item.newRegistrations
        })),
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: '#10B981',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }
    ],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: true
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Active Users (Last 7 Days)</h3>
      <div className="h-64">
        <Chart
          config={chartConfig}
          title=""
          size="md"
          height="100%"
        />
      </div>
    </div>
  );
};

export default ActiveUsersChart;
