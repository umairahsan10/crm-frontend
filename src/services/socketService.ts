import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface SocketMessage {
  chatId: number;
  message: any;
}

interface SocketTyping {
  chatId: number;
  userId: number;
  isTyping: boolean;
}

interface SocketUserEvent {
  chatId: number;
  userId: number;
}

class SocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;

  // Connect to WebSocket server
  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(`${API_BASE_URL}/chat`, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.connected = true;
      
      // Authenticate after connection
      this.socket?.emit('authenticate');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  // Disconnect from server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Join a chat room
  joinChat(chatId: number): void {
    if (!this.socket) return;
    
    this.socket.emit('joinChat', { chatId }, (response: any) => {
      console.log('Joined chat:', response);
    });
  }

  // Leave a chat room
  leaveChat(chatId: number): void {
    if (!this.socket) return;
    
    this.socket.emit('leaveChat', { chatId }, (response: any) => {
      console.log('Left chat:', response);
    });
  }

  // Send a message (via WebSocket)
  sendMessage(chatId: number, content: string): void {
    if (!this.socket) return;
    
    this.socket.emit('sendMessage', { chatId, content }, (response: any) => {
      if (!response?.success) {
        console.error('Failed to send message:', response?.message);
      }
    });
  }

  // Send typing indicator
  sendTyping(chatId: number, isTyping: boolean): void {
    if (!this.socket) return;
    this.socket.emit('typing', { chatId, isTyping });
  }

  // Mark message as read
  markAsRead(chatId: number, messageId: number): void {
    if (!this.socket) return;
    this.socket.emit('markAsRead', { chatId, messageId });
  }

  // Listen for new messages
  onNewMessage(callback: (data: SocketMessage) => void): void {
    if (!this.socket) return;
    this.socket.on('newMessage', callback);
  }

  // Listen for message updates
  onMessageUpdated(callback: (data: SocketMessage) => void): void {
    if (!this.socket) return;
    this.socket.on('messageUpdated', callback);
  }

  // Listen for message deletions
  onMessageDeleted(callback: (data: { chatId: number; messageId: number }) => void): void {
    if (!this.socket) return;
    this.socket.on('messageDeleted', callback);
  }

  // Listen for typing indicators
  onUserTyping(callback: (data: SocketTyping) => void): void {
    if (!this.socket) return;
    this.socket.on('userTyping', callback);
  }

  // Listen for user joined
  onUserJoined(callback: (data: SocketUserEvent) => void): void {
    if (!this.socket) return;
    this.socket.on('userJoined', callback);
  }

  // Listen for user left
  onUserLeft(callback: (data: SocketUserEvent) => void): void {
    if (!this.socket) return;
    this.socket.on('userLeft', callback);
  }

  // Remove all listeners
  removeAllListeners(): void {
    if (!this.socket) return;
    this.socket.removeAllListeners();
  }

  // Remove specific listener
  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  // Get connection status
  isConnected(): boolean {
    return this.connected && !!this.socket?.connected;
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export default new SocketService();

