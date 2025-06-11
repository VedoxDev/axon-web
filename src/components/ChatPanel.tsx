import React, { useState, useEffect, useRef } from 'react';
import { useAlert } from '../hooks/useAlert';
import chatService, { type ChatMessage, type Conversation } from '../services/chatService';
import projectService from '../services/projectService';

interface ChatPanelProps {
  selectedChatId?: string | null;
  onSelectChat?: (chatId: string | null) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ selectedChatId }) => {
  const { showError, showSuccess } = useAlert();
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);

  // Initialize chat service and load data
  useEffect(() => {
    initializeChat();
    return () => {
      chatService.disconnect();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle selected chat change
  useEffect(() => {
    if (selectedChatId && conversations.length > 0) {
      const conversation = conversations.find(conv => 
        conv.type === 'direct' ? conv.partner?.id === selectedChatId : conv.project?.id === selectedChatId
      );
      if (conversation) {
        openConversation(conversation);
      }
    }
  }, [selectedChatId, conversations]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const user = await projectService.getCurrentUser();
      setCurrentUserId(user.id);
      chatService.setCurrentUserId(user.id);

      // Connect to WebSocket
      await chatService.connect();
      
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
      if (connected) {
        showSuccess('Conectado al chat', '🟢 Chat en línea');
      } else {
        showError('Desconectado del chat', '🔴 Chat desconectado');
      }
    });

    // New messages
    chatService.onMessage((message) => {
      setMessages(prev => {
        // Avoid duplicates
        const exists = prev.some(msg => msg.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });

      // Update last message in conversations
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

    // Typing indicators
    chatService.onTyping((data) => {
      if (data.userId === currentUserId) return; // Ignore own typing
      
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.typing) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });

      // Auto-remove typing after 3 seconds
      if (data.typing) {
        window.setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }, 3000);
      }
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

  const openConversation = async (conversation: Conversation) => {
    try {
      setCurrentConversation(conversation);
      setMessages([]);
      setIsLoadingMessages(true);
      setSearchQuery('');

      // Load message history
      let messageHistory: ChatMessage[] = [];
      
      if (conversation.type === 'direct' && conversation.partner) {
        messageHistory = await chatService.getDirectMessageHistory(conversation.partner.id);
        // Mark conversation as read
        await chatService.markDirectConversationAsRead(conversation.partner.id);
      } else if (conversation.type === 'project' && conversation.project) {
        messageHistory = await chatService.getProjectMessageHistory(conversation.project.id);
        // Join project room for real-time messages
        chatService.joinProject(conversation.project.id);
      }

      setMessages(messageHistory.reverse()); // Show oldest first
      
    } catch (error: any) {
      console.error('Failed to open conversation:', error);
      showError(error.message || 'Error al abrir conversación', 'Error');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !currentConversation || isSending) return;

    const content = messageText.trim();
    setMessageText('');
    setIsSending(true);

    try {
      if (currentConversation.type === 'direct' && currentConversation.partner) {
        chatService.sendDirectMessage(currentConversation.partner.id, content);
      } else if (currentConversation.type === 'project' && currentConversation.project) {
        chatService.sendProjectMessage(currentConversation.project.id, content);
      }

      // Stop typing indicator
      stopTyping();

    } catch (error: any) {
      console.error('Failed to send message:', error);
      showError(error.message || 'Error al enviar mensaje', 'Error');
      // Restore message text on error
      setMessageText(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    
    // Handle typing indicators
    if (e.target.value && !isTypingRef.current) {
      startTyping();
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      stopTyping();
    }, 1000);
  };

  const startTyping = () => {
    if (!currentConversation || isTypingRef.current) return;
    
    isTypingRef.current = true;
    
    if (currentConversation.type === 'direct' && currentConversation.partner) {
      chatService.startTyping(currentConversation.partner.id);
    } else if (currentConversation.type === 'project' && currentConversation.project) {
      chatService.startTyping(undefined, currentConversation.project.id);
    }
  };

  const stopTyping = () => {
    if (!isTypingRef.current) return;
    
    isTypingRef.current = false;
    
    if (currentConversation?.type === 'direct' && currentConversation.partner) {
      chatService.stopTyping(currentConversation.partner.id);
    } else if (currentConversation?.type === 'project' && currentConversation.project) {
      chatService.stopTyping(undefined, currentConversation.project.id);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const filteredConversations = conversations.filter(conv => {
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

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Conectando al chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-gray-50 dark:bg-gray-900">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mensajes</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isConnected ? 'En línea' : 'Desconectado'}
              </span>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conversaciones..."
              className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">💬</div>
              <p>No hay conversaciones</p>
            </div>
          ) : (
            filteredConversations.map((conv, index) => {
              const isSelected = currentConversation && (
                (conv.type === 'direct' && currentConversation.type === 'direct' && 
                 conv.partner?.id === currentConversation.partner?.id) ||
                (conv.type === 'project' && currentConversation.type === 'project' && 
                 conv.project?.id === currentConversation.project?.id)
              );

              return (
                <div
                  key={index}
                  onClick={() => openConversation(conv)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {conv.type === 'direct' && conv.partner ? (
                          getInitials(conv.partner.nombre, conv.partner.apellidos)
                        ) : conv.type === 'project' && conv.project ? (
                          conv.project.name.charAt(0).toUpperCase()
                        ) : '?'}
                      </div>
                      {/* Online indicator for direct messages */}
                      {conv.type === 'direct' && conv.partner && onlineUsers.has(conv.partner.id) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                      )}
                    </div>

                    {/* Conversation info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conv.type === 'direct' && conv.partner 
                            ? `${conv.partner.nombre} ${conv.partner.apellidos}`
                            : conv.project?.name
                          }
                        </h3>
                        {conv.lastMessage && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      
                      {conv.lastMessage ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {conv.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Sin mensajes</p>
                      )}
                    </div>

                    {/* Unread indicator */}
                    {conv.lastMessage && !conv.lastMessage.isRead && conv.lastMessage.senderId !== currentUserId && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {currentConversation.type === 'direct' && currentConversation.partner ? (
                      getInitials(currentConversation.partner.nombre, currentConversation.partner.apellidos)
                    ) : currentConversation.type === 'project' && currentConversation.project ? (
                      currentConversation.project.name.charAt(0).toUpperCase()
                    ) : '?'}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {currentConversation.type === 'direct' && currentConversation.partner 
                        ? `${currentConversation.partner.nombre} ${currentConversation.partner.apellidos}`
                        : currentConversation.project?.name
                      }
                    </h3>
                    {currentConversation.type === 'direct' && currentConversation.partner && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {onlineUsers.has(currentConversation.partner.id) ? 'En línea' : 'Desconectado'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="flex justify-center">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">💬</div>
                  <p>No hay mensajes aún</p>
                  <p className="text-sm">¡Envía el primer mensaje!</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.sender.id === currentUserId;
                  const showDate = index === 0 || 
                    formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                  return (
                    <div key={message.id}>
                      {/* Date separator */}
                      {showDate && (
                        <div className="flex items-center justify-center my-4">
                          <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-400">
                            {formatDate(message.createdAt)}
                          </div>
                        </div>
                      )}

                      {/* Message */}
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isOwn 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}>
                          {/* Sender name for project messages */}
                          {!isOwn && currentConversation.type === 'project' && (
                            <p className="text-xs font-medium mb-1 opacity-75">
                              {message.sender.nombre} {message.sender.apellidos}
                            </p>
                          )}
                          
                          <p className="text-sm">{message.content}</p>
                          
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                              {formatTime(message.createdAt)}
                            </span>
                            {message.isEdited && (
                              <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                                editado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicators */}
              {typingUsers.size > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-2xl">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">escribiendo...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-3">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={messageText}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe un mensaje..."
                  disabled={!isConnected || isSending}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageText.trim() || !isConnected || isSending}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSending ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Selecciona una conversación
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Elige una conversación para comenzar a chatear
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel; 