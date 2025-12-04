import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatBox.css';

// Types
export type MessageType = 'text' | 'image' | 'file' | 'system';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
  };
  timestamp: Date;
  status?: MessageStatus;
  metadata?: {
    fileSize?: number;
    fileName?: string;
    fileType?: string;
    imageUrl?: string;
            imageAlt?: string;
        [key: string]: any;
      };
    [key: string]: any;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
      lastSeen?: Date;
    [key: string]: any;
}

// Size variants
export type ChatBoxSize = 'sm' | 'md' | 'lg';

// Theme variants
export type ChatBoxTheme = 'default' | 'minimal' | 'dark';

// Event types
export interface ChatEvent {
  type: 'send' | 'receive' | 'typing' | 'scroll' | 'message-click' | 'file-upload';
  message?: ChatMessage;
      data?: any;
}

// Props interface
export interface ChatBoxProps {
  // Core props
  messages: ChatMessage[];
  currentUser: ChatUser;
  
  // Display props
  title?: string;
  subtitle?: string;
  size?: ChatBoxSize;
  theme?: ChatBoxTheme;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  
  // Functionality props
  disabled?: boolean;
  showTyping?: boolean;
  typingUsers?: ChatUser[];
  showAvatars?: boolean;
  showTimestamps?: boolean;
  showStatus?: boolean;
  showHeader?: boolean;
  showInput?: boolean;
  
  // Input props
  placeholder?: string;
  sendButtonText?: string;
  enterToSend?: boolean;
  maxMessageLength?: number;
  allowFileUpload?: boolean;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  
  // Customization props
  className?: string;
  style?: React.CSSProperties;
  height?: string | number;
  width?: string | number;
  
