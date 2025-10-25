import React from 'react';
import './NotificationsPage.css';

const NotificationsPage: React.FC = () => {
  return (
    <div className="notifications-container">
      <div className="page-header">
        <p>Manage system notifications and alerts</p>
      </div>

      <div className="notifications-content">
        <div className="notification-item">
          <div className="notification-icon">🔔</div>
          <div className="notification-content">
            <h3>System Maintenance Scheduled</h3>
            <p>System will be under maintenance from 2:00 AM to 4:00 AM</p>
            <span className="notification-time">2 hours ago</span>
          </div>
          <button className="btn-secondary">Mark as Read</button>
        </div>

        <div className="notification-item">
          <div className="notification-icon">⚠️</div>
          <div className="notification-content">
            <h3>High Memory Usage Alert</h3>
            <p>Server memory usage is at 85%</p>
            <span className="notification-time">4 hours ago</span>
          </div>
          <button className="btn-secondary">Mark as Read</button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
