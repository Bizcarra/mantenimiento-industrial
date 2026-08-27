# Acceso directo de inicio local

En Windows, ejecuta una sola vez `CREAR_ACCESO_DIRECTO.cmd`. Esto crea en el
escritorio el acceso **Mantenimiento Industrial**.

Al abrirlo, el iniciador realiza estas acciones:

1. Comprueba que Git, Node.js, npm y `backend/.env` estén disponibles.
2. Ejecuta `git pull --ff-only` para descargar actualizaciones sin sobrescribir
   cambios locales mediante una fusión automática.
3. Ejecuta `npm install` en `backend` y `frontend`.
4. Abre el backend y el frontend en terminales separadas.
5. Comprueba `http://127.0.0.1:5000/api/health`.
6. Espera a que el frontend responda y abre `http://127.0.0.1:3000` en el
   navegador predeterminado.

## Base de datos de prueba

Durante el inicio se pregunta si deseas ejecutar el seed. Escribe exactamente
`INICIALIZAR` solo la primera vez o cuando quieras borrar y recrear los datos
locales. Presiona Enter para conservar la base de datos actual.

MongoDB debe estar iniciado antes de abrir la aplicación. Las terminales de
Backend y Frontend deben permanecer abiertas mientras uses el sistema.
