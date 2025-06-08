import React from 'react';
import TaskCard from './TaskCard.tsx';
import type { Task, TaskColumnType } from './types.ts';

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
  columnId: TaskColumnType;
  title: string;
  tasks: Task[];
  onDragStart: (task: Task, from: TaskColumnType) => void;
  onDrop: (to: TaskColumnType) => void;
  isDragOver: boolean | null;
  onAddTask: (column: TaskColumnType) => void;
}

const columnColors: Record<TaskColumnType, { bg: string; border: string }> = {
  assigned: { bg: 'bg-[#42A5F5]', border: 'border-blue-700' },
  inProgress: { bg: 'bg-[#FFB74D]', border: 'border-orange-700' },
  completed: { bg: 'bg-[#4CAF50]', border: 'border-green-700' },
  integration: { bg: 'bg-[#FF6E6E]', border: 'border-green-700' },
  review: { bg: 'bg-[#7B1FA2]', border: 'border-green-700' },
};

const TaskColumn: React.FC<TaskColumnProps> = ({
  columnId,
  title,
  tasks,
  onDragStart,
  onDrop,
  isDragOver,
  onAddTask,
}) => {
  const colors = columnColors[columnId];

  return (
    <div
      className={`flex flex-col ${colors.bg} rounded-xl shadow-lg ${colors.border} w-72 hide-scrollbar min-w-[18rem] h-full transition-colors ${isDragOver ? 'ring-2 ring-blue-500' : ''}`}
      onDragOver={e => { e.preventDefault(); }}
      onDrop={() => onDrop(columnId)}
    >
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <span className="text-lg font-semibold text-white">{title}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4 hide-scrollbar">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={() => onDragStart(task, columnId)}
          />
        ))}
      </div>
      <button
        className="m-3 mt-auto py-2 px-3 bg-gray-700 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow flex items-center justify-center"
        onClick={() => onAddTask(columnId)}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add a card
      </button>

      {/* Inject styles */}
      <style>{style}</style>
    </div>
  );
};

export default TaskColumn; 