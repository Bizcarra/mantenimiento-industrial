@echo off
setlocal
chcp 65001 >nul

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Crear-PaqueteTransferible.ps1"
set "RESULTADO=%ERRORLEVEL%"

echo.
if "%RESULTADO%"=="0" (
    echo Paquete creado correctamente.
) else (
    echo No se pudo crear el paquete.
)
pause

exit /b %RESULTADO%
