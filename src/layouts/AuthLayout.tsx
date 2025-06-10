import React from 'react';
import { generateCSSVariables } from '../styles/design-system';

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

function AuthLayout({ children, className = "" }: AuthLayoutProps) {
  return (
    <>
      <style>{generateCSSVariables()}</style>
      <div className={`min-h-screen text-white flex items-center justify-center p-4 overflow-auto ${className}`} style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        {children}
      </div>
    </>
  );
}

export default AuthLayout; 