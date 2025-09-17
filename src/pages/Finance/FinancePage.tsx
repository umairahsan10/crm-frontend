import React from 'react';
import './FinancePage.css';

const FinancePage: React.FC = () => {
  return (
    <div className="finance-container">
      <div className="page-header">
        <h1>Financial Management</h1>
        <p>Monitor revenue, expenses, budgets, and financial performance</p>
      </div>

      <div className="finance-content">
        <div className="finance-stats">
          <div className="stat-card revenue">
            <h3>Total Revenue</h3>
            <p className="stat-number">$245,678</p>
            <span className="stat-change positive">+8.5% from last month</span>
          </div>
          <div className="stat-card expenses">
            <h3>Monthly Expenses</h3>
            <p className="stat-number">$156,234</p>
            <span className="stat-change positive">+2.1% from last month</span>
          </div>
          <div className="stat-card profit">
            <h3>Net Profit</h3>
            <p className="stat-number">$89,444</p>
            <span className="stat-change positive">+15.2% from last month</span>
          </div>
          <div className="stat-card invoices">
            <h3>Outstanding Invoices</h3>
            <p className="stat-number">$23,456</p>
            <span className="stat-change negative">-12% from last week</span>
          </div>
        </div>

        <div className="finance-main">
          <div className="finance-tabs">
            <button className="tab-btn active">Overview</button>
            <button className="tab-btn">Transactions</button>
            <button className="tab-btn">Budget</button>
            <button className="tab-btn">Reports</button>
          </div>

          <div className="finance-content-area">
            <div className="budget-overview">
              <h2>Budget Overview</h2>
              <div className="budget-items">
                <div className="budget-item">
                  <div className="budget-header">
                    <span className="budget-category">Revenue</span>
                    <span className="budget-amount">$245,678 / $250,000</span>
                  </div>
                  <div className="budget-bar">
                    <div className="budget-fill" style={{width: '98.3%'}}></div>
                  </div>
                  <div className="budget-percentage">98.3%</div>
                </div>
                
                <div className="budget-item">
                  <div className="budget-header">
                    <span className="budget-category">Operating Expenses</span>
                    <span className="budget-amount">$156,234 / $160,000</span>
                  </div>
                  <div className="budget-bar">
                    <div className="budget-fill" style={{width: '97.6%'}}></div>
                  </div>
                  <div className="budget-percentage">97.6%</div>
                </div>
                
                <div className="budget-item">
                  <div className="budget-header">
                    <span className="budget-category">Marketing</span>
                    <span className="budget-amount">$23,456 / $25,000</span>
                  </div>
                  <div className="budget-bar">
                    <div className="budget-fill" style={{width: '93.8%'}}></div>
                  </div>
                  <div className="budget-percentage">93.8%</div>
                </div>
              </div>
            </div>

            <div className="recent-transactions">
              <h2>Recent Transactions</h2>
              <div className="transactions-list">
                <div className="transaction-item">
                  <div className="transaction-info">
                    <h4>Client Payment - TechCorp Inc.</h4>
                    <p>2024-01-15</p>
                  </div>
                  <div className="transaction-amount income">+$15,000</div>
                  <div className="transaction-status completed">Completed</div>
                </div>
                
                <div className="transaction-item">
                  <div className="transaction-info">
                    <h4>Office Rent Payment</h4>
                    <p>2024-01-14</p>
                  </div>
                  <div className="transaction-amount expense">-$8,500</div>
                  <div className="transaction-status completed">Completed</div>
                </div>
                
                <div className="transaction-item">
                  <div className="transaction-info">
                    <h4>Software License Renewal</h4>
                    <p>2024-01-13</p>
                  </div>
                  <div className="transaction-amount expense">-$2,400</div>
                  <div className="transaction-status completed">Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
