import React from 'react';
import './ProjectsPage.css';

const ProjectsPage: React.FC = () => {
  return (
    <div className="projects-container">
      <div className="page-header">
        <p>Manage and track all company projects, assignments, and progress</p>
      </div>

      <div className="projects-content">
        <div className="projects-stats">
          <div className="stat-card">
            <h3>Active Projects</h3>
            <p className="stat-number">12</p>
            <span className="stat-change positive">+2 this month</span>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p className="stat-number">45</p>
            <span className="stat-change positive">+8 this month</span>
          </div>
          <div className="stat-card">
            <h3>Overdue</h3>
            <p className="stat-number">3</p>
            <span className="stat-change negative">-1 this week</span>
          </div>
          <div className="stat-card">
            <h3>Success Rate</h3>
            <p className="stat-number">87%</p>
            <span className="stat-change positive">+5% this quarter</span>
          </div>
        </div>

        <div className="projects-main">
          <div className="projects-list">
            <h2>Project List</h2>
            <div className="project-filters">
              <button className="filter-btn active">All Projects</button>
              <button className="filter-btn">In Progress</button>
              <button className="filter-btn">Completed</button>
              <button className="filter-btn">On Hold</button>
            </div>
            
            <div className="projects-table">
              <div className="table-header">
                <div>Project Name</div>
                <div>Status</div>
                <div>Progress</div>
                <div>Team Lead</div>
                <div>Deadline</div>
                <div>Actions</div>
              </div>
              
              <div className="table-row">
                <div className="project-name">
                  <h4>E-commerce Platform</h4>
                  <p>Client: TechCorp Inc.</p>
                </div>
                <div className="status-badge in-progress">In Progress</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '75%'}}></div>
                  <span>75%</span>
                </div>
                <div className="team-lead">John Smith</div>
                <div className="deadline">2024-02-15</div>
                <div className="actions">
                  <button className="btn-primary">View</button>
                  <button className="btn-secondary">Edit</button>
                </div>
              </div>
              
              <div className="table-row">
                <div className="project-name">
                  <h4>Mobile App Redesign</h4>
                  <p>Client: Global Solutions</p>
                </div>
                <div className="status-badge in-progress">In Progress</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '45%'}}></div>
                  <span>45%</span>
                </div>
                <div className="team-lead">Sarah Johnson</div>
                <div className="deadline">2024-03-01</div>
                <div className="actions">
                  <button className="btn-primary">View</button>
                  <button className="btn-secondary">Edit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
