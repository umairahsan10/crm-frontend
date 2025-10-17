/**
 * Salary Log Details Drawer
 */

import React, { useState, useEffect } from 'react';
import { useNavbar } from '../../../context/NavbarContext';

interface SalaryLogDetailsDrawerProps {
  log: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const SalaryLogDetailsDrawer: React.FC<SalaryLogDetailsDrawerProps> = ({ log, isOpen, onClose }) => {
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
          <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Salary Log Details</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div className="border-b border-gray-200">
            <nav className={`-mb-px flex space-x-8 ${isMobile ? 'px-4' : 'px-6'}`}>
              <button className="py-4 px-1 border-b-2 font-medium text-sm border-emerald-500 text-emerald-600">Details</button>
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
                  <svg className="h-5 w-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Salary Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Month</label><p className="text-lg text-gray-900 font-medium">{log.month}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Year</label><p className="text-lg text-gray-900 font-medium">{log.year}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary</label><p className="text-lg text-blue-600 font-bold">${log.basicSalary.toLocaleString()}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Allowances</label><p className="text-lg text-green-600 font-bold">+${log.allowances.toLocaleString()}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Deductions</label><p className="text-lg text-red-600 font-bold">-${log.deductions.toLocaleString()}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Net Salary</label><p className="text-lg text-emerald-600 font-bold">${log.netSalary.toLocaleString()}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Status</label><span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${log.status === 'paid' ? 'bg-green-100 text-green-800' : log.status === 'processed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{log.status ? log.status.toUpperCase() : 'PENDING'}</span></div>
                </div>
              </div>
              {log.processor && (
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Processing Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Processed By</label><p className="text-lg text-gray-900 font-medium">{`${log.processor.firstName} ${log.processor.lastName}`}</p></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Processed At</label><p className="text-lg text-gray-900 font-medium">{log.processedAt ? new Date(log.processedAt).toLocaleString() : 'N/A'}</p></div>
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

export default SalaryLogDetailsDrawer;

