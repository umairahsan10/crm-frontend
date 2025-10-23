import React from 'react';
import type { SalaryStatisticsProps } from '../../../types/finance/salary';
import { formatCurrency } from '../../../apis/finance/salary';
import './SalaryStatisticsCards.css';

const SalaryStatisticsCards: React.FC<SalaryStatisticsProps> = ({ 
  summary, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="salary-statistics">
        <div className="statistics-grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="stat-card loading">
              <div className="stat-icon loading-icon"></div>
              <div className="stat-content">
                <div className="stat-label loading-text"></div>
                <div className="stat-value loading-text"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statistics = [
    {
      title: 'Total Employees',
      value: summary.totalEmployees,
      icon: '👥',
      color: 'blue',
      format: 'number'
    },
    {
      title: 'Total Base Salary',
      value: summary.totalBaseSalary,
      icon: '💰',
      color: 'green',
      format: 'currency'
    },
    {
      title: 'Total Commission',
      value: summary.totalCommission,
      icon: '📈',
      color: 'purple',
      format: 'currency'
    },
    {
      title: 'Total Bonus',
      value: summary.totalBonus,
      icon: '🏆',
      color: 'orange',
      format: 'currency'
    },
    {
      title: 'Total Deductions',
      value: summary.totalDeductions,
      icon: '📉',
      color: 'red',
      format: 'currency'
    },
    {
      title: 'Total Final Salary',
      value: summary.totalFinalSalary,
      icon: '✅',
      color: 'success',
      format: 'currency'
    }
  ];

  const formatValue = (value: number, format: string): string => {
    if (format === 'currency') {
      return formatCurrency(value);
    }
    return value.toLocaleString();
  };

  return (
    <div className="salary-statistics">
      <div className="statistics-grid">
        {statistics.map((stat, index) => (
          <div key={index} className={`stat-card stat-card--${stat.color}`}>
            <div className="stat-icon">
              <span className="stat-emoji">{stat.icon}</span>
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.title}</div>
              <div className="stat-value">
                {formatValue(stat.value, stat.format)}
              </div>
            </div>
            <div className="stat-trend">
              <span className="trend-indicator">
                {stat.color === 'red' ? '↓' : '↑'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalaryStatisticsCards;
