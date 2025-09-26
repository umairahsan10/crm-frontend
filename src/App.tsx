import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavbarProvider } from './context/NavbarContext';
import Layout from './components/previous_components/Layout/Layout';
import Login from './pages/Login/Login';
import './App.css';

// Import existing page components
import DashboardPage from './pages/Dashboard/DashboardPage';
import EmployeeManagement from './pages/HRManagement/Employees/EmployeeManagement';
import AttendancePage from './pages/Attendance/AttendancePage';
import LogsPage from './pages/Logs/LogsPage';
import HRLogsPage from './pages/Logs/subpages/HRLogsPage';
import AccessLogsPage from './pages/Logs/subpages/AccessLogsPage';
import LeaveLogsPage from './pages/Logs/subpages/LeaveLogsPage';
import LateLogsPage from './pages/Logs/subpages/LateLogsPage';
import HalfDayLogsPage from './pages/Logs/subpages/HalfDayLogsPage';
import CampaignLogsPage from './pages/Logs/subpages/CampaignLogsPage';
import SalaryLogsPage from './pages/Logs/subpages/SalaryLogsPage';
import ProjectLogsPage from './pages/Logs/subpages/ProjectLogsPage';
import EmployeeRequestsPage from './pages/EmployeeRequests/EmployeeRequestsPage';
import DealsPage from './pages/Deals/DealsPage';
import ReportsPage from './pages/Sales/ReportsPage';
import LeadsManagementPage from './pages/Leads/LeadsManagementPage';
import LeadsCreationPage from './pages/Leads/LeadsCreationPage';
import SettingsPage from './pages/Settings/SettingsPage';

// Import dashboard components
import AdminDashboard from './pages/Dashboard/subdashboards/AdminDashboard';
import SalesDashboard from './pages/Dashboard/subdashboards/SalesDashboard';
import HRDashboard from './pages/Dashboard/subdashboards/HRDashboard';
import ProductionDashboard from './pages/Dashboard/subdashboards/ProductionDashboard';
import MarketingDashboard from './pages/Dashboard/subdashboards/MarketingDashboard';
import AccountantDashboard from './pages/Dashboard/subdashboards/AccountantDashboard';

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
import TestPage from './pages/test';
import ProfilePage from './pages/Profile/ProfilePage';
import ChatPage from './pages/Chat/Chat';

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
      <NavbarProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/test" element={<TestPage />} />
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
      </NavbarProvider>
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
          element={canAccessPage('employees') ? <EmployeeManagement /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/attendance" 
          element={canAccessPage('attendance') ? <AttendancePage /> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/hr-logs" 
          element={canAccessPage('hr-logs') ? <HRLogsPage /> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/logs" 
          element={canAccessPage('logs') ? <LogsPage /> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/logs/access" 
          element={canAccessPage('logs') ? <AccessLogsPage /> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/logs/hr" 
          element={canAccessPage('hr-logs') ? <HRLogsPage /> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/logs/leave" 
          element={canAccessPage('logs') ? <LeaveLogsPage /> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/logs/late" 
          element={canAccessPage('logs') ? <LateLogsPage /> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/logs/half-day" 
          element={canAccessPage('logs') ? <HalfDayLogsPage /> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/logs/campaign" 
          element={canAccessPage('logs') ? <CampaignLogsPage /> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/logs/salary" 
          element={canAccessPage('logs') ? <SalaryLogsPage /> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/logs/project" 
          element={canAccessPage('logs') ? <ProjectLogsPage /> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/employee-requests" 
          element={canAccessPage('employee-requests') ? <EmployeeRequestsPage /> : <Navigate to="/login" replace />}
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
          element={canAccessPage('leads') ? <LeadsManagementPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/leads/create" 
          element={canAccessPage('leads') ? <LeadsCreationPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/settings" 
          element={canAccessPage('settings') ? <SettingsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/profile" 
          element={canAccessPage('profile') ? <ProfilePage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/chats" 
          element={canAccessPage('chats') ? <ChatPage /> : <Navigate to="/login" replace />} 
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
