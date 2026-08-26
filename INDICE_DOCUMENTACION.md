# 📚 Índice de Documentación

Bienvenido al Sistema de Gestión de Mantenimiento Industrial. Esta es tu guía de navegación por toda la documentación.

---

## 🚀 Comienza Aquí

### 1. **[INICIO_RAPIDO.md](INICIO_RAPIDO.md)** ⭐ LEER PRIMERO
   - **Para**: Desarrolladores que quieren ejecutar el proyecto rápido
   - **Contiene**: 
     - Requisitos previos
     - Instalación paso a paso (5 min)
     - Credenciales de prueba
     - Troubleshooting común
   - **Tiempo estimado**: 5 minutos

### 2. **[README.md](README.md)** 📋 REFERENCIA GENERAL
   - **Para**: Entender qué es el proyecto
   - **Contiene**:
     - Descripción completa
     - Stack tecnológico
     - Funcionalidades por rol
     - Requisitos cumplidos
   - **Tiempo estimado**: 10 minutos

---

## 🏗️ Comprensión Técnica

### 3. **[ARQUITECTURA.md](ARQUITECTURA.md)** 🏛️ DIAGRAMAS Y FLUJOS
   - **Para**: Entender cómo funciona internamente
   - **Contiene**:
     - Diagrama de flujo general
     - Flujo de autenticación JWT
     - Flujo de creación de ticket
     - Flujo de asignación
     - Stack de tecnologías
     - Modelos de datos
     - Endpoints API
     - Seguridad implementada
   - **Tiempo estimado**: 15 minutos
   - **Visual**: Diagramas ASCII incluidos

### 4. **[DEPENDENCIAS.md](DEPENDENCIAS.md)** 📦 LIBRERÍAS
   - **Para**: Entender qué se usó y por qué
   - **Contiene**:
     - Dependencias principales explicadas
     - Backend: Express, Mongoose, JWT, bcryptjs, etc
     - Frontend: React, Vite, Router, Axios
     - Devdependencies
   - **Tiempo estimado**: 5 minutos

---

## ✅ Validación de Requisitos

### 5. **[CHECKLIST_FEATURES.md](CHECKLIST_FEATURES.md)** 🎯 VALIDACIÓN COMPLETA
   - **Para**: Verificar que todo está hecho
   - **Contiene**:
     - ✅ Must Have Features (9 items)
     - ✅ Suggested Features (9 items)
     - ✅ UI/UX Features
     - ✅ Seguridad implementada
     - ✅ Datos de prueba
     - ✅ Funcionalidad por página
     - ✅ Manual testing checklist
   - **Tiempo estimado**: 10 minutos
   - **Estatus**: 100% Completo ✅

---

## 📊 Resumen Ejecutivo

### 6. **[RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)** 🎉 PARA PRESENTACIÓN
   - **Para**: Presentar a stakeholders/profesores
   - **Contiene**:
     - Objetivo del proyecto
     - Solución entregada
     - Estadísticas
     - Stack tecnológico
     - Requisitos cumplidos
     - Guía de inicio rápido
     - Características de seguridad
   - **Tiempo estimado**: 5 minutos
   - **Audiencia**: No-técnicos y técnicos

---

## 📂 Documentación por Módulo

### Backend

#### 7. **[backend/README.md](backend/README.md)** 🔧 BACKEND
   - **Para**: Desarrolladores trabajando en el backend
   - **Contiene**:
     - Instalación
     - Variables de entorno
     - Inicialización de BD
     - Comandos disponibles
     - Endpoints API documentados
   - **Tiempo estimado**: 5 minutos

#### Archivos Principales
```
backend/
├── server.js          → Servidor principal
├── models/
│   ├── User.js        → Modelo de usuario con auth
│   ├── Ticket.js      → Modelo de ticket
│   └── HistoryLog.js  → Modelo de historial
├── routes/
│   ├── auth.js        → Endpoints de login/registro
│   ├── tickets.js     → CRUD de tickets
│   └── dashboard.js   → Estadísticas
├── middleware/
│   └── auth.js        → JWT + RBAC
├── config/
│   └── db.js          → Conexión a MongoDB
└── seeds/
    └── seedData.js    → Datos de prueba
```

