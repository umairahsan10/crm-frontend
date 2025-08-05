import React, { useState, useMemo } from 'react';
import './SalaryCalculator.css';

// Types and Interfaces
type UserRole = 'hr' | 'admin' | 'accountant' | 'employee' | 'manager';

interface EmployeeData {
  id: string;
  name: string;
  baseSalary: number;
  position: string;
  department: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  startDate: string;
  performanceRating?: number; // 1-5 scale
}

interface DeductionRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  isActive: boolean;
}

interface BonusRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  isActive: boolean;
}

// Additional types for manual entries
type DeductionType = 'percentage' | 'fixed' | 'manual';
type BonusType = 'percentage' | 'fixed' | 'performance' | 'manual';

interface CommissionRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  target: number;
  description: string;
  isActive: boolean;
}

interface SalaryCalculation {
  baseSalary: number;
  grossSalary: number;
  totalDeductions: number;
  totalBonuses: number;
  totalCommissions: number;
  netSalary: number;
  breakdown: {
    deductions: Array<{ name: string; amount: number; type: DeductionType }>;
    bonuses: Array<{ name: string; amount: number; type: BonusType }>;
    commissions: Array<{ name: string; amount: number; type: 'fixed' | 'percentage' }>;
  };
}

interface SalaryCalculatorProps {
  // Core props
  employee: EmployeeData;
  deductionRules: DeductionRule[];
  bonusRules: BonusRule[];
  commissionRules: CommissionRule[];
  userRole: UserRole;
  
  // Customization props
  className?: string;
  title?: string;
  showBreakdown?: boolean;
  showActions?: boolean;
  
  // Callback props
  onCalculate?: (calculation: SalaryCalculation) => void;
  onSave?: (calculation: SalaryCalculation) => void;
  onExport?: (calculation: SalaryCalculation) => void;
  
  // Additional data
  salesTarget?: number;
  actualSales?: number;
}

