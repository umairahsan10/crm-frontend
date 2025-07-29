import { useState, useCallback, useEffect } from 'react';
import type { ChatMessage, ChatUser } from '../components/previous_components/ui/ChatBox';

export interface UseChatOptions {
  initialMessages?: ChatMessage[];
  currentUser: ChatUser;
  autoScroll?: boolean;
  maxMessages?: number;
  onMessageAdd?: (message: ChatMessage) => void;
  onMessageUpdate?: (messageId: string, updates: Partial<ChatMessage>) => void;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  currentUser: ChatUser;
  
  // Message operations
  addMessage: (message: Pick<ChatMessage, 'type' | 'content' | 'sender'> & Partial<Omit<ChatMessage, 'id' | 'timestamp' | 'type' | 'content' | 'sender'>>) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (messageId: string) => void;
  clearMessages: () => void;
  
  // Message utilities
  getMessage: (messageId: string) => ChatMessage | undefined;
  getMessagesByUser: (userId: string) => ChatMessage[];
  getMessagesByType: (type: ChatMessage['type']) => ChatMessage[];
  getLastMessage: () => ChatMessage | undefined;
  getUnreadCount: (userId?: string) => number;
  
  // User operations
  addUser: (user: ChatUser) => void;
  updateUser: (userId: string, updates: Partial<ChatUser>) => void;
  removeUser: (userId: string) => void;
  getUser: (userId: string) => ChatUser | undefined;
  
  // Chat utilities
  getChatStats: () => {
    totalMessages: number;
    totalUsers: number;
    messagesByType: Record<ChatMessage['type'], number>;
    messagesByUser: Record<string, number>;
    averageMessageLength: number;
  };
  
  // Event handlers
  handleSend: (content: string, type?: ChatMessage['type'], metadata?: ChatMessage['metadata']) => void;
  handleReceive: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  handleSystemMessage: (content: string) => void;
}

