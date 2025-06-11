import React, { useState, useEffect } from 'react';
import { useAlert } from '../../hooks/useAlert';
import { API_BASE_URL } from '../../config/apiConfig';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';

interface PersonalTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PersonalTask {
  id: string;
  title: string;
  description: string | null;
  priority: number; // 1-4
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}



const PersonalTasksModal: React.FC<PersonalTasksModalProps> = ({ isOpen, onClose }) => {
  const [activeFilter, setActiveFilter] = useState<'today' | 'upcoming' | 'all'>('today');
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<PersonalTask | null>(null);
  const { showError } = useAlert();

  // Priority colors from API documentation
  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 1: return '#10B981'; // Green - Low
      case 2: return '#F59E0B'; // Amber - Medium
      case 3: return '#EF4444'; // Red - High
      case 4: return '#7C3AED'; // Purple - Critical
      default: return '#F59E0B';
    }
  };

  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1: return 'Baja';
      case 2: return 'Media';
      case 3: return 'Alta';
      case 4: return 'Crítica';
      default: return 'Media';
    }
  };

  const getPriorityIcon = (priority: number): string => {
    switch (priority) {
      case 1: return '⬇️';
      case 2: return '➡️';
      case 3: return '⬆️';
      case 4: return '🔥';
      default: return '➡️';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'todo': return '⭕';
      case 'in_progress': return '🟡';
      case 'done': return '✅';
      default: return '⭕';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'todo': return 'Por hacer';
      case 'in_progress': return 'En progreso';
      case 'done': return 'Completado';
      default: return 'Por hacer';
    }
  };

  // Fetch personal tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/tasks/personal`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cargar las tareas');
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showError(error instanceof Error ? error.message : 'Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  // Handle task creation from the modal
  const handleTaskCreated = (task: PersonalTask) => {
    setTasks(prev => [task, ...prev]);
  };

  // Handle task editing
  const handleEditTask = (task: PersonalTask) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  // Handle task update from edit modal
  const handleTaskUpdated = (updatedTask: PersonalTask | null) => {
    if (updatedTask === null) {
      // Task was deleted
      setTasks(prev => prev.filter(task => task.id !== editingTask?.id));
    } else {
      // Task was updated
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    }
    setEditingTask(null);
  };

  // Update task status
  const updateTaskStatus = async (taskId: string, status: 'todo' | 'in_progress' | 'done') => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar la tarea');
      }

      // Update local state optimistically
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      showError(error instanceof Error ? error.message : 'Error al actualizar la tarea');
    }
  };

  // Filter tasks based on active filter
  const getFilteredTasks = (): PersonalTask[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    switch (activeFilter) {
      case 'today':
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= today && dueDate < tomorrow;
        });
      case 'upcoming':
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= tomorrow && dueDate < nextWeek;
        });
      case 'all':
      default:
        return tasks;
    }
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  // Load tasks when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTasks = getFilteredTasks();

  return (
    <>
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[80vh] rounded-lg shadow-xl z-50 flex flex-col" style={{ backgroundColor: '#161718' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h2 className="text-xl font-semibold text-white">Mis Tareas</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              + Nueva Tarea
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>



        {/* Filters */}
        <div className="flex border-b border-gray-600">
          <button
            onClick={() => setActiveFilter('today')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeFilter === 'today'
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            style={activeFilter === 'today' ? { backgroundColor: '#3A3A3A' } : {}}
          >
            Hoy
          </button>
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeFilter === 'upcoming'
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            style={activeFilter === 'upcoming' ? { backgroundColor: '#3A3A3A' } : {}}
          >
            Próximo
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeFilter === 'all'
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            style={activeFilter === 'all' ? { backgroundColor: '#3A3A3A' } : {}}
          >
            Todo
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[400px] max-h-[500px] custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <div className="text-gray-400 text-lg mb-2">
                {activeFilter === 'today' ? 'No hay tareas para hoy' :
                 activeFilter === 'upcoming' ? 'No hay tareas próximas' :
                 'No hay tareas'}
              </div>
              <div className="text-gray-500 text-sm">
                {activeFilter === 'all' ? 'Crea tu primera tarea personal' : 'Las tareas aparecerán aquí cuando las tengas'}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-lg border-l-4 transition-all cursor-pointer"
                  style={{ 
                    backgroundColor: task.status === 'done' ? '#2D2D2D' : '#3A3A3A',
                    borderLeftColor: getPriorityColor(task.priority)
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3A3A3A'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = task.status === 'done' ? '#2D2D2D' : '#3A3A3A'}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          const nextStatus = task.status === 'todo' ? 'in_progress' : 
                                           task.status === 'in_progress' ? 'done' : 'todo';
                          updateTaskStatus(task.id, nextStatus);
                        }}
                        className="text-lg hover:scale-110 transition-transform"
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm" style={{ color: getPriorityColor(task.priority) }}>
                          {getPriorityIcon(task.priority)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {getPriorityLabel(task.priority)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      {task.dueDate && (
                        <span className={`px-2 py-1 rounded-full ${
                          new Date(task.dueDate) < new Date() ? 'bg-red-600 text-white' : 'bg-gray-600'
                        }`}>
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                      <span className="text-gray-500">
                        {getStatusLabel(task.status)}
                      </span>
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-gray-400 hover:text-orange-400 transition-colors p-1"
                        title="Editar tarea"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <h4 className={`font-medium mb-1 ${
                    task.status === 'done' ? 'text-gray-400 line-through' : 'text-white'
                  }`}>
                    {task.title}
                  </h4>
                  
                  {task.description && (
                    <p className={`text-sm ${
                      task.status === 'done' ? 'text-gray-500' : 'text-gray-300'
                    } line-clamp-2`}>
                      {task.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* Edit Task Modal */}
      <EditTaskModal 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTask(null);
        }}
        onTaskUpdated={handleTaskUpdated}
        task={editingTask}
      />

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
};

export default PersonalTasksModal; 