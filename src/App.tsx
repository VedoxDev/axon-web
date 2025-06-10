import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { PrivateRoute, PublicRoute } from './components/ProtectedRoute';
import { AlertProvider } from './hooks/useAlert';
import './index.css';

// Component to handle auth events
function AuthHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleTokenExpired = () => {
      // Redirect to login when token expires
      navigate('/', { replace: true });
    };

    // Listen for token expiry events
    window.addEventListener('auth:tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('auth:tokenExpired', handleTokenExpired);
    };
  }, [navigate]);

  return null;
}

function App() {
  return (
    <AlertProvider>
      <Router>
        <AuthHandler />
        <Routes>
          {/* Public routes - redirect to dashboard if authenticated */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
          
          {/* Protected routes - require authentication */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AlertProvider>
  );
}

export default App;
