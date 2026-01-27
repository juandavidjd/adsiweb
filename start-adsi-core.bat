@echo off
title ADSI Core System Boot
color 0B
echo ======================================================
echo 🧠  ADSI COGNITIVE SYSTEM - STARTUP SEQUENCE INITIATED
echo ======================================================
echo.

REM --- Paso 1: Verificación de entorno ---
echo 🔍 Verificando dependencias...
where node >nul 2>nul || (
    echo ❌ Node.js no encontrado. Instálalo desde https://nodejs.org/
    pause
    exit /b
)
where ffmpeg >nul 2>nul || (
    echo ❌ FFmpeg no encontrado. Descarga desde https://ffmpeg.org/download.html y agrega al PATH.
    pause
    exit /b
)
where sox >nul 2>nul || (
    echo ❌ SoX no encontrado. Descarga desde https://sourceforge.net/projects/sox/ y agrega al PATH.
    pause
    exit /b
)
echo ✅ Dependencias verificadas.
echo.

REM --- Paso 2: Inicialización de estructura ---
cd /d C:\adsiweb
if not exist "audio" mkdir audio
if not exist "logs" mkdir logs

echo 🧬 Estructura verificada.

REM --- Paso 3: Lanzamiento del motor auditivo ---
echo 🎵 Iniciando motor de sonido (Voice Synchronizer)...
start "ADSI Audio" cmd /c "node voice-synchronizer.js > logs\audio.log 2>&1"

REM --- Paso 4: Iniciar visualizador ---
echo 🌌 Iniciando visualizador neurográfico...
start "" "C:\adsiweb\neurodisplay-interface.html"

REM --- Paso 5: Iniciar panel de control ---
echo 🕹️ Cargando ADSI Control Nexus...
start "" "C:\adsiweb\control-nexus.html"

REM --- Paso 6: Inicializar modo cognitivo ---
echo 🧠 Sincronizando módulos ADSI...
timeout /t 5 >nul
echo 🚀 Sistema ADSI operativo.
echo ======================================================
echo 💫  Todos los módulos están activos.
echo 📁  Logs disponibles en: C:\adsiweb\logs
echo ======================================================
echo.
pause
exit
