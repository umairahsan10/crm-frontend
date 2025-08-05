import React from 'react';
import AttendanceLog from '../../components/previous_components/AttendanceLog/AttendanceLog';
import './AttendancePage.css';

const AttendancePage: React.FC = () => {
  return (
    <div className="attendance-container">
      <div className="page-header">
        <h1>Attendance Management</h1>
        <p>Track employee attendance, manage schedules, and monitor time logs</p>
      </div>

      {/* Legacy AttendanceLog component */}
      <div className="legacy-section">
        <AttendanceLog />
      </div>
    </div>
  );
};

export default AttendancePage; 