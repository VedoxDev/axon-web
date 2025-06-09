import React, { useState } from 'react';

interface Message {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface ChatGroup {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  isOnline?: boolean;
}

interface ChatPanelProps {
  activeChannel: string | null;
  channelType?: 'chat' | 'group' | 'text';
  isSidebarView?: boolean;
  onChatSelect?: (chatId: string | null) => void;
}

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
};

const mockMessages: Message[] = [
  {
    id: '1',
    user: {
      id: '2',
      name: 'Ana García',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face'
    },
    content: 'Hola! ¿Cómo va el proyecto?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isRead: false
  },
  {
    id: '2',
    user: {
      id: '1',
      name: 'Yo',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'
    },
    content: 'Muy bien! Estamos avanzando según lo planeado. El diseño de las nuevas funcionalidades está casi listo.',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    isRead: true
  },
  {
    id: '3',
    user: {
      id: '2',
      name: 'Ana García',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face'
    },
    content: 'Perfecto! ¿Necesitas ayuda con algo?',
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
    isRead: false
  }
];

// --- Chat List Sidebar Component ---
interface ChatListSidebarProps extends ChatPanelProps {
  chats: ChatGroup[];
  groups: ChatGroup[];
  searchQuery: string;
  activeTab: 'chats' | 'groups';
  setActiveTab: React.Dispatch<React.SetStateAction<'chats' | 'groups'>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const ChatListSidebar: React.FC<ChatListSidebarProps> = ({ 
  activeChannel, onChatSelect, chats, groups, searchQuery, activeTab, setActiveTab, setSearchQuery
}) => {
  const filteredChats = (activeTab === 'chats' ? chats : groups).filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#1E1F20] flex flex-col border-r border-gray-700 w-full">
      {/* Search Bar */}
      <div className="p-4 bg-[#1E1F20]">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            className="w-full bg-[#282828] text-white placeholder-gray-400 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'chats'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('chats')}
        >
          Chats
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'groups'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('groups')}
        >
          Grupos
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center p-4 hover:bg-[#282828] cursor-pointer transition-colors ${
              activeChannel === chat.id ? 'bg-[#282828]' : ''
            }`}
            onClick={() => onChatSelect && onChatSelect(chat.id)}
          >
            <div className="relative">
              {chat.avatar ? (
                <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {chat.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {activeTab === 'chats' && chat.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#1E1F20] rounded-full" />
              )}
            </div>
            
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium truncate">{chat.name}</h4>
                {chat.lastMessage && (
                  <span className="text-xs text-gray-400">
                    {formatTime(chat.lastMessage.timestamp)}
                  </span>
                )}
              </div>
              {chat.lastMessage && (
                <p className="text-sm text-gray-400 truncate mt-1">
                  {chat.lastMessage.content}
                </p>
              )}
            </div>
            
            {chat.unreadCount > 0 && (
              <div className="ml-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Chat Conversation Main Component ---
interface ChatConversationMainProps extends ChatPanelProps {
  currentChat: ChatGroup | undefined;
  messageInput: string;
  setMessageInput: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: () => void;
}

const ChatConversationMain: React.FC<ChatConversationMainProps> = ({ 
  currentChat, activeChannel, messageInput, setMessageInput, handleSendMessage, channelType, onChatSelect
}) => {
  const messages = mockMessages; // Use mock messages for now

  return (
    <div className="flex-1 flex flex-col">
      {!currentChat ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <h3 className="text-xl font-semibold mb-2">Selecciona una conversación</h3>
            <p>Elige una conversación de la lista para comenzar a chatear</p>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Header */}
          <div className="bg-[#1E1F20] p-4 border-b border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {currentChat.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <h3 className="text-white font-semibold">
                  {currentChat.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {currentChat.isOnline ? 'En línea' : currentChat.name}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <img 
                  src={message.user.avatar} 
                  alt={message.user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-medium">{message.user.name}</span>
                    <span className="text-xs text-gray-400">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-300">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-[#1E1F20] p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  className="w-full bg-[#282828] text-white placeholder-gray-400 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="absolute right-3 top-3 text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              </div>
              <button
                onClick={handleSendMessage}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --- Main ChatPanel Component ---
const ChatPanel: React.FC<ChatPanelProps> = ({ activeChannel, channelType = 'chat', isSidebarView, onChatSelect }) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'groups'>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');

  // Dummy data for demonstration
  const chats: ChatGroup[] = [
    {
      id: '1',
      name: 'Ana García',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=32&h=32&fit=crop&crop=face',
      lastMessage: {
        id: '1',
        user: { id: '2', name: 'Ana García', avatar: '' },
        content: 'Hola! ¿Cómo va el proyecto?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        isRead: false
      },
      unreadCount: 2,
      isOnline: true
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      lastMessage: {
        id: '2',
        user: { id: '3', name: 'Carlos Rodríguez', avatar: '' },
        content: 'Perfecto, nos vemos mañana',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isRead: true
      },
      unreadCount: 0,
      isOnline: false
    },
    {
      id: '3',
      name: 'María López',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      lastMessage: {
        id: '3',
        user: { id: '4', name: 'María López', avatar: '' },
        content: '👍',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isRead: true
      },
      unreadCount: 0,
      isOnline: true
    }
  ];

  const groups: ChatGroup[] = [
    {
      id: 'g1',
      name: 'Equipo de Desarrollo',
      unreadCount: 5,
      lastMessage: {
        id: 'g1-1',
        user: { id: '2', name: 'Ana García', avatar: '' },
        content: 'Tenemos que revisar el diseño',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        isRead: false
      }
    },
    {
      id: 'g2',
      name: 'Marketing',
      unreadCount: 0,
      lastMessage: {
        id: 'g2-1',
        user: { id: '5', name: 'Pedro Martín', avatar: '' },
        content: 'Excelente trabajo en la campaña',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        isRead: true
      }
    }
  ];

  const filteredChats = (activeTab === 'chats' ? chats : groups).filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentChat = filteredChats.find(chat => chat.id === activeChannel);

  if (isSidebarView) {
    console.log("ChatPanel: Rendering ChatListSidebar with isSidebarView=true");
    return (
      <ChatListSidebar 
        activeChannel={activeChannel}
        onChatSelect={onChatSelect}
        chats={chats}
        groups={groups}
        searchQuery={searchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSearchQuery={setSearchQuery}
      />
    );
  } else {
    console.log("ChatPanel: Rendering ChatConversationMain with isSidebarView=false");
    return (
      <ChatConversationMain
        currentChat={currentChat}
        activeChannel={activeChannel}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        handleSendMessage={() => {
          if (messageInput.trim()) {
            console.log('Sending message:', messageInput);
            setMessageInput('');
          }
        }}
        channelType={channelType}
        onChatSelect={onChatSelect}
      />
    );
  }
};

export default ChatPanel; 