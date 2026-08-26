# 🏭 Sistema de Gestión de Mantenimiento Industrial

**Versión:** 1.3.0 MVP  
**Estado:** ✅ Completo y funcional

Una plataforma web completa para gestionar solicitudes de mantenimiento en empresas industriales. Reemplaza canales informales (radio, WhatsApp) con un sistema centralizado, priorizado y auditable.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Credenciales de Prueba](#credenciales-de-prueba)
- [Desarrollo](#desarrollo)
- [Contribución](#contribución)
- [Notas Importantes](#notas-importantes)

---

## ✨ Características

### Core
- ✅ CRUD completo de tickets/solicitudes
- ✅ Sistema de usuarios con 3 roles (Admin, Técnico, Solicitante)
- ✅ Autenticación segura con JWT
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Asignación de tickets a técnicos

### Funcionalidades Avanzadas
- ✅ Cambio de estado de tickets (5 estados)
- ✅ Priorización (4 niveles)
- ✅ Registro de soluciones
- ✅ Historial de cambios con trazabilidad
- ✅ Cálculo automático de SLA (tiempo de resolución)
- ✅ Dashboard con estadísticas
- ✅ Filtros y búsqueda avanzada
- ✅ Diseño responsivo (móvil, tablet, desktop)

### Seguridad
- ✅ Contraseñas encriptadas (bcryptjs)
- ✅ JWT tokens con expiración
- ✅ Validación de permisos en backend
- ✅ CORS configurado
- ✅ Validación de inputs

---

## 💻 Stack Tecnológico

### Frontend
- **React 18.2** - Librería de UI
- **Vite 4.5** - Build tool rápido
- **React Router 6.15** - SPA routing
- **Axios 1.6** - HTTP client
- **CSS Modules** - Estilos encapsulados

### Backend
- **Node.js 16+** - Runtime
- **Express 4.18** - Framework web
- **MongoDB 8** - Base de datos NoSQL
- **Mongoose 7.6** - ODM
- **JWT 9.0** - Autenticación
- **bcryptjs 2.4** - Hashing

### DevTools
- **nodemon 3.0** - Auto-reload
- **Git** - Control de versiones

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v16+ ([descargar](https://nodejs.org/))
- **npm** v8+ (incluido con Node.js)
- **MongoDB** corriendo localmente o en la nube ([descargar](https://www.mongodb.com/try/download/community))
- **Git** ([descargar](https://git-scm.com/))

### Verificar instalación

```bash
node --version    # v26.7.0+
npm --version     # 12.0.2+
git --version     # 2.x+
mongosh --version # (opcional, para verificar MongoDB)
```

---

## 📥 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/mantenimiento-industrial.git
cd mantenimiento-industrial
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuración

### Backend - Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:

```bash
cd backend
cp .env.example .env
```

2. Edita el archivo `.env` con tus valores:

```env
MONGODB_URI=mongodb://localhost:27017/mantenimiento
JWT_SECRET=tu_secret_jwt_muy_seguro_aqui
PORT=5000
NODE_ENV=development
```

**Opciones de MongoDB:**

- **Local**: `mongodb://localhost:27017/mantenimiento`
- **Atlas (Cloud)**: `mongodb+srv://usuario:password@cluster.mongodb.net/mantenimiento`

### Frontend - Variables de Entorno

1. Copia el archivo `.env.example`:

```bash
cd frontend
cp .env.example .env.local
```

2. Verifica que contenga:

```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Ejecución

### Asegúrate de que MongoDB esté corriendo

```bash
# Si MongoDB está instalado localmente
mongosh

# Deberías ver el prompt de MongoDB
# Escribe "exit" para salir
```

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Verás:
```
Servidor ejecutándose en puerto 5000
MongoDB conectado
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Verás:
```
➜  Local:   http://localhost:3000/
```

### Terminal 3 - Inicializar Base de Datos (Primera vez)

```bash
cd backend
npm run seed
```

Verás:
```
✓ 5 usuarios creados
✓ 5 tickets creados
✓ Base de datos inicializada exitosamente
```

### Acceder a la Aplicación

Abre tu navegador en:

```
http://localhost:3000
```

---

## 📁 Estructura del Proyecto

```
mantenimiento-industrial/
├── backend/
│   ├── models/
│   │   ├── User.js           # Esquema de usuarios
│   │   ├── Ticket.js         # Esquema de tickets
│   │   └── HistoryLog.js     # Esquema de historial
│   ├── routes/
│   │   ├── auth.js           # Endpoints de autenticación
│   │   ├── tickets.js        # Endpoints de tickets
│   │   └── dashboard.js      # Endpoints de dashboard
│   ├── middleware/
│   │   └── auth.js           # JWT + RBAC
│   ├── config/
│   │   └── db.js             # Conexión a MongoDB
│   ├── seeds/
│   │   └── seedData.js       # Datos de prueba
│   ├── server.js             # Servidor principal
│   ├── package.json
│   ├── .env.example
│   ├── .env                  # (crear manualmente)
│   ├── .gitignore
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Tickets.jsx
│   │   │   ├── TicketDetalle.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── *.module.css
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── *.module.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   ├── .env.local             # (crear manualmente)
│   ├── .gitignore
│   └── README.md
│
├── README.md                  # Este archivo
├── .gitignore
└── docs/
    ├── ARQUITECTURA.md
    ├── CHECKLIST_FEATURES.md
    ├── RESUMEN_EJECUTIVO.md
    └── ...
```

---

## 👥 Credenciales de Prueba

El seed crea automáticamente 5 usuarios. Úsalos para probar:

### Admin (Acceso Total)
- **Email:** admin@mantenimiento.com
- **Contraseña:** admin123
- **Acceso:** Todo

### Técnico 1 (Gestiona Tickets)
- **Email:** juan@mantenimiento.com
- **Contraseña:** tecnico123
- **Área:** Producción

### Técnico 2
- **Email:** maria@mantenimiento.com
- **Contraseña:** tecnico123
- **Área:** Eléctrica

### Solicitante 1 (Crea Tickets)
- **Email:** pedro@empresa.com
- **Contraseña:** user123
- **Área:** Producción

### Solicitante 2
- **Email:** laura@empresa.com
- **Contraseña:** user123
- **Área:** Almacén

---

## 🔄 Desarrollo

### Scripts Disponibles

#### Backend

```bash
npm run dev      # Inicia con nodemon (auto-reload)
npm run seed     # Carga datos de prueba
npm start        # Inicia en modo producción
```

#### Frontend

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Compila para producción
npm run preview  # Previsualiza build
```

### Estructura de Ramas (Recomendada)

```bash
# Rama principal (código estable)
main

# Rama de desarrollo
develop

# Ramas de features
feature/nombre-feature
feature/login-v2

# Ramas de correcciones
bugfix/nombre-bug

# Ramas de hotfix (producción)
hotfix/nombre-critico
```

### Flujo de Desarrollo Git

```bash
# 1. Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/mi-feature

# 2. Trabajar en la rama
git add .
git commit -m "Descripción del cambio"

# 3. Pushear a GitHub
git push origin feature/mi-feature

# 4. Crear Pull Request en GitHub
# (desde la interfaz de GitHub)

# 5. Merge a develop después de review
# 6. Merge a main cuando esté listo para producción
```

---

## 🤝 Contribución

### Guía para Compañeros

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/mantenimiento-industrial.git
   cd mantenimiento-industrial
   ```

2. **Crea una rama para tu trabajo**
   ```bash
   git checkout develop
   git checkout -b feature/mi-funcionalidad
   ```

3. **Realiza tus cambios**
   ```bash
   # Edita archivos
   git add .
   git commit -m "feat: descripción clara del cambio"
   ```

4. **Pushea a GitHub**
   ```bash
   git push origin feature/mi-funcionalidad
   ```

5. **Crea un Pull Request**
   - Ve a GitHub
   - Haz clic en "Pull Requests"
   - Clic en "New Pull Request"
   - Selecciona tu rama
   - Describe los cambios
   - Espera review

### Convención de Commits

```bash
# Features
git commit -m "feat: agregar validación de email"

# Fixes
git commit -m "fix: corregir error en login"

# Documentación
git commit -m "docs: actualizar README"

# Estilos
git commit -m "style: mejorar diseño del dashboard"

# Refactoring
git commit -m "refactor: limpiar código de componente"

# Tests
git commit -m "test: agregar tests de autenticación"
```

---

## 🐛 Troubleshooting

### "MongoDB connection refused"

```bash
# Asegúrate de que MongoDB esté corriendo
mongosh

# Si no está instalado, descárgalo de mongodb.com
# O usa MongoDB Atlas (cloud)
```

### "EADDRINUSE: address already in use :::5000"

```bash
# El puerto 5000 está en uso
# Opción 1: Cierra la otra aplicación
# Opción 2: Cambia el puerto en .env
PORT=5001
```

### "Module not found: axios"

```bash
# Falta instalar dependencias
cd frontend
npm install
```

### "Cannot find module 'express'"

```bash
# Falta instalar dependencias
cd backend
npm install
```

### Datos de prueba no aparecen

```bash
# Ejecuta el seed nuevamente
cd backend
npm run seed
```

---

## 📊 Endpoints API

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/registro` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual

### Tickets
- `GET /api/tickets` - Listar tickets (con filtros)
- `POST /api/tickets` - Crear ticket
- `GET /api/tickets/:id` - Obtener detalle
- `PATCH /api/tickets/:id/estado` - Cambiar estado
- `PATCH /api/tickets/:id/prioridad` - Cambiar prioridad
- `PATCH /api/tickets/:id/asignar` - Asignar técnico
- `PATCH /api/tickets/:id/finalizacion` - Registrar solución

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/tecnicos-desempenio` - Desempeño técnicos

---

## 📝 Roles y Permisos

| Acción | Admin | Técnico | Solicitante |
|--------|-------|---------|------------|
| Ver todos los tickets | ✅ | ❌ | ❌ |
| Ver tickets asignados | ✅ | ✅ | ❌ |
| Ver propios tickets | ✅ | ✅ | ✅ |
| Crear tickets | ✅ | ❌ | ✅ |
| Cambiar estado | ✅ | ✅ | ❌ |
| Cambiar prioridad | ✅ | ❌ | ❌ |
| Asignar técnico | ✅ | ❌ | ❌ |
| Registrar solución | ✅ | ✅ | ❌ |
| Ver soluciones | ✅ | ✅ | ✅ |
| Ver dashboard | ✅ | ❌ | ❌ |

---

## 📚 Documentación Adicional

Ver la carpeta `docs/` para:
- `ARQUITECTURA.md` - Diagramas y flujos
- `CHECKLIST_FEATURES.md` - Validación de requisitos
- `RESUMEN_EJECUTIVO.md` - Para presentaciones
- `DEPENDENCIAS.md` - Stack detallado

---

## 🔐 Notas Importantes

### Seguridad
- ⚠️ **NUNCA** comitas el archivo `.env` (usa `.env.example`)
- ⚠️ Cambia `JWT_SECRET` en producción
- ⚠️ Usa variables de entorno para credenciales
- ⚠️ Valida todas las entradas en backend

### Performance
- Usa índices en MongoDB para queries frecuentes
- Implementa paginación para listas grandes
- Cachea datos cuando sea posible
- Optimiza imágenes

### Base de Datos
- Haz backups regularmente
- Usa MongoDB Atlas para producción
- Configura índices apropiados
- Monitorea el crecimiento de datos

---

## 📞 Soporte y Contacto

Si encuentras problemas:

1. Verifica el [Troubleshooting](#troubleshooting)
2. Revisa la [Documentación](docs/)
3. Abre un issue en GitHub
4. Contacta al equipo de desarrollo

---

## 📄 Licencia

Este proyecto es privado y propiedad de [Tu Empresa]. 

---

## ✅ Checklist para Nuevos Compañeros

- [ ] Cloné el repositorio
- [ ] Instalé Node.js v16+
- [ ] Instalé MongoDB (local o Atlas)
- [ ] Ejecuté `npm install` en backend y frontend
- [ ] Creé archivos `.env` desde `.env.example`
- [ ] Ejecuté `npm run seed` en backend
- [ ] Ejecuté `npm run dev` en backend (Puerto 5000)
- [ ] Ejecuté `npm run dev` en frontend (Puerto 3000)
- [ ] Accedí a http://localhost:3000
- [ ] Probé login con credenciales de prueba
- [ ] Creé una rama para trabajar

---

**¡Bienvenido al proyecto!** 🚀

Si tienes dudas, pregunta a tu compañero de equipo o abre un issue en GitHub.
