import React, { useState, useEffect } from 'react';
import ProductionTable from '../../components/production/ProductionTable';
import ProductionFilters from '../../components/production/ProductionFilters';
import ProductionDetailsDrawer from '../../components/production/ProductionDetailsDrawer';
import BulkActions from '../../components/production/BulkActions';
import ProductionStatistics from '../../components/production/ProductionStatistics';
import { useAuth } from '../../context/AuthContext';
import type { Production, ProductionStatistics as ProductionStatsType } from '../../types';

const ProductionManagementPage: React.FC = () => {
  // Auth context
  const { user } = useAuth();
  
  // State management
  const [productions, setProductions] = useState<Production[]>([]);
  const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);
  const [selectedProductions, setSelectedProductions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatistics, setShowStatistics] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    priority: '',
    departmentId: '',
    assignedTo: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Dummy data for employees
  const [employees] = useState<Array<{ 
    id?: string | number; 
    employeeId?: string | number;
    userId?: string | number;
    _id?: string | number;
    name?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    [key: string]: any;
  }>>([
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Sarah Johnson' },
    { id: '3', name: 'Mike Wilson' },
    { id: '4', name: 'Emily Davis' },
    { id: '5', name: 'David Brown' },
    { id: '6', name: 'Lisa Anderson' }
  ]);

  // Dummy statistics data
  const [statistics, setStatistics] = useState<ProductionStatsType>({
    totalProductions: 0,
    activeProductions: 0,
    completedProductions: 0,
    delayedProductions: 0,
    onTimeRate: '0%',
    qualityScore: 0,
    byStatus: {
      planned: 0,
      in_progress: 0,
      on_hold: 0,
      completed: 0,
      cancelled: 0,
      delayed: 0
    },
    byType: {
      manufacturing: 0,
      assembly: 0,
      quality_control: 0,
      packaging: 0,
      testing: 0
    },
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    },
    today: {
      started: 0,
      completed: 0,
      delayed: 0
    }
  });

  // Generate dummy production data
  const generateDummyData = (): Production[] => {
    const dummyProductions: Production[] = [];
    const statuses: Array<'planned' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled' | 'delayed'> = 
      ['planned', 'in_progress', 'completed', 'on_hold', 'cancelled', 'delayed'];
    const types: Array<'manufacturing' | 'assembly' | 'quality_control' | 'packaging' | 'testing'> = 
      ['manufacturing', 'assembly', 'quality_control', 'packaging', 'testing'];
    const priorities: Array<'low' | 'medium' | 'high' | 'urgent'> = ['low', 'medium', 'high', 'urgent'];
    
    const productionNames = [
      'Widget Assembly Line A',
      'Smart Phone Manufacturing',
      'Quality Control Batch #001',
      'Packaging Unit B',
      'Device Testing Phase',
      'Component Assembly',
      'Product Verification',
      'Final Packaging',
      'Quality Assurance Test',
      'Manufacturing Line C',
      'Assembly Station 1',
      'Testing Lab Alpha',
      'Packaging Center',
      'Production Line Beta',
      'Quality Control Unit'
    ];

    for (let i = 1; i <= 50; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const progress = status === 'completed' ? 100 : Math.floor(Math.random() * 100);
      
      dummyProductions.push({
        id: `prod-${i}`,
        name: productionNames[Math.floor(Math.random() * productionNames.length)] + ` #${i}`,
        description: `Production item ${i} for ${type.replace('_', ' ')} process`,
        productType: type,
        status: status,
        priority: priority,
        assignedTo: employees[Math.floor(Math.random() * employees.length)],
        departmentId: Math.floor(Math.random() * 5) + 1,
        startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: status === 'completed' ? new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        estimatedHours: Math.floor(Math.random() * 40) + 10,
        actualHours: status === 'completed' ? Math.floor(Math.random() * 50) + 5 : undefined,
        progress: progress,
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: Math.random() > 0.7 ? `Additional notes for production ${i}` : undefined,
        materials: Math.random() > 0.5 ? ['Material A', 'Material B', 'Material C'].slice(0, Math.floor(Math.random() * 3) + 1) : undefined,
        qualityScore: Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 7 : undefined,
        cost: Math.random() > 0.8 ? Math.floor(Math.random() * 10000) + 1000 : undefined
      });
    }

    return dummyProductions;
  };

  // Calculate statistics from productions data
  const calculateStatistics = (productions: Production[]): ProductionStatsType => {
    const totalProductions = productions.length;
    const activeProductions = productions.filter(p => p.status === 'in_progress').length;
    const completedProductions = productions.filter(p => p.status === 'completed').length;
    const delayedProductions = productions.filter(p => p.status === 'delayed').length;
    
    const onTimeRate = totalProductions > 0 ? 
      `${Math.round(((completedProductions - delayedProductions) / totalProductions) * 100)}%` : '0%';
    
    const qualityScores = productions.filter(p => p.qualityScore).map(p => p.qualityScore!);
    const avgQualityScore = qualityScores.length > 0 ? 
      Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length) : 0;

    const byStatus = {
      planned: productions.filter(p => p.status === 'planned').length,
      in_progress: productions.filter(p => p.status === 'in_progress').length,
      on_hold: productions.filter(p => p.status === 'on_hold').length,
      completed: productions.filter(p => p.status === 'completed').length,
      cancelled: productions.filter(p => p.status === 'cancelled').length,
      delayed: productions.filter(p => p.status === 'delayed').length
    };

    const byType = {
      manufacturing: productions.filter(p => p.productType === 'manufacturing').length,
      assembly: productions.filter(p => p.productType === 'assembly').length,
      quality_control: productions.filter(p => p.productType === 'quality_control').length,
      packaging: productions.filter(p => p.productType === 'packaging').length,
      testing: productions.filter(p => p.productType === 'testing').length
    };

    const byPriority = {
      low: productions.filter(p => p.priority === 'low').length,
      medium: productions.filter(p => p.priority === 'medium').length,
      high: productions.filter(p => p.priority === 'high').length,
      urgent: productions.filter(p => p.priority === 'urgent').length
    };

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const todayStarted = productions.filter(p => p.startDate.startsWith(todayStr)).length;
    const todayCompleted = productions.filter(p => 
      p.endDate && p.endDate.startsWith(todayStr) && p.status === 'completed'
    ).length;
    const todayDelayed = productions.filter(p => 
      p.status === 'delayed' && p.updatedAt.startsWith(todayStr)
    ).length;

    return {
      totalProductions,
      activeProductions,
      completedProductions,
      delayedProductions,
      onTimeRate,
      qualityScore: avgQualityScore,
      byStatus,
      byType,
      byPriority,
      today: {
        started: todayStarted,
        completed: todayCompleted,
        delayed: todayDelayed
      }
    };
  };

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dummyData = generateDummyData();
      setProductions(dummyData);
      setStatistics(calculateStatistics(dummyData));
      
      // Set pagination
      setTotalItems(dummyData.length);
      setTotalPages(Math.ceil(dummyData.length / itemsPerPage));
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // In a real app, you would fetch data for the new page
  };

  const handleProductionClick = (production: Production) => {
    setSelectedProduction(production);
  };

  const handleBulkSelect = (productionIds: string[]) => {
    setSelectedProductions(productionIds);
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleTypeFilter = (type: string) => {
    setFilters(prev => ({ ...prev, type }));
  };

  const handlePriorityFilter = (priority: string) => {
    setFilters(prev => ({ ...prev, priority }));
  };

  const handleDepartmentFilter = (departmentId: string) => {
    setFilters(prev => ({ ...prev, departmentId }));
  };

  const handleAssignedToFilter = (assignedTo: string) => {
    setFilters(prev => ({ ...prev, assignedTo }));
  };

  const handleDateRangeFilter = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      type: '',
      priority: '',
      departmentId: '',
      assignedTo: '',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const handleBulkAssign = async (productionIds: string[], assignedTo: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotification({
        type: 'success',
        message: `Successfully assigned ${productionIds.length} productions`
      });
      setSelectedProductions([]);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to assign productions'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleBulkStatusChange = async (productionIds: string[], status: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotification({
        type: 'success',
        message: `Successfully updated status for ${productionIds.length} productions`
      });
      setSelectedProductions([]);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update productions'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleBulkPriorityChange = async (productionIds: string[], priority: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotification({
        type: 'success',
        message: `Successfully updated priority for ${productionIds.length} productions`
      });
      setSelectedProductions([]);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update productions'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleBulkDelete = async (productionIds: string[]) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotification({
        type: 'success',
        message: `Successfully deleted ${productionIds.length} productions`
      });
      setSelectedProductions([]);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete productions'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Production Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage and track your production processes with advanced filtering and bulk operations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showStatistics ? 'Hide Stats' : 'Show Stats'}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {showStatistics && (
          <div className="mb-8">
            <ProductionStatistics statistics={statistics} isLoading={false} />
          </div>
        )}

        {/* Filters */}
        <ProductionFilters
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onTypeFilter={handleTypeFilter}
          onPriorityFilter={handlePriorityFilter}
          onDepartmentFilter={handleDepartmentFilter}
          onAssignedToFilter={handleAssignedToFilter}
          onDateRangeFilter={handleDateRangeFilter}
          onClearFilters={handleClearFilters}
        />

        {/* Bulk Actions */}
        <BulkActions
          selectedProductions={selectedProductions}
          onBulkAssign={handleBulkAssign}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkPriorityChange={handleBulkPriorityChange}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedProductions([])}
          employees={employees}
        />

        {/* Production Table */}
        <ProductionTable
          productions={productions}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onProductionClick={handleProductionClick}
          onBulkSelect={handleBulkSelect}
          selectedProductions={selectedProductions}
        />

        {/* Production Details Drawer */}
        <ProductionDetailsDrawer
          production={selectedProduction}
          isOpen={!!selectedProduction}
          onClose={() => setSelectedProduction(null)}
          onProductionUpdated={(updatedProduction) => {
            setProductions(prev => prev.map(production => 
              production.id === updatedProduction.id ? updatedProduction : production
            ));
            setSelectedProduction(updatedProduction);
            setNotification({
              type: 'success',
              message: 'Production updated successfully!'
            });
            setTimeout(() => setNotification(null), 3000);
          }}
        />

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
            notification.type === 'success' ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'
          }`}>
            <div className="p-4">
              <div className="flex items-start">
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
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className={`text-sm font-medium ${
                    notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={handleCloseNotification}
                    className={`bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      notification.type === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'
                    }`}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionManagementPage;
