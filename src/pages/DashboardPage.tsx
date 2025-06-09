import React, { useState } from 'react';
import CollapsibleSidebar from '../components/CollapsibleSidebar';
import MainContent from '../components/MainContent';
import Logo from '../components/Logo';

const DashboardPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'home' | 'friends' | 'conversations'>('home');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const handleLogoClick = () => {
    setSelectedMenuItem(null);
    setActiveView('home');
    setSelectedChatId(null);
  };

  const handleChatSelect = (chatId: string | null) => {
    setSelectedChatId(chatId);
    if (chatId) {
      setSelectedMenuItem('chat');
    } else if (selectedMenuItem === 'chat') {
      setSelectedMenuItem('chat');
    }
  };

  const style = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

  return (
    <div className="h-screen overflow-hidden bg-[#151718] text-white flex flex-col">
      {/* Main Web Header */}
      <header className="bg-[#151718] shadow-lg border-b border-gray-700 px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex-shrink-0 relative z-30">
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-2 md:gap-0">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <div onClick={handleLogoClick} className="cursor-pointer flex-shrink-0">
              <Logo className="h-10 w-auto sm:h-12 md:h-16" />
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap md:flex-nowrap min-w-0">
            {/* Home */}
            <button onClick={handleLogoClick} className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>           

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Search */}
            <div className="hidden md:flex relative min-w-[120px] md:min-w-[200px] lg:min-w-[256px]">
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-[#2D2D2D] text-white placeholder-gray-400 border border-gray-600 rounded-lg px-2 md:px-4 py-2 pr-8 md:pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
              />
              <div className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-600 hidden sm:block" />

            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face" 
                alt="Usuario"
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden sm:block min-w-0">
                <p className="text-sm font-medium text-white truncate">Juan Pérez</p>
                <p className="text-xs text-gray-400 truncate">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden w-full">
        {/* Collapsible Sidebar */}
        <CollapsibleSidebar
          onMenuItemSelect={setSelectedMenuItem}
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChatId}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto w-full hide-scrollbar">
          <MainContent 
            selectedItem={selectedMenuItem} 
            activeView={activeView}
            selectedChatId={selectedChatId}
          />
        </div>
      </div>
      <style>{style}</style>
    </div>
  );
};

export default DashboardPage; 