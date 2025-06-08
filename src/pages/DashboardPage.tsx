import React, { useState } from 'react';
import CollapsibleSidebar from '../components/CollapsibleSidebar';
import MainContent from '../components/MainContent';
import Logo from '../components/Logo';

const DashboardPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'home' | 'friends' | 'conversations'>('home');

  const handleLogoClick = () => {
    setSelectedMenuItem(null);
    setActiveView('home');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Main Web Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700 px-6 py-4 flex-shrink-0 relative z-30">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div onClick={handleLogoClick} className="cursor-pointer">
              <Logo />
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <button
                onClick={() => setActiveView('home')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-2 ${
                  activeView === 'home'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Inicio</span>
              </button>
              <button
                onClick={() => setActiveView('conversations')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-2 ${
                  activeView === 'conversations'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Conversaciones</span>
              </button>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="hidden md:flex relative">
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

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

            {/* Divider */}
            <div className="h-6 w-px bg-gray-600" />

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face" 
                alt="Usuario"
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">Juan Pérez</p>
                <p className="text-xs text-gray-400">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar */}
        <CollapsibleSidebar
          isOpen={isSidebarOpen}
          isPinned={isSidebarPinned}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onPin={() => setIsSidebarPinned(!isSidebarPinned)}
          onMenuItemSelect={setSelectedMenuItem}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <MainContent selectedItem={selectedMenuItem} activeView={activeView} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 