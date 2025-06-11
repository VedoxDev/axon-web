import React, { useState, useEffect } from 'react';
import { format, addDays, addMinutes } from 'date-fns';
import callsService, { type CreateProjectMeetingRequest, type CreatePersonalMeetingRequest } from '../../services/callsService';
import projectService from '../../services/projectService';
import { useAlert } from '../../hooks/useAlert';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetingCreated: () => void;
  projectId?: string; // If provided, creates project meeting
}

interface ProjectOption {
  id: string;
  name: string;
}

const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  onMeetingCreated,
  projectId
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  
  // Form state
  const [meetingType, setMeetingType] = useState<'project' | 'personal'>(projectId ? 'project' : 'personal');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [audioOnly, setAudioOnly] = useState(false);
  const [participantEmails, setParticipantEmails] = useState('');
  
  // Form validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { showSuccess, showError } = useAlert();

  // Load user's projects when modal opens
  useEffect(() => {
    if (isOpen && !projectId) {
      loadProjects();
    }
  }, [isOpen, projectId]);

  // Set default date and time when modal opens
  useEffect(() => {
    if (isOpen) {
      const tomorrow = addDays(new Date(), 1);
      const defaultTime = addMinutes(tomorrow, 60); // 1 hour from now tomorrow
      
      setScheduledDate(format(tomorrow, 'yyyy-MM-dd'));
      setScheduledTime(format(defaultTime, 'HH:mm'));
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const projectsData = await projectService.getUserProjects();
      setProjects(projectsData.map(p => ({ id: p.id, name: p.name })));
    } catch (error: any) {
      console.error('Failed to load projects:', error);
      showError('Error al cargar proyectos', 'Error');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Common validations
    if (!title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!scheduledDate) {
      newErrors.scheduledDate = 'La fecha es requerida';
    }

    if (!scheduledTime) {
      newErrors.scheduledTime = 'La hora es requerida';
    }

    // Check if scheduled time is in the future
    if (scheduledDate && scheduledTime) {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const now = new Date();
      
      if (scheduledDateTime <= now) {
        newErrors.scheduledTime = 'La fecha y hora deben ser futuras';
      }
    }

    if (duration < 15 || duration > 480) {
      newErrors.duration = 'La duración debe estar entre 15 y 480 minutos';
    }

    // Type-specific validations
    if (meetingType === 'project') {
      if (!selectedProjectId) {
        newErrors.selectedProjectId = 'Selecciona un proyecto';
      }
    } else {
      if (!participantEmails.trim()) {
        newErrors.participantEmails = 'Agrega al menos un email de participante';
      } else {
        // Validate email format
        const emails = participantEmails.split(',').map(email => email.trim()).filter(email => email);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        for (const email of emails) {
          if (!emailRegex.test(email)) {
            newErrors.participantEmails = `Email inválido: ${email}`;
            break;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare scheduled date time in ISO format
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      
      if (meetingType === 'project') {
        const request: CreateProjectMeetingRequest = {
          title: title.trim(),
          scheduledAt,
          projectId: selectedProjectId,
          description: description.trim() || undefined,
          duration,
          audioOnly
        };
        
        await callsService.createProjectMeeting(request);
        showSuccess('Reunión de proyecto creada exitosamente', 'Éxito');
      } else {
        const emails = participantEmails.split(',').map(email => email.trim()).filter(email => email);
        
        const request: CreatePersonalMeetingRequest = {
          title: title.trim(),
          scheduledAt,
          participantEmails: emails,
          description: description.trim() || undefined,
          duration,
          audioOnly
        };
        
        await callsService.createPersonalMeeting(request);
        showSuccess('Reunión personal creada exitosamente', 'Éxito');
      }
      
      // Reset form and close modal
      resetForm();
      onMeetingCreated();
      
    } catch (error: any) {
      console.error('Failed to create meeting:', error);
      showError(error.message || 'Error al crear la reunión', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDuration(60);
    setAudioOnly(false);
    setParticipantEmails('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#2D2D2D] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h2 className="text-xl font-semibold text-white">
            {projectId ? 'Nueva Reunión del Proyecto' : 'Nueva Reunión'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Meeting Type Selection */}
          {!projectId && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Reunión
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="project"
                    checked={meetingType === 'project'}
                    onChange={(e) => setMeetingType(e.target.value as 'project' | 'personal')}
                    className="mr-2"
                  />
                  <span className="text-white">Reunión de Proyecto</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="personal"
                    checked={meetingType === 'personal'}
                    onChange={(e) => setMeetingType(e.target.value as 'project' | 'personal')}
                    className="mr-2"
                  />
                  <span className="text-white">Reunión Personal</span>
                </label>
              </div>
            </div>
          )}

          {/* Project Selection */}
          {meetingType === 'project' && !projectId && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Proyecto <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className={`w-full bg-[#1A1A1A] text-white border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.selectedProjectId ? 'border-red-500' : 'border-gray-600'
                }`}
                disabled={isLoadingProjects}
              >
                <option value="">Seleccionar proyecto...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.selectedProjectId && (
                <p className="mt-1 text-sm text-red-400">{errors.selectedProjectId}</p>
              )}
              {isLoadingProjects && (
                <p className="mt-1 text-sm text-gray-400">Cargando proyectos...</p>
              )}
            </div>
          )}

          {/* Participant Emails (Personal meetings only) */}
          {meetingType === 'personal' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Emails de Participantes <span className="text-red-400">*</span>
              </label>
              <textarea
                value={participantEmails}
                onChange={(e) => setParticipantEmails(e.target.value)}
                placeholder="Ingresa emails separados por comas: user1@email.com, user2@email.com"
                rows={3}
                className={`w-full bg-[#1A1A1A] text-white border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${
                  errors.participantEmails ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.participantEmails && (
                <p className="mt-1 text-sm text-red-400">{errors.participantEmails}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Solo usuarios registrados en el sistema pueden unirse a reuniones
              </p>
            </div>
          )}

          {/* Meeting Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Reunión de Sprint Planning"
              className={`w-full bg-[#1A1A1A] text-white border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Meeting Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agenda de la reunión, temas a tratar..."
              rows={3}
              className="w-full bg-[#1A1A1A] text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className={`w-full bg-[#1A1A1A] text-white border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.scheduledDate ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.scheduledDate && (
                <p className="mt-1 text-sm text-red-400">{errors.scheduledDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hora <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className={`w-full bg-[#1A1A1A] text-white border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.scheduledTime ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.scheduledTime && (
                <p className="mt-1 text-sm text-red-400">{errors.scheduledTime}</p>
              )}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duración (minutos) <span className="text-red-400">*</span>
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className={`w-full bg-[#1A1A1A] text-white border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.duration ? 'border-red-500' : 'border-gray-600'
              }`}
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1.5 horas</option>
              <option value={120}>2 horas</option>
              <option value={180}>3 horas</option>
              <option value={240}>4 horas</option>
              <option value={480}>8 horas</option>
            </select>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-400">{errors.duration}</p>
            )}
          </div>

          {/* Meeting Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={audioOnly}
                onChange={(e) => setAudioOnly(e.target.checked)}
                className="mr-3"
              />
              <span className="text-white">Solo audio (sin video)</span>
            </label>
          </div>

          {/* Info Note */}
          <div className="bg-[#1A1A1A] border border-gray-600 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-gray-300">
                {meetingType === 'project' 
                  ? 'Todos los miembros del proyecto podrán unirse a esta reunión.'
                  : 'Solo las personas invitadas podrán unirse a esta reunión.'
                }
                <br />
                Los participantes podrán unirse 5 minutos antes de la hora programada.
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-600">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Creando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Crear Reunión
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetingModal; 