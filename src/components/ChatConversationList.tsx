import React, { useState, useEffect } from 'react';
import { useAlert } from '../hooks/useAlert';
import chatService, { type Conversation, type OnlineUser } from '../services/chatService';
import projectService from '../services/projectService';

interface ChatConversationListProps {
  selectedChatId?: string | null;
  onSelectChat?: (chatId: string | null) => void;
}

const ChatConversationList: React.FC<ChatConversationListProps> = ({ 
  selectedChatId, 
  onSelectChat 
}) => {
  const { showError } = useAlert();
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'direct' | 'project'>('direct');

  useEffect(() => {
    initializeChat();
    return () => {
      // Don't disconnect here since MainContent might need the connection
    };
  }, []);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const user = await projectService.getCurrentUser();
      setCurrentUserId(user.id);
      chatService.setCurrentUserId(user.id);

      // Connect if not already connected
      if (!chatService.connected) {
        await chatService.connect();
      }
      
      // Set up event listeners
      setupEventListeners();
      
      // Load conversations
      await loadConversations();
      
    } catch (error: any) {
      console.error('Failed to initialize chat:', error);
      showError(error.message || 'Error al conectar con el chat', 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    // Connection status
    chatService.onConnection((connected) => {
      setIsConnected(connected);
    });

    // New messages - update conversation list
    chatService.onMessage((message) => {
      setConversations(prev => prev.map(conv => {
        const isMatch = message.recipient 
          ? (conv.type === 'direct' && conv.partner?.id === message.sender.id)
          : (conv.type === 'project' && conv.project?.id === message.project?.id);
        
        if (isMatch) {
          return {
            ...conv,
            lastMessage: {
              id: message.id,
              content: message.content,
              senderId: message.sender.id,
              senderName: `${message.sender.nombre} ${message.sender.apellidos}`,
              createdAt: message.createdAt,
              isRead: message.isRead
            }
          };
        }
        return conv;
      }));
    });

    // Online presence
    chatService.onUserOnline((userId) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    });

    chatService.onUserOffline((userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    chatService.onOnlineUsers((users) => {
      setOnlineUsers(new Set(users.map(u => u.id)));
    });
  };

  const loadConversations = async () => {
    try {
      const convs = await chatService.getConversations();
      setConversations(convs);
    } catch (error: any) {
      console.error('Failed to load conversations:', error);
      showError(error.message || 'Error al cargar conversaciones', 'Error');
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    const chatId = conversation.type === 'direct' 
      ? conversation.partner?.id 
      : conversation.project?.id;
    
    if (chatId && onSelectChat) {
      onSelectChat(chatId);
    }
  };

  const getInitials = (nombre: string, apellidos: string): string => {
    return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredConversations = conversations.filter(conv => {
    // Filter by active tab first
    if (conv.type !== activeTab) return false;
    
    // Then filter by search query
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    if (conv.type === 'direct' && conv.partner) {
      const name = `${conv.partner.nombre} ${conv.partner.apellidos}`.toLowerCase();
      return name.includes(query);
    } else if (conv.type === 'project' && conv.project) {
      return conv.project.name.toLowerCase().includes(query);
    }
    
    return false;
  });

  // Count conversations for each tab
  const directCount = conversations.filter(conv => conv.type === 'direct').length;
  const projectCount = conversations.filter(conv => conv.type === 'project').length;

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[#3A3A3A]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Cargando chats...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#3A3A3A]">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Mensajes</h2>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar ${activeTab === 'direct' ? 'chats' : 'proyectos'}...`}
            className="w-full px-3 py-2 pl-10 text-sm bg-[#282828] text-white placeholder-gray-400 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-3 px-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'direct'
                ? 'border-[#007AFF] text-[#007AFF]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Chat</span>
              {directCount > 0 && (
                <span className="bg-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                  {directCount}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('project')}
            className={`flex-1 py-3 px-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'project'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              <span>Proyectos</span>
              {projectCount > 0 && (
                <span className="bg-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                  {projectCount}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <div className="text-4xl mb-2">
              {activeTab === 'direct' ? '👤' : '📁'}
            </div>
            <p className="text-sm">
              {activeTab === 'direct' 
                ? 'No hay chats directos' 
                : 'No hay chats de proyectos'
              }
            </p>
            <p className="text-xs mt-1 opacity-75">
              {activeTab === 'direct' 
                ? 'Inicia una conversación con un usuario' 
                : 'Únete a un proyecto para chatear'
              }
            </p>
          </div>
        ) : (
          filteredConversations.map((conv, index) => {
            const chatId = conv.type === 'direct' ? conv.partner?.id : conv.project?.id;
            const isSelected = selectedChatId === chatId;

            return (
              <div
                key={index}
                onClick={() => handleConversationSelect(conv)}
                className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-[#282828] transition-colors ${
                  isSelected 
                    ? conv.type === 'direct'
                      ? 'bg-[#282828] border-l-4 border-l-[#007AFF]'
                      : 'bg-[#282828] border-l-4 border-l-orange-500'
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      conv.type === 'direct' 
                        ? 'text-white font-medium'
                        : 'bg-orange-500 text-white font-medium'
                    }`} style={conv.type === 'direct' ? { backgroundColor: '#007AFF20', color: '#007AFF' } : {}}>
                      {conv.type === 'direct' && conv.partner ? (
                        getInitials(conv.partner.nombre, conv.partner.apellidos)
                      ) : conv.type === 'project' && conv.project ? (
                        conv.project.name.charAt(0).toUpperCase()
                      ) : '?'}
                    </div>
                    {/* Online indicator for direct messages */}
                    {conv.type === 'direct' && conv.partner && onlineUsers.has(conv.partner.id) && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#3A3A3A] rounded-full"></div>
                    )}
                  </div>

                  {/* Conversation info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-white truncate">
                        {conv.type === 'direct' && conv.partner 
                          ? `${conv.partner.nombre} ${conv.partner.apellidos}`
                          : conv.project?.name
                        }
                      </h3>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    {conv.lastMessage ? (
                      <p className="text-sm text-gray-400 truncate">
                        {conv.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Sin mensajes</p>
                    )}
                  </div>

                  {/* Unread indicator */}
                  {conv.lastMessage && !conv.lastMessage.isRead && conv.lastMessage.senderId !== currentUserId && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatConversationList; 