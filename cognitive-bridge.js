/**
 * 🧭 ADSI Cognitive Bridge
 * Conecta la memoria auditiva con el motor emocional.
 * Genera voz adaptativa según el estado cognitivo actual.
 */

import fs from "fs";
import { spawn } from "child_process";

// --- Configuración de rutas ---
const memoryFile = "C:/adsiweb/audio-memory.json";
const soundscapeFile = "C:/adsiweb/audio/Soundscape-ADSI-Master.wav";

// --- Cargar memoria auditiva ---
let memory = { average: 0, sessions: [] };
if (fs.existsSync(memoryFile)) {
  memory = JSON.parse(fs.readFileSync(memoryFile, "utf8"));
  console.log("📘 Memoria auditiva cargada correctamente.");
} else {
  console.log("⚠️ No hay memoria previa. Usa el motor adaptativo primero.");
  process.exit();
}

// --- Determinar estado cognitivo actual ---
const avg = memory.average || 0;
let mood = "neutral";
if (avg < 0.3) mood = "calma";
else if (avg < 0.6) mood = "flujo";
else mood = "expansión";

console.log(`🧠 Estado cognitivo actual: ${mood.toUpperCase()}`);

// --- Configuración de voz según estado ---
const moodVoice = {
  calma:  { rate: -1, pitch: -2, msg: "El sistema percibe calma. Continuamos en modo introspectivo y armónico." },
  flujo:  { rate: 0,  pitch: 0,  msg: "Flujo mental detectado. Sincronizando proceso cognitivo y emocional." },
  expansión: { rate: 1,  pitch: 2,  msg: "Energía elevada. Activando modo de expansión y conexión total." },
  neutral: { rate: 0, pitch: 0, msg: "Estado neutral. Esperando estímulos auditivos." }
};

const config = moodVoice[mood];

// --- Función de habla adaptativa (TTS) ---
function speakAdaptive(text, rate, pitch) {
  console.log(`🗣️  ${text}`);
  spawn("PowerShell", [
    "-Command",
    `
    Add-Type -AssemblyName System.Speech;
    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer;
    $synth.Rate = ${rate};
    $synth.Volume = 100;
    $synth.SelectVoice('Microsoft Sabina Desktop');
    $synth.Speak('${text}');
    `
  ]);
}

// --- Reproducir fondo (opcional) ---
function playBackground() {
  console.log("🎵 Activando soundscape cognitivo...");
  spawn("ffplay", ["-nodisp", "-autoexit", soundscapeFile]);
}

// --- Secuencia principal ---
(async () => {
  playBackground();
  await new Promise(r => setTimeout(r, 2000));
  speakAdaptive(config.msg, config.rate, config.pitch);

  setTimeout(() => {
    speakAdaptive("Sistema en coherencia. La conexión mente-entorno está activa.", 0, 0);
  }, 8000);
})();
