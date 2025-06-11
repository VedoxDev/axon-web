import React, { useState, useEffect } from 'react';
import { projectService, type UserProfile } from '../../services/projectService';
import { useAlert } from '../../hooks/useAlert';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string; // Optional - if provided, shows that user's profile, otherwise current user
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, userId }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'projects'>('overview');
  const { showError } = useAlert();

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profileData = userId 
        ? await projectService.getUserProfileById(userId)
        : await projectService.getUserProfile();
      setProfile(profileData);
    } catch (error: any) {
      showError('Error al cargar perfil', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDatetime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (nombre: string, apellidos: string): string => {
    const firstName = nombre.charAt(0).toUpperCase();
    const lastName = apellidos.charAt(0).toUpperCase();
    return firstName + lastName;
  };

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

  const getActivityIcon = (type: 'task' | 'message' | 'call') => {
    switch (type) {
      case 'task':
        return '📋';
      case 'message':
        return '💬';
      case 'call':
        return '📞';
      default:
        return '📄';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSpanishAction = (action: string) => {
    const translations: { [key: string]: string } = {
      'created': 'creó',
      'assigned': 'asignó',
      'sent': 'envió',
      'initiated': 'inició',
      'joined': 'se unió',
      'completed': 'completó',
      'updated': 'actualizó'
    };
    return translations[action] || action;
  };

  const getSpanishType = (type: string) => {
    const translations: { [key: string]: string } = {
      'task': 'tarea',
      'message': 'mensaje',
      'call': 'llamada'
    };
    return translations[type] || type;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
      <div className="rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden backdrop-blur-sm" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        {/* Header */}
        <div className="p-6 text-white" style={{ backgroundColor: '#282828' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {profile && (
                <>
                                     <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: '#007AFF20', color: '#007AFF' }}>
                     {getInitials(profile.nombre, profile.apellidos)}
                   </div>
                  <div>
                    <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                    <p className="text-blue-100">{profile.email}</p>
                    <p className="text-blue-200 text-sm">
                      Miembro desde {formatDate(profile.memberSince)}
                    </p>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : profile ? (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-600" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
              <div className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Resumen', icon: '📊' },
                  { id: 'activity', label: 'Actividad', icon: '📈' },
                  { id: 'projects', label: 'Proyectos', icon: '🗂️' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-custom">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Quick Stats */}
                  <div className="lg:col-span-3 space-y-6">
                    {/* Statistics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="rounded-lg p-4 text-center" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
                        <div className="text-2xl font-bold text-blue-400">{profile.stats.totalProjects}</div>
                        <div className="text-sm text-gray-400">Proyectos</div>
                      </div>
                      <div className="rounded-lg p-4 text-center" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
                        <div className="text-2xl font-bold text-green-400">{profile.stats.tasksCompleted}</div>
                        <div className="text-sm text-gray-400">Tareas Completadas</div>
                      </div>
                      <div className="rounded-lg p-4 text-center" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
                        <div className="text-2xl font-bold text-purple-400">{profile.stats.messagesSent}</div>
                        <div className="text-sm text-gray-400">Mensajes</div>
                      </div>
                      <div className="rounded-lg p-4 text-center" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
                        <div className="text-2xl font-bold text-orange-400">{profile.stats.callsParticipated}</div>
                        <div className="text-sm text-gray-400">Llamadas</div>
                      </div>
                    </div>

                    {/* Task Performance */}
                    <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
                      <h3 className="text-lg font-semibold text-white mb-4">Rendimiento de Tareas</h3>
                      <div className="space-y-4">
                        {/* Completion Rate */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-300">Tasa de Completitud</span>
                            <span className={`text-sm font-semibold ${getScoreColor(profile.stats.completionRate)}`}>
                              {profile.stats.completionRate}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${profile.stats.completionRate}%` }}
                            />
                          </div>
                        </div>

                        {/* Task Distribution */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-semibold text-green-400">{profile.stats.tasksCompleted}</div>
                            <div className="text-xs text-gray-400">Completadas</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-yellow-400">{profile.stats.tasksInProgress}</div>
                            <div className="text-xs text-gray-400">En Progreso</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-red-400">{profile.stats.tasksPending}</div>
                            <div className="text-xs text-gray-400">Pendientes</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insights & Roles */}
                  <div className="space-y-6">
                    {/* Combined Insights and Roles Card */}
                    <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
                      <div className="grid grid-cols-2 gap-6">
                        {/* Insights Section */}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4">Insights</h3>
                          <div className="space-y-4">
                            {/* Collaboration Score */}
                            <div className="text-center">
                              <div className="relative w-16 h-16 mx-auto mb-2">
                                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-600" />
                                  <circle 
                                    cx="50" 
                                    cy="50" 
                                    r="40" 
                                    stroke="currentColor" 
                                    strokeWidth="8" 
                                    fill="none" 
                                    className={getScoreColor(profile.insights.collaborationScore)}
                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - profile.insights.collaborationScore / 100)}`}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className={`text-sm font-bold ${getScoreColor(profile.insights.collaborationScore)}`}>
                                    {profile.insights.collaborationScore}
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs text-gray-400">Colaboración</div>
                            </div>
                            
                            {/* Leadership Score */}
                            <div className="text-center">
                              <div className="relative w-16 h-16 mx-auto mb-2">
                                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-600" />
                                  <circle 
                                    cx="50" 
                                    cy="50" 
                                    r="40" 
                                    stroke="currentColor" 
                                    strokeWidth="8" 
                                    fill="none" 
                                    className={getScoreColor(profile.insights.leadershipScore)}
                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - profile.insights.leadershipScore / 100)}`}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className={`text-sm font-bold ${getScoreColor(profile.insights.leadershipScore)}`}>
                                    {profile.insights.leadershipScore}
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs text-gray-400">Liderazgo</div>
                            </div>
                          </div>
                        </div>

                        {/* Roles Section */}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4">Roles</h3>
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="text-xl font-bold text-yellow-400 mb-1">{profile.stats.ownerProjects}</div>
                              <div className="text-xs text-gray-400">⭐ Propietario</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-blue-400 mb-1">{profile.stats.adminProjects}</div>
                              <div className="text-xs text-gray-400">🛡️ Admin</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-400 mb-1">{profile.stats.memberProjects}</div>
                              <div className="text-xs text-gray-400">👤 Miembro</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Insights - Full Width */}
                      <div className="mt-6 pt-4 border-t border-gray-600 space-y-3">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Actividad Principal</div>
                          <div className="text-white capitalize">
                            {profile.insights.peakActivityType === 'communication' ? 'Comunicación' : 'Gestión de Tareas'}
                          </div>
                        </div>

                        {profile.insights.mostActiveProject && (
                          <div>
                            <div className="text-sm text-gray-400 mb-1">Proyecto Más Activo</div>
                            <div className="text-white">{profile.insights.mostActiveProject}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h3>
                  {profile.recentActivity.length > 0 ? (
                                         <div className="space-y-3">
                       {profile.recentActivity.map((activity, index) => (
                         <div key={index} className="rounded-lg p-4 flex items-start space-x-3" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
                          <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-white font-medium capitalize">{getSpanishAction(activity.action)}</span>
                              <span className="text-gray-400 text-sm capitalize">{getSpanishType(activity.type)}</span>
                            </div>
                            <div className="text-gray-300 mb-1">{activity.title}</div>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              {activity.project && (
                                <span>📁 {activity.project}</span>
                              )}
                              {activity.recipient && (
                                <span>👤 {activity.recipient}</span>
                              )}
                              <span>🕐 {formatDatetime(activity.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <div className="text-4xl mb-4">📝</div>
                      <div>No hay actividad reciente</div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Proyectos Activos</h3>
                  {profile.projects.length > 0 ? (
                                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {profile.projects.map((project) => (
                         <div key={project.id} className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {project.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-white font-medium">{project.name}</span>
                            </div>
                            <span className="text-xl">{getRoleIcon(project.role)}</span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Tareas:</span>
                              <span className="text-blue-400 font-semibold">{project.taskCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Mensajes:</span>
                              <span className="text-purple-400 font-semibold">{project.messageCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Rol:</span>
                              <span className="text-white capitalize">
                                {project.role === 'owner' ? 'Propietario' : 
                                 project.role === 'admin' ? 'Administrador' : 'Miembro'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <div className="text-4xl mb-4">📁</div>
                      <div>No hay proyectos activos</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">😔</div>
            <div>Error al cargar el perfil</div>
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
          
          .scrollbar-custom::-webkit-scrollbar-corner {
            background: transparent;
          }
        `
      }} />
    </div>
  );
};

export default UserProfileModal; 