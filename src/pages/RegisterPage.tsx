import React from 'react';
import { Link } from 'react-router-dom';
import { Logo, FormInput, Button } from '../components';
import AuthLayout from '../layouts/AuthLayout';

function RegisterPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        {/* Logo Section (Centered) */}
        <Logo className="justify-center mb-8" />

        {/* Title and Subtitle Section (Centered) */}
        <div className="mb-8 text-center w-full">
          <h1 className="text-3xl font-bold mb-1">Crear una nueva cuenta</h1>
          <p className="text-gray-400 text-sm">Completa el formulario para registrarte</p>
        </div>

        {/* Registration Form */}
        <form className="bg-gray-800 p-8 rounded-lg shadow-xl w-full">
          <FormInput
            id="name"
            type="text"
            placeholder="Nombre completo"
            label="Nombre completo"
            required
          />

          <FormInput
            id="email"
            type="email"
            placeholder="Correo electrónico"
            label="Correo electrónico"
            required
          />

          <FormInput
            id="password"
            type="password"
            placeholder="Contraseña"
            label="Contraseña"
            required
          />

          <FormInput
            id="confirm-password"
            type="password"
            placeholder="Confirmar contraseña"
            label="Confirmar contraseña"
            className="mb-6"
            required
          />

          <Button type="submit" variant="primary">
            Registrarse
          </Button>
        </form>

        {/* Link to Login */}
        <p className='mt-4 text-center text-gray-400 text-sm'>
          ¿Ya tienes una cuenta? <Link to="/" className='text-orange-500 hover:underline'>Iniciar sesión</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default RegisterPage; 