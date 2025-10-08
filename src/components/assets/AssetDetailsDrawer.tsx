import React, { useState, useEffect } from 'react';
import type { Asset } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNavbar } from '../../context/NavbarContext';

interface AssetDetailsDrawerProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onAssetUpdated?: (updatedAsset: Asset) => void;
  viewMode?: 'full' | 'details-only';
}

interface AssetComment {
  id: number;
  assetId: number;
  commentBy: number;
  commentText: string;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ValueHistoryItem {
  id: number;
  assetId: number;
  value: number;
  changedBy: number;
  commentId: number;
  createdAt: string;
  changedByUser: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  comment: {
    id: number;
    commentText: string;
    createdAt: string;
  };
}

const AssetDetailsDrawer: React.FC<AssetDetailsDrawerProps> = ({
  asset,
  isOpen,
  onClose,
  onAssetUpdated,
  viewMode = 'full'
}) => {
  const { user } = useAuth();
  const { isNavbarOpen } = useNavbar();
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'comments' | 'update'>('details');
  const [isMobile, setIsMobile] = useState(false);
  const [comments, setComments] = useState<AssetComment[]>([]);
  const [valueHistory, setValueHistory] = useState<ValueHistoryItem[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingAssetData, setIsLoadingAssetData] = useState(false);
  
  // Update asset form state
  const [updateForm, setUpdateForm] = useState({
    currentValue: '',
    depreciationRate: '',
    comment: '',
    notes: ''
  });

  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch complete asset details when drawer opens
  const fetchAssetDetails = async (assetId: string) => {
    try {
      setIsLoadingAssetData(true);
      
      // Mock data for now
      setComments([
        {
          id: 1,
          assetId: parseInt(assetId),
          commentBy: asset?.createdBy || 50,
          commentText: `Asset ${asset?.name} purchased and added to inventory`,
          createdAt: asset?.createdAt || new Date().toISOString(),
          updatedAt: asset?.updatedAt || new Date().toISOString(),
          employee: {
            id: asset?.employee?.id || 50,
            firstName: asset?.employee?.firstName || 'John',
            lastName: asset?.employee?.lastName || 'Doe',
            email: asset?.employee?.email || 'john@example.com'
          }
        }
      ]);
      
      setValueHistory([
        {
          id: 1,
          assetId: parseInt(assetId),
          value: asset?.currentValue || 0,
          changedBy: asset?.createdBy || 50,
          commentId: 1,
          createdAt: asset?.createdAt || new Date().toISOString(),
          changedByUser: {
            id: asset?.employee?.id || 50,
            firstName: asset?.employee?.firstName || 'John',
            lastName: asset?.employee?.lastName || 'Doe',
            email: asset?.employee?.email || 'john@example.com'
          },
          comment: {
            id: 1,
            commentText: `Initial asset value set at purchase`,
            createdAt: asset?.createdAt || new Date().toISOString()
          }
        }
      ]);
    } catch (error) {
      console.error('❌ Error fetching asset details:', error);
      setComments([]);
      setValueHistory([]);
    } finally {
      setIsLoadingAssetData(false);
    }
  };

  // Populate forms when asset changes
  useEffect(() => {
    if (asset && isOpen) {
      setUpdateForm({
        currentValue: asset.currentValue.toString(),
        depreciationRate: asset.depreciationRate.toString(),
        comment: '',
        notes: ''
      });
      
      fetchAssetDetails(asset.id.toString());
    }
  }, [asset, isOpen]);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset state when drawer is closed
  useEffect(() => {
    if (!isOpen) {
      setNotification(null);
    }
  }, [isOpen]);

  const handleUpdateFormChange = (field: string, value: string) => {
    setUpdateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle value update
  const handleValueUpdate = async () => {
    if (!asset || !updateForm.currentValue || !updateForm.comment.trim()) {
      setNotification({ type: 'error', message: 'Please enter current value and provide a comment' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    const newValue = parseFloat(updateForm.currentValue);
    if (isNaN(newValue) || newValue < 0) {
      setNotification({ type: 'error', message: 'Please enter a valid positive value' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      setIsUpdating(true);
      
      const updatedAsset: Asset = {
        ...asset,
        currentValue: newValue,
        depreciationRate: updateForm.depreciationRate ? parseFloat(updateForm.depreciationRate) : asset.depreciationRate,
        updatedAt: new Date().toISOString()
      };

      if (onAssetUpdated) {
        onAssetUpdated(updatedAsset);
      }
      
      setUpdateForm({
        currentValue: newValue.toString(),
        depreciationRate: updateForm.depreciationRate,
        comment: '',
        notes: ''
      });
      
      await fetchAssetDetails(asset.id.toString());
      
      setNotification({ type: 'success', message: 'Asset value updated successfully!' });
      setTimeout(() => setNotification(null), 3000);
      
      setActiveTab('timeline');
    } catch (error) {
      console.error('Error updating asset:', error);
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const getCategoryBadge = (category: string | null | undefined) => {
    if (!category) return null;

    const categoryClasses: Record<string, string> = {
      'IT Equipment': 'bg-blue-100 text-blue-800',
      'Furniture': 'bg-brown-100 text-brown-800',
      'Vehicles': 'bg-purple-100 text-purple-800',
      'Machinery': 'bg-gray-100 text-gray-800',
      'Office Equipment': 'bg-cyan-100 text-cyan-800',
      'Software': 'bg-green-100 text-green-800',
      'Property': 'bg-indigo-100 text-indigo-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        categoryClasses[category] || 'bg-gray-100 text-gray-800'
      }`}>
        {category.toUpperCase()}
      </span>
    );
  };

  const calculateDepreciation = () => {
    if (!asset) return 0;
    return asset.purchaseValue - asset.currentValue;
  };

  const calculateDepreciationPercentage = () => {
    if (!asset || asset.purchaseValue === 0) return 0;
    return ((asset.purchaseValue - asset.currentValue) / asset.purchaseValue * 100).toFixed(2);
  };

  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75" onClick={onClose}></div>
      
      <div 
        className="relative mx-auto h-full bg-white shadow-2xl rounded-lg border border-gray-200 transform transition-all duration-300 ease-out"
        style={{
          marginLeft: isMobile ? '0' : (isNavbarOpen ? '280px' : '100px'),
          width: isMobile ? '100vw' : (isNavbarOpen ? 'calc(100vw - 350px)' : 'calc(100vw - 150px)'),
          maxWidth: isMobile ? '100vw' : '1200px',
          marginRight: isMobile ? '0' : '50px',
          marginTop: isMobile ? '0' : '20px',
          marginBottom: isMobile ? '0' : '20px',
          height: isMobile ? '100vh' : 'calc(100vh - 40px)'
        }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-indigo-700">
                    A
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Asset Details
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className={`-mb-px flex space-x-8 ${isMobile ? 'px-4' : 'px-6'}`}>
              {viewMode === 'details-only' ? (
                <button
                  className="py-4 px-1 border-b-2 font-medium text-sm border-indigo-500 text-indigo-600"
                >
                  Details
                </button>
              ) : (
                [
                  { id: 'details', name: 'Details' },
                  { id: 'timeline', name: 'Timeline' },
                  { id: 'comments', name: 'Comments' },
                  { id: 'update', name: 'Update' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))
              )}
            </nav>
          </div>

          {/* Content */}
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-4'}`}>
            {(viewMode === 'details-only' || activeTab === 'details') && (
              <div className="space-y-6">
                {/* Asset Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Asset Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Asset Name</label>
                      <p className="text-lg text-gray-900 font-medium">{asset.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <div className="mt-1">
                        {getCategoryBadge(asset.category)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Value</label>
                      <p className="text-xl text-blue-600 font-bold">
                        ${asset.purchaseValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Value</label>
                      <p className="text-xl text-green-600 font-bold">
                        ${asset.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Depreciation</label>
                      <p className="text-xl text-red-600 font-bold">
                        ${calculateDepreciation().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-sm text-gray-500 ml-2">({calculateDepreciationPercentage()}%)</span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Depreciation Rate</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {asset.depreciationRate}% per year
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {new Date(asset.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {asset.transaction?.vendor?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Additional Information
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {new Date(asset.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {new Date(asset.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {asset.employee 
                            ? `${asset.employee.firstName} ${asset.employee.lastName}`
                            : 'N/A'
                          }
                        </p>
                        {asset.employee?.email && (
                          <div className="text-sm text-gray-500 mt-1">
                            {asset.employee.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'full' && activeTab === 'timeline' && (
              <div className="space-y-4">
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Value History
                  </h3>
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {isLoadingAssetData ? (
                        <div className="text-center py-8">
                          <svg className="animate-spin mx-auto h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">Loading timeline...</p>
                        </div>
                      ) : valueHistory.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="mt-2 text-sm">No value history yet</p>
                        </div>
                      ) : (
                        valueHistory.map((event, eventIdx) => (
                          <li key={event.id}>
                            <div className="relative pb-8">
                              {eventIdx !== valueHistory.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                              ) : null}
                              <div className="relative flex space-x-4">
                                <div>
                                  <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-indigo-500">
                                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div className="flex-1">
                                    <p className="text-base text-gray-900 font-medium">
                                      Value Updated: <span className="font-semibold text-green-600">${event.value.toLocaleString()}</span>
                                    </p>
                                    {event.comment && event.comment.commentText && (
                                      <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                        "{event.comment.commentText}"
                                      </p>
                                    )}
                                    <p className="mt-2 text-sm text-gray-500">
                                      by {event.changedByUser.firstName} {event.changedByUser.lastName}
                                    </p>
                                  </div>
                                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                    <time dateTime={event.createdAt}>
                                      {new Date(event.createdAt).toLocaleDateString()}
                                    </time>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(event.createdAt).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'full' && activeTab === 'comments' && (
              <div className="space-y-4">
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Comments & Notes
                  </h3>

                  <div className="space-y-4">
                    {isLoadingAssetData ? (
                      <div className="text-center py-8">
                        <svg className="animate-spin mx-auto h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">Loading comments...</p>
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="mt-2 text-sm">No comments yet</p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-700">
                                  {comment.employee.firstName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900">
                                  {comment.employee.firstName} {comment.employee.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{comment.commentText}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'full' && activeTab === 'update' && (
              <div className="space-y-4">
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Asset Value
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-indigo-800">
                            Update Asset Value
                          </h3>
                          <div className="mt-2 text-sm text-indigo-700">
                            <p>Update the current value and depreciation rate. Add a comment to explain changes.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Current Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Value <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={updateForm.currentValue}
                          onChange={(e) => handleUpdateFormChange('currentValue', e.target.value)}
                          className="block w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Original purchase value: ${asset.purchaseValue.toLocaleString()}
                      </p>
                    </div>

                    {/* Depreciation Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Depreciation Rate (%) (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={updateForm.depreciationRate}
                        onChange={(e) => handleUpdateFormChange('depreciationRate', e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                        placeholder="20.00"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Current rate: {asset.depreciationRate}% per year
                      </p>
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={updateForm.comment}
                        onChange={(e) => handleUpdateFormChange('comment', e.target.value)}
                        rows={4}
                        placeholder="Add a comment explaining this value update..."
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Comments are required to maintain audit trail
                      </p>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        value={updateForm.notes}
                        onChange={(e) => handleUpdateFormChange('notes', e.target.value)}
                        rows={3}
                        placeholder="Add any additional notes or details..."
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                      />
                    </div>

                    {/* Update Button */}
                    <div className="flex space-x-3">
                      <button
                        onClick={handleValueUpdate}
                        disabled={isUpdating || !updateForm.currentValue || !updateForm.comment.trim()}
                        className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base transition-colors"
                      >
                        {isUpdating ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </span>
                        ) : (
                          'Update Asset Value'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed ${isMobile ? 'bottom-4 left-4 right-4' : 'top-4 right-4'} z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
            notification.type === 'success' ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'
          }`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className={`text-sm font-medium ${
                    notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={() => setNotification(null)}
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetDetailsDrawer;

