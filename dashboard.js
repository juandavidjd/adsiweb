async function update() {
  const res = await fetch("/api/status");
  const data = await res.json();

  document.getElementById("cpu").textContent = `${data.cpu}%`;
  document.getElementById("mem").textContent = `${data.usedMem}%`;
  document.getElementById("uptime").textContent = `${data.uptime} min`;

  const modList = document.getElementById("modlist");
  modList.innerHTML = "";
  data.modules.forEach(m => {
    const li = document.createElement("li");
    li.textContent = `${m.name} — ${m.running ? "🟢 Activo" : "🔴 Inactivo"}`;
    modList.appendChild(li);
  });
}

async function control(action) {
  const res = await fetch(`/api/control/${action}`);
  const msg = await res.json();
  alert(msg.message || msg.error);
}

setInterval(update, 5000);
update();
