/**
 * 💫 ADSI Emotional Feedback Engine
 * Analiza el entorno sonoro y genera respuestas emocionales adaptativas.
 * Requiere: FFmpeg + PowerShell (para voz TTS)
 */

import { spawn } from "child_process";

console.clear();
console.log("🧠 Iniciando ADSI Emotional Feedback Engine...");
console.log("🎙️ Escuchando micrófono y detectando patrones sonoros...");

let silenceCount = 0;
let activeCount = 0;
let state = "neutral";

const ffmpeg = spawn("ffmpeg", [
  "-f", "dshow",
  "-i", "audio=Microphone (Realtek Audio)", // Ajusta según tu micrófono
  "-af", "astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-",
  "-f", "null", "-"
]);

let buffer = "";

ffmpeg.stderr.on("data", data => {
  buffer += data.toString();

  if (buffer.includes("RMS_level")) {
    const match = buffer.match(/RMS_level: (-?\d+\.\d+)/);
    if (match) {
      const level = parseFloat(match[1]);
      const normalized = Math.max(0, Math.min(1, (level + 60) / 60));
      interpretSound(normalized);
    }
    buffer = "";
  }
});

function interpretSound(value) {
  process.stdout.write(`\r🔊 Nivel actual: ${value.toFixed(2)}   `);

  if (value < 0.2) {
    silenceCount++;
    activeCount = 0;
  } else if (value > 0.6) {
    activeCount++;
    silenceCount = 0;
  } else {
    silenceCount = 0;
    activeCount = 0;
  }

  if (silenceCount > 25 && state !== "calma") {
    state = "calma";
    respondEmotion("Silencio detectado. La mente entra en coherencia.");
  } else if (activeCount > 15 && state !== "estimulo") {
    state = "estimulo";
    respondEmotion("Alta energía percibida. Activando expansión cognitiva.");
  } else if (value > 0.3 && value < 0.6 && state !== "flujo") {
    state = "flujo";
    respondEmotion("Sincronía estable. Ritmo mental óptimo.");
  }
}

function respondEmotion(message) {
  console.log(`\n🧭 Estado: ${state.toUpperCase()} → ${message}`);
  speak(message);
}

function speak(text) {
  spawn("PowerShell", [
    "-Command",
    `Add-Type –AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak('${text}')`
  ]);
}
