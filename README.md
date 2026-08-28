# Sistema de Gestión de Mantenimiento Industrial

Aplicación web para crear, asignar y dar seguimiento a solicitudes de mantenimiento. El sistema funciona únicamente en modo de red local: una laptop actúa como servidor y los demás equipos o teléfonos acceden desde el mismo Wi-Fi.

## Funciones principales

- Gestión de tickets con estados, prioridades, áreas, fechas e historial.
- Una foto opcional del daño tomada desde la cámara o elegida desde el dispositivo.
- Roles de administrador, técnico y solicitante.
- Creación y administración de usuarios.
- Dashboard con resúmenes, gráficos y tiempo promedio de resolución.
- Actualización automática de la información mientras la aplicación permanece abierta.
- Interfaz adaptable para computador, tablet y teléfono.
- Autenticación con JWT, contraseñas cifradas, validación de datos y permisos por rol.
- Retención automática: los tickets finalizados se eliminan después de tres meses.

## Funcionamiento por red local

La laptop servidor ejecuta MongoDB, el backend y el frontend compilado. Todo se publica desde una sola dirección, por ejemplo:

```text
http://192.168.1.9:5050
```

Los demás dispositivos no deben instalar el proyecto. Solo necesitan:

1. Estar conectados al mismo Wi-Fi que la laptop servidor.
2. Abrir en el navegador el enlace mostrado por el iniciador o escanear su código QR.
3. Mantener encendida la laptop y abierta la ventana del servidor.

La IP depende de la red Wi-Fi. El iniciador la detecta automáticamente, muestra el enlace y genera nuevamente el QR cuando cambia.

## Requisitos de la laptop servidor

- Windows 10 u 11.
- Node.js 20.9 o superior y npm.
- MongoDB instalado y ejecutándose, o una conexión configurada a MongoDB Atlas.
- Git, si se desea descargar actualizaciones automáticamente.
- Una red Wi-Fi privada.

## Primera configuración

### 1. Descargar el proyecto

```powershell
git clone <URL_DEL_REPOSITORIO>
cd mantenimiento-industrial
```

No es necesario ejecutar `npm install` manualmente: el iniciador de red local instala o actualiza las dependencias.

### 2. Configurar MongoDB

Si se usa MongoDB local, el servicio debe estar iniciado. La configuración predeterminada utiliza:

```text
mongodb://localhost:27017/mantenimiento
```

Si `backend/.env` no existe, el iniciador lo crea desde `backend/.env.example` y genera un secreto JWT. Para utilizar MongoDB Atlas, edita `MONGODB_URI` en `backend/.env`.

### 3. Autorizar el firewall una sola vez

Haz clic derecho sobre:

```text
CONFIGURAR_FIREWALL_RED_LOCAL.cmd
```

Selecciona **Ejecutar como administrador**. La regla permite el puerto 5050 únicamente para perfiles de red privada.

### 4. Cargar datos de prueba (opcional)

Este comando borra los datos locales existentes antes de crear los usuarios y tickets de prueba:

```powershell
cd backend
npm run seed -- --confirm-reset-local-data
cd ..
```

No lo ejecutes sobre una base de datos que contenga información que necesites conservar.

## Iniciar la aplicación

Desde la raíz del proyecto, ejecuta:

```text
INICIAR_RED_LOCAL.cmd
```

El proceso realiza lo siguiente:

1. Comprueba Node.js, npm, Git y la estructura del proyecto.
2. Busca actualizaciones con Git cuando la copia local permite hacerlo de forma segura.
3. Instala las dependencias del backend y frontend.
4. Compila el frontend.
5. Detecta la dirección IPv4 privada de la red actual.
6. Inicia la aplicación en el puerto 5050 para todos los dispositivos de la red.
7. Muestra el enlace y un código QR para ingresar.
8. Vigila los cambios de IP y actualiza el enlace y el QR automáticamente.

La prueba de salud del servidor queda disponible en:

```text
http://IP-DE-LA-LAPTOP:5050/api/health
```

## Acceso directo opcional

`CREAR_ACCESO_RED_LOCAL.cmd` crea en el escritorio un acceso directo que abre directamente el mismo modo de red local. No crea ni inicia un modo separado.

## Foto de evidencia y almacenamiento

Al crear un ticket se puede adjuntar una sola foto opcional. En celulares y tablets, el selector permite abrir la cámara trasera o escoger una imagen existente.

