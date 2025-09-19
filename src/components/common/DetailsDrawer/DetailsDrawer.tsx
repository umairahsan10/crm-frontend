import React from 'react';

export interface DetailsSection {
  title: string;
  fields: Array<{
    label: string;
    value: any;
    render?: (value: any) => React.ReactNode;
  }>;
}

export interface DetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  sections: DetailsSection[];
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
  }>;
  loading?: boolean;
  className?: string;
}

const DetailsDrawer: React.FC<DetailsDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  sections,
  actions = [],
  loading = false,
  className = '',
}) => {
  if (!isOpen) return null;

  const getVariantClasses = (variant: string = 'secondary') => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };
    return variants[variant as keyof typeof variants] || variants.secondary;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-xl transform transition-transform ${className}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <h3 className="text-md font-medium text-gray-900 mb-4">{section.title}</h3>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                      {section.fields.map((field, fieldIndex) => (
                        <div key={fieldIndex}>
                          <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {field.render ? field.render(field.value) : (
                              <span className={field.value ? '' : 'text-gray-400 italic'}>
                                {field.value || 'Not provided'}
                              </span>
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses(action.variant)}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DetailsDrawer;
