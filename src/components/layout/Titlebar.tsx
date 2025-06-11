import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTitlebar, useSidebar, useLayout } from '../../contexts/LayoutContext';
import { useAlert } from '../../hooks/useAlert';
import authService from '../../services/authService';
import { projectService } from '../../services/projectService';
import type { CurrentUser, SearchUser } from '../../services/projectService';
import Logo from '../Logo';
import UserProfileModal from '../modals/UserProfileModal';
import PasswordChangeModal from '../modals/PasswordChangeModal';
import ActivityModal from '../modals/ActivityModal';
import PersonalTasksModal from '../modals/PersonalTasksModal';

interface TitlebarProps {
  className?: string;
}

const Titlebar: React.FC<TitlebarProps> = ({ className = '' }) => {
  const { showBackButton, isElectron } = useTitlebar();
  const { toggle: toggleSidebar, selectItem } = useSidebar();
  const { actions } = useLayout();
  const navigate = useNavigate();
  const { showSuccess } = useAlert();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await projectService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  // Extract initials from name
  const getInitials = (user: CurrentUser | null): string => {
    if (!user) return 'U';
    
    const firstName = user.nombre.charAt(0).toUpperCase();
    const lastName = user.apellidos.charAt(0).toUpperCase();
    return firstName + lastName;
  };

  // Get display name (first word of nombre + first word of apellidos)
  const getDisplayName = (user: CurrentUser | null): string => {
    if (!user) return 'Usuario';
    
    const firstName = user.nombre.split(' ')[0]; // Take first word of nombre
    const firstLastName = user.apellidos.split(' ')[0]; // Take first word of apellidos
    return `${firstName} ${firstLastName}`;
  };

  const handleBackClick = () => {
    selectItem(null);
  };

  const handleLogout = () => {
    authService.logout();
    showSuccess('Sesión cerrada correctamente', 'Hasta pronto');
    navigate('/', { replace: true });
    setIsUserMenuOpen(false);
  };

  // Search users with debounce
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await projectService.searchUsers(query, 8);
      // Filter out current user from results
      const filteredResults = response.users.filter(user => user.id !== currentUser?.id);
      setSearchResults(filteredResults);
      setShowSearchResults(true);
    } catch (error: any) {
      console.error('Error searching users:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = window.setTimeout(() => {
      searchUsers(query);
    }, 300);
  };

  // Handle user selection to start chat
  const handleUserSelect = (user: SearchUser) => {
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    
    // Switch to chat and select the user - this handles everything in one action
    actions.switchToChat(user.id);
  };

  // Close search results when clicking outside
  const handleClickOutside = () => {
    setShowSearchResults(false);
  };

  // Get user initials for avatar
  const getUserInitials = (user: SearchUser): string => {
    return `${user.nombre.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();
  };

  return (
    <div className={`titlebar-container ${className}`}>
      {/* Left Section - Logo and Navigation */}
      <div className="titlebar-left">
        {/* Sidebar Toggle (Mobile) */}
        <button 
          className="titlebar-interactive titlebar-button sidebar-toggle md:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Back Button (when applicable) */}
        {showBackButton && (
          <button 
            className="titlebar-interactive titlebar-button back-button"
            onClick={handleBackClick}
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Logo */}
        <div className="logo-container">
          <Logo className="logo" clickable={false} />
        </div>
      </div>

      {/* Center Section - Drag Region (Electron) */}
      <div className="titlebar-center electron-drag-region">
        {/* This area will be draggable in Electron */}
      </div>

      {/* Right Section - Actions and Controls */}
      <div className="titlebar-right">
        {/* Notifications */}
        <button 
          className="titlebar-interactive titlebar-button notification-button"
          onClick={() => setIsActivityModalOpen(true)}
          aria-label="Notifications"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>



        {/* Tasks */}
        <button 
          className="titlebar-interactive titlebar-button"
          onClick={() => setIsTasksModalOpen(true)}
          aria-label="Tasks"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </button>

        {/* Search */}
        <div className="titlebar-interactive search-container hidden lg:flex">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Buscar usuarios para chatear..."
            className="titlebar-search"
          />
          <div className="search-icon">
            {isSearching ? (
              <div className="animate-spin w-4 h-4 border border-gray-400 border-t-transparent rounded-full"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          {/* Floating Search Results */}
          {showSearchResults && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={handleClickOutside}
              />
              
              {/* Results Dropdown */}
              <div className="absolute top-full left-0 right-0 mt-2 border border-gray-600 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                {searchResults.length === 0 && !isSearching ? (
                  <div className="p-4 text-center text-gray-400">
                    <div className="text-2xl mb-2">🔍</div>
                    <div className="text-sm">No se encontraron usuarios</div>
                  </div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((user) => (
                      <div 
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="flex items-center px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-3"
                          style={{ backgroundColor: '#007AFF20', color: '#007AFF' }}
                        >
                          {getUserInitials(user)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{user.fullName}</div>
                          <div className="text-gray-400 text-sm truncate">{user.email}</div>
                        </div>
                        <div className="text-xs text-gray-500 ml-2">
                          💬 Chat
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <div 
            className="titlebar-interactive user-menu"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <div className="user-avatar-initials">
              {getInitials(currentUser)}
            </div>
            <div className="user-info hidden sm:block">
              <p className="user-name">{getDisplayName(currentUser)}</p>
            </div>
            <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsUserMenuOpen(false)}
              />
              
              {/* Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 border border-gray-600 rounded-lg shadow-xl z-50" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-600">
                    <p className="text-sm font-medium text-white">{getDisplayName(currentUser)}</p>
                    {currentUser && (
                      <p className="text-xs text-gray-400">{currentUser.email}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Perfil
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsPasswordChangeModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M 7 5 C 3.1545455 5 0 8.1545455 0 12 C 0 15.845455 3.1545455 19 7 19 C 9.7749912 19 12.089412 17.314701 13.271484 15 L 16 15 L 16 18 L 22 18 L 22 15 L 24 15 L 24 9 L 23 9 L 13.287109 9 C 12.172597 6.6755615 9.8391582 5 7 5 z M 7 7 C 9.2802469 7 11.092512 8.4210017 11.755859 10.328125 L 11.988281 11 L 22 11 L 22 13 L 20 13 L 20 16 L 18 16 L 18 13 L 12.017578 13 L 11.769531 13.634766 C 11.010114 15.575499 9.1641026 17 7 17 C 4.2454545 17 2 14.754545 2 12 C 2 9.2454545 4.2454545 7 7 7 z M 7 9 C 5.3549904 9 4 10.35499 4 12 C 4 13.64501 5.3549904 15 7 15 C 8.6450096 15 10 13.64501 10 12 C 10 10.35499 8.6450096 9 7 9 z M 7 11 C 7.5641294 11 8 11.435871 8 12 C 8 12.564129 7.5641294 13 7 13 C 6.4358706 13 6 12.564129 6 12 C 6 11.435871 6.4358706 11 7 11 z"></path>
                    </svg>
                    Cambiar contraseña
                  </button>
                  
                  <div className="border-t border-gray-600 my-1"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Space for future Electron titlebar buttons */}
        {isElectron && (
          <div className="electron-controls electron-no-drag">
            {/* This space will be used for minimize, maximize, close buttons in Electron */}
            {/* For now, it's empty but reserves space */}
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={isPasswordChangeModalOpen}
        onClose={() => setIsPasswordChangeModalOpen(false)}
      />

      {/* Activity Modal */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
      />

      {/* Personal Tasks Modal */}
      <PersonalTasksModal
        isOpen={isTasksModalOpen}
        onClose={() => setIsTasksModalOpen(false)}
      />

      <style>{`
        .titlebar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: 0 var(--spacing-md);
          background: var(--color-bg-primary);
          color: var(--color-text-primary);
          position: relative;
          width: 100%;
        }

        .titlebar-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          flex-shrink: 0;
          z-index: 10;
        }

        .titlebar-center {
          flex: 1;
          height: 100%;
          min-width: 0;
          max-width: 100%;
        }

        .titlebar-right {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          flex-shrink: 0;
          z-index: 10;
          justify-content: flex-end;
          margin-left: auto;
        }

        .titlebar-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          border-radius: 8px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .titlebar-button:hover {
          background: var(--color-bg-surface);
          color: var(--color-text-primary);
        }

        .sidebar-toggle {
          display: flex;
        }

        @media (min-width: 768px) {
          .sidebar-toggle {
            display: none;
          }
        }

        .logo-container {
          cursor: pointer;
          display: flex;
          align-items: center;
          border-radius: 8px;
          padding: var(--spacing-xs);
          transition: all var(--transition-fast);
        }

        .logo-container:hover {
          background: var(--color-bg-surface);
        }

        .logo {
          height: 40px;
          width: auto;
        }

        .notification-button {
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: var(--color-accent-error);
          border-radius: 50%;
        }

        .search-container {
          position: relative;
          min-width: 280px;
        }

        .titlebar-search {
          width: 100%;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-default);
          border-radius: 8px;
          padding: 8px 12px 8px 40px;
          color: var(--color-text-primary);
          font-size: 0.9rem;
          transition: all var(--transition-fast);
        }

        .titlebar-search:focus {
          outline: none;
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 0 2px rgba(255, 148, 34, 0.1);
        }

        .titlebar-search::placeholder {
          color: var(--color-text-tertiary);
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-tertiary);
          pointer-events: none;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: 8px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .user-menu:hover {
          background: var(--color-bg-surface);
        }

        .user-avatar-initials {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #42A5F5; /* Light blue background */
          color: #1565C0; /* Stronger/darker blue for letters */
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-text-primary);
          margin: 0;
          line-height: 1.2;
        }

        .electron-controls {
          width: 138px; /* Typical width for Windows titlebar buttons */
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-left: var(--spacing-sm);
        }

        /* Responsive adjustments */
        @media (max-width: 767px) {
          .titlebar-container {
            padding: 0 var(--spacing-sm);
            justify-content: space-between;
          }

          .search-container {
            display: none;
          }

          .titlebar-right {
            margin-left: auto;
          }
        }

        @media (max-width: 1023px) {
          .search-container {
            min-width: 150px;
          }
        }
      `}</style>
    </div>
  );
};

export default Titlebar; 