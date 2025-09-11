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
  AiOutlineBank,
  AiOutlineReload,
  AiOutlineSetting,
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineProfile,
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
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        );
      case '📈':
        return <AiOutlineBarChart size={20} />;
      case '💼':
        return <AiOutlineBank size={20} />;
      case '🔄':
        return <AiOutlineReload size={20} />;
      case '⚙️':
        return <AiOutlineSetting size={20} />;
      case '⭕':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="8"/>
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
            >
              <AiOutlineProfile size={16} />
              <span>Profile</span>
            </button>
            {(user?.role === 'admin' || userRole === 'admin') && (
              <button
                className="profile-dropdown-item"
                onClick={() => handleProfileAction('settings')}
              >
                <AiOutlineSetting size={16} />
                <span>Settings</span>
              </button>
            )}
            {onLogout && (
              <button
                className="profile-dropdown-item"
                onClick={() => handleProfileAction('logout')}
              >
                <AiOutlineLogout size={16} />
                <span>Logout</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;