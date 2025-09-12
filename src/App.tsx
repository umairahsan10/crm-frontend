import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/previous_components/Layout/Layout';
import Login from './pages/Login/Login';
import './App.css';

// Import existing page components
import DashboardPage from './pages/Dashboard/DashboardPage';
import EmployeesPage from './pages/Employees/EmployeesPage';
import AttendancePage from './pages/Attendance/AttendancePage';
import DealsPage from './pages/Deals/DealsPage';
import ReportsPage from './pages/Sales/ReportsPage';
import LeadsPage from './pages/Leads/LeadsPage';
import SettingsPage from './pages/Settings/SettingsPage';

// Import dashboard components
import AdminDashboard from './pages/Dashboard/components/AdminDashboard';
import SalesDashboard from './pages/Dashboard/components/SalesDashboard';
import HRDashboard from './pages/Dashboard/components/HRDashboard';
import ProductionDashboard from './pages/Dashboard/components/ProductionDashboard';
import MarketingDashboard from './pages/Dashboard/components/MarketingDashboard';
import AccountantDashboard from './pages/Dashboard/components/AccountantDashboard';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
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

  const handleNavigation = () => {
    // Navigation is now handled by React Router
    // This function can be used for programmatic navigation if needed
  };

  return (
    <Layout
      title="CRM Dashboard"
      onNavigate={handleNavigation}
      activePage="dashboard"
      userRole={user?.role as any || 'employee'}
      onLogout={logout}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route 
          path="/dashboard" 
          element={canAccessPage('dashboard') ? <DashboardPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/dashboard/admin" 
          element={canAccessPage('dashboard') ? <AdminDashboard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/dashboard/sales" 
          element={canAccessPage('dashboard') ? <SalesDashboard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/dashboard/hr" 
          element={canAccessPage('dashboard') ? <HRDashboard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/dashboard/production" 
          element={canAccessPage('dashboard') ? <ProductionDashboard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/dashboard/marketing" 
          element={canAccessPage('dashboard') ? <MarketingDashboard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/dashboard/accountant" 
          element={canAccessPage('dashboard') ? <AccountantDashboard /> : <Navigate to="/login" replace />} 
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
