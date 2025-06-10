import React, { useState } from 'react';
import { useAlert } from '../../hooks/useAlert';
import projectService, { type ProjectMember } from '../../services/projectService';

interface ProjectMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: ProjectMember[];
  projectName: string;
  projectId: string;
  currentUserId?: string;
  userRole?: 'owner' | 'admin' | 'member';
  onInviteClick?: () => void;
  onMemberRoleChanged?: () => void;
}

const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({ 
  isOpen, 
  onClose, 
  members, 
  projectName,
  projectId,
  currentUserId,
  userRole,
  onInviteClick,
  onMemberRoleChanged
}) => {
  const { showSuccess, showError } = useAlert();
  const [changingRoles, setChangingRoles] = useState<Set<string>>(new Set());
  if (!isOpen) return null;

  const getRoleIcon = (role: 'owner' | 'admin' | 'member') => {
    switch (role) {
      case 'owner':
        return '⭐';
      case 'admin':
        return '🛡️';
      default:
        return '👤';
    }
  };

  const getRoleLabel = (role: 'owner' | 'admin' | 'member') => {
    switch (role) {
      case 'owner':
        return 'Propietario';
      case 'admin':
        return 'Colaborador';
      default:
        return 'Miembro';
    }
  };

  const getRoleColor = (role: 'owner' | 'admin' | 'member') => {
    switch (role) {
      case 'owner':
        return 'text-yellow-400';
      case 'admin':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getInitials = (nombre: string, apellidos: string): string => {
    const firstName = nombre.charAt(0).toUpperCase();
    const lastName = apellidos.charAt(0).toUpperCase();
    return firstName + lastName;
  };

  const handleRoleChange = async (memberId: string, currentRole: 'admin' | 'member', memberName: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    
    // Add to changing roles set
    setChangingRoles(prev => new Set(prev).add(memberId));
    
    try {
      const response = await projectService.changeMemberRole(projectId, memberId, newRole);
      console.log('Role change response:', response);
      
      showSuccess(
        'Rol actualizado',
        `${memberName} ahora es ${newRole === 'admin' ? 'colaborador' : 'miembro'}.`
      );
      
      // Notify parent to refresh member list
      onMemberRoleChanged?.();
      
    } catch (error: any) {
      console.error('Error changing member role:', error);
      console.error('Error details:', {
        projectId,
        memberId,
        newRole,
        error: error.message
      });
      
      // Handle specific API errors
      let errorMessage = 'Error al cambiar el rol del miembro';
      
      // Check if it's a formatted error from the service
      if (error.message) {
        if (error.message.includes('insufficient-permissions')) {
          errorMessage = 'No tienes permisos para cambiar roles';
        } else if (error.message.includes('project-not-found')) {
          errorMessage = 'Proyecto no encontrado';
        } else if (error.message.includes('Unauthorized')) {
          errorMessage = 'Sesión expirada. Inicia sesión nuevamente';
        } else if (error.message.includes('member-not-found')) {
          errorMessage = 'Miembro no encontrado en el proyecto';
        } else {
          errorMessage = error.message;
        }
      }
      
      showError('Error al cambiar rol', errorMessage);
      
    } finally {
      // Remove from changing roles set
      setChangingRoles(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
      <div className="rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden backdrop-blur-sm flex flex-col" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        {/* Header */}
        <div className="p-6 border-b border-gray-600 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Miembros del Proyecto</h2>
              <p className="text-gray-400 text-sm mt-1">{projectName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="p-4 flex-1 overflow-hidden">
          <div className="space-y-3 h-full overflow-y-auto scrollbar-custom">
            {members.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-4">👥</div>
                <div>No hay miembros en este proyecto</div>
              </div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 hover:bg-opacity-30 transition-colors">
                  {/* Avatar */}
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: '#007AFF20', color: '#007AFF' }}
                  >
                    {getInitials(member.nombre, member.apellidos)}
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium">
                      {member.nombre} {member.apellidos}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-lg">{getRoleIcon(member.role)}</span>
                      <span className={`text-sm ${getRoleColor(member.role)}`}>
                        {getRoleLabel(member.role)}
                      </span>
                    </div>
                  </div>

                  {/* Role Change Button & Status */}
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    {/* Role Change Button - Only for owners, not for self, not for other owners */}
                    {userRole === 'owner' && 
                     member.role !== 'owner' && 
                     member.id !== currentUserId && (
                      <button
                        onClick={() => handleRoleChange(member.id, member.role as 'admin' | 'member', `${member.nombre} ${member.apellidos}`)}
                        disabled={changingRoles.has(member.id)}
                        className="px-2 py-1 text-xs rounded-lg border border-gray-500 hover:border-blue-400 text-gray-300 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={member.role === 'admin' ? 'Cambiar a miembro' : 'Promover a colaborador'}
                      >
                        {changingRoles.has(member.id) ? (
                          <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full"></div>
                        ) : (
                          <>
                            {member.role === 'admin' ? (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                            )}
                          </>
                        )}
                      </button>
                    )}
                    
                    {/* Status Indicator */}
                    <div className={`w-2 h-2 rounded-full ${
                      member.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-600 flex-shrink-0">
          <div className="text-center text-sm text-gray-400">
            {members.length} {members.length === 1 ? 'miembro' : 'miembros'} en total
          </div>
          {userRole && ['owner', 'admin'].includes(userRole) && (
            <div className="mt-3">
              <button
                onClick={onInviteClick}
                className="w-full px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition-colors font-medium"
              >
                Invitar Miembros
              </button>
            </div>
          )}
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
  );
};

export default ProjectMembersModal; 