import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import type { UserRole } from '../../../types';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onNavigate?: (page: string) => void;
  activePage?: string;
  userRole?: UserRole;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  onNavigate,
  activePage = 'dashboard',
  userRole = 'admin',
  onLogout
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const target = event.target as HTMLElement;
        const sidebar = document.querySelector('.sidebar');
        const mobileButton = document.querySelector('.mobile-nav-button');
        
        if (sidebar && !sidebar.contains(target) && !mobileButton?.contains(target)) {
          setSidebarOpen(false);
        }
      }
    };

    if (isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, sidebarOpen]);

  return (
    <div className="layout">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onNavigate={onNavigate}
        activePage={activePage}
        userRole={userRole}
        onLogout={onLogout}
      />
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Mobile Navigation Button */}
        {isMobile && (
          <button 
            className="mobile-nav-button"
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        )}
        
        <Header
          title={title}
        />
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout; 