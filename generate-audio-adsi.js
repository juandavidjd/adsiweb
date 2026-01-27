/**
 * 🎧 Generador Automático de Audio Cinematográfico ADSI
 * Versión 1.0.0
 * Requiere SoX + FFmpeg instalados y en PATH
 */

import { execSync } from "child_process";
import fs from "fs";

const audioDir = "C:/adsiweb/audio";
const sfxDir = `${audioDir}/sfx`;

if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
if (!fs.existsSync(sfxDir)) fs.mkdirSync(sfxDir, { recursive: true });

// Parámetros base
const soxBase = {
  sampleRate: 48000,
  channels: 2,
  volume: 0.4
};

// Definición de bloques principales
const bloques = [
  { id: "bloque1_intro", hz: 432, dur: 45, rev: 50 },
  { id: "bloque2_fases", hz: 528, dur: 90, rev: 40 },
  { id: "bloque3_filosofia", hz: 396, dur: 40, rev: 60 },
  { id: "bloque4_diagnostico", hz: 639, dur: 40, rev: 30 },
  { id: "bloque5_cierre", hz: 285, dur: 40, rev: 40 },
  { id: "bloque6_firma", hz: 528, dur: 15, rev: 50 }
];

// Efectos secundarios (SFX)
const efectos = [
  { id: "intro_ambience", hz: 432, dur: 20, rev: 90 },
  { id: "transicion_cognitiva", hz: 639, dur: 2, rev: 20 },
  { id: "pulso_activacion", hz: 80, dur: 1.2, rev: 10 },
  { id: "eco_adsi", hz: 396, dur: 3, rev: 60 },
  { id: "sello_cognitivo", hz: 528, dur: 1.8, rev: 40 }
];

// Generador de audio WAV + conversión a MP3
function generarAudio(nombre, hz, duracion, reverb, destino) {
  const wavFile = `${destino}.wav`;
  const mp3File = `${destino}.mp3`;

  try {
    console.log(`🎵 Generando ${mp3File} (${hz} Hz, ${duracion}s, reverb ${reverb})...`);

    // Paso 1: Generar onda base con SoX
    execSync(
      `sox -n -r ${soxBase.sampleRate} -c ${soxBase.channels} "${wavFile}" synth ${duracion} sine ${hz} vol ${soxBase.volume} reverb ${reverb}`
    );

    // Paso 2: Convertir a MP3 con FFmpeg
    execSync(`ffmpeg -y -loglevel quiet -i "${wavFile}" -codec:a libmp3lame -b:a 192k "${mp3File}"`);

    // Paso 3: Eliminar WAV temporal
    fs.unlinkSync(wavFile);

    console.log(`✅ ${mp3File} generado correctamente.\n`);
  } catch (error) {
    console.error(`❌ Error al generar ${nombre}:`, error.message);
  }
}

// Procesar todos los bloques
console.log("🎬 Iniciando generación de pistas ADSI...\n");
bloques.forEach((b) => generarAudio(b.id, b.hz, b.dur, b.rev, `${audioDir}/${b.id}`));

// Procesar efectos SFX
console.log("🎧 Generando efectos SFX...\n");
efectos.forEach((s) => generarAudio(s.id, s.hz, s.dur, s.rev, `${sfxDir}/${s.id}`));

console.log("🏁 Generación completa. Todos los archivos MP3 están en /audio y /audio/sfx.");
