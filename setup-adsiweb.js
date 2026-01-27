import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const baseDir = "C:/adsiweb";
const dirs = [
  `${baseDir}/audio/bg`,
  `${baseDir}/audio/sfx`,
  `${baseDir}/images`
];

console.log("🧠 Creando estructura del proyecto ADSI...");

// Crear carpetas
dirs.forEach(d => {
  fs.mkdirSync(d, { recursive: true });
});

// Crear README
fs.writeFileSync(`${baseDir}/README.txt`, `
ECOSISTEMA ADSI — Versión Cinematográfica
----------------------------------------
Abre index.html en tu navegador para escuchar la experiencia audiovisual.
Los audios están en formato MP3, sincronizados con el scroll.

Estructura:
  /audio       → narraciones y efectos
  /images      → logo y visuales
  /index.html  → interfaz principal
`);

// --- UTILIDAD DE EJECUCIÓN ---
const run = (cmd) => {
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    console.error("⚠️ Error ejecutando comando:", cmd);
    throw err;
  }
};

console.log("🎵 Generando pistas de audio cinematográficas (MP3)...");

const tones = [
  { file: "bloque1_intro", freq: 432, dur: 45 },
  { file: "bloque2_fases", freq: 528, dur: 90 },
  { file: "bloque3_filosofia", freq: 396, dur: 40 },
  { file: "bloque4_diagnostico", freq: 639, dur: 40 },
  { file: "bloque5_cierre", freq: 285, dur: 40 },
  { file: "bloque6_firma", freq: 528, dur: 15 }
];

tones.forEach(t => {
  const wavPath = path.join(baseDir, "audio", `${t.file}.wav`);
  const mp3Path = path.join(baseDir, "audio", `${t.file}.mp3`);

  console.log(`🎼 Generando ${t.file}...`);
  run(`sox -n -r 48000 -c 2 "${wavPath}" synth ${t.dur} sine ${t.freq} vol 0.3 reverb 50`);
  run(`ffmpeg -y -i "${wavPath}" -codec:a libmp3lame -qscale:a 2 "${mp3Path}"`);
  fs.unlinkSync(wavPath);
});

const sfx = [
  { file: "intro_ambience", freq: 432, dur: 20 },
  { file: "transicion_cognitiva", freq: 639, dur: 2 },
  { file: "pulso_activacion", freq: 80, dur: 1.2 },
  { file: "eco_adsi", freq: 396, dur: 3 },
  { file: "sello_cognitivo", freq: 528, dur: 2 }
];

sfx.forEach(s => {
  const wavPath = path.join(baseDir, "audio/sfx", `${s.file}.wav`);
  const mp3Path = path.join(baseDir, "audio/sfx", `${s.file}.mp3`);

  console.log(`🎧 Generando efecto ${s.file}...`);
  run(`sox -n -r 48000 -c 2 "${wavPath}" synth ${s.dur} sine ${s.freq} vol 0.35 reverb 60`);
  run(`ffmpeg -y -i "${wavPath}" -codec:a libmp3lame -qscale:a 2 "${mp3Path}"`);
  fs.unlinkSync(wavPath);
});

console.log("✅ Generación de audio cinematográfico completada.");
console.log("🚀 Tu entorno está listo en C:\\adsiweb");
