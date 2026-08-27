# Uso mediante la red Wi-Fi

La aplicación puede compartirse desde el computador principal con celulares y otros
equipos conectados al mismo Wi-Fi. Todos usan el mismo servidor y la misma base de datos;
no es necesario copiar el proyecto a cada dispositivo.

## Iniciar

1. En el computador principal, ejecuta `INICIAR_RED_LOCAL.cmd`.
2. Espera a que aparezca la dirección, por ejemplo `http://192.168.1.9:5050`.
3. Abre esa dirección en los otros dispositivos conectados al mismo Wi-Fi.

El iniciador comprueba los requisitos, instala dependencias, compila el frontend y sirve
frontend y API desde el puerto 5050.

## Firewall

Si otro dispositivo no puede entrar, ejecuta una vez
`CONFIGURAR_FIREWALL_RED_LOCAL.cmd` como administrador y acepta el aviso de Windows.

La dirección IP puede cambiar al reconectar el router. Usa siempre la dirección que
muestra `INICIAR_RED_LOCAL.cmd` al iniciar.
