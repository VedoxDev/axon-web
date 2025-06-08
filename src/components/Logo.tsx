import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoImage from '../assets/images/Logo_Login.png';

interface LogoProps {
  className?: string;
}

function Logo({ className = "" }: LogoProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/dashboard');
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center hover:opacity-80 transition-opacity ${className}`}
      title="Ir al inicio"
    >
      <img src={LogoImage} alt="Axon logo" className="h-16"/>
    </button>
  );
}

export default Logo; 