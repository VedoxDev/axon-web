import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/apiConfig';

export interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    nombre: string;
    apellidos: string;
  };
  recipient?: {
    id: string;
    nombre: string;
    apellidos: string;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
  isRead: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  // Call invitation properties (optional)
  callId?: string;
}

export interface Conversation {
  type: 'direct' | 'project';
  partner?: {
    id: string;
    nombre: string;
    apellidos: string;
    status: string;
  };
  project?: {
    id: string;
    name: string;
    description: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    senderName?: string;
    createdAt: string;
    isRead: boolean;
  };
}

export interface TypingEvent {
  userId: string;
  typing: boolean;
  timestamp: string;
  type: 'direct' | 'project';
}

export interface OnlineUser {
  id: string;
  status: 'online' | 'offline' | 'away';
}

class ChatService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private isConnected: boolean = false;
  private currentUserId: string | null = null;

  // Event callbacks
  private onMessageCallback?: (message: ChatMessage) => void;
  private onTypingCallback?: (data: TypingEvent) => void;
  private onUserOnlineCallback?: (userId: string) => void;
  private onUserOfflineCallback?: (userId: string) => void;
  private onOnlineUsersCallback?: (users: OnlineUser[]) => void;
  private onConnectionCallback?: (connected: boolean) => void;

  constructor() {
    this.loadToken();
    this.setupTokenRefreshListener();
  }

  private setupTokenRefreshListener() {
    // Listen for storage changes to refresh token when it's updated
    window.addEventListener('storage', (event) => {
      if (event.key === 'access_token') {
        console.log('Token updated in localStorage, refreshing chat service token');
        this.refreshToken();
      }
    });

    // Listen for custom login success events
    window.addEventListener('auth:loginSuccess', () => {
      console.log('Login success detected, refreshing chat service token');
      this.refreshToken();
    });
  }

  private loadToken() {
    this.token = localStorage.getItem('access_token');
  }

  // Public method to refresh the token (called after login)
  refreshToken() {
    this.loadToken();
  }

  // Check if service is ready to connect
  isReady(): boolean {
    return this.token !== null;
  }

  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // Connect to WebSocket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Try to refresh token before connecting
      this.refreshToken();
      
      if (!this.token) {
        reject(new Error('No authentication token available'));
        return;
      }

      this.socket = io('/chat', {
        auth: {
          token: this.token
        }
      });

      this.socket.on('connect', () => {
        console.log('🟢 Connected to chat');
        this.isConnected = true;
        this.onConnectionCallback?.(true);
        this.getOnlineUsers();
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('🔴 Disconnected from chat');
        this.isConnected = false;
        this.onConnectionCallback?.(false);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection failed:', error.message);
        this.isConnected = false;
        this.onConnectionCallback?.(false);
        reject(error);
      });

      // Message events
      this.socket.on('newMessage', (rawMessage: any) => {
        console.log('📨 New message received:', rawMessage);
        const transformedMessage = this.transformMessage(rawMessage);
        console.log('🔄 Transformed message:', transformedMessage);
        this.onMessageCallback?.(transformedMessage);
      });

      this.socket.on('messageSent', (rawMessage: any) => {
        console.log('✅ Message sent successfully:', rawMessage);
        const transformedMessage = this.transformMessage(rawMessage);
        console.log('🔄 Transformed sent message:', transformedMessage);
        this.onMessageCallback?.(transformedMessage);
      });

      // Typing events
      this.socket.on('typing', (data: TypingEvent) => {
        this.onTypingCallback?.(data);
      });

      // Presence events
      this.socket.on('userOnline', (data: { userId: string }) => {
        this.onUserOnlineCallback?.(data.userId);
      });

      this.socket.on('userOffline', (data: { userId: string }) => {
        this.onUserOfflineCallback?.(data.userId);
      });

      this.socket.on('onlineUsers', (data: { users: OnlineUser[] }) => {
        this.onOnlineUsersCallback?.(data.users);
      });

      this.socket.on('joinedProject', (data: { projectId: string }) => {
        console.log('🏢 Joined project room:', data.projectId);
      });
    });
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Send direct message
  sendDirectMessage(recipientId: string, content: string) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to chat');
    }

    this.socket.emit('sendMessage', {
      content,
      recipientId
    });
  }

  // Send project message
  sendProjectMessage(projectId: string, content: string) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to chat');
    }

    this.socket.emit('sendMessage', {
      content,
      projectId
    });
  }

  // Join project room
  joinProject(projectId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot join project: not connected');
      return;
    }

    this.socket.emit('joinProject', { projectId });
  }

  // Typing indicators
  startTyping(recipientId?: string, projectId?: string) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('typing', {
      recipientId,
      projectId,
      typing: true
    });
  }

  stopTyping(recipientId?: string, projectId?: string) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('typing', {
      recipientId,
      projectId,
      typing: false
    });
  }

  // Get online users
  getOnlineUsers() {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('getOnlineUsers');
  }

  // REST API methods for reliability

  // Get all conversations
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al obtener conversaciones');
    }
  }

  // Get direct message history
  async getDirectMessageHistory(userId: string, page: number = 1, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/direct/${userId}?page=${page}&limit=${limit}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch message history');
      }

      const rawMessages = await response.json();
      console.log('Raw direct messages from API:', rawMessages);
      
      // Transform messages to ensure they match our interface
      const transformedMessages = rawMessages.map((msg: any) => this.transformMessage(msg));
      console.log('Transformed direct messages:', transformedMessages);
      
      return transformedMessages;
    } catch (error: any) {
      throw new Error(error.message || 'Error al obtener historial de mensajes');
    }
  }

  // Get project message history
  async getProjectMessageHistory(projectId: string, page: number = 1, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/project/${projectId}?page=${page}&limit=${limit}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project messages');
      }

      const rawMessages = await response.json();
      console.log('Raw project messages from API:', rawMessages);
      
      // Transform messages to ensure they match our interface
      const transformedMessages = rawMessages.map((msg: any) => this.transformMessage(msg));
      console.log('Transformed project messages:', transformedMessages);
      
      return transformedMessages;
    } catch (error: any) {
      throw new Error(error.message || 'Error al obtener mensajes del proyecto');
    }
  }

  // Mark direct conversation as read
  async markDirectConversationAsRead(userId: string): Promise<{ markedCount: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/direct/${userId}/read`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al marcar mensajes como leídos');
    }
  }

  // Create message via REST (fallback)
  async createMessage(content: string, recipientId?: string, projectId?: string): Promise<ChatMessage> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          content,
          recipientId,
          projectId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al enviar mensaje');
    }
  }

  // Search messages
  async searchMessages(query: string, projectId?: string, page: number = 1, limit: number = 20): Promise<ChatMessage[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString()
      });

      if (projectId) {
        params.append('projectId', projectId);
      }

      const response = await fetch(`${API_BASE_URL}/chat/search?${params}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to search messages');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al buscar mensajes');
    }
  }

  // Event handlers
  onMessage(callback: (message: ChatMessage) => void) {
    this.onMessageCallback = callback;
  }

  onTyping(callback: (data: TypingEvent) => void) {
    this.onTypingCallback = callback;
  }

  onUserOnline(callback: (userId: string) => void) {
    this.onUserOnlineCallback = callback;
  }

  onUserOffline(callback: (userId: string) => void) {
    this.onUserOfflineCallback = callback;
  }

  onOnlineUsers(callback: (users: OnlineUser[]) => void) {
    this.onOnlineUsersCallback = callback;
  }

  onConnection(callback: (connected: boolean) => void) {
    this.onConnectionCallback = callback;
  }

  // Transform raw WebSocket message to match our interface
  private transformMessage(rawMessage: any): ChatMessage {
    try {
      // Handle messages that are already in the correct format
      if (rawMessage.sender && typeof rawMessage.sender === 'object') {
        return rawMessage as ChatMessage;
      }

      // Parse sender name into nombre and apellidos
      const senderName = rawMessage.senderName || '';
      const nameParts = senderName.trim().split(' ');
      const nombre = nameParts[0] || '';
      const apellidos = nameParts.slice(1).join(' ') || '';

      return {
        id: rawMessage.id,
        content: rawMessage.content,
        sender: {
          id: rawMessage.senderId,
          nombre: nombre,
          apellidos: apellidos
        },
        recipient: rawMessage.recipientId ? {
          id: rawMessage.recipientId,
          nombre: rawMessage.recipientName?.split(' ')[0] || '',
          apellidos: rawMessage.recipientName?.split(' ').slice(1).join(' ') || ''
        } : null,
        project: rawMessage.projectId ? {
          id: rawMessage.projectId,
          name: rawMessage.projectName || 'Proyecto'
        } : null,
        isRead: rawMessage.isRead || false,
        isEdited: rawMessage.isEdited || false,
        createdAt: rawMessage.createdAt,
        updatedAt: rawMessage.updatedAt || rawMessage.createdAt,
        // Include callId if present (for call invitations)
        callId: rawMessage.callId
      };
    } catch (error) {
      console.error('Error transforming message:', error, rawMessage);
      // Return a fallback message to prevent crashes
      return {
        id: rawMessage.id || 'unknown',
        content: rawMessage.content || 'Error al cargar mensaje',
        sender: {
          id: rawMessage.senderId || 'unknown',
          nombre: 'Usuario',
          apellidos: 'Desconocido'
        },
        recipient: null,
        project: null,
        isRead: false,
        isEdited: false,
        createdAt: rawMessage.createdAt || new Date().toISOString(),
        updatedAt: rawMessage.updatedAt || rawMessage.createdAt || new Date().toISOString(),
        callId: rawMessage.callId
      };
    }
  }

  // Getters
  get connected(): boolean {
    return this.isConnected;
  }

  // Set current user ID (needed for filtering own messages)
  setCurrentUserId(userId: string) {
    this.currentUserId = userId;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService; 