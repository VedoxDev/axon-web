import React, { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  isPinned: boolean;
  onToggle: () => void;
  onPin: () => void;
  onMenuItemSelect?: (itemId: string) => void;
}

interface SidebarSection {
  id: string;
  title: string;
  sectionIcon: React.ReactNode;
}

const CollapsibleSidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  isPinned, 
  onToggle, 
  onPin, 
  onMenuItemSelect 
}) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleItemClick = (itemId: string) => {
    setSelectedItem(itemId);
    if (onMenuItemSelect) {
      onMenuItemSelect(itemId);
    }
    // Close sidebar if not pinned
    if (!isPinned) {
      onToggle();
    }
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
      id: "chat",
      title: "Chat",
      sectionIcon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      id: "calendar",
      title: "Calendario",
      sectionIcon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "activity",
      title: "ACtividad",
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
    },
    {
      id: "announcements",
      title: "Anuncios",
      sectionIcon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    }
  ];

  return (
    <div className={`
      bg-gray-800 border-r border-gray-700 h flex flex-col transition-all duration-300 ease-in-out
      ${isOpen ? 'w-75' : 'w-0'}
      ${!isOpen ? 'overflow-hidden' : 'overflow-visible'}
    `}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        {/* Logo and Title Area */}
        <div className="flex items-center space-x-3 min-w-0 flex-grow mr-4">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {isOpen && (
            <span className="text-white font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              Axon Dashboard
            </span>
          )}
        </div>
        {/* Sidebar Actions (Pin/Close Buttons) */}
        {isOpen && (
          <div className="flex items-center space-x-2 flex-shrink-0 pl-4">
            <button
              onClick={onPin}
              className={`p-1.5 rounded transition-colors ${
                isPinned
                  ? 'text-white-400 hover:text-white bg-blue-400 '
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title={isPinned ? 'Desanclar sidebar' : 'Anclar sidebar'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            {!isPinned && (
              <button
                onClick={onToggle}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation - Scrollable */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-5 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {menuSections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleItemClick(section.id)}
              className={`flex items-center w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors group ${
                selectedItem === section.id ? 'bg-gray-700 text-white' : ''
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="text-gray-400 group-hover:text-gray-300 flex-shrink-0">
                  {section.sectionIcon}
                </div>
                <span className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{section.title}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      
    </div>
  );
};

export default CollapsibleSidebar; 