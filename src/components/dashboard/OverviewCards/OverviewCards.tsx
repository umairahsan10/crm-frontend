import React from 'react';
import './OverviewCards.css';

export interface OverviewCardData {
  id: string;
  title: string;
  value: number | string;
  subtitle: string;
  change?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon: {
    type: 'svg' | 'emoji';
    content: string;
    color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'indigo';
  };
}

interface OverviewCardsProps {
  data: OverviewCardData[];
  className?: string;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ data, className = '' }) => {
  const renderIcon = (icon: OverviewCardData['icon']) => {
    if (icon.type === 'svg') {
      return (
        <div className={`card-icon ${icon.color}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon.content} />
          </svg>
        </div>
      );
    }
    return (
      <div className={`card-icon ${icon.color}`}>
        <span className="text-2xl">{icon.content}</span>
      </div>
    );
  };

  return (
    <div className={`overview-cards ${className}`}>
      {data.map((card) => (
        <div key={card.id} className="overview-card">
          <div className="card-header">
            {renderIcon(card.icon)}
            {card.change && (
              <span className={`card-change ${card.change.type}`}>
                {card.change.value}
              </span>
            )}
          </div>
          <h3 className="card-title">{card.title}</h3>
          <p className="card-value">{card.value}</p>
          <p className="card-subtitle">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;
