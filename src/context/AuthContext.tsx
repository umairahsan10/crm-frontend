import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextProps {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canAccessPage: (pageId: string) => boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  hasPermission: () => false,
  canAccessPage: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('crm_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('crm_user');
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('crm_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('crm_user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Define role-based permissions
    const rolePermissions: Record<UserRole, string[]> = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_roles', 'view_reports', 'manage_settings'],
      hr: ['read', 'write', 'view_reports', 'manage_employees', 'manage_attendance'],
      accountant: ['read', 'write', 'view_reports', 'manage_financial'],
      employee: ['read', 'view_own_data'],
    };

    return rolePermissions[user.role]?.includes(permission) || false;
  };

  const canAccessPage = (pageId: string): boolean => {
    if (!user) return false;
    
    // Define page access permissions
    const pagePermissions: Record<string, string[]> = {
      'dashboard': ['admin', 'hr', 'accountant', 'employee'],
      'employees': ['admin', 'hr'],
      'attendance': ['admin', 'hr', 'employee'],
      'deals': ['admin', 'hr', 'employee'],
      'sales': ['admin', 'hr'],
      'leads': ['admin', 'hr'],
      'settings': ['admin'],
      'profile': ['admin', 'hr', 'accountant', 'employee'],
    };

    return pagePermissions[pageId]?.includes(user.role) || false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      login,
      logout,
      hasPermission,
      canAccessPage,
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
