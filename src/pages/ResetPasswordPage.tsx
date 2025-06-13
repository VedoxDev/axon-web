import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { generateCSSVariables } from '../styles/design-system';
import { useAlert } from '../hooks/useAlert';
import { API_BASE_URL } from '../config/apiConfig';
import { validationRules } from '../services/authService';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

  const resetToken = searchParams.get('token');
  const { showSuccess, showError } = useAlert();

  // Verify token on component mount
  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      if (!resetToken) {
        setIsValidating(false);
        setIsValidToken(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token/${resetToken}`);
        const data = await response.json();

        if (!isMounted) return;

        if (response.ok) {
          setIsValidToken(true);
          setUserEmail(data.email);
        } else {
          setIsValidToken(false);
          showError('El enlace de recuperación es inválido o ha expirado.', 'Enlace inválido');
        }
      } catch (error) {
        if (!isMounted) return;
        setIsValidToken(false);
        showError('Error al verificar el enlace de recuperación.', 'Error');
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    };

    verifyToken();
    return () => { isMounted = false; };
  }, [resetToken]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    const passwordErrors = validationRules.password(formData.newPassword);
    const confirmPasswordErrors = validationRules.passwordMatch(
      formData.newPassword, 
      formData.confirmPassword
    );

    const validationErrors: { [key: string]: string[] } = {};
    if (passwordErrors.length > 0) {
      validationErrors.newPassword = passwordErrors;
    }
    if (confirmPasswordErrors.length > 0) {
      validationErrors.confirmPassword = confirmPasswordErrors;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess(
          'Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio de sesión.',
          '¡Contraseña restablecida!'
        );
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } else {
        throw new Error(data.message || 'Error al restablecer la contraseña');
      }
    } catch (error: any) {
      showError(
        error.message || 'Error al restablecer la contraseña',
        'Error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while validating token
  if (isValidating) {
    return (
      <>
        <style>{generateCSSVariables()}</style>
        <div className="min-h-screen text-white p-4 overflow-auto flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <div className="w-full max-w-md flex flex-col items-center justify-center rounded-2xl shadow-2xl p-8 backdrop-blur-sm" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-3 text-white">Verificando enlace...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show error state for invalid token
  if (!isValidToken) {
    return (
      <>
        <style>{generateCSSVariables()}</style>
        <div className="min-h-screen text-white p-4 overflow-auto flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <div className="w-full max-w-md flex flex-col items-center justify-center rounded-2xl shadow-2xl p-8 backdrop-blur-sm" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <Logo className="justify-center mb-4" />
            
            <div className="text-center w-full">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold mb-3 text-white">
                Enlace inválido
              </h1>
              <p className="text-gray-300 text-base mb-6">
                El enlace de recuperación es inválido o ha expirado. Los enlaces de recuperación son válidos por 30 minutos.
              </p>
              
              <div className="space-y-3">
                <Link 
                  to="/forgot-password"
                  className="inline-block w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-lg hover:shadow-xl"
                >
                  Solicitar nuevo enlace
                </Link>
                
                <Link 
                  to="/"
                  className="block text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors duration-200"
                >
                  ← Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{generateCSSVariables()}</style>
      <div className="min-h-screen text-white p-4 overflow-auto flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="w-full max-w-md flex flex-col items-center justify-center rounded-2xl shadow-2xl p-8 backdrop-blur-sm" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <Logo className="justify-center mb-4" />

          <div className="mb-8 text-center w-full">
            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Restablecer contraseña
            </h1>
            <p className="text-gray-300 text-base font-medium">
              {userEmail && `Para la cuenta: ${userEmail}`}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Ingresa tu nueva contraseña a continuación.
            </p>
          </div>

          <form className="w-full" onSubmit={handleSubmit}>
            {/* New Password Field */}
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm ${
                    errors.newPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-orange-500'
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
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.newPassword.join(', ')}</p>
              )}
            </div>

            {/* Confirm New Password Field */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
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

            {/* Submit Button */}
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
                  Restableciendo contraseña...
                </div>
              ) : (
                'Restablecer contraseña'
              )}
            </button>

            {/* Back to Login */}
            <p className='mt-6 text-center text-gray-400 text-sm'>
              <Link to='/' className='text-orange-400 hover:text-orange-300 font-medium transition-colors duration-200'>
                ← Volver al inicio de sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default ResetPasswordPage; 