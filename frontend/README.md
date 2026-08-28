# Frontend del sistema de mantenimiento

Interfaz React y Vite del sistema de gestión de mantenimiento.

## Modo de ejecución

El frontend no se inicia por separado para el uso normal. Desde la raíz del repositorio se ejecuta:

```text
INICIAR_RED_LOCAL.cmd
```

Ese iniciador instala las dependencias, genera `frontend/dist` y hace que el backend publique la interfaz y la API desde la misma dirección de red local en el puerto 5050.

Ejemplo:

```text
http://192.168.1.9:5050
```

De esta forma, los teléfonos y computadores conectados al mismo Wi-Fi utilizan una sola dirección y no requieren instalar el frontend.

## Compilación manual para desarrollo

```powershell
npm install
npm run build
```

## Estructura

```text
src/
├── components/     Componentes reutilizables
├── context/        Autenticación y estado compartido
├── hooks/          Comportamiento reutilizable y actualización automática
├── pages/          Login, tickets, usuarios y dashboard
├── services/       Cliente de la API
├── App.jsx         Rutas principales
└── main.jsx        Punto de entrada
```

## Funciones

- Autenticación con JWT.
- Gestión de tickets y usuarios según el rol.
- Historial, filtros por fecha y dashboard.
- Actualización automática de los datos visibles.
- Diseño adaptable para teléfono, tablet y computador.
