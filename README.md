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
# Clona el repositorio
git clone https://github.com/tu-usuario/mantenimiento-industrial.git

# Navega al proyecto
cd mantenimiento-industrial
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
```

**Si obtienes errores de versión o módulos faltantes:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

**Si tienes errores similares:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## ⚙️ Configuración

### Backend - Variables de Entorno

1. **Si clonaste desde el repositorio**, verifica que el archivo `.env` exista:

```bash
cd backend
```

**Linux/macOS:**
```bash
cat .env
```

**Windows (PowerShell):**
```powershell
Get-Content .env
```

2. **Si no existe el archivo `.env`**, créalo:

**Linux/macOS:**
```bash
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/mantenimiento
JWT_SECRET=tu_secret_jwt_muy_seguro_aqui
PORT=5000
NODE_ENV=development
EOF
```

**Windows (PowerShell):**
```powershell
@"
MONGODB_URI=mongodb://localhost:27017/mantenimiento
JWT_SECRET=tu_secret_jwt_muy_seguro_aqui
PORT=5000
NODE_ENV=development
"@ | Out-File -Encoding UTF8 .env
```

**Windows (CMD) o cualquier editor:**
- Abre la carpeta `backend`
- Click derecho → Nuevo → Archivo de texto
- Renómbralo a `.env`
- Abre con Notepad y pega el contenido anterior

3. **Edita el archivo `.env` con tus valores** (si es necesario):

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

1. **Verifica que el archivo `.env` exista**:

```bash
cd ../frontend
```

**Linux/macOS:**
```bash
cat .env
```

**Windows (PowerShell):**
```powershell
Get-Content .env
```

2. **Asegúrate de que contenga:**

```env
VITE_API_URL=http://localhost:5000
```

⚠️ **IMPORTANTE:** El frontend debe usar `/api` como baseURL en `src/services/api.js`:
```javascript
export const apiClient = axios.create({
  baseURL: '/api',
});
```

Esto permite que el proxy de Vite redirija correctamente al backend.

---

## 🚀 Ejecución

### Paso 0: Asegúrate de que MongoDB esté corriendo

```bash
# Si MongoDB está instalado localmente
mongosh

# Deberías ver el prompt de MongoDB
# Escribe "exit" para salir
```

**Si no está instalado:**
- Descárgalo de [mongodb.com](https://www.mongodb.com/try/download/community)
- O usa [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (nube, gratuito)

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Verás:
```
Servidor ejecutándose en puerto 5000
MongoDB conectado: localhost
```

**Verifica que funciona:**
```bash
curl http://localhost:5000/api/health
# Respuesta: {"status":"API funcionando correctamente"}
```

### Terminal 2 - Inicializar Base de Datos (Primera vez)

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

### Terminal 3 - Frontend

```bash
cd frontend
npm run dev
```

Verás:
```
➜  Local:   http://localhost:3000/
➜  press h + enter to show help
```

### Acceder a la Aplicación

Abre tu navegador en:
```
http://localhost:3000
```

✅ **Debería funcionar sin errores 404**

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

### "Git Clone" - Repositorio no encontrado

```bash
# Asegúrate de reemplazar con la URL correcta de tu repositorio
git clone https://github.com/tu-usuario/tu-repositorio.git
cd mantenimiento-industrial
```

### "npm install" - Conflictos de versión o módulos faltantes

**Linux/macOS:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm cache clean --force
npm install
```

**Hazlo en ambas carpetas (backend y frontend) si es necesario.**

### "MongoDB connection refused"

**Linux/macOS:**
```bash
mongosh
# Deberías ver el prompt de MongoDB
# Escribe "exit" para salir
```

**Windows (CMD o PowerShell):**
```cmd
mongosh
```

**Si no está instalado:**
- Descárgalo de [mongodb.com](https://www.mongodb.com/try/download/community)
- O usa [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (nube, gratuito)

**Para instalar en Windows:**
- Descarga el instalador `.msi`
- Ejecuta y sigue el asistente
- MongoDB se instalará como servicio

**Para instalar en macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### "EADDRINUSE: address already in use :::5000"

El puerto 5000 está en uso. Tienes dos opciones:

**Opción 1:** Cierra la otra aplicación que usa el puerto

**Opción 2:** Cambia el puerto en `.env`:
```
PORT=5001
```

Luego actualiza el frontend en `.env`:
```
VITE_API_URL=http://localhost:5001
```

### "Module not found: axios" o similar

```bash
# Ejecuta en la carpeta que falta (backend o frontend)
npm install
```

### "Error al cargar tickets: 404" o "Cannot GET /api/tickets"

Este es el error más común después de clonar. Verifica:

1. **Backend está corriendo en puerto 5000:**

**Linux/macOS/Windows:**
```bash
curl http://localhost:5000/api/health
# O en Windows PowerShell:
Invoke-WebRequest http://localhost:5000/api/health
```

Debería responder: `{"status":"API funcionando correctamente"}`

2. **Frontend está usando la URL correcta:**
   - Verifica que `src/services/api.js` tenga:
   ```javascript
   export const apiClient = axios.create({
     baseURL: '/api',  // ← Debe ser '/api', NO 'http://localhost:5000'
   });
   ```

3. **Vite está ejecutándose en puerto 3000:**
   - Verifica que veas en terminal:
   ```bash
   ➜  Local:   http://localhost:3000/
   ```

4. **CORS está habilitado en backend:**
   - Verifica que `server.js` tenga:
   ```javascript
   app.use(cors());
   ```

5. **Limpia caché del navegador:**
   - **Windows/Linux**: Presiona `Ctrl+Shift+Del`
   - **macOS**: Presiona `Cmd+Shift+Del`
   - Borra caché de los últimos 24 horas
   - Recarga la página

### "Cannot find module" después de clonar

**Linux/macOS:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Windows (PowerShell):**
```powershell
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm cache clean --force
npm install

cd ../frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm cache clean --force
npm install
```

### Frontend muestra errores de rutas (404, rutas incorrectas)

1. **Verifica que ambos servidores estén corriendo:**
   - Backend: http://localhost:5000/api/health ✅
   - Frontend: http://localhost:3000 ✅

2. **Revisa la consola del navegador:**
   - **Windows/Linux**: Presiona `F12` → "Network" tab
   - **macOS**: Presiona `Cmd+Option+I` → "Network" tab
   - Los requests a `/api/*` deben ir a `localhost:5000`
   - Si ves `/5000/` en la URL, hay un problema de configuración

3. **Borra caché y cookies:**
   - **Windows/Linux**: `Ctrl+Shift+Del`
   - **macOS**: `Cmd+Shift+Del`
   - Marca todo y limpia
   - Recarga la página (`Ctrl+R` o `Cmd+R`)

### Datos de prueba no aparecen

```bash
cd backend
npm run seed
```

### "ReferenceError: export is not defined"

Verifica que los archivos tengan las extensiones correctas:
- Backend: `.js`
- Frontend: `.jsx` para componentes React

Los imports también deben ser correctos:
```javascript
// ✅ Correcto (ES Modules)
import express from 'express';
export default router;

// ❌ Incorrecto (CommonJS)
const express = require('express');
module.exports = router;
```

### En Windows: "node no se reconoce como comando"

Node.js no está instalado o no está en el PATH:

1. Descarga e instala Node.js desde [nodejs.org](https://nodejs.org/)
2. Reinicia tu terminal/PowerShell
3. Verifica: `node --version`

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
