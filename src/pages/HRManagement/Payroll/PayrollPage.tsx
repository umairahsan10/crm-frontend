import React, { useState, useEffect, useCallback } from 'react';
import PayrollTable from '../../../components/payroll/PayrollTable';
import SalaryDetailsDrawer from '../../../components/payroll/SalaryDetailsDrawer';
import DataStatistics from '../../../components/common/Statistics/DataStatistics';
import LeadsSearchFilters from '../../../components/leads/LeadsSearchFilters';
import { payrollFilterConfig } from '../../../components/payroll/payrollFilterConfig';
import {
  getPayrollApi,
  getPayrollStatisticsApi,
  type NetSalary,
  type GetPayrollDto,
  type PayrollStatistics,
} from '../../../apis/payroll';
import { getDepartmentsApi, type Department } from '../../../apis/hr-employees';

interface PayrollPageProps {
  onBack?: () => void;
}

const PayrollPage: React.FC<PayrollPageProps> = ({ onBack }) => {
  
  // State management
  const [salaries, setSalaries] = useState<NetSalary[]>([]);
  const [selectedSalary, setSelectedSalary] = useState<NetSalary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);

  // Filter state
  const [filters, setFilters] = useState<GetPayrollDto>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  // Data state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [statistics, setStatistics] = useState<PayrollStatistics>({
    totalSalaries: 0,
    totalPaid: 0,
    totalPending: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    byDepartment: {},
    thisMonth: {
      total: 0,
      paid: 0,
      pending: 0,
    },
  });

  // Fetch departments (mock data for now)
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await getDepartmentsApi();
      setDepartments(response.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Use mock departments
      setDepartments([
        { id: 1, name: 'Sales', description: 'Sales Department' },
        { id: 2, name: 'HR', description: 'Human Resources' },
        { id: 3, name: 'Marketing', description: 'Marketing Department' },
        { id: 4, name: 'Accounts', description: 'Accounts Department' },
        { id: 5, name: 'Engineering', description: 'Engineering Department' },
      ]);
    }
  }, []);

  // Fetch payroll data (using mock data for frontend testing)
  const fetchPayroll = useCallback(async () => {
    setIsLoading(true);
    
    // Try to fetch from API first
    try {
      const response = await getPayrollApi(filters);
      setSalaries(response.data || []);
      setTotalItems(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
      console.log('✅ Payroll data loaded from API');
    } catch (error: any) {
      console.log('⚠️ API unavailable, using mock data for frontend testing');
      // Always fallback to mock data if API fails
      generateMockSalaries();
    } finally {
      setIsLoading(false);
    }
  }, [filters, itemsPerPage]);

  // Fetch statistics (mock data for now)
  const fetchStatistics = useCallback(async () => {
    try {
      const currentDate = new Date();
      const response = await getPayrollStatisticsApi({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      });
      setStatistics(response.data);
    } catch (error) {
      console.log('⚠️ Statistics API unavailable, using mock statistics');
      // Generate mock statistics based on mock data
      setStatistics({
        totalSalaries: 25,
        totalPaid: 15,
        totalPending: 10,
        totalAmount: 1250000,
        paidAmount: 750000,
        pendingAmount: 500000,
        byDepartment: {
          Sales: { total: 8, paid: 5, pending: 3, amount: 400000 },
          HR: { total: 5, paid: 3, pending: 2, amount: 250000 },
          Marketing: { total: 6, paid: 4, pending: 2, amount: 300000 },
          Accounts: { total: 6, paid: 3, pending: 3, amount: 300000 },
        },
        thisMonth: {
          total: 25,
          paid: 15,
          pending: 10,
        },
      });
    }
  }, []);

  // Generate mock salaries for fallback (more comprehensive data)
  const generateMockSalaries = () => {
    const departments = ['Sales', 'HR', 'Marketing', 'Accounts', 'Engineering'];
    const roles = ['Manager', 'Senior', 'Junior', 'Lead', 'Executive'];
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria', 'Daniel', 'Jessica', 'Christopher', 'Ashley', 'Matthew', 'Amanda', 'Andrew', 'Stephanie', 'Joshua', 'Jennifer', 'William', 'Elizabeth', 'Brian', 'Linda', 'Kevin'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Clark'];
    
    const currentDate = new Date();
    
    const mockData: NetSalary[] = Array.from({ length: 25 }, (_, i) => {
      const isPaid = i < 15; // First 15 are paid, rest pending
      const basicSalary = 40000 + (i * 3000);
      const allowances = 5000 + (i * 200);
      const deductions = 2000 + (i * 100);
      const tax = basicSalary * 0.1; // 10% tax
      const netAmount = basicSalary + allowances - deductions - tax;
      
      return {
        id: i + 1,
        employeeId: 1000 + i,
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        basicSalary,
        allowances,
        deductions,
        tax,
        netAmount,
        isPaid,
        paidOn: isPaid ? new Date(currentDate.getFullYear(), currentDate.getMonth(), Math.floor(Math.random() * 15) + 1).toISOString() : undefined,
        processedBy: isPaid ? 500 : undefined,
        createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString(),
        updatedAt: new Date().toISOString(),
        employee: {
          id: 1000 + i,
          firstName: firstNames[i % firstNames.length],
          lastName: lastNames[i % lastNames.length],
          email: `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@company.com`,
          department: {
            id: (i % 5) + 1,
            name: departments[i % 5],
          },
          role: {
            id: (i % 5) + 1,
            title: roles[i % 5],
          },
        },
        processor: isPaid ? {
          id: 500,
          firstName: 'Admin',
          lastName: 'User',
        } : undefined,
        transaction: isPaid ? {
          id: 5000 + i,
          amount: netAmount,
          transactionType: 'salary',
          status: 'completed',
          transactionDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), Math.floor(Math.random() * 15) + 1).toISOString(),
        } : undefined,
      };
    });
    
    setSalaries(mockData);
    setTotalItems(mockData.length);
    setTotalPages(Math.ceil(mockData.length / itemsPerPage));
  };

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Initial data fetch
  useEffect(() => {
    fetchDepartments();
    fetchPayroll();
    fetchStatistics();
  }, [fetchDepartments, fetchPayroll, fetchStatistics]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle row click
  const handleRowClick = (salary: NetSalary) => {
    setSelectedSalary(salary);
    setDrawerOpen(true);
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedSalary(null), 300);
  };

  // Handle salary updated
  const handleSalaryUpdated = () => {
    fetchPayroll();
    fetchStatistics();
    handleDrawerClose();
    showNotification('success', 'Salary marked as paid successfully!');
  };

  // Handle search
  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
    setCurrentPage(1);
  };

  // Handle department filter
  const handleDepartmentFilter = (departmentId: string) => {
    setFilters((prev) => ({
      ...prev,
      departmentId: departmentId && departmentId !== 'all' ? parseInt(departmentId) : undefined,
      page: 1,
    }));
    setCurrentPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      isPaid: status === 'paid' ? true : status === 'pending' ? false : undefined,
      page: 1,
    }));
    setCurrentPage(1);
  };

  // Handle date range filter (month/year)
  const handleDateRangeFilter = (startDate: string) => {
    if (startDate) {
      const date = new Date(startDate);
      setFilters((prev) => ({
        ...prev,
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        page: 1,
      }));
      setCurrentPage(1);
    } else {
      setFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters.month;
        delete newFilters.year;
        return { ...newFilters, page: 1 };
      });
      setCurrentPage(1);
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
    setCurrentPage(1);
  };

  // Statistics cards
  const statisticsCards = [
    {
      title: 'Total Salaries',
      value: statistics.totalSalaries,
      color: 'indigo' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      title: 'Paid',
      value: statistics.totalPaid,
      color: 'green' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      title: 'Pending',
      value: statistics.totalPending,
      color: 'yellow' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      title: 'Total Amount',
      value: `$${(statistics.totalAmount || 0).toLocaleString()}`,
      color: 'blue' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  // Update filter config with department options
  const updatedFilterConfig = {
    ...payrollFilterConfig,
    customOptions: {
      ...payrollFilterConfig.customOptions,
      typeOptions: [
        { value: 'all', label: 'All Departments' },
        ...departments.map((dept) => ({
          value: dept.id.toString(),
          label: dept.name,
        })),
      ],
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Demo Mode Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              🎨 Frontend Demo Mode
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Displaying mock salary data for UI testing. Connect backend APIs to see real payroll information.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="mb-3 flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to HR Management
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg
              className="w-8 h-8 mr-3 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Payroll Management
          </h1>
          <p className="text-gray-600 mt-1">Manage employee salaries and payments</p>
        </div>
        <button
          onClick={() => setShowStatistics(!showStatistics)}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          {showStatistics ? 'Hide Stats' : 'Show Stats'}
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center">
            <span className="text-lg mr-2">
              {notification.type === 'success' ? '✓' : '⚠'}
            </span>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Statistics */}
      {showStatistics && <DataStatistics cards={statisticsCards} />}

      {/* Filters */}
      <LeadsSearchFilters
        config={updatedFilterConfig}
        onSearch={handleSearch}
        onTypeFilter={handleDepartmentFilter}
        onStatusFilter={handleStatusFilter}
        onDateRangeFilter={handleDateRangeFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <PayrollTable
          salaries={salaries}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Salary Details Drawer */}
      <SalaryDetailsDrawer
        salary={selectedSalary}
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        onSalaryUpdated={handleSalaryUpdated}
      />
    </div>
  );
};

export default PayrollPage;

