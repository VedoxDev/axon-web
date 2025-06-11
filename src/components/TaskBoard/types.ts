// Re-export Task and related types from taskService for compatibility
export type { Task, ProjectLabel, ProjectSection } from '../../services/taskService';

// Dynamic column type that can be any section ID
export type DynamicColumnType = string; // Using string to accommodate any section ID

// Section mapping for the UI
export interface TaskSection {
  id: number;
  name: string;
  order: number;
}

// Default sections mapping
export const DEFAULT_SECTIONS: TaskSection[] = [
  { id: 1, name: 'Asignado', order: 1 },
  { id: 2, name: 'En proceso', order: 2 },
  { id: 3, name: 'Integración', order: 3 },
  { id: 4, name: 'Revisión', order: 4 },
  { id: 5, name: 'Completado', order: 5 }
]; 