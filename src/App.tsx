import React from 'react';
import './index.css'; 
import Logo from './assets/images/Logo_Login.png'; 
import Ejemplo from './assets/images/Ejemplo.jpeg';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 overflow-auto flex items-center justify-center">
      {/* Symmetrical Container */}
      <div className="w-full max-w-screen-lg flex flex-col lg:flex-row items-center justify-center bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        {/* Left Panel (Image) */}
        <div className="lg:w-1/2 w-full flex items-center justify-center p-4">
          <img src={Ejemplo} alt="Example image" className="w-full h-full object-cover"/> {/* Use object-cover to fill the space */}
        </div>

        {/* Right Panel (Login Form) */}
        <div className="lg:w-1/2 w-full max-w-md lg:max-w-none flex flex-col items-center lg:items-start p-8 lg:p-12 bg-gray-900 rounded-r-lg">
          {/* Added padding and background to the right panel */}
          {/* Logo Section (Centered for mobile, Left-aligned for desktop) */}
          <div className="flex justify-center lg:justify-start items-center mb-4">
            <img src={Logo} alt="Axon logo" className="h-16 mr-2"/> {/* Adjusted height */}
            <span className="text-orange-500 text-3xl font-bold">axon</span> {/* Adjusted text size */}
          </div>

          {/* Title and Subtitle Section (Left-aligned) */}
          <div className="mb-6 text-center lg:text-left w-full">
            <h1 className="text-3xl font-bold mb-1">Bienvenido</h1> {/* Adjusted text size and margin */}
            <p className="text-gray-400 text-sm">Inicia sesión para continuar</p> {/* Adjusted text size */}
          </div>

          {/* Login Form */}
          <form className="w-full">
            {/* Removed background and shadow from the form itself */}
            <p className='mb-2 text-sm text-gray-300'>Ingrese su correo electrónico</p> {/* Adjusted text size */}
            <div className="mb-3">
              {/* Reduced margin */}
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Email"
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm"
              /> {/* Reduced padding and text size */}
            </div>
            <p className='mb-2 text-sm text-gray-300'>Ingrese su contraseña</p> {/* Adjusted text size */}
            <div className="mb-4">
              {/* Reduced margin */}
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                type="password"
                id="password"
                placeholder="Contraseña"
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm"
              /> {/* Reduced padding and text size */}
            </div>

            <div className="text-right mb-4">
              {/* Reduced margin */}
              <a href="#" className="text-orange-500 hover:underline text-xs">¿Has olvidado tu contraseña?</a> {/* Adjusted text size */}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
            >
              {/* Reduced padding and text size */}
              Iniciar sesión
            </button>

            {/* Separator */}
            <div className="flex items-center my-4">
              {/* Reduced margin */}
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="flex-shrink mx-3 text-gray-500 text-sm">O</span> {/* Adjusted margin and text size */}
              <div className="flex-grow border-t border-gray-600"></div>
            </div>

            {/* Social Login Buttons */}
            <button
              type="button"
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-3 flex items-center justify-center text-sm"
            >
              {/* Reduced padding, margin, and text size */}
              {/* Placeholder for Google Logo */}
              <span className="mr-2 text-base">G</span> {/* Adjusted text size */}
              Login with Google Account
            </button>

            {/* Enter with ID Button */}
            <button
              type="button"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
            >
              {/* Reduced padding and text size */}
              Entrar a la sala con un ID
            </button>

            {/* Link to Register */}
            <p className='mt-5 text-center text-gray-400 text-sm'>
            No tienes una cuenta? <a href='./register' className='text-orange-500 hover:underline'>Registrate</a>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
} 


export default App;
