@echo off
title Instalador del Servicio ADSI
color 0B
cd /d C:\adsiweb

echo ======================================================
echo 🧠 Instalando ADSI Cognitive Service Daemon...
echo ======================================================

REM Verifica Node.js
where node >nul 2>nul || (
    echo ❌ Node.js no encontrado. Instálalo primero.
    pause
    exit /b
)

REM Instala el módulo node-windows si no está
npm list -g node-windows >nul 2>nul || npm install -g node-windows

REM Crea el servicio
node -e "const Service=require('node-windows').Service;
const svc=new Service({
 name:'ADSI Cognitive Daemon',
 description:'Servicio cognitivo autónomo del ecosistema ADSI',
 script:'C:\\adsiweb\\adsi-service.js'
});
svc.on('install',()=>{console.log('✅ Servicio instalado y configurado.');svc.start();});
svc.install();"

pause
