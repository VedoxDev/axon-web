import React, { useState } from 'react';
import TaskBoard from './TaskBoard/TaskBoard';
import ActivityView from './ActivityView/ActivityView';
import MeetingsView from './MeetingsView/MeetingsView';
import AnnouncementsView from './AnnouncementsView/AnnouncementsView';
import FilesView from './FilesView/FilesView';
import CalendarView from './CalendarView/CalendarView';
import MembersPanel from './MembersPanel';

interface MainContentProps {
  selectedItem?: string | null;
  activeView: 'home' | 'friends' | 'conversations';
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member';
  roleTitle?: string;
  status?: 'online' | 'away' | 'offline';
}

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

const MainContent: React.FC<MainContentProps> = ({ selectedItem, activeView }) => {
  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false);

  // Render the appropriate view based on selectedItem
  const renderSelectedView = () => {
    switch (selectedItem) {
      case 'tasks':
        return <TaskBoard />;
      case 'chat':
        return <div className="h-full p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6">Chat del Proyecto</h2>
              {/* Chat content will go here */}
            </div>
          </div>
        </div>;
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
      default:
        // Home, Friends, or Conversations view
        if (activeView === 'home') {
          return (
            <div className="h-full">
              <div className="max-w-7xl mx-auto p-6">
                {/* Welcome Section */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-2">¡Bienvenido, Juan Pérez!</h1>
                      <p className="text-gray-400">Aquí tienes un resumen de tu actividad y proyectos.</p>
                    </div>
                    <div className="flex space-x-4">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Nuevo Proyecto</span>
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Mensajes</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Proyectos Activos</h3>
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">6</div>
                    <div className="text-sm text-gray-400">+2 desde el mes pasado</div>
                  </div>

                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Tareas Pendientes</h3>
                      <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">23</div>
                    <div className="text-sm text-gray-400">5 vencidas</div>
                  </div>

                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Mensajes Sin Leer</h3>
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">15</div>
                    <div className="text-sm text-gray-400">3 urgentes</div>
                  </div>

                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Reuniones Hoy</h3>
                      <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">4</div>
                    <div className="text-sm text-gray-400">Próxima en 30 min</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Actividad Reciente</h2>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white">Nuevo proyecto creado: <span className="font-semibold">Axon Dashboard</span></p>
                        <p className="text-sm text-gray-400">Hace 2 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white">Tarea completada: <span className="font-semibold">Diseñar interfaz de usuario</span></p>
                        <p className="text-sm text-gray-400">Hace 3 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white">Nuevo mensaje de <span className="font-semibold">María García</span></p>
                        <p className="text-sm text-gray-400">Hace 5 horas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        } else if (activeView === 'friends') {
          return (
            <div className="h-full p-3">
              <div className="h-full">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Amigos</h2>
                    <div className="space-y-4">
                      {/* Friend List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="h-full p-3">
              <div className="h-full">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Conversaciones</h2>
                    <div className="space-y-4">
                      {/* Conversation List */}
                      <div className="space-y-4">
                        {members.map((member) => (
                          <div key={member.id} className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer">
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
                              <div className="flex items-center justify-between">
                                <h3 className="text-white font-medium">{member.name}</h3>
                                <span className="text-sm text-gray-400">12:30 PM</span>
                              </div>
                              <p className="text-sm text-gray-400 truncate">
                                Último mensaje de la conversación...
                              </p>
                            </div>
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

  return (
    <div className="flex-1 p-3 bg-gray-900 flex flex-col">
      {/* Main Content Area with Members Panel */}
      <div className="flex-1 h-full relative">
        {renderSelectedView()}

        {/* Members Panel */}
        
      </div>
    </div>
  );
};

export default MainContent; 