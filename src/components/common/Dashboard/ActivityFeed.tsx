import React from 'react';
import type { ActivityItem } from '../../../types/dashboard';

interface ActivityFeedProps {
  title: string;
  activities: ActivityItem[];
  maxItems?: number;
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  title,
  activities,
  maxItems = 3,
  className = ''
}) => {
  const getActivityStyles = (type: string) => {
    switch (type) {
      case 'success': 
        return {
          dot: 'bg-green-500',
          border: 'border-green-200'
        };
      case 'warning': 
        return {
          dot: 'bg-yellow-500',
          border: 'border-yellow-200'
        };
      case 'error': 
        return {
          dot: 'bg-red-500',
          border: 'border-red-200'
        };
      case 'info':
      default: 
        return {
          dot: 'bg-gray-500',
          border: 'border-gray-200'
        };
    }
  };

  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 w-full h-full flex flex-col ${className}`}>
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
            <h2 className="text-md font-bold text-gray-900">{title}</h2>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-100 flex-1">
        {displayActivities.map((activity, index) => {
          const styles = getActivityStyles(activity.type);
          return (
            <div key={activity.id} className="p-6 py-4 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent hover:shadow-sm transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${styles.dot} ring-4 ring-white group-hover:scale-110 transition-transform duration-300`} />
                  {index < displayActivities.length - 1 && (
                    <div className="absolute top-3 left-1.5 w-0.5 h-8 bg-gray-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {activity.user && (
                      <>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">{activity.user}</span>
                        </div>
                        <span>•</span>
                      </>
                    )}
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};