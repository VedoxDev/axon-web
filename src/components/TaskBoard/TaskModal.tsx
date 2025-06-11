import React, { useState, useEffect } from 'react';
import type { Task, TaskColumnType } from './types.ts';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onUpdateTask }) => {
  const [editedTask, setEditedTask] = useState<Task | null>(task);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  
  // Suppress unused warning
  void isTitleFocused;
  const [newLabel, setNewLabel] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // For entrance animation

  useEffect(() => {
    setEditedTask(task);
    setIsEditing(false); // Reset edit mode when task changes

    // Trigger entrance animation
    if (task) {
      const timer = setTimeout(() => setIsVisible(true), 10); // Small delay to allow mount
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false); // Reset when task is null (unmounting or just closed)
    }
  }, [task]);

  if (!task) {
    return null;
  }

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedTask(task); // Revert changes
    setIsEditing(false);
    setIsTitleFocused(false);
  };

  const handleSave = () => {
    if (editedTask) {
      onUpdateTask(editedTask);
      setIsEditing(false); // Exit edit mode after saving
      onClose();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedTask) {
      setEditedTask({ ...editedTask, title: e.target.value });
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (editedTask) {
      setEditedTask({ ...editedTask, description: e.target.value });
    }
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (editedTask) {
      setEditedTask({ ...editedTask, priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' });
    }
  };

  const handleAddLabel = () => {
    if (editedTask && newLabel.trim() !== '') {
      const newLabelObj = { id: Date.now(), name: newLabel.trim(), color: '#3B82F6' };
      setEditedTask({ ...editedTask, labels: [...editedTask.labels, newLabelObj] });
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: number) => {
    if (editedTask) {
      setEditedTask({ ...editedTask, labels: editedTask.labels.filter(label => label.id !== labelToRemove) });
    }
  };

  const handleAssignedToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (editedTask) {
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => ({ id: option.value, name: option.label }));
      setEditedTask({ ...editedTask, assignedTo: selectedOptions });
    }
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (editedTask) {
      setEditedTask({ ...editedTask, section: e.target.value as TaskColumnType });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedTask) {
      setEditedTask({ ...editedTask, dueDate: e.target.value });
    }
  };

  return (
    <div
      className={`absolute inset-0 bg-black z-50 flex justify-center items-center transition-opacity duration-300 ease-out ${isVisible ? 'bg-opacity-50' : 'bg-opacity-0'}`}
      onClick={onClose}
    >
      <style>
        {`
          .modal-scrollbar::-webkit-scrollbar {
            width: 8px; /* width of vertical scrollbar */
          }

          .modal-scrollbar::-webkit-scrollbar-track {
            background: #2D3748; /* dark gray/black track */
            border-radius: 10px;
          }

          .modal-scrollbar::-webkit-scrollbar-thumb {
            background: #4299E1; /* blue thumb */
            border-radius: 10px;
          }

          .modal-scrollbar {
            scrollbar-width: thin; /* Firefox */
            scrollbar-color:rgb(255, 148, 34) #1a202c;
          }
        `}
      </style>
      <div
        className={`bg-[#2D2D2D] rounded-lg shadow-xl w-full max-w-2xl text-white relative flex flex-col max-h-[90vh] transition-all duration-300 ease-out transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-4">
          {/* Close Button */}
          <button onClick={onClose} className="text-gray-400 hover:text-white text-4xl font-semibold leading-none">
            &times;
          </button>

          {/* Title */}
          <div className="flex-grow text-center mx-4">
            {isEditing ? (
              <input
                type="text"
                value={editedTask?.title || ''}
                onChange={handleTitleChange}
                onBlur={() => setIsTitleFocused(false)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setIsTitleFocused(false);
                  }
                }}
                className="text-2xl font-bold bg-[#151718] text-white p-2 rounded w-full text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
            ) : (
              <h2 className="text-3xl font-bold">
                {editedTask?.title}
              </h2>
            )}
          </div>

          {/* Edit/Save/Cancel Buttons */}
          <div>
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium text-sm"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleEditClick}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center"
              >
                ✏️ Editar
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto modal-scrollbar px-6 pb-2 pt-4">
          <div className="mb-4">
            <span className="text-sm font-semibold text-gray-400 block mb-1">Sección</span>
            {isEditing ? (
              <select
                id="section"
                value={editedTask?.section || ''}
                onChange={handleSectionChange}
                className="w-full p-2 rounded bg-[#151718] text-white border border-gray-600"
              >
                <option value="assigned">Assignado</option>
                <option value="inProgress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="integration">Integration</option>
                <option value="review">Review</option>
              </select>
            ) : (
              <span className="bg-gray-600 text-white text-xs px-3 py-1 rounded-full">{editedTask?.section}</span>
            )}
          </div>

          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-400 block mb-1" htmlFor="priority">Prioridad</label>
            {isEditing ? (
              <select
                id="priority"
                value={editedTask?.priority}
                onChange={handlePriorityChange}
                className="w-full p-2 rounded bg-[#151718] text-white border border-gray-600"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            ) : (
              <span className="bg-gray-600 text-white text-xs px-3 py-1 rounded-full capitalize">{editedTask?.priority}</span>
            )}
          </div>

          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-400 block mb-1 ">Etiquetas</label>
            {isEditing ? (
              <>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editedTask?.labels.map(label => (
                    <span key={label.id} className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full flex items-center ">
                      {label.name}
                      <button onClick={() => handleRemoveLabel(label.id)} className="ml-2 text-white hover:text-red-300">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Add new label"
                    className="flex-1 p-2 rounded-l bg-[#151718] text-white border border-gray-600 focus:ring-2 focus:ring-orange-500"
                  />
                  <button onClick={handleAddLabel} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-r">
                    Add
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                {editedTask?.labels.map(label => (
                  <span key={label.id} className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                    {label.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-400 block mb-1" htmlFor="assignedTo">Asignado a</label>
            {isEditing ? (
              <select
                id="assignedTo"
                multiple
                value={editedTask?.assignedTo.map(assignee => assignee.id)}
                onChange={handleAssignedToChange}
                className="w-full p-2 rounded bg-[#151718] text-white border border-gray-600"
              >
                <option value="user1">Victor Alejandro</option>
                <option value="user2">Ranzes Azahel</option>
                <option value="user3">John Doe</option>
              </select>
            ) : (
              <div className="flex flex-wrap gap-2">
                {editedTask?.assignedTo.map(assignee => (
                  <span key={assignee.id} className="bg-gray-600 text-white text-xs px-3 py-1 rounded-full">
                    {assignee.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-400 block mb-1" htmlFor="dueDate">Fecha de vencimiento</label>
            {isEditing ? (
              <input
                type="date"
                id="dueDate"
                value={editedTask?.dueDate || ''}
                onChange={handleDateChange}
                className="w-full p-2 rounded bg-[#151718] text-white border border-gray-600"
              />
            ) : (
              <span className="text-white">{editedTask?.dueDate}</span>
            )}
          </div>

          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-400 block mb-1" htmlFor="description">Descripción</label>
            {isEditing ? (
              <textarea
                id="description"
                value={editedTask?.description || ''}
                onChange={handleDescriptionChange}
                className="w-full p-2 rounded bg-[#151718] text-white border border-gray-600 h-24 focus:ring-2 focus:ring-orange-500"
                placeholder="Add a detailed description for this task..."
              />
            ) : (
              <p className="text-gray-300 whitespace-pre-wrap">{editedTask?.description}</p>
            )}
          </div>

          <div className="mb-4 border-t border-gray-700 pt-4">
            <h3 className="text-md font-semibold text-gray-400 mb-2">Información</h3>
            <p className="text-sm text-gray-300">Creado por: <span className="font-medium">{editedTask?.createdBy?.name}</span></p>
            <p className="text-sm text-gray-300">Fecha de creación: <span className="font-medium">{editedTask?.creationDate}</span></p>
            <p className="text-sm text-gray-300">Última actualización: <span className="font-medium">{editedTask?.lastUpdated}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal; 