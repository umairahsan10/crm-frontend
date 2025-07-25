import { useState } from 'react';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import type { UserRole } from './types';
import { NAV_ITEMS } from './utils/constants';
import './App.css';

// Import new HR system pages
import EmployeesPage from './pages/Employees/EmployeesPage';
import AttendancePage from './pages/Attendance/AttendancePage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import LeadsPage from './pages/Leads/LeadsPage';

// Import existing pages (to be replaced with new HR system pages)
import DealsPage from './pages/Deals/DealsPage';
import ReportsPage from './pages/Sales/ReportsPage';
import SettingsPage from './pages/Settings/SettingsPage';

type Page = 'dashboard' | 'employees' | 'attendance' | 'payroll' | 'deals' | 'leads' | 'sales' | 'financial' | 'chargebacks' | 'settings';

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



  const handleNavigation = (page: string) => {
    const validPages = NAV_ITEMS.map(item => item.id);
    if (validPages.includes(page)) {
      setCurrentPage(page as Page);
    }
  };

  // Dashboard Page Content (temporary - will be replaced with DashboardPage component)

  // Render the appropriate page
  const renderPage = () => {
    switch (currentPage) {
      case 'employees':
        return <EmployeesPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'leads':
        return <LeadsPage />;
      case 'deals':
        return <DealsPage />;
      case 'sales':
        return <ReportsPage />; // Temporary - replace with SalesPage
      // case 'financial':
      //   return <ReportsPage />; // Temporary - replace with FinancialPage
      // case 'chargebacks':
      //   return <ReportsPage />; // Temporary - replace with ChargebacksPage
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
