import React, { useState, useEffect } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { 
  DepartmentOverview
} from '../../../components/common/Dashboard/AdminSpecific';
import { DepartmentQuickAccess } from '../../../components/common/Dashboard/DepartmentQuickAccess';
import { ProjectStatus } from '../../../components/common/Dashboard/ProjectStatus';
import { HRRequests } from '../../../components/common/Dashboard';
import { PerformanceLeaderboard } from '../../../components/common/Leaderboard';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useMetricGrid } from '../../../hooks/queries/useMetricGrid';
import { useActivityFeed } from '../../../hooks/queries/useActivityFeed';
import { useCrossDepartmentTopPerformers } from '../../../hooks/queries/useCrossDepartmentTopPerformers';
import { getAccountantAnalyticsApi } from '../../../apis/analytics';
import { getColorThemesForMetrics } from '../../../utils/metricColorThemes';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
// MetricData and ActivityItem removed - no longer using hardcoded data

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyTrendData {
  labels: string[];
  revenue: number[];
  expenses: number[];
  liabilities: number[];
  netProfit: number[];
}

// SVG Icon Components for Admin Metrics
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ActiveIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
);

const DepartmentsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const SystemHealthIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const AdminDashboard: React.FC = () => {
  // State for department filtering
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  
  // State for monthly financial trends
  const [trendData, setTrendData] = useState<MonthlyTrendData>({
    labels: [],
    revenue: [],
    expenses: [],
    liabilities: [],
    netProfit: []
  });
  const [loadingTrendData, setLoadingTrendData] = useState<boolean>(true);

  // Available departments
  const departments = ['Sales', 'Marketing', 'Production', 'HR', 'Accounting'];

  // Fetch metric grid data from API with department filter
  const { data: metricGridData, isLoading: isLoadingMetrics, isError: isErrorMetrics, error: metricsError, refetch: refetchMetrics } = useMetricGrid(selectedDepartment);
  
  // Fetch activity feed data from API
  const { data: activityFeedData } = useActivityFeed({ limit: 3 });

  // Helper function to get SVG icon for admin metrics
  const getAdminMetricIcon = (title: string): React.ReactNode => {
    const normalizedTitle = title.trim().toLowerCase();
    
    if (normalizedTitle.includes('user')) {
      return <UsersIcon />;
    }
    if (normalizedTitle.includes('active')) {
      return <ActiveIcon />;
    }
    if (normalizedTitle.includes('department')) {
      return <DepartmentsIcon />;
    }
    if (normalizedTitle.includes('health') || normalizedTitle.includes('system')) {
      return <SystemHealthIcon />;
    }
    
    return <UsersIcon />; // Default fallback
  };

  // Use API data for overviewStats, show empty array if API fails (no hardcoded fallback)
  // Replace icons with SVG icons for admin metrics
  const overviewStats = metricGridData && metricGridData.length > 0 
    ? metricGridData.map(metric => ({
        ...metric,
        icon: getAdminMetricIcon(metric.title)
      }))
    : []; // Empty array - will show error/empty state in UI

  // Get color themes for each metric
  const metricColorThemes = getColorThemesForMetrics(overviewStats);

  // Use API data for activities, show empty array if API fails (no hardcoded fallback)
  const activities = activityFeedData && activityFeedData.length > 0
    ? activityFeedData
    : []; // Empty array - will show error/empty state in UI

  // Fetch monthly trends data (revenue, expenses, liabilities) from API
  useEffect(() => {
    const fetchMonthlyTrends = async () => {
      try {
        setLoadingTrendData(true);
        const response = await getAccountantAnalyticsApi({ period: 'monthly' });

        if (response.success && response.data?.trends?.monthly) {
          // Transform monthly trends data to include revenue, expenses, liabilities, and net profit
          const labels: string[] = [];
          const revenue: number[] = [];
          const expenses: number[] = [];
          const liabilities: number[] = [];
          const netProfit: number[] = [];

          response.data.trends.monthly.forEach((point) => {
            // Extract month name from date (e.g., "2024-01" -> "Jan 2024")
            // Handle format "2024-01" by appending "-01" to make it a valid date
            const dateStr = point.date.includes('-') && point.date.split('-').length === 2
              ? `${point.date}-01`
              : point.date;
            const date = new Date(dateStr);
            const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            labels.push(monthName);
            revenue.push(point.revenue || 0);
            expenses.push(point.expense || 0);
            // TrendDataPoint doesn't have liability property, so we set it to 0
            liabilities.push(0);
            netProfit.push(point.net || 0);
          });

          setTrendData({
            labels,
            revenue,
            expenses,
            liabilities,
            netProfit
          });
        }
      } catch (error) {
        console.error('Error fetching monthly trends data:', error);
        // Fallback to empty data on error
        setTrendData({
          labels: [],
          revenue: [],
          expenses: [],
          liabilities: [],
          netProfit: []
        });
      } finally {
        setLoadingTrendData(false);
      }
    };

    fetchMonthlyTrends();
  }, []);

  // Fetch cross-department top performers from API
  const { data: topPerformers = [], isLoading: isLoadingTopPerformers } = useCrossDepartmentTopPerformers('monthly', 6);

  return (
    <div className="space-y-6">
        {/* Department Filter - On Top */}
        <div className="flex justify-center">
          <DepartmentFilter
            departments={departments}
            selectedDepartment={selectedDepartment}
            onDepartmentSelect={setSelectedDepartment}
          />
        </div>

        {/* Overview Stats with Quick Access on Right */}
        <div className="flex items-stretch gap-4">
          <div className="flex-1">
            {isLoadingMetrics ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-32 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : isErrorMetrics ? (
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Failed to load metrics</h3>
                  <p className="mt-1 text-sm text-gray-500">{metricsError?.message || 'Unknown error occurred'}</p>
                  <button
                    onClick={() => refetchMetrics()}
                    className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : overviewStats.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No metrics available</h3>
                  <p className="mt-1 text-sm text-gray-500">No admin metrics data found</p>
                </div>
              </div>
            ) : (
              <MetricGrid
                metrics={overviewStats}
                columns={4}
                headerColor="from-blue-50 to-transparent"
                headerGradient="from-blue-500 to-indigo-600"
                cardSize="md"
                colorThemes={metricColorThemes}
              />
            )}
          </div>
          <div className="flex flex-col gap-4 flex-shrink-0 w-56">
            <DepartmentQuickAccess department="Admin" />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Recent Activities - 1/3 width */}
          <div className="lg:col-span-1 flex">
            <ActivityFeed 
              title="Recent System Activities" 
              activities={activities} 
              maxItems={3} 
              className="flex-1"
            />
          </div>
          {/* Right Column - One component with matching height - 2/3 width */}
          <div className="lg:col-span-2 flex">
            {/* Project Status - Available for all roles */}
            <ProjectStatus className="h-full w-full" />
          </div>
        </div>

        {/* Additional Content - Moves to next line */}
        <div className="space-y-6">
          {/* HR Requests and Department Distribution - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HRRequests limit={3} />
            <DepartmentOverview />
          </div>

          {/* Monthly Financial Trends Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
                <h2 className="text-md font-bold text-gray-900">Monthly Financial Trends</h2>
              </div>
            </div>
            <div className="p-6" style={{ height: '400px' }}>
              {loadingTrendData ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse text-gray-400">Loading chart data...</div>
                </div>
              ) : trendData.labels.length > 0 ? (
                <Line
                  data={{
                    labels: trendData.labels,
                    datasets: [
                      {
                        label: 'Revenue',
                        data: trendData.revenue,
                        borderColor: 'rgb(34, 197, 94)', // Green
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        borderWidth: 3,
                      },
                      {
                        label: 'Expenses',
                        data: trendData.expenses,
                        borderColor: 'rgb(239, 68, 68)', // Red
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        borderWidth: 3,
                      },
                      {
                        label: 'Liabilities',
                        data: trendData.liabilities,
                        borderColor: 'rgb(245, 158, 11)', // Amber
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        borderWidth: 3,
                      },
                      {
                        label: 'Net Profit',
                        data: trendData.netProfit,
                        borderColor: 'rgb(59, 130, 246)', // Blue
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        borderWidth: 3,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
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
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                      },
                    },
                    scales: {
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
                          callback: function (value) {
                            return '$' + (value as number).toLocaleString();
                          },
                        },
                      },
                    },
                    elements: {
                      line: {
                        tension: 0.4,
                      },
                      point: {
                        radius: 4,
                        hoverRadius: 8,
                        hoverBorderWidth: 2,
                        hoverBorderColor: '#ffffff',
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <p className="text-sm">No trend data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

            {/* Department Performance Leaderboard */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Department Performance Leaderboard
                </h3>
                <p className="text-sm text-gray-600">
                  Track and compare performance across departments
                </p>
              </div>
              <div className="p-6">
                {isLoadingTopPerformers ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-pulse text-gray-400">Loading top performers...</div>
                  </div>
                ) : topPerformers.length > 0 ? (
                <PerformanceLeaderboard 
                  title="All Departments Top Performers"
                  members={topPerformers}
                  showDepartment={true}
                  showRole={true}
                />
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">No top performers data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
  );
};

export default AdminDashboard;