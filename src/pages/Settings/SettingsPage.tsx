import React from 'react';
import DashboardCard from '../../components/previous_components/DashboardCard/DashboardCard';
import './SettingsPage.css';
import { useTheme } from '../../context/ThemeContext';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="settings-container">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account and system preferences</p>
      </div>
      
      <div className="settings-grid">
        <DashboardCard
          title="Profile Settings"
          subtitle="Personal information"
          className="settings-card"
        >
          <div className="profile-section">
            <div className="profile-avatar">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format"
                alt="Profile"
                className="avatar-img"
              />
              <button className="change-avatar">Change</button>
            </div>
            <div className="profile-info">
              <div className="info-item">
                <label>Full Name</label>
                <input type="text" defaultValue="John Doe" />
              </div>
              <div className="info-item">
                <label>Email</label>
                <input type="email" defaultValue="john@example.com" />
              </div>
              <div className="info-item">
                <label>Phone</label>
                <input type="tel" defaultValue="+1 (555) 123-4567" />
              </div>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard
          title="Preferences"
          subtitle="Email and push notifications"
          className="settings-card"
        >
          <div className="notification-settings">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Email Notifications</span>
                <span className="setting-desc">Receive updates via email</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Push Notifications</span>
                <span className="setting-desc">Get real-time alerts</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Weekly Reports</span>
                <span className="setting-desc">Automated weekly summaries</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Dark Mode</span>
                <span className="setting-desc">Switch to dark theme</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={theme==='dark'} onChange={toggleTheme} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard
          title="Security Settings"
          subtitle="Password and authentication"
          className="settings-card"
        >
          <div className="security-settings">
            <div className="security-item">
              <div className="security-info">
                <span className="security-label">Two-Factor Authentication</span>
                <span className="security-desc">Add an extra layer of security</span>
              </div>
              <button className="btn-enable">Enable</button>
            </div>
            <div className="security-item">
              <div className="security-info">
                <span className="security-label">Change Password</span>
                <span className="security-desc">Update your login credentials</span>
              </div>
              <button className="btn-change">Change</button>
            </div>
            <div className="security-item">
              <div className="security-info">
                <span className="security-label">Login History</span>
                <span className="security-desc">View recent login activity</span>
              </div>
              <button className="btn-view">View</button>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default SettingsPage; 