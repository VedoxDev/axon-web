import React, { useState, useEffect, useRef } from 'react';
import { useAlert } from '../hooks/useAlert';
import chatService, { type ChatMessage, type Conversation } from '../services/chatService';
import projectService from '../services/projectService';
import UserProfileModal from './modals/UserProfileModal';

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

// Emoji categories
const emojiCategories = {
  'Caras': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😚', '😋', '😛', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'],
  'Gestos': ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✊', '👊', '🤛', '🤜'],
  'Corazones': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  'Objetos': ['💬', '💭', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💤', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👏', '🙌'],
  'Actividades': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️'],
  'Comida': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫒', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕']
};

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

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

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

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
      
      let conversation = conversations.find(conv => 
        (conv.type === 'direct' && conv.partner?.id === chatId) ||
        (conv.type === 'project' && conv.project?.id === chatId)
      );

      // If no existing conversation found, create a virtual one for new chat
      if (!conversation) {
        console.log('No existing conversation found, creating new chat for user:', chatId);
        
        // Try to get user info to create virtual conversation
        try {
          const userProfile = await projectService.getUserProfileById(chatId);
          conversation = {
            type: 'direct',
            partner: {
              id: userProfile.id,
              nombre: userProfile.nombre,
              apellidos: userProfile.apellidos,
              status: 'offline' // Default status, will be updated by presence
            }
          };
          console.log('Created virtual conversation:', conversation);
        } catch (error) {
          console.error('Failed to get user profile for new chat:', error);
          showError('No se pudo iniciar conversación con este usuario', 'Error');
          return;
        }
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

  const handleEmojiSelect = (emoji: string) => {
    const input = messageInputRef.current;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const textBefore = messageText.substring(0, start);
      const textAfter = messageText.substring(end);
      const newText = textBefore + emoji + textAfter;
      
      setMessageText(newText);
      setShowEmojiPicker(false);
      
      // Focus back to input and set cursor position after emoji
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    }
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowProfileModal(true);
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
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
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
              <div 
                className={`flex items-center space-x-3 ${
                  currentConversation.type === 'direct' ? 'cursor-pointer hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors' : ''
                }`}
                onClick={currentConversation.type === 'direct' && currentConversation.partner 
                  ? () => handleUserClick(currentConversation.partner!.id)
                  : undefined
                }
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  currentConversation.type === 'direct' 
                    ? 'text-white font-medium'
                    : 'bg-orange-500 text-white font-medium'
                }`} style={currentConversation.type === 'direct' ? { backgroundColor: '#007AFF20', color: '#007AFF' } : {}}>
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
                  {currentConversation.type === 'project' && currentConversation.project ? (
                    <p className="text-sm text-gray-400">
                      Chat del proyecto
                    </p>
                  ) : currentConversation.type === 'direct' && (
                    <p className="text-sm text-gray-400">
                      Haz clic para ver perfil
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
          <div className={`flex-1 overflow-y-auto p-4 min-h-0 custom-scrollbar ${
            isLoadingMessages || messages.length === 0 ? 'flex items-center justify-center' : ''
          }`}>
            {isLoadingMessages ? (
              <div className="text-center">
                <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-400">Cargando mensajes...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
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
                          ? currentConversation.type === 'direct' 
                            ? 'bg-blue-500 text-white'
                            : 'bg-orange-500 text-white'
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
                          <span className={`text-xs ${
                            isOwn 
                              ? currentConversation.type === 'direct' 
                                ? 'text-blue-100' 
                                : 'text-orange-100'
                              : 'text-gray-400'
                          }`}>
                            {formatTime(message.createdAt)}
                          </span>
                          {message.isEdited && (
                            <span className={`text-xs ${
                              isOwn 
                                ? currentConversation.type === 'direct' 
                                  ? 'text-blue-100' 
                                  : 'text-orange-100'
                                : 'text-gray-400'
                            }`}>
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
          <div className="bg-[#1E1F20] border-t border-gray-700 p-4 flex-shrink-0 relative">
            <div className="flex items-center space-x-3">
              {/* Emoji Button */}
              <div className="relative" ref={emojiPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                  disabled={!isConnected}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                                 {/* Emoji Picker */}
                 {showEmojiPicker && (
                   <div className="absolute bottom-full left-0 mb-2 w-80 max-h-60 bg-[#282828] border border-gray-600 rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-700">
                      {Object.keys(emojiCategories).map((category) => (
                        <button
                          key={category}
                          className="px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-700 whitespace-nowrap"
                          onClick={() => {
                            const element = document.getElementById(`emoji-category-${category}`);
                            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    
                    <div className="overflow-y-auto scrollbar-hide max-h-48 p-2">
                      {Object.entries(emojiCategories).map(([category, emojis]) => (
                        <div key={category} id={`emoji-category-${category}`} className="mb-3">
                          <h4 className="text-xs font-medium text-gray-400 mb-1 sticky top-0 bg-[#282828] py-1">
                            {category}
                          </h4>
                          <div className="grid grid-cols-8 gap-1">
                            {emojis.map((emoji, index) => (
                              <button
                                key={`${category}-${index}`}
                                onClick={() => handleEmojiSelect(emoji)}
                                className="p-1 text-lg hover:bg-gray-700 rounded transition-colors"
                                title={emoji}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userId={selectedUserId || undefined}
      />
    </>
  );
};

export default ChatConversationView; 