@echo off
title Desinstalador del Servicio ADSI
color 0C
cd /d C:\adsiweb

echo ======================================================
echo 🧠 Desinstalando ADSI Cognitive Service Daemon...
echo ======================================================

node -e "const Service=require('node-windows').Service;
const svc=new Service({name:'ADSI Cognitive Daemon',script:'C:\\adsiweb\\adsi-service.js'});
svc.on('uninstall',()=>{console.log('🧹 Servicio eliminado correctamente.');});
svc.uninstall();"

pause
