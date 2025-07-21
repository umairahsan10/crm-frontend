import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import type { UserRole } from '../types';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onNavigate?: (page: string) => void;
  activePage?: string;
  userRole?: UserRole;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  onNavigate, 
  activePage = 'dashboard',
  userRole = 'admin'
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
      />
      <Header
        title={title}
        onMenuToggle={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout; 