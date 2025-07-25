import React from 'react';
import DashboardCard from '../components/DashboardCard/DashboardCard';
import './AttendancePage.css';

const AttendancePage: React.FC = () => {
  return (
    <div className="attendance-container">
      <div className="page-header">
        <h1>Attendance Management</h1>
        <p>Track employee attendance, manage schedules, and monitor time logs</p>
      </div>

      <div className="stats-grid">
        <DashboardCard
          title="Present Today"
          subtitle="Employees at work"
          value="142"
          change="+5%"
          changeType="positive"
          icon="✅"
        />
        <DashboardCard
          title="Late Arrivals"
          subtitle="Today's late comers"
          value="8"
          change="-2"
          changeType="positive"
          icon="⏰"
        />
        <DashboardCard
          title="Absent Today"
          subtitle="Missing employees"
          value="6"
          change="+1"
          changeType="negative"
          icon="❌"
        />
        <DashboardCard
          title="Remote Work"
          subtitle="Working from home"
          value="12"
          change="+3"
          changeType="positive"
          icon="🏠"
        />
      </div>

      <div className="attendance-section">
        <div className="section-header">
          <h2>Today's Attendance Log</h2>
          <div className="header-actions">
            <button className="btn-mark-attendance">Mark Attendance</button>
            <button className="btn-export">Export Report</button>
          </div>
        </div>

        <div className="attendance-table">
          <div className="table-header">
            <div className="header-cell">Employee</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Check In</div>
            <div className="header-cell">Check Out</div>
            <div className="header-cell">Total Hours</div>
            <div className="header-cell">Actions</div>
          </div>

          <div className="table-row">
            <div className="table-cell employee-info">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format" alt="John Doe" />
              <div>
                <div className="employee-name">John Doe</div>
                <div className="employee-role">Software Engineer</div>
              </div>
            </div>
            <div className="table-cell">
              <span className="status-badge present">Present</span>
            </div>
            <div className="table-cell">09:15 AM</div>
            <div className="table-cell">06:30 PM</div>
            <div className="table-cell">8h 15m</div>
            <div className="table-cell">
              <button className="btn-edit-small">Edit</button>
            </div>
          </div>

          <div className="table-row">
            <div className="table-cell employee-info">
              <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face&auto=format" alt="Jane Smith" />
              <div>
                <div className="employee-name">Jane Smith</div>
                <div className="employee-role">HR Manager</div>
              </div>
            </div>
            <div className="table-cell">
              <span className="status-badge late">Late</span>
            </div>
            <div className="table-cell">09:45 AM</div>
            <div className="table-cell">06:00 PM</div>
            <div className="table-cell">7h 15m</div>
            <div className="table-cell">
              <button className="btn-edit-small">Edit</button>
            </div>
          </div>

          <div className="table-row">
            <div className="table-cell employee-info">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format" alt="Mike Johnson" />
              <div>
                <div className="employee-name">Mike Johnson</div>
                <div className="employee-role">Sales Rep</div>
              </div>
            </div>
            <div className="table-cell">
              <span className="status-badge remote">Remote</span>
            </div>
            <div className="table-cell">08:30 AM</div>
            <div className="table-cell">05:45 PM</div>
            <div className="table-cell">8h 15m</div>
            <div className="table-cell">
              <button className="btn-edit-small">Edit</button>
            </div>
          </div>

          <div className="table-row">
            <div className="table-cell employee-info">
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format" alt="Sarah Wilson" />
              <div>
                <div className="employee-name">Sarah Wilson</div>
                <div className="employee-role">Designer</div>
              </div>
            </div>
            <div className="table-cell">
              <span className="status-badge absent">Absent</span>
            </div>
            <div className="table-cell">-</div>
            <div className="table-cell">-</div>
            <div className="table-cell">0h 0m</div>
            <div className="table-cell">
              <button className="btn-edit-small">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage; 