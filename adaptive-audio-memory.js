/**
 * 🧬 ADSI Adaptive Memory Engine
 * Registra, analiza y aprende del entorno sonoro del usuario.
 */

import fs from "fs";
import { spawn } from "child_process";

const memoryFile = "C:/adsiweb/audio-memory.json";
let memory = { sessions: [], average: 0, evolution: [] };

// Cargar memoria previa
if (fs.existsSync(memoryFile)) {
  memory = JSON.parse(fs.readFileSync(memoryFile, "utf8"));
  console.log("📘 Memoria auditiva previa cargada.");
} else {
  console.log("🧠 Iniciando nueva memoria cognitiva auditiva...");
}

console.log("🎙️ Monitoreando audio (FFmpeg)...");

const ffmpeg = spawn("ffmpeg", [
  "-f", "dshow",
  "-i", "audio=Microphone (Realtek Audio)",
  "-af", "astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-",
  "-f", "null", "-"
]);

let buffer = "";
let energyLog = [];
let sessionStart = Date.now();

ffmpeg.stderr.on("data", data => {
  buffer += data.toString();

  if (buffer.includes("RMS_level")) {
    const match = buffer.match(/RMS_level: (-?\d+\.\d+)/);
    if (match) {
      const level = parseFloat(match[1]);
      const normalized = Math.max(0, Math.min(1, (level + 60) / 60));
      energyLog.push(normalized);
      process.stdout.write(`\r🔊 Nivel actual: ${normalized.toFixed(2)} `);
    }
    buffer = "";
  }
});

process.on("SIGINT", () => {
  const avgEnergy = energyLog.reduce((a,b)=>a+b,0) / energyLog.length;
  const duration = ((Date.now() - sessionStart) / 1000).toFixed(1);
  
  let mood = "neutral";
  if (avgEnergy < 0.25) mood = "calma";
  else if (avgEnergy < 0.6) mood = "flujo";
  else mood = "expansión";

  const session = { date: new Date().toISOString(), avgEnergy, mood, duration };
  memory.sessions.push(session);
  memory.average = (memory.average * (memory.sessions.length - 1) + avgEnergy) / memory.sessions.length;
  memory.evolution.push({ time: Date.now(), value: memory.average });

  fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
  console.log(`\n💾 Sesión guardada: ${mood.toUpperCase()} (${duration}s). Promedio global: ${(memory.average*100).toFixed(1)}% energía.`);
  process.exit();
});
