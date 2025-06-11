import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { generateCSSVariables } from '../styles/design-system';
import { useAlert } from '../hooks/useAlert';
import { API_BASE_URL } from '../config/apiConfig';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

  const { showSuccess, showError } = useAlert();

  const validateEmail = (email: string): string[] => {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('El correo electrónico es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Formato de correo electrónico inválido');
    }
    
    return errors;
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    
    // Clear field error when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const emailErrors = validateEmail(email);
    if (emailErrors.length > 0) {
      setErrors({ email: emailErrors });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        showSuccess(
          'Si existe una cuenta con este correo, recibirás un enlace de recuperación.',
          'Enlace enviado'
        );
        setEmail('');
      } else {
        throw new Error(data.message || 'Error al enviar el enlace');
      }
    } catch (error: any) {
      showError(
        error.message || 'Error al procesar la solicitud',
        'Error'
      );
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
            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-gray-300 text-base font-medium">
              Ingresa tu correo electrónico y te enviaremos un enlace para recuperar tu contraseña.
            </p>
          </div>

          {!emailSent ? (
            <form className="w-full" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => handleInputChange(e.target.value)}
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
                    Enviando enlace...
                  </div>
                ) : (
                  'Enviar enlace de recuperación'
                )}
              </button>

              {/* Back to Login */}
              <p className='mt-6 text-center text-gray-400 text-sm'>
                <Link to='/' className='text-orange-400 hover:text-orange-300 font-medium transition-colors duration-200'>
                  ← Volver al inicio de sesión
                </Link>
              </p>
            </form>
          ) : (
            /* Success State */
            <div className="w-full text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  ¡Enlace enviado!
                </h2>
                <p className="text-gray-300 text-sm">
                  Si existe una cuenta con este correo electrónico, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-gray-400 text-xs">
                  ¿No recibiste el correo? Revisa tu carpeta de spam o 
                </p>
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors duration-200"
                >
                  Intentar con otro correo
                </button>
              </div>

              <p className='mt-6 text-center text-gray-400 text-sm'>
                <Link to='/' className='text-orange-400 hover:text-orange-300 font-medium transition-colors duration-200'>
                  ← Volver al inicio de sesión
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ForgotPasswordPage; 