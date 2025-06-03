import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'orange' | 'gray';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

function Button({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  className = "", 
  onClick,
  disabled = false 
}: ButtonProps) {
  const baseClasses = "w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm transition-colors";
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white",
    orange: "bg-orange-500 hover:bg-orange-600 text-white",
    gray: "bg-gray-700 hover:bg-gray-600 text-white"
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button; 