import React from 'react';

interface ProjectMember {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
}

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'tasks' | 'calendar' | 'activity' | 'files' | 'meetings' | 'announcements';
  unreadCount?: number;
  icon?: string;
}

interface ProjectPanelProps {
  project: {
    id: string;
    name: string;
    description: string;
    progress: number;
    completedTasks: number;
    totalTasks: number;
    members: ProjectMember[];
    channels: Channel[];
  } | null;
  activeChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
}

const ProjectPanel: React.FC<ProjectPanelProps> = ({ 
  project, 
  activeChannelId, 
  onChannelSelect 
}) => {
  if (!project) {
    return (
      <div className="flex-1 bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">Selecciona un proyecto</h3>
          <p className="text-sm">Elige un proyecto para ver sus detalles y canales</p>
        </div>
      </div>
    );
  }

  const getChannelIcon = (channel: Channel) => {
    switch (channel.type) {
      case 'tasks':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'text':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'activity':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'files':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'meetings':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'announcements':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        );
      case 'voice':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
    }
  };

  const getChannelDisplayName = (channel: Channel) => {
    const nameMap: { [key: string]: string } = {
      'tasks': 'Tareas',
      'text': 'Chat',
      'calendar': 'Calendario', 
      'activity': 'Actividad',
      'files': 'Archivos',
      'meetings': 'Reuniones',
      'announcements': 'Anuncios'
    };
    return nameMap[channel.type] || channel.name;
  };

  return (
    <div className="flex-1 bg-gray-900 overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto">
        {/* Project Card */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <div>
                <h2 className="text-white font-semibold text-xl">{project.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{project.description}</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>

          {/* Progress Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-gray-300">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{project.completedTasks}/{project.totalTasks} Tareas</span>
              </div>
              <span className="text-white font-semibold text-lg">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Members */}
          <div className="flex items-center">
            <div className="flex -space-x-2 mr-3">
              {project.members.slice(0, 3).map((member, index) => (
                <img 
                  key={member.id}
                  src={member.avatar} 
                  alt={member.name}
                  className="w-8 h-8 rounded-full border-2 border-gray-800"
                  style={{ zIndex: 10 - index }}
                />
              ))}
              {project.members.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">+{project.members.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Channels Section */}
        <div className="mb-6">
          <h3 className="text-white font-semibold text-lg mb-4 uppercase tracking-wider">Canales</h3>
          <div className="space-y-2">
            {project.channels.map((channel) => (
              <div
                key={channel.id}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeChannelId === channel.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => onChannelSelect(channel.id)}
              >
                <div className="flex items-center">
                  <div className={`mr-3 ${activeChannelId === channel.id ? 'text-white' : 'text-gray-400'}`}>
                    {getChannelIcon(channel)}
                  </div>
                  <span className="font-medium">{getChannelDisplayName(channel)}</span>
                </div>
                {channel.unreadCount && channel.unreadCount > 0 && (
                  <div className={`text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold ${
                    activeChannelId === channel.id 
                      ? 'bg-white text-blue-600' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {channel.unreadCount > 9 ? '9+' : channel.unreadCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPanel; 