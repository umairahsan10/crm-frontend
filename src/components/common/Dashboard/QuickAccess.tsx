import React from 'react';

interface QuickAccessProps {
  className?: string;
}

export const QuickAccess: React.FC<QuickAccessProps> = ({ className = '' }) => {
  const quickLinks = [
    { 
      title: 'My Profile', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      ), 
      href: '/profile',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'My Attendance', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ), 
      href: '/attendance',
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'My Tasks', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ), 
      href: '/tasks',
      color: 'from-amber-500 to-amber-600'
    },
    { 
      title: 'My Performance', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
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
                <div className={`w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br ${link.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto`}>
                  <div className="flex items-center justify-center w-full h-full">
                    {link.icon}
                  </div>
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