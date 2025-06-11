import React, { useState, useEffect } from 'react';
import { announcementService } from '../../services/announcementService';
import { projectService } from '../../services/projectService';
import { useAlert } from '../../hooks/useAlert';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  pinned: boolean;
  project: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    nombre: string;
    apellidos: string;
    fullName: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementsData {
  announcements: Announcement[];
  unreadCount: number;
  stats: {
    total: number;
    unread: number;
    urgent: number;
    pinned: number;
  };
}

interface Invitation {
  id: string;
  project: {
    id: string;
    name: string;
    description: string | null;
  };
  inviter: {
    id: string;
    nombre: string;
    apellidos: string;
  };
  role: string;
  createdAt: string;
}

const ActivityModal: React.FC<ActivityModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'announcements' | 'invitations'>('announcements');
  const [announcements, setAnnouncements] = useState<AnnouncementsData | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [respondingInvitation, setRespondingInvitation] = useState<string | null>(null);
  const { showSuccess, showError } = useAlert();

  // Fetch announcements
  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const data = await announcementService.getUserAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      showError('Error al cargar los anuncios');
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // Fetch invitations
  const fetchInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const data = await projectService.getPendingInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      showError('Error al cargar las invitaciones');
    } finally {
      setLoadingInvitations(false);
    }
  };

  // Mark announcement as read
  const handleAnnouncementClick = async (announcementId: string) => {
    if (!announcements) return;
    
    const announcement = announcements.announcements.find(a => a.id === announcementId);
    if (!announcement || announcement.isRead) return;

    try {
      await announcementService.markAnnouncementAsRead(announcementId);
      
      // Update local state
      setAnnouncements(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          announcements: prev.announcements.map(a => 
            a.id === announcementId ? { ...a, isRead: true } : a
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1),
          stats: {
            ...prev.stats,
            unread: Math.max(0, prev.stats.unread - 1)
          }
        };
      });
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  // Respond to invitation
  const handleInvitationResponse = async (invitationId: string, action: 'accept' | 'reject') => {
    setRespondingInvitation(invitationId);
    try {
      await projectService.respondToInvitation(invitationId, action);
      
      // Remove invitation from list
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      showSuccess(
        action === 'accept' 
          ? 'Invitación aceptada correctamente' 
          : 'Invitación rechazada'
      );
    } catch (error) {
      console.error('Error responding to invitation:', error);
      showError('Error al responder la invitación');
    } finally {
      setRespondingInvitation(null);
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAnnouncements();
      fetchInvitations();
    }
  }, [isOpen]);

  // Get creator initials
  const getCreatorInitials = (createdBy: { nombre: string; apellidos: string }): string => {
    return `${createdBy.nombre.charAt(0)}${createdBy.apellidos.charAt(0)}`.toUpperCase();
  };

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] rounded-lg shadow-xl z-50 flex flex-col" style={{ backgroundColor: '#161718' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h2 className="text-xl font-semibold text-white">Actividad</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-600">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'announcements'
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            style={activeTab === 'announcements' ? { backgroundColor: '#3A3A3A' } : {}}
          >
            Anuncios
            {announcements && announcements.unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-orange-100 bg-orange-500 rounded-full">
                {announcements.unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'invitations'
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            style={activeTab === 'invitations' ? { backgroundColor: '#3A3A3A' } : {}}
          >
            Invitaciones
            {invitations.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full">
                {invitations.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[400px] max-h-[500px] custom-scrollbar">
          {activeTab === 'announcements' && (
            <div>
              {loadingAnnouncements ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
                </div>
              ) : !announcements || announcements.announcements.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📢</div>
                  <div className="text-gray-400 text-lg mb-2">No hay anuncios</div>
                  <div className="text-gray-500 text-sm">Los anuncios de tus proyectos aparecerán aquí</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      onClick={() => handleAnnouncementClick(announcement.id)}
                      className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${
                        announcement.type === 'info' ? 'border-l-blue-400' :
                        announcement.type === 'success' ? 'border-l-green-400' :
                        announcement.type === 'warning' ? 'border-l-yellow-400' :
                        'border-l-red-400'
                      }`}
                      style={{ 
                        backgroundColor: !announcement.isRead ? '#3A3A3A' : '#2D2D2D'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3A3A3A'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !announcement.isRead ? '#3A3A3A' : '#2D2D2D'}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {announcement.pinned && <span className="text-orange-400">📌</span>}
                          <span className={`text-sm ${
                            announcement.type === 'info' ? 'text-blue-400' :
                            announcement.type === 'success' ? 'text-green-400' :
                            announcement.type === 'warning' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {announcement.type === 'info' ? 'ℹ️' :
                             announcement.type === 'success' ? '✅' :
                             announcement.type === 'warning' ? '⚠️' :
                             '🚨'}
                          </span>
                          {!announcement.isRead && (
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(announcement.createdAt)}
                        </span>
                      </div>
                      
                      <h4 className={`font-medium mb-2 ${
                        !announcement.isRead ? 'text-white' : 'text-gray-200'
                      }`}>
                        {announcement.title}
                      </h4>
                      
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {announcement.content}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold"
                          >
                            {getCreatorInitials(announcement.createdBy)}
                          </div>
                          <span>{announcement.createdBy.fullName}</span>
                        </div>
                        <span className="text-orange-400 font-medium">
                          {announcement.project.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'invitations' && (
            <div>
              {loadingInvitations ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
                </div>
              ) : invitations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">✉️</div>
                  <div className="text-gray-400 text-lg mb-2">No hay invitaciones</div>
                  <div className="text-gray-500 text-sm">Las invitaciones a proyectos aparecerán aquí</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="p-4 rounded-lg border border-gray-600"
                      style={{ backgroundColor: '#3A3A3A' }}
                    >
                                             <div className="flex items-start justify-between mb-3">
                         <div>
                           <p className="text-white text-sm mb-2">
                             <span className="font-medium">{invitation.inviter.nombre} {invitation.inviter.apellidos}</span> te ha invitado a colaborar en el proyecto <span className="text-orange-400 font-medium">"{invitation.project.name}"</span>
                           </p>
                           {invitation.project.description && (
                             <p className="text-gray-300 text-xs">
                               {invitation.project.description}
                             </p>
                           )}
                         </div>
                         <span className="text-xs text-gray-400">
                           {formatRelativeTime(invitation.createdAt)}
                         </span>
                       </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleInvitationResponse(invitation.id, 'accept')}
                          disabled={respondingInvitation === invitation.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                        >
                          {respondingInvitation === invitation.id ? 'Aceptando...' : 'Aceptar'}
                        </button>
                        <button
                          onClick={() => handleInvitationResponse(invitation.id, 'reject')}
                          disabled={respondingInvitation === invitation.id}
                          className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                        >
                          {respondingInvitation === invitation.id ? 'Rechazando...' : 'Rechazar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
};

export default ActivityModal; 