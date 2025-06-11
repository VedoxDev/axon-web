import React, { useState, useEffect } from 'react';
import TaskColumn from './TaskColumn.tsx';
import TaskCreateModal from './TaskCreateModal.tsx';
import SectionCreateModal from './SectionCreateModal.tsx';
import SectionReorderModal from './SectionReorderModal.tsx';
import LabelManageModal from './LabelManageModal.tsx';
import ConfirmModal from './ConfirmModal.tsx';
import PromptModal from './PromptModal.tsx';
import type { Task, ProjectSection } from './types.ts';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';
import { useAlert } from '../../hooks/useAlert';

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

interface TaskBoardProps {
  projectId?: string; // Optional for backward compatibility
}

// Column colors for different sections
const getSectionColor = (index: number): { bg: string; border: string } => {
  const colors = [
    { bg: 'bg-[#42A5F5]', border: 'border-blue-700' },      // Blue
    { bg: 'bg-[#FFB74D]', border: 'border-orange-700' },    // Orange
    { bg: 'bg-[#FF6E6E]', border: 'border-red-700' },       // Red
    { bg: 'bg-[#7B1FA2]', border: 'border-purple-700' },    // Purple
    { bg: 'bg-[#4CAF50]', border: 'border-green-700' },     // Green
    { bg: 'bg-[#607D8B]', border: 'border-gray-700' },      // Gray
    { bg: 'bg-[#FF9800]', border: 'border-amber-700' },     // Amber
    { bg: 'bg-[#9C27B0]', border: 'border-fuchsia-700' },   // Fuchsia
  ];
  return colors[index % colors.length];
};

