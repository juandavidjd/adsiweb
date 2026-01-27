/**
 * 🌐 ADSI Dashboard Local Server
 * Monitor cognitivo de estado en tiempo real
 */

import express from "express";
import os from "os";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

const app = express();
const PORT = 8080;
const baseDir = "C:\\adsiweb";
const logDir = path.join(baseDir, "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

app.use(express.static(baseDir));

// --- Endpoint principal ---
app.get("/api/status", async (req, res) => {
  const cpu = os.loadavg()[0].toFixed(2);
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = ((1 - freeMem / totalMem) * 100).toFixed(1);
  const uptime = (os.uptime() / 60).toFixed(0);

  const modules = ["voice-synchronizer.js", "neurodisplay-interface.html", "control-nexus.html"];
  const active = [];

  for (const m of modules) {
    const cmd = `tasklist | find /i "${m.includes(".js") ? "node.exe" : "msedge.exe"}"`;
    const result = await new Promise((resolve) => {
      exec(cmd, (err, stdout) => resolve(stdout ? true : false));
    });
    active.push({ name: m, running: result });
  }

  res.json({
    cpu,
    usedMem,
    uptime,
    modules: active,
    timestamp: new Date().toISOString(),
  });
});

// --- Endpoint para ejecutar comandos ---
app.get("/api/control/:action", (req, res) => {
  const action = req.params.action;
  if (action === "restart") {
    exec(`net stop "ADSI Cognitive Daemon" && net start "ADSI Cognitive Daemon"`);
    res.json({ message: "♻️ Reiniciando servicio ADSI..." });
  } else if (action === "stop") {
    exec(`net stop "ADSI Cognitive Daemon"`);
    res.json({ message: "🛑 Deteniendo servicio ADSI..." });
  } else if (action === "start") {
    exec(`net start "ADSI Cognitive Daemon"`);
    res.json({ message: "🚀 Iniciando servicio ADSI..." });
  } else {
    res.status(400).json({ error: "Acción no reconocida" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 ADSI Dashboard activo en http://localhost:${PORT}`);
});
