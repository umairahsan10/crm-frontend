/**
 * Utility to get page titles based on current route
 */

export const getPageTitle = (pathname: string): string => {
  const titleMap: { [key: string]: string } = {
    // Dashboard routes
    '/dashboard': 'Dashboard',
    '/dashboard/admin': 'Admin Dashboard',
    '/dashboard/sales': 'Sales Dashboard',
    '/dashboard/hr': 'HR Dashboard',
    '/dashboard/production': 'Production Dashboard',
    '/dashboard/marketing': 'Marketing Dashboard',
    '/dashboard/accountant': 'Accountant Dashboard',
    
    // HR Management routes
    '/employees': 'Employee Management',
    '/attendance': 'Attendance Management',
    '/payroll': 'Payroll Management',
    '/hr-logs': 'HR Logs',
    '/hr-management': 'HR Management',
    '/employee-requests': 'Employee Requests',
    '/admin-hr-requests': 'HR Requests',
    '/hr-request-admin': 'Request Admin',
    
    // Log routes
    '/logs': 'System Logs',
    '/logs/access': 'Access Logs',
    '/logs/hr': 'HR Logs',
    '/logs/leave': 'Leave Logs',
    '/logs/late': 'Late Logs',
    '/logs/half-day': 'Half Day Logs',
    '/logs/campaign': 'Campaign Logs',
    '/logs/salary': 'Salary Logs',
    '/logs/project': 'Project Logs',
    
    // Business Management routes
    '/leads': 'Leads Management',
    '/leads/create': 'Create Lead',
    '/deals': 'Deals Management',
    '/sales': 'Sales Management',
    '/company': 'Company Management',
    '/clients': 'Clients Management',
    
    // Project Management routes
    '/projects': 'Project Management',
    
    // Finance routes
    '/finance': 'Finance Management',
    '/finance/salary': 'Salary Management',
    '/finance/salary/calculator': 'Salary Calculator',
    '/finance/salary/bonus': 'Bonus Management',
    
    // Department routes
    '/marketing': 'Marketing',
    '/production': 'Production',
    '/production/units': 'Production Units Management',
    '/production/teams': 'Production Teams Management',
    '/sales/units': 'Sales Units Management',
    '/sales/teams': 'Sales Teams Management',
    
    // Communication routes
    '/chats': 'Chat',
    
    // System routes
    '/system-logs': 'System Logs',
    '/reports': 'Reports',
    '/analytics': 'Analytics',
    '/audit-trail': 'Audit Trail',
    '/notifications': 'Notifications',
    '/backup': 'Backup',
    '/integrations': 'Integrations',
    '/security': 'Security',
    '/maintenance': 'Maintenance',
    
    // User routes
    '/settings': 'Settings',
    '/profile': 'Profile'
  };

  return titleMap[pathname] || 'CRM Dashboard';
};
