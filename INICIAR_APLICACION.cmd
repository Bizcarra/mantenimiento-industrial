@echo off
setlocal
chcp 65001 >nul

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Iniciar-Aplicacion.ps1"
set "RESULTADO=%ERRORLEVEL%"

if not "%RESULTADO%"=="0" (
    echo.
    echo El inicio no pudo completarse. Revise el mensaje anterior.
    pause
)

exit /b %RESULTADO%