const SalaryCalculator: React.FC<SalaryCalculatorProps> = ({
  employee,
  deductionRules,
  bonusRules,
  commissionRules,
  userRole,
  className = '',
  title = 'Salary Calculator',
  showBreakdown = true,
  showActions = true,
  onCalculate,
  onSave,
  onExport,
  salesTarget = 0,
  actualSales = 0
}) => {
  // State for manual adjustments
  const [manualDeductions, setManualDeductions] = useState<Record<string, number>>({});
  const [manualBonuses, setManualBonuses] = useState<Record<string, number>>({});
  const [calculationNotes, setCalculationNotes] = useState('');

  // Check if user has access to salary calculator
  const hasAccess = useMemo(() => {
    return ['hr', 'admin', 'accountant'].includes(userRole);
  }, [userRole]);

  // Calculate salary breakdown
  const salaryCalculation = useMemo((): SalaryCalculation => {
    const baseSalary = employee.baseSalary;
    
    // Calculate deductions
    const deductions: Array<{ name: string; amount: number; type: DeductionType }> = deductionRules
      .filter(rule => rule.isActive)
      .map(rule => {
        const amount = rule.type === 'percentage' 
          ? (baseSalary * rule.value) / 100 
          : rule.value;
        return { name: rule.name, amount, type: rule.type };
      });

    // Add manual deductions
    Object.entries(manualDeductions).forEach(([name, amount]) => {
      if (amount > 0) {
        deductions.push({ name, amount, type: 'manual' });
      }
    });

    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

    // Calculate bonuses
    const bonuses: Array<{ name: string; amount: number; type: BonusType }> = bonusRules
      .filter(rule => rule.isActive)
      .map(rule => {
        const amount = rule.type === 'percentage' 
          ? (baseSalary * rule.value) / 100 
          : rule.value;
        return { name: rule.name, amount, type: rule.type };
      });

    // Add performance-based bonuses
    if (employee.performanceRating && employee.performanceRating >= 4) {
      const performanceBonus = baseSalary * 0.05; // 5% for high performers
      bonuses.push({ name: 'Performance Bonus', amount: performanceBonus, type: 'performance' });
    }

    // Add manual bonuses
    Object.entries(manualBonuses).forEach(([name, amount]) => {
      if (amount > 0) {
        bonuses.push({ name, amount, type: 'manual' });
      }
    });

    const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);

    // Calculate commissions
    const commissions = commissionRules
      .filter(rule => rule.isActive && actualSales >= rule.target)
      .map(rule => {
        const amount = rule.type === 'percentage' 
          ? (actualSales * rule.value) / 100 
          : rule.value;
        return { name: rule.name, amount, type: rule.type };
      });

    const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);

    // Calculate gross and net salary
    const grossSalary = baseSalary + totalBonuses + totalCommissions;
    const netSalary = grossSalary - totalDeductions;

    return {
      baseSalary,
      grossSalary,
      totalDeductions,
      totalBonuses,
      totalCommissions,
      netSalary,
      breakdown: {
        deductions,
        bonuses,
        commissions
      }
    };
  }, [employee, deductionRules, bonusRules, commissionRules, manualDeductions, manualBonuses, actualSales]);

  // Handle manual deduction change
  const handleManualDeductionChange = (name: string, value: string) => {
    const amount = parseFloat(value) || 0;
    setManualDeductions(prev => ({
      ...prev,
      [name]: amount
    }));
  };

  // Handle manual bonus change
  const handleManualBonusChange = (name: string, value: string) => {
    const amount = parseFloat(value) || 0;
    setManualBonuses(prev => ({
      ...prev,
      [name]: amount
    }));
  };

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave(salaryCalculation);
    }
  };

  // Handle export
  const handleExport = () => {
    if (onExport) {
      onExport(salaryCalculation);
    }
  };

  // Notify parent component of calculation
  React.useEffect(() => {
    if (onCalculate) {
      onCalculate(salaryCalculation);
    }
  }, [salaryCalculation, onCalculate]);

  // If user doesn't have access, show access denied message
  if (!hasAccess) {
    return (
      <div className={`salary-calculator access-denied ${className}`}>
        <div className="access-denied-message">
          <h3>Access Denied</h3>
          <p>You don't have permission to access the salary calculator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`salary-calculator ${className}`}>
      <div className="salary-calculator__header">
        <h2 className="salary-calculator__title">{title}</h2>
        <div className="employee-info">
          <h3>{employee.name}</h3>
          <p>{employee.position} • {employee.department}</p>
          <p>Employment: {employee.employmentType}</p>
        </div>
      </div>

      <div className="salary-calculator__content">
        {/* Base Information */}
        <div className="salary-section">
          <h4>Base Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <label>Base Salary:</label>
              <span className="amount">${employee.baseSalary.toLocaleString()}</span>
            </div>
            {employee.performanceRating && (
              <div className="info-item">
                <label>Performance Rating:</label>
                <span className="rating">{employee.performanceRating}/5</span>
              </div>
            )}
            {salesTarget > 0 && (
              <div className="info-item">
                <label>Sales Target:</label>
                <span>${salesTarget.toLocaleString()}</span>
              </div>
            )}
            {actualSales > 0 && (
              <div className="info-item">
                <label>Actual Sales:</label>
                <span>${actualSales.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Manual Adjustments */}
        <div className="salary-section">
          <h4>Manual Adjustments</h4>
          <div className="adjustments-grid">
            <div className="adjustment-group">
              <h5>Additional Deductions</h5>
              <div className="adjustment-inputs">
                <div className="adjustment-input">
                  <input
                    type="number"
                    placeholder="Deduction name"
                    onChange={(e) => handleManualDeductionChange('Additional Deduction', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="adjustment-group">
              <h5>Additional Bonuses</h5>
              <div className="adjustment-inputs">
                <div className="adjustment-input">
                  <input
                    type="number"
                    placeholder="Bonus name"
                    onChange={(e) => handleManualBonusChange('Additional Bonus', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Summary */}
        <div className="salary-section summary">
          <h4>Salary Summary</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <label>Base Salary:</label>
              <span className="amount">${salaryCalculation.baseSalary.toLocaleString()}</span>
            </div>
            <div className="summary-item positive">
              <label>Total Bonuses:</label>
              <span className="amount">+${salaryCalculation.totalBonuses.toLocaleString()}</span>
            </div>
            <div className="summary-item positive">
              <label>Total Commissions:</label>
              <span className="amount">+${salaryCalculation.totalCommissions.toLocaleString()}</span>
            </div>
            <div className="summary-item negative">
              <label>Total Deductions:</label>
              <span className="amount">-${salaryCalculation.totalDeductions.toLocaleString()}</span>
            </div>
            <div className="summary-item total">
              <label>Net Salary:</label>
              <span className="amount">${salaryCalculation.netSalary.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        {showBreakdown && (
          <div className="salary-section breakdown">
            <h4>Detailed Breakdown</h4>
            
            {/* Deductions Breakdown */}
            {salaryCalculation.breakdown.deductions.length > 0 && (
              <div className="breakdown-group">
                <h5>Deductions</h5>
                <div className="breakdown-list">
                  {salaryCalculation.breakdown.deductions.map((deduction, index) => (
                    <div key={index} className="breakdown-item negative">
                      <span className="name">{deduction.name}</span>
                      <span className="amount">-${deduction.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bonuses Breakdown */}
            {salaryCalculation.breakdown.bonuses.length > 0 && (
              <div className="breakdown-group">
                <h5>Bonuses</h5>
                <div className="breakdown-list">
                  {salaryCalculation.breakdown.bonuses.map((bonus, index) => (
                    <div key={index} className="breakdown-item positive">
                      <span className="name">{bonus.name}</span>
                      <span className="amount">+${bonus.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commissions Breakdown */}
            {salaryCalculation.breakdown.commissions.length > 0 && (
              <div className="breakdown-group">
                <h5>Commissions</h5>
                <div className="breakdown-list">
                  {salaryCalculation.breakdown.commissions.map((commission, index) => (
                    <div key={index} className="breakdown-item positive">
                      <span className="name">{commission.name}</span>
                      <span className="amount">+${commission.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="salary-section">
          <h4>Notes</h4>
          <textarea
            className="calculation-notes"
            placeholder="Add any notes about this calculation..."
            value={calculationNotes}
            onChange={(e) => setCalculationNotes(e.target.value)}
          />
        </div>

        {/* Actions */}
        {showActions && (
          <div className="salary-calculator__actions">
            <button 
              className="btn btn-secondary"
              onClick={handleExport}
            >
              Export
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSave}
            >
              Save Calculation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryCalculator; 