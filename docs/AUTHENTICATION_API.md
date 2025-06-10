# Authentication API Documentation 🔐

## Overview
Complete authentication system for user registration, login, profile management, and JWT token handling. Secure and production-ready with comprehensive validation and error handling.

## Features ✨
- **User Registration** - Create new accounts with validation
- **User Login** - Secure authentication with JWT tokens
- **Password Security** - Enforced complexity requirements
- **Profile Management** - Get user profile and comprehensive statistics
- **Password Changes** - Secure password updates
- **JWT Token System** - Stateless authentication with 24-hour expiry
- **Input Validation** - Comprehensive client and server-side validation
- **Spanish Name Support** - Full Unicode support for Spanish characters

---

## 🎯 Quick Start

### 1. Register New User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "john.doe@company.com",
  "nombre": "John",
  "apellidos": "Doe",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "User registered",
  "id": "357b292d-ddbf-4061-89ce-2243f6d9db57"
}
```

### 2. Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@company.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM1N2IyOTJkLWRkYmYtNDA2MS04OWNlLTIyNDNmNmQ5ZGI1NyIsImVtYWlsIjoiam9obi5kb2VAY29tcGFueS5jb20iLCJpYXQiOjE2NDI2ODAwMDAsImV4cCI6MTY0Mjc2NjQwMH0.signature"
}
```

### 3. Access Protected Routes
```http
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚀 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "string",
  "nombre": "string", 
  "apellidos": "string",
  "password": "string"
}
```

**Field Requirements:**
| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `email` | string | ✅ Yes | Valid email format, max 254 chars, converted to lowercase |
| `nombre` | string | ✅ Yes | 2-60 chars, only letters, spaces, Spanish accents (áéíóúñÑ) |
| `apellidos` | string | ✅ Yes | 2-80 chars, only letters, spaces, Spanish accents (áéíóúñÑ) |
| `password` | string | ✅ Yes | 8-64 chars, see password requirements below |

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

### Get Current User Profile
```http
GET /auth/me
Authorization: Bearer <jwt-token>
```

### Get Comprehensive User Profile
```http
GET /auth/me/profile
Authorization: Bearer <jwt-token>
```

### Change Password
```http
PUT /auth/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

---

## 🔒 Password Requirements

All passwords must meet these security criteria:

### ✅ **Required Rules:**
- **Minimum Length:** 8 characters
- **Maximum Length:** 64 characters  
- **Uppercase Letter:** At least one (A-Z)
- **Number:** At least one digit (0-9)
- **Special Character:** At least one (@$!%*?&.)
- **Allowed Characters:** Letters (A-Z, a-z, ñ, Ñ, á, é, í, ó, ú), numbers, symbols (@$!%*?&.)

### ❌ **Invalid Characters:**
- No spaces
- No other special characters beyond (@$!%*?&.)
- No emoji or Unicode symbols

### ✅ **Valid Password Examples:**
- `MyPass123!`
- `SecurePassword1@` 
- `España2024$`
- `MyCompany456&`

### ❌ **Invalid Password Examples:**
- `password` (no uppercase, no number, no symbol)
- `PASSWORD123` (no symbol)
- `MyPass 123!` (contains space)
- `Short1!` (too short)
- `MyPass123#` (invalid symbol #)

---

## 📊 Response Formats

### Register - Success Response
**Status Code:** `201 Created`
```json
{
  "message": "User registered",
  "id": "357b292d-ddbf-4061-89ce-2243f6d9db57"
}
```

