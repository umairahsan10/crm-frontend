import React, { useState } from 'react';

interface AttendanceLogsTabProps {
  logs: any[];
  onCheckin: () => void;
  onCheckout: () => void;
  onStatusUpdate: (logId: number, status: string, reason?: string) => void;
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
}

export const AttendanceLogsTab: React.FC<AttendanceLogsTabProps> = ({
  logs,
  onCheckin,
  onCheckout,
  onStatusUpdate,
  formatDate,
  formatTime
}) => {
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onCheckin}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Check In
        </button>
        <button
          onClick={onCheckout}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Check Out
        </button>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-2">No attendance logs found</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">{formatDate(log.date)}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.status === 'present' ? 'bg-green-100 text-green-800' :
                      log.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      log.status === 'half_day' ? 'bg-orange-100 text-orange-800' :
                      log.status === 'absent' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.status || 'Not Marked'}
                    </span>
                    <span className="text-xs text-gray-500">{log.mode}</span>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>{log.checkin ? formatTime(log.checkin) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>{log.checkout ? formatTime(log.checkout) : 'N/A'}</span>
                    </div>
                  </div>

                  {log.late_details && (
                    <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                      Late by {log.late_details.minutes_late} minutes
                      {log.late_details.requires_reason && ' - Requires justification'}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedLog(log)}
                  className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Update Status
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Status Update Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setSelectedLog(null)} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Attendance Status</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select status</option>
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter reason for status change..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      onStatusUpdate(selectedLog.id, newStatus, reason);
                      setSelectedLog(null);
                      setNewStatus('');
                      setReason('');
                    }}
                    disabled={!newStatus}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface LateLogsTabProps {
  logs: any[];
  onAction: (logId: number, action: string, lateType?: string) => void;
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
}

