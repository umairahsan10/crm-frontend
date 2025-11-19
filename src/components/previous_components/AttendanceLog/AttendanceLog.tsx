import React, { useState } from 'react';
import './AttendanceLog.css';

// Helper function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to get a fallback color based on name
const getAvatarColor = (name: string): string => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

interface EmployeeAvatarProps {
  src?: string;
  alt: string;
  name: string;
}

const EmployeeAvatar: React.FC<EmployeeAvatarProps> = ({ src, alt, name }) => {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(name);

  const handleImageError = () => {
    setImageError(true);
  };

  // If no src provided or image failed to load, show fallback
  if (!src || imageError) {
    return (
      <div 
        className="employee-avatar-fallback"
        style={{ backgroundColor }}
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt}
      onError={handleImageError}
      className="employee-avatar-img"
    />
  );
};

const AttendanceLog: React.FC = () => {
  // REMOVED: Sample data - this component should use API data
  // TODO: Replace with API integration using useAttendanceLogs and useEmployees hooks
  const [employees] = useState<any[]>([]);
  const [attendanceData] = useState<any[]>([]);

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return 'present';
      case 'late': return 'late';
      case 'remote': return 'remote';
      case 'absent': return 'absent';
      default: return 'present';
    }
  };

  return (
    <div className="attendance-section">
      <div className="section-header">
        <h2>Today's Attendance Log</h2>
        <div className="header-actions">
          <button className="btn-mark-attendance">Mark Attendance</button>
          <button className="btn-export">Export Report</button>
        </div>
      </div>

      <div className="table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th className="header-cell employee-col">Employee</th>
              <th className="header-cell status-col">Status</th>
              <th className="header-cell time-col">Check In</th>
              <th className="header-cell time-col">Check Out</th>
              <th className="header-cell time-col">Total Hours</th>
              <th className="header-cell actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((attendance) => {
              const employee = employees.find(emp => emp.id === attendance.employeeId);
              if (!employee) return null;

              return (
                <tr key={attendance.employeeId} className="table-row">
                  <td className="table-cell employee-info">
                    <div className="employee-avatar">
                      <EmployeeAvatar 
                        src={employee.profilePicture}
                        alt={`${employee.name} ${employee.lastname}`}
                        name={`${employee.name} ${employee.lastname}`}
                      />
                    </div>
                    <div className="employee-details">
                      <div className="employee-name">{employee.name} {employee.lastname}</div>
                      <div className="employee-role">{employee.role_id}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${getStatusBadgeClass(attendance.status)}`}>
                      {attendance.status}
                    </span>
                  </td>
                  <td className="table-cell time-cell">{attendance.checkIn}</td>
                  <td className="table-cell time-cell">{attendance.checkOut}</td>
                  <td className="table-cell time-cell">{attendance.totalHours}</td>
                  <td className="table-cell">
                    <button className="btn-edit-small">Edit</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceLog; 