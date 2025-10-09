import React from 'react';

interface RemoveParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  participantName: string;
  isRemoving?: boolean;
}

const RemoveParticipantModal: React.FC<RemoveParticipantModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  participantName,
  isRemoving = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 m-0">Remove Participant</h2>
          <button
            onClick={onClose}
            disabled={isRemoving}
            className="flex items-center justify-center w-8 h-8 bg-gray-100 border-none rounded-md cursor-pointer text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-600">
                <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-medium text-gray-900 mb-2">
                Remove {participantName}?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                This will remove <strong>{participantName}</strong> from the chat. They will no longer be able to see messages or participate in the conversation.
              </p>
              <p className="text-xs text-gray-500">
                This action cannot be undone. You can add them back later if needed.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isRemoving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isRemoving}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border-none rounded-md cursor-pointer transition-all hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-2 focus:outline-red-500 focus:outline-offset-2 flex items-center gap-2"
          >
            {isRemoving && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isRemoving ? 'Removing...' : 'Remove Participant'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveParticipantModal;
