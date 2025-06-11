import { API_BASE_URL } from '../config/apiConfig';
import authService from './authService';

export interface CallParticipant {
  id: string;
  nombre: string;
  apellidos: string;
  isConnected: boolean;
  micMuted: boolean;
  videoMuted: boolean;
  joinedAt?: string;
  leftAt?: string;
}

export interface Call {
  id: string;
  roomName: string;
  type: 'direct' | 'project';
  status: 'waiting' | 'active' | 'ended' | 'cancelled';
  title: string;
  audioOnly: boolean;
  initiator: {
    id: string;
    nombre: string;
    apellidos: string;
  };
  recipient?: {
    id: string;
    nombre: string;
    apellidos: string;
  };
  project?: {
    id: string;
    name: string;
  };
  participants: CallParticipant[];
  createdAt: string;
  scheduledAt?: string;
}

// Meeting-specific interfaces based on API documentation
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string;        // ISO date string (when meeting is scheduled)
  duration: number;           // Duration in minutes
  audioOnly: boolean;         // true = audio only, false = video call
  meetingType: 'project_meeting' | 'personal_meeting';
  status?: 'waiting' | 'active' | 'ended' | 'cancelled';
  
  // Additional fields for completed meetings
  startedAt?: string;         // When first person actually joined
  endedAt?: string;           // When meeting actually ended
  
  initiator: {
    id: string;
    nombre: string;
    apellidos: string;
    email?: string;
  };
  
  project?: {                 // Only for project meetings
    id: string;
    name: string;
  };
  
  participants?: Array<{
    user: {
      id: string;
      nombre: string;
      apellidos: string;
      email?: string;
    };
    isConnected?: boolean;
    joinedAt?: string;        // When participant joined
    leftAt?: string;          // When participant left
  }>;
  
  createdAt: string;
}

export interface CreateProjectMeetingRequest {
  title: string;
  scheduledAt: string;  // ISO date string (must be future)
  projectId: string;    // UUID of the project
  description?: string;  // Meeting agenda/description
  duration?: number;     // Duration in minutes (15-480, default: 60)
  audioOnly?: boolean;   // Audio-only meeting (default: false)
  recordCall?: boolean;  // Record the meeting (default: false)
}

export interface CreatePersonalMeetingRequest {
  title: string;              // Meeting title
  scheduledAt: string;        // ISO date string (must be future)
  participantEmails: string[]; // Array of email addresses to invite
  description?: string;  // Meeting agenda/description
  duration?: number;     // Duration in minutes (15-480, default: 60)
  audioOnly?: boolean;   // Audio-only meeting (default: false)
  recordCall?: boolean;  // Record the meeting (default: false)
}

export interface StartCallRequest {
  type: 'direct' | 'project';
  recipientId?: string;
  projectId?: string;
  title?: string;
  audioOnly?: boolean;
  recordCall?: boolean;
}

export interface StartCallResponse {
  call: Call;
  token: string; // LiveKit access token
}

export interface JoinCallResponse {
  call: Call;
  token: string; // LiveKit access token
}

