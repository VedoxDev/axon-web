import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import Alert from '../components/Alert';
import type { AlertType } from '../components/Alert';

interface AlertData {
  id: string;
  type: AlertType;
  title?: string;
  message: string;
  duration?: number;
}

interface AlertContextType {
  showAlert: (type: AlertType, message: string, title?: string, duration?: number) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const showAlert = (
    type: AlertType, 
    message: string, 
    title?: string, 
    duration = 5000
  ) => {
    const id = Date.now().toString();
    const newAlert: AlertData = {
      id,
      type,
      title,
      message,
      duration
    };

    setAlerts(prev => [...prev, newAlert]);
  };

  const showSuccess = (message: string, title?: string) => {
    showAlert('success', message, title);
  };

  const showError = (message: string, title?: string) => {
    showAlert('error', message, title);
  };

  const showWarning = (message: string, title?: string) => {
    showAlert('warning', message, title);
  };

  const showInfo = (message: string, title?: string) => {
    showAlert('info', message, title);
  };

  return (
    <AlertContext.Provider value={{
      showAlert,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
      
      {/* Render alerts - Fixed positioning for better mobile experience */}
      <div className="fixed left-0 right-0 pointer-events-none" style={{ 
        top: 'calc(var(--titlebar-height, 64px) + 1rem)', 
        zIndex: 1100 
      }}>
        <div className="flex flex-col items-center md:items-end md:pr-4 space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={alert.id}
              className="pointer-events-auto"
              style={{ 
                zIndex: 1100 + alerts.length - index
              }}
            >
              <Alert
                type={alert.type}
                title={alert.title}
                message={alert.message}
                duration={alert.duration}
                onClose={() => removeAlert(alert.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}; 