import { API_BASE_URL } from '../config/apiConfig';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  pinned: boolean;
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

export interface CreateAnnouncementData {
  title: string;
  content: string;
  type?: 'info' | 'warning' | 'success' | 'urgent';
  pinned?: boolean;
}

export interface CreateAnnouncementResponse {
  message: string;
  announcement: {
    id: string;
    title: string;
    content: string;
    type: string;
    pinned: boolean;
    createdAt: string;
  };
}

export interface UserAnnouncementsResponse {
  announcements: (Announcement & {
    project: {
      id: string;
      name: string;
    };
  })[];
  unreadCount: number;
  stats: {
    total: number;
    unread: number;
    urgent: number;
    pinned: number;
  };
}

class AnnouncementService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private formatError(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (Array.isArray(error)) {
      return error.join(', ');
    }
    
    // Map server error messages to user-friendly messages
    const errorMap: { [key: string]: string } = {
      'insufficient-permissions': 'No tienes permisos para realizar esta acción',
      'project-not-found': 'Proyecto no encontrado',
      'announcement-not-found-or-no-access': 'Anuncio no encontrado o sin acceso',
      'title-required': 'El título es requerido',
      'content-required': 'El contenido es requerido',
      'title-too-short': 'El título debe tener al menos 3 caracteres',
      'title-too-long': 'El título no puede exceder 200 caracteres',
      'content-too-short': 'El contenido debe tener al menos 10 caracteres',
      'content-too-long': 'El contenido no puede exceder 2000 caracteres',
      'type-must-be-info-warning-success-or-urgent': 'Tipo de anuncio inválido',
      'pinned-must-be-boolean': 'El valor de anclado debe ser verdadero o falso',
      'invalid-project-id': 'ID de proyecto inválido',
      'invalid-announcement-id': 'ID de anuncio inválido'
    };
    
    return errorMap[error] || error || 'Error desconocido';
  }

  async getProjectAnnouncements(projectId: string): Promise<Announcement[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/announcements`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(this.formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al cargar anuncios');
    }
  }

  async createAnnouncement(projectId: string, data: CreateAnnouncementData): Promise<CreateAnnouncementResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/announcements`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(this.formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al crear anuncio');
    }
  }

  async getUserAnnouncements(): Promise<UserAnnouncementsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me/announcements`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(this.formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al cargar anuncios del usuario');
    }
  }

  async markAnnouncementAsRead(announcementId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/announcements/${announcementId}/read`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(this.formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al marcar anuncio como leído');
    }
  }

  // Utility methods
  getAnnouncementTypeColor(type: Announcement['type']): string {
    switch (type) {
      case 'info':
        return 'border-blue-500 bg-blue-50 text-blue-900';
      case 'success':
        return 'border-green-500 bg-green-50 text-green-900';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 text-yellow-900';
      case 'urgent':
        return 'border-red-500 bg-red-50 text-red-900';
      default:
        return 'border-gray-500 bg-gray-50 text-gray-900';
    }
  }

  getAnnouncementTypeIcon(type: Announcement['type']): string {
    switch (type) {
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'urgent':
        return '🚨';
      default:
        return '📢';
    }
  }

  getAnnouncementTypeLabel(type: Announcement['type']): string {
    switch (type) {
      case 'info':
        return 'Información';
      case 'success':
        return 'Éxito';
      case 'warning':
        return 'Advertencia';
      case 'urgent':
        return 'Urgente';
      default:
        return 'Anuncio';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Ahora';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }
}

export const announcementService = new AnnouncementService();
export default announcementService; 