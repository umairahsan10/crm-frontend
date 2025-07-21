import React from 'react';
import { NAV_ITEMS } from '../utils/constants';
import type { UserRole } from '../types';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNavigate?: (page: string) => void;
  activePage?: string;
  userRole?: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  onNavigate, 
  activePage = 'dashboard',
  userRole = 'admin'
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

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
          {isOpen && <h2 className="logo-text">Dashboard</h2>}
        </div>
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
                  {item.icon}
                </span>
                {isOpen && <span className="nav-label">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          {isOpen && (
            <div className="user-info">
              <span className="user-name">John Doe</span>
              <span className="user-role">{userRole}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 