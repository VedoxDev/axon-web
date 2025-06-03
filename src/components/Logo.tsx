import React from 'react';
import LogoImage from '../assets/images/Logo_Login.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textSize?: string;
}

function Logo({ className = "", showText = true, textSize = "text-3xl" }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <img src={LogoImage} alt="Axon logo" className="h-16 mr-2"/>
      {showText && (
        <span className={`text-orange-500 ${textSize} font-bold`}>axon</span>
      )}
    </div>
  );
}

export default Logo; 