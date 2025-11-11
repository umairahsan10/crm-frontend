import type { User } from '../types';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  description?: string;
}

/**
 * Get navigation items based on user type, role, and department
 * This matches the logic from Navbar component
 */
export const getUserNavigationItems = (user: User | null): NavigationItem[] => {
  if (!user) return [];

  const { type, department } = user;
  
  // Admin sees all pages
  if (type === 'admin') {
    return [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
      { id: 'my-attendance', label: 'My Attendance', icon: '📅', path: '/my-attendance' },
      { id: 'employees', label: 'Employees', icon: '👥', path: '/employees' },
      { id: 'requests', label: 'Requests', icon: '📝', path: '/employee-requests' },
      { id: 'hr-requests', label: 'HR Requests', icon: '📋', path: '/admin-hr-requests' },
      { id: 'attendance', label: 'Attendance', icon: '📅', path: '/attendance' },
      { id: 'logs', label: 'Logs', icon: '📋', path: '/logs' },
      { id: 'leads', label: 'Leads', icon: '⭕', path: '/leads' },
      { id: 'leads-create', label: 'Create Leads', icon: '➕', path: '/leads/create' },
      { id: 'company', label: 'Companies', icon: '🏢', path: '/company' },
      { id: 'projects', label: 'Projects', icon: '🚀', path: '/projects' },
      { id: 'finance', label: 'Finance', icon: '💰', path: '/finance', description: 'Financial management and analytics' },
      { id: 'salary', label: 'Salary Management', icon: '💵', path: '/finance/salary', description: 'Salary calculations and management' },
      { id: 'hr-management', label: 'HR Management', icon: '👨‍💼', path: '/hr-management' },
      { id: 'marketing', label: 'Marketing', icon: '📢', path: '/marketing' },
      { id: 'production', label: 'Production', icon: '🏭', path: '/production' },
      { id: 'production-units', label: 'Units Management', icon: '🏢', path: '/production/units' },
      { id: 'production-teams', label: 'Teams Management', icon: '👥', path: '/production/teams' },
      { id: 'sales', label: 'Sales', icon: '📈', path: '/sales' },
      { id: 'sales-units', label: 'Sales Units', icon: '🏢', path: '/sales/units' },
      { id: 'sales-teams', label: 'Sales Teams', icon: '👥', path: '/sales/teams' },
      { id: 'reports', label: 'Reports', icon: '📊', path: '/reports' },
      { id: 'analytics', label: 'Analytics', icon: '📈', path: '/analytics' },
      { id: 'audit-trail', label: 'Audit Trail', icon: '🔍', path: '/audit-trail' },
      { id: 'notifications', label: 'Notifications', icon: '🔔', path: '/notifications' },
      { id: 'backup', label: 'Backup & Restore', icon: '💾', path: '/backup' },
      { id: 'integrations', label: 'Integrations', icon: '🔗', path: '/integrations' },
      { id: 'security', label: 'Security', icon: '🔒', path: '/security' },
      { id: 'maintenance', label: 'Maintenance', icon: '⚙️', path: '/maintenance' },
      { id: 'test', label: 'Test Page', icon: '🧪', path: '/test' },
    ];
  }

  // Employee navigation based on department
  if (type === 'employee') {
    const baseItems: NavigationItem[] = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
      { id: 'my-attendance', label: 'My Attendance', icon: '📅', path: '/my-attendance', description: 'View your attendance records' },
      { id: 'requests', label: 'Requests', icon: '📝', path: '/employee-requests', description: 'Submit and track requests' },
      { id: 'profile', label: 'Profile', icon: '👤', path: '/profile', description: 'View and edit your profile' },
    ];

    // Add department-specific items
    const departmentLower = department?.toLowerCase();
    
    switch (departmentLower) {
      case 'hr':
        return [
          ...baseItems,
          { id: 'request-admin', label: 'Request Admin', icon: '📋', path: '/hr-request-admin' },
          { id: 'employees', label: 'Employees', icon: '👥', path: '/employees', description: 'Manage employee records' },
          { id: 'attendance', label: 'Attendance', icon: '📅', path: '/attendance', description: 'Manage attendance records' },
          { id: 'logs', label: 'Logs', icon: '📋', path: '/logs' },
          { id: 'hr-management', label: 'HR Management', icon: '👨‍💼', path: '/hr-management' },
          { id: 'finance', label: 'Finance', icon: '💰', path: '/finance', description: 'Financial management' },
          { id: 'salary', label: 'Salary Management', icon: '💵', path: '/finance/salary', description: 'Salary calculations' },
          { id: 'chats', label: 'Chats', icon: '💬', path: '/chats' },
        ];
      
      case 'sales':
      case 'sales department':
      case 'sales team':
        return [
          ...baseItems,
          { id: 'leads', label: 'Leads', icon: '⭕', path: '/leads', description: 'Manage sales leads' },
          { id: 'leads-create', label: 'Create Leads', icon: '➕', path: '/leads/create', description: 'Create new leads' },
          { id: 'company', label: 'Companies', icon: '🏢', path: '/company' },
          { id: 'clients', label: 'Clients', icon: '👤', path: '/clients', description: 'Manage clients' },
          { id: 'sales-units', label: 'Sales Units', icon: '🏢', path: '/sales/units' },
          { id: 'sales-teams', label: 'Sales Teams', icon: '👥', path: '/sales/teams' },
          { id: 'chats', label: 'Chat', icon: '💬', path: '/chats' },
        ];
      
      case 'production':
        return [
          ...baseItems,
          { id: 'production', label: 'Production', icon: '🏭', path: '/production' },
          { id: 'production-units', label: 'Units Management', icon: '🏢', path: '/production/units' },
          { id: 'production-teams', label: 'Teams Management', icon: '👥', path: '/production/teams' },
          { id: 'projects', label: 'Projects', icon: '🚀', path: '/projects' },
          { id: 'chats', label: 'Chat', icon: '💬', path: '/chats' },
        ];
      
      case 'marketing':
        return [
          ...baseItems,
          { id: 'marketing', label: 'Marketing', icon: '📢', path: '/marketing' },
          { id: 'leads-create', label: 'Create Leads', icon: '➕', path: '/leads/create' },
          { id: 'chats', label: 'Chat', icon: '💬', path: '/chats' },
        ];
      
      case 'accounts':
      case 'finance':
      case 'accounting':
        return [
          ...baseItems,
          { id: 'finance', label: 'Finance', icon: '💰', path: '/finance', description: 'Financial management and analytics' },
          { id: 'salary', label: 'Salary Management', icon: '💵', path: '/finance/salary', description: 'Salary calculations and management' },
          { id: 'chats', label: 'Chat', icon: '💬', path: '/chats', description: 'Team communication' },
        ];
      
      default:
        return [
          ...baseItems,
          { id: 'attendance', label: 'Attendance', icon: '📅', path: '/attendance' },
          { id: 'chats', label: 'Chat', icon: '💬', path: '/chats' },
        ];
    }
  }

  return [];
};

