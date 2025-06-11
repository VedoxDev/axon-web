import React, { useState, useEffect } from 'react';
import { useAlert } from '../../hooks/useAlert';
import projectService, { type SearchUser, type ProjectMember } from '../../services/projectService';

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  currentMembers: ProjectMember[];
  onMembersInvited?: () => void;
}

const InviteMembersModal: React.FC<InviteMembersModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  currentMembers,
  onMembersInvited
}) => {
  const { showSuccess, showError } = useAlert();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Debounced search effect
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  // Fetch current user ID when modal opens
  useEffect(() => {
    if (isOpen && !currentUserId) {
      const fetchCurrentUser = async () => {
        try {
          const user = await projectService.getCurrentUser();
          setCurrentUserId(user.id);
        } catch (error) {
          console.error('Error fetching current user:', error);
        }
      };
      fetchCurrentUser();
    }
  }, [isOpen, currentUserId]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
      setIsUserModalOpen(false);
    }
  }, [isOpen]);

  const searchUsers = async (query: string) => {
    try {
      setIsSearching(true);
      const results = await projectService.searchUsers(query);
      
      // Filter out current project members and current user
      const currentMemberIds = new Set(currentMembers.map(member => member.id));
      const filteredResults = results.users.filter(user => 
        !currentMemberIds.has(user.id) && user.id !== currentUserId
      );
      
      setSearchResults(filteredResults);
    } catch (error: any) {
      console.error('Error searching users:', error);
      showError(error.message || 'Error al buscar usuarios', 'Error de búsqueda');
    } finally {
      setIsSearching(false);
    }
  };

  const selectUser = (user: SearchUser) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(prev => [...prev, user]);
      // Remove from search results to avoid duplicates
      setSearchResults(prev => prev.filter(u => u.id !== user.id));
      // Clear search query to hide the dropdown
      setSearchQuery('');
    }
  };

  const removeUser = (user: SearchUser) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    // Add back to search results if search query matches
    if (searchQuery.trim() && user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) {
      setSearchResults(prev => [...prev, user]);
    }
  };

  const handleInviteUsers = async () => {
    if (selectedUsers.length === 0) {
      showError('Selecciona al menos un usuario para invitar', 'Sin usuarios seleccionados');
      return;
    }

    setIsInviting(true);

    try {
      // Send all invitations in parallel
      const invitationPromises = selectedUsers.map(async (user) => {
        try {
          await projectService.inviteUserToProject(projectId, user.id);
          return { user, success: true };
        } catch (error: any) {
          console.error(`Error inviting ${user.fullName}:`, error);
          
          // Handle specific API errors
          let errorMessage = `Error al invitar a ${user.fullName}`;
          if (error.response?.data?.message) {
            switch (error.response.data.message) {
              case 'user-to-invite-not-found':
                errorMessage = `Usuario ${user.fullName} no encontrado`;
                break;
              case 'user-already-member':
                errorMessage = `${user.fullName} ya es miembro del proyecto`;
                break;
              case 'invitation-already-pending':
                errorMessage = `${user.fullName} ya tiene una invitación pendiente`;
                break;
              case 'insufficient-permissions':
                errorMessage = 'No tienes permisos para invitar miembros';
                break;
              case 'Unauthorized':
                errorMessage = 'Sesión expirada. Inicia sesión nuevamente';
                break;
              case 'project-not-found':
                errorMessage = 'Proyecto no encontrado';
                break;
              default:
                errorMessage = `Error al invitar a ${user.fullName}: ${error.response.data.message}`;
            }
          }
          
          return { user, success: false, error, errorMessage };
        }
      });

      const invitationResults = await Promise.allSettled(invitationPromises);
      const successful = invitationResults.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;
      
      const failed = invitationResults.filter(result => 
        result.status === 'fulfilled' && !result.value.success
      );
      
      if (successful === selectedUsers.length) {
        if (successful === 1) {
          showSuccess(
            '¡Invitación enviada! 🎉', 
            `${selectedUsers[0].fullName} ha sido invitado al proyecto "${projectName}".`
          );
        } else {
          showSuccess(
            '¡Invitaciones enviadas!', 
            `Se enviaron ${successful} invitaciones exitosamente a "${projectName}".`
          );
        }
      } else if (successful > 0) {
        // Show partial success with specific errors
        const errorMessages = failed.map(result => 
          result.status === 'fulfilled' ? result.value.errorMessage : 'Error desconocido'
        ).join('\n');
        
        showSuccess(
          'Invitaciones parciales', 
          `${successful} de ${selectedUsers.length} invitaciones enviadas exitosamente.\n\nErrores:\n${errorMessages}`
        );
      } else {
        // Show specific errors when all failed
        const errorMessages = failed.slice(0, 3).map(result => 
          result.status === 'fulfilled' ? result.value.errorMessage : 'Error desconocido'
        ).join('\n');
        
        const moreErrors = failed.length > 3 ? `\n... y ${failed.length - 3} errores más` : '';
        
        showError(
          'Error al enviar invitaciones', 
          `No se pudo enviar ninguna invitación:\n\n${errorMessages}${moreErrors}`
        );
      }

      // Notify parent component to refresh member list
      onMembersInvited?.();
      handleClose();
      
    } catch (error: any) {
      console.error('Error in invitation process:', error);
      showError(error.message || 'Error al enviar invitaciones', 'Error');
    } finally {
      setIsInviting(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    setIsUserModalOpen(false);
    onClose();
  };

  const getUserInitials = (user: SearchUser) => {
    return `${user.nombre.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();
  };

  // Calculate position for floating search results
  const getSearchResultsPosition = () => {
    if (!searchInputRef.current) {
      return { display: 'none' };
    }
    
    const rect = searchInputRef.current.getBoundingClientRect();
    return {
      position: 'fixed' as const,
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 9999
    };
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
      <div className="rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden backdrop-blur-sm flex flex-col" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-600 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Invitar Miembros
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Añadir personas a "{projectName}"
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isInviting}
              className="text-gray-400 hover:text-white transition-colors disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="p-4 border-b border-gray-600 flex-shrink-0">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar personas por nombre o email..."
              disabled={isInviting}
              className="w-full px-4 py-3 rounded-xl border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#3A3A3A', color: 'white' }}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isSearching ? (
                <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full"></div>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>


          </div>

          {/* Selected Users Summary */}
          {selectedUsers.length > 0 && (
            <div className="mt-4">
              <div 
                className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-opacity-80"
                style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
                onClick={() => setIsUserModalOpen(true)}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-green-300 font-medium">
                    {selectedUsers.length} persona{selectedUsers.length !== 1 ? 's' : ''} serán invitada{selectedUsers.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedUsers.slice(0, 3).map((user) => (
                    <div
                      key={user.id}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: '#007AFF', color: 'white' }}
                    >
                      {getUserInitials(user)}
                    </div>
                  ))}
                  {selectedUsers.length > 3 && (
                    <span className="text-green-400 text-sm">+{selectedUsers.length - 3}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty space for layout - search results are now truly floating */}
        <div className="flex-1"></div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-600 flex-shrink-0">
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={isInviting}
              className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 hover:bg-opacity-50 transition-all duration-200 font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleInviteUsers}
              disabled={selectedUsers.length === 0 || isInviting}
              className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-xl transition-colors font-medium disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isInviting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Enviando...
                </>
              ) : (
                'Enviar Invitaciones'
              )}
            </button>
          </div>
        </div>



        <style dangerouslySetInnerHTML={{
          __html: `
            .scrollbar-custom {
              scrollbar-width: thin;
              scrollbar-color: rgba(75, 85, 99, 0.3) transparent;
            }
            
            .scrollbar-custom::-webkit-scrollbar {
              width: 4px;
            }
            
            .scrollbar-custom::-webkit-scrollbar-track {
              background: transparent;
            }
            
            .scrollbar-custom::-webkit-scrollbar-thumb {
              background-color: rgba(75, 85, 99, 0.3);
              border-radius: 2px;
            }
            
            .scrollbar-custom::-webkit-scrollbar-thumb:hover {
              background-color: rgba(75, 85, 99, 0.5);
            }
          `
        }} />
      </div>
    </div>
    
    {/* Floating Search Results - Completely outside modal */}
    {searchQuery.trim() && (
      <div 
        className="border border-gray-600 rounded-xl shadow-2xl max-h-64 overflow-y-auto scrollbar-custom"
        style={{
          ...getSearchResultsPosition(),
          backgroundColor: 'var(--color-bg-secondary)'
        }}
      >
        {searchResults.length === 0 && !isSearching ? (
          <div className="p-4 text-center text-gray-400">
            <div className="text-2xl mb-2">🔍</div>
            <div>No se encontraron usuarios</div>
          </div>
        ) : (
          <div className="p-2">
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: '#007AFF20', color: '#007AFF' }}
                  >
                    {getUserInitials(user)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{user.fullName}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => selectUser(user)}
                  disabled={isInviting}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors font-medium disabled:cursor-not-allowed"
                >
                  Añadir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
    
    {/* User Management Modal - Outside main modal structure */}
    {isUserModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
        <div 
          className="rounded-xl p-6 w-full max-w-md max-h-[80vh] flex flex-col border-2 border-blue-500 shadow-2xl"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="text-lg font-semibold text-white">Usuarios Seleccionados</h3>
            <button
              onClick={() => setIsUserModalOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-custom">
            <div className="space-y-3">
              {selectedUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-600"
                  style={{ backgroundColor: 'rgba(75, 85, 99, 0.3)' }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: '#007AFF', color: 'white' }}
                    >
                      {getUserInitials(user)}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{user.fullName}</div>
                      <div className="text-gray-400 text-xs">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeUser(user)}
                    disabled={isInviting}
                    className="text-red-400 hover:text-red-300 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default InviteMembersModal; 