import React from 'react';

export interface StatCard {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

export interface DataStatisticsProps {
  title?: string;
  cards: StatCard[];
  loading?: boolean;
  className?: string;
}

const DataStatistics: React.FC<DataStatisticsProps> = ({
  title = 'Statistics',
  cards,
  loading = false,
  className = '',
}) => {
  const getColorClasses = (color: string = 'blue') => {
    const colors = {
      blue: {
        bg: 'bg-blue-500',
        bgLight: 'bg-blue-100',
        text: 'text-blue-600',
        textLight: 'text-blue-500',
      },
      green: {
        bg: 'bg-green-500',
        bgLight: 'bg-green-100',
        text: 'text-green-600',
        textLight: 'text-green-500',
      },
      yellow: {
        bg: 'bg-yellow-500',
        bgLight: 'bg-yellow-100',
        text: 'text-yellow-600',
        textLight: 'text-yellow-500',
      },
      red: {
        bg: 'bg-red-500',
        bgLight: 'bg-red-100',
        text: 'text-red-600',
        textLight: 'text-red-500',
      },
      purple: {
        bg: 'bg-purple-500',
        bgLight: 'bg-purple-100',
        text: 'text-purple-600',
        textLight: 'text-purple-500',
      },
      indigo: {
        bg: 'bg-indigo-500',
        bgLight: 'bg-indigo-100',
        text: 'text-indigo-600',
        textLight: 'text-indigo-500',
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'increase':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'decrease':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg p-4 min-h-[120px]">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, index) => {
            const colors = getColorClasses(card.color);
            
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow min-h-[120px] flex flex-col">
                <div className="flex items-start flex-1">
                  <div className="flex-shrink-0">
                    {card.icon ? (
                      <div className={`p-2 rounded-md ${colors.bgLight}`}>
                        <div className={`w-6 h-6 ${colors.text}`}>
                          {card.icon}
                        </div>
                      </div>
                    ) : (
                      <div className={`p-2 rounded-md ${colors.bgLight}`}>
                        <div className={`w-6 h-6 ${colors.text}`}>
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.25rem',
                      maxHeight: '2.5rem'
                    }}>{card.title}</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                      {card.change && (
                        <div className={`ml-2 flex items-baseline text-sm ${getChangeColor(card.change.type)}`}>
                          {getChangeIcon(card.change.type)}
                          <span className="ml-1">{card.change.value}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DataStatistics;
