import React, { useState, useEffect } from 'react';
import type { ProjectSection } from '../../services/taskService';

interface SectionReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReorder: (newOrder: number[]) => void;
  sections: ProjectSection[];
}

const SectionReorderModal: React.FC<SectionReorderModalProps> = ({
  isOpen,
  onClose,
  onReorder,
  sections
}) => {
  const [reorderedSections, setReorderedSections] = useState<ProjectSection[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  // Reset sections when modal opens
  useEffect(() => {
    if (isOpen) {
      // Sort sections by current order
      const sortedSections = [...sections].sort((a, b) => a.order - b.order);
      setReorderedSections(sortedSections);
    }
  }, [isOpen, sections]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newSections = [...reorderedSections];
    const draggedSection = newSections[draggedIndex];
    
    // Remove dragged section from its current position
    newSections.splice(draggedIndex, 1);
    
    // Insert dragged section at new position
    newSections.splice(dropIndex, 0, draggedSection);
    
    setReorderedSections(newSections);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    // Create array of section IDs in the new order
    const newOrder = reorderedSections.map(section => section.id);
    onReorder(newOrder);
    onClose();
  };

  const hasChanges = () => {
    const originalOrder = [...sections].sort((a, b) => a.order - b.order).map(s => s.id);
    const newOrder = reorderedSections.map(s => s.id);
    return JSON.stringify(originalOrder) !== JSON.stringify(newOrder);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div className="rounded-lg shadow-xl max-w-md w-full max-h-[75vh] overflow-hidden flex flex-col" style={{ backgroundColor: '#161718' }}>
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#2D2D2D' }}>
            <h2 className="text-xl font-semibold text-white">Reordenar Secciones</h2>
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
              <p className="text-gray-200 text-sm mb-4">
                Arrastra las secciones para cambiar su orden en el tablero:
              </p>
              
              <div className="space-y-2">
                {reorderedSections.map((section, index) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border cursor-move transition-all
                      ${draggedIndex === index 
                        ? 'opacity-50 scale-95' 
                        : 'hover:bg-gray-700 hover:border-gray-500'
                      }
                    `}
                    style={{ 
                      backgroundColor: '#2D2D2D',
                      borderColor: '#4B5563'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="text-white font-medium">{section.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="9" cy="6" r="1.5"/>
                        <circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/>
                        <circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/>
                        <circle cx="15" cy="18" r="1.5"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {reorderedSections.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No hay secciones para reordenar
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0" style={{ borderTopColor: '#2D2D2D', borderTopWidth: '1px', borderTopStyle: 'solid' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Guardar Orden
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionReorderModal; 