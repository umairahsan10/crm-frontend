
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { MessageInputProps } from './types';
import { getAuthData } from '../../../utils/cookieUtils';


const ALLOWED_FILE_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv'
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const MessageInput: React.FC<MessageInputProps & { chatId?: number }> = ({
  onSendMessage,
  onTypingChange,
  disabled = false,
  placeholder = 'Type a message...',
  maxLength = 1000,
  chatId
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      // Notify parent component that user started typing
      onTypingChange?.(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Notify parent component that user stopped typing
      onTypingChange?.(false);
    }, 2000);
  }, [isTyping, onTypingChange]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    if (maxLength && value.length > maxLength) {
      return;
    }
    
    setMessage(value);
    handleTyping();
  };

  // Handle send message
  const handleSend = async () => {
    if (message.trim() && !disabled && !isSending) {
      setIsSending(true);
      setError(null);
      
      try {
        await onSendMessage(message.trim());
        setMessage('');
        setIsTyping(false);
        // Notify parent that user stopped typing
        onTypingChange?.(false);
        
        // Clear typing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
        setError(errorMessage);
      } finally {
        setIsSending(false);
      }
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle paste (support base64 image)
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    let handledImage = false;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          console.debug('[MessageInput] Detected pasted image:', file);
          setFileUploading(true);
          setUploadProgress(0);
          try {
            const endpoint = 'http://localhost:3000/chat-messages/upload';
            const formData = new FormData();
            formData.append('file', file);
            formData.append('chatId', String(chatId));
            const xhr = new XMLHttpRequest();
            xhr.open('POST', endpoint, true);
            const { token } = getAuthData();
            if (token) {
              xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                setUploadProgress(Math.round((event.loaded / event.total) * 100));
              }
            };
            xhr.onreadystatechange = async () => {
              if (xhr.readyState === 4) {
                setFileUploading(false);
                setUploadProgress(null);
                if (xhr.status === 200) {
                  const res = JSON.parse(xhr.responseText);
                  if (res.success && res.data && res.data.url) {
                    // Send image message to chat
                    onSendMessage({
                      attachmentUrl: res.data.url,
                      attachmentType: file.type,
                      attachmentName: file.name,
                      attachmentSize: file.size
                    });
                  } else {
                    setError(res.message || 'Image upload failed');
                  }
                } else {
                  let errMsg = 'Image upload failed';
                  try {
                    const res = JSON.parse(xhr.responseText);
                    errMsg = res.message || errMsg;
                  } catch {}
                  setError(errMsg);
                }
              }
            };
            xhr.onerror = () => {
              setFileUploading(false);
              setUploadProgress(null);
              setError('Image upload failed');
            };
            xhr.send(formData);
          } catch (err) {
            setFileUploading(false);
            setUploadProgress(null);
            setError('Image upload failed');
          }
          handledImage = true;
          e.preventDefault();
          return;
        }
      }
    }
    if (!handledImage) {
      // Fallback: handle text paste
      const pastedText = e.clipboardData.getData('text');
      if (maxLength && message.length + pastedText.length > maxLength) {
        e.preventDefault();
        const remainingLength = maxLength - message.length;
        const truncatedText = pastedText.substring(0, remainingLength);
        setMessage(prev => prev + truncatedText);
      }
    }
  };

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file, false);
    }
    e.target.value = '';
  };

  // File upload logic
  const handleFileUpload = async (file: File, isBase64Paste: boolean) => {
    setError(null);
    setFileUploading(true);
    setUploadProgress(0);
    // Validate file type and size
    if (!isBase64Paste && (!ALLOWED_FILE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE)) {
      setError('Invalid file type or file too large (max 10MB).');
      setFileUploading(false);
      setUploadProgress(null);
      return;
    }
    try {
      const endpoint = 'http://localhost:3000/chat-messages/upload';
      if (isBase64Paste) {
        // Convert image to base64 and send as JSON
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64Data = reader.result as string;
          try {
            const { token } = getAuthData();
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                imageData: base64Data,
                chatId: chatId
              })
            });
            setFileUploading(false);
            setUploadProgress(null);
            const res = await response.json();
            if (response.status === 200 && res.success && res.data && res.data.url) {
              // Send image message to chat
              onSendMessage({
                attachmentUrl: res.data.url,
                attachmentType: file.type,
                attachmentName: file.name,
                attachmentSize: file.size
              });
            } else {
              setError(res.message || 'File upload failed');
            }
          } catch (err) {
            setFileUploading(false);
            setUploadProgress(null);
            setError('File upload failed');
          }
        };
        reader.onerror = () => {
          setFileUploading(false);
          setUploadProgress(null);
          setError('Error reading image');
        };
      } else {
        // Regular file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('chatId', String(chatId));
        const xhr = new XMLHttpRequest();
        xhr.open('POST', endpoint, true);
        const { token } = getAuthData();
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onreadystatechange = async () => {
          if (xhr.readyState === 4) {
            setFileUploading(false);
            setUploadProgress(null);
            if (xhr.status === 200) {
              const res = JSON.parse(xhr.responseText);
              if (res.success && res.data && res.data.url) {
                // Send file message to chat
                onSendMessage({
                  attachmentUrl: res.data.url,
                  attachmentType: file.type,
                  attachmentName: file.name,
                  attachmentSize: file.size
                });
              } else {
                setError(res.message || 'File upload failed');
              }
            } else {
              let errMsg = 'File upload failed';
              try {
                const res = JSON.parse(xhr.responseText);
                errMsg = res.message || errMsg;
              } catch {}
              setError(errMsg);
            }
          }
        };
        xhr.onerror = () => {
          setFileUploading(false);
          setUploadProgress(null);
          setError('File upload failed');
        };
        xhr.send(formData);
      }
    } catch (err) {
      setFileUploading(false);
      setUploadProgress(null);
      setError('File upload failed');
    }
  };
  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const canSend = message.trim().length > 0 && !disabled && !isSending && !fileUploading;
  const remainingChars = maxLength ? maxLength - message.length : null;

  return (
    <div className="relative px-3 py-2 bg-gray-50 border-t border-gray-200 flex-shrink-0">
      {/* Error message display */}
      {error && (
        <div className="mb-2 px-2 py-1.5 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-500 flex-shrink-0">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M15 9l-6 6m0-6l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-xs text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Upload progress bar */}
      {fileUploading && uploadProgress !== null && (
        <div className="mb-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-blue-500 h-2 transition-all" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}

      <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-full px-3 py-1 transition-colors focus-within:border-blue-500 focus-within:shadow-[0_0_0_2px_rgba(59,130,246,0.1)]">
        <div className="flex-1 relative flex flex-col">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={disabled || fileUploading}
            className="w-full border-none outline-none bg-transparent text-[13px] leading-tight resize-none min-h-[18px] max-h-[100px] font-inherit text-gray-900 placeholder:text-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed"
            rows={1}
            maxLength={maxLength}
          />

          {remainingChars !== null && remainingChars < 100 && (
            <div className="absolute -bottom-5 right-0 text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
              {remainingChars}
            </div>
          )}
        </div>

        {/* File upload button with larger clip icon and tooltip */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-1">
          <button
            type="button"
            className="flex items-center justify-center w-10 h-10 bg-gray-100 text-blue-600 border-none rounded-full cursor-pointer shadow hover:bg-blue-100 active:scale-95 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || fileUploading}
            aria-label="Attach file"
            title="Attach file"
          >
            {/* Paperclip SVG icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16.5 13.5L8.914 21.086a5 5 0 01-7.072-7.072l10-10a5 5 0 017.072 7.072L10.5 19.5"
              />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            accept={ALLOWED_FILE_TYPES.join(',')}
            onChange={handleFileChange}
            disabled={disabled || fileUploading}
          />

          <button
            onClick={handleSend}
            disabled={!canSend}
            className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white border-none rounded-full cursor-pointer transition-all hover:bg-blue-600 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
            type="button"
            aria-label={isSending ? "Sending message..." : "Send message"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>

      {disabled && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center">
          <span className="text-xs text-gray-500 font-medium">
            Chat is disabled
          </span>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
