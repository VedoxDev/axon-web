import React, { useState, useEffect } from 'react';
import type { ProjectSection, ProjectLabel } from '../../services/taskService';
import taskService from '../../services/taskService';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: any) => void;
  projectId: string;
  sections: ProjectSection[];
  preSelectedSectionId?: string;
}

interface ProjectMember {
  id: string;
  nombre: string;
  apellidos: string;
  role: string;
  status: string;
}

const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  projectId,
  sections,
  preSelectedSectionId = ''
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sectionId: '',
    priority: 2, // Medium by default
    dueDate: '',
    status: 'todo' as 'todo' | 'in_progress' | 'done',
    assigneeIds: [] as string[],
    labelIds: [] as number[]
  });

  const [labels, setLabels] = useState<ProjectLabel[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Custom scrollbar styles
  const scrollbarStyles = `
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(107, 114, 128, 0.3) transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(107, 114, 128, 0.3);
      border-radius: 2px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: rgba(107, 114, 128, 0.5);
    }
  `;

  // Priority options with colors
  const priorityOptions = [
    { value: 1, label: 'Baja', color: '#10B981', bgColor: '#065F46' },
    { value: 2, label: 'Media', color: '#F59E0B', bgColor: '#92400E' },
    { value: 3, label: 'Alta', color: '#EF4444', bgColor: '#991B1B' },
    { value: 4, label: 'Crítica', color: '#7C3AED', bgColor: '#581C87' }
  ];

  // Status options with colors
  const statusOptions = [
    { value: 'todo' as const, label: 'Por hacer', color: '#6B7280', bgColor: '#374151' },
    { value: 'in_progress' as const, label: 'En progreso', color: '#3B82F6', bgColor: '#1E40AF' },
    { value: 'done' as const, label: 'Completado', color: '#10B981', bgColor: '#065F46' }
  ];

  // Load project labels and members when modal opens
  useEffect(() => {
    if (isOpen && projectId) {
      loadProjectLabels();
      loadProjectMembers();
    }
  }, [isOpen, projectId]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        sectionId: preSelectedSectionId || '',
        priority: 2,
        dueDate: '',
        status: 'todo',
        assigneeIds: [],
        labelIds: []
      });
      setError('');
    }
  }, [isOpen, preSelectedSectionId]);

  const loadProjectLabels = async () => {
    try {
      const projectLabels = await taskService.getProjectLabels(projectId);
      setLabels(projectLabels);
    } catch (error) {
      console.error('Error loading project labels:', error);
      setLabels([]);
    }
  };

  const loadProjectMembers = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project members: ${response.statusText}`);
      }

      const projectData = await response.json();
      setProjectMembers(projectData.members || []);
    } catch (error) {
      console.error('Error loading project members:', error);
      setProjectMembers([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    setIsLoading(true);

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        projectId,
        sectionId: formData.sectionId ? parseInt(formData.sectionId) : undefined,
        priority: formData.priority as 1 | 2 | 3 | 4,
        dueDate: formData.dueDate || undefined,
        status: formData.status,
        assigneeIds: formData.assigneeIds.length > 0 ? formData.assigneeIds : undefined,
        labelIds: formData.labelIds.length > 0 ? formData.labelIds : undefined
      };

      const newTask = await taskService.createTask(taskData);
      onTaskCreated(newTask);
      onClose();
    } catch (error: any) {
      console.error('Error creating task:', error);
      setError(error.message || 'Error al crear la tarea');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLabelToggle = (labelId: number) => {
    setFormData(prev => ({
      ...prev,
      labelIds: prev.labelIds.includes(labelId)
        ? prev.labelIds.filter(id => id !== labelId)
        : [...prev.labelIds, labelId]
    }));
  };

  const handleAssigneeToggle = (assigneeId: string) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(assigneeId)
        ? prev.assigneeIds.filter(id => id !== assigneeId)
        : [...prev.assigneeIds, assigneeId]
    }));
  };

  const formatMemberName = (fullName: string): string => {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0];
    } else if (nameParts.length >= 2) {
      return `${nameParts[0]} ${nameParts[1]}`;
    }
    return fullName;
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div className="rounded-lg shadow-xl max-w-2xl w-full max-h-[75vh] overflow-hidden flex flex-col" style={{ backgroundColor: '#161718' }}>
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#2D2D2D' }}>
            <h2 className="text-xl font-semibold text-white">Nueva Tarea</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form - Scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-400"
                  style={{ backgroundColor: '#2D2D2D' }}
                  placeholder="Ingresa el título de la tarea..."
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-400"
                  style={{ backgroundColor: '#2D2D2D' }}
                  placeholder="Describe la tarea (opcional)..."
                />
              </div>

              {/* Section and Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Sección
                  </label>
                  <select
                    value={formData.sectionId}
                    onChange={(e) => setFormData(prev => ({ ...prev, sectionId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white"
                    style={{ backgroundColor: '#2D2D2D' }}
                  >
                    <option value="">Pendientes</option>
                    {sections.map(section => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Prioridad
                  </label>
                  <div className="relative">
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white appearance-none"
                      style={{ backgroundColor: '#2D2D2D' }}
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full pointer-events-none"
                      style={{ backgroundColor: priorityOptions.find(p => p.value === formData.priority)?.color }}
                    />
                  </div>
                </div>
              </div>

              {/* Due Date and Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Fecha de vencimiento
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white"
                    style={{ backgroundColor: '#2D2D2D' }}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Estado
                  </label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'todo' | 'in_progress' | 'done' }))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white appearance-none"
                      style={{ backgroundColor: '#2D2D2D' }}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full pointer-events-none"
                      style={{ backgroundColor: statusOptions.find(s => s.value === formData.status)?.color }}
                    />
                  </div>
                </div>
              </div>

              {/* Assignees */}
              {projectMembers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Asignar a
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {projectMembers.map(member => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleAssigneeToggle(member.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                          formData.assigneeIds.includes(member.id)
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-500 text-gray-300 hover:border-gray-400 hover:text-white'
                        }`}
                      >
                        {formatMemberName(member.nombre + ' ' + member.apellidos)}
                      </button>
                    ))}
                  </div>
                  {formData.assigneeIds.length > 0 && (
                    <p className="text-sm text-gray-400 mt-2">
                      {formData.assigneeIds.length} miembro{formData.assigneeIds.length !== 1 ? 's' : ''} asignado{formData.assigneeIds.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}

              {/* Labels */}
              {labels.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Etiquetas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {labels.map(label => (
                      <button
                        key={label.id}
                        type="button"
                        onClick={() => handleLabelToggle(label.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                          formData.labelIds.includes(label.id)
                            ? 'border-transparent text-white'
                            : 'border-gray-500 text-gray-300 hover:border-gray-400'
                        }`}
                        style={{
                          backgroundColor: formData.labelIds.includes(label.id) ? label.color : 'transparent',
                          color: formData.labelIds.includes(label.id) ? 'white' : label.color
                        }}
                      >
                        {label.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0" style={{ borderTopColor: '#2D2D2D', borderTopWidth: '1px', borderTopStyle: 'solid' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              onClick={handleSubmit}
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isLoading ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskCreateModal; 