### Login - Success Response  
**Status Code:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM1N2IyOTJkLWRkYmYtNDA2MS04OWNlLTIyNDNmNmQ5ZGI1NyIsImVtYWlsIjoiam9obi5kb2VAY29tcGFueS5jb20iLCJpYXQiOjE2NDI2ODAwMDAsImV4cCI6MTY0Mjc2NjQwMH0.K7i_5VHm9fX3pKlMnOpQs7uFy2gEzFn4vP8kYz2XjQE"
}
```

**JWT Token Payload:**
```json
{
  "id": "357b292d-ddbf-4061-89ce-2243f6d9db57",
  "email": "john.doe@company.com",
  "iat": 1642680000,
  "exp": 1642766400
}
```

### Get Profile - Success Response
**Status Code:** `200 OK`
```json
{
  "id": "357b292d-ddbf-4061-89ce-2243f6d9db57",
  "email": "john.doe@company.com",
  "nombre": "John",
  "apellidos": "Doe",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Get Comprehensive Profile - Success Response
**Status Code:** `200 OK`
```json
{
  "id": "357b292d-ddbf-4061-89ce-2243f6d9db57",
  "email": "john.doe@company.com",
  "nombre": "John",
  "apellidos": "Doe",
  "fullName": "John Doe",
  "status": "active",
  "memberSince": "2024-01-15T10:30:00.000Z",
  "lastActive": "2024-01-15T10:30:00.000Z",
  "stats": {
    "totalProjects": 3,
    "ownerProjects": 1,
    "adminProjects": 1,
    "memberProjects": 1,
    "tasksCreated": 25,
    "tasksAssigned": 18,
    "tasksCompleted": 15,
    "tasksPending": 2,
    "tasksInProgress": 1,
    "completionRate": 83,
    "messagesSent": 156,
    "directConversations": 8,
    "callsParticipated": 12,
    "callsInitiated": 5,
    "invitationsSent": 3,
    "invitationsReceived": 2,
    "invitationsAccepted": 2,
    "invitationsPending": 0,
    "invitationAcceptanceRate": 100
  },
  "recentActivity": [
    {
      "type": "task",
      "action": "created",
      "title": "Fix user authentication bug",
      "project": "My Project",
      "timestamp": "2024-01-15T09:30:00.000Z",
      "status": "in_progress"
    }
  ],
  "projects": [
    {
      "id": "project-123",
      "name": "My Project",
      "role": "owner",
      "taskCount": 12,
      "messageCount": 45
    }
  ],
  "insights": {
    "mostActiveProject": "My Project",
    "averageTasksPerProject": 8,
    "peakActivityType": "task_management",
    "collaborationScore": 85,
    "leadershipScore": 76
  }
}
```

### Change Password - Success Response
**Status Code:** `200 OK`
```json
{
  "message": "password-changed-successfully"
}
```

---

## 🚨 Error Responses

### Validation Errors
**Status Code:** `400 Bad Request`

#### Missing Required Fields
```json
{
  "statusCode": 400,
  "message": [
    "email-required",
    "nombre-required",
    "apellidos-required", 
    "password-required"
  ],
  "error": "Bad Request"
}
```

#### Email Validation Errors
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "email-too-long"
  ],
  "error": "Bad Request"
}
```

#### Name Validation Errors
```json
{
  "statusCode": 400,
  "message": [
    "nombre-too-short",
    "nombre-too-long",
    "nombre-invalid-characters",
    "apellidos-too-short",
    "apellidos-too-long", 
    "apellidos-invalid-characters"
  ],
  "error": "Bad Request"
}
```

#### Password Validation Errors
```json
{
  "statusCode": 400,
  "message": [
    "password-too-short",
    "password-too-long",
    "password-too-weak (needs uppercase, number, symbol)",
    "password-invalid-characters"
  ],
  "error": "Bad Request"
}
```

### Authentication Errors
**Status Code:** `401 Unauthorized`

#### Invalid Login Credentials
```json
{
  "statusCode": 401,
  "message": "invalid-credentials",
  "error": "Unauthorized"
}
```

#### Missing or Invalid JWT Token
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Expired JWT Token
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Password Change Errors
```json
{
  "statusCode": 401,
  "message": "current-password-incorrect",
  "error": "Unauthorized"
}
```

```json
{
  "statusCode": 400,
  "message": "passwords-do-not-match",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 400,
  "message": "new-password-must-be-different",
  "error": "Bad Request"
}
```

### Registration Errors
**Status Code:** `400 Bad Request`

#### Email Already Exists
```json
{
  "statusCode": 400,
  "message": "email-already-exists",
  "error": "Bad Request"
}
```

---

## 📱 Frontend Integration Examples

### Using JavaScript (fetch)

#### Registration
```javascript
const registerUser = async (userData) => {
  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(Array.isArray(error.message) ? error.message.join(', ') : error.message);
    }

    const result = await response.json();
    console.log('Registration successful:', result);
    return result;
  } catch (error) {
    console.error('Registration failed:', error.message);
    throw error;
  }
};

