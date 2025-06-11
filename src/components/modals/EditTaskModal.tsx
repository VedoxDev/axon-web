import React, { useState, useEffect } from 'react';
import { useAlert } from '../../hooks/useAlert';
import { API_BASE_URL } from '../../config/apiConfig';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: (task: any) => void;
  task: any | null;
}

interface UpdateTaskData {
  title: string;
  description?: string;
  priority: number;
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, onTaskUpdated, task }) => {
  const [taskData, setTaskData] = useState<UpdateTaskData>({
    title: '',
    description: '',
    priority: 2,
    status: 'todo',
    dueDate: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSuccess, showError } = useAlert();

  // Populate form when task changes
  useEffect(() => {
    if (isOpen && task) {
      setTaskData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 2,
        status: task.status || 'todo',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '' // Convert to YYYY-MM-DD format
      });
    }
  }, [isOpen, task]);

  // Update task
  const updateTask = async () => {
    if (!taskData.title.trim()) {
      showError('El título es requerido');
      return;
    }

    if (!task?.id) {
      showError('Error: ID de tarea no válido');
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      const updateData = {
        title: taskData.title,
        description: taskData.description || undefined,
        priority: taskData.priority,
        status: taskData.status,
        dueDate: taskData.dueDate || undefined
      };

      const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar la tarea');
      }

      const updatedTask = await response.json();
      onTaskUpdated(updatedTask);
      showSuccess('Tarea actualizada correctamente');
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      showError(error instanceof Error ? error.message : 'Error al actualizar la tarea');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      updateTask();
    }
  };



  if (!isOpen || !task) return null;

  return (
    <>
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-lg shadow-xl z-60 flex flex-col" style={{ backgroundColor: '#161718' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h2 className="text-xl font-semibold text-white">Editar Tarea</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="¿Qué necesitas hacer?"
              value={taskData.title}
              onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
              onKeyPress={handleKeyPress}
              className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              placeholder="Detalles adicionales sobre la tarea..."
              value={taskData.description}
              onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 resize-none"
              rows={3}
            />
          </div>

          {/* Priority, Status, and Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prioridad</label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              >
                <option value={1}>🟢 Baja</option>
                <option value={2}>🟡 Media</option>
                <option value={3}>🔴 Alta</option>
                <option value={4}>🟣 Crítica</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
              <select
                value={taskData.status}
                onChange={(e) => setTaskData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              >
                <option value="todo">⭕ Por hacer</option>
                <option value="in_progress">🟡 En progreso</option>
                <option value="done">✅ Completado</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fecha límite</label>
              <input
                type="date"
                value={taskData.dueDate}
                onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
          </div>


        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-600">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={updateTask}
            disabled={isUpdating || !taskData.title.trim()}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {isUpdating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </div>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default EditTaskModal; 