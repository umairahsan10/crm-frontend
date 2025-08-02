import React, { useState } from 'react';
import './Header.css';
import SearchBar from '../../common/SearchBar/SearchBar';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New employee John Smith added', time: '2 hours ago', unread: true, icon: '👤' },
    { id: 2, message: 'Payroll processed for March 2024', time: '1 day ago', unread: true, icon: '💰' },
    { id: 3, message: 'Sales target exceeded by 15%', time: '2 days ago', unread: false, icon: '📈' }
  ]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      unread: false
    })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="header-center">
        <SearchBar 
          placeholder="Search..."
          onSearch={(value) => console.log('Search:', value)}
        />
      </div>

      <div className="header-right">
        <div className="notification-dropdown">
          <button 
            className="notification-btn" 
            aria-label="Notifications"
            onClick={toggleNotifications}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="m13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          
          {showNotifications && (
            <div className="notification-panel">
              <div className="notification-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="mark-all-read" onClick={markAllAsRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notification-list">
                {notifications.map(notification => (
                  <div key={notification.id} className={`notification-item ${notification.unread ? 'unread' : ''}`}>
                    <div className="notification-icon">{notification.icon}</div>
                    <div className="notification-content">
                      <p>{notification.message}</p>
                      <small>{notification.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="user-dropdown">
          <button className="user-btn" aria-label="User menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 