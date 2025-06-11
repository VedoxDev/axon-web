import React, { useState, useEffect } from 'react';
import { useAlert } from '../../hooks/useAlert';
import authService from '../../services/authService';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string[];
  confirmPassword?: string;
  general?: string;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const { showSuccess, showError } = useAlert();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      setShowPasswords({
        current: false,
        new: false,
        confirm: false
      });
    }
  }, [isOpen]);

  const validatePassword = (password: string): string[] => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Debe tener al menos 8 caracteres');
    }
    
    if (password.length > 64) {
      errors.push('No debe exceder 64 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    
    if (!/[@$!%*?&.]/.test(password)) {
      errors.push('Debe contener al menos un carácter especial (@$!%*?&.)');
    }
    
    if (!/^[A-Za-zñÑ\d@$!%*?&.]+$/.test(password)) {
      errors.push('Contiene caracteres no válidos');
    }
    
    return errors;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Current password validation
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
      isValid = false;
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = ['La nueva contraseña es requerida'];
      isValid = false;
    } else {
      const passwordErrors = validatePassword(formData.newPassword);
      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors;
        isValid = false;
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmación de contraseña es requerida';
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    // Check if new password is different from current
    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = ['La nueva contraseña debe ser diferente a la actual'];
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear general error
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      showSuccess('Contraseña cambiada exitosamente', 'Tu contraseña ha sido actualizada');
      onClose();
    } catch (error: any) {
      console.error('Password change error:', error);
      
      // Handle specific API errors
      const errorMessage = error.message || 'Error al cambiar contraseña';
      if (errorMessage.includes('current-password-incorrect')) {
        setErrors({ currentPassword: 'La contraseña actual es incorrecta' });
      } else if (errorMessage.includes('passwords-do-not-match')) {
        setErrors({ confirmPassword: 'Las contraseñas no coinciden' });
      } else if (errorMessage.includes('new-password-must-be-different')) {
        setErrors({ newPassword: ['La nueva contraseña debe ser diferente a la actual'] });
      } else if (errorMessage.includes('too-weak')) {
        setErrors({ newPassword: ['La contraseña no cumple con los requisitos de seguridad'] });
      } else {
        setErrors({ general: errorMessage });
      }
      
      showError('Error al cambiar contraseña', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    const errors = validatePassword(password);
    const strength = Math.max(0, 5 - errors.length);
    
    switch (strength) {
      case 5:
        return { strength: 100, label: 'Muy fuerte', color: 'bg-green-500' };
      case 4:
        return { strength: 80, label: 'Fuerte', color: 'bg-blue-500' };
      case 3:
        return { strength: 60, label: 'Moderada', color: 'bg-yellow-500' };
      case 2:
        return { strength: 40, label: 'Débil', color: 'bg-orange-500' };
      default:
        return { strength: 20, label: 'Muy débil', color: 'bg-red-500' };
    }
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
      <div className="rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" style={{ backgroundColor: '#161718' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#2D2D2D' }}>
          <h2 className="text-xl font-bold text-white">Cambiar Contraseña</h2>
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

            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Contraseña Actual
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 pr-10 rounded-lg border text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#2D2D2D',
                    borderColor: errors.currentPassword ? '#EF4444' : '#374151'
                  }}
                  placeholder="Ingresa tu contraseña actual"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPasswords.current ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 pr-10 rounded-lg border text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#2D2D2D',
                    borderColor: errors.newPassword ? '#EF4444' : '#374151'
                  }}
                  placeholder="Ingresa tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPasswords.new ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Fortaleza:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength >= 80 ? 'text-green-400' : 
                      passwordStrength.strength >= 60 ? 'text-blue-400' :
                      passwordStrength.strength >= 40 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
              
              {errors.newPassword && (
                <div className="mt-2">
                  {errors.newPassword.map((error, index) => (
                    <p key={index} className="text-red-400 text-sm">{error}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 pr-10 rounded-lg border text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#2D2D2D',
                    borderColor: errors.confirmPassword ? '#EF4444' : '#374151'
                  }}
                  placeholder="Confirma tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPasswords.confirm ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-200 mb-2">Requisitos de contraseña:</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li className="flex items-center gap-2">
                  <span className={formData.newPassword.length >= 8 ? 'text-green-400' : 'text-gray-400'}>•</span>
                  Mínimo 8 caracteres
                </li>
                <li className="flex items-center gap-2">
                  <span className={/[A-Z]/.test(formData.newPassword) ? 'text-green-400' : 'text-gray-400'}>•</span>
                  Al menos una letra mayúscula
                </li>
                <li className="flex items-center gap-2">
                  <span className={/\d/.test(formData.newPassword) ? 'text-green-400' : 'text-gray-400'}>•</span>
                  Al menos un número
                </li>
                <li className="flex items-center gap-2">
                  <span className={/[@$!%*?&.]/.test(formData.newPassword) ? 'text-green-400' : 'text-gray-400'}>•</span>
                  Al menos un carácter especial (@$!%*?&.)
                </li>
              </ul>
            </div>
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
            disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Cambiando...
              </>
            ) : (
              'Cambiar Contraseña'
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

export default PasswordChangeModal; 