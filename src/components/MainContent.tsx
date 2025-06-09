import React, { useState } from 'react';
import TaskBoard from './TaskBoard/TaskBoard';
import ActivityView from './ActivityView/ActivityView';
import MeetingsView from './MeetingsView/MeetingsView';
import AnnouncementsView from './AnnouncementsView/AnnouncementsView';
import FilesView from './FilesView/FilesView';
import CalendarView from './CalendarView/CalendarView';
import MembersPanel from './MembersPanel';
import ChatPanel from './ChatPanel';
import GeneralChat from './GeneralChat/GeneralChat';

interface MainContentProps {
  selectedItem?: string | null;
  activeView: 'home' | 'friends' | 'conversations';
  selectedChatId: string | null;
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member';
  roleTitle?: string;
  status?: 'online' | 'away' | 'offline';
}

const style = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

// Members data for header
const members: Member[] = [
  { id: '1', name: 'Raúl Martínez', avatar: 'RM', role: 'owner', roleTitle: 'Project Manager', status: 'online' },
  { id: '2', name: 'José Martínez', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', role: 'admin', roleTitle: 'Lead Developer', status: 'away' },
  { id: '3', name: 'Valeria Gómez', avatar: 'VG', role: 'admin', roleTitle: 'Lead Designer', status: 'offline' },
  { id: '4', name: 'Iván Méndez', avatar: 'IM', role: 'member', roleTitle: 'Developer', status: 'online' },
  { id: '5', name: 'Extra 1', avatar: 'E1', role: 'member', roleTitle: 'Developer', status: 'online' },
  { id: '6', name: 'Extra 2', avatar: 'E2', role: 'member', roleTitle: 'Designer', status: 'away' },
  { id: '7', name: 'Extra 3', avatar: 'E3', role: 'member', roleTitle: 'Developer', status: 'offline' },
  { id: '8', name: 'Extra 4', avatar: 'E4', role: 'member', roleTitle: 'Developer', status: 'online' },
  { id: '9', name: 'Extra 5', avatar: 'E5', role: 'member', roleTitle: 'Designer', status: 'online' },
];

const MainContent: React.FC<MainContentProps> = ({ selectedItem, activeView, selectedChatId }) => {
  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false);

  // Render the appropriate view based on selectedItem
  const renderSelectedView = () => {
    if (selectedItem === 'chat') {
      // If selectedItem is 'chat', we show the full conversation only if a chat is selected
      if (selectedChatId) {
        return <ChatPanel activeChannel={selectedChatId} isSidebarView={false} />;
      } else {
        return null; // Or a placeholder if no specific chat is selected in main view
      }
    }

    switch (selectedItem) {
      case 'home':
        return (
          <div className="h-full flex flex-col items-center justify-center p-6 ">
            <div className="max-w-2xl w-full bg-[#151718] border border-gray-700 rounded-2xl p-8 flex flex-col items-center shadow-lg">
              <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <h2 className="text-2xl font-bold text-white mb-2">Bienvenido al Dashboard de Axon</h2>
              <p className="text-gray-400 mb-4 text-center">Selecciona un proyecto o una función del menú lateral para comenzar.</p>
              {/* You can add more dashboard content here */}
              <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">(Contenido de la vista principal)</div>
            </div>
          </div>
        );
      case 'tasks':
        return <TaskBoard />;
      case 'calendar':
        return <CalendarView />;
      case 'activity':
        return <ActivityView />;
      case 'files':
        return <FilesView />;
      case 'meetings':
        return <MeetingsView />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'general-chat':
        return <GeneralChat />;
      default:
        // Home, Friends, or Conversations view
        if (activeView === 'home') {
          return (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className=" flex flex-row space-x-10 w-full max-w-5xl">
                {/* Tarjeta 1 */}
                <div className="flex-1 bg-[#151718] border border-gray-700 rounded-2xl p-8 flex flex-col items-center shadow-lg">
                  <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <h2 className="text-2xl font-bold text-white mb-2">¡Comienza un nuevo proyecto!</h2>
                  <p className="text-gray-400 mb-4 text-center">Crea un proyecto para organizar tus tareas, equipos y objetivos.</p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-lg">Nuevo Proyecto</button>
                </div>

                {/* Tarjeta 2 */}
                <div className="flex-1 bg-[#151718] border border-gray-700 rounded-2xl p-8 flex flex-col items-center shadow-lg">
                  <svg className="w-12 h-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-white mb-2">¡Comienza a chatear con amigos!</h2>
                  <p className="text-gray-400 mb-4 text-center">Conéctate y conversa con tus amigos en tiempo real.</p>
                  <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-lg">Chatear Ahora</button>
                </div>
              </div>
            </div>
          );
        } else if (activeView === 'friends') {
          return (
            <div className="h-full p-2 sm:p-3 md:p-4 ">
              <div className="h-full w-full">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-[#151718] border border-gray-700 rounded-lg p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Amigos</h2>
                    <div className="space-y-3 sm:space-y-4">
                      {/* Friend List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {members.map((member) => (
                          <div key={member.id} className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg">
                            <div className="relative">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium text-white ${
                                  typeof member.avatar === 'string' && member.avatar.startsWith('http')
                                    ? ''
                                    : 'bg-gray-600'
                                }`}
                                style={{
                                  backgroundImage:
                                    typeof member.avatar === 'string' && member.avatar.startsWith('http')
                                      ? `url(${member.avatar})`
                                      : undefined,
                                  backgroundSize: 'cover',
                                }}
                              >
                                {!(typeof member.avatar === 'string' && member.avatar.startsWith('http')) &&
                                  member.avatar}
                              </div>
                              <div
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                                  member.status === 'online'
                                    ? 'bg-green-500'
                                    : member.status === 'away'
                                    ? 'bg-yellow-500'
                                    : 'bg-gray-500'
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-medium">{member.name}</h3>
                              <p className="text-sm text-gray-400">{member.roleTitle}</p>
                            </div>
                            <button className="text-blue-400 hover:text-blue-300 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        } else {
          // Conversations view
          return (
            <div className="h-full p-2 sm:p-3 md:p-4 ">
              <div className="h-full w-full">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-[#151718] border border-gray-700 rounded-lg p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Conversaciones</h2>
                    <div className="space-y-3 sm:space-y-4">
                      {/* Conversation List */}
                      <div className="space-y-3 sm:space-y-4">
                        {members.map((member) => (
                          <div key={member.id} className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg">
                            <div className="relative">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium text-white ${
                                  typeof member.avatar === 'string' && member.avatar.startsWith('http')
                                    ? ''
                                    : 'bg-gray-600'
                                }`}
                                style={{
                                  backgroundImage:
                                    typeof member.avatar === 'string' && member.avatar.startsWith('http')
                                      ? `url(${member.avatar})`
                                      : undefined,
                                  backgroundSize: 'cover',
                                }}
                              >
                                {!(typeof member.avatar === 'string' && member.avatar.startsWith('http')) &&
                                  member.avatar}
                              </div>
                              <div
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                                  member.status === 'online'
                                    ? 'bg-green-500'
                                    : member.status === 'away'
                                    ? 'bg-yellow-500'
                                    : 'bg-gray-500'
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-medium">{member.name}</h3>
                              <p className="text-sm text-gray-400">{member.roleTitle}</p>
                            </div>
                            <button className="text-blue-400 hover:text-blue-300 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
    }
  };

  return <div className="flex-1 flex flex-col h-full overflow-y-auto w-full hide-scrollbar">{renderSelectedView()}</div>;
};

export default MainContent; 