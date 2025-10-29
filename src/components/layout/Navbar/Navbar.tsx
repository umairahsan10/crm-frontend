import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  AiOutlineDashboard,
  AiOutlineTeam,
  AiOutlineCalendar,
  AiOutlineBarChart,
  AiOutlineSetting,
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineProfile,
  AiOutlineProject,
  AiOutlineDollarCircle,
  AiOutlineUserSwitch,
  AiOutlineNotification,
  AiOutlineFileText,
  AiOutlineSearch,
  AiOutlineBell,
  AiOutlineDatabase,
  AiOutlineLink,
  AiOutlineLock,
  AiOutlineTool,
  AiOutlineWallet,
} from 'react-icons/ai';
import './Navbar.css';

interface NavbarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNavigate?: (page: string) => void;
  activePage?: string;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  isOpen, 
  onToggle,
  onNavigate, 
  onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileDropdownTimeout, setProfileDropdownTimeout] = useState<number | null>(null);

  // Get navigation items based on user type, role, and department
  const getNavigationItems = () => {
    if (!user) return [];

    const { type, department } = user;
    
    // Debug logging
    console.log('Navbar - User data:', { type, department, role: user.role });

    // Admin sees all pages
    if (type === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'employees', label: 'Employees', icon: '👥', path: '/employees' },
        { id: 'requests', label: 'Requests', icon: '📝', path: '/employee-requests' },
        { id: 'hr-requests', label: 'HR Requests', icon: '📋', path: '/admin-hr-requests' },
        { id: 'attendance', label: 'Attendance', icon: '📅', path: '/attendance' },
        { id: 'logs', label: 'Logs', icon: '📋', path: '/logs' },
        { id: 'leads', label: 'Leads', icon: '⭕', path: '/leads' },
        { id: 'leads-create', label: 'Create Leads', icon: '➕', path: '/leads/create' },
        { id: 'company', label: 'Companies', icon: '🏢', path: '/company' },
        { id: 'projects', label: 'Projects', icon: '🚀', path: '/projects' },
        { id: 'finance', label: 'Finance', icon: '💰', path: '/finance' },
        { id: 'salary', label: 'Salary Management', icon: '💵', path: '/finance/salary' },
        { id: 'hr-management', label: 'HR Management', icon: '👨‍💼', path: '/hr-management' },
        { id: 'marketing', label: 'Marketing', icon: '📢', path: '/marketing' },
        { id: 'production', label: 'Production', icon: '🏭', path: '/production' },
        { id: 'production-units', label: 'Units Management', icon: '🏢', path: '/production/units' },
        { id: 'production-teams', label: 'Teams Management', icon: '👥', path: '/production/teams' },
        { id: 'sales', label: 'Sales', icon: '📈', path: '/sales' },
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
      const baseItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'requests', label: 'Requests', icon: '📝', path: '/employee-requests' },
      ];

      // Add department-specific items
      const departmentLower = department?.toLowerCase();
      console.log('Navbar - Department (lowercase):', departmentLower);
      
      switch (departmentLower) {
        case 'hr':
          return [
            ...baseItems,
            { id: 'request-admin', label: 'Request Admin', icon: '📋', path: '/hr-request-admin' },
            { id: 'employees', label: 'Employees', icon: '👥', path: '/employees' },
            { id: 'attendance', label: 'Attendance', icon: '📅', path: '/attendance' },
            { id: 'logs', label: 'Logs', icon: '📋', path: '/logs' },
            { id: 'hr-management', label: 'HR Management', icon: '👨‍💼', path: '/hr-management' },
            { id: 'finance', label: 'Finance', icon: '💰', path: '/finance' },
            { id: 'salary', label: 'Salary Management', icon: '💵', path: '/finance/salary' },
            { id: 'chats', label: 'Chats', icon: '💬', path: '/chats' },
          ];
        
        case 'sales':
        case 'sales department':
        case 'sales team':
          return [
            ...baseItems,
            { id: 'leads', label: 'Leads', icon: '⭕', path: '/leads' },
            { id: 'leads-create', label: 'Create Leads', icon: '➕', path: '/leads/create' },
            { id: 'company', label: 'Companies', icon: '🏢', path: '/company' },
            { id: 'clients', label: 'Clients', icon: '👤', path: '/clients' },
            { id: 'sales-teams', label: 'Sales Teams', icon: '👥', path: '/sales/teams' },
            { id: 'chats', label: 'Chat', icon: '💬', path: '/chats' },
          ];
        
        case 'production':
          return [
            ...baseItems,
            { id: 'production', label: 'Production', icon: '🏭', path: '/production' },
            { id: 'production-units', label: 'Units Management', icon: '🏢', path: '/production/units' },
            { id: 'production-teams', label: 'Teams Management', icon: '👥', path: '/production/teams' },
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
          return [
            ...baseItems,
            { id: 'finance', label: 'Finance', icon: '💰', path: '/finance' },
            { id: 'salary', label: 'Salary Management', icon: '💵', path: '/finance/salary' },
            { id: 'chats', label: 'Chat', icon: '💬', path: '/chats' },
          ];
        
        default:
          // Default employee with no specific department or unrecognized department
          console.log('Navbar - Unrecognized department, using default navigation:', departmentLower);
          return [
            ...baseItems,
            { id: 'attendance', label: 'Attendance', icon: '📅', path: '/attendance' },
            { id: 'chats', label: 'Chat', icon: '💬', path: '/chats' },
          ];
      }
    }

    return [];
  };

  const navigationItems = getNavigationItems();

  const handleNavClick = (itemId: string) => {
    const navItem = navigationItems.find(item => item.id === itemId);
    if (navItem) {
      navigate(navItem.path);
    }
    if (onNavigate) {
      onNavigate(itemId);
    }
  };

  // Get current active page based on URL
  const getCurrentActivePage = () => {
    const currentPath = location.pathname;
    
    // Find exact match first
    const exactMatch = navigationItems.find(item => item.path === currentPath);
    if (exactMatch) {
      return exactMatch.id;
    }
    
    // Handle sub-routes - check if current path starts with any navbar path
    const subRouteMatch = navigationItems.find(item => 
      item.path !== '/' && currentPath.startsWith(item.path + '/')
    );
    if (subRouteMatch) {
      return subRouteMatch.id;
    }
    
    // Special case: if we're on dashboard, highlight dashboard
    if (currentPath === '/dashboard') {
      return 'dashboard';
    }
    
    // For all other pages not in navbar, don't highlight anything
    return null;
  };

  // Auto-close profile dropdown after 1 second
  useEffect(() => {
    if (profileDropdownOpen) {
      // Clear any existing timeout
      if (profileDropdownTimeout) {
        clearTimeout(profileDropdownTimeout);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        setProfileDropdownOpen(false);
      }, 1250);

      setProfileDropdownTimeout(timeout);
    } else {
      // Clear timeout if dropdown is closed
      if (profileDropdownTimeout) {
        clearTimeout(profileDropdownTimeout);
        setProfileDropdownTimeout(null);
      }
    }

    // Cleanup on unmount
    return () => {
      if (profileDropdownTimeout) {
        clearTimeout(profileDropdownTimeout);
      }
    };
  }, [profileDropdownOpen]);

  const handleProfileClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleProfileAction = (action: string) => {
    setProfileDropdownOpen(false);
    if (action === 'logout' && onLogout) {
      onLogout();
    } else if (action === 'profile') {
      navigate('/profile');
    } else if (action === 'settings') {
      navigate('/settings');
    }
  };

  // Function to render the appropriate icon based on emoji
  const renderIcon = (emoji: string) => {
    switch (emoji) {
      case '📊':
        return <AiOutlineDashboard size={20} />;
      case '👥':
        return <AiOutlineTeam size={20} />;
      case '📅':
        return <AiOutlineCalendar size={20} />;
      case '💰':
        return <AiOutlineDollarCircle size={20} />;
      case '💵':
        return <AiOutlineWallet size={20} />;
      case '📈':
        return <AiOutlineBarChart size={20} />;
      case '💼':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        );
      case '⭕':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        );
      case '🚀':
        return <AiOutlineProject size={20} />;
      case '👨‍💼':
        return <AiOutlineUserSwitch size={20} />;
      case '📢':
        return <AiOutlineNotification size={20} />;
      case '🏭':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        );
      case '👤':
        return <AiOutlineUser size={20} />;
      case '📋':
        return <AiOutlineFileText size={20} />;
      case '🔍':
        return <AiOutlineSearch size={20} />;
      case '🔔':
        return <AiOutlineBell size={20} />;
      case '💾':
        return <AiOutlineDatabase size={20} />;
      case '🔗':
        return <AiOutlineLink size={20} />;
      case '🔒':
        return <AiOutlineLock size={20} />;
      case '⚙️':
        return <AiOutlineTool size={20} />;
      case '🧪':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2h-4"/>
            <path d="M9 11V7a2 2 0 012-2h2a2 2 0 012 2v4"/>
            <path d="M9 7H7a2 2 0 00-2 2v2"/>
            <path d="M15 7h2a2 2 0 012 2v2"/>
          </svg>
        );
      case '💬':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        );
      case '➕':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        );
      case '📝':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        );
      case '🏢':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18"/>
            <path d="M5 21V7l8-4v18"/>
            <path d="M9 9h.01"/>
            <path d="M9 12h.01"/>
            <path d="M9 15h.01"/>
            <path d="M9 18h.01"/>
          </svg>
        );
      default:
        return <span>{emoji}</span>;
    }
  };

  return (
    <div className={`navbar ${isOpen ? 'open' : 'closed'}`}>
      <div className="navbar-header">
        <button
          className="navbar-menu-toggle"
          onClick={onToggle}
          aria-label="Toggle navbar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      <nav className="navbar-nav">
        <ul className="nav-list">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${getCurrentActivePage() === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                title={!isOpen ? item.label : undefined}
              >
                <span className="nav-icon">
                  {renderIcon(item.icon)}
                </span>
                {isOpen && <span className="nav-label">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="navbar-footer">
        <div className="user-profile" onClick={handleProfileClick}>
          <div className="user-avatar">
            <AiOutlineUser size={16} />
          </div>
          {isOpen && (
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{user?.role || 'User'}</span>
            </div>
          )}
        </div>

        {profileDropdownOpen && (
          <div className="profile-dropdown">
            <button
              className="profile-dropdown-item"
              onClick={() => handleProfileAction('profile')}
              title={!isOpen ? 'Profile' : undefined}
            >
              <AiOutlineProfile size={16} />
              {isOpen && <span>Profile</span>}
            </button>
            {user?.type === 'admin' && (
              <button
                className="profile-dropdown-item"
                onClick={() => handleProfileAction('settings')}
                title={!isOpen ? 'Settings' : undefined}
              >
                <AiOutlineSetting size={16} />
                {isOpen && <span>Settings</span>}
              </button>
            )}
            {onLogout && (
              <button
                className="profile-dropdown-item"
                onClick={() => handleProfileAction('logout')}
                title={!isOpen ? 'Logout' : undefined}
              >
                <AiOutlineLogout size={16} />
                {isOpen && <span>Logout</span>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
