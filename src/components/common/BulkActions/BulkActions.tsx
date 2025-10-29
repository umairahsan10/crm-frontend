import React, { useState } from 'react';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  onClick: (selectedIds: string[]) => void;
  confirmMessage?: string;
  disabled?: boolean;
}

export interface BulkActionsProps {
  selectedItems: string[];
  actions: BulkAction[];
  onClearSelection?: () => void;
  className?: string;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedItems,
  actions,
  onClearSelection,
  className = '',
}) => {
  const [showActions, setShowActions] = useState(false);

  if (selectedItems.length === 0) {
    return null;
  }

  const handleActionClick = (action: BulkAction) => {
    if (action.confirmMessage) {
      if (window.confirm(action.confirmMessage)) {
        action.onClick(selectedItems);
        setShowActions(false);
      }
    } else {
      action.onClick(selectedItems);
      setShowActions(false);
    }
  };

  const getVariantClasses = (variant: string = 'secondary') => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    };
    return variants[variant as keyof typeof variants] || variants.secondary;
  };

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={true}
              readOnly
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium text-gray-900">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <button
            onClick={() => setShowActions(!showActions)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Actions
            <svg className="ml-2 -mr-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {onClearSelection && (
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Actions Dropdown */}
      {showActions && (
        <div className="mt-4 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="py-1">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
                className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                  action.disabled ? 'text-gray-400' : 'text-gray-700'
                }`}
              >
                {action.icon && <span className="flex-shrink-0">{action.icon}</span>}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.slice(0, 3).map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            disabled={action.disabled}
            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses(action.variant)}`}
          >
            {action.icon && <span className="mr-1">{action.icon}</span>}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BulkActions;