class CallsService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response body is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Start a new call (direct or project)
  async startCall(request: StartCallRequest): Promise<StartCallResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/start`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      return this.handleResponse<StartCallResponse>(response);
    } catch (error: any) {
      console.error('Failed to start call:', error);
      throw new Error(error.message || 'Error al iniciar llamada');
    }
  }

  // Join an existing call
  async joinCall(callId: string, audioOnly = false): Promise<JoinCallResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/join/${callId}`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ audioOnly })
      });

      return this.handleResponse<JoinCallResponse>(response);
    } catch (error: any) {
      console.error('Failed to join call:', error);
      throw new Error(error.message || 'Error al unirse a la llamada');
    }
  }

  // Leave a call
  async leaveCall(callId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/leave/${callId}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Failed to leave call:', error);
      throw new Error(error.message || 'Error al salir de la llamada');
    }
  }

  // End a call (initiator only)
  async endCall(callId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/end/${callId}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Failed to end call:', error);
      throw new Error(error.message || 'Error al finalizar la llamada');
    }
  }

  // Update participant state (mute/unmute)
  async updateParticipantState(callId: string, micMuted: boolean, videoMuted: boolean): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/participant/${callId}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ micMuted, videoMuted })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Failed to update participant state:', error);
      throw new Error(error.message || 'Error al actualizar estado del participante');
    }
  }

  // Get active calls
  async getActiveCalls(): Promise<Call[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/active`, {
        method: 'GET',
        headers: await this.getAuthHeaders()
      });

      return this.handleResponse<Call[]>(response);
    } catch (error: any) {
      console.error('Failed to get active calls:', error);
      throw new Error(error.message || 'Error al obtener llamadas activas');
    }
  }

  // Get call history
  async getCallHistory(page = 1, limit = 20): Promise<Call[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/history?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: await this.getAuthHeaders()
      });

      return this.handleResponse<Call[]>(response);
    } catch (error: any) {
      console.error('Failed to get call history:', error);
      throw new Error(error.message || 'Error al obtener historial de llamadas');
    }
  }

  // Get call status by ID
  async getCallStatus(callId: string): Promise<Call> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/${callId}`, {
        method: 'GET',
        headers: await this.getAuthHeaders()
      });

      return this.handleResponse<Call>(response);
    } catch (error: any) {
      console.error('Failed to get call status:', error);
      throw new Error(error.message || 'Error al obtener estado de la llamada');
    }
  }

  // Generate new token if expired
  async generateNewToken(callId: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/token/${callId}`, {
        method: 'POST',
        headers: await this.getAuthHeaders()
      });

      const data = await this.handleResponse<{ token: string }>(response);
      return data.token;
    } catch (error: any) {
      console.error('Failed to generate new token:', error);
      throw new Error(error.message || 'Error al generar nuevo token');
    }
  }

  // ==================== MEETINGS API ====================

  // Create a project meeting
  async createProjectMeeting(request: CreateProjectMeetingRequest): Promise<Meeting> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/meetings/project`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      return this.handleResponse<Meeting>(response);
    } catch (error: any) {
      console.error('Failed to create project meeting:', error);
      throw new Error(error.message || 'Error al crear reunión del proyecto');
    }
  }

  // Create a personal meeting
  async createPersonalMeeting(request: CreatePersonalMeetingRequest): Promise<Meeting> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/meetings/personal`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      return this.handleResponse<Meeting>(response);
    } catch (error: any) {
      console.error('Failed to create personal meeting:', error);
      throw new Error(error.message || 'Error al crear reunión personal');
    }
  }

  // Get user's upcoming meetings
  async getMyMeetings(): Promise<Meeting[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/meetings/my`, {
        method: 'GET',
        headers: await this.getAuthHeaders()
      });

      return this.handleResponse<Meeting[]>(response);
    } catch (error: any) {
      console.error('Failed to get my meetings:', error);
      throw new Error(error.message || 'Error al obtener mis reuniones');
    }
  }

  // Get project meetings (upcoming only)
  async getProjectMeetings(projectId: string): Promise<Meeting[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/meetings/project/${projectId}`, {
        method: 'GET',
        headers: await this.getAuthHeaders()
      });

      return this.handleResponse<Meeting[]>(response);
    } catch (error: any) {
      console.error('Failed to get project meetings:', error);
      throw new Error(error.message || 'Error al obtener reuniones del proyecto');
    }
  }

  // Get complete project meeting history (both past and future)
  async getProjectMeetingHistory(projectId: string): Promise<Meeting[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/meetings/project/${projectId}/history`, {
        method: 'GET',
        headers: await this.getAuthHeaders()
      });

      return this.handleResponse<Meeting[]>(response);
    } catch (error: any) {
      console.error('Failed to get project meeting history:', error);
      throw new Error(error.message || 'Error al obtener historial de reuniones del proyecto');
    }
  }

  // Get meeting details by ID
  async getMeetingDetails(meetingId: string): Promise<Meeting> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/meetings/${meetingId}`, {
        method: 'GET',
        headers: await this.getAuthHeaders()
      });

      return this.handleResponse<Meeting>(response);
    } catch (error: any) {
      console.error('Failed to get meeting details:', error);
      throw new Error(error.message || 'Error al obtener detalles de la reunión');
    }
  }

  // Cancel a meeting (only organizer can cancel)
  async cancelMeeting(meetingId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Failed to cancel meeting:', error);
      throw new Error(error.message || 'Error al cancelar la reunión');
    }
  }

  // Join a scheduled meeting (uses existing join endpoint)
  async joinMeeting(meetingId: string, audioOnly = false): Promise<JoinCallResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/join/${meetingId}`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ audioOnly })
      });

      return this.handleResponse<JoinCallResponse>(response);
    } catch (error: any) {
      console.error('Failed to join meeting:', error);
      throw new Error(error.message || 'Error al unirse a la reunión');
    }
  }
}

const callsService = new CallsService();
export default callsService; 