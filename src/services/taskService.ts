import { API_BASE_URL } from '../config/apiConfig';

// API Response Types (matching the TASKS_API.md documentation)
export interface APITask {
  id: string;
  title: string;
  description: string;
  priority: 1 | 2 | 3 | 4; // 1=Low, 2=Medium, 3=High, 4=Critical
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string | null;
  order: number;
  project: {
    id: string;
    name: string;
  } | null;
  section: {
    id: number;
    name: string;
  } | null;
  createdBy: {
    id: string;
    nombre: string;
    apellidos: string;
  };
  assignees: Array<{
    id: string;
    nombre: string;
    apellidos: string;
  }>;
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  projectId: string;
  sectionId?: number;
  assigneeIds?: string[];
  labelIds?: number[];
  priority?: 1 | 2 | 3 | 4;
  dueDate?: string;
  status?: 'todo' | 'in_progress' | 'done';
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  sectionId?: number;
  assigneeIds?: string[];
  labelIds?: number[];
  priority?: 1 | 2 | 3 | 4;
  dueDate?: string;
  status?: 'todo' | 'in_progress' | 'done';
}

export interface ProjectLabel {
  id: number;
  name: string;
  color: string;
}

export interface CreateLabelData {
  name: string;
  color: string;
}

// UI Task Type (converted from API response)
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'done';
  labels: ProjectLabel[];
  assignedTo: Array<{
    id: string;
    name: string;
  }>;
  dueDate: string | null;
  section: string | null;
  sectionId: number | null;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface ProjectSection {
  id: number;
  name: string;
  order: number;
  project?: {
    id: string;
    name: string;
  };
}

export interface CreateSectionData {
  name: string;
  order?: number;
}

export interface UpdateSectionData {
  name?: string;
  order?: number;
}

class TaskService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Convert API priority to UI priority
  private convertPriority(apiPriority: 1 | 2 | 3 | 4): 'low' | 'medium' | 'high' | 'critical' {
    switch (apiPriority) {
      case 1: return 'low';
      case 2: return 'medium';
      case 3: return 'high';
      case 4: return 'critical';
      default: return 'medium';
    }
  }

  // Convert UI priority to API priority
  private convertPriorityToAPI(uiPriority: 'low' | 'medium' | 'high' | 'critical'): 1 | 2 | 3 | 4 {
    switch (uiPriority) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      case 'critical': return 4;
      default: return 2;
    }
  }

  // Transform API task to UI task
  private transformTask(apiTask: APITask): Task {
    return {
      id: apiTask.id,
      title: apiTask.title,
      description: apiTask.description,
      priority: this.convertPriority(apiTask.priority),
      status: apiTask.status,
      labels: apiTask.labels,
      assignedTo: apiTask.assignees.map(assignee => ({
        id: assignee.id,
        name: `${assignee.nombre} ${assignee.apellidos}`
      })),
      dueDate: apiTask.dueDate,
      section: apiTask.section?.name || null,
      sectionId: apiTask.section?.id || null,
      createdBy: {
        id: apiTask.createdBy.id,
        name: `${apiTask.createdBy.nombre} ${apiTask.createdBy.apellidos}`
      },
      createdAt: apiTask.createdAt,
      updatedAt: apiTask.updatedAt,
      order: apiTask.order
    };
  }

  // Get project sections
  async getProjectSections(projectId: string): Promise<ProjectSection[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/sections`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project sections: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project sections:', error);
      throw error;
    }
  }

  // Create project section
  async createProjectSection(projectId: string, sectionData: CreateSectionData): Promise<ProjectSection> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/sections`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(sectionData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create project section: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating project section:', error);
      throw error;
    }
  }

  // Update project section
  async updateProjectSection(projectId: string, sectionId: number, sectionData: UpdateSectionData): Promise<ProjectSection> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/sections/${sectionId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(sectionData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update project section: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating project section:', error);
      throw error;
    }
  }

  // Delete project section
  async deleteProjectSection(projectId: string, sectionId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/sections/${sectionId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to delete project section: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting project section:', error);
      throw error;
    }
  }

  // Reorder project sections
  async reorderProjectSections(projectId: string, sectionIds: number[]): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/sections/reorder`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ sectionIds })
      });

      if (!response.ok) {
        throw new Error(`Failed to reorder project sections: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error reordering project sections:', error);
      throw error;
    }
  }

  // Get project tasks
  async getProjectTasks(projectId: string): Promise<Task[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/project/${projectId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project tasks: ${response.statusText}`);
      }

      const apiTasks: APITask[] = await response.json();
      return apiTasks.map(task => this.transformTask(task));
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }
  }

  // Get section tasks
  async getSectionTasks(projectId: string, sectionId: number): Promise<Task[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/project/${projectId}/section/${sectionId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch section tasks: ${response.statusText}`);
      }

      const apiTasks: APITask[] = await response.json();
      return apiTasks.map(task => this.transformTask(task));
    } catch (error) {
      console.error('Error fetching section tasks:', error);
      throw error;
    }
  }

  // Create new task
  async createTask(taskData: CreateTaskData): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.statusText}`);
      }

      const apiTask: APITask = await response.json();
      return this.transformTask(apiTask);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Update task
  async updateTask(taskId: string, taskData: UpdateTaskData): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }

      const apiTask: APITask = await response.json();
      return this.transformTask(apiTask);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete task
  async deleteTask(taskId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Get project labels
  async getProjectLabels(projectId: string): Promise<ProjectLabel[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/projects/${projectId}/labels`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project labels: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project labels:', error);
      throw error;
    }
  }

  // Create project label
  async createProjectLabel(projectId: string, labelData: CreateLabelData): Promise<ProjectLabel> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/projects/${projectId}/labels`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(labelData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create project label: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating project label:', error);
      throw error;
    }
  }

  // Update project label
  async updateProjectLabel(projectId: string, labelId: number, labelData: CreateLabelData): Promise<ProjectLabel> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/projects/${projectId}/labels/${labelId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(labelData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update project label: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating project label:', error);
      throw error;
    }
  }

  // Delete project label
  async deleteProjectLabel(projectId: string, labelId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/projects/${projectId}/labels/${labelId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to delete project label: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting project label:', error);
      throw error;
    }
  }
}

// Export singleton instance
const taskService = new TaskService();
export default taskService; 