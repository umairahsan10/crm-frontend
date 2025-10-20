import React from 'react';
import type { ClientStatistics } from '../../types';

interface ClientsStatisticsProps {
  statistics: ClientStatistics;
  isLoading: boolean;
}

const ClientsStatistics: React.FC<ClientsStatisticsProps> = ({ statistics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // const statusColors = {
  //   prospect: 'bg-blue-500',
  //   active: 'bg-green-500',
  //   inactive: 'bg-gray-500',
  //   suspended: 'bg-yellow-500',
  //   churned: 'bg-red-500'
  // };

  // const typeColors = {
  //   individual: 'bg-purple-500',
  //   enterprise: 'bg-indigo-500',
  //   smb: 'bg-green-500',
  //   startup: 'bg-orange-500'
  // };

  // const industryColors = {
  //   technology: 'bg-blue-500',
  //   healthcare: 'bg-green-500',
  //   finance: 'bg-purple-500',
  //   retail: 'bg-orange-500',
  //   manufacturing: 'bg-gray-500',
  //   education: 'bg-indigo-500',
  //   other: 'bg-yellow-500'
  // };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-1.656-1.344-3-3-3H7m10 0V7a3 3 0 00-3-3H7a3 3 0 00-3 3v13" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Clients</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Clients</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.active || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.293 13H3.586" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Inactive Clients</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.inactive || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Suspended Clients</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.suspended || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Prospect Clients</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.prospect || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Clients by Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { status: 'active', count: statistics.active || 0, color: 'bg-green-500' },
            { status: 'inactive', count: statistics.inactive || 0, color: 'bg-gray-500' },
            { status: 'suspended', count: statistics.suspended || 0, color: 'bg-red-500' },
            { status: 'prospect', count: statistics.prospect || 0, color: 'bg-orange-500' }
          ].map(({ status, count, color }) => (
            <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${color}`}></div>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {status}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>


      {/* Client Conversion Funnel */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Client Conversion Funnel</h3>
        <div className="space-y-4">
          {[
            { stage: 'Prospect', count: statistics.prospect || 0, color: 'bg-orange-500' },
            { stage: 'Active', count: statistics.active || 0, color: 'bg-green-500' },
            { stage: 'Inactive', count: statistics.inactive || 0, color: 'bg-gray-500' },
            { stage: 'Suspended', count: statistics.suspended || 0, color: 'bg-red-500' }
          ].map((stage) => {
            const maxCount = Math.max(...[
              statistics.prospect || 0,
              statistics.active || 0,
              statistics.inactive || 0,
              statistics.suspended || 0
            ]);
            const percentage = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            
            return (
              <div key={stage.stage} className="flex items-center">
                <div className="w-24 text-sm font-medium text-gray-700">{stage.stage}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${stage.color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 text-sm font-semibold text-gray-900 text-right">{stage.count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClientsStatistics;
