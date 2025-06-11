import React, { useState, useEffect } from 'react';
import { useAlert } from '../hooks/useAlert';
import announcementService, { type Announcement } from '../services/announcementService';
import { projectService, type ProjectMember } from '../services/projectService';
import CreateAnnouncementModal from './modals/CreateAnnouncementModal';

interface ProjectAnnouncementsProps {
  projectId: string | undefined;
  projectName: string;
}

const ProjectAnnouncements: React.FC<ProjectAnnouncementsProps> = ({
  projectId,
  projectName
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'member' | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const { showError } = useAlert();

  useEffect(() => {
    if (projectId) {
      loadAnnouncements();
      loadUserRole();
    } else {
      setIsLoading(false);
      setAnnouncements([]);
      setUserRole(null);
    }
  }, [projectId]);

  const loadAnnouncements = async () => {
    if (!projectId) return;
    
    try {
      setIsLoading(true);
      const data = await announcementService.getProjectAnnouncements(projectId);
      setAnnouncements(data);
    } catch (error: any) {
      console.error('Error loading announcements:', error);
      showError('Error al cargar anuncios', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRole = async () => {
    if (!projectId) return;
    
    try {
      const currentUser = await projectService.getCurrentUser();
      setCurrentUserId(currentUser.id);
      
      const projectDetails = await projectService.getProjectDetails(projectId);
      const userMember = projectDetails.members.find((member: ProjectMember) => member.id === currentUser.id);
      setUserRole(userMember?.role || null);
    } catch (error: any) {
      console.error('Error loading user role:', error);
    }
  };

  const handleAnnouncementCreated = () => {
    loadAnnouncements();
  };

  const handleMarkAsRead = async (announcementId: string) => {
    try {
      await announcementService.markAnnouncementAsRead(announcementId);
      
      // Update local state
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement.id === announcementId 
            ? { ...announcement, isRead: true }
            : announcement
        )
      );
    } catch (error: any) {
      console.error('Error marking announcement as read:', error);
      // Don't show error to user for read tracking
    }
  };

  const canCreateAnnouncements = userRole === 'owner' || userRole === 'admin';

  const AnnouncementCard: React.FC<{ announcement: Announcement }> = ({ announcement }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const typeColor = announcementService.getAnnouncementTypeColor(announcement.type);
    const typeIcon = announcementService.getAnnouncementTypeIcon(announcement.type);
    const formattedDate = announcementService.formatDate(announcement.createdAt);

    const handleCardClick = () => {
      if (!announcement.isRead) {
        handleMarkAsRead(announcement.id);
      }
      setIsExpanded(!isExpanded);
    };

    const getCreatorInitials = (createdBy: Announcement['createdBy']): string => {
      return `${createdBy.nombre.charAt(0)}${createdBy.apellidos.charAt(0)}`.toUpperCase();
    };

    return (
      <div 
        className={`rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
          announcement.isRead 
            ? 'bg-gray-800/50 border-l-gray-600' 
            : 'bg-gray-700/80 border-l-orange-400'
        }`}
        style={{ 
          backgroundColor: announcement.isRead ? '#2D2D2D' : '#161718',
          borderLeftColor: announcement.isRead 
            ? '#6B7280' 
            : announcement.type === 'urgent' 
              ? '#EF4444' 
              : announcement.type === 'warning'
                ? '#F59E0B'
                : announcement.type === 'success'
                  ? '#10B981'
                  : '#3B82F6'
        }}
        onClick={handleCardClick}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-lg flex-shrink-0">{typeIcon}</span>
              <h3 className={`font-semibold text-white truncate ${!announcement.isRead ? 'font-bold' : ''}`}>
                {announcement.title}
              </h3>
              {announcement.pinned && (
                <span className="text-orange-400 flex-shrink-0" title="Anuncio fijado">📌</span>
              )}
              {!announcement.isRead && (
                <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0" title="No leído" />
              )}
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formattedDate}</span>
          </div>

          {/* Content Preview */}
          <div className="mb-3">
            <p className={`text-gray-100 text-sm ${
              isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'
            }`}>
              {announcement.content}
            </p>
            {announcement.content.length > 100 && !isExpanded && (
              <button className="text-blue-400 text-xs mt-1 hover:text-blue-300 font-medium">
                Ver más...
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: '#007AFF30', color: '#007AFF' }}
                title={announcement.createdBy.fullName}
              >
                {getCreatorInitials(announcement.createdBy)}
              </div>
              <span className="text-xs text-gray-300 font-medium">
                {announcement.createdBy.fullName}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">
                {announcementService.getAnnouncementTypeLabel(announcement.type)}
              </span>
              <svg 
                className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handle no project selected case
  if (!projectId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📢</div>
          <h3 className="text-xl font-semibold text-white mb-2">Selecciona un Proyecto</h3>
          <p className="text-gray-400">
            Para ver anuncios, primero selecciona un proyecto de la barra lateral.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            📢 Anuncios
          </h1>
          <p className="text-gray-400 text-sm mt-1">{projectName}</p>
        </div>
        
        {canCreateAnnouncements && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>📢</span>
            Crear Anuncio
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Announcements List */}
      {!isLoading && (
        <>
          {announcements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-xl font-semibold text-white mb-2">No hay anuncios</h3>
              <p className="text-gray-400 mb-4">
                {canCreateAnnouncements 
                  ? 'Sé el primero en crear un anuncio para el equipo'
                  : 'Aún no hay anuncios en este proyecto'
                }
              </p>
              {canCreateAnnouncements && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  Crear Primer Anuncio
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Announcements */}
              {announcements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Announcement Modal */}
      {projectId && (
        <CreateAnnouncementModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onAnnouncementCreated={handleAnnouncementCreated}
          projectId={projectId}
          projectName={projectName}
        />
      )}

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProjectAnnouncements; 