// Usage
registerUser({
  email: 'john.doe@company.com',
  nombre: 'John',
  apellidos: 'Doe',
  password: 'SecurePass123!'
})
.then(result => {
  alert('Registration successful! Please login.');
  // Navigate to login screen
})
.catch(error => {
  alert('Registration failed: ' + error.message);
});
```

#### Login
```javascript
const loginUser = async (credentials) => {
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const result = await response.json();
    
    // Store JWT token
    localStorage.setItem('access_token', result.access_token);
    
    console.log('Login successful');
    return result;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
};

// Usage
loginUser({
  email: 'john.doe@company.com',
  password: 'SecurePass123!'
})
.then(result => {
  console.log('Logged in successfully');
  // Navigate to main app
})
.catch(error => {
  alert('Login failed: ' + error.message);
});
```

#### Get User Profile
```javascript
const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('access_token');
        throw new Error('Please login again');
      }
      const error = await response.json();
      throw new Error(error.message);
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to get user profile:', error.message);
    throw error;
  }
};

// Usage
getUserProfile()
  .then(user => {
    console.log('User profile:', user);
    // Update UI with user data
  })
  .catch(error => {
    console.error('Error:', error.message);
    // Handle authentication error
  });
```

#### Change Password
```javascript
const changePassword = async (passwordData) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch('/auth/change-password', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(passwordData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(Array.isArray(error.message) ? error.message.join(', ') : error.message);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Password change failed:', error.message);
    throw error;
  }
};

// Usage
changePassword({
  currentPassword: 'OldPass123!',
  newPassword: 'NewSecurePass456@',
  confirmPassword: 'NewSecurePass456@'
})
.then(() => {
  alert('Password changed successfully!');
})
.catch(error => {
  alert('Failed to change password: ' + error.message);
});
```

### Using Axios

```javascript
import axios from 'axios';

// Create axios instance with base configuration
const authAPI = axios.create({
  baseURL: 'http://your-api-domain.com',
  timeout: 10000
});

