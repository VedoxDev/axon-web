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
      <div className="text-black font-bold text-base mb-1">{task.title}</div>
      {task.description && (
        <div className="text-black text-sm mt-1">{task.description}</div>
      )}
    </div>
  );
};

export default TaskCard; 