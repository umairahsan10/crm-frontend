import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useNavbar } from '../../../context/NavbarContext';
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
  AiOutlineDown,
} from 'react-icons/ai';
import './Navbar.css';

interface NavbarProps {
  isOpen: boolean;
  onNavigate?: (page: string) => void;
  activePage?: string;
  onLogout?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: string;
  items: NavItem[];
}

type NavigationItem = NavItem | NavGroup;

function isNavGroup(item: NavigationItem): item is NavGroup {
  return 'items' in item;
}

const Navbar: React.FC<NavbarProps> = ({ 
  isOpen, 
  onNavigate, 
  onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { setNavbarExpanded } = useNavbar();
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Determine if navbar should be expanded (hovered or manually opened)
  const isExpanded = isHovered || isOpen;
  
  // Update context when expanded state changes
  useEffect(() => {
    setNavbarExpanded(isExpanded);
  }, [isExpanded, setNavbarExpanded]);

  // Update dropdown positions when hover state or expanded state changes
  useEffect(() => {
    if (hoveredGroupId) {
      const button = buttonRefs.current[hoveredGroupId];
      const dropdown = dropdownRefs.current[hoveredGroupId];
      if (button && dropdown) {
        const rect = button.getBoundingClientRect();
        dropdown.style.top = `${rect.top}px`;
        dropdown.style.left = `${isExpanded ? rect.right + 8 : 70 + 8}px`;
      }
    }
  }, [hoveredGroupId, isExpanded]);

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
        {
          id: 'employee-management-group',
          label: 'Employee Management',
          icon: '👥',
          items: [
            { id: 'employees', label: 'Employees', icon: '👥', path: '/employees' },
            { id: 'attendance', label: 'Attendance', icon: '📅', path: '/attendance' },
          ],
        },
        {
          id: 'requests-group',
          label: 'Request Management',
          icon: '📝',
          items: [
            { id: 'requests', label: 'Requests', icon: '📝', path: '/employee-requests' },
            { id: 'hr-requests', label: 'HR Requests', icon: '📋', path: '/admin-hr-requests' },
          ],
        },
        {
          id: 'finance-management-group',
          label: 'Finance Management',
          icon: '💰',
          items: [
            { id: 'finance', label: 'Finance', icon: '💰', path: '/finance' },
            { id: 'salary', label: 'Salary Management', icon: '💵', path: '/finance/salary' },
          ],
        },
        {
          id: 'team-management-group',
          label: 'Team Management',
          icon: '👥',
          items: [
            { id: 'production-teams', label: 'Production Teams', icon: '👥', path: '/production/teams' },
            { id: 'sales-teams', label: 'Sales Teams', icon: '👥', path: '/sales/teams' },
          ],
        },
        {
          id: 'unit-management-group',
          label: 'Unit Management',
          icon: '🏢',
          items: [
            { id: 'production-units', label: 'Production Units', icon: '🏢', path: '/production/units' },
            { id: 'sales-units', label: 'Sales Units', icon: '🏢', path: '/sales/units' },
          ],
        },
        { id: 'logs', label: 'Logs', icon: '📋', path: '/logs' },
        { id: 'leads', label: 'Leads', icon: '⭕', path: '/leads' },
        { id: 'leads-create', label: 'Create Leads', icon: '➕', path: '/leads/create' },
        { id: 'projects', label: 'Projects', icon: '🚀', path: '/projects' },
        { id: 'integrations', label: 'Integrations', icon: '🔗', path: '/integrations' },
      ];
    }

    // Employee navigation based on department
    if (type === 'employee') {
      const baseItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'my-attendance', label: 'My Attendance', icon: '📅', path: '/my-attendance' },
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
            { id: 'clients', label: 'Clients', icon: '👤', path: '/clients' },
            { id: 'sales-units', label: 'Sales Units', icon: '🏢', path: '/sales/units' },
            { id: 'sales-teams', label: 'Sales Teams', icon: '👥', path: '/sales/teams' },
            { id: 'chats', label: 'Chat', icon: '💬', path: '/chats' },
          ];
        
        case 'production':
          return [
            ...baseItems,
            { id: 'production-units', label: 'Units Management', icon: '🏢', path: '/production/units' },
            { id: 'production-teams', label: 'Teams Management', icon: '👥', path: '/production/teams' },
            { id: 'projects', label: 'Projects', icon: '🚀', path: '/projects' },
            { id: 'chats', label: 'Chat', icon: '💬', path: '/chats' },
          ];
        
        case 'marketing':
          return [
            ...baseItems,
            { id: 'leads-create', label: 'Create Leads', icon: '➕', path: '/leads/create' },
            { id: 'chats', label: 'Chat', icon: '💬', path: '/chats' },
          ];
        
        case 'accounts':
        case 'accounting':
          return [
            ...baseItems,
            { id: 'finance', label: 'Finance', icon: '💰', path: '/finance' },
            { id: 'salary', label: 'Salary Management', icon: '💵', path: '/finance/salary' },
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

  const handleNavClick = (itemId: string, path?: string) => {
    if (path) {
      navigate(path);
    } else {
      const navItem = navigationItems.find(item => {
        if (isNavGroup(item)) {
          return item.items.some(subItem => subItem.id === itemId);
        }
        return item.id === itemId;
      });
      
      if (navItem) {
        if (isNavGroup(navItem)) {
          const subItem = navItem.items.find(sub => sub.id === itemId);
          if (subItem) {
            navigate(subItem.path);
          }
        } else {
          navigate(navItem.path);
        }
      }
    }
    if (onNavigate) {
      onNavigate(itemId);
    }
  };

  // Get current active page based on URL
  const getCurrentActivePage = () => {
    const currentPath = location.pathname;
    
    // Check regular items first
    for (const item of navigationItems) {
      if (isNavGroup(item)) {
        // Check items within the group
        for (const subItem of item.items) {
          if (subItem.path === currentPath || 
              (subItem.path !== '/' && currentPath.startsWith(subItem.path + '/'))) {
            return subItem.id;
          }
        }
      } else {
        // Check regular item
        if (item.path === currentPath || 
            (item.path !== '/' && currentPath.startsWith(item.path + '/'))) {
          return item.id;
        }
      }
    }
    
    // Special case: if we're on dashboard, highlight dashboard
    if (currentPath === '/dashboard') {
      return 'dashboard';
    }
    
    // For all other pages not in navbar, don't highlight anything
    return null;
  };

  // Control profile dropdown based on hover state
  useEffect(() => {
    setProfileDropdownOpen(isProfileHovered);
  }, [isProfileHovered]);

  const handleProfileAction = (action: string) => {
    // Dropdown will close automatically when mouse leaves (hover-based)
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
    <div 
      className={`navbar ${isExpanded ? 'open' : 'closed'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <nav className="navbar-nav">
        <ul className="nav-list">
          {navigationItems.map((item) => {
            if (isNavGroup(item)) {
              const isGroupHovered = hoveredGroupId === item.id;
              const isGroupActive = item.items.some(subItem => getCurrentActivePage() === subItem.id);
              
              return (
                <li 
                  key={item.id}
                  className="nav-group-item"
                  onMouseEnter={() => setHoveredGroupId(item.id)}
                  onMouseLeave={() => {
                    // Small delay to allow moving to dropdown
                    setTimeout(() => {
                      const dropdown = dropdownRefs.current[item.id];
                      if (dropdown && !dropdown.matches(':hover')) {
                        setHoveredGroupId(null);
                      }
                    }, 150);
                  }}
                >
                  <div className="nav-group-wrapper">
                    <button
                      ref={(el) => { buttonRefs.current[item.id] = el; }}
                      className={`nav-item nav-group-button ${isGroupActive ? 'active' : ''}`}
                      title={!isExpanded ? item.label : undefined}
                    >
                      <span className="nav-icon">
                        {renderIcon(item.icon)}
                      </span>
                      {isExpanded && (
                        <>
                          <span className="nav-label">{item.label}</span>
                          <AiOutlineDown 
                            size={14} 
                            className={`nav-group-arrow ${isGroupHovered ? 'open' : ''}`}
                          />
                        </>
                      )}
                    </button>
                    {isGroupHovered && (
                      <div 
                        ref={(el) => { dropdownRefs.current[item.id] = el; }}
                        className="nav-group-dropdown"
                        onMouseEnter={() => setHoveredGroupId(item.id)}
                        onMouseLeave={() => setHoveredGroupId(null)}
                      >
                        {item.items.map((subItem) => (
                          <button
                            key={subItem.id}
                            className={`nav-group-dropdown-item ${getCurrentActivePage() === subItem.id ? 'active' : ''}`}
                            onClick={() => handleNavClick(subItem.id, subItem.path)}
                            title={!isExpanded ? subItem.label : undefined}
                          >
                            <span className="nav-icon">
                              {renderIcon(subItem.icon)}
                            </span>
                            <span className="nav-label">{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            } else {
              return (
                <li key={item.id}>
                  <button
                    className={`nav-item ${getCurrentActivePage() === item.id ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id, item.path)}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <span className="nav-icon">
                      {renderIcon(item.icon)}
                    </span>
                    {isExpanded && <span className="nav-label">{item.label}</span>}
                  </button>
                </li>
              );
            }
          })}
        </ul>
      </nav>

      <div 
        className="navbar-footer"
        onMouseEnter={() => setIsProfileHovered(true)}
        onMouseLeave={() => setIsProfileHovered(false)}
      >
        <div className="user-profile">
          <div className="user-avatar">
            <AiOutlineUser size={16} />
          </div>
          {isExpanded && (
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
              title={!isExpanded ? 'Profile' : undefined}
            >
              <AiOutlineProfile size={16} />
              {isExpanded && <span>Profile</span>}
            </button>
            {user?.type === 'admin' && (
              <button
                className="profile-dropdown-item"
                onClick={() => handleProfileAction('settings')}
                title={!isExpanded ? 'Settings' : undefined}
              >
                <AiOutlineSetting size={16} />
                {isExpanded && <span>Settings</span>}
              </button>
            )}
            {onLogout && (
              <button
                className="profile-dropdown-item"
                onClick={() => handleProfileAction('logout')}
                title={!isExpanded ? 'Logout' : undefined}
              >
                <AiOutlineLogout size={16} />
                {isExpanded && <span>Logout</span>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
