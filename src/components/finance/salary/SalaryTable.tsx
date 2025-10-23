import React, { useState } from 'react';
import type { SalaryTableProps } from '../../../types/finance/salary';
import { formatCurrency, formatDate } from '../../../apis/finance/salary';
import './SalaryTable.css';

const SalaryTable: React.FC<SalaryTableProps> = ({ 
  employees, 
  onViewDetails, 
  onMarkPaid,
  loading = false 
}) => {
  const [sortField, setSortField] = useState<keyof typeof employees[0] | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field: keyof typeof employees[0]) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedAndFilteredEmployees = () => {
    let filtered = employees.filter(emp => 
      emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
    }

    return filtered;
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      paid: 'status-badge status-badge--paid',
      pending: 'status-badge status-badge--pending',
      processing: 'status-badge status-badge--processing'
    };
    
    return (
      <span className={statusClasses[status as keyof typeof statusClasses] || 'status-badge'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getSortIcon = (field: keyof typeof employees[0]) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="salary-table-container">
        <div className="table-loading">
          <div className="loading-spinner"></div>
          <p>Loading salary data...</p>
        </div>
      </div>
    );
  }

  const sortedEmployees = getSortedAndFilteredEmployees();

  return (
    <div className="salary-table-container">
      {/* Search and Filters */}
      <div className="table-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="table-info">
          Showing {sortedEmployees.length} of {employees.length} employees
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="salary-table">
          <thead>
            <tr>
              <th 
                className="sortable"
                onClick={() => handleSort('employeeName')}
              >
                Employee Name {getSortIcon('employeeName')}
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('department')}
              >
                Department {getSortIcon('department')}
              </th>
              <th 
                className="sortable numeric"
                onClick={() => handleSort('baseSalary')}
              >
                Base Salary {getSortIcon('baseSalary')}
              </th>
              <th 
                className="sortable numeric"
                onClick={() => handleSort('commission')}
              >
                Commission {getSortIcon('commission')}
              </th>
              <th 
                className="sortable numeric"
                onClick={() => handleSort('bonus')}
              >
                Bonus {getSortIcon('bonus')}
              </th>
              <th 
                className="sortable numeric"
                onClick={() => handleSort('deductions')}
              >
                Deductions {getSortIcon('deductions')}
              </th>
              <th 
                className="sortable numeric"
                onClick={() => handleSort('finalSalary')}
              >
                Final Salary {getSortIcon('finalSalary')}
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('status')}
              >
                Status {getSortIcon('status')}
              </th>
              <th>Paid On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.map((employee) => (
              <tr key={employee.employeeId} className="table-row">
                <td className="employee-cell">
                  <div className="employee-info">
                    <div className="employee-avatar">
                      {employee.employeeName.charAt(0)}
                    </div>
                    <div className="employee-details">
                      <div className="employee-name">{employee.employeeName}</div>
                      <div className="employee-id">ID: {employee.employeeId}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="department-badge department-badge--{employee.department.toLowerCase()}">
                    {employee.department}
                  </span>
                </td>
                <td className="numeric">
                  {formatCurrency(employee.baseSalary)}
                </td>
                <td className="numeric commission">
                  {employee.commission > 0 ? `+${formatCurrency(employee.commission)}` : '-'}
                </td>
                <td className="numeric bonus">
                  {employee.bonus > 0 ? `+${formatCurrency(employee.bonus)}` : '-'}
                </td>
                <td className="numeric deductions">
                  {employee.deductions > 0 ? `-${formatCurrency(employee.deductions)}` : '-'}
                </td>
                <td className="numeric final-salary">
                  <strong>{formatCurrency(employee.finalSalary)}</strong>
                </td>
                <td>
                  {getStatusBadge(employee.status)}
                </td>
                <td>
                  {employee.paidOn ? formatDate(employee.paidOn) : '-'}
                </td>
                <td className="actions">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onViewDetails(employee)}
                    title="View Details"
                  >
                    👁️
                  </button>
                  {onMarkPaid && employee.status === 'pending' && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => onMarkPaid(employee.employeeId)}
                      title="Mark as Paid"
                    >
                      ✓
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedEmployees.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No employees found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default SalaryTable;
