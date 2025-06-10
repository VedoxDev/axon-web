import React, { useState, useEffect } from 'react';
import { useAlert } from '../hooks/useAlert';
import { projectService } from '../services/projectService';
import type { CreateProjectData, SearchUser, CurrentUser } from '../services/projectService';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: () => void;
}

interface FormData {
  name: string;
  description: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  general?: string;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onProjectCreated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Step 2 - Team invitation state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const { showSuccess, showError } = useAlert();

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await projectService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Search users with debounce
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await projectService.searchUsers(query, 10);
      
      // Filter out already invited users and current user
      const filteredResults = response.users.filter(user => 
        !selectedUsers.some(invited => invited.id === user.id) &&
        user.id !== currentUser?.id
      );
      setSearchResults(filteredResults);
    } catch (error: any) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Simple debounce
    const timeoutId = setTimeout(() => {
      searchUsers(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Add user to selected list (no API call yet)
  const selectUser = (user: SearchUser) => {
    // Add to selected users and remove from search results
    setSelectedUsers(prev => [...prev, user]);
    setSearchResults(prev => prev.filter(u => u.id !== user.id));
    
    // Clear search to hide floating results
    setSearchQuery('');
    setSearchResults([]);
  };

  // Remove user from selected list
  const removeUser = (user: SearchUser) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    
    // If search would include this user, refresh search results
    if (searchQuery && user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) {
      searchUsers(searchQuery);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del proyecto es requerido';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'El nombre no puede tener más de 100 caracteres';
    }

    if (formData.description.trim().length > 255) {
      newErrors.description = 'La descripción no puede tener más de 255 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step 1 - Just validate and move to step 2
  const handleCreateProject = async () => {
    if (!validateForm()) return;
    
    // Just move to step 2 - don't create project yet
    setCurrentStep(2);
  };

  // Handle final submission - Create project and send all invitations
  const handleFinalSubmission = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // Step 1: Create the project
      const createData: CreateProjectData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined
      };

      const response = await projectService.createProject(createData);
      const projectId = response.id;
      
      showSuccess(
        '¡Proyecto creado!', 
        `"${formData.name}" se ha creado exitosamente.`
      );

      // Step 2: Send all invitations
      const invitationPromises = selectedUsers.map(async (user) => {
        try {
          await projectService.inviteUserToProject(projectId, user.id);
          return { user, success: true };
        } catch (error) {
          console.error(`Error inviting ${user.fullName}:`, error);
          return { user, success: false, error };
        }
      });

      if (selectedUsers.length > 0) {
        const invitationResults = await Promise.allSettled(invitationPromises);
        const successful = invitationResults.filter(result => 
          result.status === 'fulfilled' && result.value.success
        ).length;
        
        if (successful === selectedUsers.length) {
          showSuccess(
            '¡Invitaciones enviadas!', 
            `Se enviaron ${successful} invitación${successful !== 1 ? 'es' : ''} exitosamente.`
          );
        } else if (successful > 0) {
          showSuccess(
            'Proyecto creado parcialmente', 
            `Proyecto creado exitosamente. ${successful} de ${selectedUsers.length} invitaciones enviadas.`
          );
        } else {
          showError(
            'Proyecto creado, pero las invitaciones fallaron', 
            'El proyecto se creó correctamente, pero hubo problemas enviando las invitaciones.'
          );
        }
      }

      // Final success message
      const invitationCount = selectedUsers.length;
      if (invitationCount > 0) {
        showSuccess(
          '¡Proyecto completado!', 
          `"${formData.name}" está listo con el equipo configurado.`
        );
      } else {
        showSuccess(
          '¡Proyecto completado!', 
          `"${formData.name}" se ha creado exitosamente. Puedes invitar colaboradores más tarde.`
        );
      }
      
      // Refresh projects list and close modal
      onProjectCreated?.();
      onClose();
      
    } catch (error: any) {
      console.error('Error in final submission:', error);
      setErrors({ general: error.message || 'Error al crear el proyecto' });
      showError(error.message || 'Error al crear el proyecto', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setCurrentStep(1);
    setFormData({ name: '', description: '' });
    setErrors({});
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    setIsUserModalOpen(false);
    onClose();
  };

  // Get user avatar initials
  const getUserInitials = (user: SearchUser) => {
    return `${user.nombre.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
      <div className="rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        
        {currentStep === 1 ? (
          <>
            {/* Step 1: Project Details */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Crear Nuevo Proyecto</h2>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-white transition-colors disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Step 2: Team Invitation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Añade a gente</h2>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-white transition-colors disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Step Indicator - Shared between both steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {/* Step 1 */}
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                currentStep === 1 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : currentStep > 1 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-gray-400'
              }`}>
                {currentStep > 1 ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              <span className={`text-xs font-medium ${
                currentStep === 1 ? 'text-blue-500' : currentStep > 1 ? 'text-green-500' : 'text-gray-500'
              }`}>
                1. Detalles
              </span>
            </div>

            {/* Connector Line */}
            <div className={`w-8 h-0.5 transition-colors duration-200 ${
              currentStep > 1 ? 'bg-green-600' : 'bg-gray-600'
            }`}></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                currentStep === 2 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-600 text-gray-400'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className={`text-xs font-medium ${
                currentStep === 2 ? 'text-blue-500' : 'text-gray-500'
              }`}>
                2. Equipo
              </span>
            </div>
          </div>
        </div>

        {currentStep === 1 ? (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateProject(); }}>
            {/* Project Name */}
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del Proyecto *
              </label>
              <input
                type="text"
                id="projectName"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange(e)}
                className={`w-full px-4 py-3 rounded-xl border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-orange-500'
                }`}
                style={{ backgroundColor: '#3A3A3A' }}
                placeholder="Ej: Aplicación Móvil, Dashboard Web..."
                maxLength={100}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-2">{errors.name}</p>
              )}
            </div>

            {/* Project Description */}
            <div>
              <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-300 mb-2">
                Descripción (Opcional)
              </label>
              <textarea
                id="projectDescription"
                name="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange(e)}
                className={`w-full px-4 py-3 rounded-xl border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm resize-none ${
                  errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-orange-500'
                }`}
                style={{ backgroundColor: '#3A3A3A' }}
                placeholder="Describe brevemente el proyecto..."
                maxLength={255}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-red-400 text-xs mt-2">{errors.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.description?.length || 0}/255 caracteres
              </p>
            </div>

            {/* General Error Display */}
            {errors.general && (
              <div className="p-3 bg-red-600 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.name.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-orange-600 flex items-center justify-center"
              >
                Siguiente
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Description */}
            <p className="text-gray-300 text-sm leading-relaxed">
              Invita a personas a colaborar contigo en <span className="font-semibold text-white">"{formData.name}"</span> para sacar el mayor provecho de la creatividad en equipo y alcanzar objetivos extraordinarios juntos.
            </p>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
                style={{ backgroundColor: '#3A3A3A' }}
                placeholder="Buscar por nombre o email..."
                disabled={isLoading}
              />

              {/* Floating Search Results */}
              {(searchQuery.length >= 2 || isSearching) && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-gray-600 shadow-2xl max-h-80 overflow-y-auto scrollbar-hide" style={{ backgroundColor: '#3A3A3A' }}>
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                      <span className="ml-2 text-gray-400">Buscando...</span>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4">
                      <p className="text-gray-500 text-sm text-center py-4">
                        No se encontraron usuarios con "{searchQuery}"
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Resultados de búsqueda</h4>
                      {searchResults.map((user) => (
                        <div key={user.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 hover:bg-opacity-30 transition-colors">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white"
                            style={{ backgroundColor: '#007AFF' }}
                          >
                            {getUserInitials(user)}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{user.fullName}</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                          <button
                            onClick={() => selectUser(user)}
                            className="p-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Users Summary Card */}
            {selectedUsers.length > 0 && (
              <div 
                onClick={() => setIsUserModalOpen(true)}
                className="p-4 rounded-xl bg-green-600 bg-opacity-20 border border-green-500 border-opacity-50 cursor-pointer hover:bg-opacity-30 transition-all duration-200 mb-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {selectedUsers.length} {selectedUsers.length === 1 ? 'persona será invitada' : 'personas serán invitadas'}
                    </p>
                    <p className="text-sm text-green-400">
                      Click para gestionar el equipo
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {selectedUsers.slice(0, 3).map((user, idx) => (
                      <div
                        key={user.id}
                        className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-xs font-medium text-white border border-green-400"
                        style={{ marginLeft: idx === 0 ? 0 : '-0.5rem' }}
                      >
                        {getUserInitials(user)}
                      </div>
                    ))}
                    {selectedUsers.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-xs font-medium text-white border border-green-400 -ml-2">
                        +{selectedUsers.length - 3}
                      </div>
                    )}
                    <svg className="w-4 h-4 text-green-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalSubmission}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-orange-600 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  'Crear proyecto'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Management Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-60 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
          <div className="rounded-2xl shadow-2xl p-6 w-full max-w-md backdrop-blur-sm" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Equipo del Proyecto
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Users List */}
            <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide">
              {selectedUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: '#3A3A3A' }}>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white"
                    style={{ backgroundColor: '#007AFF' }}
                  >
                    {getUserInitials(user)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{user.fullName}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <button
                    onClick={() => removeUser(user)}
                    className="p-2 rounded-full hover:bg-red-600 hover:bg-opacity-20 text-gray-400 hover:text-red-400 transition-colors"
                    title="Remover del equipo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              
              {selectedUsers.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No hay usuarios seleccionados
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 text-center">
                {selectedUsers.length} {selectedUsers.length === 1 ? 'persona será invitada' : 'personas serán invitadas'} al crear el proyecto
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProjectModal; 