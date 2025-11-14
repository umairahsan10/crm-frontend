import React from 'react';

type Department = 'Sales' | 'HR' | 'Marketing' | 'Production' | 'Accounts' | 'Admin';

interface DepartmentQuickAccessProps {
  department: Department;
  className?: string;
}

interface QuickLinkItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  disabled?: boolean;
}

export const DepartmentQuickAccess: React.FC<DepartmentQuickAccessProps> = ({ 
  department, 
  className = '' 
}) => {
  // Common items for all departments
  const commonItems: QuickLinkItem[] = [
    { 
      title: 'Attendance', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ), 
      href: '/my-attendance',
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'Request', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ), 
      href: '/employee-requests',
      color: 'from-blue-500 to-blue-600'
    },
  ];

  // Department-specific items
  const departmentItems: Record<Department, QuickLinkItem> = {
    Production: {
      title: 'Projects',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      ),
      href: '/projects',
      color: 'from-purple-500 to-purple-600'
    },
    HR: {
      title: 'Salary',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
      ),
      href: '/finance/salary',
      color: 'from-pink-500 to-pink-600'
    },
    Sales: {
      title: 'Leads',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
      ),
      href: '/leads',
      color: 'from-indigo-500 to-indigo-600'
    },
    Accounts: {
      title: 'Finance',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
      ),
      href: '/finance',
      color: 'from-emerald-500 to-emerald-600'
    },
    Marketing: {
      title: 'Campaign',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      ),
      href: '#',
      color: 'from-amber-500 to-amber-600',
      disabled: true
    },
    Admin: {
      title: 'Users',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      href: '/admin/users',
      color: 'from-red-500 to-red-600'
    },
  };

  // Admin-specific items (only these three)
  const adminItems: QuickLinkItem[] = [
    {
      title: 'HR Request',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
      href: '/hr-management',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Employees',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      href: '/employees',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Finance',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
      ),
      href: '/finance',
      color: 'from-emerald-500 to-emerald-600'
    },
  ];

  // For Admin, only show the three specific items; for others, show common items + department-specific item
  const quickLinks = department === 'Admin' 
    ? adminItems
    : [...commonItems, departmentItems[department]];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col ${className}`}>
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col gap-2">
          {quickLinks.map((link, index) => {
            const LinkComponent = link.disabled ? 'div' : 'a';
            const linkProps = link.disabled 
              ? {} 
              : { href: link.href };
            
            return (
              <LinkComponent
                key={index}
                {...linkProps}
                className={`group relative overflow-hidden flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-200 transition-all duration-300 flex-1 ${
                  link.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:border-blue-300 hover:shadow-sm hover:scale-[1.01] cursor-pointer'
                }`}
              >
                {/* Background gradient overlay */}
                {!link.disabled && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${link.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                )}
                
                <div className={`relative z-10 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br ${link.color} text-white shadow-sm transition-transform duration-300 ${
                  !link.disabled && 'group-hover:scale-110'
                }`}>
                  <div className="flex items-center justify-center w-full h-full">
                    {typeof link.icon === 'object' && React.isValidElement(link.icon)
                      ? React.cloneElement(link.icon as React.ReactElement<any>, { className: 'w-4 h-4' })
                      : link.icon}
                  </div>
                </div>
                <span className={`text-xs font-semibold text-gray-900 transition-colors flex-1 ${
                  !link.disabled && 'group-hover:text-blue-600'
                }`}>
                  {link.title}
                </span>
              </LinkComponent>
            );
          })}
        </div>
      </div>
    </div>
  );
};

