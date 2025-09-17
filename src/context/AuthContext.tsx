import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { logoutApi } from '../apis/login';

interface AuthContextProps {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canAccessPage: (pageId: string) => boolean;
  getDashboardRoute: () => string;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  hasPermission: () => false,
  canAccessPage: () => false,
  getDashboardRoute: () => '/dashboard',
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('crm_user');
    const savedToken = localStorage.getItem('crm_token');
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('crm_user');
        localStorage.removeItem('crm_token');
      }
    }
    
    // Always set loading to false after checking localStorage
    setIsLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('crm_user', JSON.stringify(userData));
    localStorage.setItem('crm_token', token);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem('crm_user');
      localStorage.removeItem('crm_token');
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Check if user has specific permission in their permissions object
    if (user.permissions && user.permissions[permission] !== undefined) {
      return user.permissions[permission];
    }
    
    // Fallback to role-based permissions
    const rolePermissions: Record<string, string[]> = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_roles', 'view_reports', 'manage_settings'],
      hr: ['read', 'write', 'view_reports', 'manage_employees', 'manage_attendance'],
      accountant: ['read', 'write', 'view_reports', 'manage_financial'],
      sales: ['read', 'write', 'view_reports', 'manage_sales'],
      dep_manager: ['read', 'write', 'view_reports', 'manage_sales'],
      production: ['read', 'write', 'view_reports', 'manage_production'],
      marketing: ['read', 'write', 'view_reports', 'manage_marketing'],
      employee: ['read', 'view_own_data'],
    };

    return rolePermissions[user.role]?.includes(permission) || false;
  };

  const canAccessPage = (pageId: string): boolean => {
    console.log('canAccessPage called with pageId:', pageId, 'user:', user);
    
    if (!user) {
      console.log('No user, returning false');
      return false;
    }
    
    // Define page access permissions
    const pagePermissions: Record<string, string[]> = {
      'dashboard': ['admin', 'hr', 'accountant', 'sales', 'production', 'marketing', 'dep_manager'],
      'employees': ['admin', 'hr'],
      'attendance': ['admin', 'hr', 'employee'],
      'deals': ['admin', 'hr', 'sales', 'dep_manager'],
      'sales': ['admin', 'hr', 'sales', 'dep_manager'],
      'leads': ['admin', 'hr', 'sales', 'dep_manager'],
      'settings': ['admin'],
      'profile': ['admin', 'hr', 'accountant', 'employee', 'sales', 'production', 'marketing', 'dep_manager'],
      
      // Admin-specific pages
      'projects': ['admin'],
      'finance': ['admin', 'accountant'],
      'hr-management': ['admin', 'hr'],
      'marketing': ['admin', 'marketing'],
      'production': ['admin', 'production'],
      'clients': ['admin', 'sales'],
      'reports': ['admin'],
      'analytics': ['admin'],
      'system-logs': ['admin'],
      'audit-trail': ['admin'],
      'notifications': ['admin'],
      'backup': ['admin'],
      'integrations': ['admin'],
      'security': ['admin'],
      'maintenance': ['admin'],
    };

    const canAccess = pagePermissions[pageId]?.includes(user.role) || false;
    console.log('canAccess result:', canAccess, 'for role:', user.role);
    return canAccess;
  };

  const getDashboardRoute = (): string => {
    console.log('getDashboardRoute called with user:', user);
    
    if (!user) {
      console.log('No user, returning /dashboard');
      return '/dashboard';
    }
    
    // If user is admin, redirect to admin dashboard
    if (user.type === 'admin') {
      console.log('User is admin, returning /dashboard/admin');
      return '/dashboard/admin';
    }
    
    // If user is employee, check department for specific dashboard
    if (user.type === 'employee' && user.department) {
      const department = user.department.toLowerCase();
      console.log('User is employee, department:', department);
      
      switch (department) {
        case 'sales':
          console.log('Returning /dashboard/sales');
          return '/dashboard/sales';
        case 'production':
          return '/dashboard/production';
        case 'marketing':
          return '/dashboard/marketing';
        case 'hr':
          return '/dashboard/hr';
        case 'accounts':
          return '/dashboard/accountant';
        default:
          console.log('Unknown department, returning /dashboard');
          return '/dashboard';
      }

    }
    
    console.log('Fallback, returning /dashboard');
    return '/dashboard';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      isLoading,
      login,
      logout,
      hasPermission,
      canAccessPage,
      getDashboardRoute,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

