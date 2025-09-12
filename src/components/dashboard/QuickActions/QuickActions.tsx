import React from 'react';
import './QuickActions.css';

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

export interface ActionCategory {
  id: string;
  title: string;
  actions: QuickAction[];
}

interface QuickActionsProps {
  categories: ActionCategory[];
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  categories,
  className = ''
}) => {
  return (
    <div className={`quick-actions ${className}`}>
      <div className="quick-actions-grid">
        {categories.map((category) => (
          <div key={category.id} className="action-category">
            <h3 className="category-title">{category.title}</h3>
            <div className="action-buttons">
              {category.actions.map((action) => (
                <button
                  key={action.id}
                  className={`action-btn action-btn-${action.color || 'blue'}`}
                  onClick={action.onClick}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-label">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;