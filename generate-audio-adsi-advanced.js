/**
 * 🧬 Generador Avanzado de Pistas Cinematográficas ADSI
 * Versión 2.0.0 — Multicapa + Ambient + Subgraves
 * Requiere: SoX + FFmpeg (libmp3lame habilitado)
 */

import { execSync } from "child_process";
import fs from "fs";

const audioDir = "C:/adsiweb/audio";
const sfxDir = `${audioDir}/sfx`;

if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
if (!fs.existsSync(sfxDir)) fs.mkdirSync(sfxDir, { recursive: true });

// Configuración base
const sox = {
  sr: 48000,
  ch: 2,
  vol: 0.45
};

// Bloques ADSI principales
const bloques = [
  { id: "bloque1_intro", hz: 432, dur: 45, rev: 60, tipo: "sine" },
  { id: "bloque2_fases", hz: 528, dur: 90, rev: 50, tipo: "triangle" },
  { id: "bloque3_filosofia", hz: 396, dur: 40, rev: 70, tipo: "sawtooth" },
  { id: "bloque4_diagnostico", hz: 639, dur: 40, rev: 40, tipo: "sine" },
  { id: "bloque5_cierre", hz: 285, dur: 40, rev: 50, tipo: "triangle" },
  { id: "bloque6_firma", hz: 528, dur: 15, rev: 70, tipo: "sine" }
];

// Efectos SFX
const efectos = [
  { id: "intro_ambience", hz: 432, dur: 25, rev: 90 },
  { id: "transicion_cognitiva", hz: 639, dur: 3, rev: 25 },
  { id: "pulso_activacion", hz: 80, dur: 1.2, rev: 10 },
  { id: "eco_adsi", hz: 396, dur: 3, rev: 60 },
  { id: "sello_cognitivo", hz: 528, dur: 1.8, rev: 50 }
];

// 🌌 Generar pista multicapa
function generarPistaCinematica(nombre, hz, dur, reverb, tipo, destino) {
  const wavBase = `${destino}_base.wav`;
  const wavPad = `${destino}_pad.wav`;
  const wavSub = `${destino}_sub.wav`;
  const wavMix = `${destino}_mix.wav`;
  const mp3Final = `${destino}.mp3`;

  try {
    console.log(`🎬 Generando pista cinematográfica: ${nombre} (${hz}Hz, ${dur}s)`);

    // Capa 1: tono base
    execSync(
      `sox -n -r ${sox.sr} -c ${sox.ch} "${wavBase}" synth ${dur} ${tipo} ${hz} vol ${sox.vol} reverb ${reverb}`
    );

    // Capa 2: pad ambiental (ruido filtrado + reverb alta)
    execSync(
      `sox -n -r ${sox.sr} -c ${sox.ch} "${wavPad}" synth ${dur} pinknoise vol 0.2 reverb 90 lowpass 800`
    );

    // Capa 3: subgrave (refuerzo emocional)
    execSync(
      `sox -n -r ${sox.sr} -c ${sox.ch} "${wavSub}" synth ${dur} sine ${hz / 2} vol 0.25`
    );

    // Mezcla final
    execSync(`sox -m "${wavBase}" "${wavPad}" "${wavSub}" "${wavMix}"`);
    execSync(`ffmpeg -y -loglevel quiet -i "${wavMix}" -codec:a libmp3lame -b:a 256k "${mp3Final}"`);

    // Limpieza temporal
    [wavBase, wavPad, wavSub, wavMix].forEach(f => fs.unlinkSync(f));

    console.log(`✅ ${mp3Final} creado exitosamente.\n`);
  } catch (err) {
    console.error(`❌ Error en ${nombre}: ${err.message}`);
  }
}

// 💥 Generar SFX con texturas
function generarSFX(nombre, hz, dur, reverb, destino) {
  const wav = `${destino}.wav`;
  const mp3 = `${destino}.mp3`;

  try {
    console.log(`🔊 Generando SFX: ${nombre} (${hz}Hz, ${dur}s)`);

    execSync(
      `sox -n -r ${sox.sr} -c ${sox.ch} "${wav}" synth ${dur} sine ${hz} vol 0.5 fade 0.05 ${dur} 0.2 reverb ${reverb}`
    );
    execSync(`ffmpeg -y -loglevel quiet -i "${wav}" -codec:a libmp3lame -b:a 224k "${mp3}"`);
    fs.unlinkSync(wav);

    console.log(`✅ ${mp3} generado.\n`);
  } catch (err) {
    console.error(`❌ Error al generar ${nombre}: ${err.message}`);
  }
}

// 🚀 Ejecución
console.log("🧠 Iniciando generación avanzada del paisaje sonoro ADSI...\n");

bloques.forEach(b =>
  generarPistaCinematica(b.id, b.hz, b.dur, b.rev, b.tipo, `${audioDir}/${b.id}`)
);

console.log("🎧 Generando efectos cinematográficos SFX...\n");
efectos.forEach(s =>
  generarSFX(s.id, s.hz, s.dur, s.rev, `${sfxDir}/${s.id}`)
);

console.log("\n🏁 Proceso completado: Paisaje sonoro cinematográfico ADSI listo.");
