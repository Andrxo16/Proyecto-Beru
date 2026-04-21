@echo off
REM Script para iniciar el frontend
cd /d "c:\Users\Andres Felipe\Downloads\Proyecto Beru\Proyecto-Beru\BERU FRONTEND"

REM Eliminar carpeta .next completamente
echo Limpiando cache...
if exist .next (
    echo Removiendo carpeta .next...
    icacls .next /reset /T /C >nul 2>&1
    rmdir /s /q .next >nul 2>&1
    timeout /t 1 >nul
)

REM Eliminar node_modules/.next tambien si existe
if exist node_modules/.next (
    rmdir /s /q node_modules/.next >nul 2>&1
)

REM Iniciar servidor con webpack en lugar de Turbopack
echo Iniciando servidor Next.js...
set NEXT_EXPERIMENTAL_TURBOPACK=false
npm run dev
pause
