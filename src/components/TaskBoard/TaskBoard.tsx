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
    { id: '1', title: 'Diseñar login', description: 'Crear la pantalla de login para la app.', priority: 'critical', labels: ['Diseño', 'Frontend'], assignedTo: [{ id: 'user1', name: 'Victor Alejandro' }], dueDate: '2025-06-12', section: 'assigned', createdBy: 'System', creationDate: '2025-06-08, 10:00:00 AM', lastUpdated: '2025-06-09, 02:30:00 PM' },
    { id: '2', title: 'Reunión inicial', description: 'Kickoff con el equipo de desarrollo.', priority: 'moderate', labels: ['Reunión'], assignedTo: [{ id: 'user2', name: 'Ranzes Azahel' }], dueDate: '2025-06-15', section: 'assigned', createdBy: 'System', creationDate: '2025-06-07, 09:00:00 AM', lastUpdated: '2025-06-07, 09:00:00 AM' },
    { id: '3', title: 'Configurar entorno de desarrollo', description: 'Configurar el entorno de desarrollo para el proyecto.', priority: 'minimal', labels: ['DevOps'], assignedTo: [{ id: 'user1', name: 'Victor Alejandro' }], dueDate: '2025-06-20', section: 'assigned', createdBy: 'System', creationDate: '2025-06-09, 03:00:00 PM', lastUpdated: '2025-06-09, 03:00:00 PM' },
  ],
  inProgress: [
    { id: '4', title: 'Implementar feature X', description: 'Desarrollar la funcionalidad X según las especificaciones.', priority: 'critical', labels: ['Backend', 'Frontend'], assignedTo: [{ id: 'user1', name: 'Victor Alejandro' }, { id: 'user2', name: 'Ranzes Azahel' }], dueDate: '2025-06-25', section: 'inProgress', createdBy: 'System', creationDate: '2025-06-10, 11:00:00 AM', lastUpdated: '2025-06-11, 04:00:00 PM' },
  ],
  completed: [
    { id: '5', title: 'Diseño de base de datos', description: 'Completar el diseño de la base de datos y esquemas.', priority: 'moderate', labels: ['Backend'], assignedTo: [{ id: 'user2', name: 'Ranzes Azahel' }], dueDate: '2025-06-05', section: 'completed', createdBy: 'System', creationDate: '2025-06-01, 09:00:00 AM', lastUpdated: '2025-06-05, 05:00:00 PM' },
  ],
  integration: [
    { id: '6', title: 'Pruebas de integración', description: 'Realizar pruebas de integración entre módulos.', priority: 'critical', labels: ['QA', 'Backend'], assignedTo: [{ id: 'user3', name: 'John Doe' }], dueDate: '2025-06-30', section: 'integration', createdBy: 'System', creationDate: '2025-06-12, 09:00:00 AM', lastUpdated: '2025-06-13, 01:00:00 PM' },
  ],
  review: [
    { id: '7', title: 'Revisión de código', description: 'Revisar el código de la feature Y antes de merge.', priority: 'moderate', labels: ['Code Review'], assignedTo: [{ id: 'user1', name: 'Victor Alejandro' }], dueDate: '2025-06-28', section: 'review', createdBy: 'System', creationDate: '2025-06-11, 02:00:00 PM', lastUpdated: '2025-06-13, 03:00:00 PM' },
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
      const now = new Date();
      const newTask: Task = {
        id: Date.now().toString(),
        title,
        description: '',
        priority: 'moderate', // Default priority
        labels: [],
        assignedTo: [],
        dueDate: now.toISOString().split('T')[0],
        section: column,
        createdBy: 'Current User', // Placeholder
        creationDate: now.toLocaleString(),
        lastUpdated: now.toLocaleString(),
      };

      setTasks(prev => ({
        ...prev,
        [column]: [...prev[column], newTask],
      }));
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => {
      const newTasks = { ...prev };
      // Find the column the task belongs to and update it
      for (const columnId in newTasks) {
        const columnType = columnId as TaskColumnType;
        newTasks[columnType] = newTasks[columnType].map(task =>
          task.id === updatedTask.id ? updatedTask : task
        );
      }
      return newTasks;
    });
  };

  return (
    <div className="w-full h-158 overflow-x-auto styled-scrollbar p-3 " >
      <div className="flex space-x-6 min-w-[900px] pb-4" >
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
            onUpdateTask={handleUpdateTask}
          />
        ))}
      </div>
      {/* Inject styles */}
      <style>{scrollbarStyle}</style>
    </div>
  );
};

export default TaskBoard;