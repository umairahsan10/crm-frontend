import React, { useState } from 'react';
import Layout from './components/Layout';
import DashboardCard from './components/DashboardCard';
import type { UserRole } from './types';
import { NAV_ITEMS } from './utils/constants';
import './App.css';

// Import new HR system pages
import EmployeesPage from './pages/EmployeesPage';
import AttendancePage from './pages/AttendancePage';

// Import existing pages (to be replaced with new HR system pages)
import CustomersPage from './pages/CustomersPage';
import LeadsPage from './pages/LeadsPage';
import DealsPage from './pages/DealsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

// TODO: Import remaining HR system pages when created
// import PayrollPage from './pages/PayrollPage';
// import SalesPage from './pages/SalesPage';
// import FinancialPage from './pages/FinancialPage';
// import ChargebacksPage from './pages/ChargebacksPage';

type Page = 'dashboard' | 'employees' | 'attendance' | 'payroll' | 'sales' | 'financial' | 'chargebacks' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('admin');

  const handleCardClick = (cardType: string) => {
    console.log(`Clicked on ${cardType} card`);
  };

  const handleNavigation = (page: string) => {
    const validPages = NAV_ITEMS.map(item => item.id);
    if (validPages.includes(page)) {
      setCurrentPage(page as Page);
    }
  };

  // Dashboard Page Content (temporary - will be replaced with DashboardPage component)
  const DashboardContent = () => (
    <div className="dashboard-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to the HR & Admin Management System</p>
      </div>

      <div className="stats-grid">
        <DashboardCard
          title="Total Employees"
          subtitle="Active staff members"
          value="156"
          change="+12%"
          changeType="positive"
          icon="👥"
          onClick={() => handleCardClick('employees')}
        />
        <DashboardCard
          title="Active Today"
          subtitle="Present today"
          value="142"
          change="+5%"
          changeType="positive"
          icon="✅"
          onClick={() => handleCardClick('attendance')}
        />
        <DashboardCard
          title="Total Sales"
          subtitle="This month"
          value="$45,230"
          change="+18%"
          changeType="positive"
          icon="💰"
          onClick={() => handleCardClick('sales')}
        />
        <DashboardCard
          title="Pending Approvals"
          subtitle="Requires action"
          value="8"
          change="-3"
          changeType="negative"
          icon="⏳"
          onClick={() => handleCardClick('approvals')}
        />
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn" onClick={() => handleNavigation('employees')}>
              <span>👤</span>
              <span>Add Employee</span>
            </button>
            <button className="action-btn" onClick={() => handleNavigation('attendance')}>
              <span>📅</span>
              <span>Mark Attendance</span>
            </button>
            <button className="action-btn" onClick={() => handleNavigation('payroll')}>
              <span>💰</span>
              <span>Process Payroll</span>
            </button>
            <button className="action-btn" onClick={() => handleNavigation('chargebacks')}>
              <span>🔄</span>
              <span>Review Chargebacks</span>
            </button>
          </div>
        </div>

        <div className="section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">👤</div>
              <div className="activity-content">
                <p>New employee John Smith added</p>
                <small>2 hours ago</small>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">💰</div>
              <div className="activity-content">
                <p>Payroll processed for March 2024</p>
                <small>1 day ago</small>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📈</div>
              <div className="activity-content">
                <p>Sales target exceeded by 15%</p>
                <small>2 days ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render the appropriate page
  const renderPage = () => {
    switch (currentPage) {
      case 'employees':
        return <EmployeesPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'payroll':
        return <DealsPage />; // Temporary - replace with PayrollPage
      case 'sales':
        return <ReportsPage />; // Temporary - replace with SalesPage
      case 'financial':
        return <ReportsPage />; // Temporary - replace with FinancialPage
      case 'chargebacks':
        return <ReportsPage />; // Temporary - replace with ChargebacksPage
      case 'settings':
        return <SettingsPage />;
      case 'dashboard':
      default:
        return <DashboardContent />;
    }
  };

  const getPageTitle = () => {
    const navItem = NAV_ITEMS.find(item => item.id === currentPage);
    return navItem ? navItem.label : 'Dashboard';
  };

  return (
    <Layout
      title={getPageTitle()}
      onNavigate={handleNavigation}
      activePage={currentPage}
      userRole={userRole}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
