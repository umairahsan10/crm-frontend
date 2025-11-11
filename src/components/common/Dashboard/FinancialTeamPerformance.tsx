import React from 'react';

interface TeamMember {
  name: string;
  transactions: number;
  processed: number;
  accuracy: string;
  performance: 'high' | 'medium' | 'low';
}

interface FinancialTeamPerformanceProps {
  className?: string;
}

export const FinancialTeamPerformance: React.FC<FinancialTeamPerformanceProps> = ({ className = '' }) => {
  const teamMembers: TeamMember[] = [
    { name: 'Alice Johnson', transactions: 45, processed: 42, accuracy: '99.5%', performance: 'high' },
    { name: 'Bob Smith', transactions: 38, processed: 36, accuracy: '98.2%', performance: 'medium' },
    { name: 'Carol Davis', transactions: 42, processed: 40, accuracy: '99.8%', performance: 'high' },
    { name: 'David Wilson', transactions: 35, processed: 33, accuracy: '97.5%', performance: 'medium' },
  ];

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Top Performing Team Members</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {teamMembers.map((member, index) => (
          <div key={index} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-emerald-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.transactions} transactions • {member.processed} processed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{member.accuracy}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceBadge(member.performance)}`}>
                  {member.performance}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

