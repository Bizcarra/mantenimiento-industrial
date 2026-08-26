# 🚀 Guía de Inicio Rápido

## Requisitos Previos

- Node.js 16+ instalado
- MongoDB corriendo localmente (o en la nube)
- Git (opcional)

## 1️⃣ Clonar el Repositorio

```bash
# Clona el repositorio
git clone <URL_DEL_REPOSITORIO>

# Navega al proyecto
cd mantenimiento-industrial
```

## 2️⃣ Configurar Backend

### Instalar dependencias
```bash
cd backend
npm install
```

**Si obtienes errores de versión**, limpia el cache e instala de nuevo:

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

### Configurar variables de entorno
Verifica que el archivo `.env` exista:

**Linux/macOS:**
```bash
cat .env
```

**Windows (PowerShell):**
```powershell
Get-Content .env
```

Debería verse así:
```
MONGODB_URI=mongodb://localhost:27017/mantenimiento
JWT_SECRET=tu_secret_jwt_muy_seguro_aqui
PORT=5000
NODE_ENV=development
```

**⚠️ IMPORTANTE:** Si clonaste desde el repositorio y el `.env` no está:

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

**Windows (Alternativa - usando Notepad):**
1. Abre la carpeta `backend` en el explorador
2. Click derecho → Nuevo → Archivo de texto
3. Renómbralo a `.env`
4. Click derecho → Abrir con → Notepad
5. Pega el contenido anterior

**Si usas MongoDB en la nube (Atlas):**
```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/mantenimiento
```

### Inicializar base de datos

Primero, **asegúrate de que MongoDB está corriendo**:

**Linux/macOS:**
```bash
mongosh
# Si ves el prompt de MongoDB, presiona Ctrl+C para salir
```

**Windows (CMD o PowerShell):**
```cmd
mongosh
```

