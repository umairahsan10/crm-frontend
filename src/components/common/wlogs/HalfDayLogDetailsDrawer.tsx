/**
 * Half Day Log Details Drawer
 */

import React, { useState, useEffect } from 'react';
import { useNavbar } from '../../../context/NavbarContext';

interface HalfDayLogDetailsDrawerProps {
  log: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const HalfDayLogDetailsDrawer: React.FC<HalfDayLogDetailsDrawerProps> = ({ log, isOpen, onClose }) => {
  const { isNavbarOpen } = useNavbar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75" onClick={onClose}></div>
      <div className="relative mx-auto h-full bg-white shadow-2xl rounded-lg border border-gray-200 transform transition-all duration-300 ease-out" style={{ marginLeft: isMobile ? '0' : (isNavbarOpen ? '280px' : '100px'), width: isMobile ? '100vw' : (isNavbarOpen ? 'calc(100vw - 350px)' : 'calc(100vw - 150px)'), maxWidth: isMobile ? '100vw' : '1200px', marginRight: isMobile ? '0' : '50px', marginTop: isMobile ? '0' : '20px', marginBottom: isMobile ? '0' : '20px', height: isMobile ? '100vh' : 'calc(100vh - 40px)' }}>
        <div className="flex h-full flex-col">
          <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Half Day Log Details</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div className="border-b border-gray-200">
            <nav className={`-mb-px flex space-x-8 ${isMobile ? 'px-4' : 'px-6'}`}>
              <button className="py-4 px-1 border-b-2 font-medium text-sm border-purple-500 text-purple-600">Details</button>
            </nav>
          </div>
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}`}>
            <div className="space-y-6">
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Employee Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label><p className="text-lg text-gray-900 font-medium">{log.employee ? `${log.employee.firstName} ${log.employee.lastName}` : 'N/A'}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label><p className="text-lg text-gray-900 font-medium">#{log.employeeId}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Log ID</label><p className="text-lg text-gray-900 font-medium">#{log.id}</p></div>
                </div>
              </div>
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Half Day Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Date</label><p className="text-lg text-gray-900 font-medium">{new Date(log.date).toLocaleDateString()}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Half Day Type</label><span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${log.halfDayType === 'morning' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'}`}>{log.halfDayType ? log.halfDayType.toUpperCase() : 'N/A'}</span></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Status</label><span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${log.status === 'approved' ? 'bg-green-100 text-green-800' : log.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{log.status ? log.status.toUpperCase() : 'PENDING'}</span></div>
                  {log.reason && (
                    <div className="md:col-span-2 lg:col-span-3"><label className="block text-sm font-medium text-gray-700 mb-2">Reason</label><div className="bg-gray-50 rounded-lg p-3 border border-gray-200"><p className="text-sm text-gray-700">{log.reason}</p></div></div>
                  )}
                </div>
              </div>
              {log.approver && (
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Approval Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Approved By</label><p className="text-lg text-gray-900 font-medium">{`${log.approver.firstName} ${log.approver.lastName}`}</p></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Approved At</label><p className="text-lg text-gray-900 font-medium">{log.approvedAt ? new Date(log.approvedAt).toLocaleString() : 'N/A'}</p></div>
                  </div>
                </div>
              )}
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Created At</label><p className="text-lg text-gray-900 font-medium">{new Date(log.createdAt).toLocaleString()}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label><p className="text-lg text-gray-900 font-medium">{new Date(log.updatedAt).toLocaleString()}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HalfDayLogDetailsDrawer;

