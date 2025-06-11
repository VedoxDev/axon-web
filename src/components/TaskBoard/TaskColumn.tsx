import React, { useState, useEffect, useRef } from 'react';
import TaskCard from './TaskCard.tsx';
import type { Task, DynamicColumnType, ProjectSection } from './types.ts';
import TaskDetailModal from './TaskDetailModal.tsx';
import taskService from '../../services/taskService';

// CSS to hide scrollbar
const style = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

interface TaskColumnProps {
  columnId: DynamicColumnType;
  title: string;
  tasks: Task[];
  onDragStart: (task: Task, from: DynamicColumnType) => void;
  onDrop: (to: DynamicColumnType) => void;
  isDragOver: boolean | null;
  onAddTask: (column: DynamicColumnType) => void;
  onUpdateTask: (updatedTask: Task) => void;
  colors: { bg: string; border: string };
  isNoSection?: boolean;
  onRenameSection?: (sectionId: string) => void;
  onMoveSection?: (sectionId: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  projectId: string;
  sections: ProjectSection[];
  userRole?: 'owner' | 'admin' | 'member' | null;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  columnId,
  title,
  tasks,
  onDragStart,
  onDrop,
  isDragOver,
  onAddTask,
  onUpdateTask,
  colors,
  isNoSection = false,
  onRenameSection,
  onMoveSection,
  onDeleteSection,
  projectId,
  sections,
  userRole,
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    onUpdateTask(updatedTask);
    handleCloseModal();
  };

  const handleToggleComplete = async (task: Task, completed: boolean) => {
    try {
      // If checking the box, mark as done
      // If unchecking, return to previous status or default to todo
      const newStatus = completed ? 'done' : (task.status === 'done' ? 'todo' : task.status);
      const updatedTask = await taskService.updateTask(task.id, { status: newStatus });
      onUpdateTask(updatedTask);
    } catch (error) {
      console.error('Error updating task status:', error);
      // Could add toast notification here if available
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuAction = (action: 'rename' | 'move' | 'delete') => {
    setIsDropdownOpen(false);
    
    switch (action) {
      case 'rename':
        onRenameSection?.(columnId);
        break;
      case 'move':
        onMoveSection?.(columnId);
        break;
      case 'delete':
        onDeleteSection?.(columnId);
        break;
    }
  };

  return (
    <div
      className={`flex flex-col ${colors.bg} rounded-xl shadow-lg ${colors.border} hide-scrollbar w-[18rem] h-full transition-colors ${isDragOver ? 'ring-2 ring-blue-500' : ''} ${isNoSection ? 'shadow-none' : ''}`}
      onDragOver={e => { e.preventDefault(); }}
      onDrop={() => onDrop(columnId)}
    >
      <div className="px-4 py-3 flex items-center justify-between flex-shrink-0 relative">
        <span className={`text-lg font-semibold ${isNoSection ? 'text-gray-600' : 'text-white'}`}>
          {title}
        </span>
        {!isNoSection && userRole !== 'member' && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleDropdownClick}
              className="p-1 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button
                  onClick={() => handleMenuAction('rename')}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-t-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Renombrar
                </button>
                <button
                  onClick={() => handleMenuAction('move')}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                  Mover
                </button>
                <button
                  onClick={() => handleMenuAction('delete')}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Borrar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4 hide-scrollbar min-h-0">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={() => onDragStart(task, columnId)}
            onClick={handleCardClick}
            onToggleComplete={handleToggleComplete}
          />
        ))}
      </div>
      {!isNoSection && (
        <button
          className={`m-3 mt-0 py-2 px-3 ${isNoSection ? 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-300' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'} rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center flex-shrink-0`}
          onClick={() => onAddTask(columnId)}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar tarea
        </button>
      )}

      {/* Inject styles */}
      <style>{style}</style>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={handleCloseModal}
          onUpdateTask={handleTaskUpdate}
          projectId={projectId}
          sections={sections}
        />
      )}
    </div>
  );
};

export default TaskColumn; 