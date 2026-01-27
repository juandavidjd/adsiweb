/**
 * 🧠 ADSI Cognitive Service Daemon
 * Modo residente de arranque automático
 * Autor: Ecosistema ADSI
 */

import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const baseDir = "C:\\adsiweb";
const logDir = path.join(baseDir, "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const sessionFile = path.join(
  logDir,
  `service-${new Date().toISOString().replace(/[:.]/g, "-")}.log`
);

function log(msg) {
  const time = new Date().toLocaleTimeString();
  const line = `[${time}] ${msg}`;
  console.log(line);
  fs.appendFileSync(sessionFile, line + "\n");
}

// --- Función para lanzar subprocesos ---
function launchProcess(name, command, args = []) {
  log(`🚀 Lanzando módulo: ${name}`);
  const proc = spawn(command, args, { shell: true, cwd: baseDir });
  proc.stdout.on("data", (data) => log(`[${name}] ${data}`));
  proc.stderr.on("data", (data) => log(`[${name} ERROR] ${data}`));
  proc.on("exit", (code) => {
    log(`⚠️ ${name} terminó con código ${code}. Reiniciando...`);
    setTimeout(() => launchProcess(name, command, args), 5000);
  });
  return proc;
}

// --- Módulos a iniciar ---
launchProcess("ADSI Audio Engine", "node", ["voice-synchronizer.js"]);
launchProcess("ADSI Visual Interface", "start", ["neurodisplay-interface.html"]);
launchProcess("ADSI Control Nexus", "start", ["control-nexus.html"]);

log("✅ ADSI Service Daemon inicializado correctamente.");
