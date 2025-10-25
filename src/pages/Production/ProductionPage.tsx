import React from 'react';
import './ProductionPage.css';

const ProductionPage: React.FC = () => {
  return (
    <div className="production-container">
      <div className="page-header">
        <p>Project tracking, team performance, and production workflow management</p>
      </div>

      <div className="production-content">
        <div className="production-stats">
          <div className="stat-card">
            <h3>Active Projects</h3>
            <p className="stat-number">12</p>
            <span className="stat-change positive">+2 this month</span>
          </div>
          <div className="stat-card">
            <h3>Completed Tasks</h3>
            <p className="stat-number">89</p>
            <span className="stat-change positive">+15 this week</span>
          </div>
          <div className="stat-card">
            <h3>Team Productivity</h3>
            <p className="stat-number">87%</p>
            <span className="stat-change positive">+5% this month</span>
          </div>
          <div className="stat-card">
            <h3>Pending Reviews</h3>
            <p className="stat-number">7</p>
            <span className="stat-change negative">-3 this week</span>
          </div>
        </div>

        <div className="production-main">
          <div className="production-tabs">
            <button className="tab-btn active">Projects</button>
            <button className="tab-btn">Team Performance</button>
            <button className="tab-btn">Resources</button>
            <button className="tab-btn">Timeline</button>
          </div>

          <div className="production-content-area">
            <div className="projects-overview">
              <h2>Active Projects</h2>
              <div className="projects-list">
                <div className="project-item">
                  <div className="project-header">
                    <h3>E-commerce Platform</h3>
                    <span className="project-status on-track">On Track</span>
                  </div>
                  <div className="project-details">
                    <div className="project-info">
                      <p><strong>Team:</strong> 8 members</p>
                      <p><strong>Deadline:</strong> 2024-02-15</p>
                      <p><strong>Lead:</strong> John Smith</p>
                    </div>
                    <div className="project-progress">
                      <div className="progress-header">
                        <span>Progress</span>
                        <span>75%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: '75%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="project-item">
                  <div className="project-header">
                    <h3>Mobile App Redesign</h3>
                    <span className="project-status on-track">On Track</span>
                  </div>
                  <div className="project-details">
                    <div className="project-info">
                      <p><strong>Team:</strong> 5 members</p>
                      <p><strong>Deadline:</strong> 2024-03-01</p>
                      <p><strong>Lead:</strong> Sarah Johnson</p>
                    </div>
                    <div className="project-progress">
                      <div className="progress-header">
                        <span>Progress</span>
                        <span>45%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: '45%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="project-item">
                  <div className="project-header">
                    <h3>API Integration</h3>
                    <span className="project-status almost-done">Almost Done</span>
                  </div>
                  <div className="project-details">
                    <div className="project-info">
                      <p><strong>Team:</strong> 3 members</p>
                      <p><strong>Deadline:</strong> 2024-01-30</p>
                      <p><strong>Lead:</strong> Mike Chen</p>
                    </div>
                    <div className="project-progress">
                      <div className="progress-header">
                        <span>Progress</span>
                        <span>90%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: '90%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="project-item">
                  <div className="project-header">
                    <h3>Database Migration</h3>
                    <span className="project-status behind-schedule">Behind Schedule</span>
                  </div>
                  <div className="project-details">
                    <div className="project-info">
                      <p><strong>Team:</strong> 4 members</p>
                      <p><strong>Deadline:</strong> 2024-03-15</p>
                      <p><strong>Lead:</strong> Emily Davis</p>
                    </div>
                    <div className="project-progress">
                      <div className="progress-header">
                        <span>Progress</span>
                        <span>30%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: '30%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="team-performance">
              <h2>Team Performance</h2>
              <div className="performance-grid">
                <div className="team-card">
                  <h3>Frontend Team</h3>
                  <div className="team-stats">
                    <div className="team-stat">
                      <span className="stat-label">Tasks</span>
                      <span className="stat-value">24</span>
                    </div>
                    <div className="team-stat">
                      <span className="stat-label">Completed</span>
                      <span className="stat-value">22</span>
                    </div>
                    <div className="team-stat">
                      <span className="stat-label">Efficiency</span>
                      <span className="stat-value">91.7%</span>
                    </div>
                  </div>
                </div>

                <div className="team-card">
                  <h3>Backend Team</h3>
                  <div className="team-stats">
                    <div className="team-stat">
                      <span className="stat-label">Tasks</span>
                      <span className="stat-value">18</span>
                    </div>
                    <div className="team-stat">
                      <span className="stat-label">Completed</span>
                      <span className="stat-value">16</span>
                    </div>
                    <div className="team-stat">
                      <span className="stat-label">Efficiency</span>
                      <span className="stat-value">88.9%</span>
                    </div>
                  </div>
                </div>

                <div className="team-card">
                  <h3>DevOps Team</h3>
                  <div className="team-stats">
                    <div className="team-stat">
                      <span className="stat-label">Tasks</span>
                      <span className="stat-value">12</span>
                    </div>
                    <div className="team-stat">
                      <span className="stat-label">Completed</span>
                      <span className="stat-value">11</span>
                    </div>
                    <div className="team-stat">
                      <span className="stat-label">Efficiency</span>
                      <span className="stat-value">91.7%</span>
                    </div>
                  </div>
                </div>

                <div className="team-card">
                  <h3>QA Team</h3>
                  <div className="team-stats">
                    <div className="team-stat">
                      <span className="stat-label">Tasks</span>
                      <span className="stat-value">15</span>
                    </div>
                    <div className="team-stat">
                      <span className="stat-label">Completed</span>
                      <span className="stat-value">13</span>
                    </div>
                    <div className="team-stat">
                      <span className="stat-label">Efficiency</span>
                      <span className="stat-value">86.7%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionPage;
