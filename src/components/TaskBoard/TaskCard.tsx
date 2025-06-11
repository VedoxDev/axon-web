import React from 'react';
import type { Task } from './types.ts';

interface TaskCardProps {
  task: Task;
  onDragStart: () => void;
  onClick: (task: Task) => void;
  onToggleComplete: (task: Task, completed: boolean) => void;
}

// Priority color mapping
const getPriorityColor = (priority: Task['priority']): string => {
  switch (priority) {
    case 'low': return '#10B981'; // Green
    case 'medium': return '#F59E0B'; // Amber
    case 'high': return '#EF4444'; // Red
    case 'critical': return '#7C3AED'; // Purple
    default: return '#F59E0B'; // Default to medium
  }
};

// Helper function to format name (first name + first last name)
const formatAssigneeName = (fullName: string): string => {
  const nameParts = fullName.trim().split(' ');
  if (nameParts.length === 1) {
    return nameParts[0]; // Just first name
  } else if (nameParts.length >= 2) {
    return `${nameParts[0]} ${nameParts[1]}`; // First name + first last name
  }
  return fullName; // Fallback
};

// Custom checkbox styles
const checkboxStyles = `
  .custom-checkbox {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    width: 1rem;
    height: 1rem;
    border: 2px solid #d1d5db;
    border-radius: 9999px; /* Fully rounded */
    background-color: white;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
  }

  .custom-checkbox:checked {
    background-color: #10b981; /* Green background */
    border-color: #10b981;
  }

  .custom-checkbox:checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .custom-checkbox:hover {
    border-color: #9ca3af;
  }

  .custom-checkbox:checked:hover {
    background-color: #059669;
    border-color: #059669;
  }
`;

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onClick, onToggleComplete }) => {
  const priorityColor = getPriorityColor(task.priority);
  const firstAssignee = task.assignedTo.length > 0 ? task.assignedTo[0] : null;

  return (
    <>
      <style>{checkboxStyles}</style>
      <div
        className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-grab select-none border-l-4 border-r border-t border-b border-gray-200"
        style={{ borderLeftColor: priorityColor }}
        draggable
        onDragStart={onDragStart}
        onClick={() => onClick(task)}
      >
        <div className="flex items-start justify-between mb-1">
          <div className="text-black font-bold text-base flex-1 pr-2">{task.title}</div>
          <input 
            type="checkbox" 
            className="custom-checkbox flex-shrink-0"
            checked={task.status === 'done'}
            onClick={(e) => e.stopPropagation()} // Prevent card click
            onChange={(e) => {
              e.stopPropagation(); // Prevent card click
              const newStatus = e.target.checked;
              onToggleComplete(task, newStatus);
            }}
          />
        </div>
        {task.description && (
          <div className="text-gray-600 text-sm mt-1">{task.description}</div>
        )}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {task.labels.map(label => (
              <span
                key={label.id}
                className="text-xs font-semibold px-2.5 py-0.5 rounded"
                style={{ 
                  backgroundColor: label.color + '20', // Add transparency
                  color: label.color 
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-2">
            {firstAssignee && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {formatAssigneeName(firstAssignee.name)}
              </span>
            )}
            {task.assignedTo.length > 1 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                +{task.assignedTo.length - 1}
              </span>
            )}
          </div>
          {task.dueDate && (
            <span className="text-red-500 font-medium text-sm">
              {new Date(task.dueDate).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default TaskCard; 