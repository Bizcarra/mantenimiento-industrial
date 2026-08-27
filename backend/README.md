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

Para una configuración completa, copia `.env.example`. En producción configura además:

- `CORS_ORIGINS`: URL exacta del frontend; admite varias separadas por comas.
- `JWT_SECRET`: valor aleatorio de 32 caracteres o más.
- `ENFORCE_HTTPS=true`: después de confirmar que el proxy envía `X-Forwarded-Proto`.
- `TRUST_PROXY=1`: cuando Railway sea el único proxy delante de Express.
- `ALLOW_PUBLIC_REGISTRATION=false`: las cuentas se crean desde el panel administrador.
- `USER_EMAIL_DOMAIN=mantenimiento.local`: dominio usado para sugerir identificadores internos
  editables. Cámbialo por el dominio real de la empresa si corresponde.

Nunca expongas `MONGODB_URI` en el frontend ni lo subas a Git. En MongoDB Atlas usa un
usuario exclusivo con permisos únicamente sobre esta base de datos y limita el acceso de
red a los orígenes de despliegue que realmente lo necesiten.

## Iniciar base de datos

Asegúrate de tener MongoDB corriendo localmente, luego ejecuta:

```bash
npm run seed -- --confirm-reset-local-data
```

El seed borra los datos actuales. Solo puede ejecutarse fuera de producción y exige el
argumento de confirmación mostrado arriba.

Para una base nueva en producción, crea el primer administrador sin cargar datos de prueba:

```bash
ADMIN_NAME="Administrador" ADMIN_EMAIL="admin@empresa.com" ADMIN_PASSWORD="una-clave-larga" npm run create-admin
```

En Railway configura esas tres variables temporalmente, ejecuta `npm run create-admin` y
elimina inmediatamente `ADMIN_PASSWORD`. El comando se bloquea si ya existe un administrador.

## Ejecutar

Desarrollo:
```bash
npm run dev
```

Producción:
```bash
npm start
```

## Seguridad incorporada

- Helmet y políticas CSP para cabeceras HTTP seguras.
- CORS mediante lista explícita de orígenes.
- Límites generales y límites estrictos para login/registro.
- Rechazo de operadores NoSQL, claves peligrosas y parámetros duplicados.
- JSON limitado a 20 KB y URLs limitadas a 2048 caracteres.
- JWT firmado con algoritmo, emisor y audiencia fijos; duración predeterminada de 8 horas.
- Invalidación de sesiones al cambiar una contraseña.
- Autorización por rol, propietario y técnico asignado para evitar accesos por ID.
- Errores públicos genéricos, sin trazas ni detalles de MongoDB.
- Seed y borrado total bloqueados en producción.

Ejecuta periódicamente:

```bash
npm run audit:security
npm test
```

## Endpoints

### Autenticación
- `POST /api/auth/registro` - Registro público opcional (deshabilitado por defecto)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obtener usuario actual

### Usuarios (solo administrador)
- `GET /api/users` - Buscar y filtrar usuarios
- `GET /api/users/sugerir-email` - Sugerir un email interno único desde nombre y apellido
- `POST /api/users` - Crear usuario
- `PATCH /api/users/:id` - Modificar datos, rol, contraseña o estado
- `DELETE /api/users/:id` - Eliminar usuario sin historial asociado

### Tickets
- `GET /api/tickets` - Listar tickets; admite estado, prioridad, área, `fechaDesde` y `fechaHasta`
- `POST /api/tickets` - Crear nuevo ticket
- `DELETE /api/tickets/:id` - Eliminar definitivamente un ticket y su historial (admin)
- `GET /api/tickets/:id` - Obtener ticket y su historial
- `PATCH /api/tickets/:id/asignar` - Asignar a técnico
- `PATCH /api/tickets/:id/estado` - Cambiar estado
- `PATCH /api/tickets/:id/prioridad` - Cambiar prioridad
- `PATCH /api/tickets/:id/solucion` - Registrar solución

### Dashboard
- `GET /api/dashboard/stats` - Resúmenes, gráficos y tiempo promedio; admite rango de fechas (admin)
- `GET /api/dashboard/tecnicos-desempenio` - Desempeño de técnicos por período (admin)
