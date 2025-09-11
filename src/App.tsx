import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/previous_components/Layout/Layout';
import Login from './pages/Login/Login';
import { NAV_ITEMS } from './utils/constants';
import './App.css';

// Import existing page components
import DashboardPage from './pages/Dashboard/DashboardPage';
import EmployeesPage from './pages/Employees/EmployeesPage';
import AttendancePage from './pages/Attendance/AttendancePage';
import DealsPage from './pages/Deals/DealsPage';
import ReportsPage from './pages/Sales/ReportsPage';
import LeadsPage from './pages/Leads/LeadsPage';
import SettingsPage from './pages/Settings/SettingsPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// App Layout Component
function AppLayout() {
  const { user, logout, canAccessPage } = useAuth();

  const handleNavigation = (page: string) => {
    // Navigation is now handled by React Router
    // This function can be used for programmatic navigation if needed
  };

  const getPageTitle = (pathname: string) => {
    const navItem = NAV_ITEMS.find(item => item.path === pathname);
    return navItem ? navItem.label : 'Dashboard';
  };

  return (
    <Layout
      title="CRM Dashboard"
      onNavigate={handleNavigation}
      activePage="dashboard"
      userRole={user?.role || 'employee'}
      onLogout={logout}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route 
          path="/dashboard" 
          element={canAccessPage('dashboard') ? <DashboardPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/employees" 
          element={canAccessPage('employees') ? <EmployeesPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/attendance" 
          element={canAccessPage('attendance') ? <AttendancePage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/deals" 
          element={canAccessPage('deals') ? <DealsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/sales" 
          element={canAccessPage('sales') ? <ReportsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/leads" 
          element={canAccessPage('leads') ? <LeadsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/settings" 
          element={canAccessPage('settings') ? <SettingsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/profile" 
          element={canAccessPage('profile') ? <div>Profile Page - Coming Soon</div> : <Navigate to="/login" replace />} 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
