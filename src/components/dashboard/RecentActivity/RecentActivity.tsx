import React from 'react';

interface ActivityItem {
  id: number;
  action: string;
  user: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'error';
  category: 'registration' | 'login' | 'system' | 'admin_request';
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActivityIcon = (type: string, category: string) => {
    if (category === 'registration') return '👤';
    if (category === 'login') return '🔐';
    if (category === 'system') return '⚙️';
    if (category === 'admin_request') return '📋';
    
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent System Activities</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className={`w-3 h-3 rounded-full mr-4 ${getActivityColor(activity.type)}`}></div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getActivityIcon(activity.type, activity.category)}</span>
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                by {activity.user} • {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
