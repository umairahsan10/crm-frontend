import React, { useState } from 'react';
import { NAV_ITEMS } from '../utils/constants';
import type { UserRole } from '../types';
import {
  AiOutlineDashboard,
  AiOutlineTeam,
  AiOutlineCalendar,
  AiOutlineDollar,
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
  // Filter navigation items based on user role
  const filteredNavItems = NAV_ITEMS.filter(item => 
    item.roles.includes(userRole)
  );

  const handleNavClick = (itemId: string) => {
    if (onNavigate) {
      onNavigate(itemId);
    }
  };

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleProfileClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleProfileAction = (action: string) => {
    setProfileDropdownOpen(false);
    if (action === 'logout' && onLogout) {
      onLogout();
    } else if (action === 'profile' && onNavigate) {
      onNavigate('profile');
    } else if (action === 'settings' && onNavigate) {
      onNavigate('settings');
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
        return <AiOutlineDollar size={20} />;
      case '📈':
        return <AiOutlineBarChart size={20} />;
      case '💼':
        return <AiOutlineBank size={20} />;
      case '🔄':
        return <AiOutlineReload size={20} />;
      case '⚙️':
        return <AiOutlineSetting size={20} />;
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
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
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
              <span className="user-name">John Doe</span>
              <span className="user-role">{userRole}</span>
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
            <button
              className="profile-dropdown-item"
              onClick={() => handleProfileAction('settings')}
            >
              <AiOutlineSetting size={16} />
              <span>Settings</span>
            </button>
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