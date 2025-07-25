import React from 'react';
import AttendanceLog from '../../components/AttendanceLog/AttendanceLog';
import './AttendancePage.css';

const AttendancePage: React.FC = () => {
  return (
    <div className="attendance-container">
      <div className="page-header">
        <h1>Attendance Management</h1>
        <p>Track employee attendance, manage schedules, and monitor time logs</p>
      </div>

      {/* Stats grid removed as requested */}

      <AttendanceLog />
    </div>
  );
};

export default AttendancePage; 