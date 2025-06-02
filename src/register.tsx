import React from 'react';
import './index.css'; // Ensure Tailwind is imported
import Logo from './assets/images/Logo_Login.png'; // Assuming the logo is in src/assets/images

function Register() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-md">
        {/* Logo Section (Centered) */}
        <div className="flex justify-center items-center mb-8">
          <img src={Logo} alt="Axon logo" className="h-16 mr-2"/>
          <span className="text-orange-500 text-3xl font-bold">axon</span>
        </div>

        {/* Title and Subtitle Section (Centered) */}
        <div className="mb-8 text-center w-full">
          <h1 className="text-3xl font-bold mb-1">Crear una nueva cuenta</h1>
          <p className="text-gray-400 text-sm">Completa el formulario para registrarte</p>
        </div>

        {/* Registration Form */}
        <form className="bg-gray-800 p-8 rounded-lg shadow-xl w-full">
          {/* Name Field */}
          <p className='mb-2 text-sm text-gray-300'>Nombre completo</p>
          <div className="mb-4">
            <label htmlFor="name" className="sr-only">Nombre completo</label>
            <input
              type="text"
              id="name"
              placeholder="Nombre completo"
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>

          {/* Email Field */}
          <p className='mb-2 text-sm text-gray-300'>Correo electrónico</p>
          <div className="mb-4">
            <label htmlFor="email" className="sr-only">Correo electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="Correo electrónico"
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>

          {/* Password Field */}
          <p className='mb-2 text-sm text-gray-300'>Contraseña</p>
          <div className="mb-4">
            <label htmlFor="password" className="sr-only">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="Contraseña"
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>

          {/* Confirm Password Field */}
          <p className='mb-2 text-sm text-gray-300'>Confirmar contraseña</p>
          <div className="mb-6">
            <label htmlFor="confirm-password" className="sr-only">Confirmar contraseña</label>
            <input
              type="password"
              id="confirm-password"
              placeholder="Confirmar contraseña"
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
          >
            Registrarse
          </button>
        </form>

        {/* Link to Login */}
        <p className='mt-4 text-center text-gray-400 text-sm'>
          ¿Ya tienes una cuenta? <a href="/App" className='text-orange-500 hover:underline'>Iniciar sesión</a>
        </p>
      </div>
    </div>
  );
}

export default Register; 