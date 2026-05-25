@echo off
title Servidor de Productividad - La Leonora
color 0A
echo ==================================================
echo   Iniciando Sistema de Control de Productividad
echo ==================================================
echo.

echo 1. Limpiando procesos antiguos (por favor espera unos segundos)...
powershell -Command "Stop-Process -Name 'node' -Force -ErrorAction SilentlyContinue"
echo    Procesos limpiados.
echo.

echo 2. Limpiando cache temporal del sistema (para evitar errores)...
if exist ".next" (
    powershell -Command "Remove-Item -Path '.next' -Recurse -Force -ErrorAction SilentlyContinue"
    echo    Cache limpiado con exito.
) else (
    echo    El cache ya esta limpio.
)
echo.

echo 3. Iniciando base de datos y preparando la aplicacion...
echo    (Se abrira el navegador automaticamente en unos segundos)
start http://localhost:3030
echo.

echo ======================================================================
echo    ATENCION: NO CIERRES ESTA VENTANA NEGRA MIENTRAS USES EL SISTEMA
echo    Para apagar el sistema por completo, simplemente cierra esta ventana.
echo ======================================================================
echo.

npm run dev -- -p 3030
