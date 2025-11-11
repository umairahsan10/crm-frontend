import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getUserNavigationItems } from '../../../utils/navigationUtils';

interface MergedQuickAccessProps {
  className?: string;
  maxItems?: number;
}

export const MergedQuickAccess: React.FC<MergedQuickAccessProps> = ({ 
  className = '',
  maxItems = 8
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const navigationItems = getUserNavigationItems(user);
  
  // Filter out dashboard and profile, and limit to maxItems
  const quickAccessItems = navigationItems
    .filter(item => item.id !== 'dashboard' && item.id !== 'profile')
    .slice(0, maxItems);

  // Color schemes for different types of pages
  const getColorScheme = (icon: string): string => {
    if (icon.includes('💰') || icon.includes('💵')) return 'from-emerald-500 to-teal-600';
    if (icon.includes('👥') || icon.includes('👨')) return 'from-blue-500 to-indigo-600';
    if (icon.includes('📅') || icon.includes('📋')) return 'from-purple-500 to-violet-600';
    if (icon.includes('📊') || icon.includes('📈')) return 'from-orange-500 to-red-600';
    if (icon.includes('🏢') || icon.includes('🏭')) return 'from-amber-500 to-yellow-600';
    if (icon.includes('💬')) return 'from-pink-500 to-rose-600';
    if (icon.includes('🚀')) return 'from-cyan-500 to-blue-600';
    return 'from-gray-500 to-gray-600';
  };

  const handleClick = (path: string) => {
    navigate(path);
  };

  if (quickAccessItems.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full" />
            <h2 className="text-xl font-bold text-gray-900">Quick Access</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 text-center">No quick access items available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quick Access</h2>
              <p className="text-sm text-gray-600 mt-1">Navigate to your frequently used pages</p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {quickAccessItems.map((item) => {
            const colorScheme = getColorScheme(item.icon);
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.path)}
                className="group relative overflow-hidden flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300 hover:scale-[1.02] text-center"
              >
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10 space-y-2 w-full">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${colorScheme} text-white shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto`}>
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors block">
                      {item.label}
                    </span>
                    {item.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

