import React from 'react';
import './Header.css';

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
  sidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuToggle, sidebarOpen = false }) => {
  return (
    <header className={`header ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <h1 className="page-title">{title}</h1>
      </div>
      
      <div className="header-center">
        <div className="search-container">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search..." 
            className="search-input"
          />
        </div>
      </div>
      
      <div className="header-right">
        <button className="notification-btn">
          <svg className="notification-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-menu">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format"
            alt="John Doe" 
            className="user-avatar"
          />
          <div className="user-info">
            <span className="user-name">John Doe</span>
            <span className="user-email">john@example.com</span>
          </div>
          <button className="user-dropdown">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 