- Formatos permitidos: JPG y PNG.
- Tamaño máximo: 5 MB.
- Máximo: 40 megapíxeles.
- La ubicación EXIF, comentarios y otros metadatos privados se eliminan antes de guardar.
- La orientación EXIF se aplica físicamente antes de eliminar los metadatos, por lo que las fotos verticales conservan su posición correcta.
- El contenido se valida realmente; no se confía solamente en la extensión del archivo.
- La foto recibe un nombre aleatorio y una huella SHA-256 para comprobar su integridad.
- Solo el administrador, el solicitante propietario y el técnico asignado pueden solicitarla con una sesión válida.

Las evidencias antiguas que fueron guardadas sin orientación pueden corregirse con los botones **Girar izquierda** y **Girar derecha** disponibles en el detalle del ticket.

Las fotos se almacenan en `backend/storage/ticket-images`, una carpeta privada que no se publica directamente ni se incluye en Git. Para una copia de seguridad completa deben respaldarse tanto MongoDB como `backend/storage`.

## Eliminación automática después de tres meses

Cuando un ticket cambia a **Resuelto** o **Cerrado**, el sistema calcula una fecha de eliminación de tres meses calendario. Al llegar esa fecha se eliminan automáticamente:

- El ticket.
- Su historial de cambios.
- Su foto de evidencia, si existe.

La limpieza se ejecuta al iniciar el servidor y después cada hora. Si la laptop estaba apagada al vencer el plazo, el ticket se elimina la próxima vez que el servidor inicie. Si un ticket finalizado vuelve a abrirse, su eliminación se cancela; al resolverlo nuevamente comienza un nuevo período de tres meses.

## Credenciales de prueba

Estas cuentas existen solamente después de ejecutar el seed:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@mantenimiento.com` | `admin123` |
| Técnico | `juan@mantenimiento.com` | `tecnico123` |
| Técnico | `maria@mantenimiento.com` | `tecnico123` |
| Solicitante | `pedro@empresa.com` | `user123` |
| Solicitante | `laura@empresa.com` | `user123` |

Cambia estas contraseñas si la aplicación se utilizará con información real.

## Solución de problemas

### El teléfono no puede abrir el enlace

- Confirma que ambos dispositivos estén en el mismo Wi-Fi.
- Usa una red marcada como **Privada** en Windows.
- Ejecuta una vez `CONFIGURAR_FIREWALL_RED_LOCAL.cmd` como administrador.
- Evita redes de invitados, porque suelen impedir la comunicación entre dispositivos.
- Comprueba que la terminal del servidor siga abierta.

### El puerto 5050 está ocupado

Cierra cualquier ventana anterior de `INICIAR_RED_LOCAL.cmd` y vuelve a iniciar. Solo debe existir una instancia del servidor.

### MongoDB no conecta

Comprueba que el servicio de MongoDB esté funcionando o revisa `MONGODB_URI` en `backend/.env`.

### La IP cambió

El iniciador la revisa periódicamente. Cuando detecta el cambio, muestra el nuevo enlace y reemplaza el QR. Usa siempre el enlace más reciente de la terminal.

## Seguridad de red

- Utiliza el sistema solamente en una red privada y confiable.
- No abras ni redirijas el puerto 5050 desde el router hacia Internet.
- No compartas el archivo `backend/.env` ni lo subas al repositorio.
- No publiques la carpeta `backend/storage` como contenido estático.
- Mantén Node.js, MongoDB y las dependencias actualizados.
- Realiza copias de seguridad de la base de datos y de las fotos antes de su vencimiento.

## Estructura principal

```text
mantenimiento-industrial/
├── backend/                         API, seguridad y acceso a MongoDB
│   └── storage/ticket-images/       Fotos privadas creadas durante el uso
├── frontend/                        Interfaz React compilada por Vite
├── scripts/
│   ├── Iniciar-RedLocal.ps1         Inicio, detección de IP y código QR
│   └── Configurar-FirewallRedLocal.ps1
├── INICIAR_RED_LOCAL.cmd            Iniciador principal
├── CREAR_ACCESO_RED_LOCAL.cmd       Acceso directo opcional al modo de red
└── CONFIGURAR_FIREWALL_RED_LOCAL.cmd
```

## Comprobaciones para desarrollo

```powershell
cd backend
npm test

cd ../frontend
npm run build
```

Para el uso normal de la aplicación no se levantan servidores separados en los puertos 3000 y 5000; `INICIAR_RED_LOCAL.cmd` sirve la interfaz y la API desde el puerto 5050.
