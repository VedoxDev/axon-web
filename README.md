# Axon - Frontend Web 🌐

Proyecto desarrollado por Victor Fonseca y Ranzes Mata

Frontend web del Trabajo de Fin de Grado (TFG) 🎓 para la plataforma colaborativa Axon.

Este repositorio contiene el frontend de la aplicación web Axon, diseñado para proporcionar una interfaz de usuario intuitiva para interactuar con el backend de Axon a través de un navegador web moderno.

## Estado Actual ✅

Actualmente, el proyecto ha sido reorganizado con un flujo de navegación adecuado utilizando React Router y una estructura de componentes limpia.

## Estructura de Carpetas 🗂️

La estructura del proyecto ahora es la siguiente:

```
src/
├── components/          # Componentes de UI reutilizables
│   ├── Logo.tsx        # Componente de Logo con propiedades personalizables
│   ├── FormInput.tsx   # Componente de entrada de formulario estandarizado
│   ├── Button.tsx      # Componente de botón con múltiples variantes
│   └── index.ts        # Archivo de exportación para importaciones sencillas
├── pages/              # Componentes de página (componentes de ruta)
│   ├── LoginPage.tsx   # Página de inicio de sesión con panel de imagen
│   ├── RegisterPage.tsx # Página de registro
│   └── DashboardPage.tsx # Dashboard después del inicio de sesión
├── layouts/            # Componentes de diseño (layouts)
│   └── AuthLayout.tsx  # Layout común para páginas de autenticación
├── hooks/              # Hooks personalizados de React (vacío por ahora)
├── utils/              # Funciones de utilidad (vacío por ahora)
└── assets/             # Activos estáticos (imágenes, etc.)
```

## Flujo de Navegación 🧭

### Rutas
- `/` - Página de inicio de sesión (`LoginPage`)
- `/register` - Página de registro (`RegisterPage`)
- `/dashboard` - Página del dashboard (`DashboardPage`)

### Características de Navegación
- **Inicio de sesión a Registro**: Enlace en la parte inferior del formulario de inicio de sesión
- **Registro a Inicio de sesión**: Enlace en la parte inferior del formulario de registro
- **Inicio de sesión a Dashboard**: Enlace de demostración (reemplazar con lógica de autenticación real)
- **Dashboard a Cerrar sesión**: Enlace en el encabezado (regresa al inicio de sesión)

## Componentes 🧩

### Componentes Reutilizables

#### Componente Logo
```tsx
<Logo 
  className="justify-center" 
  showText={true} 
  textSize="text-3xl" 
/>
```

#### Componente FormInput
```tsx
<FormInput
  id="email"
  type="email"
  placeholder="Email"
  label="Email"
  required
/>
```

#### Componente Button
```tsx
<Button 
  type="submit" 
  variant="primary"
  onClick={handleClick}
>
  Click me
</Button>
```

Variantes disponibles: `primary`, `secondary`, `orange`, `gray`

### Componentes de Layout

#### AuthLayout
Proporciona un estilo consistente para las páginas de autenticación con contenido centrado y tema oscuro.

## Estilo 🎨
- Utiliza Tailwind CSS para el estilizado
- Tema oscuro con fondo `gray-900`
- Color de acento naranja (`#orange-500`)
- Diseño responsivo con enfoque mobile-first

## Próximos Pasos ➡️
1.  Implementar la lógica de autenticación real.
2.  Añadir validación de formularios.
3.  Crear rutas protegidas.
4.  Añadir estados de carga.
5.  Implementar manejo de errores.
6.  Añadir más páginas (perfil, salas de chat, etc.).

## Requisitos para Ejecutar 🧪

*   Node.js (versión LTS recomendada)
*   Un navegador web moderno

## Instalación ⚙️

1.  Clona este repositorio.
2.  Navega al directorio del proyecto en tu terminal.
3.  Instala las dependencias:
    ```bash
    npm install
    ```
4.  Inicia la aplicación en modo desarrollo:
    ```bash
    npm run dev
    ```
    La aplicación se abrirá en tu navegador en `http://localhost:5173` (o el puerto indicado).

## Notas Adicionales 📌

*   Actualmente centrado en el desarrollo web.
*   Para construir la aplicación para producción, usa `npm run build`.

Repositorio gestionado por ambos autores. 🤝
