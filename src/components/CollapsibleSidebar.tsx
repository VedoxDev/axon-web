import React, { useState } from 'react';
import ChatPanel from './ChatPanel';

interface SidebarProps {
  onMenuItemSelect?: (itemId: string) => void;
  onChatSelect?: (chatId: string | null) => void;
  selectedChatId: string | null;
}

interface SidebarSection {
  id: string;
  title: string;
  sectionIcon: React.ReactNode;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

const CollapsibleSidebar: React.FC<SidebarProps> = ({ 
  onMenuItemSelect,
  onChatSelect,
  selectedChatId,
}) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project>({
    id: '1',
    name: 'Axon Dashboard',
    color: 'from-indigo-500 to-purple-600'
  });
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isGeneralChat, setIsGeneralChat] = useState(false);

  const members: Member[] = [
    { id: '1', name: 'Juan Pérez', avatar: 'JP', status: 'online' },
    { id: '2', name: 'María García', avatar: 'MG', status: 'away' },
    { id: '3', name: 'Carlos López', avatar: 'CL', status: 'offline' },
  ];

  const projects: Project[] = [
    { id: '1', name: 'Axon Dashboard', color: 'from-indigo-500 to-purple-600' },
    { id: '2', name: 'Project Alpha', color: 'from-blue-500 to-cyan-600' },
    { id: '3', name: 'Project Beta', color: 'from-green-500 to-emerald-600' },
    { id: '4', name: 'Project Gamma', color: 'from-red-500 to-pink-600' },
  ];

  const handleItemClick = (itemId: string) => {
    setSelectedItem(itemId);
    if (selectedProject.id === 'chat') {
      setSelectedProject(projects[0]);
    }
    if (onMenuItemSelect) {
      onMenuItemSelect(itemId);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setIsProjectMenuOpen(false);
  };

  const menuSections: SidebarSection[] = [
    {
      id: "tasks",
      title: "Tareas",
      sectionIcon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: "general-chat",
      title: "Chat",
      sectionIcon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      id: "calendar",
      title: "Itinerario",
      sectionIcon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    /*{
      id: "activity",
      title: "Actividad",
      sectionIcon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: "files",
      title: "Archivos",
      sectionIcon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "meetings",
      title: "Reuniones",
      sectionIcon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },*/
    {
      id: "announcements",
      title: "Anuncios",
      sectionIcon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    
  ];

  // Discord-style project bar
  const getProjectColor = (project: Project) => {
    if (project.color) return project.color;
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-orange-500'
    ];
    return colors[parseInt(project.id) % colors.length];
  };

  return (
    <div className="flex h-full">
      {/* Discord-style vertical project bar */}
      <div className="w-16 bg-[#151718] flex flex-col items-center py-3 space-y-2">
        {/* Chat Button */}
        <div className="relative group">
          <div 
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center cursor-pointer transition-all duration-200 hover:rounded-xl ${
              selectedProject.id === 'chat' ? 'rounded-xl ring-4 ring-orange-500 ring-opacity-50' : ''
            }`}
            onClick={() => {
              setSelectedProject({id: 'chat', name: 'Chat', color: 'from-blue-500 to-indigo-600'});
              if (onMenuItemSelect) onMenuItemSelect('chat');
            }}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          {selectedProject.id === 'chat' && (
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full -ml-2" />
          )}
          {/* Tooltip */}
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Chat
          </div>
        </div>

        {/* Project Icons */}
        {projects.map((project) => (
          <div key={project.id} className="relative group">
            <div 
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${project.color} flex items-center justify-center cursor-pointer transition-all duration-200 hover:rounded-xl overflow-hidden ${
                selectedProject.id === project.id ? 'rounded-xl ring-4 ring-orange-500 ring-opacity-50' : ''
              }`}
              onClick={() => {
                setSelectedProject(project);
                if (onMenuItemSelect) onMenuItemSelect(project.id);
              }}
            >
              <span className="text-white font-bold text-xl">
                {project.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {selectedProject.id === project.id && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full -ml-2" />
            )}
            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {project.name}
            </div>
          </div>
        ))}
        {/* Add Project Button */}
        <div className="relative group">
          <div 
            className="w-12 h-12 rounded-2xl bg-gray-700 hover:bg-orange-600 flex items-center justify-center cursor-pointer transition-all duration-200 hover:rounded-xl"
            onClick={() => setIsProjectMenuOpen(true)}
          >
            <svg className="w-6 h-6 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          {/* Tooltip */}
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Agregar Proyecto
          </div>
        </div>
      </div>

      {/* Main sidebar content */}
      <div className="bg-[#151718] h-full border border-gray-700 flex flex-col w-72 lg:w-80 min-w-0 relative flex-1" style={{height: '100vh'}}>
        {selectedProject.id === 'chat' ? (
          <ChatPanel 
            activeChannel={selectedChatId || null}
            isSidebarView={true}
            onChatSelect={onChatSelect}
          />
        ) : (
          <>
            {/* Sidebar Header */}
            <div className="flex flex-col border-b border-gray-700 flex-shrink-0 px-6">
              {/* Top Section: Logo and Title */}
              <div className="flex items-center justify-between py-4">
                {/* Logo and Title Area */}
                <div className="flex items-center space-x-3 min-w-0 flex-grow mr-4 relative">
                  <span className={`w-8 h-8 bg-gradient-to-br ${selectedProject.color} rounded-lg flex items-center justify-center flex-shrink-0 transition-opacity text-white font-bold text-sm`}>{selectedProject.name.charAt(0).toUpperCase()}</span>
                  <span className="text-white font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-lg">
                    {selectedProject.name}
                  </span>
                </div>
              </div>

              {/* Bottom Section: Members */}
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Miembros</span>
                  <div className="flex items-center space-x-0.5">
                    {members.slice(0, 4).map((member, idx) => (
                      <div
                        key={member.id}
                        className="relative z-10"
                        style={{ marginLeft: idx === 0 ? 0 : '-0.7rem' }}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white ${
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
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-800 ${
                            member.status === 'online'
                              ? 'bg-green-500'
                              : member.status === 'away'
                              ? 'bg-yellow-500'
                              : 'bg-gray-500'
                          }`}
                        />
                      </div>
                    ))}
                    {members.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm -ml-3 cursor-pointer relative z-0">
                        +{members.length - 4}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsMembersOpen(!isMembersOpen)}
                  className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {menuSections.map((section) => (
                <div
                  key={section.id}
                  className={`flex items-center px-6 py-3 cursor-pointer transition-colors ${
                    selectedItem === section.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => handleItemClick(section.id)}
                >
                  {section.sectionIcon}
                  <span className="ml-3 text-sm font-medium">{section.title}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CollapsibleSidebar; 