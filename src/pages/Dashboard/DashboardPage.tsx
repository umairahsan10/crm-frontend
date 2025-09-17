import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// Import dashboard components
import AdminDashboard from './subdashboards/AdminDashboard';
import SalesDashboard from './subdashboards/SalesDashboard';
import HRDashboard from './subdashboards/HRDashboard';
import ProductionDashboard from './subdashboards/ProductionDashboard';
import MarketingDashboard from './subdashboards/MarketingDashboard';
import AccountantDashboard from './subdashboards/AccountantDashboard';

// import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const { user, getDashboardRoute } = useAuth();
  const navigate = useNavigate();

  // Redirect to appropriate dashboard based on user type and department
  useEffect(() => {
    if (user) {
      const dashboardRoute = getDashboardRoute();
      if (dashboardRoute !== '/dashboard') {
        navigate(dashboardRoute, { replace: true });
      }
    }
  }, [user, getDashboardRoute, navigate]);

  // Fallback dashboard component
  const renderDashboard = () => {
    if (!user) {
      return <div>Loading...</div>;
    }

    // If user is admin, show admin dashboard
    if (user.type === 'admin') {
      return <AdminDashboard />;
    }
    
    // If user is employee, check department for specific dashboard
    if (user.type === 'employee' && user.department) {
      const department = user.department.toLowerCase();
      switch (department) {
        case 'sales':
          return <SalesDashboard />;
        case 'production':
          return <ProductionDashboard />;
        case 'marketing':
          return <MarketingDashboard />;
        case 'hr':
          return <HRDashboard />;
        case 'accounts':
          return <AccountantDashboard />;
        default:
          return <AdminDashboard />; // Fallback to admin dashboard
      }
    }

    // Default fallback
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Welcome to CRM Dashboard</h2>
          <p className="text-gray-600">
            You are being redirected to your department-specific dashboard. 
            If you don't see a redirect, please contact your administrator.
          </p>
        </div>
      </div>
    );
  };

  return renderDashboard();
};

export default DashboardPage; 