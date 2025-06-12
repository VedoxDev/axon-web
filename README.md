# Axon - Frontend Web 🌐

Proyecto desarrollado por Victor Fonseca y Ranzes Mata

Frontend web del Trabajo de Fin de Grado (TFG) 🎓 para la plataforma colaborativa Axon.

Este repositorio contiene el frontend de la aplicación web Axon, una plataforma colaborativa completa que permite a los equipos gestionar proyectos, comunicarse, realizar videollamadas y mantenerse organizados en un entorno de trabajo unificado.

## 🚀 Características Principales

### 🔐 Sistema de Autenticación Completo
- Inicio de sesión y registro de usuarios
- Recuperación de contraseña
- Restablecimiento de contraseña
- Rutas protegidas y públicas
- Gestión automática de tokens JWT
- Redirección automática al expirar sesión

### 📊 Dashboard Integral
- Interfaz principal con sidebar colapsible
- Panel de contenido principal adaptable
- Barra de título con funcionalidades contextuales
- Navegación intuitiva entre diferentes vistas

### 👥 Gestión de Proyectos
- Creación y administración de proyectos
- Panel de miembros del proyecto
- Sistema de invitaciones
- Gestión de roles y permisos

### 📋 Tablero de Tareas (Kanban)
- Tablero visual estilo Kanban
- Creación, edición y eliminación de tareas
- Columnas personalizables
- Sistema de etiquetas
- Reordenamiento por drag & drop
- Estados de tarea (pendiente, en progreso, completada)
- Detalles completos de tareas con modal

### 💬 Sistema de Chat
- Chat general del proyecto
- Conversaciones privadas
- Lista de conversaciones
- Mensajería en tiempo real con Socket.IO
- Vista de conversación con historial

### 📞 Videollamadas y Reuniones
- Integración con LiveKit para videollamadas HD
- Llamadas directas entre usuarios
- Reuniones programadas del proyecto
- Reuniones personales
- Botones de control de llamada
- Modal de invitación a llamadas
- Soporte para audio y video

### 📅 Sistema de Calendario
- Vista de calendario integrada
- Programación de reuniones
- Gestión de eventos
- Calendar modal personal

### 📁 Gestión de Archivos
- Subida y descarga de archivos
- Vista de archivos del proyecto
- Tarjetas de archivo con información

### 📢 Sistema de Anuncios
- Creación de anuncios del proyecto
- Vista de anuncios
- Modal de creación de anuncios

### 👤 Perfil de Usuario
- Modal de perfil de usuario
- Cambio de contraseña
- Gestión de información personal
- Estados de usuario (online, away, offline)

### 📊 Seguimiento de Actividades
- Vista de actividades del proyecto
- Historial de acciones
- Modal de actividades detalladas

## 🛠️ Tecnologías Utilizadas

### Frontend Core
- **React 19.1.0** - Biblioteca principal de UI
- **TypeScript 5.8.3** - Tipado estático
- **Vite 6.3.5** - Build tool y dev server
- **React Router DOM 7.6.1** - Enrutamiento

### Estilizado
- **Tailwind CSS 4.1.8** - Framework de CSS utility-first
- **@tailwindcss/vite** - Plugin de Vite para Tailwind

### Comunicación
- **Socket.IO Client 4.8.1** - Comunicación en tiempo real
- **Fetch API** - Peticiones HTTP al backend

### Videollamadas
- **LiveKit Client 2.13.4** - Cliente WebRTC
- **@livekit/components-react 2.9.9** - Componentes React para LiveKit
- **@livekit/components-styles 1.1.6** - Estilos para componentes LiveKit

### Utilidades
- **date-fns 4.1.0** - Manipulación de fechas

### Desarrollo
- **ESLint 9.25.0** - Linting de código
- **TypeScript ESLint 8.30.1** - Reglas ESLint para TypeScript

## 📁 Estructura del Proyecto

