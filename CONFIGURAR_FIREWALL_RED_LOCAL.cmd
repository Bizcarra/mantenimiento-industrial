@echo off
setlocal
chcp 65001 >nul

net session >nul 2>&1
if not "%ERRORLEVEL%"=="0" (
    echo Solicitando permiso de administrador para configurar el Firewall...
    powershell.exe -NoLogo -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Configurar-FirewallRedLocal.ps1"
set "RESULTADO=%ERRORLEVEL%"

echo.
if "%RESULTADO%"=="0" (
    echo Firewall configurado para la red local privada.
) else (
    echo No se pudo configurar el Firewall.
)
pause

exit /b %RESULTADO%