export const useChat = (options: UseChatOptions): UseChatReturn => {
  const { 
    initialMessages = [], 
    currentUser, 
    autoScroll = true, 
    maxMessages = 1000,
    onMessageAdd,
    onMessageUpdate
  } = options;
  
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [users, setUsers] = useState<{ [key: string]: ChatUser }>({
    [currentUser.id]: currentUser
  });

  // Helper function to generate unique message ID
  const generateMessageId = useCallback(() => {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Helper function to add message with auto-cleanup
  const addMessageWithCleanup = useCallback((newMessage: ChatMessage) => {
    setMessages(prev => {
      const updated = [...prev, newMessage];
      
      // Remove old messages if exceeding maxMessages
      if (updated.length > maxMessages) {
        return updated.slice(-maxMessages);
      }
      
      return updated;
    });
    
    if (onMessageAdd) {
      onMessageAdd(newMessage);
    }
  }, [maxMessages, onMessageAdd]);

  // Message operations
  const addMessage = useCallback((message: Pick<ChatMessage, 'type' | 'content' | 'sender'> & Partial<Omit<ChatMessage, 'id' | 'timestamp' | 'type' | 'content' | 'sender'>>) => {
    const newMessage: ChatMessage = {
      type: message.type,
      content: message.content,
      sender: message.sender,
      id: generateMessageId(),
      timestamp: new Date(),
      status: message.status || 'sent',
      metadata: message.metadata
    };
    
    addMessageWithCleanup(newMessage);
  }, [generateMessageId, addMessageWithCleanup]);

  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    );
    
    if (onMessageUpdate) {
      onMessageUpdate(messageId, updates);
    }
  }, [onMessageUpdate]);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Message utilities
  const getMessage = useCallback((messageId: string): ChatMessage | undefined => {
    return messages.find(msg => msg.id === messageId);
  }, [messages]);

  const getMessagesByUser = useCallback((userId: string): ChatMessage[] => {
    return messages.filter(msg => msg.sender.id === userId);
  }, [messages]);

  const getMessagesByType = useCallback((type: ChatMessage['type']): ChatMessage[] => {
    return messages.filter(msg => msg.type === type);
  }, [messages]);

  const getLastMessage = useCallback((): ChatMessage | undefined => {
    return messages[messages.length - 1];
  }, [messages]);

  const getUnreadCount = useCallback((userId?: string): number => {
    if (!userId) return 0;
    
    return messages.filter(msg => 
      msg.sender.id !== userId && 
      msg.status !== 'read' && 
      msg.type !== 'system'
    ).length;
  }, [messages]);

  // User operations
  const addUser = useCallback((user: ChatUser) => {
    setUsers(prev => ({
      ...prev,
      [user.id]: user
    }));
  }, []);

  const updateUser = useCallback((userId: string, updates: Partial<ChatUser>) => {
    setUsers(prev => ({
      ...prev,
      [userId]: { ...prev[userId], ...updates }
    }));
  }, []);

  const removeUser = useCallback((userId: string) => {
    setUsers(prev => {
      const newUsers = { ...prev };
      delete newUsers[userId];
      return newUsers;
    });
  }, []);

  const getUser = useCallback((userId: string): ChatUser | undefined => {
    return users[userId];
  }, [users]);

  // Chat utilities
  const getChatStats = useCallback(() => {
    const totalMessages = messages.length;
    const totalUsers = Object.keys(users).length;
    
    const messagesByType = messages.reduce((acc, msg) => {
      acc[msg.type] = (acc[msg.type] || 0) + 1;
      return acc;
    }, {} as Record<ChatMessage['type'], number>);
    
    const messagesByUser = messages.reduce((acc, msg) => {
      acc[msg.sender.id] = (acc[msg.sender.id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const averageMessageLength = messages.length > 0 
      ? messages.reduce((sum, msg) => sum + msg.content.length, 0) / messages.length
      : 0;
    
    return {
      totalMessages,
      totalUsers,
      messagesByType,
      messagesByUser,
      averageMessageLength
    };
  }, [messages, users]);

  // Event handlers
  const handleSend = useCallback((
    content: string, 
    type: ChatMessage['type'] = 'text', 
    metadata?: ChatMessage['metadata']
  ) => {
    addMessage({
      type,
      content,
      sender: currentUser,
      status: 'sending',
      metadata
    });
  }, [addMessage, currentUser]);

  const handleReceive = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    addMessage({
      type: message.type,
      content: message.content,
      sender: message.sender,
      status: 'delivered',
      metadata: message.metadata
    });
  }, [addMessage]);

  const handleSystemMessage = useCallback((content: string) => {
    addMessage({
      type: 'system',
      content,
      sender: {
        id: 'system',
        name: 'System',
        isOnline: false
      },
      status: 'sent'
    });
  }, [addMessage]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && messages.length > 0) {
      // This would typically scroll to the bottom of the chat
      // Implementation depends on the chat component
    }
  }, [autoScroll, messages]);

  return {
    messages,
    currentUser,
    
    // Message operations
    addMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    
    // Message utilities
    getMessage,
    getMessagesByUser,
    getMessagesByType,
    getLastMessage,
    getUnreadCount,
    
    // User operations
    addUser,
    updateUser,
    removeUser,
    getUser,
    
    // Chat utilities
    getChatStats,
    
    // Event handlers
    handleSend,
    handleReceive,
    handleSystemMessage
  };
};

// Convenience hooks for common chat types
export const useTeamChat = (options: Omit<UseChatOptions, 'currentUser'> & { currentUser: ChatUser }) => {
  return useChat({
    ...options,
    maxMessages: 500
  });
};

export const useSupportChat = (options: Omit<UseChatOptions, 'currentUser'> & { currentUser: ChatUser }) => {
  return useChat({
    ...options,
    maxMessages: 200
  });
};

export const useMinimalChat = (options: Omit<UseChatOptions, 'currentUser'> & { currentUser: ChatUser }) => {
  return useChat({
    ...options,
    maxMessages: 100
  });
}; 