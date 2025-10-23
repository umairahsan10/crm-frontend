import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getSalesEmployeesBonus, 
  updateSalesEmployeeBonus,
  getMockSalesBonusData,
  formatCurrency 
} from '../../../apis/finance/salary';
import type { SalesEmployeeBonus } from '../../../types/finance/salary';
import './BonusManagementPage.css';

const BonusManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [salesEmployees, setSalesEmployees] = useState<SalesEmployeeBonus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [bonusInputs, setBonusInputs] = useState<{ [key: number]: string }>({});
  const [isUpdating, setIsUpdating] = useState<{ [key: number]: boolean }>({});
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const fetchSalesEmployees = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      // In a real app, you would call the API
      // const data = await getSalesEmployeesBonus();
      
      // Mock data for demonstration
      const mockData = getMockSalesBonusData();
      setSalesEmployees(mockData);
      
    } catch (error) {
      console.error('Error fetching sales employees:', error);
      setIsError(true);
      setNotification({ 
        type: 'error', 
        message: 'Failed to load sales employees bonus data' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBonusInputChange = (employeeId: number, value: string) => {
    setBonusInputs(prev => ({
      ...prev,
      [employeeId]: value
    }));
  };

  const handleUpdateBonus = async (employeeId: number) => {
    const bonusAmount = parseFloat(bonusInputs[employeeId]);
    
    if (isNaN(bonusAmount) || bonusAmount < 0) {
      setNotification({ 
        type: 'error', 
        message: 'Please enter a valid bonus amount' 
      });
      return;
    }

    try {
      setIsUpdating(prev => ({ ...prev, [employeeId]: true }));
      
      // In a real app, you would call the API
      // await updateSalesEmployeeBonus({ employee_id: employeeId, bonusAmount });
      
      // Mock update
      setSalesEmployees(prev => 
        prev.map(emp => 
          emp.id === employeeId 
            ? { ...emp, bonusAmount }
            : emp
        )
      );
      
      setBonusInputs(prev => ({ ...prev, [employeeId]: '' }));
      
      setNotification({ 
        type: 'success', 
        message: `Bonus updated successfully for ${salesEmployees.find(emp => emp.id === employeeId)?.name}` 
      });
      
    } catch (error) {
      console.error('Error updating bonus:', error);
      setNotification({ 
        type: 'error', 
        message: 'Failed to update bonus' 
      });
    } finally {
      setIsUpdating(prev => ({ ...prev, [employeeId]: false }));
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleRefresh = () => {
    fetchSalesEmployees();
  };

  // Load data on component mount
  useEffect(() => {
    fetchSalesEmployees();
  }, []);

  const getPerformanceLevel = (salesAmount: number) => {
    if (salesAmount >= 5000) return { level: 'excellent', color: 'green', icon: '🏆' };
    if (salesAmount >= 4000) return { level: 'good', color: 'blue', icon: '⭐' };
    if (salesAmount >= 3000) return { level: 'average', color: 'yellow', icon: '👍' };
    return { level: 'needs improvement', color: 'red', icon: '📈' };
  };

  return (
    <div className="bonus-management-container">
      <div className="page-header">
        <h1>Bonus Management</h1>
          <p>Manage bonuses for high-performing sales employees (Sales &gt;= $3000)</p>
        
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/finance/salary')}
          >
            ← Back to Salary Management
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            🔄 Refresh
          </button>
          
          <div className="view-toggle">
            <button 
              className={`btn ${viewMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('cards')}
            >
              📋 Cards
            </button>
            <button 
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('table')}
            >
              📊 Table
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification notification--${notification.type}`}>
          <span>{notification.message}</span>
          <button 
            className="notification-close"
            onClick={handleCloseNotification}
          >
            ×
          </button>
        </div>
      )}

      {/* Content */}
      <div className="bonus-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading sales employees...</p>
          </div>
        ) : isError ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Failed to load sales employees</h3>
            <p>There was an error loading the sales employees data.</p>
            <button 
              className="btn btn-primary"
              onClick={fetchSalesEmployees}
            >
              Try Again
            </button>
          </div>
        ) : salesEmployees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏆</div>
            <h3>No eligible sales employees</h3>
              <p>No sales employees meet the minimum criteria (Sales &gt;= $3000) for bonus management.</p>
          </div>
        ) : (
          <div className="sales-employees-section">
            <div className="section-header">
              <h3>High-Performing Sales Employees</h3>
              <p className="section-subtitle">
                Managing bonuses for {salesEmployees.length} eligible sales employees
              </p>
            </div>

            {viewMode === 'cards' ? (
              <div className="bonus-cards-grid">
                {salesEmployees.map((employee) => {
                  const performance = getPerformanceLevel(employee.salesAmount);
                  return (
                    <div key={employee.id} className="sales-employee-card">
                      <div className="card-header">
                        <div className="employee-avatar">
                          {employee.name.charAt(0)}
                        </div>
                        <div className="employee-info">
                          <h4>{employee.name}</h4>
                          <div className="performance-badge performance-badge--{performance.color}">
                            {performance.icon} {performance.level}
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-body">
                        <div className="metric-row">
                          <span className="metric-label">Sales Amount</span>
                          <span className="metric-value sales-amount">
                            {formatCurrency(employee.salesAmount)}
                          </span>
                        </div>
                        
                        <div className="metric-row">
                          <span className="metric-label">Current Bonus</span>
                          <span className="metric-value bonus-amount">
                            {formatCurrency(employee.bonusAmount)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-footer">
                        <div className="bonus-input-group">
                          <input
                            type="number"
                            placeholder="New bonus amount"
                            value={bonusInputs[employee.id] || ''}
                            onChange={(e) => handleBonusInputChange(employee.id, e.target.value)}
                            className="bonus-input"
                            min="0"
                            step="0.01"
                          />
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleUpdateBonus(employee.id)}
                            disabled={!bonusInputs[employee.id] || isUpdating[employee.id]}
                          >
                            {isUpdating[employee.id] ? '⏳' : '✓'} Update
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bonus-table-container">
                <table className="bonus-table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Sales Amount</th>
                      <th>Current Bonus</th>
                      <th>New Bonus</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesEmployees.map((employee) => {
                      const performance = getPerformanceLevel(employee.salesAmount);
                      return (
                        <tr key={employee.id}>
                          <td>
                            <div className="employee-cell">
                              <div className="employee-avatar-small">
                                {employee.name.charAt(0)}
                              </div>
                              <div className="employee-details">
                                <div className="employee-name">{employee.name}</div>
                                <div className="performance-badge performance-badge--{performance.color}">
                                  {performance.icon} {performance.level}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="sales-amount">
                            {formatCurrency(employee.salesAmount)}
                          </td>
                          <td className="bonus-amount">
                            {formatCurrency(employee.bonusAmount)}
                          </td>
                          <td>
                            <input
                              type="number"
                              placeholder="Enter amount"
                              value={bonusInputs[employee.id] || ''}
                              onChange={(e) => handleBonusInputChange(employee.id, e.target.value)}
                              className="bonus-input-small"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleUpdateBonus(employee.id)}
                              disabled={!bonusInputs[employee.id] || isUpdating[employee.id]}
                            >
                              {isUpdating[employee.id] ? '⏳' : '✓'} Update
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BonusManagementPage;