export const LateLogsTab: React.FC<LateLogsTabProps> = ({ logs, onAction, formatDate }) => {
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [lateType, setLateType] = useState<'paid' | 'unpaid'>('paid');

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="h-5 w-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Late Attendance Records
        </h3>
        
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2">No late records found</p>
            </div>
          ) : (
        logs.map((log) => (
          <div key={log.id} className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900">{formatDate(log.date)}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    log.action_taken === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {log.action_taken || 'Pending'}
                  </span>
                </div>
                
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>Scheduled: {log.scheduled_time_in}</span>
                    <span>Actual: {log.actual_time_in}</span>
                    <span className="font-semibold text-red-600">Late by {log.minutes_late} min</span>
                  </div>
                  {log.reason && (
                    <p className="mt-1 text-gray-700">Reason: {log.reason}</p>
                  )}
                  {log.late_type && (
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        log.late_type === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.late_type}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {log.action_taken !== 'Completed' && (
                <button
                  onClick={() => setSelectedLog(log)}
                  className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Take Action
                </button>
              )}
            </div>
          </div>
          ))
          )}
        </div>
      </div>

      {/* Action Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setSelectedLog(null)} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review Late Log</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Late by: <span className="font-semibold">{selectedLog.minutes_late} minutes</span></p>
                  {selectedLog.reason && <p className="text-sm text-gray-600 mt-1">Reason: {selectedLog.reason}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Late Type</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="paid"
                        checked={lateType === 'paid'}
                        onChange={(e) => setLateType(e.target.value as any)}
                        className="mr-2"
                      />
                      <span className="text-sm">Paid</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="unpaid"
                        checked={lateType === 'unpaid'}
                        onChange={(e) => setLateType(e.target.value as any)}
                        className="mr-2"
                      />
                      <span className="text-sm">Unpaid</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      onAction(selectedLog.id, 'Completed', lateType);
                      setSelectedLog(null);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface HalfDayLogsTabProps {
  logs: any[];
  onAction: (logId: number, action: string, halfDayType?: string) => void;
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
}

export const HalfDayLogsTab: React.FC<HalfDayLogsTabProps> = ({ logs, onAction, formatDate }) => {
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [halfDayType, setHalfDayType] = useState<'paid' | 'unpaid'>('paid');

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="h-5 w-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v9l4 4m4-4a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Half-Day Attendance Records
        </h3>
        
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v9l4 4m4-4a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2">No half-day records found</p>
            </div>
          ) : (
        logs.map((log) => (
          <div key={log.id} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900">{formatDate(log.date)}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    log.action_taken === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {log.action_taken || 'Pending'}
                  </span>
                </div>
                
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>Scheduled: {log.scheduled_time_in}</span>
                    <span>Actual: {log.actual_time_in}</span>
                  </div>
                  {log.reason && (
                    <p className="mt-1 text-gray-700">Reason: {log.reason}</p>
                  )}
                  {log.half_day_type && (
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        log.half_day_type === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.half_day_type}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {log.action_taken !== 'Completed' && (
                <button
                  onClick={() => setSelectedLog(log)}
                  className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Take Action
                </button>
              )}
            </div>
          </div>
          ))
          )}
        </div>
      </div>

      {/* Action Modal - Similar to Late Logs */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setSelectedLog(null)} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review Half-Day Log</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded">
                  {selectedLog.reason && <p className="text-sm text-gray-600">Reason: {selectedLog.reason}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Half-Day Type</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="paid"
                        checked={halfDayType === 'paid'}
                        onChange={(e) => setHalfDayType(e.target.value as any)}
                        className="mr-2"
                      />
                      <span className="text-sm">Paid</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="unpaid"
                        checked={halfDayType === 'unpaid'}
                        onChange={(e) => setHalfDayType(e.target.value as any)}
                        className="mr-2"
                      />
                      <span className="text-sm">Unpaid</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      onAction(selectedLog.id, 'Completed', halfDayType);
                      setSelectedLog(null);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface LeaveLogsTabProps {
  logs: any[];
  onAction: (logId: number, action: string, reason?: string) => void;
  formatDate: (date: string) => string;
}

export const LeaveLogsTab: React.FC<LeaveLogsTabProps> = ({ logs, onAction, formatDate }) => {
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [action, setAction] = useState<'Approved' | 'Rejected'>('Approved');
  const [reason, setReason] = useState('');

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Leave Requests
        </h3>
        
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2">No leave requests found</p>
            </div>
          ) : (
        logs.map((log) => (
          <div key={log.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    log.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    log.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {log.status || 'Pending'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{log.leave_type}</span>
                </div>
                
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>{formatDate(log.start_date)} - {formatDate(log.end_date)}</span>
                  </div>
                  {log.reason && (
                    <p className="mt-1 text-gray-700">Reason: {log.reason}</p>
                  )}
                  {log.confirmation_reason && (
                    <p className="mt-1 text-sm text-gray-500">Admin note: {log.confirmation_reason}</p>
                  )}
                </div>
              </div>

              {log.status !== 'Approved' && log.status !== 'Rejected' && (
                <button
                  onClick={() => setSelectedLog(log)}
                  className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Review
                </button>
              )}
            </div>
          </div>
          ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setSelectedLog(null)} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review Leave Request</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded space-y-2">
                  <p className="text-sm text-gray-600">Leave Type: <span className="font-semibold">{selectedLog.leave_type}</span></p>
                  <p className="text-sm text-gray-600">Duration: {formatDate(selectedLog.start_date)} - {formatDate(selectedLog.end_date)}</p>
                  {selectedLog.reason && <p className="text-sm text-gray-600">Reason: {selectedLog.reason}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Approved"
                        checked={action === 'Approved'}
                        onChange={(e) => setAction(e.target.value as any)}
                        className="mr-2"
                      />
                      <span className="text-sm">Approve</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Rejected"
                        checked={action === 'Rejected'}
                        onChange={(e) => setAction(e.target.value as any)}
                        className="mr-2"
                      />
                      <span className="text-sm">Reject</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a note..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      onAction(selectedLog.id, action, reason);
                      setSelectedLog(null);
                      setReason('');
                    }}
                    className={`flex-1 text-white py-2 px-4 rounded-md ${
                      action === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {action === 'Approved' ? 'Approve' : 'Reject'}
                  </button>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface MonthlySummaryTabProps {
  data: any;
}

export const MonthlySummaryTab: React.FC<MonthlySummaryTabProps> = ({ data }) => {
  const summaryItems = [
    { 
      label: 'Total Present', 
      value: data?.total_present || 0, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      icon: <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    },
    { 
      label: 'Total Absent', 
      value: data?.total_absent || 0, 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      icon: <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    },
    { 
      label: 'Total Late Days', 
      value: data?.total_late_days || 0, 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100',
      icon: <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    },
    { 
      label: 'Total Leave Days', 
      value: data?.total_leave_days || 0, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      icon: <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    },
    { 
      label: 'Total Remote Days', 
      value: data?.total_remote_days || 0, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100',
      icon: <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    },
    { 
      label: 'Total Half Days', 
      value: data?.total_half_days || 0, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100',
      icon: <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v9l4 4m4-4a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Monthly Summary
          {data?.month && <span className="ml-2 text-sm text-gray-500">({data.month})</span>}
        </h3>

        {!data ? (
          <div className="text-center py-12 text-gray-500">
            <p>No monthly data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {summaryItems.map((item) => (
              <div key={item.label} className={`${item.bgColor} rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow`}>
                <div className="flex items-center justify-between mb-2">
                  <div>{item.icon}</div>
                  <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                </div>
                <p className="text-sm text-gray-700 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface StatisticsTabProps {
  stats: any;
}

export const StatisticsTab: React.FC<StatisticsTabProps> = ({ stats }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Attendance Statistics
        </h3>

        {!stats || Object.keys(stats).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2">No statistics available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Late Statistics */}
            {stats.lateStats && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Late Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.lateStats.total || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-600">Justified</p>
                    <p className="text-2xl font-bold text-green-600">{stats.lateStats.justified || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-600">Paid</p>
                    <p className="text-2xl font-bold text-green-600">{stats.lateStats.paid || 0}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <p className="text-xs text-gray-600">Unpaid</p>
                    <p className="text-2xl font-bold text-red-600">{stats.lateStats.unpaid || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Half-Day Statistics */}
            {stats.halfDayStats && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v9l4 4m4-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Half-Day Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.halfDayStats.total || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-600">Justified</p>
                    <p className="text-2xl font-bold text-green-600">{stats.halfDayStats.justified || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-600">Paid</p>
                    <p className="text-2xl font-bold text-green-600">{stats.halfDayStats.paid || 0}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <p className="text-xs text-gray-600">Unpaid</p>
                    <p className="text-2xl font-bold text-red-600">{stats.halfDayStats.unpaid || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Leave Statistics */}
            {stats.leaveStats && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Leave Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.leaveStats.total || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.leaveStats.approved || 0}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <p className="text-xs text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{stats.leaveStats.rejected || 0}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <p className="text-xs text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.leaveStats.pending || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

