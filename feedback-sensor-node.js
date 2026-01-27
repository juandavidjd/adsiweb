/**
 * 🔊 ADSI Feedback Engine (Node.js)
 * Monitorea el micrófono del sistema y responde con salida auditiva o visual.
 */

import { spawn } from "child_process";
import fs from "fs";

console.clear();
console.log("🎧 Iniciando ADSI Feedback Engine...");
console.log("🎙️ Escuchando entrada de micrófono (FFmpeg)...");

const ffmpeg = spawn("ffmpeg", [
  "-f", "dshow",
  "-i", "audio=Microphone (Realtek Audio)", // Ajusta el nombre si difiere
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
      process.stdout.write(`\r🔊 Nivel: ${normalized.toFixed(2)} `);

      // Reacción automática
      if (normalized > 0.8) speak("Energía cognitiva detectada.");
      else if (normalized > 0.5) speak("Sincronía activa.");
    }
    buffer = "";
  }
});

function speak(msg) {
  spawn("PowerShell", ["-Command", `Add-Type –AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak('${msg}')`]);
}
