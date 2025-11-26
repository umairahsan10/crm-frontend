/**
 * Project Log Details Drawer
 */

import React, { useState, useEffect } from 'react';
import { useNavbar } from '../../../context/NavbarContext';

interface ProjectLogDetailsDrawerProps {
  log: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectLogDetailsDrawer: React.FC<ProjectLogDetailsDrawerProps> = ({ log, isOpen, onClose }) => {
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
          <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Project Log Details</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div className="border-b border-gray-200">
            <nav className={`-mb-px flex space-x-8 ${isMobile ? 'px-4' : 'px-6'}`}>
              <button className="py-4 px-1 border-b-2 font-medium text-sm border-indigo-500 text-indigo-600">Details</button>
            </nav>
          </div>
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}`}>
            <div className="space-y-6">
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  Project Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label><p className="text-lg text-gray-900 font-medium">{log.project_name || 'N/A'}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label><p className="text-lg text-gray-900 font-medium">{log.project_deadline ? new Date(log.project_deadline).toLocaleDateString() : <span className="text-gray-400 italic">Not set</span>}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    {log.project_status ? (
                      (() => {
                        const statusColors: Record<string, { bg: string; text: string }> = {
                          'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
                          'in_progress': { bg: 'bg-blue-100', text: 'text-blue-800' },
                          'completed': { bg: 'bg-green-100', text: 'text-green-800' },
                          'on_hold': { bg: 'bg-gray-100', text: 'text-gray-800' },
                          'cancelled': { bg: 'bg-red-100', text: 'text-red-800' },
                        };
                        const colors = statusColors[log.project_status.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                        return (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
                            {log.project_status.replace('_', ' ').toUpperCase()}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
                  </div>
                  <div className="md:col-span-2 lg:col-span-3"><label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label><div className="bg-gray-50 rounded-lg p-3 border border-gray-200"><p className="text-sm text-gray-700 whitespace-pre-wrap">{log.project_description || 'N/A'}</p></div></div>
                </div>
              </div>
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Developer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Developer Name</label><p className="text-lg text-gray-900 font-medium">{log.developer_name || (log.developer_first_name && log.developer_last_name ? `${log.developer_first_name} ${log.developer_last_name}` : 'N/A')}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Developer Email</label><p className="text-lg text-gray-900 font-medium">{log.developer_email || 'N/A'}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Log ID</label><p className="text-lg text-gray-900 font-medium">#{log.project_log_id || log.id || 'N/A'}</p></div>
                </div>
              </div>
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Project ID</label><p className="text-lg text-gray-900 font-medium">#{log.project_id || 'N/A'}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Developer ID</label><p className="text-lg text-gray-900 font-medium">#{log.developer_id || 'N/A'}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Created At</label><p className="text-lg text-gray-900 font-medium">{log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label><p className="text-lg text-gray-900 font-medium">{log.updated_at ? new Date(log.updated_at).toLocaleString() : 'N/A'}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectLogDetailsDrawer;

