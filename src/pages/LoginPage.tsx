import { useState } from 'react';
import mockup from '../assets/images/mockup.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import { generateCSSVariables } from '../styles/design-system';
import { useAlert } from '../hooks/useAlert';
import authService from '../services/authService';
import type { LoginData } from '../services/authService';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useAlert();

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = authService.validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await authService.login(formData);
      showSuccess('¡Bienvenido!', 'Inicio de sesión exitoso');
      
      // Redirect to intended destination or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error: any) {
      showError(error.message, 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{generateCSSVariables()}</style>
      <div className="min-h-screen text-white p-4 overflow-auto flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Symmetrical Container */}
      <div className="w-full max-w-screen-lg flex flex-col lg:flex-row items-center justify-center rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm" style={{ backgroundColor: 'var(--color-bg-login)' }}>
        {/* Left Panel (Image) */}
        <div className="lg:w-1/2 w-full flex items-center justify-center p-4">
          <img src={mockup} alt="App mockup" className="w-full h-full object-cover"/> {/* Use object-cover to fill the space */}
        </div>

        {/* Right Panel (Login Form) */}
        <div className="lg:w-1/2 w-full max-w-md lg:max-w-none flex flex-col items-center lg:items-start p-8 lg:p-12 lg:rounded-r-2xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          {/* Added padding and background to the right panel */}
          {/* Logo Section (Centered for mobile, Left-aligned for desktop) */}
          <Logo className="justify-center lg:justify-start mb-4" />

          {/* Title and Subtitle Section (Left-aligned) */}
          <div className="mb-8 text-center lg:text-left w-full">
            <h1 className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Bienvenido</h1>
            <p className="text-gray-300 text-lg font-medium">Inicia sesión para continuar</p>
          </div>

          {/* Login Form */}
          <form className="w-full" onSubmit={handleSubmit}>
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
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.join(', ')}</p>
              )}
            </div>
            {/* Password Field */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-orange-500'
                  }`}
                  style={{ backgroundColor: '#3A3A3A' }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.join(', ')}</p>
              )}
            </div>

            <div className="text-right mb-6">
              <Link to="/forgot-password" className="text-orange-400 hover:text-orange-300 text-sm transition-colors duration-200">¿Has olvidado tu contraseña?</Link>
            </div>

            {/* Login Button - Modern Design */}
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
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar sesión'
              )}
            </button>

            {/* Link to Register */}
            <p className='mt-6 text-center text-gray-400 text-sm'>
              ¿No tienes una cuenta? <Link to='/register' className='text-orange-400 hover:text-orange-300 font-medium transition-colors duration-200'>Regístrate</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
    </>
  );
} 

export default LoginPage; 