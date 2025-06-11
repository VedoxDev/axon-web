import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { generateCSSVariables } from '../styles/design-system';
import { useAlert } from '../hooks/useAlert';
import authService, { validationRules } from '../services/authService';
import type { RegisterData } from '../services/authService';

// Password strength checker component
interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

const PasswordStrengthIndicator = ({ password, isVisible }: { password: string; isVisible: boolean }) => {
  const requirements: PasswordRequirement[] = [
    {
      label: 'Al menos 8 caracteres',
      test: (pwd) => pwd.length >= 8,
      met: password.length >= 8
    },
    {
      label: 'Máximo 64 caracteres',
      test: (pwd) => pwd.length <= 64,
      met: password.length <= 64
    },
    {
      label: 'Una letra mayúscula (A-Z)',
      test: (pwd) => /[A-Z]/.test(pwd),
      met: /[A-Z]/.test(password)
    },
    {
      label: 'Un número (0-9)',
      test: (pwd) => /\d/.test(pwd),
      met: /\d/.test(password)
    },
    {
      label: 'Un carácter especial (@$!%*?&.)',
      test: (pwd) => /[@$!%*?&.]/.test(pwd),
      met: /[@$!%*?&.]/.test(password)
    },
    {
      label: 'Solo caracteres válidos (sin espacios)',
      test: (pwd) => /^[A-Za-zñÑáéíóúÁÉÍÓÚ\d@$!%*?&.]*$/.test(pwd) && !/\s/.test(pwd),
      met: /^[A-Za-zñÑáéíóúÁÉÍÓÚ\d@$!%*?&.]*$/.test(password) && !/\s/.test(password)
    }
  ];

  const metRequirements = requirements.filter(req => req.met).length;
  const totalRequirements = requirements.length;
  
  const getStrengthColor = () => {
    const percentage = (metRequirements / totalRequirements) * 100;
    if (percentage < 33) return '#ef4444'; // red
    if (percentage < 66) return '#f59e0b'; // amber
    if (percentage < 100) return '#3b82f6'; // blue
    return '#10b981'; // green
  };

  const getStrengthText = () => {
    const percentage = (metRequirements / totalRequirements) * 100;
    if (percentage < 33) return 'Débil';
    if (percentage < 66) return 'Regular';
    if (percentage < 100) return 'Buena';
    return 'Excelente';
  };

  if (!password || !isVisible) return null;

  return (
    <div className="absolute left-0 right-0 top-full mt-2 p-4 rounded-xl border border-gray-600 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200" 
         style={{ backgroundColor: '#2A2A2A' }}>
      {/* Strength indicator */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-300">Seguridad de la contraseña:</span>
        <span 
          className="text-sm font-semibold"
          style={{ color: getStrengthColor() }}
        >
          {getStrengthText()} ({metRequirements}/{totalRequirements})
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${(metRequirements / totalRequirements) * 100}%`,
            backgroundColor: getStrengthColor()
          }}
        />
      </div>

      {/* Requirements list */}
      <div className="space-y-2">
        {requirements.map((requirement, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
              requirement.met 
                ? 'bg-green-500' 
                : 'bg-gray-600 border border-gray-500'
            }`}>
              {requirement.met && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={`text-xs transition-colors duration-200 ${
              requirement.met ? 'text-green-400' : 'text-gray-400'
            }`}>
              {requirement.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [formData, setFormData] = useState<RegisterData & { confirmPassword: string }>({
    email: '',
    nombre: '',
    apellidos: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();

  const handleInputChange = (field: keyof (RegisterData & { confirmPassword: string }), value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = authService.validateRegistrationForm(formData);
    
    // Check password confirmation
    const passwordMatchErrors = validationRules.passwordMatch(formData.password, formData.confirmPassword);
    if (passwordMatchErrors.length > 0) {
      validationErrors.confirmPassword = passwordMatchErrors;
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Register the user
      await authService.register({
        email: formData.email,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        password: formData.password
      });
      
      // Automatically log in the user after successful registration
      await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      showSuccess(
        '¡Cuenta creada exitosamente! Bienvenido al dashboard.',
        '¡Registro completado!'
      );
      
      // Redirect to dashboard instead of login
      navigate('/dashboard');
    } catch (error: any) {
      // If registration fails, show registration error
      // If registration succeeds but login fails, show login error
      showError(error.message, 'Error de registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{generateCSSVariables()}</style>
      <div className="min-h-screen text-white p-4 overflow-auto flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        {/* Centered Container */}
        <div className="w-full max-w-md flex flex-col items-center justify-center rounded-2xl shadow-2xl p-8 backdrop-blur-sm" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          {/* Logo Section (Centered) */}
          <Logo className="justify-center mb-4" />

          {/* Title and Subtitle Section (Centered) */}
          <div className="mb-8 text-center w-full">
            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Crear cuenta</h1>
            <p className="text-gray-300 text-base font-medium">Completa el formulario para registrarte</p>
          </div>

          {/* Registration Form */}
          <form className="w-full" onSubmit={handleSubmit}>
            {/* Name Fields Row */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  placeholder="Tu nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm ${
                    errors.nombre ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-orange-500'
                  }`}
                  style={{ backgroundColor: '#3A3A3A' }}
                  disabled={isLoading}
                  required
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-400">{errors.nombre.join(', ')}</p>
                )}
              </div>
              <div className="flex-1">
                <label htmlFor="apellidos" className="block text-sm font-medium text-gray-300 mb-2">Apellidos</label>
                <input
                  type="text"
                  id="apellidos"
                  placeholder="Tus apellidos"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm ${
                    errors.apellidos ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-orange-500'
                  }`}
                  style={{ backgroundColor: '#3A3A3A' }}
                  disabled={isLoading}
                  required
                />
                {errors.apellidos && (
                  <p className="mt-1 text-sm text-red-400">{errors.apellidos.join(', ')}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Correo electrónico</label>
              <input
                type="email"
                id="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-orange-500'
                }`}
                style={{ backgroundColor: '#3A3A3A' }}
                disabled={isLoading}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.join(', ')}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-4 relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-orange-500'
                  }`}
                  style={{ backgroundColor: '#3A3A3A' }}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.952-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.join(', ')}</p>
              )}
              
              {/* Password Strength Indicator - Floating */}
              <PasswordStrengthIndicator password={formData.password} isVisible={isPasswordFocused} />
            </div>

            {/* Confirm Password Field */}
            <div className="mb-6">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm-password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-orange-500'
                  }`}
                  style={{ backgroundColor: '#3A3A3A' }}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none transition-colors duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.join(', ')}</p>
              )}
            </div>

            {/* Register Button - Modern Design */}
            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-lg hover:shadow-xl mb-6 ${
                isLoading ? 'opacity-50 cursor-not-allowed transform-none' : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </div>
              ) : (
                'Crear cuenta'
              )}
            </button>

            {/* Link to Login */}
            <p className='mt-6 text-center text-gray-400 text-sm'>
              ¿Ya tienes una cuenta? <Link to='/' className='text-orange-400 hover:text-orange-300 font-medium transition-colors duration-200'>Iniciar sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default RegisterPage; 