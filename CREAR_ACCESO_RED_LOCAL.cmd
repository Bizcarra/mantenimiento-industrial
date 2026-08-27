@echo off
setlocal
chcp 65001 >nul

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Iniciar-RedLocal.ps1" -CrearAccesoDirecto
set "RESULTADO=%ERRORLEVEL%"

echo.
if "%RESULTADO%"=="0" (
    echo Operacion completada.
) else (
    echo No se pudo crear el acceso directo de red local.
)
pause

exit /b %RESULTADO%
<<<<<<< HEAD
=======

>>>>>>> D