// Request interceptor to add auth token
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  // Register
  register: async (userData) => {
    try {
      const response = await authAPI.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message;
      throw new Error(Array.isArray(message) ? message.join(', ') : message || error.message);
    }
  },

  // Login
  login: async (credentials) => {
    try {
      const response = await authAPI.post('/auth/login', credentials);
      const { access_token } = response.data;
      
      // Store token
      localStorage.setItem('access_token', access_token);
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Get profile
  getProfile: async () => {
    try {
      const response = await authAPI.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Get comprehensive profile
  getComprehensiveProfile: async () => {
    try {
      const response = await authAPI.get('/auth/me/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await authAPI.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message;
      throw new Error(Array.isArray(message) ? message.join(', ') : message || error.message);
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now(); // Check if token is not expired
    } catch {
      return false;
    }
  }
};

export default authService;
```

### React Native with AsyncStorage

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const authService = {
  // Login and store token
  login: async (credentials) => {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const { access_token } = await response.json();
      
      // Store token securely
      await AsyncStorage.setItem('access_token', access_token);
      
      return { access_token };
    } catch (error) {
      throw error;
    }
  },

  // Get stored token
  getToken: async () => {
    try {
      return await AsyncStorage.getItem('access_token');
    } catch (error) {
      return null;
    }
  },

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem('access_token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  // Authenticated request helper
  authenticatedRequest: async (url, options = {}) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers
        }
      });

      if (response.status === 401) {
        // Token expired
        await AsyncStorage.removeItem('access_token');
        throw new Error('Please login again');
      }

      return response;
    } catch (error) {
      throw error;
    }
  }
};
```

---

## 🔧 Client-Side Validation

### Form Validation Helpers

```javascript
const validationRules = {
  email: (email) => {
    const errors = [];
    if (!email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Please enter a valid email address');
    } else if (email.length > 254) {
      errors.push('Email must be no more than 254 characters');
    }
    return errors;
  },

  nombre: (nombre) => {
    const errors = [];
    if (!nombre) {
      errors.push('First name is required');
    } else if (nombre.length < 2) {
      errors.push('First name must be at least 2 characters');
    } else if (nombre.length > 60) {
      errors.push('First name must be no more than 60 characters');
    } else if (!/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/.test(nombre)) {
      errors.push('First name can only contain letters and spaces');
    }
    return errors;
  },

  apellidos: (apellidos) => {
    const errors = [];
    if (!apellidos) {
      errors.push('Last name is required');
    } else if (apellidos.length < 2) {
      errors.push('Last name must be at least 2 characters');
    } else if (apellidos.length > 80) {
      errors.push('Last name must be no more than 80 characters');
    } else if (!/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/.test(apellidos)) {
      errors.push('Last name can only contain letters and spaces');
    }
    return errors;
  },

  password: (password) => {
    const errors = [];
    
    if (!password) {
      errors.push('Password is required');
      return errors;
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (password.length > 64) {
      errors.push('Password must be no more than 64 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[@$!%*?&.]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&.)');
    }
    
    if (!/^[A-Za-zñÑ\d@$!%*?&.]+$/.test(password)) {
      errors.push('Password contains invalid characters');
    }
    
    return errors;
  },

  passwordConfirmation: (password, confirmPassword) => {
    const errors = [];
    if (!confirmPassword) {
      errors.push('Password confirmation is required');
    } else if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }
    return errors;
  }
};

// Validate entire registration form
const validateRegistrationForm = (formData) => {
  const errors = {};
  
  const emailErrors = validationRules.email(formData.email);
  if (emailErrors.length > 0) errors.email = emailErrors;
  
  const nombreErrors = validationRules.nombre(formData.nombre);
  if (nombreErrors.length > 0) errors.nombre = nombreErrors;
  
  const apellidosErrors = validationRules.apellidos(formData.apellidos);
  if (apellidosErrors.length > 0) errors.apellidos = apellidosErrors;
  
  const passwordErrors = validationRules.password(formData.password);
  if (passwordErrors.length > 0) errors.password = passwordErrors;
  
  return errors;
};

// Usage example
const formData = {
  email: 'john.doe@company.com',
  nombre: 'John',
  apellidos: 'Doe',
  password: 'SecurePass123!'
};

const errors = validateRegistrationForm(formData);
if (Object.keys(errors).length === 0) {
  // Form is valid, submit
  registerUser(formData);
} else {
  // Show validation errors
  console.log('Validation errors:', errors);
}
```

### Password Strength Indicator

```javascript
const getPasswordStrength = (password) => {
  let score = 0;
  const feedback = [];

  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('One uppercase letter');

  if (/\d/.test(password)) score += 1;
  else feedback.push('One number');

  if (/[@$!%*?&.]/.test(password)) score += 1;
  else feedback.push('One special character (@$!%*?&.)');

  if (password.length >= 12) score += 1;

  const strength = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const color = ['#ff4444', '#ff8800', '#ffbb00', '#88cc00', '#00cc00'][score];

  return { score, strength, color, feedback };
};

// Usage in React component
const PasswordStrengthIndicator = ({ password }) => {
  const { strength, color, feedback } = getPasswordStrength(password);
  
  return (
    <div>
      <div style={{ color }}>
        Password Strength: {strength}
      </div>
      {feedback.length > 0 && (
        <div>
          <small>Required: {feedback.join(', ')}</small>
        </div>
      )}
    </div>
  );
};
```

---

## 🔐 JWT Token Management

### Token Structure
```javascript
// JWT Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// JWT Payload
{
  "id": "357b292d-ddbf-4061-89ce-2243f6d9db57",
  "email": "john.doe@company.com",
  "iat": 1642680000,  // Issued at (Unix timestamp)
  "exp": 1642766400   // Expires at (Unix timestamp) - 24 hours later
}
```

### Token Utilities
```javascript
const tokenUtils = {
  // Decode JWT token
  decodeToken: (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      return null;
    }
  },

  // Check if token is expired
  isTokenExpired: (token) => {
    const payload = tokenUtils.decodeToken(token);
    if (!payload) return true;
    
    return payload.exp * 1000 < Date.now();
  },

  // Get token expiry time
  getTokenExpiry: (token) => {
    const payload = tokenUtils.decodeToken(token);
    if (!payload) return null;
    
    return new Date(payload.exp * 1000);
  },

  // Get user info from token
  getUserFromToken: (token) => {
    const payload = tokenUtils.decodeToken(token);
    if (!payload) return null;
    
    return {
      id: payload.id,
      email: payload.email
    };
  },

  // Auto-refresh token logic
  shouldRefreshToken: (token) => {
    const payload = tokenUtils.decodeToken(token);
    if (!payload) return false;
    
    const now = Date.now();
    const exp = payload.exp * 1000;
    const timeUntilExpiry = exp - now;
    
    // Refresh if token expires in less than 1 hour
    return timeUntilExpiry < 60 * 60 * 1000;
  }
};
```

---

## ⚡ Performance & Security Best Practices

### Secure Token Storage
```javascript
// ✅ Good: Use secure storage
// Browser
localStorage.setItem('access_token', token);

// React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('access_token', token);

// ❌ Bad: Never store in plain text or unsecured locations
// Don't store in cookies without httpOnly flag
// Don't store in global variables
// Don't log tokens to console in production
```

### Error Handling Best Practices
```javascript
const handleAuthError = (error) => {
  // Map backend error messages to user-friendly messages
  const errorMap = {
    'email-already-exists': 'An account with this email already exists',
    'invalid-credentials': 'Invalid email or password',
    'password-too-weak (needs uppercase, number, symbol)': 'Password must contain uppercase letter, number, and special character',
    'nombre-invalid-characters': 'First name can only contain letters and spaces',
    'apellidos-invalid-characters': 'Last name can only contain letters and spaces'
  };

  return errorMap[error] || error;
};

// Usage
.catch(error => {
  const friendlyMessage = handleAuthError(error.message);
  alert(friendlyMessage);
});
```

### Automatic Logout on Token Expiry
```javascript
const setupTokenMonitoring = () => {
  setInterval(() => {
    const token = localStorage.getItem('access_token');
    if (token && tokenUtils.isTokenExpired(token)) {
      // Token expired, logout user
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      alert('Your session has expired. Please login again.');
    }
  }, 60000); // Check every minute
};

// Call on app startup
setupTokenMonitoring();
```

---

## 🎯 Complete Login Flow Example

```javascript
// Complete authentication flow
class AuthManager {
  constructor() {
    this.token = localStorage.getItem('access_token');
    this.user = null;
    this.setupTokenMonitoring();
  }

  async login(email, password) {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const { access_token } = await response.json();
      
      // Store token
      this.token = access_token;
      localStorage.setItem('access_token', access_token);
      
      // Load user profile
      await this.loadUserProfile();
      
      return { success: true };
    } catch (error) {
      throw new Error(this.formatError(error.message));
    }
  }

  async register(userData) {
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        const message = Array.isArray(error.message) ? error.message.join(', ') : error.message;
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      throw new Error(this.formatError(error.message));
    }
  }

  async loadUserProfile() {
    if (!this.token) return null;

    try {
      const response = await fetch('/auth/me', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          return null;
        }
        throw new Error('Failed to load profile');
      }

      this.user = await response.json();
      return this.user;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('access_token');
  }

  isAuthenticated() {
    return this.token && !tokenUtils.isTokenExpired(this.token);
  }

  setupTokenMonitoring() {
    setInterval(() => {
      if (this.token && tokenUtils.isTokenExpired(this.token)) {
        this.logout();
        window.location.href = '/login';
        alert('Your session has expired. Please login again.');
      }
    }, 60000);
  }

  formatError(message) {
    const errorMap = {
      'invalid-credentials': 'Invalid email or password',
      'email-already-exists': 'An account with this email already exists',
      'password-too-weak (needs uppercase, number, symbol)': 'Password must contain uppercase letter, number, and special character'
    };
    return errorMap[message] || message;
  }
}

// Usage
const auth = new AuthManager();

// Login
auth.login('john.doe@company.com', 'SecurePass123!')
  .then(() => {
    console.log('Logged in successfully');
    console.log('User:', auth.user);
  })
  .catch(error => {
    alert('Login failed: ' + error.message);
  });
```

---

## 🔧 Environment Configuration

### Backend Environment Variables
```bash
# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_database_name
```

### Frontend Configuration
```javascript
// config.js
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3000',
    TOKEN_STORAGE_KEY: 'access_token'
  },
  production: {
    API_BASE_URL: 'https://your-api-domain.com',
    TOKEN_STORAGE_KEY: 'access_token'
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

---

## ✅ Testing

### Test Registration
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "nombre": "Test",
    "apellidos": "User",
    "password": "TestPass123!"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Test Protected Route
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

**🎉 Your authentication system is COMPLETE and PRODUCTION-READY!**

Features included:
- ✅ **Secure registration & login**
- ✅ **Strong password requirements**
- ✅ **JWT token authentication**
- ✅ **Comprehensive validation**
- ✅ **Spanish name support** 
- ✅ **Profile management**
- ✅ **Password changes**
- ✅ **Complete error handling**

**Perfect for secure user management!** 🔐🚀 