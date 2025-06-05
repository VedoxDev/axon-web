import React from 'react';
import type { Task } from './types.ts';

interface TaskCardProps {
  task: Task;
  onDragStart: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart }) => {
  return (
    <div
      className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow hover:shadow-xl transition-shadow cursor-grab select-none"
      draggable
      onDragStart={onDragStart}
    >
      <div className="text-white font-semibold text-base mb-1">{task.title}</div>
      {task.description && (
        <div className="text-gray-400 text-sm mt-1">{task.description}</div>
      )}
    </div>
  );
};

export default TaskCard; 