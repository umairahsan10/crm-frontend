import type { 
  ProjectChat, 
  ChatMessage, 
  ChatParticipant, 
  ChatUser
} from '../components/common/chat/types';
import { apiGetJson, apiPostJson, apiDeleteJson } from '../utils/apiClient';

// Chat API functions
export const chatApi = {
  // Get all chats for current user (participant-based filtering happens on backend)
  getChats: async (): Promise<ProjectChat[]> => {
    console.log('🔵 Fetching chats from: /project-chats');

    const data = await apiGetJson<ProjectChat[]>('/project-chats');
    console.log('✅ Chats received:', data.length, 'chats');
    
    return data;
  },

  // Get specific chat by ID
  getChat: async (chatId: number): Promise<ProjectChat> => {
    const data = await apiGetJson<ProjectChat>(`/project-chats/${chatId}`);
    return data;
  },

  // Get messages for a chat
  getMessages: async (chatId: number, limit = 50, offset = 0): Promise<{ messages: ChatMessage[]; total: number; limit: number; offset: number }> => {
    console.log('🔵 Fetching messages for chat:', chatId);
    console.log('🔵 URL:', `/chat-messages/chat/${chatId}?limit=${limit}&offset=${offset}`);

    const data = await apiGetJson<{ messages: ChatMessage[]; total: number; limit: number; offset: number }>(`/chat-messages/chat/${chatId}?limit=${limit}&offset=${offset}`);
    console.log('✅ Messages received:', data.messages?.length || 0, 'messages');
    
    return data;
  },

  // Send message to chat
  sendMessage: async (chatId: number, content: string): Promise<ChatMessage> => {
    console.log('🔵 Sending message to chat:', chatId);
    console.log('📤 Message content:', content);
    
    // Request body matches backend specification
    const requestBody = { 
      chatId,
      content
    };
    
    console.log('📤 Request body:', JSON.stringify(requestBody));

    const responseData = await apiPostJson<any>('/chat-messages', requestBody);
    console.log('📥 Raw response:', responseData);
    
    // Extract the message data from the backend response format
    const messageData = responseData.data || responseData;
    console.log('✅ Message sent successfully:', messageData);
    
    return messageData;
  },

  // Get chat participants
  getParticipants: async (chatId: number): Promise<ChatParticipant[]> => {
    const data = await apiGetJson<ChatParticipant[]>(`/chat-participants/chat/${chatId}`);
    return data;
  },

  // Add participant to chat (Owner only)
  addParticipant: async (chatId: number, employeeId: number): Promise<ChatParticipant> => {
    const data = await apiPostJson<ChatParticipant>('/chat-participants', { 
      chatId,
      employeeId,
      memberType: 'participant'
    });
    return data;
  },

  // Remove participant from chat (Owner only)
  removeParticipant: async (participantId: number): Promise<void> => {
    await apiDeleteJson<void>(`/chat-participants/${participantId}`);
  },

  // Get available employees
  getAvailableEmployees: async (): Promise<ChatUser[]> => {
    try {
      console.log('🔵 Fetching employees from /employee/all-employees...');
      
      const responseData = await apiGetJson<any>('/employee/all-employees');
      console.log('📥 Raw response from /employee/all-employees:', responseData);

      // Extract employees from the response
      const employeesData = responseData.data || [];
      console.log('📊 Found employees:', employeesData.length);

      // Transform the employee data to ChatUser format
      const employees: ChatUser[] = employeesData.map((emp: any) => ({
        id: emp.id,
        firstName: emp.firstName || '',
        lastName: emp.lastName || '',
        email: emp.email || '',
        avatar: '/default-avatar.svg', // Default avatar since not provided in API
        department: emp.department?.name || '',
        role: emp.role?.name || ''
      }));

      console.log('✅ Employees transformed successfully:', employees.length);
      return employees;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load employees';
      console.error('❌ Failed to load employees:', errorMessage);
      
      // Check if it's a permission error
      if (errorMessage.includes('Forbidden') || errorMessage.includes('403')) {
        throw new Error('You need Department Manager or Unit Head role to access employee data. Contact your administrator for access.');
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        throw new Error('Authentication required. Please log in again.');
      } else {
        throw new Error(`Unable to load employee list: ${errorMessage}`);
      }
    }
  }
};

// Mock data for development/testing
export const mockChatData = {
  users: [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      avatar: '/default-avatar.svg',
      department: 'Sales',
      role: 'Senior Sales Rep'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      avatar: '/default-avatar.svg',
      department: 'Marketing',
      role: 'Marketing Manager'
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@company.com',
      avatar: '/default-avatar.svg',
      department: 'Development',
      role: 'Senior Developer'
    }
  ] as ChatUser[],

  chats: [
    {
      id: 1,
      projectId: 1,
      participants: 3,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
      project: {
        id: 1,
        description: 'E-commerce Platform Development',
        status: 'in_progress'
      },
      chatMessages: [
        {
          id: 1,
          chatId: 1,
          senderId: 1,
          message: 'Hey team, how is the project going?',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          sender: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@company.com',
            avatar: '/default-avatar.svg',
            department: 'Sales',
            role: 'Senior Sales Rep'
          }
        },
        {
          id: 2,
          chatId: 1,
          senderId: 2,
          message: 'Great! We are making good progress on the frontend.',
          createdAt: '2024-01-15T10:05:00Z',
          updatedAt: '2024-01-15T10:05:00Z',
          sender: {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@company.com',
            avatar: '/default-avatar.svg',
            department: 'Marketing',
            role: 'Marketing Manager'
          }
        }
      ],
      chatParticipants: [
        {
          id: 1,
          chatId: 1,
          employeeId: 1,
          memberType: 'owner' as const,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          employee: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@company.com',
            avatar: '/default-avatar.svg',
            department: 'Sales',
            role: 'Senior Sales Rep'
          }
        },
        {
          id: 2,
          chatId: 1,
          employeeId: 2,
          memberType: 'participant' as const,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          employee: {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@company.com',
            avatar: '/default-avatar.svg',
            department: 'Marketing',
            role: 'Marketing Manager'
          }
        }
      ]
    }
  ] as ProjectChat[]
};
