import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

function AuthLayout({ children, className = "" }: AuthLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 overflow-auto ${className}`}>
      {children}
    </div>
  );
}

export default AuthLayout; 