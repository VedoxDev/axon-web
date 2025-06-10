import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

interface ProtectedRouteProps {
  children: ReactNode;
}

interface PublicRouteProps {
  children: ReactNode;
}

// PrivateRoute: Protects routes that require authentication
export const PrivateRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  
  if (!authService.isAuthenticated()) {
    // Redirect to login with return path
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// PublicRoute: For login/register pages - redirects to dashboard if already authenticated
export const PublicRoute = ({ children }: PublicRouteProps) => {
  const location = useLocation();
  
  if (authService.isAuthenticated()) {
    // Get the intended destination from state, or default to dashboard
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }
  
  return <>{children}</>;
}; 