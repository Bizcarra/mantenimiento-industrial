# Backend - Sistema de Gestión de Mantenimiento

API REST para gestión de solicitudes y tickets de mantenimiento industrial.

## Instalación

```bash
npm install
```

## Variables de entorno

Crear archivo `.env` (copiar de `.env.example`):

```
MONGODB_URI=mongodb://localhost:27017/mantenimiento
JWT_SECRET=tu_secret_jwt_muy_seguro_aqui
PORT=5000
NODE_ENV=development
```

## Iniciar base de datos

Asegúrate de tener MongoDB corriendo localmente, luego ejecuta:

```bash
npm run seed
```

## Ejecutar

Desarrollo:
```bash
npm run dev
```

Producción:
```bash
npm start
```

## Endpoints

### Autenticación
- `POST /api/auth/registro` - Registrar nuevo usuario
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obtener usuario actual

### Tickets
- `GET /api/tickets` - Listar tickets (con filtros)
- `POST /api/tickets` - Crear nuevo ticket
- `GET /api/tickets/:id` - Obtener ticket y su historial
- `PATCH /api/tickets/:id/asignar` - Asignar a técnico
- `PATCH /api/tickets/:id/estado` - Cambiar estado
- `PATCH /api/tickets/:id/prioridad` - Cambiar prioridad
- `PATCH /api/tickets/:id/solucion` - Registrar solución

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas generales (admin)
- `GET /api/dashboard/tecnicos-desempenio` - Desempeño de técnicos (admin)
