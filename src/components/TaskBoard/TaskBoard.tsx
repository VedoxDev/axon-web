import React, { useState } from 'react';
import TaskColumn from './TaskColumn.tsx';
import type { Task, TaskColumnType } from './types.ts';

// CSS to style the horizontal scrollbar
const scrollbarStyle = `
  .styled-scrollbar::-webkit-scrollbar {
    height: 5px; /* height of horizontal scrollbar */
  }

  .styled-scrollbar::-webkit-scrollbar-track {
    background: #1a202c; /* dark gray/black track */
    border-radius: 10px;
  }

  .styled-scrollbar::-webkit-scrollbar-thumb {
    background: #2b6cb0; /* blue thumb */
    border-radius: 10px;
  }

  /* Firefox scrollbar */
  .styled-scrollbar {
    scrollbar-width: thin;
    scrollbar-height: 20px;
    scrollbar-color:rgb(255, 148, 34) #1a202c;
  }
`;

const initialTasks: Record<TaskColumnType, Task[]> = {
  assigned: [
    { id: '1', title: 'Diseñar login', description: 'Crear la pantalla de login para la app.' },
    { id: '2', title: 'Reunión inicial', description: 'Kickoff con el equipo de desarrollo.' },
    { id: '2', title: 'Reunión inicial', description: 'Kickoff con el equipo de desarrollo.' },
    { id: '2', title: 'Reunión inicial', description: 'Kickoff con el equipo de desarrollo.' },
    { id: '2', title: 'Reunión inicial', description: 'Kickoff con el equipo de desarrollo.' },
    { id: '2', title: 'Reunión inicial', description: 'Kickoff con el equipo de desarrollo.' },
  ],
  inProgress: [
    { id: '3', title: 'API de usuarios', description: 'Implementar endpoints para usuarios.' },
  ],
  completed: [
    { id: '4', title: 'Wireframes', description: 'Wireframes de la app completados.' },
  ],
  integration: [
    { id: '4', title: 'BBDD', description: 'Revisar consultas de base de datos.' },
  ],
  review: [
    { id: '4', title: 'Home', description: 'Complemento del home.' },
  ],
};

const columnOrder: TaskColumnType[] = ['assigned', 'inProgress', 'integration', 'review', 'completed'];
const columnTitles: Record<TaskColumnType, string> = {
  assigned: 'Asignado',
  inProgress: 'En proceso',
  completed: 'Completado',
  integration: 'Integración',
  review: 'Revisión',
};

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; from: TaskColumnType } | null>(null);

  const handleDragStart = (task: Task, from: TaskColumnType) => {
    setDraggedTask({ task, from });
  };

  const handleDrop = (to: TaskColumnType) => {
    if (draggedTask && draggedTask.from !== to) {
      setTasks(prev => {
        const fromTasks = prev[draggedTask.from].filter(t => t.id !== draggedTask.task.id);
        const toTasks = [...prev[to], draggedTask.task];
        return {
          ...prev,
          [draggedTask.from]: fromTasks,
          [to]: toTasks,
        };
      });
    }
    setDraggedTask(null);
  };

  const handleAddTask = (column: TaskColumnType) => {
    const title = prompt('Task title:');
    if (title) {
      setTasks(prev => ({
        ...prev,
        [column]: [
          ...prev[column],
          { id: Date.now().toString(), title, description: '' },
        ],
      }));
    }
  };

  return (
    <div className="w-full h-135 overflow-x-auto styled-scrollbar">
      <div className="flex space-x-6 min-w-[900px] pb-4" style={{ height: '100%' }}>
        {columnOrder.map(col => (
          <TaskColumn
            key={col}
            columnId={col}
            title={columnTitles[col]}
            tasks={tasks[col]}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            isDragOver={draggedTask && draggedTask.from !== col}
            onAddTask={handleAddTask}
          />
        ))}
      </div>
      {/* Inject styles */}
      <style>{scrollbarStyle}</style>
    </div>
  );
};

export default TaskBoard;