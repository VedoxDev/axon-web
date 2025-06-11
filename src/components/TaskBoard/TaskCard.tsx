import React from 'react';
import type { Task } from './types.ts';

interface TaskCardProps {
  task: Task;
  onDragStart: () => void;
  onClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onClick }) => {
  return (
    <div
      className="bg-[#FFFFFF] border border-gray-700 rounded-lg p-4 shadow hover:shadow-xl transition-shadow cursor-grab select-none"
      draggable
      onDragStart={onDragStart}
      onClick={() => onClick(task)}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center">
          {task.indicatorColor && (
            <div
              className={`w-3 h-3 rounded-full mr-2`}
              style={{ backgroundColor: task.indicatorColor }}
            ></div>
          )}
          <div className="text-black font-bold text-base">{task.title}</div>
        </div>
        <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
      </div>
      {task.description && (
        <div className="text-gray-600 text-sm mt-1">{task.description}</div>
      )}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {task.labels.map(label => (
            <span
              key={label}
              className={`text-xs font-semibold px-2.5 py-0.5 rounded ${label === 'Diseño' ? 'bg-blue-200 text-blue-800' : 'bg-yellow-200 text-yellow-800'}`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
      {(task.assignedTo || task.dueDate) && (
        <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
          {task.assignedTo && (
            <span className="text-black">
              {task.assignedTo.map(person => person.name).join(', ')}
            </span>
          )}
          {task.dueDate && <span className="text-red-500 font-medium">{task.dueDate}</span>}
        </div>
      )}
    </div>
  );
};

export default TaskCard; 