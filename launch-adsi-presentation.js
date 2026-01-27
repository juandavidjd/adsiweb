/**
 * 🚀 ADSI Soundscape — Launcher de Presentación Cinemática
 * Ejecuta el demo en pantalla completa, con servidor local Express
 * y apertura automática en navegador (modo instalación).
 */

import express from "express";
import open from "open";
import { fileURLToPath } from "url";
import path from "path";
import { exec } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 4321;

// 🎬 Servir archivos estáticos
app.use(express.static(__dirname));

// 🔊 Página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "soundscape-demo.html"));
});

// 🧠 Iniciar servidor
app.listen(PORT, async () => {
  console.clear();
  console.log("🧬 ADSI Soundscape en ejecución...");
  console.log(`🌐 Servidor local: http://localhost:${PORT}`);
  console.log("🧠 Preparando entorno de presentación...");

  // 🔲 Pantalla completa automática (Windows + Chrome)
  const url = `http://localhost:${PORT}`;
  await open(url, { app: { name: "chrome", arguments: ["--start-fullscreen"] } });

  console.log("🎥 Presentación lanzada en modo inmersivo.\n");
  console.log("🟢 Presiona CTRL + C para finalizar.\n");

  // 🔈 Comando opcional para activar salida de audio
  exec("nircmd.exe setsysvolume 65535", (err) => {
    if (!err) console.log("🔊 Volumen máximo activado (opcional).");
  });
});
