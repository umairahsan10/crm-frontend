import React, { useState } from 'react';
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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