import React, { useState, useEffect, useRef } from 'react';
import { useAlert } from '../hooks/useAlert';
import chatService, { type ChatMessage, type Conversation } from '../services/chatService';
import projectService from '../services/projectService';

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    transition: background 0.2s ease;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
  }
`;

interface ChatConversationViewProps {
  selectedChatId?: string | null;
}

const ChatConversationView: React.FC<ChatConversationViewProps> = ({ selectedChatId }) => {
  const { showError, showSuccess } = useAlert();
  
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    initializeIfNeeded();
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      loadConversation(selectedChatId);
    } else {
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [selectedChatId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll to bottom when typing indicators change
  useEffect(() => {
    scrollToBottom();
  }, [typingUsers]);

  const initializeIfNeeded = async () => {
    try {
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
      
    } catch (error: any) {
      console.error('Failed to initialize chat view:', error);
      showError(error.message || 'Error al conectar con el chat', 'Error de conexión');
    }
  };

  const setupEventListeners = () => {
    // Connection status
    chatService.onConnection((connected) => {
      setIsConnected(connected);
    });

    // Initialize connection state
    setIsConnected(chatService.connected);

    // New messages
    chatService.onMessage((message) => {
      setMessages(prev => {
        // Avoid duplicates
        const exists = prev.some(msg => msg.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
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
  };

  const loadConversation = async (chatId: string) => {
    try {
      setIsLoadingMessages(true);
      setMessages([]);
      setCurrentConversation(null);

      console.log('Loading conversation for chatId:', chatId);

      // First, get all conversations to find the right one
      const conversations = await chatService.getConversations();
      console.log('Available conversations:', conversations);
      
      const conversation = conversations.find(conv => 
        (conv.type === 'direct' && conv.partner?.id === chatId) ||
        (conv.type === 'project' && conv.project?.id === chatId)
      );

      if (!conversation) {
        console.error('Conversation not found for chatId:', chatId);
        showError('Conversación no encontrada', 'Error');
        return;
      }

      console.log('Found conversation:', conversation);
      setCurrentConversation(conversation);

      // Load message history
      let messageHistory: ChatMessage[] = [];
      
      if (conversation.type === 'direct' && conversation.partner) {
        console.log('Loading direct message history for partner:', conversation.partner.id);
        messageHistory = await chatService.getDirectMessageHistory(conversation.partner.id);
        // Mark conversation as read
        await chatService.markDirectConversationAsRead(conversation.partner.id);
      } else if (conversation.type === 'project' && conversation.project) {
        console.log('Loading project message history for project:', conversation.project.id);
        messageHistory = await chatService.getProjectMessageHistory(conversation.project.id);
        // Join project room for real-time messages
        chatService.joinProject(conversation.project.id);
      }

      console.log('Message history loaded:', messageHistory.length, 'messages');
      console.log('First few messages:', messageHistory.slice(0, 3));

      // Don't reverse here - messages should be in chronological order (oldest first)
      setMessages(messageHistory);
      
      // Auto-focus input after loading conversation
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
      
    } catch (error: any) {
      console.error('Failed to load conversation:', error);
      showError(error.message || 'Error al cargar conversación', 'Error');
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

  if (!selectedChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1A1A1A]">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-medium text-white mb-2">
            Selecciona una conversación
          </h3>
          <p className="text-gray-400">
            Elige una conversación de la lista para comenzar a chatear
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="flex-1 flex flex-col bg-[#1A1A1A] h-full max-h-full">
        {currentConversation ? (
        <>
          {/* Chat Header - Fixed */}
          <div className="bg-[#1E1F20] border-b border-gray-700 p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
                  {currentConversation.type === 'direct' && currentConversation.partner ? (
                    getInitials(currentConversation.partner.nombre, currentConversation.partner.apellidos)
                  ) : currentConversation.type === 'project' && currentConversation.project ? (
                    currentConversation.project.name.charAt(0).toUpperCase()
                  ) : '?'}
                </div>
                <div>
                  <h3 className="font-medium text-white">
                    {currentConversation.type === 'direct' && currentConversation.partner 
                      ? `${currentConversation.partner.nombre} ${currentConversation.partner.apellidos}`
                      : currentConversation.project?.name
                    }
                  </h3>
                  {currentConversation.type === 'project' && currentConversation.project && (
                    <p className="text-sm text-gray-400">
                      Chat del proyecto
                    </p>
                  )}
                </div>
              </div>
              
              {/* Connection status indicator */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-400">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>

          {/* Messages Container - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0 custom-scrollbar">
            {isLoadingMessages ? (
              <div className="flex justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400">
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
                        <div className="bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-400">
                          {formatDate(message.createdAt)}
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
                      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl ${
                        isOwn 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-gray-700 text-white'
                      }`}>
                        {/* Sender name for project messages */}
                        {!isOwn && currentConversation.type === 'project' && (
                          <p className="text-xs font-medium mb-1 opacity-75">
                            {message.sender.nombre} {message.sender.apellidos}
                          </p>
                        )}
                        
                        <p className="text-sm leading-tight break-words">{message.content}</p>
                        
                        <div className="flex items-center justify-end mt-1 space-x-1">
                          <span className={`text-xs ${isOwn ? 'text-orange-100' : 'text-gray-400'}`}>
                            {formatTime(message.createdAt)}
                          </span>
                          {message.isEdited && (
                            <span className={`text-xs ${isOwn ? 'text-orange-100' : 'text-gray-400'}`}>
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
                <div className="bg-gray-700 px-4 py-2 rounded-2xl">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-400 ml-2">escribiendo...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input - Fixed at bottom */}
          <div className="bg-[#1E1F20] border-t border-gray-700 p-4 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <input
                ref={messageInputRef}
                type="text"
                value={messageText}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={!isConnected ? "Conectando..." : "Escribe un mensaje..."}
                disabled={!isConnected || isSending}
                className="flex-1 px-4 py-2 bg-[#282828] text-white placeholder-gray-400 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!messageText.trim() || !isConnected || isSending}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
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
        /* Loading conversation */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando conversación...</p>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default ChatConversationView; 