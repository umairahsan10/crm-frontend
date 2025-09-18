import { useState, useEffect, useCallback } from 'react';
import type { 
  ProjectChat, 
  ChatMessage, 
  ChatParticipant, 
  ChatUser, 
  CreateChatData
} from '../components/common/chat/types';
import { mockChatData } from '../apis/chat';

// Custom hook for chat functionality
export const useChat = (currentUser: ChatUser) => {
  const [chats, setChats] = useState<ProjectChat[]>([]);
  const [currentChat, setCurrentChat] = useState<ProjectChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chats on component mount
  const loadChats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For now, use mock data. Replace with actual API call when backend is ready
      setChats(mockChatData.chats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, []);

  // Select a chat
  const selectChat = useCallback(async (chatId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setCurrentChat(chat);
        setMessages(chat.chatMessages || []);
        setParticipants(chat.chatParticipants || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select chat');
    } finally {
      setLoading(false);
    }
  }, [chats]);

  // Send a message
  const sendMessage = useCallback(async (message: string) => {
    if (!currentChat || !message.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create new message object
      const newMessage: ChatMessage = {
        id: Date.now(), // Temporary ID
        chatId: currentChat.id,
        senderId: currentUser.id,
        message: message.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: currentUser
      };
      
      // Add message to current messages
      setMessages(prev => [...prev, newMessage]);
      
      // Update chat's last message
      setCurrentChat(prev => prev ? {
        ...prev,
        updatedAt: new Date().toISOString(),
        chatMessages: [...(prev.chatMessages || []), newMessage]
      } : null);
      
      // Update chats list
      setChats(prev => prev.map(chat => 
        chat.id === currentChat.id 
          ? { ...chat, updatedAt: new Date().toISOString() }
          : chat
      ));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }, [currentChat, currentUser]);

  // Create a new chat
  const createChat = useCallback(async (data: CreateChatData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Create new chat object
      const newChat: ProjectChat = {
        id: Date.now(), // Temporary ID
        projectId: data.projectId,
        participants: data.participantIds.length + 1, // +1 for current user
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        project: data.projectId ? { id: data.projectId, description: 'Project', status: 'in_progress' } : undefined,
        chatMessages: data.message ? [{
          id: Date.now(),
          chatId: Date.now(),
          senderId: currentUser.id,
          message: data.message,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sender: currentUser
        }] : [],
        chatParticipants: [
          {
            id: Date.now(),
            chatId: Date.now(),
            employeeId: currentUser.id,
            memberType: 'owner',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            employee: currentUser
          }
        ]
      };
      
      setChats(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
      setMessages(newChat.chatMessages || []);
      setParticipants(newChat.chatParticipants || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Add participant to current chat
  const addParticipant = useCallback(async (employeeId: number) => {
    if (!currentChat) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Find employee from mock data
      const employee = mockChatData.users.find(u => u.id === employeeId);
      if (!employee) throw new Error('Employee not found');
      
      const newParticipant: ChatParticipant = {
        id: Date.now(),
        chatId: currentChat.id,
        employeeId: employeeId,
        memberType: 'participant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        employee: employee
      };
      
      setParticipants(prev => [...prev, newParticipant]);
      
      // Update current chat
      setCurrentChat(prev => prev ? {
        ...prev,
        participants: (prev.participants || 0) + 1,
        chatParticipants: [...(prev.chatParticipants || []), newParticipant]
      } : null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add participant');
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // Remove participant from current chat
  const removeParticipant = useCallback(async (participantId: number) => {
    if (!currentChat) return;
    
    setLoading(true);
    setError(null);
    
    try {
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      
      // Update current chat
      setCurrentChat(prev => prev ? {
        ...prev,
        participants: Math.max(0, (prev.participants || 0) - 1),
        chatParticipants: (prev.chatParticipants || []).filter(p => p.id !== participantId)
      } : null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove participant');
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // Transfer chat to another employee
  const transferChat = useCallback(async (toEmployeeId: number) => {
    if (!currentChat) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Find employee from mock data
      const employee = mockChatData.users.find(u => u.id === toEmployeeId);
      if (!employee) throw new Error('Employee not found');
      
      // Update current chat
      setCurrentChat(prev => prev ? {
        ...prev,
        transferredTo: toEmployeeId,
        transferredToEmployee: employee,
        updatedAt: new Date().toISOString()
      } : null);
      
      // Update chats list
      setChats(prev => prev.map(chat => 
        chat.id === currentChat.id 
          ? { 
              ...chat, 
              transferredTo: toEmployeeId,
              transferredToEmployee: employee,
              updatedAt: new Date().toISOString() 
            }
          : chat
      ));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transfer chat');
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
    transferChat
  };
};