**Si no está instalado:**
- Descárgalo de [mongodb.com](https://www.mongodb.com/try/download/community)
- O usa [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (nube, gratuito)

**macOS (con Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Luego, corre el seed para crear datos de prueba:
```bash
npm run seed
```

Deberías ver:
```
✓ 5 usuarios creados
✓ 5 tickets creados
✓ Base de datos inicializada exitosamente
```

### Iniciar servidor backend

En la carpeta `backend`, ejecuta:
```bash
npm run dev
```

Verás:
```
Servidor ejecutándose en puerto 5000
MongoDB conectado: localhost
```

**Endpoint de prueba:**

**Linux/macOS:**
```bash
curl http://localhost:5000/api/health
```

**Windows (PowerShell):**
```powershell
Invoke-WebRequest http://localhost:5000/api/health
```

Debería responder: `{"status":"API funcionando correctamente"}`

---

## 3️⃣ Configurar Frontend

### En **otra terminal**, navega a frontend

```bash
# Desde la raíz del proyecto (mantenimiento-industrial)
cd frontend
npm install
```

**Si tienes errores similares al backend:**

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

### Verificar configuración de API

El archivo `src/services/api.js` debe tener:
```javascript
export const apiClient = axios.create({
  baseURL: '/api',
});
```

Esto asegura que el frontend use el proxy configurado en `vite.config.js`.

### Iniciar servidor frontend

```bash
npm run dev
```

Verás:
```
  ➜  Local:   http://localhost:3000/
  ➜  press h + enter to show help
```

---

## ✅ Acceso a la Aplicación

Abre en tu navegador: **http://localhost:3000**

### Credenciales de Prueba

Elige una para probar:

**👨‍💼 Admin** (acceso total + dashboard)
- Email: `admin@mantenimiento.com`
- Contraseña: `admin123`

**🔧 Técnico** (gestionar tickets asignados)
- Email: `juan@mantenimiento.com`
- Contraseña: `tecnico123`

**📝 Solicitante** (crear y ver tickets)
- Email: `pedro@empresa.com`
- Contraseña: `user123`

---

## 🎯 Próximos Pasos en la App

### Como Solicitante:
1. Haz login con `pedro@empresa.com`
2. Click "➕ Nuevo Ticket"
3. Completa: Título, Descripción, Área, Prioridad
4. Click "Crear Ticket"
5. Verás tu ticket en la lista

### Como Admin:
1. Haz login con `admin@mantenimiento.com`
2. Abre un ticket desde la lista
3. En "Cambiar Estado" → selecciona "en_progreso"
4. En "Cambiar Prioridad" → cambia a "alta"
5. Ve a "Dashboard" (menú) para ver estadísticas

### Como Técnico:
1. Haz login con `juan@mantenimiento.com`
2. Verás tickets asignados a ti
3. Abre un ticket
4. Cambia estado a "en_progreso" o "resuelto"
5. Registra la solución en el formulario

---

## 🐛 Troubleshooting

### "Git Clone" - Repositorio no encontrado
```bash
# Asegúrate de reemplazar con la URL correcta de tu repositorio
git clone https://github.com/tu-usuario/tu-repositorio.git
cd mantenimiento-industrial
```

### "npm install" - Conflictos de versión
```bash
# Limpia completamente e instala de nuevo
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### "MongoDB connection refused"
```bash
# Asegúrate de tener MongoDB corriendo
mongosh  # Deberías ver el prompt de MongoDB

# Si no está instalado, instálalo primero
# En Ubuntu/Debian:
sudo apt-get install -y mongodb

# Inicia el servicio
sudo systemctl start mongodb
```

### "EADDRINUSE: address already in use :::5000"
El puerto 5000 está en uso. Cierra otras aplicaciones o cambia el puerto en `.env`:
```
PORT=5001
```

Luego actualiza el frontend en `.env`:
```
VITE_API_URL=http://localhost:5001
```

### "Module not found: axios" o similar
```bash
# Ejecuta en la carpeta correspondiente (backend o frontend)
npm install
```

### "Error al cargar tickets: 404"
Este error indica que la API no responde correctamente. Verifica:

1. **Backend está corriendo en puerto 5000:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Frontend está usando la URL correcta:**
   - Verifica que `src/services/api.js` tenga `baseURL: '/api'`
   - No debe ser `http://localhost:5000`

3. **Vite está ejecutándose en puerto 3000:**
   ```bash
   # El comando debería mostrar:
   # ➜  Local:   http://localhost:3000/
   ```

4. **CORS está habilitado en backend:**
   - Verifica que `server.js` tenga `app.use(cors());`

### Datos de prueba no aparecen
```bash
# Ejecuta el seed nuevamente
cd backend
npm run seed
```

### "Cannot find module" después de clonar
```bash
# Reinstala dependencias
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Frontend muestra errores de rutas
Si ves errores como "404 Not Found" o rutas incorrectas:

1. **Verifica que ambos servidores estén corriendo:**
   - Backend: `http://localhost:5000` 
   - Frontend: `http://localhost:3000`

2. **Revisa la consola del navegador (F12):**
   - Busca errores de red en la pestaña "Network"
   - Los requests a `/api/*` deben ir a `localhost:5000`

3. **Borra caché del navegador:**
   - Presiona `Ctrl+Shift+Del` (o `Cmd+Shift+Del` en Mac)
   - Borra caché de los últimos 24 horas
   - Recarga la página

### "ReferenceError: export is not defined"
Este error puede ocurrir si las extensiones de archivo no son correctas:
```bash
# Verifica que los archivos tengan la extensión correcta
# Backend: .js
# Frontend: .jsx para componentes React

# Si reciben errores, actualiza los imports a:
import express from 'express';
export default router;
```

---

## 📁 Estructura de Carpetas

```
Plataforma Web/
├── backend/
│   ├── models/         ← Esquemas de BD
│   ├── routes/         ← Endpoints API
│   ├── middleware/     ← Autenticación
│   ├── config/         ← Configuración
│   ├── seeds/          ← Datos de prueba
│   ├── server.js       ← Servidor principal
│   ├── .env            ← Variables (configurar aquí)
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── pages/      ← Pantallas (Login, Tickets, Dashboard)
│   │   ├── components/ ← Componentes reutilizables
│   │   ├── context/    ← Estado global (Auth)
│   │   ├── services/   ← Cliente API
│   │   └── App.jsx     ← Ruteo principal
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
│
└── README.md           ← Este archivo
```

---

## 🔑 Conceptos Clave

### Autenticación JWT
- Login devuelve token JWT
- Token se guarda en `localStorage`
- Se envía en cada request (header: `Authorization: Bearer <token>`)
- Token expira en 7 días

### Roles y Permisos
- **Admin**: Acceso completo + Dashboard
- **Técnico**: Gestiona tickets asignados
- **Solicitante**: Crea y ve sus tickets

### Estados de Ticket
- `abierto` - Recién creado
- `en_progreso` - Técnico trabajando
- `pausado` - En espera
- `resuelto` - Completado
- `cerrado` - Archivado

### Prioridades
- `baja` - Verde 🟢
- `media` - Naranja 🟠
- `alta` - Rojo 🔴
- `critica` - Púrpura 🟣

---

## 📊 Demo del Sistema

### Escenario típico:

1. **Pedro (Solicitante)** crea ticket: "Bomba hidráulica con fuga"
   - Sistema registra: creación en historial
   
2. **Admin** ve ticket en la lista, lo asigna a Juan (Técnico)
   - Sistema registra: asignación en historial
   
3. **Juan (Técnico)** cambia estado a "en_progreso"
   - Sistema registra: cambio de estado con timestamp
   
4. **Juan** cambia a "resuelto" y registra solución
   - Sistema actualiza: fecha de resolución, historial
   
5. **Admin** ve en Dashboard:
   - Total de tickets, tiempo promedio, desempeño de técnicos
   - Gráficos por prioridad y área

---

## 💡 Tips

- **Filtros**: Usa los dropdowns para filtrar por estado, prioridad
- **Historial**: Haz click en cualquier ticket para ver su historial completo
- **Dashboard**: Solo admin puede verlo (menú superior)
- **Logout**: Botón en la navbar superior derecha

---

## 🆘 ¿Necesitas ayuda?

1. Revisa los README en `/backend` y `/frontend`
2. Verifica la consola del navegador (F12) para errores
3. Revisa los logs del servidor en terminal

---

**¡Listo! Ya tienes un MVP completo de Gestión de Mantenimiento Industrial funcionando.** 🎉
