import React, { useState, useEffect } from 'react';
import { useAlert } from '../../hooks/useAlert';
import announcementService, { type CreateAnnouncementData } from '../../services/announcementService';

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnnouncementCreated: () => void;
  projectId: string;
  projectName: string;
}

interface FormData {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  pinned: boolean;
}

interface FormErrors {
  title?: string;
  content?: string;
  general?: string;
}

const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({
  isOpen,
  onClose,
  onAnnouncementCreated,
  projectId,
  projectName
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    type: 'info',
    pinned: false
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const { showSuccess, showError } = useAlert();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        content: '',
        type: 'info',
        pinned: false
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
      isValid = false;
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres';
      isValid = false;
    } else if (formData.title.length > 200) {
      newErrors.title = 'El título no puede exceder 200 caracteres';
      isValid = false;
    }

    // Content validation
    if (!formData.content.trim()) {
      newErrors.content = 'El contenido es requerido';
      isValid = false;
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'El contenido debe tener al menos 10 caracteres';
      isValid = false;
    } else if (formData.content.length > 2000) {
      newErrors.content = 'El contenido no puede exceder 2000 caracteres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type: inputType } = e.target;
    const checked = inputType === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear general error
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const announcementData: CreateAnnouncementData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        pinned: false
      };

      await announcementService.createAnnouncement(projectId, announcementData);

      showSuccess('Anuncio creado exitosamente', 'El anuncio ha sido publicado en el proyecto');
      onAnnouncementCreated();
      onClose();
    } catch (error: any) {
      console.error('Create announcement error:', error);
      setErrors({ general: error.message });
      showError('Error al crear anuncio', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string): string => {
    return announcementService.getAnnouncementTypeIcon(type as any);
  };

  const getTypeLabel = (type: string): string => {
    return announcementService.getAnnouncementTypeLabel(type as any);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
      <div className="rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" style={{ backgroundColor: '#161718' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#2D2D2D' }}>
          <div>
            <h2 className="text-xl font-bold text-white">Crear Anuncio</h2>
            <p className="text-gray-400 text-sm mt-1">{projectName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#4A5568 transparent'
        }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Título <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={200}
                className="w-full px-3 py-2 rounded-lg border text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#2D2D2D',
                  borderColor: errors.title ? '#EF4444' : '#374151'
                }}
                placeholder="Título del anuncio"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.title ? (
                  <p className="text-red-400 text-sm">{errors.title}</p>
                ) : (
                  <div />
                )}
                <p className="text-gray-400 text-xs">{formData.title.length}/200</p>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Contenido <span className="text-red-400">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={2000}
                rows={6}
                className="w-full px-3 py-2 rounded-lg border text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                style={{
                  backgroundColor: '#2D2D2D',
                  borderColor: errors.content ? '#EF4444' : '#374151'
                }}
                placeholder="Escribe el contenido del anuncio..."
              />
              <div className="flex justify-between items-center mt-1">
                {errors.content ? (
                  <p className="text-red-400 text-sm">{errors.content}</p>
                ) : (
                  <div />
                )}
                <p className="text-gray-400 text-xs">{formData.content.length}/2000</p>
              </div>
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Tipo de Anuncio
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full px-3 py-2 rounded-lg border text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#2D2D2D',
                  borderColor: '#374151'
                }}
              >
                <option value="info">{getTypeIcon('info')} {getTypeLabel('info')}</option>
                <option value="success">{getTypeIcon('success')} {getTypeLabel('success')}</option>
                <option value="warning">{getTypeIcon('warning')} {getTypeLabel('warning')}</option>
                <option value="urgent">{getTypeIcon('urgent')} {getTypeLabel('urgent')}</option>
              </select>
              <p className="text-gray-400 text-xs mt-1">
                Selecciona el tipo que mejor represente tu anuncio
              </p>
            </div>



            {/* Preview */}
            {(formData.title || formData.content) && (
              <div className="border-t border-gray-600 pt-4">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Vista Previa
                </label>
                <div 
                  className="p-4 rounded-lg border-l-4"
                  style={{ 
                    backgroundColor: '#161718',
                    borderLeftColor: formData.type === 'urgent' 
                      ? '#EF4444' 
                      : formData.type === 'warning'
                        ? '#F59E0B'
                        : formData.type === 'success'
                          ? '#10B981'
                          : '#3B82F6'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(formData.type)}</span>
                      <h3 className="font-semibold text-white">
                        {formData.title || 'Título del anuncio'}
                      </h3>
                      <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0" title="No leído" />
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">Ahora</span>
                  </div>
                  <div className="mb-3">
                    <p className="text-gray-100 text-sm whitespace-pre-wrap">
                      {formData.content || 'Contenido del anuncio...'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: '#007AFF30', color: '#007AFF' }}
                        title="Tu nombre"
                      >
                        TU
                      </div>
                      <span className="text-xs text-gray-300 font-medium">
                        Tu nombre
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium">
                        {getTypeLabel(formData.type)}
                      </span>
                      <svg 
                        className="w-4 h-4 text-gray-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3 justify-end flex-shrink-0" style={{ borderColor: '#2D2D2D' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                📢 Publicar Anuncio
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #4A5568;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }
      `}</style>
    </div>
  );
};

export default CreateAnnouncementModal; 