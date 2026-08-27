# Uso en red local y traslado a otra PC

## Varios usuarios en el mismo Wi-Fi

Solo una PC funciona como anfitriona. En esa PC:

1. Inicia MongoDB.
2. Ejecuta una vez `CONFIGURAR_FIREWALL_RED_LOCAL.cmd` y acepta el permiso de
   administrador. La regla permite únicamente TCP 5050 desde la subred privada.
3. Si estaba abierto el modo normal, cierra sus terminales Backend y Frontend.
4. Ejecuta `INICIAR_RED_LOCAL.cmd`.
5. Comparte la dirección mostrada, por ejemplo `http://192.168.1.20:5050`.

Los demás computadores, teléfonos o tablets conectados al mismo Wi-Fi solo
abren esa dirección en el navegador. No necesitan Node.js, MongoDB ni una copia
del proyecto.

La red Wi-Fi de Windows debe estar marcada como **Privada**. Este modo usa HTTP
local y no debe exponerse directamente a Internet ni utilizarse en una red
pública. Todos los usuarios comparten la base de datos de la PC anfitriona, pero
cada uno inicia sesión con su propia cuenta.

El iniciador compila el frontend y lo sirve desde Express. De esta forma solo se
publica el puerto 5050 y no se expone el servidor de desarrollo de Vite. El modo
normal puede seguir usando el puerto 5000 al mismo tiempo.

## Llevar el sistema a otra PC anfitriona

Ejecuta `CREAR_PAQUETE_PARA_OTRA_PC.cmd`. Se crea un ZIP dentro de `paquetes`.
Ese archivo excluye deliberadamente:

- `backend/.env` y secretos;
- la base de datos MongoDB;
- `node_modules` y archivos compilados;
- el historial interno de Git y archivos de registro.

En la nueva PC:

1. Instala Node.js LTS y MongoDB Community Server.
2. Descomprime el ZIP.
3. Ejecuta `CREAR_ACCESO_DIRECTO.cmd` o `CREAR_ACCESO_RED_LOCAL.cmd`.
4. Inicia MongoDB y abre el acceso directo creado.

Si `backend/.env` no existe, el iniciador lo genera con MongoDB local y una
clave JWT aleatoria. Las dependencias se descargan automáticamente con npm.

La base de datos real no se incluye porque puede contener usuarios y datos
privados. Para trasladarla hay que realizar una copia protegida con
`mongodump`/`mongorestore` por separado.
