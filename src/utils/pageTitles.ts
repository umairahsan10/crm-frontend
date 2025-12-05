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
    '/my-attendance': 'My Attendance',
    '/payroll': 'Payroll Management',
    '/hr-logs': 'HR Logs',
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
    '/clients': 'Clients Management',
    
    // Project Management routes
    '/projects': 'Project Management',
    
    // Finance routes
    '/finance': 'Finance Management',
    '/finance/salary': 'Salary Management',
    '/finance/salary/calculator': 'Salary Calculator',
    '/finance/salary/bonus': 'Bonus Management',
    '/finance/salary/commission': 'Commission Management',
    
    // Department routes
    '/production/units': 'Production Units Management',
    '/production/teams': 'Production Teams Management',
    '/sales/units': 'Sales Units Management',
    '/sales/teams': 'Sales Teams Management',
    
    // Communication routes
    '/chats': 'Chat',
    
    // System routes
    '/system-logs': 'System Logs',
    '/integrations': 'Integrations',
    
    // User routes
    '/settings': 'Settings',
    '/profile': 'Profile'
  };

  return titleMap[pathname] || 'CRM Dashboard';
};
