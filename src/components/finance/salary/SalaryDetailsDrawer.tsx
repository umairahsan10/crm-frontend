import React, { useState } from 'react';
import type { SalaryDetailsDrawerProps } from '../../../types/finance/salary';
import { formatCurrency, formatDate, formatDateTime } from '../../../apis/finance/salary';
import './SalaryDetailsDrawer.css';

const SalaryDetailsDrawer: React.FC<SalaryDetailsDrawerProps> = ({ 
  isOpen, 
  onClose, 
  salaryData,
  loading = false 
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'commission' | 'deductions'>('summary');

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="drawer-overlay">
        <div className="drawer-content">
          <div className="drawer-loading">
            <div className="loading-spinner"></div>
            <p>Loading salary details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!salaryData) {
    return (
      <div className="drawer-overlay">
        <div className="drawer-content">
          <div className="drawer-error">
            <div className="error-icon">⚠️</div>
            <h3>No salary data available</h3>
            <p>Unable to load salary details for this employee.</p>
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { employee, salary, commissionBreakdown, deductionBreakdown, status, paidOn, createdAt } = salaryData;

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

  return (
    <div className="drawer-overlay">
      <div className="drawer-content">
        {/* Header */}
        <div className="drawer-header">
          <div className="employee-header">
            <div className="employee-avatar-large">
              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
            </div>
            <div className="employee-info">
              <h2>{employee.firstName} {employee.lastName}</h2>
              <div className="employee-meta">
                <span className="department-badge department-badge--{employee.department.toLowerCase()}">
                  {employee.department}
                </span>
                <span className="employee-email">{employee.email}</span>
              </div>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="drawer-tabs">
          <button 
            className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            📊 Summary
          </button>
          <button 
            className={`tab ${activeTab === 'commission' ? 'active' : ''}`}
            onClick={() => setActiveTab('commission')}
          >
            💰 Commission
          </button>
          <button 
            className={`tab ${activeTab === 'deductions' ? 'active' : ''}`}
            onClick={() => setActiveTab('deductions')}
          >
            📉 Deductions
          </button>
        </div>

        {/* Content */}
        <div className="drawer-body">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="summary-section">
              <div className="salary-card">
                <h3>Salary Components</h3>
                <div className="salary-breakdown">
                  <div className="breakdown-item">
                    <span className="label">Base Salary</span>
                    <span className="value">{formatCurrency(salary.baseSalary)}</span>
                  </div>
                  <div className="breakdown-item bonus">
                    <span className="label">+ Bonus</span>
                    <span className="value">+{formatCurrency(salary.bonus)}</span>
                  </div>
                  <div className="breakdown-item commission">
                    <span className="label">+ Commission</span>
                    <span className="value">+{formatCurrency(salary.commission)}</span>
                  </div>
                  <div className="divider"></div>
                  <div className="breakdown-item net-salary">
                    <span className="label">Net Salary</span>
                    <span className="value">{formatCurrency(salary.netSalary)}</span>
                  </div>
                  <div className="breakdown-item deductions">
                    <span className="label">- Deductions</span>
                    <span className="value">-{formatCurrency(salary.deductions)}</span>
                  </div>
                  <div className="divider"></div>
                  <div className="breakdown-item final-salary">
                    <span className="label">Final Salary</span>
                    <span className="value">{formatCurrency(salary.finalSalary)}</span>
                  </div>
                </div>
              </div>

              <div className="status-card">
                <h3>Payment Status</h3>
                <div className="status-info">
                  <div className="status-item">
                    <span className="label">Status</span>
                    {getStatusBadge(status)}
                  </div>
                  {paidOn && (
                    <div className="status-item">
                      <span className="label">Paid On</span>
                      <span className="value">{formatDateTime(paidOn)}</span>
                    </div>
                  )}
                  <div className="status-item">
                    <span className="label">Created</span>
                    <span className="value">{formatDateTime(createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Commission Tab */}
          {activeTab === 'commission' && (
            <div className="commission-section">
              <div className="commission-header">
                <h3>Commission Breakdown</h3>
                <div className="commission-total">
                  Total Commission: <strong>{formatCurrency(salary.commission)}</strong>
                </div>
              </div>
              
              {commissionBreakdown.length > 0 ? (
                <div className="projects-list">
                  {commissionBreakdown.map((project) => (
                    <div key={project.projectId} className="project-card">
                      <div className="project-header">
                        <h4>{project.projectName}</h4>
                        <span className={`project-status project-status--${project.status}`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="project-details">
                        <div className="detail-row">
                          <span className="label">Client</span>
                          <span className="value">{project.clientName}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Project Value</span>
                          <span className="value">{formatCurrency(project.projectValue)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Commission Rate</span>
                          <span className="value">{project.commissionRate}%</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Commission Amount</span>
                          <span className="value commission-amount">
                            {formatCurrency(project.commissionAmount)}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Completed</span>
                          <span className="value">{formatDate(project.completedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-commission">
                  <div className="empty-icon">💰</div>
                  <h3>No commission earned this month</h3>
                  <p>This employee has not earned any commission for the selected period.</p>
                </div>
              )}
            </div>
          )}

          {/* Deductions Tab */}
          {activeTab === 'deductions' && (
            <div className="deductions-section">
              <div className="deductions-header">
                <h3>Deduction Breakdown</h3>
                <div className="deductions-total">
                  Total Deductions: <strong className="deductions-amount">
                    {formatCurrency(deductionBreakdown.totalDeduction)}
                  </strong>
                </div>
              </div>
              
              <div className="deductions-grid">
                <div className="deduction-card">
                  <div className="deduction-icon">🚫</div>
                  <div className="deduction-info">
                    <span className="deduction-label">Absent Days</span>
                    <span className="deduction-amount">
                      {formatCurrency(deductionBreakdown.absentDeduction)}
                    </span>
                  </div>
                </div>
                
                <div className="deduction-card">
                  <div className="deduction-icon">⏰</div>
                  <div className="deduction-info">
                    <span className="deduction-label">Late Days</span>
                    <span className="deduction-amount">
                      {formatCurrency(deductionBreakdown.lateDeduction)}
                    </span>
                  </div>
                </div>
                
                <div className="deduction-card">
                  <div className="deduction-icon">📅</div>
                  <div className="deduction-info">
                    <span className="deduction-label">Half Days</span>
                    <span className="deduction-amount">
                      {formatCurrency(deductionBreakdown.halfDayDeduction)}
                    </span>
                  </div>
                </div>
                
                <div className="deduction-card">
                  <div className="deduction-icon">⚠️</div>
                    <div className="deduction-info">
                    <span className="deduction-label">Attendance Deductions</span>
                    <span className="deduction-amount">
                      {formatCurrency(salary.attendanceDeductions)}
                    </span>
                  </div>
                </div>
                
                <div className="deduction-card">
                  <div className="deduction-icon">💸</div>
                  <div className="deduction-info">
                    <span className="deduction-label">Chargeback</span>
                    <span className="deduction-amount">
                      {formatCurrency(deductionBreakdown.chargebackDeduction)}
                    </span>
                  </div>
                </div>
                
                <div className="deduction-card">
                  <div className="deduction-icon">🔄</div>
                  <div className="deduction-info">
                    <span className="deduction-label">Refund</span>
                    <span className="deduction-amount">
                      {formatCurrency(deductionBreakdown.refundDeduction)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="drawer-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            🖨️ Print Slip
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalaryDetailsDrawer;
