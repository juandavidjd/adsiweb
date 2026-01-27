/**
 * 🔊 ADSI Voice Synchronizer
 * Crea un campo de resonancia emocional entre la voz y el soundscape.
 * Requiere: FFmpeg + SoX + micrófono habilitado
 */

import { spawn } from "child_process";
import fs from "fs";

console.clear();
console.log("🧬 Iniciando ADSI Voice Synchronizer...");
console.log("🎙️ Capturando voz y generando mezcla armónica...");

const micSource = "audio=Microphone (Realtek Audio)"; // Ajusta el nombre según tu micrófono
const soundscape = "C:/adsiweb/audio/Soundscape-ADSI-Master.wav";
const outputMix = "C:/adsiweb/audio/VoiceSync-Live.mp3";

// --- Paso 1: Analizar tono de voz con FFmpeg ---
const ffmpegTone = spawn("ffmpeg", [
  "-f", "dshow",
  "-i", micSource,
  "-af", "astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-",
  "-f", "null", "-"
]);

let toneBuffer = "";
let rmsLevel = 0;

ffmpegTone.stderr.on("data", data => {
  toneBuffer += data.toString();
  if (toneBuffer.includes("RMS_level")) {
    const match = toneBuffer.match(/RMS_level: (-?\d+\.\d+)/);
    if (match) {
      rmsLevel = parseFloat(match[1]);
      process.stdout.write(`\r🎧 Nivel RMS: ${rmsLevel.toFixed(2)} dB`);
    }
    toneBuffer = "";
  }
});

// --- Paso 2: Mezclar voz + soundscape ---
setTimeout(() => {
  console.log("\n🎚️ Iniciando mezcla binaural dinámica...");
  const voiceSync = spawn("sox", [
    "-m",
    "-v", "0.8", soundscape,
    "-t", "waveaudio", micSource,
    outputMix,
    "bass", "+3",
    "treble", "-2",
    "reverb", "60",
    "gain", "-2"
  ]);

  voiceSync.on("close", () => {
    console.log(`✅ Mezcla generada: ${outputMix}`);
    console.log("🌀 Iniciando modo de resonancia cognitiva...");
    playMix();
  });
}, 3000);

// --- Paso 3: Reproducir mezcla en loop ---
function playMix() {
  spawn("ffplay", ["-nodisp", "-autoexit", outputMix]);
}
