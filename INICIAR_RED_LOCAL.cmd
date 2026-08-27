@echo off
setlocal
chcp 65001 >nul

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Iniciar-RedLocal.ps1"
set "RESULTADO=%ERRORLEVEL%"

if not "%RESULTADO%"=="0" (
    echo.
    echo No se pudo iniciar el modo de red local. Revise el mensaje anterior.
    pause
)

exit /b %RESULTADO%
