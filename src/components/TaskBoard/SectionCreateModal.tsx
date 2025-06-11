import React, { useState, useEffect } from 'react';
import type { ProjectSection } from '../../services/taskService';
import taskService from '../../services/taskService';

interface SectionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSectionCreated: (section: ProjectSection) => void;
  projectId: string;
}

const SectionCreateModal: React.FC<SectionCreateModalProps> = ({
  isOpen,
  onClose,
  onSectionCreated,
  projectId
}) => {
  const [formData, setFormData] = useState({
    name: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: ''
      });
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('El nombre de la sección es obligatorio');
      return;
    }

    if (formData.name.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (formData.name.trim().length > 50) {
      setError('El nombre no puede exceder 50 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const sectionData = {
        name: formData.name.trim()
      };

      const newSection = await taskService.createProjectSection(projectId, sectionData);
      onSectionCreated(newSection);
      onClose();
    } catch (error: any) {
      console.error('Error creating section:', error);
      setError(error.message || 'Error al crear la sección');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div className="rounded-lg shadow-xl max-w-lg w-full max-h-[75vh] overflow-hidden flex flex-col" style={{ backgroundColor: '#161718' }}>
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#2D2D2D' }}>
            <h2 className="text-xl font-semibold text-white">Nueva Sección</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form - Scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Section Name */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Nombre de la sección *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  style={{ backgroundColor: '#2D2D2D' }}
                  placeholder="Ej: En Progreso, Por Revisar, Completado..."
                  maxLength={50}
                  required
                />
                <p className="text-sm text-gray-400 mt-1">
                  {formData.name.length}/50 caracteres
                </p>
              </div>
            </form>
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0" style={{ borderTopColor: '#2D2D2D', borderTopWidth: '1px', borderTopStyle: 'solid' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim() || formData.name.trim().length < 3}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              onClick={handleSubmit}
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isLoading ? 'Creando...' : 'Crear Sección'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionCreateModal; 