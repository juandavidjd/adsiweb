const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
const audio = document.getElementById("soundscape");
const voices = window.speechSynthesis;

let w, h, t = 0;
function resize() { w = canvas.width = innerWidth; h = canvas.height = innerHeight; }
resize();
window.onresize = resize;

function pulse(color, intensity) {
  const grd = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
  grd.addColorStop(0, `${color}${intensity}`);
  grd.addColorStop(1, "black");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1; utter.pitch = 1.1;
  utter.voice = voices.getVoices().find(v => v.lang.startsWith("es"));
  speechSynthesis.speak(utter);
}

async function update() {
  const res = await fetch("/api/state");
  const { cpu, mem, uptime } = await res.json();

  document.getElementById("cpu").textContent = `${cpu}%`;
  document.getElementById("mem").textContent = `${mem}%`;
  document.getElementById("uptime").textContent = `${uptime}m`;

  // Color emocional dinámico
  const mood = mem < 50 ? "#00ffff" : mem < 75 ? "#ffaa00" : "#ff0033";
  const intensity = Math.min(1, parseFloat(cpu) / 100);
  pulse(mood, Math.floor(intensity * 99));

  // Feedback de voz cada minuto
  if (parseInt(uptime) % 2 === 0 && Math.random() < 0.05)
    speak(`Nivel de energía estable. CPU al ${cpu} por ciento. Estado óptimo.`);

  t += 0.01;
  requestAnimationFrame(update);
}

// Inicia soundscape y animación
audio.volume = 0.5;
audio.play().catch(() => console.log("Esperando interacción para reproducir audio..."));
update();
