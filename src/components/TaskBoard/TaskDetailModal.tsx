import React, { useEffect, useState } from 'react';
import type { Task, ProjectSection, ProjectLabel } from './types';
import taskService from '../../services/taskService';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  projectId: string;
  sections: ProjectSection[];
}

interface ProjectMember {
  id: string;
  nombre: string;
  apellidos: string;
  role: string;
  status: string;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onUpdateTask, projectId, sections }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [labels, setLabels] = useState<ProjectLabel[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setEditedTask(task);
      const timer = setTimeout(() => setIsVisible(true), 10);
      loadProjectLabels();
      loadProjectMembers();
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsEditing(false);
      setEditedTask(null);
      setError('');
    }
  }, [task]);

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

  if (!task || !editedTask) {
    return null;
  }

  // Priority options with colors
  const priorityOptions = [
    { value: 'low', label: 'Baja', color: '#10B981', bgColor: '#065F46' },
    { value: 'medium', label: 'Media', color: '#F59E0B', bgColor: '#92400E' },
    { value: 'high', label: 'Alta', color: '#EF4444', bgColor: '#991B1B' },
    { value: 'critical', label: 'Crítica', color: '#7C3AED', bgColor: '#581C87' }
  ];

  // Status options with colors
  const statusOptions = [
    { value: 'todo' as const, label: 'Por hacer', color: '#6B7280', bgColor: '#374151' },
    { value: 'in_progress' as const, label: 'En progreso', color: '#3B82F6', bgColor: '#1E40AF' },
    { value: 'done' as const, label: 'Completado', color: '#10B981', bgColor: '#065F46' }
  ];

  const handleSave = async () => {
    if (!editedTask) return;
    
    setError('');
    setIsLoading(true);

    try {
      const updateData = {
        title: editedTask.title,
        description: editedTask.description,
        sectionId: editedTask.sectionId || undefined,
        priority: getPriorityNumber(editedTask.priority),
        dueDate: editedTask.dueDate || undefined,
        status: editedTask.status,
        assigneeIds: editedTask.assignedTo.map(a => a.id),
        labelIds: editedTask.labels.map(l => l.id)
      };

      const updatedTask = await taskService.updateTask(editedTask.id, updateData);
      onUpdateTask(updatedTask);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating task:', error);
      setError(error.message || 'Error al actualizar la tarea');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
    setError('');
  };

  const handleLabelToggle = (labelId: number) => {
    if (!editedTask) return;
    
    const label = labels.find(l => l.id === labelId);
    if (!label) return;

    const isSelected = editedTask.labels.some(l => l.id === labelId);
    
    setEditedTask({
      ...editedTask,
      labels: isSelected
        ? editedTask.labels.filter(l => l.id !== labelId)
        : [...editedTask.labels, label]
    });
  };

  const handleAssigneeToggle = (memberId: string) => {
    if (!editedTask) return;
    
    const member = projectMembers.find(m => m.id === memberId);
    if (!member) return;

    const isSelected = editedTask.assignedTo.some(a => a.id === memberId);
    
    setEditedTask({
      ...editedTask,
      assignedTo: isSelected
        ? editedTask.assignedTo.filter(a => a.id !== memberId)
        : [...editedTask.assignedTo, { id: member.id, name: `${member.nombre} ${member.apellidos}` }]
    });
  };

  const getPriorityNumber = (priority: string): 1 | 2 | 3 | 4 => {
    switch (priority) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      case 'critical': return 4;
      default: return 2;
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#10B981'; // Green
      case 'medium': return '#F59E0B'; // Amber
      case 'high': return '#EF4444'; // Red
      case 'critical': return '#7C3AED'; // Purple
      default: return '#6B7280'; // Gray
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baja';
      case 'medium': return 'Media';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return 'Sin definir';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return '#6B7280'; // Gray
      case 'in_progress': return '#F59E0B'; // Amber
      case 'done': return '#10B981'; // Green
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'Por hacer';
      case 'in_progress': return 'En progreso';
      case 'done': return 'Completado';
      default: return 'Sin definir';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No establecida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSimpleDate = (dateString: string | null) => {
    if (!dateString) return 'No establecida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex justify-center items-center transition-opacity duration-300 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <style>
        {`
          .task-detail-scrollbar::-webkit-scrollbar {
            width: 4px;
          }

          .task-detail-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }

          .task-detail-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
          }

          .task-detail-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          .task-detail-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
          }
        `}
      </style>
      
      <div
        className={`bg-[#161718] rounded-lg w-full max-w-4xl text-white relative flex flex-col max-h-[90vh] transition-all duration-300 ease-out transform ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-700">
          <div className="flex-1 pr-4">
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="text-2xl font-bold bg-[#2D2D2D] text-white p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Título de la tarea"
              />
            ) : (
              <h1 className="text-2xl font-bold text-white mb-2">{editedTask.title}</h1>
            )}
            {editedTask.section && (
              <div className="mt-2">
                <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                  {editedTask.section}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-semibold leading-none p-2 hover:bg-gray-700 rounded"
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-600 bg-opacity-20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto task-detail-scrollbar">
          <div className="p-6 space-y-6">
            
            {/* Status and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Priority */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Prioridad</h3>
                {isEditing ? (
                  <div className="space-y-2">
                    {priorityOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={option.value}
                          checked={editedTask.priority === option.value}
                          onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as any })}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            editedTask.priority === option.value ? 'border-white' : 'border-gray-500'
                          }`}
                          style={{ backgroundColor: option.color }}
                        >
                          {editedTask.priority === option.value && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="text-white font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: getPriorityColor(editedTask.priority) }}
                    ></div>
                    <span className="text-white font-medium">
                      {getPriorityLabel(editedTask.priority)}
                    </span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Estado</h3>
                {isEditing ? (
                  <div className="space-y-2">
                    {statusOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={editedTask.status === option.value}
                          onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as any })}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            editedTask.status === option.value ? 'border-white' : 'border-gray-500'
                          }`}
                          style={{ backgroundColor: option.color }}
                        >
                          {editedTask.status === option.value && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="text-white font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: getStatusColor(editedTask.status) }}
                    ></div>
                    <span className="text-white font-medium">
                      {getStatusLabel(editedTask.status)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Section */}
            {isEditing && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Sección</h3>
                <select
                  value={editedTask.sectionId || ''}
                  onChange={(e) => {
                    const sectionId = e.target.value ? parseInt(e.target.value) : null;
                    const section = sections.find(s => s.id === sectionId);
                    setEditedTask({ 
                      ...editedTask, 
                      sectionId, 
                      section: section?.name || null 
                    });
                  }}
                  className="w-full p-3 bg-[#2D2D2D] text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin sección</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Descripción</h3>
              {isEditing ? (
                <textarea
                  value={editedTask.description || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  className="w-full p-3 bg-[#2D2D2D] text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Descripción de la tarea..."
                />
              ) : editedTask.description ? (
                <div className="bg-[#2D2D2D] rounded-lg p-4">
                  <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {editedTask.description}
                  </p>
                </div>
              ) : (
                <div className="bg-[#2D2D2D] rounded-lg p-4">
                  <p className="text-gray-500 italic">Sin descripción</p>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Fecha de vencimiento</h3>
              {isEditing ? (
                <input
                  type="date"
                  value={editedTask.dueDate ? new Date(editedTask.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value || null })}
                  className="w-full p-3 bg-[#2D2D2D] text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="bg-[#2D2D2D] rounded-lg p-3">
                  <span className="text-white font-medium">
                    {formatSimpleDate(editedTask.dueDate)}
                  </span>
                </div>
              )}
            </div>

            {/* Assignees */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">
                Asignado a ({editedTask.assignedTo?.length || 0})
              </h3>
              {isEditing ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {projectMembers.map((member) => (
                    <label key={member.id} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={editedTask.assignedTo.some(a => a.id === member.id)}
                        onChange={() => handleAssigneeToggle(member.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-white">
                        {formatMemberName(`${member.nombre} ${member.apellidos}`)}
                      </span>
                    </label>
                  ))}
                </div>
              ) : editedTask.assignedTo && editedTask.assignedTo.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {editedTask.assignedTo.map((assignee) => (
                    <div
                      key={assignee.id}
                      className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {assignee.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">Sin asignar</div>
              )}
            </div>

            {/* Labels */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">
                Etiquetas ({editedTask.labels?.length || 0})
              </h3>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {labels.map((label) => (
                    <button
                      key={label.id}
                      onClick={() => handleLabelToggle(label.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        editedTask.labels.some(l => l.id === label.id)
                          ? 'text-white border-2 border-white'
                          : 'text-gray-300 border border-gray-500 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </button>
                  ))}
                </div>
              ) : editedTask.labels && editedTask.labels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {editedTask.labels.map((label) => (
                    <div
                      key={label.id}
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">Sin etiquetas</div>
              )}
            </div>

            {/* Metadata */}
            {!isEditing && (
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">Información del sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Creado por:</span>
                    <div className="text-white font-medium mt-1">
                      {editedTask.createdBy.name}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400">Fecha de creación:</span>
                    <div className="text-white font-medium mt-1">
                      {formatDate(editedTask.createdAt)}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400">Última actualización:</span>
                    <div className="text-white font-medium mt-1">
                      {formatDate(editedTask.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 px-6 py-4">
          <div className="flex justify-end gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading || !editedTask.title.trim()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </>
                  ) : (
                    'Guardar cambios'
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Editar tarea
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal; 