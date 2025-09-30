import React, { useState } from 'react';
import type { Production } from '../../types';

interface ProductionDetailsDrawerProps {
  production: Production | null;
  isOpen: boolean;
  onClose: () => void;
  onProductionUpdated?: (updatedProduction: Production) => void;
}

const ProductionDetailsDrawer: React.FC<ProductionDetailsDrawerProps> = ({
  production,
  isOpen,
  onClose,
  onProductionUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduction, setEditedProduction] = useState<Production | null>(null);

  React.useEffect(() => {
    if (production) {
      setEditedProduction({ ...production });
    }
  }, [production]);

  const handleSave = () => {
    if (editedProduction && onProductionUpdated) {
      onProductionUpdated(editedProduction);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProduction(production ? { ...production } : null);
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      planned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
      delayed: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
      }`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityClasses = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        priorityClasses[priority as keyof typeof priorityClasses] || 'bg-gray-100 text-gray-800'
      }`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeClasses = {
      manufacturing: 'bg-blue-100 text-blue-800',
      assembly: 'bg-green-100 text-green-800',
      quality_control: 'bg-purple-100 text-purple-800',
      packaging: 'bg-orange-100 text-orange-800',
      testing: 'bg-indigo-100 text-indigo-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        typeClasses[type as keyof typeof typeClasses] || 'bg-gray-100 text-gray-800'
      }`}>
        {type.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (!isOpen || !production) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
      
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="relative w-screen max-w-md">
          <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
            {/* Header */}
            <div className="px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h2 className="ml-3 text-lg font-medium text-gray-900">
                    Production Details
                  </h2>
                </div>
                <div className="ml-3 h-7 flex items-center">
                  <button
                    onClick={onClose}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <span className="sr-only">Close panel</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mt-6 relative flex-1 px-4 sm:px-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{production.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Type</dt>
                      <dd className="mt-1">{getTypeBadge(production.productType)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1">{getStatusBadge(production.status)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Priority</dt>
                      <dd className="mt-1">{getPriorityBadge(production.priority)}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">{production.description}</dd>
                    </div>
                  </dl>
                </div>

                {/* Progress */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                        <span>Overall Progress</span>
                        <span>{production.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${production.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Estimated Hours</dt>
                        <dd className="text-sm text-gray-900">{production.estimatedHours}h</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Actual Hours</dt>
                        <dd className="text-sm text-gray-900">{production.actualHours || 'Not tracked'}h</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                      <dd className="text-sm text-gray-900">{new Date(production.startDate).toLocaleDateString()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">End Date</dt>
                      <dd className="text-sm text-gray-900">{production.endDate ? new Date(production.endDate).toLocaleDateString() : 'Not set'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="text-sm text-gray-900">{new Date(production.createdAt).toLocaleDateString()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="text-sm text-gray-900">{new Date(production.updatedAt).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>

                {/* Assignment */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment</h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                      <dd className="text-sm text-gray-900">
                        {production.assignedTo 
                          ? (typeof production.assignedTo === 'string' 
                              ? production.assignedTo 
                              : `${production.assignedTo.firstName} ${production.assignedTo.lastName}`)
                          : 'Unassigned'
                        }
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Department ID</dt>
                      <dd className="text-sm text-gray-900">{production.departmentId}</dd>
                    </div>
                  </dl>
                </div>

                {/* Quality & Cost */}
                {(production.qualityScore || production.cost) && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quality & Cost</h3>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                      {production.qualityScore && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Quality Score</dt>
                          <dd className="text-sm text-gray-900">{production.qualityScore}/10</dd>
                        </div>
                      )}
                      {production.cost && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Cost</dt>
                          <dd className="text-sm text-gray-900">${production.cost.toLocaleString()}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Materials */}
                {production.materials && production.materials.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Materials</h3>
                    <ul className="space-y-2">
                      {production.materials.map((material, index) => (
                        <li key={index} className="flex items-center">
                          <div className="flex-shrink-0 h-2 w-2 bg-green-400 rounded-full mr-3"></div>
                          <span className="text-sm text-gray-900">{material}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Notes */}
                {production.notes && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{production.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 sm:px-6">
              <div className="flex justify-end space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Edit Production
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDetailsDrawer;