```
src/
├── components/              # Componentes reutilizables
│   ├── layout/             # Componentes de diseño
│   │   ├── AppLayout.tsx   # Layout principal de la aplicación
│   │   └── Titlebar.tsx    # Barra de título con funcionalidades
│   ├── modals/             # Modales del sistema
│   │   ├── UserProfileModal.tsx
│   │   ├── CreateProjectModal.tsx
│   │   ├── InviteMembersModal.tsx
│   │   ├── CreateMeetingModal.tsx
│   │   ├── PersonalCalendarModal.tsx
│   │   ├── CreateAnnouncementModal.tsx
│   │   └── [más modales...]
│   ├── TaskBoard/          # Sistema de tablero Kanban
│   │   ├── TaskBoard.tsx
│   │   ├── TaskColumn.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskDetailModal.tsx
│   │   └── [más componentes...]
│   ├── VideoCall/          # Componentes de videollamada
│   │   ├── VideoCallScreen.tsx
│   │   └── livekit-spanish.css
│   ├── CalendarView/       # Vista de calendario
│   │   └── CalendarView.tsx
│   ├── FilesView/          # Gestión de archivos
│   │   ├── FilesView.tsx
│   │   └── FileCard.tsx
│   ├── MeetingsView/       # Vista de reuniones
│   ├── ActivityView/       # Seguimiento de actividades
│   ├── AnnouncementsView/  # Vista de anuncios
│   ├── MembersPanel/       # Panel de miembros
│   ├── GeneralChat/        # Chat general
│   ├── CollapsibleSidebar.tsx # Barra lateral principal
│   ├── MainContent.tsx     # Contenido principal
│   ├── ChatPanel.tsx       # Panel de chat
│   ├── ProjectPanel.tsx    # Panel de proyecto
│   ├── ProtectedRoute.tsx  # Componente de rutas protegidas
│   ├── Logo.tsx           # Componente de logo
│   ├── FormInput.tsx      # Input de formulario
│   ├── Button.tsx         # Componente de botón
│   └── Alert.tsx          # Sistema de alertas
├── pages/                  # Páginas de la aplicación
│   ├── LoginPage.tsx       # Página de inicio de sesión
│   ├── RegisterPage.tsx    # Página de registro
│   ├── ForgotPasswordPage.tsx # Recuperación de contraseña
│   ├── ResetPasswordPage.tsx  # Restablecimiento de contraseña
│   └── DashboardPage.tsx   # Dashboard principal
├── services/               # Servicios de API
│   ├── authService.ts      # Autenticación
│   ├── projectService.ts   # Proyectos
│   ├── taskService.ts      # Tareas
│   ├── chatService.ts      # Chat
│   ├── callsService.ts     # Videollamadas
│   └── announcementService.ts # Anuncios
├── contexts/               # Contextos de React
│   └── LayoutContext.tsx   # Contexto de layout
├── hooks/                  # Hooks personalizados
│   └── useAlert.tsx        # Hook de alertas
├── layouts/                # Layouts de página
│   └── AuthLayout.tsx      # Layout de autenticación
├── config/                 # Configuración
│   └── apiConfig.ts        # Configuración de API
├── constants/              # Constantes
│   └── Colors.ts           # Colores del tema
├── assets/                 # Archivos estáticos
└── styles/                 # Estilos adicionales
```

## 🚀 Funcionalidades Avanzadas

### Sistema de Estados
- **Context API** para gestión global del estado
- **Layout Context** para control de sidebar y vistas
- **Alert System** para notificaciones
- Estados de carga y error manejados consistentemente

### Comunicación en Tiempo Real
- **Socket.IO** para chat instantáneo
- **WebRTC con LiveKit** para videollamadas
- Actualizaciones en tiempo real de estado de usuarios

### Responsive Design
- Diseño completamente responsivo
- Sidebar colapsible en móviles
- Adaptación de modales para diferentes pantallas
- Optimizado para diferentes resoluciones

### Seguridad
- Rutas protegidas con autenticación
- Gestión segura de tokens JWT
- Validación de formularios
- Manejo seguro de estados de sesión

## 🎨 Diseño y UX

- **Tema oscuro** con paleta de colores consistente
- **Iconografía moderna** con SVGs optimizados
- **Transiciones suaves** y animaciones CSS
- **Interfaz intuitiva** con navegación clara
- **Feedback visual** para todas las interacciones
- **Componentes modulares** y reutilizables

## 📱 Compatibilidad

- **Navegadores modernos** (Chrome, Firefox, Safari, Edge)
- **Dispositivos móviles** - Diseño responsivo completo
- **Tablets** - Interfaz adaptada para pantallas medianas
- **Desktop** - Experiencia optimizada para escritorio

## 🔧 Instalación y Ejecución

### Prerrequisitos
- Node.js (versión LTS recomendada)
- npm o yarn
- Un navegador web moderno

### Instalación
1. Clona este repositorio
```bash
git clone [url-del-repositorio]
```

2. Navega al directorio del proyecto
```bash
cd axon-web
```

3. Instala las dependencias
```bash
npm install
```

4. Inicia la aplicación en modo desarrollo
```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

### Comandos Disponibles
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter de código

## 🛣️ Flujo de Navegación

### Rutas de Autenticación
- `/` - Página de inicio de sesión
- `/register` - Página de registro
- `/forgot-password` - Recuperación de contraseña
- `/reset-password` - Restablecimiento de contraseña

### Rutas Protegidas
- `/dashboard` - Dashboard principal (requiere autenticación)

La aplicación incluye un sistema de rutas protegidas que redirige automáticamente a los usuarios no autenticados al login, y a los usuarios autenticados al dashboard.

## 🔄 Estado del Proyecto

✅ **Completadas:**
- Sistema de autenticación completo
- Dashboard con múltiples vistas
- Gestión de proyectos y tareas
- Sistema de chat en tiempo real
- Videollamadas con LiveKit
- Calendario y reuniones
- Gestión de archivos
- Sistema de anuncios
- Perfiles de usuario

🚧 **En desarrollo:**
- Optimizaciones de rendimiento
- Nuevas funcionalidades según feedback
- Mejoras en la UX/UI

## 👨‍💻 Desarrolladores

Repositorio desarrollado y mantenido por:
- **Victor Fonseca**
- **Ranzes Mata**

---

*Proyecto de Trabajo de Fin de Grado (TFG) - Plataforma Colaborativa Axon* 🎓