  // Custom render props
  renderMessage?: (message: ChatMessage) => React.ReactNode;
  renderAvatar?: (user: ChatUser) => React.ReactNode;
  renderTyping?: (users: ChatUser[]) => React.ReactNode;
  renderHeader?: (title: string, subtitle?: string) => React.ReactNode;
  renderInput?: (props: {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    disabled: boolean;
  }) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  
  // Event handlers
  onSend?: (message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>) => void;
  onReceive?: (message: ChatMessage) => void;
  onTyping?: (isTyping: boolean) => void;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  onMessageClick?: (message: ChatMessage) => void;
  onFileUpload?: (file: File) => void;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  
      // Custom props
    [key: string]: any;
}

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  currentUser,
  title = 'Chat',
  subtitle,
  size = 'md',
  theme = 'default',
  loading = false,
  emptyMessage = 'No messages yet',
  emptyIcon = '💬',
  disabled = false,
  showTyping = true,
  typingUsers = [],
  showAvatars = true,
  showTimestamps = true,
  showStatus = true,
  showHeader = true,
          showInput = true,
        placeholder = 'Type a message...',
        sendButtonText = 'Send',
        enterToSend = true,
        maxMessageLength,
  allowFileUpload = false,
  allowedFileTypes = ['image/*', 'application/pdf', 'text/*'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  className = '',
  style = {},
  height = '500px',
  width = '100%',
  renderMessage,
  renderAvatar,
  renderTyping,
  renderHeader,
  renderInput,
  renderEmpty,
  renderLoading,
          onSend,
        onReceive,
        onTyping,
  onScroll,
  onMessageClick,
  onFileUpload,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...restProps
}) => {
  // State management
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<number | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Typing indicator
  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    if (isTyping) {
      const timeout = setTimeout(() => {
        setIsTyping(false);
        if (onTyping) {
          onTyping(false);
        }
      }, 1000);
      
      setTypingTimeout(timeout);
    }
    
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [isTyping, onTyping, typingTimeout]);
  
  // Event handlers
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    
    if (!isTyping && onTyping) {
      setIsTyping(true);
      onTyping(true);
    }
    
    // Reset typing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const timeout = setTimeout(() => {
      setIsTyping(false);
      if (onTyping) {
        onTyping(false);
      }
    }, 1000);
    
    setTypingTimeout(timeout);
  }, [isTyping, onTyping, typingTimeout]);
  
  const handleSend = useCallback(() => {
    if (!inputValue.trim() || disabled || !onSend) return;
    
    const message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'> = {
      type: 'text',
      content: inputValue.trim(),
      sender: currentUser,
      metadata: {}
    };
    
    onSend(message);
    setInputValue('');
    setIsTyping(false);
    
    if (onTyping) {
      onTyping(false);
    }
  }, [inputValue, disabled, onSend, currentUser, onTyping]);
  
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey && enterToSend) {
      event.preventDefault();
      handleSend();
    }
  }, [handleSend, enterToSend]);
  
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onFileUpload) return;
    
    // Check file size
    if (file.size > maxFileSize) {
      alert(`File size must be less than ${formatFileSize(maxFileSize)}`);
      return;
    }
    
    // Check file type
    const isAllowed = allowedFileTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -2));
      }
      return file.type === type;
    });
    
    if (!isAllowed) {
      alert('File type not allowed');
      return;
    }
    
    onFileUpload(file);
    event.target.value = '';
  }, [onFileUpload, maxFileSize, allowedFileTypes]);
  
  const handleMessageClick = useCallback((message: ChatMessage) => {
    if (onMessageClick) {
      onMessageClick(message);
    }
  }, [onMessageClick]);
  
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    if (onScroll) {
      onScroll(event);
    }
  }, [onScroll]);
  
  // Render functions
  const renderDefaultAvatar = useCallback((user: ChatUser) => (
    <div
      className="chatbox__message-avatar"
      style={user.avatar ? { backgroundImage: `url(${user.avatar})` } : {}}
      title={user.name}
    >
      {!user.avatar && getInitials(user.name)}
    </div>
  ), []);
  
  const renderDefaultMessage = useCallback((message: ChatMessage) => {
    const isOwnMessage = message.sender.id === currentUser.id;
    const messageClass = isOwnMessage ? 'chatbox__message--sent' : 'chatbox__message--received';
    
    if (message.type === 'system') {
      return (
        <div className="chatbox__message chatbox__message--system">
          <div className="chatbox__message-bubble">
            {message.content}
          </div>
        </div>
      );
    }
    
    return (
      <div 
        className={`chatbox__message ${messageClass}`}
        onClick={() => handleMessageClick(message)}
      >
        {showAvatars && !isOwnMessage && (
          renderAvatar ? renderAvatar(message.sender) : renderDefaultAvatar(message.sender)
        )}
        
        <div className="chatbox__message-content">
          {!isOwnMessage && showAvatars && (
            <div className="chatbox__message-sender">{message.sender.name}</div>
          )}
          
          <div className="chatbox__message-bubble">
            {message.type === 'text' && message.content}
            
            {message.type === 'image' && (
              <img
                src={message.metadata?.imageUrl || message.content}
                alt={message.metadata?.imageAlt || 'Image'}
                className="chatbox__message-image"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle image click (e.g., open in modal)
                }}
              />
            )}
            
            {message.type === 'file' && (
              <div className="chatbox__message-file">
                <div className="chatbox__message-file-icon">📎</div>
                <div className="chatbox__message-file-info">
                  <div className="chatbox__message-file-name">
                    {message.metadata?.fileName || 'File'}
                  </div>
                  {message.metadata?.fileSize && (
                    <div className="chatbox__message-file-size">
                      {formatFileSize(message.metadata.fileSize)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {showTimestamps && (
            <div className="chatbox__message-time">
              {formatTime(message.timestamp)}
              {showStatus && message.status && (
                <span style={{ marginLeft: '4px' }}>
                  {message.status === 'sent' && '✓'}
                  {message.status === 'delivered' && '✓✓'}
                  {message.status === 'read' && '✓✓'}
                  {message.status === 'error' && '⚠️'}
                </span>
              )}
            </div>
          )}
        </div>
        
        {showAvatars && isOwnMessage && (
          renderAvatar ? renderAvatar(message.sender) : renderDefaultAvatar(message.sender)
        )}
      </div>
    );
  }, [
    currentUser.id,
    showAvatars,
    showTimestamps,
    showStatus,
    renderAvatar,
    renderDefaultAvatar,
    handleMessageClick
  ]);
  
  const renderDefaultTyping = useCallback((users: ChatUser[]) => (
    <div className="chatbox__typing">
      <span>{users.map(u => u.name).join(', ')} is typing</span>
      <div className="chatbox__typing-dots">
        <div className="chatbox__typing-dot"></div>
        <div className="chatbox__typing-dot"></div>
        <div className="chatbox__typing-dot"></div>
      </div>
    </div>
  ), []);
  
  const renderDefaultHeader = useCallback((title: string, subtitle?: string) => (
    <div className="chatbox__header">
      <div>
        <h3 className="chatbox__header-title">
          💬 {title}
        </h3>
        {subtitle && <p className="chatbox__header-subtitle">{subtitle}</p>}
      </div>
      <div className="chatbox__header-actions">
        <button
          type="button"
          className="chatbox__header-action"
          onClick={() => messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
        >
          ↑
        </button>
        <button
          type="button"
          className="chatbox__header-action"
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Scroll to bottom"
        >
          ↓
        </button>
      </div>
    </div>
  ), []);
  
  const renderDefaultInput = useCallback((props: {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    disabled: boolean;
  }) => (
    <div className="chatbox__input-area">
      <div className="chatbox__input-container">
        <textarea
          className="chatbox__input"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={props.disabled}
          rows={1}
          style={{
            resize: 'none',
            overflow: 'hidden'
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
          }}
        />
        
        <div className="chatbox__input-actions">
          {allowFileUpload && (
            <button
              type="button"
              className="chatbox__input-action"
              onClick={() => fileInputRef.current?.click()}
              disabled={props.disabled}
              aria-label="Upload file"
            >
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
          )}
          
          <button
            type="button"
            className="chatbox__input-action chatbox__input-action--send"
            onClick={props.onSend}
            disabled={props.disabled || !props.value.trim()}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
      
      {allowFileUpload && (
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          accept={allowedFileTypes.join(',')}
        />
      )}
    </div>
  ), [placeholder, allowFileUpload, allowedFileTypes, handleKeyPress, handleFileUpload]);
  
  const renderDefaultEmpty = useCallback(() => (
    <div className="chatbox__messages--empty">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>{emptyIcon}</div>
        <p>{emptyMessage}</p>
      </div>
    </div>
  ), [emptyIcon, emptyMessage]);
  
  const renderDefaultLoading = useCallback(() => (
    <div className="chatbox__messages--empty">
      <div style={{ textAlign: 'center' }}>
        <div className="chatbox__loading-spinner" style={{ margin: '0 auto 16px' }}></div>
        <p>Loading messages...</p>
      </div>
    </div>
  ), []);
  
  // Build CSS classes
  const cssClasses = [
    'chatbox',
    `chatbox--${size}`,
    `chatbox--${theme}`,
    className
  ].filter(Boolean).join(' ');
  
  // Don't render if loading
  if (loading) {
    return (
      <div className={cssClasses} style={{ ...style, height, width }} {...restProps}>
        {renderLoading ? renderLoading() : renderDefaultLoading()}
      </div>
    );
  }
  
  return (
    <div
      className={cssClasses}
      style={{ ...style, height, width }}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      role="region"
      {...restProps}
    >
      {/* Header */}
      {showHeader && (
        renderHeader ? renderHeader(title, subtitle) : renderDefaultHeader(title, subtitle)
      )}
      
      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className={`chatbox__messages ${messages.length === 0 ? 'chatbox__messages--empty' : ''}`}
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          renderEmpty ? renderEmpty() : renderDefaultEmpty()
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id}>
                {renderMessage ? renderMessage(message) : renderDefaultMessage(message)}
              </div>
            ))}
            
            {/* Typing indicator */}
            {showTyping && typingUsers.length > 0 && (
              renderTyping ? renderTyping(typingUsers) : renderDefaultTyping(typingUsers)
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Input */}
      {showInput && (
        renderInput ? 
          renderInput({
            value: inputValue,
            onChange: handleInputChange,
            onSend: handleSend,
            disabled: disabled
          }) : 
          renderDefaultInput({
            value: inputValue,
            onChange: handleInputChange,
            onSend: handleSend,
            disabled: disabled
          })
      )}
    </div>
  );
};

export default ChatBox; 