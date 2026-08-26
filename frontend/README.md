# Sistema de Gestión de Mantenimiento - Frontend

React + Vite frontend para el sistema de gestión de solicitudes y tickets de mantenimiento industrial.

## Instalación

```bash
npm install
```

## Ejecutar

Desarrollo:
```bash
npm run dev
```

La app se abrirá en `http://localhost:3000`

Producción:
```bash
npm run build
```

## Estructura

```
src/
├── components/        # Componentes reutilizables (Navbar, ProtectedRoute)
├── pages/            # Páginas principales (Login, Tickets, Dashboard, etc)
├── context/          # Context API (AuthContext)
├── services/         # APIs y servicios (axios client)
├── App.jsx           # Componente principal con routing
└── main.jsx          # Punto de entrada
```

## Flujo de autenticación

1. Usuario inicia sesión en `/login`
2. Token JWT se almacena en localStorage
3. Token se envía en cada request (interceptor de axios)
4. ProtectedRoute verifica autenticación y rol requerido
5. AuthContext maneja estado global de usuario

## Roles

- **Admin**: Acceso a dashboard y estadísticas
- **Técnico**: Asignación de tickets y cambio de estados
- **Solicitante**: Crear tickets y ver sus propios tickets

## Features

- ✅ Login con JWT
- ✅ CRUD de tickets con filtros
- ✅ Historial de cambios
- ✅ Dashboard con estadísticas
- ✅ Control de acceso por rol
- ✅ Diseño responsivo
