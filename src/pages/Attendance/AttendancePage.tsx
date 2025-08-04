import React, { useState } from 'react';
import AttendanceLog from '../../components/previous_components/AttendanceLog/AttendanceLog';
import AttendancePopUp from '../../components/module-specific/AttendancePopUp/AttendancePopUp';
import type { AttendanceData } from '../../components/module-specific/AttendancePopUp/AttendancePopUp';
import './AttendancePage.css';

const AttendancePage: React.FC = () => {
  // State for popup management
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<'employee' | 'hr'>('employee');
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({
    date: new Date().toISOString().split('T')[0],
    time: '09:30',
    lateDuration: '30 minutes',
    reason: '',
    status: 'pending'
  });

  // Example attendance data for demonstration
  const exampleAttendanceData: AttendanceData[] = [
    {
      date: '2024-01-15',
      time: '09:30',
      lateDuration: '30 minutes',
      reason: 'Traffic was heavy due to construction on the highway',
      status: 'pending',
      submittedAt: '2024-01-15T09:35:00Z'
    },
    {
      date: '2024-01-14',
      time: '08:45',
      lateDuration: '15 minutes',
      reason: 'Public transport was delayed',
      status: 'approved',
      submittedAt: '2024-01-14T08:50:00Z'
    },
    {
      date: '2024-01-13',
      time: '09:15',
      lateDuration: '45 minutes',
      reason: 'Car broke down on the way to work',
      status: 'rejected',
      submittedAt: '2024-01-13T09:20:00Z'
    }
  ];

  // Handle opening popup for employee submission
  const handleOpenEmployeeSubmission = () => {
    setCurrentUserRole('employee');
    setAttendanceData({
      date: new Date().toISOString().split('T')[0],
      time: '09:30',
      lateDuration: '30 minutes',
      reason: '',
      status: 'pending'
    });
    setIsPopUpOpen(true);
  };

  // Handle opening popup for HR review
  const handleOpenHRReview = (data: AttendanceData) => {
    setCurrentUserRole('hr');
    setAttendanceData(data);
    setIsPopUpOpen(true);
  };

  // Handle form submission (Employee role)
  const handleSubmitAttendance = async (data: AttendanceData) => {
    console.log('Employee submitting attendance:', data);
    // Here you would typically make an API call to save the attendance
    // For now, we'll just simulate a successful submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsPopUpOpen(false);
    // You could also update the attendance list here
  };

  // Handle approval (HR role)
  const handleApproveAttendance = async (data: AttendanceData) => {
    console.log('HR approving attendance:', data);
    // Here you would typically make an API call to approve the attendance
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsPopUpOpen(false);
    // You could also update the attendance list here
  };

  // Handle rejection (HR role)
  const handleRejectAttendance = async (data: AttendanceData) => {
    console.log('HR rejecting attendance:', data);
    // Here you would typically make an API call to reject the attendance
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsPopUpOpen(false);
    // You could also update the attendance list here
  };

  // Handle cancel
  const handleCancel = () => {
    setIsPopUpOpen(false);
  };

  return (
    <div className="attendance-container">
      <div className="page-header">
        <h1>Attendance Management</h1>
        <p>Track employee attendance, manage schedules, and monitor time logs</p>
      </div>

      {/* Action buttons */}
      <div className="attendance-actions">
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={handleOpenEmployeeSubmission}
          >
            Submit Late Attendance
          </button>
          
          <div className="role-switcher">
            <label>Current Role:</label>
            <select 
              value={currentUserRole} 
              onChange={(e) => setCurrentUserRole(e.target.value as 'employee' | 'hr')}
              className="role-select"
            >
              <option value="employee">Employee</option>
              <option value="hr">HR Manager</option>
            </select>
          </div>
        </div>
      </div>

      {/* Example attendance submissions for HR review */}
      {currentUserRole === 'hr' && (
        <div className="pending-submissions">
          <h3>Pending Late Attendance Submissions</h3>
          <div className="submissions-list">
            {exampleAttendanceData.map((data, index) => (
              <div key={index} className="submission-item">
                <div className="submission-info">
                  <span className="submission-date">{new Date(data.date).toLocaleDateString()}</span>
                  <span className="submission-time">{data.time}</span>
                  <span className="submission-duration">{data.lateDuration}</span>
                  <span className={`submission-status status-${data.status}`}>
                    {data.status}
                  </span>
                </div>
                <div className="submission-actions">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleOpenHRReview(data)}
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legacy AttendanceLog component */}
      <div className="legacy-section">
        <AttendanceLog />
      </div>

      {/* AttendancePopUp Component */}
      <AttendancePopUp
        isOpen={isPopUpOpen}
        userRole={currentUserRole}
        attendanceData={attendanceData}
        employeeName={currentUserRole === 'hr' ? 'John Doe' : undefined}
        onSubmit={handleSubmitAttendance}
        onApprove={handleApproveAttendance}
        onReject={handleRejectAttendance}
        onCancel={handleCancel}
        title={currentUserRole === 'employee' ? 'Submit Late Attendance' : 'Review Late Attendance'}
        submitButtonText="Submit Report"
        approveButtonText="Approve"
        rejectButtonText="Reject"
        cancelButtonText="Cancel"
        reasonLabel={currentUserRole === 'employee' ? 'Reason for being late' : 'Submitted Reason'}
        reasonPlaceholder="Please provide a detailed reason for your late arrival..."
        size="md"
        theme="light"
      />
    </div>
  );
};

export default AttendancePage; 