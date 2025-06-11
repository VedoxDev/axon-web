import { API_BASE_URL } from '../config/apiConfig';

// Types based on API documentation
export interface RegisterData {
  email: string;
  nombre: string;
  apellidos: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface RegisterResponse {
  message: string;
  id: string;
}

// Validation rules based on API documentation
export const validationRules = {
  email: (email: string): string[] => {
    const errors: string[] = [];
    if (!email) {
      errors.push('Email es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Formato de email inválido');
    } else if (email.length > 254) {
      errors.push('Email debe tener máximo 254 caracteres');
    }
    return errors;
  },

  nombre: (nombre: string): string[] => {
    const errors: string[] = [];
    if (!nombre) {
      errors.push('Nombre es requerido');
    } else if (nombre.length < 2) {
      errors.push('Nombre debe tener al menos 2 caracteres');
    } else if (nombre.length > 60) {
      errors.push('Nombre debe tener máximo 60 caracteres');
    } else if (!/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/.test(nombre)) {
      errors.push('Nombre solo puede contener letras y espacios');
    }
    return errors;
  },

  apellidos: (apellidos: string): string[] => {
    const errors: string[] = [];
    if (!apellidos) {
      errors.push('Apellidos son requeridos');
    } else if (apellidos.length < 2) {
      errors.push('Apellidos debe tener al menos 2 caracteres');
    } else if (apellidos.length > 80) {
      errors.push('Apellidos debe tener máximo 80 caracteres');
    } else if (!/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/.test(apellidos)) {
      errors.push('Apellidos solo puede contener letras y espacios');
    }
    return errors;
  },

  password: (password: string): string[] => {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Contraseña es requerida');
      return errors;
    }
    
    if (password.length < 8) {
      errors.push('Contraseña debe tener al menos 8 caracteres');
    }
    
    if (password.length > 64) {
      errors.push('Contraseña debe tener máximo 64 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Contraseña debe contener al menos una letra mayúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Contraseña debe contener al menos un número');
    }
    
    if (!/[@$!%*?&.]/.test(password)) {
      errors.push('Contraseña debe contener al menos un símbolo (@$!%*?&.)');
    }
    
    if (!/^[A-Za-zñÑ\d@$!%*?&.]+$/.test(password)) {
      errors.push('Contraseña contiene caracteres inválidos');
    }
    
    return errors;
  },

  passwordMatch: (password: string, confirmPassword: string): string[] => {
    const errors: string[] = [];
    if (!confirmPassword) {
      errors.push('Confirmación de contraseña es requerida');
    } else if (password !== confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }
    return errors;
  }
};

// Token utilities
export const tokenUtils = {
  decodeToken: (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      return null;
    }
  },

  isTokenExpired: (token: string): boolean => {
    const payload = tokenUtils.decodeToken(token);
    if (!payload) return true;
    
    return payload.exp * 1000 < Date.now();
  },

  getTokenExpiry: (token: string): Date | null => {
    const payload = tokenUtils.decodeToken(token);
    if (!payload) return null;
    
    return new Date(payload.exp * 1000);
  },

  getUserFromToken: (token: string) => {
    const payload = tokenUtils.decodeToken(token);
    if (!payload) return null;
    
    return {
      id: payload.id,
      email: payload.email
    };
  }
};

