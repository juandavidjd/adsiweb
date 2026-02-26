const COLORS = {
  verde: 'rgb(0,255,200)',
  amarillo: 'rgb(255,210,80)',
  naranja: 'rgb(255,140,70)',
  rojo: 'rgb(255,70,90)',
  emerald: 'rgb(0,200,150)',
  amber: 'rgb(255,191,0)',
};

const canvas = document.getElementById('flame');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const ephemeralEl = document.getElementById('ephemeral');

let guardianState = 'verde';
let pulse = 0;
let mode = 'breathe';

function manifestGate(evt) {
  if (!evt.ethics_lock) return false;
  if (evt.event_type === 'guardian_alert') return true;

  const risk = evt.severity >= 0.8;
  const value = evt.event_type === 'order_paid';
  const needsVisual = evt.visual?.type === 'ephemeral_window';
  const score = [risk, value, needsVisual].filter(Boolean).length;

  return score >= 2 || evt.event_type === 'order_paid';
}

function guardianOverride(evt) {
  if (guardianState === 'rojo') return evt.event_type === 'guardian_alert';
  if (guardianState === 'naranja') return evt.event_type !== 'order_paid';
  return true;
}

function routeEvent(evt) {
  if (!manifestGate(evt)) return;
  if (!guardianOverride(evt)) return;

  guardianState = evt.guardian_state || guardianState;
  statusEl.textContent = `estado: ${guardianState}`;

  dispatchEffect(evt);
}

function dispatchEffect(evt) {
  if (evt.event_type === 'order_paid') {
    mode = 'pulse';
    setTimeout(() => (mode = 'breathe'), evt.ttl_ms || 2000);
  }

  if (evt.event_type === 'fitment_critical') {
    mode = 'pulse';
    ephemeralEl.classList.remove('hidden');
    ephemeralEl.innerHTML = `<h3>Compatibilidad ambigua</h3><pre>${JSON.stringify(evt.data, null, 2)}</pre>`;
    setTimeout(() => ephemeralEl.classList.add('hidden'), evt.ttl_ms || 8000);
  }

  if (evt.event_type === 'guardian_alert') {
    mode = 'shield';
    ephemeralEl.classList.add('hidden');
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  pulse += mode === 'pulse' ? 0.08 : 0.03;
  const radius = 82 + Math.sin(pulse) * (mode === 'shield' ? 4 : 12);
  const color = mode === 'shield' ? COLORS.amber : COLORS[guardianState] || COLORS.verde;

  const grad = ctx.createRadialGradient(200, 190, 20, 200, 200, radius + 60);
  grad.addColorStop(0, 'rgba(255,255,255,0.95)');
  grad.addColorStop(0.35, color.replace('rgb', 'rgba').replace(')', ',0.9)'));
  grad.addColorStop(0.85, color.replace('rgb', 'rgba').replace(')', ',0.2)'));
  grad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(200, 200, radius, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(draw);
}

function connectTelemetry() {
  const ws = new WebSocket('ws://localhost:8765');
  ws.onmessage = (message) => {
    try {
      routeEvent(JSON.parse(message.data));
    } catch (err) {
      console.error('Evento inválido', err);
    }
  };
  ws.onclose = () => setTimeout(connectTelemetry, 2000);
}

connectTelemetry();
draw();
