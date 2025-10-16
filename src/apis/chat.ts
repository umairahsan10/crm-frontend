import type { 
  ProjectChat, 
  ChatMessage, 
  ChatParticipant, 
  ChatUser
} from '../components/common/chat/types';
import { apiClient } from '../services/apiClient';

// ============================================
// CHAT API
// ============================================

export const chatApi = {
  // Get all chats for current user
  getChats: async (): Promise<ProjectChat[]> => {
    console.log('📤 [CHAT API] Fetching all chats');
    
    const response = await apiClient.get<ProjectChat[]>('/project-chats');
    return response.data || [];
  },

  // Get specific chat by ID
  getChatById: async (chatId: number): Promise<ProjectChat> => {
    console.log('📤 [CHAT API] Fetching chat by ID:', chatId);
    
    const response = await apiClient.get<ProjectChat>(`/project-chats/${chatId}`);
    return response.data!;
  },

  // Create new chat
  createChat: async (chatData: { 
    name: string; 
    description?: string; 
    participantIds: number[] 
  }): Promise<ProjectChat> => {
    console.log('📤 [CHAT API] Creating chat:', chatData);
    
    const response = await apiClient.post<ProjectChat>('/project-chats', chatData);
    return response.data!;
  },

  // Update chat details
  updateChat: async (chatId: number, updates: { 
    name?: string; 
    description?: string 
  }): Promise<ProjectChat> => {
    console.log('📤 [CHAT API] Updating chat:', chatId, updates);
    
    const response = await apiClient.patch<ProjectChat>(`/project-chats/${chatId}`, updates);
    return response.data!;
  },

  // Delete chat
  deleteChat: async (chatId: number): Promise<void> => {
    console.log('📤 [CHAT API] Deleting chat:', chatId);
    
    await apiClient.delete(`/project-chats/${chatId}`);
  },

  // Get messages for a chat
  getMessages: async (chatId: number): Promise<ChatMessage[]> => {
    console.log('📤 [CHAT API] Fetching messages for chat:', chatId);
    
    const response = await apiClient.get<ChatMessage[]>(`/project-chats/${chatId}/messages`);
    return response.data || [];
  },

  // Send message
  sendMessage: async (chatId: number, content: string): Promise<ChatMessage> => {
    console.log('📤 [CHAT API] Sending message to chat:', chatId);
    
    const response = await apiClient.post<ChatMessage>(
      `/project-chats/${chatId}/messages`, 
      { content }
    );
    return response.data!;
  },

  // Delete message
  deleteMessage: async (chatId: number, messageId: number): Promise<void> => {
    console.log('📤 [CHAT API] Deleting message:', messageId, 'from chat:', chatId);
    
    await apiClient.delete(`/project-chats/${chatId}/messages/${messageId}`);
  },

  // Get participants for a chat
  getParticipants: async (chatId: number): Promise<ChatParticipant[]> => {
    console.log('📤 [CHAT API] Fetching participants for chat:', chatId);
    
    const response = await apiClient.get<ChatParticipant[]>(`/project-chats/${chatId}/participants`);
    return response.data || [];
  },

  // Add participant to chat
  addParticipant: async (chatId: number, userId: number): Promise<ChatParticipant> => {
    console.log('📤 [CHAT API] Adding participant:', userId, 'to chat:', chatId);
    
    const response = await apiClient.post<ChatParticipant>(
      `/project-chats/${chatId}/participants`,
      { userId }
    );
    return response.data!;
  },

  // Remove participant from chat
  removeParticipant: async (chatId: number, userId: number): Promise<void> => {
    console.log('📤 [CHAT API] Removing participant:', userId, 'from chat:', chatId);
    
    await apiClient.delete(`/project-chats/${chatId}/participants/${userId}`);
  },

  // Get available users to add to chat
  getAvailableUsers: async (): Promise<ChatUser[]> => {
    console.log('📤 [CHAT API] Fetching available users');
    
    const response = await apiClient.get<ChatUser[]>('/employees/chat-users');
    return response.data || [];
  },

  // Mark messages as read
  markAsRead: async (chatId: number): Promise<void> => {
    console.log('📤 [CHAT API] Marking messages as read for chat:', chatId);
    
    await apiClient.post(`/project-chats/${chatId}/read`, {});
  },
};

// Mock data for development/testing (kept for backward compatibility)
export const mockChatData = {
  chats: [] as ProjectChat[],
  messages: {} as Record<number, ChatMessage[]>,
};
