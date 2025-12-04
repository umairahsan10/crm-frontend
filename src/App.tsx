import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavbarProvider } from './context/NavbarContext';
import Layout from './components/previous_components/Layout/Layout';
import Login from './pages/Login/Login';
import { PageErrorBoundary } from './components/common/ErrorBoundary';
import './App.css';
import './components/common/ErrorBoundary/ErrorBoundary.css';

// Import existing page components
import DashboardPage from './pages/Dashboard/DashboardPage';
import EmployeeManagement from './pages/HRManagement/Employees/EmployeeManagement';
import AttendancePage from './pages/Attendance/AttendancePage';
import MyAttendancePage from './pages/MyAttendance/MyAttendancePage';
import LogsPage from './pages/LogFiles/LogPages';
import HRLogsPage from './pages/LogFiles/subpages/HRLogsPage';
import AccessLogsPage from './pages/LogFiles/subpages/AccessLogsPage';
import LeaveLogsPage from './pages/LogFiles/subpages/LeaveLogsPage';
import LateLogsPage from './pages/LogFiles/subpages/LateLogsPage';
import HalfDayLogsPage from './pages/LogFiles/subpages/HalfDayLogsPage';
import CampaignLogsPage from './pages/LogFiles/subpages/CampaignLogsPage';
import SalaryLogsPage from './pages/LogFiles/subpages/SalaryLogsPage';
import ProjectLogsPage from './pages/LogFiles/subpages/ProjectLogsPage';
import EmployeeRequestsPage from './pages/EmployeeRequests/EmployeeRequestsPage';
import HRRequestAdminPage from './pages/HRManagement/HRRequestAdminPage';
import AdminHRRequestsPage from './pages/Admin/AdminHRRequestsPage';
import PayrollPage from './pages/HRManagement/Payroll/PayrollPage';
import DealsPage from './pages/Deals/DealsPage';
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
import AssetsPage from './pages/Finance/AssetsPage';
import LiabilitiesPage from './pages/Finance/LiabilitiesPage';
import ExpensesPage from './pages/Finance/ExpensesPage';
import RevenuePage from './pages/Finance/RevenuePage';
import SalaryManagementPage from './pages/Finance/Salary/SalaryManagementPage';
import SalaryCalculatorPage from './pages/Finance/Salary/SalaryCalculatorPage';
import BonusManagementPage from './pages/Finance/Salary/BonusManagementPage';
import CommissionManagementPage from './pages/Finance/Salary/CommissionManagementPage';
import ProductionUnitsManagementPage from './pages/Production/ProductionUnitsManagementPage';
import ProductionTeamsManagementPage from './pages/Production/ProductionTeamsManagementPage';
import SalesTeamsManagementPage from './pages/Sales/SalesTeamsManagementPage';
import SalesUnitsManagementPage from './pages/Sales/SalesUnitsManagementPage';
import ClientsPage from './pages/Clients/ClientsPage';
import SystemLogsPage from './pages/SystemLogs/SystemLogsPage';
import IntegrationsPage from './pages/Integrations/IntegrationsPage';
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
    <PageErrorBoundary>
      <AuthProvider>
        <NavbarProvider>
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
        </NavbarProvider>
      </AuthProvider>
    </PageErrorBoundary>
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
    <PageErrorBoundary resetKeys={[window.location.pathname]}>
      <Layout
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
          path="/my-attendance" 
          element={<MyAttendancePage />}
        />
        <Route 
          path="/payroll" 
          element={canAccessPage('payroll') ? <PayrollPage /> : <Navigate to="/login" replace />}
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
          path="/hr-request-admin" 
          element={canAccessPage('hr-request-admin') ? <HRRequestAdminPage /> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/admin-hr-requests" 
          element={canAccessPage('admin-hr-requests') ? <AdminHRRequestsPage /> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/deals" 
          element={canAccessPage('deals') ? <DealsPage /> : <Navigate to="/login" replace />} 
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
          path="/finance/assets" 
          element={canAccessPage('finance') ? <AssetsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/finance/liabilities" 
          element={canAccessPage('finance') ? <LiabilitiesPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/finance/expenses" 
          element={canAccessPage('finance') ? <ExpensesPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/finance/revenue" 
          element={canAccessPage('finance') ? <RevenuePage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/finance/salary" 
          element={canAccessPage('finance') ? <SalaryManagementPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/finance/salary/calculator" 
          element={canAccessPage('finance') ? <SalaryCalculatorPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/finance/salary/bonus" 
          element={canAccessPage('finance') ? <BonusManagementPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/finance/salary/commission" 
          element={canAccessPage('finance') ? <CommissionManagementPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/production/units" 
          element={canAccessPage('production') ? <ProductionUnitsManagementPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/production/teams" 
          element={canAccessPage('production') ? <ProductionTeamsManagementPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/sales/teams" 
          element={canAccessPage('sales') ? <SalesTeamsManagementPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/sales/units" 
          element={canAccessPage('sales') ? <SalesUnitsManagementPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/clients" 
          element={canAccessPage('clients') ? <ClientsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/system-logs" 
          element={canAccessPage('system-logs') ? <SystemLogsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/integrations" 
          element={canAccessPage('integrations') ? <IntegrationsPage /> : <Navigate to="/login" replace />} 
        />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Layout>
    </PageErrorBoundary>
  );
}

export default App;
