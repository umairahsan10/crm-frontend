import { useState } from 'react';
import Layout from './components/Layout';
import DashboardCard from './components/DashboardCard';
import Login from './pages/Login/Login';
import type { UserRole } from './types';
import { NAV_ITEMS } from './utils/constants';
import './App.css';

// Import new HR system pages
import EmployeesPage from './pages/EmployeesPage';
import AttendancePage from './pages/AttendancePage';
import DashboardPage from './pages/DashboardPage';

// Import existing pages (to be replaced with new HR system pages)
import DealsPage from './pages/DealsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

type Page = 'dashboard' | 'employees' | 'attendance' | 'payroll' | 'sales' | 'financial' | 'chargebacks' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLogin = (role: string) => {
    setUserRole(role as UserRole);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('admin');
    setCurrentPage('dashboard');
  };

  const handleCardClick = (cardType: string) => {
    console.log(`Clicked on ${cardType} card`);
  };

  const handleNavigation = (page: string) => {
    const validPages = NAV_ITEMS.map(item => item.id);
    if (validPages.includes(page)) {
      setCurrentPage(page as Page);
    }
  };

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
        return <DashboardPage />;
    }
  };

  const getPageTitle = () => {
    const navItem = NAV_ITEMS.find(item => item.id === currentPage);
    return navItem ? navItem.label : 'Dashboard';
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // Show main application if logged in
  return (
    <Layout
      title={getPageTitle()}
      onNavigate={handleNavigation}
      activePage={currentPage}
      userRole={userRole}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
