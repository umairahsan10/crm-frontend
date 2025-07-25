import React from 'react';
import './Navbar.css';

interface NavbarProps {
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = "CRM Dashboard" }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1 className="navbar-logo">{title}</h1>
        </div>
        
        <div className="navbar-menu">
          <a href="#dashboard" className="nav-link active">Dashboard</a>
          <a href="#customers" className="nav-link">Customers</a>
          <a href="#leads" className="nav-link">Leads</a>
          <a href="#deals" className="nav-link">Deals</a>
          <a href="#reports" className="nav-link">Reports</a>
        </div>
        
        <div className="navbar-actions">
          <button className="btn-notifications">
            <span className="notification-icon">🔔</span>
          </button>
          <div className="user-profile">
            <img 
              src="https://via.placeholder.com/32x32/4F46E5/FFFFFF?text=U" 
              alt="User" 
              className="user-avatar"
            />
            <span className="user-name">John Doe</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 