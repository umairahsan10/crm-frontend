import { useState, useEffect, useCallback } from 'react';
import type { 
  ProjectChat, 
  ChatMessage, 
  ChatParticipant, 
  ChatUser, 
  CreateChatData
} from '../components/common/chat/types';
import { chatApi } from '../apis/chat';

// Custom hook for chat functionality
export const useChat = (currentUser: ChatUser) => {
  const [chats, setChats] = useState<ProjectChat[]>([]);
  const [currentChat, setCurrentChat] = useState<ProjectChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chats on component mount - fetches all chats where user is a participant
  const loadChats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await chatApi.getChats();
      setChats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats');
      console.error('Failed to load chats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Select a chat and load its messages and participants
  const selectChat = useCallback(async (chatId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Find chat from existing list
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setCurrentChat(chat);
      }

      // Load messages for this chat
      const messagesData = await chatApi.getMessages(chatId, 50, 0);
      setMessages(messagesData.messages);

      // Load participants for this chat
      const participantsData = await chatApi.getParticipants(chatId);
      setParticipants(participantsData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select chat');
      console.error('Failed to select chat:', err);
    } finally {
      setLoading(false);
    }
  }, [chats]);

  // Send a message
  const sendMessage = useCallback(async (message: string) => {
    if (!currentChat || !message.trim()) return;
    
    setError(null);
    
    try {
      // Send message to backend
      const newMessage = await chatApi.sendMessage(currentChat.id, message.trim());
      
      // Add message to current messages
      setMessages(prev => [...prev, newMessage]);
      
      // Update chat's last message in the list
      setChats(prev => prev.map(chat => 
        chat.id === currentChat.id 
          ? { 
              ...chat, 
              updatedAt: newMessage.createdAt,
              chatMessages: [newMessage] // Update with latest message
            }
          : chat
      ));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Failed to send message:', err);
    }
  }, [currentChat]);

  // Create a new chat (typically done automatically, but available for manual creation)
  const createChat = useCallback(async (data: CreateChatData) => {
    setLoading(true);
    setError(null);
    
    try {
      // This would require a proper create chat endpoint
      console.log('Create chat functionality not yet implemented on backend', data);
      
      // Reload chats to get the new one
      await loadChats();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat');
      console.error('Failed to create chat:', err);
    } finally {
      setLoading(false);
    }
  }, [loadChats]);

  // Add participant to current chat (Owner only)
  const addParticipant = useCallback(async (employeeId: number) => {
    if (!currentChat) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newParticipant = await chatApi.addParticipant(currentChat.id, employeeId);
      
      // Add to participants list
      setParticipants(prev => [...prev, newParticipant]);
      
      // Update current chat participant count
      setCurrentChat(prev => prev ? {
        ...prev,
        participants: (prev.participants || 0) + 1
      } : null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add participant');
      console.error('Failed to add participant:', err);
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // Remove participant from current chat (Owner only)
  const removeParticipant = useCallback(async (participantId: number) => {
    if (!currentChat) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await chatApi.removeParticipant(participantId);
      
      // Remove from participants list
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      
      // Update current chat participant count
      setCurrentChat(prev => prev ? {
        ...prev,
        participants: Math.max(0, (prev.participants || 0) - 1)
      } : null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove participant');
      console.error('Failed to remove participant:', err);
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // Transfer chat to another employee (kept for future use)
  const transferChat = useCallback(async (toEmployeeId: number) => {
    if (!currentChat) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Transfer chat functionality not yet implemented', toEmployeeId);
      // This would require a transfer endpoint
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transfer chat');
      console.error('Failed to transfer chat:', err);
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return {
    chats,
    currentChat,
    messages,
    participants,
    loading,
    error,
    selectChat,
    sendMessage,
    createChat,
    addParticipant,
    removeParticipant,
    transferChat,
    refreshChats: loadChats
  };
};
