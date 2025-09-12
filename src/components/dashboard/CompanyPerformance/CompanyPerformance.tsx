import React from 'react';
import DashboardCard from '../../previous_components/DashboardCard/DashboardCard';
import Chart from '../../common/Chart/Chart';

interface DepartmentData {
  name: string;
  employees: number;
  revenue: number;
}

interface CompanyPerformanceProps {
  monthlyRevenue: number;
  departmentData: DepartmentData[];
}

const CompanyPerformance: React.FC<CompanyPerformanceProps> = ({
  monthlyRevenue,
  departmentData
}) => {
  // Prepare chart data for department-wise employee distribution
  const chartData = {
    type: 'doughnut' as const,
    data: [
      {
        label: 'Department Distribution',
        data: departmentData.map(dept => ({
          label: dept.name,
          value: dept.employees
        })),
        backgroundColor: '#3B82F6',
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: true
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Monthly Revenue Card */}
      <div className="lg:col-span-1">
        <DashboardCard
          title="Monthly Revenue"
          value={`$${monthlyRevenue.toLocaleString()}`}
          subtitle="Current month"
          icon="💰"
          change="+15%"
          changeType="positive"
        />
      </div>

      {/* Department Distribution Chart */}
      <div className="lg:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Employee Distribution by Department</h3>
          <div className="h-64">
            <Chart
              config={chartData}
              title=""
              size="md"
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPerformance;
