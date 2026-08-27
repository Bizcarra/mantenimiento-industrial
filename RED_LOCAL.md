# Uso mediante la red Wi-Fi

La aplicación puede compartirse desde el computador principal con celulares y otros
equipos conectados al mismo Wi-Fi. Todos usan el mismo servidor y la misma base de datos;
no es necesario copiar el proyecto a cada dispositivo.

## Iniciar

1. En el computador principal, ejecuta `INICIAR_RED_LOCAL.cmd`.
2. Espera a que aparezcan la dirección y el código QR.
3. En otro dispositivo del mismo Wi-Fi, escanea el QR o escribe el enlace mostrado.

El iniciador comprueba los requisitos, instala dependencias, compila el frontend y sirve
frontend y API desde el puerto 5050.

## Firewall

Si otro dispositivo no puede entrar, ejecuta una vez
`CONFIGURAR_FIREWALL_RED_LOCAL.cmd` como administrador y acepta el aviso de Windows.

La dirección IP puede cambiar al reconectar el router. `INICIAR_RED_LOCAL.cmd` la
detecta en cada inicio, informa si cambió y regenera automáticamente el enlace y el QR.
No hay que modificar archivos del frontend o del backend. Si el teléfono conserva una
dirección anterior, vuelve a escanear el QR actual.

Mientras la ventana del iniciador permanezca abierta, revisa la conexión cada 10 segundos.
Si detecta una IP nueva, vuelve a mostrar el QR y abre la dirección actualizada. Puedes
cerrar esa ventana de monitoreo sin detener la terminal donde se ejecuta el servidor.
