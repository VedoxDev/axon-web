import { API_BASE_URL } from '../config/apiConfig';

// Types based on the API documentation
export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  role: 'owner' | 'admin' | 'member';
}

export interface ProjectMember {
  id: string;
  nombre: string;
  apellidos: string;
  role: 'owner' | 'admin' | 'member';
  status: string;
}

export interface ProjectDetails {
  id: string;
  name: string;
  description: string | null;
  status: string;
  members: ProjectMember[];
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

export interface CreateProjectResponse {
  message: string;
  id: string;
}

export interface InviteMemberData {
  email?: string;
  userId?: string;
}

export interface InviteMemberResponse {
  message: string;
  invitationId: string;
  userId: string;
}

export interface PendingInvitation {
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

export interface SearchUser {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  status: string;
  fullName: string;
}

export interface UserSearchResponse {
  users: SearchUser[];
  total: number;
  query: string;
  message?: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileActivity {
  type: 'task' | 'message' | 'call';
  action: string;
  title: string;
  project?: string;
  recipient?: string;
  timestamp: string;
  status?: string;
}

export interface UserProfileProject {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  taskCount: number;
  messageCount: number;
}

export interface UserProfileStats {
  totalProjects: number;
  ownerProjects: number;
  adminProjects: number;
  memberProjects: number;
  tasksCreated: number;
  tasksAssigned: number;
  tasksCompleted: number;
  tasksPending: number;
  tasksInProgress: number;
  completionRate: number;
  messagesSent: number;
  directConversations: number;
  callsParticipated: number;
  callsInitiated: number;
  invitationsSent: number;
  invitationsReceived: number;
  invitationsAccepted: number;
  invitationsPending: number;
  invitationAcceptanceRate: number;
}

export interface UserProfileInsights {
  mostActiveProject: string | null;
  averageTasksPerProject: number;
  peakActivityType: 'communication' | 'task_management';
  collaborationScore: number;
  leadershipScore: number;
}

export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
  fullName: string;
  memberSince: string;
  lastActive: string;
  stats: UserProfileStats;
  recentActivity: UserProfileActivity[];
  projects: UserProfileProject[];
  insights: UserProfileInsights;
}

// Error message mapping
const errorMessageMap: { [key: string]: string } = {
  'project-name-required': 'El nombre del proyecto es requerido',
  'project-not-found': 'Proyecto no encontrado',
  'insufficient-permissions': 'Permisos insuficientes',
  'user-to-invite-not-found': 'Usuario a invitar no encontrado',
  'user-already-member': 'El usuario ya es miembro del proyecto',
  'invitation-already-pending': 'Ya existe una invitación pendiente para este usuario',
  'invitation-not-found': 'Invitación no encontrada',
  'search-query-too-short': 'La búsqueda debe tener al menos 2 caracteres',
  'invitation-sent-successfully': 'Invitación enviada exitosamente',
  'invalid-project-id': 'ID de proyecto inválido',
  'email-or-userId-required': 'Se requiere email o ID de usuario',
  'email-invalid': 'Formato de email inválido',
  'userId-invalid': 'ID de usuario inválido',
  'Unauthorized': 'No autorizado'
};

const formatError = (message: string | string[]): string => {
  if (Array.isArray(message)) {
    return message.map(msg => errorMessageMap[msg] || msg).join(', ');
  }
  return errorMessageMap[message] || message;
};

// Project service class
class ProjectService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get user's projects
  async getUserProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/mine`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al obtener proyectos');
    }
  }

  // Get project details including members
  async getProjectDetails(projectId: string): Promise<ProjectDetails> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al obtener detalles del proyecto');
    }
  }

  // Create new project
  async createProject(projectData: CreateProjectData): Promise<CreateProjectResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al crear proyecto');
    }
  }

  // Invite member to project
  async inviteMember(projectId: string, inviteData: InviteMemberData): Promise<InviteMemberResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/invite`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(inviteData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al invitar miembro');
    }
  }

  // Change member role (owner only)
  async changeMemberRole(projectId: string, memberId: string, role: 'member' | 'admin'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${memberId}/role`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al cambiar rol del miembro');
    }
  }

  // Get pending invitations
  async getPendingInvitations(): Promise<PendingInvitation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/invitations/pending`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al obtener invitaciones');
    }
  }

  // Respond to invitation
  async respondToInvitation(invitationId: string, action: 'accept' | 'reject'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/invitations/${invitationId}/respond`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al responder invitación');
    }
  }

  // Search users
  async searchUsers(query: string, limit: number = 10): Promise<UserSearchResponse> {
    try {
      if (query.length < 2) {
        return {
          users: [],
          total: 0,
          query,
          message: 'search-query-too-short'
        };
      }

      const params = new URLSearchParams({
        q: query,
        limit: Math.min(limit, 50).toString()
      });

      const response = await fetch(`${API_BASE_URL}/users/search?${params}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al buscar usuarios');
    }
  }

  // Invite user to project by userId
  async inviteUserToProject(projectId: string, userId: string): Promise<InviteMemberResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/invite`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al invitar usuario');
    }
  }

  // Get current user
  async getCurrentUser(): Promise<CurrentUser> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al obtener usuario actual');
    }
  }

  // Get comprehensive user profile
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me/profile`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al obtener perfil de usuario');
    }
  }
}

// Export singleton instance
export const projectService = new ProjectService();
export default projectService; 