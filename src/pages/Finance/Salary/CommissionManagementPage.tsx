import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicTable from '../../../components/common/DynamicTable/DynamicTable';
import { 
  getCommissionDetails,
  assignCommission,
  updateWithholdFlag,
  transferCommission,
  formatCurrency,
  type CommissionEmployee,
  type CommissionDetailsResponse
} from '../../../apis/finance/salary';
import './BonusManagementPage.css'; // Using same styles as bonus management

const CommissionManagementPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [commissionEmployees, setCommissionEmployees] = useState<CommissionEmployee[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<{ [key: number]: boolean }>({});
  const [showStatistics, setShowStatistics] = useState(false);
  const [activeTab, setActiveTab] = useState<'assign' | 'transfer'>('assign');
  
  // Detail drawer state
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<CommissionEmployee | null>(null);
  
  // Form states
  const [assignForm, setAssignForm] = useState({ project_id: '' });
  const [transferForm, setTransferForm] = useState({ 
    amount: '', 
    direction: 'release' as 'release' | 'withhold' 
  });

  // Calculate commission statistics
  const getCommissionStatistics = () => {
    if (!commissionEmployees.length) {
      return {
        totalEmployees: 0,
        totalCommission: 0,
        totalWithheld: 0,
        avgCommission: 0
      };
    }
    
    const totalCommission = commissionEmployees.reduce((sum, emp) => {
      const amount = typeof emp.commissionAmount === 'string' ? parseFloat(emp.commissionAmount) : emp.commissionAmount;
      return sum + amount;
    }, 0);
    
    const totalWithheld = commissionEmployees.reduce((sum, emp) => {
      const amount = typeof emp.withholdCommission === 'string' ? parseFloat(emp.withholdCommission) : emp.withholdCommission;
      return sum + amount;
    }, 0);
    
    const avgCommission = totalCommission / commissionEmployees.length;
    
    return {
      totalEmployees: commissionEmployees.length,
      totalCommission,
      totalWithheld,
      avgCommission
    };
  };

  // Fetch commission employees data
  const fetchCommissionDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response: CommissionDetailsResponse = await getCommissionDetails();
      
      setCommissionEmployees(response.commissionEmployees || []);
      
    } catch (error) {
      console.error('Error fetching commission details:', error);
      setNotification({ 
        type: 'error', 
        message: 'Failed to load commission details. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    fetchCommissionDetails();
  }, [fetchCommissionDetails]);

  // Handle assign commission
  const handleAssignCommission = async () => {
    if (!assignForm.project_id) {
      setNotification({ 
        type: 'error', 
        message: 'Please enter a project ID' 
      });
      return;
    }

    try {
      await assignCommission({ project_id: parseInt(assignForm.project_id) });
      setNotification({ 
        type: 'success', 
        message: 'Commission assigned successfully!' 
      });
      setAssignForm({ project_id: '' });
      fetchCommissionDetails(); // Refresh data
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: 'Failed to assign commission. Please try again.' 
      });
    }
  };

  // Handle transfer commission
  const handleTransferCommission = async () => {
    if (!selectedEmployee || !transferForm.amount) {
      setNotification({ 
        type: 'error', 
        message: 'Please fill in all fields' 
      });
      return;
    }

    try {
      await transferCommission({
        employee_id: selectedEmployee.id,
        amount: parseFloat(transferForm.amount),
        direction: transferForm.direction
      });
      setNotification({ 
        type: 'success', 
        message: `Commission ${transferForm.direction === 'release' ? 'released' : 'withheld'} successfully!` 
      });
      setTransferForm({ amount: '', direction: 'release' });
      fetchCommissionDetails(); // Refresh data
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: 'Failed to transfer commission. Please try again.' 
      });
    }
  };

  // Handle row click to open detail drawer
  const handleRowClick = (employee: CommissionEmployee) => {
    setSelectedEmployee(employee);
    setShowDetailDrawer(true);
  };

  // Handle close detail drawer
  const handleCloseDetailDrawer = () => {
    setShowDetailDrawer(false);
    setSelectedEmployee(null);
    setAssignForm({ project_id: '' });
    setTransferForm({ amount: '', direction: 'release' });
  };

  // Handle withhold flag update
  const handleUpdateWithholdFlag = async (employeeId: number, flag: boolean) => {
    setIsUpdating(prev => ({ ...prev, [employeeId]: true }));
    
    try {
      await updateWithholdFlag({ employee_id: employeeId, flag });
      setNotification({ 
        type: 'success', 
        message: `Withhold flag ${flag ? 'enabled' : 'disabled'} successfully!` 
      });
      fetchCommissionDetails(); // Refresh data
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: 'Failed to update withhold flag. Please try again.' 
      });
    } finally {
      setIsUpdating(prev => ({ ...prev, [employeeId]: false }));
    }
  };

  // Toggle withhold flag
  const toggleWithholdFlag = async (employeeId: number, flag: boolean) => {
    try {
      setIsLoading(true);
      await updateWithholdFlag({ employee_id: employeeId, flag });
      fetchCommissionDetails(); // Refresh the table data
      setNotification({ type: 'success', message: `Withhold flag set to ${flag ? 'true' : 'false'} for employee #${employeeId}` });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to update withhold flag. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Define table columns
  const getTableColumns = () => [
    {
      key: 'id',
      label: 'Employee ID',
      type: 'custom' as const,
      width: '120px',
      render: (value: number) => (
        <span className="font-medium text-gray-900">#{value}</span>
      )
    },
    {
      key: 'name',
      label: 'Employee Name',
      type: 'custom' as const,
      width: '200px',
      render: (value: string, record: CommissionEmployee) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">ID: {record.id}</div>
        </div>
      )
    },
    {
      key: 'commissionAmount',
      label: 'Commission Amount',
      type: 'custom' as const,
      width: '150px',
      render: (value: string | number) => {
        const amount = typeof value === 'string' ? parseFloat(value) : value;
        return <span className="font-medium text-green-600">{formatCurrency(amount)}</span>;
      }
    },
    {
      key: 'withholdCommission',
      label: 'Withheld Amount',
      type: 'custom' as const,
      width: '150px',
      render: (value: string | number) => {
        const amount = typeof value === 'string' ? parseFloat(value) : value;
        return <span className="font-medium text-orange-600">{formatCurrency(amount)}</span>;
      }
    },
    {
      key: 'total_commission',
      label: 'Total Commission',
      type: 'custom' as const,
      width: '150px',
      render: (_: any, record: CommissionEmployee) => {
        const commission = typeof record.commissionAmount === 'string' ? parseFloat(record.commissionAmount) : record.commissionAmount;
        const withheld = typeof record.withholdCommission === 'string' ? parseFloat(record.withholdCommission) : record.withholdCommission;
        const total = commission + withheld;
        return <span className="font-medium text-blue-600">{formatCurrency(total)}</span>;
      }
    },
    {
      key: 'withholdFlag',
      label: 'Status',
      type: 'custom' as const,
      width: '150px',
      render: (value: boolean) => (
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {value ? 'HOLD' : 'FREE'}
          </span>
        </div>
      )
    },
    {
      key: 'withholdFlag',
      label: 'Withhold Status',
      type: 'custom' as const,
      width: '150px',
      render: (value: boolean, record: CommissionEmployee) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleUpdateWithholdFlag(record.id, !value)}
            disabled={isUpdating[record.id]}
            className={`inline-flex items-center justify-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
              value
                ? 'bg-green-400 hover:bg-green-500 focus:ring-green-500'
                : 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
            } disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {isUpdating[record.id] ? 'Updating...' : value ? 'Release' : 'Withhold'}
          </button>
        </div>
      )
    }
  ];

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const statistics = getCommissionStatistics();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Commission Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage commission assignments, transfers, and withhold flags
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/finance/salary')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7m0 0l7 7-7-7" />
                  </svg>
                  Back to Salary
                </button>
                <button
                  onClick={() => setShowStatistics(!showStatistics)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {showStatistics ? 'Hide' : 'Show'} Statistics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-md ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                  {notification.message}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  type="button"
                  onClick={() => setNotification(null)}
                  className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    notification.type === 'success' 
                      ? 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600'
                      : 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600'
                  }`}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {showStatistics && (() => {
          const stats = getCommissionStatistics();
          return (
          <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Employees Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-500 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Staff</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Employees</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                  <p className="text-xs text-blue-600 mt-2">Commission eligible</p>
                </div>

                {/* Total Commission Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-500 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Available</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Commission</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCommission)}</p>
                  <p className="text-xs text-green-600 mt-2">Available commission</p>
                </div>

                {/* Withheld Amount Card */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-sm border border-orange-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-500 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">Withheld</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Withheld Amount</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalWithheld)}</p>
                  <p className="text-xs text-orange-600 mt-2">Held commission</p>
                </div>

                {/* Average Commission Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-500 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">Average</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Average Commission</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalEmployees > 0 
                      ? formatCurrency(stats.avgCommission)
                      : '$0'}
                  </p>
                  <p className="text-xs text-purple-600 mt-2">Per employee</p>
                </div>
              </div>
          </div>
          );
        })()}

        {/* Instructions */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Click on any employee row</strong> in the table below to open their commission management details and perform actions like assigning commissions or transferring amounts.
              </p>
            </div>
          </div>
        </div>

        {/* Commission Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Commission Details ({commissionEmployees.length} employees)
              </h3>
              <button
                onClick={fetchCommissionDetails}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <svg className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
          
          <DynamicTable
            data={commissionEmployees}
            columns={getTableColumns()}
            isLoading={isLoading}
            currentPage={1}
            totalPages={1}
            totalItems={commissionEmployees.length}
            itemsPerPage={commissionEmployees.length}
            onPageChange={() => {}}
            onRowClick={handleRowClick}
            emptyMessage="No commission data available"
            className="commission-management-table"
            renderRowActions={(employee) => (
              <button
                onClick={() => toggleWithholdFlag(employee.id, !employee.withholdFlag)}
                className={`px-3 py-2 text-sm font-medium rounded-md shadow-sm text-white ${
                  employee.withholdFlag ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
              >
                {employee.withholdFlag ? 'Unwithhold' : 'Withhold'}
              </button>
            )}
          />
        </div>

        {/* Assign Commission Section */}
        <div className="bg-gray-50 rounded-lg p-6 mt-8">
          <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Assign Commission to Project</span>
          </h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-2">
                Project ID *
              </label>
              <input
                type="number"
                id="project_id"
                value={assignForm.project_id}
                onChange={(e) => setAssignForm({...assignForm, project_id: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter project ID"
              />
            </div>
            <button
              onClick={handleAssignCommission}
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Assign Commission
            </button>
          </div>
        </div>
      </div>

      {/* Commission Detail Drawer */}
      {showDetailDrawer && selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-gray-600 bg-opacity-50" 
            onClick={handleCloseDetailDrawer}
          ></div>
          
          <div 
            className="relative mx-auto h-full bg-white shadow-2xl rounded-lg border border-gray-200 transform transition-all duration-300 ease-out"
            style={{
              marginLeft: '100px',
              width: 'calc(100vw - 150px)',
              maxWidth: '1200px',
              marginRight: '50px',
              marginTop: '20px',
              marginBottom: '20px',
              height: 'calc(100vh - 40px)'
            }}
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-indigo-700">
                        {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Commission Details
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedEmployee.name} (#{selectedEmployee.id})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md p-2"
                    onClick={handleCloseDetailDrawer}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-6">
                  {/* Employee Commission Summary */}
                  <div className="mb-8">
                    <h4 className="text-base font-medium text-gray-900 mb-4">Commission Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-green-500 rounded-lg">
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Available</span>
                        </div>
                        <div className="text-green-800 font-medium text-sm">Commission Amount</div>
                        <div className="text-green-600 font-bold text-xl">
                          {formatCurrency(typeof selectedEmployee.commissionAmount === 'string' 
                            ? parseFloat(selectedEmployee.commissionAmount) 
                            : selectedEmployee.commissionAmount)}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-sm border border-orange-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-orange-500 rounded-lg">
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">Withheld</span>
                        </div>
                        <div className="text-orange-800 font-medium text-sm">Withheld Amount</div>
                        <div className="text-orange-600 font-bold text-xl">
                          {formatCurrency(typeof selectedEmployee.withholdCommission === 'string' 
                            ? parseFloat(selectedEmployee.withholdCommission) 
                            : selectedEmployee.withholdCommission)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Tabs */}
                  <div className="border-b border-gray-200 mb-6">
                    <div className="py-3 px-1 border-b-2 font-medium text-sm text-indigo-600">
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span>Transfer Commission</span>
                      </div>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-6">
                    

                    {activeTab === 'transfer' && (
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center space-x-2">
                          <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          <span>Transfer Commission</span>
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="drawer_amount" className="block text-sm font-medium text-gray-700 mb-2">
                              Amount *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              id="drawer_amount"
                              value={transferForm.amount}
                              onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Enter amount"
                            />
                          </div>
                          <div>
                            <label htmlFor="drawer_direction" className="block text-sm font-medium text-gray-700 mb-2">
                              Direction *
                            </label>
                            <select
                              id="drawer_direction"
                              value={transferForm.direction}
                              onChange={(e) => setTransferForm({...transferForm, direction: e.target.value as 'release' | 'withhold'})}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="release">Release (Withheld → Available)</option>
                              <option value="withhold">Withhold (Available → Withheld)</option>
                            </select>
                          </div>
                          <button
                            onClick={handleTransferCommission}
                            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Transfer Commission
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionManagementPage;