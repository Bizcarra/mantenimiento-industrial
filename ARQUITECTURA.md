# 🏗️ Arquitectura del Sistema

## Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────────────┐
│                     USUARIO (Frontend)                          │
│                    React + Vite + Router                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP/REST (Axios)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API SERVER (Backend)                         │
│                  Node.js + Express.js                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ /auth       │  │ /tickets    │  │ /dashboard  │            │
│  │ - login     │  │ - listar    │  │ - stats     │            │
│  │ - registro  │  │ - crear     │  │ - desempeño │            │
│  │ - me        │  │ - obtener   │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│  Middleware: JWT Auth + Role Based Access Control              │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                  Mongoose ODM + Connection Pool
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MongoDB Database                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Collection: users        Collection: tickets                  │
│  ├─ _id                   ├─ _id                               │
│  ├─ nombre                ├─ numeroTicket                      │
│  ├─ email                 ├─ titulo                            │
│  ├─ password (hash)       ├─ descripcion                       │
│  ├─ rol                   ├─ estado                            │
│  ├─ area                  ├─ prioridad                         │
│  └─ timestamps            ├─ solicitante (ref)                 │
│                           ├─ tecnicoAsignado (ref)             │
│  Collection: historylogs  ├─ area                              │
│  ├─ _id                   ├─ fechaSolicitud                    │
│  ├─ ticket (ref)          ├─ fechaResolucion                   │
│  ├─ usuarioQueCambia      ├─ descripcionSolucion               │
│  ├─ tipoDeAccion          └─ timestamps                        │
│  ├─ detalles              │                                    │
│  ├─ datosAnteriores       │                                    │
│  ├─ datosNuevos           │                                    │
│  └─ timestamp             │                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Flujo de Autenticación

```
LOGIN FLOW
┌─────────────┐
│ User Input  │  Email + Password
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ POST /api/auth/login    │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐      ┌──────────────────┐
│ Validate Email          │──X──▶│ Error 401        │
└──────┬──────────────────┘      └──────────────────┘
       │
       ▼
┌─────────────────────────┐      ┌──────────────────┐
│ Compare Password        │──X──▶│ Error 401        │
└──────┬──────────────────┘      └──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Generate JWT Token      │
│ (válido 7 días)         │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Store in localStorage   │
│ Send in every request   │
│ Header: Authorization   │
└─────────────────────────┘

PROTECTED REQUEST FLOW
┌──────────────┐
│ HTTP Request │
│ + JWT Token  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐     ┌──────────────────┐
│ authMiddleware           │──X──▶│ Error 401        │
│ Verify Token             │     │ No token         │
└──────┬───────────────────┘     └──────────────────┘
       │
       ▼
┌──────────────────────────┐     ┌──────────────────┐
│ JWT Decode Valid?        │──X──▶│ Error 401        │
└──────┬───────────────────┘     │ Invalid token    │
       │                         └──────────────────┘
       ▼
┌──────────────────────────┐
│ req.usuario = {id, rol}  │
│ Continue to endpoint     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐     ┌──────────────────┐
│ requireRole Check        │──X──▶│ Error 403        │
│ ¿Rol autorizado?         │     │ Access denied    │
└──────┬───────────────────┘     └──────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Execute Endpoint Logic   │
└──────────────────────────┘
```

## Flujo de Creación de Ticket

```
SOLICITANTE CREA TICKET
┌──────────────────────┐
│ Click "Nuevo Ticket" │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Formulario (Login requerido)         │
│ ├─ Título                            │
│ ├─ Descripción                       │
│ ├─ Área                              │
│ └─ Prioridad (default: media)        │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────┐
│ POST /api/tickets        │
│ + JWT Token              │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Backend Validation                   │
│ ├─ Campos requeridos?                │
│ ├─ Usuario autenticado?              │
│ └─ Token válido?                     │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Crear Documento Ticket               │
│ ├─ numeroTicket (único)              │
│ ├─ estado: "abierto"                 │
│ ├─ solicitante: req.usuario.id       │
│ ├─ tecnicoAsignado: null             │
│ └─ fechaSolicitud: Date.now()        │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Crear HistoryLog                     │
│ ├─ tipoDeAccion: "creacion"          │
│ ├─ usuarioQueCambia: req.usuario.id  │
│ ├─ detalles: "Ticket creado: ..."    │
│ └─ datosNuevos: {...ticket}          │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Response 201                         │
│ {"ticket": {...}, "historial": [...]}│
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────┐
│ Frontend Actualiza Lista │
│ Ticket aparece en grid   │
└──────────────────────────┘
```

## Flujo de Asignación (Admin → Técnico)

```
ADMIN ASIGNA TICKET
┌──────────────────────────────┐
│ Admin abre ticket            │
│ Click "Cambiar Estado"       │
│ Selecciona: "en_progreso"    │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ PATCH /api/tickets/:id/estado    │
│ Body: {nuevoEstado: "en_progreso"}│
└──────────┬──────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ authMiddleware ✓                 │
│ requireRole(['admin']) ✓         │
└──────────┬──────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Actualizar Ticket                │
│ estado: "en_progreso"            │
│ fechaAsignacion: Date.now()       │
└──────────┬──────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Crear HistoryLog                 │
│ tipoDeAccion: "cambio_estado"    │
│ datosAnteriores: {estado: "..."}│
│ datosNuevos: {estado: "..."}    │
└──────────┬──────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Response 200 + Updated Ticket    │
└──────────┬──────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Frontend Actualiza                │
│ ├─ Badge de estado cambia        │
│ ├─ Historial se actualiza        │
│ └─ Timestamp registrado          │
└──────────────────────────────────┘
```

## Acceso por Rol

```
┌────────────────┬───────────────┬──────────────┬────────────┐
│ Recurso/Acción │ Admin         │ Técnico      │ Solicitante│
├────────────────┼───────────────┼──────────────┼────────────┤
│ Ver todos      │ ✅ Todos      │ ✅ Asignados │ ✅ Propios │
│ Crear tickets  │ ✅            │ ❌           │ ✅         │
│ Cambiar estado │ ✅            │ ✅ (si asig) │ ❌         │
│ Asignar ticket │ ✅            │ ❌           │ ❌         │
│ Ver dashboard  │ ✅            │ ❌           │ ❌         │
│ Prioridad      │ ✅ Cambiar    │ ❌ Solo ver  │ ❌ Solo ver│
│ Historial      │ ✅ Todos      │ ✅ Asignados │ ✅ Propios │
└────────────────┴───────────────┴──────────────┴────────────┘
```

## Estados de Ticket

```
            ┌──────────────┐
            │    ABIERTO   │  (Recién creado)
            │   🔵 Azul    │
            └──────┬───────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │EN_PROG │ │PAUSADO │ │(Rechaz)│
    │🟠 Nara │ │🟣 Púrp │ │(delete)│
    └────┬───┘ └────┬───┘ └────────┘
         │          │
         └──────┬───┘
                │
                ▼
          ┌──────────────┐
          │   RESUELTO   │  (Trabajo completo)
          │  🟢 Verde    │
          └──────┬───────┘
                 │
                 ▼
          ┌──────────────┐
          │   CERRADO    │  (Archivado)
          │  ⚫ Gris     │
          └──────────────┘
```

## Stack de Tecnologías

```
FRONTEND
┌────────────────────────────────────┐
│ React 18.2                         │
│ ├─ JSX Syntax                      │
│ ├─ Hooks (useState, useEffect)     │
│ ├─ Context API (AuthContext)       │
│ └─ Component-based Architecture    │
├────────────────────────────────────┤
│ React Router 6                     │
│ ├─ SPA Routing                     │
│ ├─ Protected Routes                │
│ └─ Dynamic Parameters              │
├────────────────────────────────────┤
│ Vite 5                             │
│ ├─ Lightning-fast HMR              │
│ ├─ Optimized Build                 │
│ └─ Dev Server en puerto 3000       │
├────────────────────────────────────┤
│ Axios 1.6                          │
│ ├─ HTTP Client                     │
│ ├─ Request Interceptors            │
│ └─ Error Handling                  │
├────────────────────────────────────┤
│ CSS Modules                        │
│ ├─ Scoped Styles                   │
│ ├─ No conflictos de nombres        │
│ └─ Component-specific CSS          │
└────────────────────────────────────┘

BACKEND
┌────────────────────────────────────┐
│ Node.js 16+                        │
│ ├─ Event-driven I/O                │
│ ├─ Non-blocking Operations         │
│ └─ V8 Engine                       │
├────────────────────────────────────┤
│ Express 4.18                       │
│ ├─ Minimal Framework               │
│ ├─ Middleware Stack                │
│ ├─ Routing Patterns                │
│ └─ Server en puerto 5000           │
├────────────────────────────────────┤
│ MongoDB 8                          │
│ ├─ NoSQL Document DB               │
│ ├─ Flexible Schema                 │
│ ├─ Horizontal Scaling              │
│ └─ Local o Atlas Cloud             │
├────────────────────────────────────┤
│ Mongoose 8                         │
│ ├─ ODM (Object Document Mapper)    │
│ ├─ Schema Validation               │
│ ├─ Hooks (pre/post)                │
│ └─ Relationships (populate)        │
├────────────────────────────────────┤
│ JWT (jsonwebtoken)                 │
│ ├─ Token Generation                │
│ ├─ Token Verification              │
│ ├─ Expiration (7 days)             │
│ └─ Stateless Auth                  │
├────────────────────────────────────┤
│ bcryptjs                           │
│ ├─ Password Hashing                │
│ ├─ Salt Rounds: 10                 │
│ └─ Secure Storage                  │
├────────────────────────────────────┤
│ CORS                               │
│ ├─ Cross-Origin Requests           │
│ ├─ Frontend ↔ Backend              │
│ └─ Security Headers                │
└────────────────────────────────────┘

COMMUNICATION
┌────────────────────────────────────┐
│ HTTP/REST API                      │
│ ├─ GET    - Obtener datos          │
│ ├─ POST   - Crear datos            │
│ ├─ PATCH  - Actualizar datos       │
│ ├─ DELETE - Eliminar datos         │
│ └─ Status Codes (200, 201, etc)    │
├────────────────────────────────────┤
│ JSON                               │
│ ├─ Data Format                     │
│ ├─ Request/Response Bodies         │
│ └─ Lightweight                     │
└────────────────────────────────────┘
```

## Modelos de Datos

```javascript
// USER
{
  _id: ObjectId,
  nombre: String,
  email: String (unique),
  password: String (hashed),
  rol: Enum ['admin', 'tecnico', 'solicitante'],
  area: String,
  activo: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// TICKET
{
  _id: ObjectId,
  numeroTicket: String (unique),
  titulo: String,
  descripcion: String,
  estado: Enum ['abierto', 'en_progreso', 'pausado', 'resuelto', 'cerrado'],
  prioridad: Enum ['baja', 'media', 'alta', 'critica'],
  area: String,
  solicitante: ObjectId (ref: User),
  tecnicoAsignado: ObjectId (ref: User) | null,
  fechaSolicitud: Date,
  fechaAsignacion: Date | null,
  fechaResolucion: Date | null,
  tiempoEstimado: Number | null,
  descripcionSolucion: String | null,
  createdAt: Date,
  updatedAt: Date
}

// HISTORYLOG
{
  _id: ObjectId,
  ticket: ObjectId (ref: Ticket),
  usuarioQueCambia: ObjectId (ref: User),
  tipoDeAccion: Enum ['creacion', 'cambio_estado', 'asignacion', 
                       'cambio_prioridad', 'resolucion', 'comentario'],
  detalles: String,
  datosAnteriores: Mixed | null,
  datosNuevos: Mixed | null,
  timestamp: Date
}
```

## Endpoints Resumidos

```
AUTENTICACIÓN
POST   /api/auth/login        (email, password)
POST   /api/auth/registro     (nombre, email, password, rol, area)
GET    /api/auth/me           (requiere JWT)

TICKETS - CRUD
GET    /api/tickets           (filtros: estado, prioridad, area, tecnico)
POST   /api/tickets           (titulo, descripcion, area, prioridad)
GET    /api/tickets/:id       (retorna ticket + historial)
PATCH  /api/tickets/:id/asignar      (tecnicoAsignado)
PATCH  /api/tickets/:id/estado       (nuevoEstado)
PATCH  /api/tickets/:id/prioridad    (nuevaPrioridad)
PATCH  /api/tickets/:id/solucion     (descripcionSolucion)

DASHBOARD (admin)
GET    /api/dashboard/stats           (estadísticas generales)
GET    /api/dashboard/tecnicos-desempenio  (desempeño técnicos)
```

## Seguridad Implementada

```
✅ Password Hashing
   - bcryptjs con 10 salt rounds
   - Nunca se almacena en texto plano

✅ JWT Tokens
   - Generado en login
   - Validado en cada request
   - Expira en 7 días
   - Almacenado en localStorage (frontend)

✅ CORS
   - Validación de origen
   - Headers de seguridad
   - Prevent CSRF

✅ Role-Based Access Control (RBAC)
   - Middleware requireRole()
   - Admin, Técnico, Solicitante
   - Filtrado de datos por rol

✅ Validación de Entrada
   - express-validator
   - Campos requeridos
   - Tipos de datos

✅ Manejo de Errores
   - Status codes HTTP apropiados
   - Mensajes de error seguros
   - No expone detalles internos
```

---

**Arquitectura robusta, escalable y segura para un MVP de Gestión de Mantenimiento Industrial.** ✨
