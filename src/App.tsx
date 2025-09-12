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

// Import admin-specific pages
import ProjectsPage from './pages/Projects/ProjectsPage';
import FinancePage from './pages/Finance/FinancePage';
import HRManagementPage from './pages/HRManagement/HRManagementPage';
import MarketingPage from './pages/Marketing/MarketingPage';
import ProductionPage from './pages/Production/ProductionPage';
import ClientsPage from './pages/Clients/ClientsPage';
import AdminReportsPage from './pages/Reports/ReportsPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import SystemLogsPage from './pages/SystemLogs/SystemLogsPage';
import AuditTrailPage from './pages/AuditTrail/AuditTrailPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import BackupPage from './pages/Backup/BackupPage';
import IntegrationsPage from './pages/Integrations/IntegrationsPage';
import SecurityPage from './pages/Security/SecurityPage';
import MaintenancePage from './pages/Maintenance/MaintenancePage';

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
        
        {/* Admin-specific routes */}
        <Route 
          path="/projects" 
          element={canAccessPage('projects') ? <ProjectsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/finance" 
          element={canAccessPage('finance') ? <FinancePage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/hr-management" 
          element={canAccessPage('hr-management') ? <HRManagementPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/marketing" 
          element={canAccessPage('marketing') ? <MarketingPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/production" 
          element={canAccessPage('production') ? <ProductionPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/clients" 
          element={canAccessPage('clients') ? <ClientsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/reports" 
          element={canAccessPage('reports') ? <AdminReportsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/analytics" 
          element={canAccessPage('analytics') ? <AnalyticsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/system-logs" 
          element={canAccessPage('system-logs') ? <SystemLogsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/audit-trail" 
          element={canAccessPage('audit-trail') ? <AuditTrailPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/notifications" 
          element={canAccessPage('notifications') ? <NotificationsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/backup" 
          element={canAccessPage('backup') ? <BackupPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/integrations" 
          element={canAccessPage('integrations') ? <IntegrationsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/security" 
          element={canAccessPage('security') ? <SecurityPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/maintenance" 
          element={canAccessPage('maintenance') ? <MaintenancePage /> : <Navigate to="/login" replace />} 
        />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
