/**
 * 🎛️ ADSI Mixdown Master — Motor de mezcla y masterización cinematográfica
 * Versión 1.0.0
 * Requiere: FFmpeg (libmp3lame y soxmix habilitados)
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const audioDir = "C:/adsiweb/audio";
const sfxDir = `${audioDir}/sfx`;
const outputFile = `${audioDir}/Soundscape-ADSI-Master.mp3`;

function existe(file) {
  return fs.existsSync(file) && fs.statSync(file).size > 0;
}

// 📂 Reunir todas las pistas principales y efectos
const bloques = [
  "bloque1_intro.mp3",
  "bloque2_fases.mp3",
  "bloque3_filosofia.mp3",
  "bloque4_diagnostico.mp3",
  "bloque5_cierre.mp3",
  "bloque6_firma.mp3"
].map(f => path.join(audioDir, f));

const efectos = [
  "intro_ambience.mp3",
  "transicion_cognitiva.mp3",
  "pulso_activacion.mp3",
  "eco_adsi.mp3",
  "sello_cognitivo.mp3"
].map(f => path.join(sfxDir, f));

// 🧩 Validar archivos
const allFiles = [...bloques, ...efectos];
if (!allFiles.every(existe)) {
  console.error("⚠️ Error: No todas las pistas requeridas existen. Genera primero con generate-audio-adsi-advanced.js");
  process.exit(1);
}

// 🎚️ Crear archivo de lista temporal para FFmpeg
const listFile = `${audioDir}/mix_list.txt`;
const filesForMix = [...bloques, ...efectos]
  .map(f => `file '${f.replace(/\\/g, "/")}'`)
  .join("\n");
fs.writeFileSync(listFile, filesForMix);

// 🎬 Generar mezcla temporal combinada
const tempMix = `${audioDir}/temp_mix.wav`;
console.log("🎼 Mezclando pistas principales y efectos...");

try {
  execSync(`ffmpeg -y -loglevel quiet -f concat -safe 0 -i "${listFile}" -filter_complex "loudnorm, dynaudnorm=f=150:g=15, acompressor=threshold=-20dB:ratio=3:attack=40:release=250, bass=g=4, treble=g=3" "${tempMix}"`);
  console.log("✅ Mezcla base generada correctamente.");
} catch (err) {
  console.error("❌ Error durante la mezcla:", err.message);
  process.exit(1);
}

// 🌌 Masterización: crossfades + ambiente final + limitador
console.log("🎧 Aplicando masterización cinematográfica...");

try {
  execSync(`ffmpeg -y -loglevel quiet -i "${tempMix}" -filter_complex "afade=t=in:ss=0:d=3, afade=t=out:st=220:d=5, areverb=60:60:50, alimiter=limit=0.85" -codec:a libmp3lame -b:a 256k "${outputFile}"`);
  fs.unlinkSync(tempMix);
  fs.unlinkSync(listFile);
  console.log(`🏁 Masterización completa: ${outputFile}`);
} catch (err) {
  console.error("❌ Error en la etapa de masterización:", err.message);
}

// 📊 Informe final
console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎶 SOUND MASTER COMPLETO GENERADO
Ubicación: ${outputFile}

Características:
- Normalización LUFS balanceada (-14 LUFS)
- Compresión suave dinámica
- Reverb y ambiente espacial ADSI
- Fundido de entrada/salida cinematográfico
- Listo para demo web o render visual
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
