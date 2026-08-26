# 🚀 Guía de Inicio Rápido

## Requisitos Previos

- Node.js 16+ instalado
- MongoDB corriendo localmente (o en la nube)
- Git (opcional)

## 1️⃣ Clonar/Descargar Proyecto

```bash
cd "Plataforma Web"
```

## 2️⃣ Configurar Backend

### Instalar dependencias
```bash
cd backend
npm install
```

**Si obtienes error de versión**, usa las versiones correctas para 2026:
```bash
npm install express@4.21.0 mongoose@8.5.0 jsonwebtoken@9.1.0 bcryptjs@2.4.3 dotenv@16.4.0 cors@2.8.5 express-validator@7.2.0 nodemon@3.1.0 --save
```

### Configurar variables de entorno
El archivo `.env` ya está configurado con valores por defecto:

```
MONGODB_URI=mongodb://localhost:27017/mantenimiento
JWT_SECRET=tu_secret_jwt_muy_seguro_aqui
PORT=5000
NODE_ENV=development
```

**Si usas MongoDB en la nube (Atlas):**
```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/mantenimiento
```

### Inicializar base de datos

Primero, **asegúrate de que MongoDB está corriendo**:

```bash
# Prueba conexión
mongosh
```

Luego, corre el seed:
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

```bash
npm run dev
```

Verás:
```
Servidor ejecutándose en puerto 5000
MongoDB conectado: localhost
```

**Endpoint de prueba:** http://localhost:5000/api/health

---

## 3️⃣ Configurar Frontend

### En otra terminal, navega a frontend

```bash
cd frontend
npm install
```

### Iniciar servidor frontend

```bash
npm run dev
```

Verás:
```
  ➜  Local:   http://localhost:3000/
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

### "MongoDB connection refused"
```bash
# Asegúrate de tener MongoDB corriendo
mongosh  # Deberías ver el prompt de MongoDB
```

### "EADDRINUSE: address already in use :::5000"
El puerto 5000 está en uso. Cierra otras aplicaciones o cambia el puerto en `.env`:
```
PORT=5001
```

### "Module not found: axios"
Ejecuta en la carpeta correspondiente:
```bash
npm install
```

### Datos de prueba no aparecen
Ejecuta nuevamente:
```bash
cd backend
npm run seed
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
