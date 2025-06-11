import React, { useState, useEffect, useRef } from 'react';
import { useAlert } from '../hooks/useAlert';
import chatService, { type ChatMessage, type Conversation } from '../services/chatService';
import projectService from '../services/projectService';
import callsService from '../services/callsService';
import authService from '../services/authService';
import { API_BASE_URL } from '../config/apiConfig';
import UserProfileModal from './modals/UserProfileModal';
import CallButtons from './CallButtons';

import VideoCallScreen from './VideoCall/VideoCallScreen';

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

  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [callStatuses, setCallStatuses] = useState<Map<string, 'waiting' | 'active' | 'ended' | 'cancelled'>>(new Map());
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeIfNeeded();

    // Listen for login success to retry initialization
    const handleLoginSuccess = () => {
      console.log('Login success detected, retrying chat view initialization');
      setTimeout(() => {
        initializeIfNeeded();
      }, 100);
    };

    window.addEventListener('auth:loginSuccess', handleLoginSuccess);

    return () => {
      window.removeEventListener('auth:loginSuccess', handleLoginSuccess);
    };
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

  // Automatically check call statuses when messages load (mobile app approach)
  useEffect(() => {
    const checkCallStatusesAutomatically = async () => {
      const callMessages = messages.filter(msg => 
        msg.content.includes('📞') && 
        msg.callId && 
        !callStatuses.has(msg.callId)
      );
      
      if (callMessages.length > 0) {
        console.log('📞 Auto-checking status for', callMessages.length, 'call messages');
        
        // Sort by newest first so users see recent call statuses immediately
        const sortedCallMessages = callMessages.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        // Check status for each call message automatically (newest first)
        for (const message of sortedCallMessages) {
          if (message.callId) {
            console.log('🔍 Auto-checking call (newest first):', message.callId, 'from', message.createdAt);
            await checkCallStatus(message.callId);
            // Small delay between requests to be nice to the backend
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
    };

    if (messages.length > 0) {
      checkCallStatusesAutomatically();
    }
  }, [messages]);

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

      // Refresh token from localStorage
      chatService.refreshToken();

      // Check if service is ready
      if (!chatService.isReady()) {
        console.warn('Chat service not ready - authentication token not available, will retry...');
        
        // Schedule a retry in 2 seconds (up to 5 attempts)
        let retryCount = 0;
        const maxRetries = 5;
        const retryInterval = setInterval(() => {
          retryCount++;
          console.log(`Retry attempt ${retryCount}/${maxRetries} for chat view initialization`);
          
          chatService.refreshToken();
          if (chatService.isReady()) {
            console.log('Token now available, proceeding with chat view initialization');
            clearInterval(retryInterval);
            initializeIfNeeded(); // Retry full initialization
          } else if (retryCount >= maxRetries) {
            console.log('Max retries reached, giving up on chat view initialization');
            clearInterval(retryInterval);
          }
        }, 2000);
        
        return;
      }

      // Request notification permissions for call invitations
      if ('Notification' in window && Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (error) {
          console.log('Notification permission denied or not supported');
        }
      }

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
      console.log('📨 New message received:', message);
      
      setMessages(prev => {
        // Avoid duplicates
        const exists = prev.some(msg => msg.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });

      // Enhanced call invitation detection - just notify, don't show modal
      const isCallMessage = message.content.includes('📞');
      console.log('🔍 Checking if call message:', {
        isCallMessage,
        hasCallId: !!message.callId,
        content: message.content,
        callId: message.callId,
        senderId: message.sender.id,
        currentUserId
      });

      if (isCallMessage && message.callId) {
        // Don't show notification for our own calls
        if (message.sender.id !== currentUserId) {
          console.log('📞 Call message received:', message);
          
          // Optional: Play notification sound or vibrate
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Invitación a llamada', {
              body: message.content,
              icon: '/favicon.ico'
            });
          }
        } else {
          console.log('📞 Ignoring own call message');
        }
      } else if (isCallMessage) {
        console.log('⚠️ Call message without callId detected:', message);
      }
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

  const handleCallStarted = (callId: string) => {
    console.log('Call started:', callId);
    setActiveCallId(callId);
  };



  const handleCallClose = () => {
    setActiveCallId(null);
  };

    const checkCallStatus = async (callId: string): Promise<'waiting' | 'active' | 'ended' | 'cancelled'> => {
    try {
      console.log('🔍 Checking call availability using mobile app approach:', callId);
      
      // Use the mobile app approach: check if we can join the call without actually joining
      // We'll make a lightweight request to see if the call exists and is joinable
      try {
        // First try the exact approach from mobile app documentation
        const response = await fetch(`${API_BASE_URL}/calls/join/${callId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ audioOnly: false })
        });
        
        if (response.ok) {
          // Call is available and we can join - this means it's active
          const { call } = await response.json();
          console.log('📊 Call is available and joinable:', { callId, status: call.status });
          
          // Important: We got a successful response, but we haven't actually "joined" the LiveKit room yet
          // The backend just validated that we can join and gave us a token
          
          setCallStatuses(prev => {
            const newMap = new Map(prev);
            newMap.set(callId, 'active');
            return newMap;
          });
          
          return 'active';
        } else if (response.status === 404 || response.status === 400) {
          // Call not found or ended (from mobile app docs)
          console.log('📊 Call not available (404/400):', response.status);
          
          setCallStatuses(prev => {
            const newMap = new Map(prev);
            newMap.set(callId, 'ended');
            return newMap;
          });
          
          return 'ended';
        } else {
          // Other error - treat as unknown
          console.log('📊 Other error checking call:', response.status);
          
          setCallStatuses(prev => {
            const newMap = new Map(prev);
            newMap.set(callId, 'waiting');
            return newMap;
          });
          
          return 'waiting';
        }
      } catch (fetchError) {
        throw fetchError; // Re-throw to be caught by outer catch
      }
    } catch (error: any) {
      console.error('❌ Failed to check call availability:', error);
      
      // Network error or other issue - default to waiting (joinable)
      console.log('⚠️ Network error, treating as potentially available');
      setCallStatuses(prev => {
        const newMap = new Map(prev);
        newMap.set(callId, 'waiting');
        return newMap;
      });
      return 'waiting';
    }
  };

  const handleJoinCall = async (callId: string) => {
    console.log('📞 Attempting to join call:', callId);
    
    // Check if call is still active
    const status = await checkCallStatus(callId);
    
    if (status === 'ended' || status === 'cancelled') {
      showError('Esta llamada ya ha finalizado', 'Llamada no disponible');
      return;
    }
    
    setActiveCallId(callId);
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
              
                        {/* Call buttons and connection status */}
          <div className="flex items-center space-x-4">
            {/* Call Buttons */}
            {currentConversation && isConnected && (
              <CallButtons 
                conversation={currentConversation}
                onCallStarted={handleCallStarted}
              />
            )}
            
            {/* Connection status indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-400">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
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
                        
                        {/* Call Actions for call messages */}
                        {message.content.includes('📞') && message.callId && (
                          <div className="mt-3 flex justify-center">
                            {(() => {
                              const callStatus = callStatuses.get(message.callId!) || 'waiting';
                              
                              if (callStatus === 'ended' || callStatus === 'cancelled') {
                                return (
                                  <div className="px-4 py-2 bg-gray-600 text-gray-300 text-sm rounded-lg flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                    </svg>
                                    <span>Llamada finalizada</span>
                                  </div>
                                );
                              }
                              
                              return (
                                <button
                                  onClick={() => handleJoinCall(message.callId!)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center space-x-2 shadow-lg"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <span>
                                    {isOwn ? 'Volver a la llamada' : 'Unirse a llamada'}
                                  </span>
                                </button>
                              );
                            })()}
                          </div>
                        )}
                        
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



      {/* Video Call Screen */}
      {activeCallId && (
        <VideoCallScreen
          callId={activeCallId}
          onClose={handleCallClose}
        />
      )}
    </>
  );
};

export default ChatConversationView; 