const TaskBoard: React.FC<TaskBoardProps> = ({ projectId }) => {
  const { showError, showSuccess } = useAlert();
  
  // State for sections and tasks
  const [sections, setSections] = useState<ProjectSection[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [draggedTask, setDraggedTask] = useState<{ task: Task; from: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [isTaskCreateModalOpen, setIsTaskCreateModalOpen] = useState(false);
  const [isSectionCreateModalOpen, setIsSectionCreateModalOpen] = useState(false);
  const [isSectionReorderModalOpen, setIsSectionReorderModalOpen] = useState(false);
  const [isLabelManageModalOpen, setIsLabelManageModalOpen] = useState(false);
  const [preSelectedSectionId, setPreSelectedSectionId] = useState<string>('');
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'member' | null>(null);
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (value: string) => void;
    defaultValue?: string;
    inputType?: 'text' | 'number';
    placeholder?: string;
    validation?: any;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Load sections and tasks when component mounts or projectId changes
  useEffect(() => {
    if (projectId) {
      loadProjectData();
      loadUserRole();
    } else {
      // Show empty state if no project selected
      setSections([]);
      setTasks({});
      setUserRole(null);
      setIsLoading(false);
      setIsLoadingSections(false);
    }
  }, [projectId]);

  const loadProjectData = async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      setIsLoadingSections(true);

      // Load sections and tasks in parallel
      const [sectionsData, tasksData] = await Promise.all([
        taskService.getProjectSections(projectId),
        taskService.getProjectTasks(projectId)
      ]);

      // Set sections (already ordered by the API)
      setSections(sectionsData);

      // Group tasks by section ID
      const groupedTasks: Record<string, Task[]> = {};
      
      // Initialize empty arrays for all sections
      sectionsData.forEach(section => {
        groupedTasks[section.id.toString()] = [];
      });
      
      // Add a special column for tasks without sections
      groupedTasks['no-section'] = [];

      // Distribute tasks into sections
      tasksData.forEach(task => {
        const sectionKey = task.sectionId ? task.sectionId.toString() : 'no-section';
        if (groupedTasks[sectionKey]) {
          groupedTasks[sectionKey].push(task);
        } else {
          // If task belongs to a section that doesn't exist anymore, put it in no-section
          groupedTasks['no-section'].push(task);
        }
      });

      setTasks(groupedTasks);
    } catch (error: any) {
      console.error('Error loading project data:', error);
      showError(error.message || 'Error al cargar datos del proyecto', 'Error');
    } finally {
      setIsLoading(false);
      setIsLoadingSections(false);
    }
  };

  const loadUserRole = async () => {
    if (!projectId) return;
    
    try {
      const currentUser = await projectService.getCurrentUser();
      const projectDetails = await projectService.getProjectDetails(projectId);
      const userMember = projectDetails.members.find((member: any) => member.id === currentUser.id);
      setUserRole(userMember?.role || null);
    } catch (error: any) {
      console.error('Error loading user role:', error);
      setUserRole(null);
    }
  };

  const handleDragStart = (task: Task, from: string) => {
    setDraggedTask({ task, from });
  };

  const handleDrop = async (to: string) => {
    if (!draggedTask || !projectId || draggedTask.from === to) {
      setDraggedTask(null);
      return;
    }

    try {
      const targetSectionId = to === 'no-section' ? null : parseInt(to);
      
      // Update task section via API
      await taskService.updateTask(draggedTask.task.id, {
        sectionId: targetSectionId || undefined, // Convert null to undefined for API
        // Update status based on section (basic logic - can be customized)
        status: targetSectionId ? 
                (sections.find(s => s.id === targetSectionId)?.name.toLowerCase().includes('done') || 
                 sections.find(s => s.id === targetSectionId)?.name.toLowerCase().includes('completado') ? 'done' : 
                 sections.find(s => s.id === targetSectionId)?.name.toLowerCase().includes('progress') ||
                 sections.find(s => s.id === targetSectionId)?.name.toLowerCase().includes('proceso') ? 'in_progress' : 'todo') : 'todo'
      });

      // Update local state
      setTasks(prev => {
        const fromTasks = prev[draggedTask.from].filter(t => t.id !== draggedTask.task.id);
        const updatedTask = { 
          ...draggedTask.task, 
          sectionId: targetSectionId, // Keep as null for UI consistency
          section: targetSectionId ? sections.find(s => s.id === targetSectionId)?.name || null : null,
        };
        const toTasks = [...(prev[to] || []), updatedTask];
        
        return {
          ...prev,
          [draggedTask.from]: fromTasks,
          [to]: toTasks,
        };
      });

      showSuccess('Tarea movida correctamente', 'Éxito');
    } catch (error: any) {
      console.error('Error moving task:', error);
      showError(error.message || 'Error al mover tarea', 'Error');
    }

    setDraggedTask(null);
  };

  const handleCreateTask = async () => {
    if (!projectId) {
      showError('No hay proyecto seleccionado', 'Error');
      return;
    }
    setPreSelectedSectionId(''); // No pre-selected section for header button
    setIsTaskCreateModalOpen(true);
  };

  const handleTaskCreated = (newTask: Task) => {
    // Determine which section to add the task to
    const targetSection = newTask.sectionId ? newTask.sectionId.toString() : 'no-section';
    
    // Add to local state
    setTasks(prev => ({
      ...prev,
      [targetSection]: [...(prev[targetSection] || []), newTask],
    }));

    showSuccess('Tarea creada correctamente', 'Éxito');
  };

  const handleCreateSection = async () => {
    if (!projectId) {
      showError('No hay proyecto seleccionado', 'Error');
      return;
    }
    setIsSectionCreateModalOpen(true);
  };

  const handleSectionCreated = (newSection: ProjectSection) => {
    // Update sections list
    setSections(prev => [...prev, newSection].sort((a, b) => a.order - b.order));
    
    // Initialize empty tasks array for new section
      setTasks(prev => ({
        ...prev,
      [newSection.id.toString()]: []
    }));

    showSuccess('Sección creada correctamente', 'Éxito');
  };

  const handleManageLabels = async () => {
    if (!projectId) {
      showError('No hay proyecto seleccionado', 'Error');
      return;
    }
    setIsLabelManageModalOpen(true);
  };

  const handleLabelsChanged = () => {
    // This can be used to refresh data if needed
    // For now, we'll just show a success message
    showSuccess('Etiquetas actualizadas correctamente', 'Éxito');
  };

  const handleAddTask = async (sectionKey: string) => {
    if (!projectId) {
      showError('No hay proyecto seleccionado', 'Error');
      return;
    }

    // Set the pre-selected section
    setPreSelectedSectionId(sectionKey === 'no-section' ? '' : sectionKey);
    setIsTaskCreateModalOpen(true);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!projectId) return;

    try {
      await taskService.updateTask(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority === 'low' ? 1 :
                 updatedTask.priority === 'medium' ? 2 :
                 updatedTask.priority === 'high' ? 3 : 4,
        dueDate: updatedTask.dueDate || undefined,
      });

      // Update local state
    setTasks(prev => {
      const newTasks = { ...prev };
        for (const sectionKey in newTasks) {
          newTasks[sectionKey] = newTasks[sectionKey].map(task =>
          task.id === updatedTask.id ? updatedTask : task
        );
      }
      return newTasks;
      });

      showSuccess('Tarea actualizada correctamente', 'Éxito');
    } catch (error: any) {
      console.error('Error updating task:', error);
      showError(error.message || 'Error al actualizar tarea', 'Error');
    }
  };

  const handleRenameSection = async (sectionId: string) => {
    if (!projectId) return;

    const section = sections.find(s => s.id.toString() === sectionId);
    if (!section) return;

    setPromptModal({
      isOpen: true,
      title: 'Renombrar Sección',
      message: 'Ingresa el nuevo nombre para la sección:',
      defaultValue: section.name,
      placeholder: 'Nombre de la sección...',
      validation: {
        required: true,
        minLength: 3,
        maxLength: 50
      },
      onConfirm: async (newName: string) => {
        if (newName === section.name) return;

        try {
          await taskService.updateProjectSection(projectId, section.id, {
            name: newName
          });

          // Update local state
          setSections(prev => prev.map(s => 
            s.id === section.id ? { ...s, name: newName } : s
          ));

          showSuccess('Sección renombrada correctamente', 'Éxito');
        } catch (error: any) {
          console.error('Error renaming section:', error);
          showError(error.message || 'Error al renombrar sección', 'Error');
        }
      }
    });
  };

  const handleMoveSection = async () => {
    if (!projectId) return;
    setIsSectionReorderModalOpen(true);
  };

  const handleSectionReorder = async (newOrder: number[]) => {
    if (!projectId) return;

    try {
      await taskService.reorderProjectSections(projectId, newOrder);

      // Reload sections to get the updated order
      const updatedSections = await taskService.getProjectSections(projectId);
      setSections(updatedSections);

      showSuccess('Secciones reordenadas correctamente', 'Éxito');
    } catch (error: any) {
      console.error('Error reordering sections:', error);
      showError(error.message || 'Error al reordenar secciones', 'Error');
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!projectId) return;

    const section = sections.find(s => s.id.toString() === sectionId);
    if (!section) return;

    const tasksInSection = tasks[sectionId] || [];
    
    const confirmMessage = tasksInSection.length > 0 
      ? `¿Estás seguro de eliminar la sección "${section.name}"?\n\nEsta sección tiene ${tasksInSection.length} tarea(s). Las tareas se moverán a "Pendientes".`
      : `¿Estás seguro de eliminar la sección "${section.name}"?`;
    
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Sección',
      message: confirmMessage,
      isDestructive: true,
      confirmText: 'Eliminar',
      onConfirm: async () => {
        try {
          await taskService.deleteProjectSection(projectId, section.id);

          // Update local state
          setSections(prev => prev.filter(s => s.id !== section.id));
          
          // Move tasks to no-section if they exist
          if (tasksInSection.length > 0) {
            setTasks(prev => ({
              ...prev,
              'no-section': [...(prev['no-section'] || []), ...tasksInSection],
              [sectionId]: []
            }));
          } else {
            setTasks(prev => {
              const newTasks = { ...prev };
              delete newTasks[sectionId];
              return newTasks;
            });
          }

          showSuccess('Sección eliminada correctamente', 'Éxito');
        } catch (error: any) {
          console.error('Error deleting section:', error);
          showError(error.message || 'Error al eliminar sección', 'Error');
        }
      }
    });
  };

  // Show loading state
  if (isLoading || isLoadingSections) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando tablero...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no project selected
  if (!projectId) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-xl font-medium text-white mb-2">
            Selecciona un proyecto
          </h3>
          <p className="text-gray-400">
            Elige un proyecto de la lista para ver sus tareas
          </p>
        </div>
      </div>
    );
  }

  // Render the TaskBoard with dynamic sections
  const allSectionKeys = [
    // Always show "no-section" first if it has tasks OR if there are no other sections
    ...(tasks['no-section']?.length > 0 || sections.length === 0 ? ['no-section'] : []),
    ...sections.map(s => s.id.toString())
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* TaskBoard Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-700" style={{ backgroundColor: '#282828' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Tablero de Tareas
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleCreateTask()}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Tarea
            </button>
            {userRole !== 'member' && (
              <>
                <button
                  onClick={() => handleCreateSection()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Nueva Sección
                </button>
                <button
                  onClick={() => handleManageLabels()}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Gestionar Etiquetas
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto styled-scrollbar p-3">
        <div className="flex space-x-6 min-w-max h-full pb-4">
          {allSectionKeys.map((sectionKey, index) => {
            const section = sections.find(s => s.id.toString() === sectionKey);
            const isNoSection = sectionKey === 'no-section';
            const colors = isNoSection 
              ? { bg: 'bg-transparent', border: 'border-dashed border-2 border-gray-400' }
              : getSectionColor(index - (allSectionKeys[0] === 'no-section' ? 1 : 0)); // Adjust index for color cycling
            
            return (
            <TaskColumn
                key={sectionKey}
                columnId={sectionKey}
                title={isNoSection ? 'Pendientes' : (section?.name || 'Sección Desconocida')}
                tasks={tasks[sectionKey] || []}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
                isDragOver={draggedTask && draggedTask.from !== sectionKey}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
                colors={colors}
                isNoSection={isNoSection}
                onRenameSection={handleRenameSection}
                onMoveSection={handleMoveSection}
                onDeleteSection={handleDeleteSection}
                projectId={projectId || ''}
                sections={sections}
                userRole={userRole}
              />
            );
          })}
        </div>
      </div>
      {/* Inject styles */}
      <style>{scrollbarStyle}</style>

      {/* Task Create Modal */}
      <TaskCreateModal
        isOpen={isTaskCreateModalOpen}
        onClose={() => setIsTaskCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        projectId={projectId || ''}
        sections={sections}
        preSelectedSectionId={preSelectedSectionId}
      />

      {/* Section Create Modal */}
      <SectionCreateModal
        isOpen={isSectionCreateModalOpen}
        onClose={() => setIsSectionCreateModalOpen(false)}
        onSectionCreated={handleSectionCreated}
        projectId={projectId || ''}
      />

      {/* Section Reorder Modal */}
      <SectionReorderModal
        isOpen={isSectionReorderModalOpen}
        onClose={() => setIsSectionReorderModalOpen(false)}
        onReorder={handleSectionReorder}
        sections={sections}
      />

      {/* Label Manage Modal */}
      <LabelManageModal
        isOpen={isLabelManageModalOpen}
        onClose={() => setIsLabelManageModalOpen(false)}
        projectId={projectId || ''}
        onLabelsChanged={handleLabelsChanged}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
        confirmText={confirmModal.confirmText}
      />

      {/* Prompt Modal */}
      <PromptModal
        isOpen={promptModal.isOpen}
        onClose={() => setPromptModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={promptModal.onConfirm}
        title={promptModal.title}
        message={promptModal.message}
        defaultValue={promptModal.defaultValue}
        inputType={promptModal.inputType}
        placeholder={promptModal.placeholder}
        validation={promptModal.validation}
      />
    </div>
  );
};

export default TaskBoard;