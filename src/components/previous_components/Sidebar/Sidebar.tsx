import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { NAV_ITEMS } from '../../../utils/constants';
import type { UserRole } from '../../../types';
import {
  AiOutlineDashboard,
  AiOutlineTeam,
  AiOutlineCalendar,
  AiOutlineBarChart,
  AiOutlineReload,
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
} from 'react-icons/ai';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNavigate?: (page: string) => void;
  activePage?: string;
  userRole?: UserRole;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle,
  onNavigate, 
  activePage = 'dashboard',
  userRole = 'admin',
  onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Use activePage to prevent unused variable warning
  console.log('Current active page:', activePage);

  // Filter navigation items based on user role
  const filteredNavItems = NAV_ITEMS.filter(item => 
    item.roles.includes(user?.role || userRole)
  );

  const handleNavClick = (itemId: string) => {
    const navItem = NAV_ITEMS.find(item => item.id === itemId);
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
    const navItem = NAV_ITEMS.find(item => item.path === currentPath);
    return navItem ? navItem.id : 'dashboard';
  };

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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
      // Admin-specific icons
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
      case '🔄':
        return <AiOutlineReload size={20} />;
      case '🧪':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2h-4"/>
            <path d="M9 11V7a2 2 0 012-2h2a2 2 0 012 2v4"/>
            <path d="M9 7H7a2 2 0 00-2 2v2"/>
            <path d="M15 7h2a2 2 0 012 2v2"/>
          </svg>
        );
      default:
        return <span>{emoji}</span>;
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <button
          className="sidebar-menu-toggle"
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {filteredNavItems.map((item) => (
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

      <div className="sidebar-footer">
        <div className="user-profile" onClick={handleProfileClick}>
          <div className="user-avatar">
            <AiOutlineUser size={16} />
          </div>
          {isOpen && (
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{user?.role || userRole}</span>
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
            {(user?.role === 'admin' || userRole === 'admin') && (
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

export default Sidebar;