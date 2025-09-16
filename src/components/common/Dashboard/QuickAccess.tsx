import React from 'react';

interface QuickAccessProps {
  className?: string;
}

export const QuickAccess: React.FC<QuickAccessProps> = ({ className = '' }) => {
  const quickLinks = [
    { 
      title: 'My Profile', 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ), 
      href: '/profile',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'My Attendance', 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ), 
      href: '/attendance',
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'My Tasks', 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ), 
      href: '/tasks',
      color: 'from-amber-500 to-amber-600'
    },
    { 
      title: 'My Performance', 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ), 
      href: '/performance',
      color: 'from-purple-500 to-purple-600'
    },
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-pink-500 to-rose-600 rounded-full" />
          <h2 className="text-xl font-bold text-gray-900">Quick Access</h2>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="group relative overflow-hidden flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all duration-300 hover:scale-[1.02] text-center"
            >
              {/* Background gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <div className="relative z-10 space-y-4">
                <div className={`p-4 rounded-xl bg-gradient-to-br ${link.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {link.icon}
                </div>
                <span className="text-sm font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                  {link.title}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};