// Error message mapping based on API documentation
const errorMessageMap: { [key: string]: string } = {
  'email-required': 'Email es requerido',
  'nombre-required': 'Nombre es requerido',
  'apellidos-required': 'Apellidos son requeridos',
  'password-required': 'Contraseña es requerida',
  'email-too-long': 'Email debe tener máximo 254 caracteres',
  'nombre-too-short': 'Nombre debe tener al menos 2 caracteres',
  'nombre-too-long': 'Nombre debe tener máximo 60 caracteres',
  'nombre-invalid-characters': 'Nombre solo puede contener letras y espacios',
  'apellidos-too-short': 'Apellidos debe tener al menos 2 caracteres',
  'apellidos-too-long': 'Apellidos debe tener máximo 80 caracteres',
  'apellidos-invalid-characters': 'Apellidos solo puede contener letras y espacios',
  'password-too-short': 'Contraseña debe tener al menos 8 caracteres',
  'password-too-long': 'Contraseña debe tener máximo 64 caracteres',
  'password-too-weak (needs uppercase, number, symbol)': 'Contraseña debe contener mayúscula, número y símbolo',
  'password-invalid-characters': 'Contraseña contiene caracteres inválidos',
  'invalid-credentials': 'Email o contraseña incorrectos',
  'email-already-exists': 'Ya existe una cuenta con este email',
  'current-password-incorrect': 'Contraseña actual incorrecta',
  'passwords-do-not-match': 'Las contraseñas no coinciden',
  'new-password-must-be-different': 'La nueva contraseña debe ser diferente',
  
  // English error messages from server validation
  'email must be an email': 'Formato de email inválido',
  'password must be longer than or equal to 8 characters': 'La contraseña debe tener al menos 8 caracteres',
  'password must be shorter than or equal to 64 characters': 'La contraseña debe tener máximo 64 caracteres',
  'email must be shorter than or equal to 254 characters': 'El email debe tener máximo 254 caracteres',
  'nombre must be longer than or equal to 2 characters': 'El nombre debe tener al menos 2 caracteres',
  'nombre must be shorter than or equal to 60 characters': 'El nombre debe tener máximo 60 caracteres',
  'apellidos must be longer than or equal to 2 characters': 'Los apellidos deben tener al menos 2 caracteres',
  'apellidos must be shorter than or equal to 80 characters': 'Los apellidos deben tener máximo 80 caracteres',
  'email should not be empty': 'El email es requerido',
  'nombre should not be empty': 'El nombre es requerido',
  'apellidos should not be empty': 'Los apellidos son requeridos',
  'password should not be empty': 'La contraseña es requerida',
  'Unauthorized': 'Email o contraseña incorrectos'
};

const formatError = (message: string | string[]): string => {
  if (Array.isArray(message)) {
    return message.map(msg => errorMessageMap[msg] || msg).join(', ');
  }
  return errorMessageMap[message] || message;
};

// API service class
class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('access_token');
    this.setupTokenMonitoring();
  }

  // Validation methods
  validateRegistrationForm(data: RegisterData): { [key: string]: string[] } {
    const errors: { [key: string]: string[] } = {};
    
    const emailErrors = validationRules.email(data.email);
    if (emailErrors.length > 0) errors.email = emailErrors;
    
    const nombreErrors = validationRules.nombre(data.nombre);
    if (nombreErrors.length > 0) errors.nombre = nombreErrors;
    
    const apellidosErrors = validationRules.apellidos(data.apellidos);
    if (apellidosErrors.length > 0) errors.apellidos = apellidosErrors;
    
    const passwordErrors = validationRules.password(data.password);
    if (passwordErrors.length > 0) errors.password = passwordErrors;
    
    return errors;
  }

  validateLoginForm(data: LoginData): { [key: string]: string[] } {
    const errors: { [key: string]: string[] } = {};
    
    const emailErrors = validationRules.email(data.email);
    if (emailErrors.length > 0) errors.email = emailErrors;
    
    if (!data.password) {
      errors.password = ['Contraseña es requerida'];
    }
    
    return errors;
  }

  // API methods
  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...userData,
          email: userData.email.toLowerCase() // Convert to lowercase as per API docs
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al registrar usuario');
    }
  }

  async login(credentials: LoginData): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...credentials,
          email: credentials.email.toLowerCase() // Convert to lowercase
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(formatError(error.message));
      }

      const result = await response.json();
      
      // Store token
      this.token = result.access_token;
      localStorage.setItem('access_token', result.access_token);
      
      // Emit login success event for other services to react
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('auth:loginSuccess'));
      }, 0);
      
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  }

  async getUserProfile(): Promise<User | null> {
    if (!this.token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          return null;
        }
        const error = await response.json();
        throw new Error(formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  }

  async changePassword(passwordData: ChangePasswordData): Promise<{ message: string }> {
    if (!this.token) {
      throw new Error('No autenticado');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(formatError(error.message));
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error al cambiar contraseña');
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  isAuthenticated(): boolean {
    return this.token !== null && !tokenUtils.isTokenExpired(this.token);
  }

  getToken(): string | null {
    return this.token;
  }

  getUserFromToken() {
    if (!this.token) return null;
    return tokenUtils.getUserFromToken(this.token);
  }

  private setupTokenMonitoring(): void {
    setInterval(() => {
      if (this.token && tokenUtils.isTokenExpired(this.token)) {
        this.logout();
        // Dispatch custom event for app to handle
        window.dispatchEvent(new CustomEvent('auth:tokenExpired'));
      }
    }, 60000); // Check every minute
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService; 