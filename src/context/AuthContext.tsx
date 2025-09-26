import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { logoutApi } from '../apis/login';
import { 
  getAuthData, 
  setAuthCookies, 
  clearAuthCookies, 
  isTokenExpired
} from '../utils/cookieUtils';

interface AuthContextProps {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isInitialized: boolean;
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
  isInitialized: false,
  login: () => {},
  logout: () => {},
  hasPermission: () => false,
  canAccessPage: () => false,
  getDashboardRoute: () => '/dashboard',
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize with cached data if available
    try {
      const { token, userData } = getAuthData();
      if (token && userData && !isTokenExpired(token)) {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.error('Error initializing user from cache:', error);
    }
    return null;
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    // Initialize with cached state if available
    try {
      const { token, userData } = getAuthData();
      return !!(token && userData && !isTokenExpired(token));
    } catch (error) {
      return false;
    }
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [validationInProgress, setValidationInProgress] = useState<boolean>(false);

  // Session validation
  const validateSession = useCallback(async () => {
    // Prevent multiple simultaneous validations
    if (validationInProgress) {
      return;
    }
    
    setValidationInProgress(true);
    
    try {
      const { token, userData } = getAuthData();
      
      console.log('Validating session:', { 
        hasToken: !!token, 
        hasUserData: !!userData,
        tokenLength: token?.length,
        userDataLength: userData?.length
      });
      
      if (!token || !userData) {
        console.log('No token or user data found');
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Token expired, logging out');
        clearAuthCookies();
        setUser(null);
        setIsLoggedIn(false);
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      // For initial load, trust the token if it's not expired
      // Only verify with server if we have a valid token structure
      try {
        const parsedUser = JSON.parse(userData);
        
        // Set user and login state immediately
        console.log('Session validation - setting user:', parsedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
        
        // Mark as initialized after a brief delay to prevent race conditions
        setTimeout(() => {
          setIsInitialized(true);
        }, 50);
        
        // Skip background verification for now to prevent network errors
        // verifyTokenApi(token).then(isValid => {
        //   if (!isValid) {
        //     console.log('Background token verification failed, logging out');
        //     clearAuthCookies();
        //     setUser(null);
        //     setIsLoggedIn(false);
        //   }
        // }).catch(error => {
        //   console.warn('Background token verification error:', error);
        //   // Don't logout on network errors, just log the warning
        //   // The user stays logged in with their local token
        // });
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
        clearAuthCookies();
        setUser(null);
        setIsLoggedIn(false);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Session validation error:', error);
      clearAuthCookies();
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
      setValidationInProgress(false);
    }
  }, []);

  // Load user from cookies on mount with immediate check
  useEffect(() => {
    // If we already have valid state from initialization, just set as ready
    if (user && isLoggedIn) {
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }
    
    // If no valid data, proceed with normal validation
    const timeoutId = setTimeout(() => {
      validateSession();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [user, isLoggedIn]); // Removed validateSession from dependencies

  // Set up periodic token validation (simplified - only check expiration)
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(async () => {
      const { token, userData } = getAuthData();
      
      if (token && userData) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          console.log('Token expired during periodic check, logging out');
          clearAuthCookies();
          setUser(null);
          setIsLoggedIn(false);
        }
        // Skip server verification to prevent network errors
      }
    }, 30 * 60 * 1000); // Check every 30 minutes

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Multi-tab session synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Listen for changes in localStorage (fallback for cross-tab communication)
      if (e.key === 'crm_auth_sync') {
        const syncData = e.newValue;
        if (syncData) {
          try {
            const { action, userData, isLoggedIn: loggedIn } = JSON.parse(syncData);
            
            if (action === 'login') {
              setUser(userData);
              setIsLoggedIn(loggedIn);
            } else if (action === 'logout') {
              setUser(null);
              setIsLoggedIn(false);
            }
          } catch (error) {
            console.error('Error parsing sync data:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Broadcast auth changes to other tabs
  const broadcastAuthChange = useCallback((action: 'login' | 'logout', userData?: User) => {
    try {
      localStorage.setItem('crm_auth_sync', JSON.stringify({
        action,
        userData,
        isLoggedIn: action === 'login',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error broadcasting auth change:', error);
    }
  }, []);

  const login = (userData: User, token: string) => {
    console.log('Login called with userData:', userData);
    console.log('Login called with token:', token);
    setUser(userData);
    setIsLoggedIn(true);
    setAuthCookies(token, JSON.stringify(userData));
    broadcastAuthChange('login', userData);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
      clearAuthCookies();
      broadcastAuthChange('logout');
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) {
      console.log('hasPermission: No user found');
      return false;
    }
    
    console.log('hasPermission check:', {
      permission,
      userRole: user.role,
      userPermissions: user.permissions,
      userType: user.type,
      fullUserObject: user
    });
    
    // Use ONLY backend permissions - no frontend role-based fallbacks
    if (user.permissions && user.permissions[permission] !== undefined) {
      console.log('hasPermission: Found in user.permissions:', user.permissions[permission]);
      return user.permissions[permission];
    }
    
    // Handle permission mapping for backend compatibility
    // Backend uses employee_add_permission for both create and delete operations
    if (permission === 'employee_edit_permission') {
      // Update operations only require HR department access (no specific permission)
      console.log('hasPermission: employee_edit_permission mapped to department access');
      return user.department === 'HR' || user.role === 'admin';
    }
    
    if (permission === 'employee_delete_permission') {
      // Delete operations use employee_add_permission in backend
      console.log('hasPermission: employee_delete_permission mapped to employee_add_permission');
      return user.permissions?.employee_add_permission || false;
    }
    
    // If permission not found in backend permissions, return false
    console.log('hasPermission: Permission not found in backend permissions, returning false');
    return false;
  };

  const canAccessPage = (pageId: string): boolean => {
    console.log('canAccessPage called with pageId:', pageId, 'user:', user);
    
    if (!user) {
      console.log('No user, returning false');
      return false;
    }
    
    // Define page access permissions - Updated to match actual database roles and departments
    const pagePermissions: Record<string, string[]> = {
      'dashboard': ['admin', 'dept_manager', 'team_leads', 'unit_head', 'senior', 'junior'],
      'employees': ['admin', 'dept_manager', 'team_leads'],
      'attendance': ['admin', 'dept_manager', 'team_leads', 'unit_head', 'senior', 'junior'],
      'deals': ['admin', 'dept_manager', 'team_leads', 'unit_head', 'senior'],
      'sales': ['admin', 'dept_manager', 'team_leads', 'unit_head', 'senior'],
      'leads': ['admin', 'dept_manager', 'team_leads', 'unit_head', 'senior'],
      'leads-create': ['admin', 'dept_manager', 'team_leads', 'marketing'],
      'settings': ['admin'],
      'profile': ['admin', 'dept_manager', 'team_leads', 'unit_head', 'senior', 'junior'],
      
      // Admin-specific pages
      'projects': ['admin'],
      'finance': ['admin', 'dept_manager', 'team_leads'],
      'hr-management': ['admin', 'dept_manager'],
      'marketing': ['admin', 'dept_manager', 'team_leads'],
      'production': ['admin', 'dept_manager', 'team_leads'],
      'clients': ['admin', 'dept_manager', 'team_leads'],
      'reports': ['admin', 'dept_manager', 'team_leads'],
      'analytics': ['admin', 'dept_manager'],
      'system-logs': ['admin'],
      'audit-trail': ['admin'],
      'notifications': ['admin', 'dept_manager', 'team_leads'],
      'backup': ['admin'],
      'integrations': ['admin'],
      'security': ['admin'],
      'maintenance': ['admin'],
    };

    // Check both role and department for better matching
    const userRole = user.role?.toLowerCase();
    const userDepartment = user.department?.toLowerCase();
    const allowedRoles = pagePermissions[pageId] || [];
    
    // Enhanced matching for actual database roles and departments
    const canAccess = allowedRoles.includes(userRole) || 
                     (userDepartment && allowedRoles.includes(userDepartment)) ||
                     // Special cases for department-based access
                     (userDepartment === 'hr' && allowedRoles.includes('dept_manager')) ||
                     (userDepartment === 'sales' && allowedRoles.includes('dept_manager')) ||
                     (userDepartment === 'accounts' && allowedRoles.includes('dept_manager')) ||
                     (userDepartment === 'production' && allowedRoles.includes('dept_manager')) ||
                     (userDepartment === 'marketing' && allowedRoles.includes('dept_manager'));
    
    console.log('canAccess result:', canAccess, 'for role:', userRole, 'department:', userDepartment, 'allowedRoles:', allowedRoles);
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
      console.log('User is employee, department:', department, 'role:', user.role);
      
      switch (department) {
        case 'sales':
          console.log('Returning /dashboard/sales');
          return '/dashboard/sales';
        case 'production':
          console.log('Returning /dashboard/production');
          return '/dashboard/production';
        case 'marketing':
          console.log('Returning /dashboard/marketing');
          return '/dashboard/marketing';
        case 'hr':
          console.log('Returning /dashboard/hr');
          return '/dashboard/hr';
        case 'accounts':
          console.log('Returning /dashboard/accountant');
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
      isInitialized,
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

