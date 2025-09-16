import React from 'react';
  import type { QuickActionItem } from '../../../types/dashboard';

interface QuickActionCardProps {
  title: string;
  actions: QuickActionItem[];
  className?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ 
  title,
  actions,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full" />
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <div className="p-2.5 rounded-lg bg-green-100 text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {actions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300 hover:scale-[1.01]"
            >
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                action.color || 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
              }`}>
                <span className="text-lg">{action.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  {action.title}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>
              <div className="flex-shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};