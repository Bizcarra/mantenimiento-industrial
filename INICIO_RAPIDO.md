# Inicio rápido por red local

La aplicación utiliza una laptop como servidor para que otros computadores y teléfonos conectados al mismo Wi-Fi puedan ingresar.

## Preparación inicial

En la laptop servidor instala:

- Node.js 20.9 o superior.
- MongoDB, o configura MongoDB Atlas en `backend/.env`.
- Git para recibir actualizaciones del repositorio.

Después, ejecuta una sola vez `CONFIGURAR_FIREWALL_RED_LOCAL.cmd` como administrador. La red de Windows debe estar configurada como **Privada**.

## Iniciar

1. Comprueba que MongoDB esté funcionando.
2. Haz doble clic en `INICIAR_RED_LOCAL.cmd`.
3. Espera mientras se buscan actualizaciones, se instalan dependencias y se compila el frontend.
4. Conserva abierta la ventana del servidor.
5. Abre el enlace mostrado o escanea el código QR desde otro dispositivo conectado al mismo Wi-Fi.

El enlace tendrá una forma similar a:

```text
http://192.168.1.9:5050
```

La IP puede cambiar al conectarse a otra red. El iniciador detecta el cambio y actualiza automáticamente el enlace y el QR.

## Acceso directo opcional

Ejecuta `CREAR_ACCESO_RED_LOCAL.cmd` si deseas crear un icono en el escritorio. Ese icono abre el mismo modo de red local; no existe un segundo modo de ejecución.

## Datos de prueba opcionales

Solo para una base de datos nueva o que se pueda borrar:

```powershell
cd backend
npm run seed -- --confirm-reset-local-data
```

El seed elimina los datos locales anteriores. Consulta las credenciales creadas en [README.md](README.md#credenciales-de-prueba).

## Si otro dispositivo no puede entrar

- Verifica que ambos dispositivos estén en el mismo Wi-Fi.
- No uses una red de invitados.
- Ejecuta la configuración del firewall como administrador.
- Confirma que la terminal del servidor siga abierta y sin errores.
- Usa el último enlace mostrado si la IP cambió.
