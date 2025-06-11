import React, { useState, useEffect } from 'react';
import type { ProjectLabel } from '../../services/taskService';
import taskService from '../../services/taskService';

interface LabelManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onLabelsChanged: () => void;
}

const LabelManageModal: React.FC<LabelManageModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onLabelsChanged
}) => {
  const [labels, setLabels] = useState<ProjectLabel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingLabel, setEditingLabel] = useState<{ id: number; name: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  // Predefined colors for labels
  const predefinedColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#14B8A6', // Teal
    '#A855F7'  // Violet
  ];

  // Custom scrollbar styles
  const scrollbarStyles = `
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(107, 114, 128, 0.3) transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(107, 114, 128, 0.3);
      border-radius: 2px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: rgba(107, 114, 128, 0.5);
    }
  `;

  // Load labels when modal opens
  useEffect(() => {
    if (isOpen && projectId) {
      loadLabels();
    }
  }, [isOpen, projectId]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setEditingLabel(null);
      setIsCreating(false);
      setNewLabelName('');
      setSelectedColor('#3B82F6');
      setError('');
    }
  }, [isOpen]);

  const loadLabels = async () => {
    try {
      setIsLoading(true);
      const projectLabels = await taskService.getProjectLabels(projectId);
      setLabels(projectLabels);
    } catch (error: any) {
      console.error('Error loading labels:', error);
      setError(error.message || 'Error al cargar etiquetas');
      setLabels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) {
      setError('El nombre de la etiqueta es obligatorio');
      return;
    }

    if (newLabelName.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    if (newLabelName.trim().length > 30) {
      setError('El nombre no puede exceder 30 caracteres');
      return;
    }

    try {
      setIsLoading(true);
      await taskService.createProjectLabel(projectId, {
        name: newLabelName.trim(),
        color: selectedColor
      });

      await loadLabels();
      setIsCreating(false);
      setNewLabelName('');
      setSelectedColor('#3B82F6');
      setError('');
      onLabelsChanged();
    } catch (error: any) {
      console.error('Error creating label:', error);
      setError(error.message || 'Error al crear etiqueta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLabel = async () => {
    if (!editingLabel) return;

    if (!editingLabel.name.trim()) {
      setError('El nombre de la etiqueta es obligatorio');
      return;
    }

    if (editingLabel.name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    if (editingLabel.name.trim().length > 30) {
      setError('El nombre no puede exceder 30 caracteres');
      return;
    }

    try {
      setIsLoading(true);
      const originalLabel = labels.find(l => l.id === editingLabel.id);
      if (originalLabel) {
        await taskService.updateProjectLabel(projectId, editingLabel.id, {
          name: editingLabel.name.trim(),
          color: originalLabel.color
        });

        await loadLabels();
        setEditingLabel(null);
        setError('');
        onLabelsChanged();
      }
    } catch (error: any) {
      console.error('Error updating label:', error);
      setError(error.message || 'Error al actualizar etiqueta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLabel = async (labelId: number, labelName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la etiqueta "${labelName}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      await taskService.deleteProjectLabel(projectId, labelId);
      await loadLabels();
      setError('');
      onLabelsChanged();
    } catch (error: any) {
      console.error('Error deleting label:', error);
      setError(error.message || 'Error al eliminar etiqueta');
    } finally {
      setIsLoading(false);
    }
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingLabel(null);
    setError('');
  };

  const startEditing = (label: ProjectLabel) => {
    setEditingLabel({ id: label.id, name: label.name });
    setIsCreating(false);
    setError('');
  };

  const cancelEdit = () => {
    setEditingLabel(null);
    setIsCreating(false);
    setNewLabelName('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div className="rounded-lg shadow-xl max-w-md w-full max-h-[75vh] overflow-hidden flex flex-col" style={{ backgroundColor: '#161718' }}>
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#2D2D2D' }}>
            <h2 className="text-xl font-semibold text-white">Gestionar Etiquetas</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Create New Label Section */}
              {isCreating ? (
                <div className="border rounded-lg p-4 space-y-4" style={{ borderColor: '#2D2D2D', backgroundColor: '#1F2937' }}>
                  <h3 className="text-white font-medium">Nueva Etiqueta</h3>
                  
                  <div>
                    <input
                      type="text"
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                      style={{ backgroundColor: '#2D2D2D' }}
                      placeholder="Nombre de la etiqueta..."
                      maxLength={30}
                      autoFocus
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      {newLabelName.length}/30 caracteres
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-200 mb-2">Selecciona un color:</p>
                    <div className="grid grid-cols-6 gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            selectedColor === color 
                              ? 'border-white scale-110' 
                              : 'border-gray-500 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCreateLabel}
                      disabled={isLoading || !newLabelName.trim()}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded text-sm font-medium transition-colors"
                    >
                      {isLoading ? 'Creando...' : 'Crear'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={startCreating}
                  className="w-full p-3 border-2 border-dashed border-gray-500 rounded-lg text-gray-300 hover:border-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva Etiqueta
                </button>
              )}

              {/* Existing Labels */}
              <div className="space-y-2">
                {isLoading && labels.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    Cargando etiquetas...
                  </div>
                ) : labels.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    No hay etiquetas creadas
                  </div>
                ) : (
                  labels.map((label) => (
                    <div key={label.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: '#2D2D2D', backgroundColor: '#1F2937' }}>
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        {editingLabel?.id === label.id ? (
                          <input
                            type="text"
                            value={editingLabel.name}
                            onChange={(e) => setEditingLabel({ ...editingLabel, name: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                            style={{ backgroundColor: '#2D2D2D' }}
                            maxLength={30}
                            autoFocus
                          />
                        ) : (
                          <span className="text-white font-medium flex-1">{label.name}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {editingLabel?.id === label.id ? (
                          <>
                            <button
                              onClick={handleUpdateLabel}
                              disabled={isLoading}
                              className="p-1 text-green-400 hover:text-green-300 transition-colors"
                              title="Guardar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                              title="Cancelar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(label)}
                              className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteLabel(label.id, label.name)}
                              disabled={isLoading}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0" style={{ borderTopColor: '#2D2D2D', borderTopWidth: '1px', borderTopStyle: 'solid' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LabelManageModal; 