### Frontend

#### 8. **[frontend/README.md](frontend/README.md)** ⚛️ FRONTEND
   - **Para**: Desarrolladores trabajando en el frontend
   - **Contiene**:
     - Instalación
     - Comandos dev/build
     - Estructura de carpetas
     - Flujo de autenticación
     - Roles y permisos
     - Features
   - **Tiempo estimado**: 5 minutos

#### Archivos Principales
```
frontend/
├── src/
│   ├── App.jsx                   → Componente raíz + routing
│   ├── main.jsx                  → Punto de entrada
│   ├── index.css                 → Global styles
│   ├── pages/
│   │   ├── Login.jsx             → Página login
│   │   ├── Tickets.jsx           → CRUD tickets
│   │   ├── TicketDetalle.jsx     → Detalle + historial
│   │   └── Dashboard.jsx         → Admin dashboard
│   ├── components/
│   │   ├── Navbar.jsx            → Navegación global
│   │   └── ProtectedRoute.jsx    → Rutas protegidas
│   ├── context/
│   │   └── AuthContext.jsx       → Estado global auth
│   └── services/
│       └── api.js                → Cliente HTTP
├── vite.config.js                → Configuración Vite
└── index.html                    → HTML template
```

---

## 🎯 Flujos de Uso

### Para Solicitante
1. [INICIO_RAPIDO.md](INICIO_RAPIDO.md#acceso-a-la-aplicación) → Login
2. [README.md](README.md#-funcionalidades-por-rol) → Crear ticket
3. [ARQUITECTURA.md](ARQUITECTURA.md#flujo-de-creación-de-ticket) → Ver flujo

### Para Técnico
1. [INICIO_RAPIDO.md](INICIO_RAPIDO.md#como-técnico) → Login
2. [README.md](README.md#-funcionalidades-por-rol) → Ver asignados
3. Cambiar estado y registrar solución

### Para Admin
1. [INICIO_RAPIDO.md](INICIO_RAPIDO.md#como-admin) → Login
2. [README.md](README.md#-funcionalidades-por-rol) → Ver dashboard
3. Asignar tickets y ver estadísticas

---

## 🔍 Búsqueda por Tema

### Autenticación
- JWT: [ARQUITECTURA.md - Flujo de Autenticación](ARQUITECTURA.md#flujo-de-autenticación)
- Login: [backend/routes/auth.js](backend/routes/auth.js)
- Seguridad: [CHECKLIST_FEATURES.md - Seguridad](CHECKLIST_FEATURES.md#-seguridad-implementada)

### Tickets
- CRUD: [backend/routes/tickets.js](backend/routes/tickets.js)
- Modelo: [backend/models/Ticket.js](backend/models/Ticket.js)
- Flujo: [ARQUITECTURA.md - Flujo de Creación](ARQUITECTURA.md#flujo-de-creación-de-ticket)

### Historial
- Modelo: [backend/models/HistoryLog.js](backend/models/HistoryLog.js)
- Trazabilidad: [CHECKLIST_FEATURES.md - Historial](CHECKLIST_FEATURES.md#historiallog-de-cambios)

### Dashboard
- Rutas: [backend/routes/dashboard.js](backend/routes/dashboard.js)
- Frontend: [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx)
- Stats: [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)

### Roles y Permisos
- RBAC: [backend/middleware/auth.js](backend/middleware/auth.js)
- Control: [ARQUITECTURA.md - Acceso por Rol](ARQUITECTURA.md#acceso-por-rol)
- Implementación: [CHECKLIST_FEATURES.md](CHECKLIST_FEATURES.md)

---

## 🚨 Troubleshooting

### Problema: "MongoDB connection refused"
- **Solución**: [INICIO_RAPIDO.md#mongodb-connection-refused](INICIO_RAPIDO.md#mongodb-connection-refused)

### Problema: "Port already in use"
- **Solución**: [INICIO_RAPIDO.md#eaddrinuse-address-already-in-use-5000](INICIO_RAPIDO.md#eaddrinuse-address-already-in-use-5000)

### Problema: "Module not found"
- **Solución**: [INICIO_RAPIDO.md#module-not-found-axios](INICIO_RAPIDO.md#module-not-found-axios)

### Problema: "Datos de prueba no aparecen"
- **Solución**: [INICIO_RAPIDO.md#datos-de-prueba-no-aparecen](INICIO_RAPIDO.md#datos-de-prueba-no-aparecen)

---

## 📖 Lecturas Recomendadas por Perfil

### 👨‍💼 Gerente/Stakeholder
1. [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) - 5 min
2. [README.md](README.md) - 10 min
3. Demo en vivo

### 👨‍💻 Desarrollador Frontend
1. [INICIO_RAPIDO.md](INICIO_RAPIDO.md) - 5 min
2. [frontend/README.md](frontend/README.md) - 5 min
3. [ARQUITECTURA.md](ARQUITECTURA.md#acceso-por-rol) - 10 min
4. Código: `frontend/src/pages/`

### 🔧 Desarrollador Backend
1. [INICIO_RAPIDO.md](INICIO_RAPIDO.md) - 5 min
2. [backend/README.md](backend/README.md) - 5 min
3. [ARQUITECTURA.md](ARQUITECTURA.md#endpoints-resumidos) - 10 min
4. Código: `backend/routes/`

### 🎓 Profesor/Revisor
1. [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) - 5 min
2. [CHECKLIST_FEATURES.md](CHECKLIST_FEATURES.md) - 10 min
3. [ARQUITECTURA.md](ARQUITECTURA.md) - 15 min
4. [README.md](README.md) - 10 min

---

## 🎬 Mapa de Pantallas

```
http://localhost:3000
├── /login              (Login page)
│   └── Credenciales de prueba incluidas
├── /tickets            (CRUD de tickets)
│   ├── Listar todos (si admin)
│   ├── Listar asignados (si técnico)
│   ├── Listar propios (si solicitante)
│   └── Crear nuevo (si solicitante o admin)
├── /tickets/:id        (Detalle + historial)
│   ├── Ver información
│   ├── Cambiar estado
│   ├── Cambiar prioridad
│   └── Ver historial completo
└── /dashboard          (Solo admin)
    ├── 6 KPIs principales
    ├── Gráficos por prioridad
    ├── Gráficos por área
    └── Tabla desempeño técnicos
```

---

## 🔗 Enlaces Rápidos

| Recurso | Enlace |
|---------|--------|
| **Inicio Rápido** | [INICIO_RAPIDO.md](INICIO_RAPIDO.md) |
| **README Principal** | [README.md](README.md) |
| **Arquitectura** | [ARQUITECTURA.md](ARQUITECTURA.md) |
| **Features** | [CHECKLIST_FEATURES.md](CHECKLIST_FEATURES.md) |
| **Resumen Ejecutivo** | [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) |
| **Backend README** | [backend/README.md](backend/README.md) |
| **Frontend README** | [frontend/README.md](frontend/README.md) |

---

## 📞 Soporte

### ¿Cómo empiezo?
→ Lee [INICIO_RAPIDO.md](INICIO_RAPIDO.md)

### ¿Cómo funciona internamente?
→ Lee [ARQUITECTURA.md](ARQUITECTURA.md)

### ¿Está todo hecho?
→ Revisa [CHECKLIST_FEATURES.md](CHECKLIST_FEATURES.md)

### ¿Cómo presento el proyecto?
→ Usa [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)

### ¿Hay un problema?
→ Busca en [INICIO_RAPIDO.md#troubleshooting](INICIO_RAPIDO.md#troubleshooting)

---

## 📝 Versionado

| Version | Fecha | Status |
|---------|-------|--------|
| 1.0.0 | 26 Ago 2026 | MVP Completo ✅ |

---

## 🎉 Listo para Empezar

**Paso 1**: Abre [INICIO_RAPIDO.md](INICIO_RAPIDO.md)
**Paso 2**: Sigue las instrucciones
**Paso 3**: ¡Disfruta el sistema! 🚀

---

**Última actualización**: 26 Agosto 2026
**Documentación Completa**: ✅
