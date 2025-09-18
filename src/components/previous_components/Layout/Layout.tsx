import React, { useState, useEffect } from 'react';
import Navbar from '../../layout/Navbar/Navbar';
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
  onLogout
}) => {
  const [navbarOpen, setNavbarOpen] = useState(true); // Start with navbar open
  const [isMobile, setIsMobile] = useState(false);

  const toggleNavbar = () => {
    setNavbarOpen(!navbarOpen);
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

  // Close navbar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && navbarOpen) {
        const target = event.target as HTMLElement;
        const navbar = document.querySelector('.navbar');
        const mobileButton = document.querySelector('.mobile-nav-button');
        
        if (navbar && !navbar.contains(target) && !mobileButton?.contains(target)) {
          setNavbarOpen(false);
        }
      }
    };

    if (isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, navbarOpen]);

  return (
    <div className="layout">
      <Navbar
        isOpen={navbarOpen}
        onToggle={toggleNavbar}
        onNavigate={onNavigate}
        activePage={activePage}
        onLogout={onLogout}
      />
      <div className={`main-content ${navbarOpen ? 'navbar-open' : ''}`}>
        {/* Mobile Navigation Button */}
        {isMobile && (
          <button 
            className="mobile-nav-button"
            onClick={toggleNavbar}
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