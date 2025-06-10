import React, { useState, useEffect, useRef } from 'react';

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
    content: 'Hola a todos en el chat general!',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    isRead: false
  },
  {
    id: '2',
    user: {
      id: '1',
      name: 'Yo',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'
    },
    content: '¡Hola! ¿Cómo va todo el mundo hoy?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isRead: true
  },
  {
    id: '3',
    user: {
      id: '3',
      name: 'Carlos Rodríguez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    content: 'Todo bien por aquí, ¡gracias!',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    isRead: false
  }
];

const GeneralChat: React.FC = () => {
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(), // Unique ID for the message
        user: {
          id: '1', // Assuming 'Yo' is the current user
          name: 'Yo',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'
        },
        content: messageInput,
        timestamp: new Date(),
        isRead: false // Messages sent by self are read
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setMessageInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-[#1E1F20] p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">G</span>
          </div>
          <div className="ml-3">
            <h3 className="text-white font-semibold text-lg">Chat General</h3>
            <p className="text-sm text-gray-400">Todos los miembros</p>
          </div>
        </div>
        {/* Optional: Add buttons for members list, settings, etc. */}
        <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide min-h-0">
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
              <p className="text-gray-300 text-base">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-[#1E1F20] p-4 flex-shrink-0">
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
    </div>
  );
};

export default GeneralChat; 