@echo off
title ADSI Cognitive System PRO - Auto Supervisor
color 0A

setlocal enabledelayedexpansion
set BASEDIR=C:\adsiweb
set LOGDIR=%BASEDIR%\logs
set SESSIONDIR=%LOGDIR%\sesiones
set DATESTR=%date:~6,4%-%date:~3,2%-%date:~0,2%
set TIMESTR=%time:~0,2%-%time:~3,2%-%time:~6,2%
set SESSIONLOG=%SESSIONDIR%\session-%DATESTR%_%TIMESTR%.log

if not exist "%SESSIONDIR%" mkdir "%SESSIONDIR%"

echo ====================================================== >> "%SESSIONLOG%"
echo 🧠 ADSI COGNITIVE SYSTEM PRO — Startup Session %DATESTR% %TIMESTR% >> "%SESSIONLOG%"
echo ====================================================== >> "%SESSIONLOG%"
echo. >> "%SESSIONLOG%"

cls
echo ======================================================
echo 🧠  ADSI COGNITIVE SYSTEM PRO
echo ======================================================
echo 🚀 Iniciando entorno cognitivo avanzado...
echo Sesión: %DATESTR% %TIMESTR%
echo ======================================================
echo.

REM --- Comprobación de dependencias ---
for %%i in (node sox ffmpeg) do (
    where %%i >nul 2>nul || (
        echo ❌ %%i no encontrado. >> "%SESSIONLOG%"
        echo ❌ Dependencia faltante: %%i
        pause
        exit /b
    )
)
echo ✅ Dependencias verificadas. >> "%SESSIONLOG%"
echo 🔍 Entorno validado correctamente.
echo.

REM --- Estructura de directorios ---
if not exist "%BASEDIR%\audio" mkdir "%BASEDIR%\audio"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
echo 🧩 Estructura confirmada. >> "%SESSIONLOG%"

REM --- Inicio de módulos ---
echo 🎵 Iniciando motor de audio...
start "ADSI Audio Engine" cmd /c "cd /d %BASEDIR% && node voice-synchronizer.js >> %LOGDIR%\audio-engine.log 2>&1"
timeout /t 3 >nul

echo 🌌 Iniciando visualizador neurográfico...
start "" "%BASEDIR%\neurodisplay-interface.html"
timeout /t 2 >nul

echo 🕹️ Iniciando ADSI Control Nexus...
start "" "%BASEDIR%\control-nexus.html"
timeout /t 2 >nul

echo ✅ Todos los módulos inicializados. >> "%SESSIONLOG%"
echo 🔧 Módulos activos: Audio Engine, Visual Interface, Control Nexus
echo.

REM --- Monitor de salud del sistema ---
:monitor
echo ------------------------------------------------------ >> "%SESSIONLOG%"
echo ⏱️  Monitorizando rendimiento... %time% >> "%SESSIONLOG%"
echo ------------------------------------------------------ >> "%SESSIONLOG%"

REM --- CPU y memoria ---
for /f "tokens=2 delims==." %%a in ('wmic cpu get loadpercentage /value') do set CPU=%%a
for /f "tokens=2 delims==." %%b in ('wmic os get freephysicalmemory /value') do set FREE=%%b
echo 🔹 CPU: !CPU!%% | Memoria libre: !FREE! KB >> "%SESSIONLOG%"

REM --- Verificar procesos activos ---
tasklist | find /i "node.exe" >nul
if errorlevel 1 (
    echo ⚠️ Motor Node.js detenido — reiniciando... >> "%SESSIONLOG%"
    start "ADSI Audio Engine" cmd /c "cd /d %BASEDIR% && node voice-synchronizer.js >> %LOGDIR%\audio-engine.log 2>&1"
)

REM --- Registro periódico de sonido si existe Soundscape ---
if exist "%BASEDIR%\audio\Soundscape-ADSI-Master.wav" (
    for %%f in ("%BASEDIR%\audio\Soundscape-ADSI-Master.wav") do (
        echo 🎧 Soundscape activo: %%~zf bytes >> "%SESSIONLOG%"
    )
) else (
    echo ⚠️ Soundscape no encontrado. >> "%SESSIONLOG%"
)

REM --- Tiempo de espera entre monitoreos ---
timeout /t 60 >nul
goto monitor
