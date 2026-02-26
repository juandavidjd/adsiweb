# ORDEN CLAUDE CODE — LIVEODI VIVIR (Lectura + Ejecución)

## Objetivo
Ejecutar de forma controlada y verificable la base LIVEODI VIVIR existente en este repositorio (`overlay + telemetría + manifiesto`) y dejar evidencia operativa.

> Regla guía: **"ODI no se usa. ODI se habita."**

---

## 0) Contexto que debes leer antes de ejecutar
Lee estos archivos **en este orden**:

1. `viver/docs/MANIFIESTO_VIVIR_v1.0.md`
2. `viver/config/manifest.json`
3. `viver/telemetry/server.py`
4. `viver/telemetry/payloads.py`
5. `viver/overlay/renderer.js`

Si detectas contradicciones entre manifiesto y código, prioriza:
1) seguridad/ética (`ethics_lock`, guardian),
2) silencio operativo,
3) ventanas efímeras con TTL.

---

## 1) Preflight (obligatorio)
Ejecuta exactamente:

```bash
cd /workspace/adsiweb

echo "=== PREFLIGHT VIVIR ==="
python3 --version
node --version
npm --version

python3 -m py_compile viver/telemetry/server.py viver/telemetry/payloads.py
node --check viver/overlay/main.js
node --check viver/overlay/preload.js
node --check viver/overlay/renderer.js

echo "=== FIN PREFLIGHT ==="
```

Criterio de salida:
- Si algo falla, **no avances** a ejecución runtime.
- Corrige primero y vuelve a correr preflight.

---

## 2) Levantar telemetría
Terminal A:

```bash
cd /workspace/adsiweb
python3 viver/telemetry/server.py
```

Esperado:
- Log `🧠 VIVIR Telemetry activo en ws://0.0.0.0:8765`

---

## 3) Levantar overlay (Electron)
Terminal B:

```bash
cd /workspace/adsiweb/viver/overlay
npm install
npm start
```

Esperado:
- Ventana overlay transparente activa
- Llama circular respirando
- Estado inicial `verde`

---

## 4) Prueba de eventos (inyección de payload)
Terminal C (con server y overlay activos):

### 4.1 Evento: `order_paid` (sin ventana efímera)
```bash
python3 - <<'PY'
import asyncio, json, websockets
from viver.telemetry.payloads import order_paid

async def main():
    evt = order_paid(
        order_id="SHOPIFY-TEST-001",
        store="ARMOTOS",
        amount_cop=285000,
        commission_rate=0.061,
        session_id="odi_sess_test",
    )
    async with websockets.connect("ws://localhost:8765") as ws:
        await ws.send(json.dumps({"type":"emit", "payload": evt}, ensure_ascii=False))
        print(await ws.recv())

asyncio.run(main())
PY
```

### 4.2 Evento: `fitment_critical` (ventana efímera + TTL)
```bash
python3 - <<'PY'
import asyncio, json, websockets
from viver.telemetry.payloads import fitment_critical

async def main():
    evt = fitment_critical(
        sku="KIT-ARR-PULSAR200",
        vehicle="Pulsar 200 NS",
        conflict="años 2018 vs 2020",
        options=[
            {"year": 2018, "status": "compatible"},
            {"year": 2020, "status": "no compatible"}
        ],
    )
    async with websockets.connect("ws://localhost:8765") as ws:
        await ws.send(json.dumps({"type":"emit", "payload": evt}, ensure_ascii=False))
        print(await ws.recv())

asyncio.run(main())
PY
```

### 4.3 Evento: `guardian_alert` (modo escudo)
```bash
python3 - <<'PY'
import asyncio, json, websockets
from viver.telemetry.payloads import guardian_alert

async def main():
    evt = guardian_alert(
        reason="fatiga_detectada",
        signals={"cpu_hours": 11.4, "interacciones_continuas": 92}
    )
    async with websockets.connect("ws://localhost:8765") as ws:
        await ws.send(json.dumps({"type":"emit", "payload": evt}, ensure_ascii=False))
        print(await ws.recv())

asyncio.run(main())
PY
```

---

## 5) Criterios de aceptación
Debes validar y reportar:

1. `order_paid`:
   - Sí pulso/confirmación
   - **No** ventana efímera persistente
2. `fitment_critical`:
   - Sí ventana efímera
   - Desaparece por TTL sin intervención
3. `guardian_alert`:
   - Entra modo escudo
   - Suprime eventos no permitidos según estado guardian
4. `ethics_lock=false`:
   - Evento descartado por Gate

---

## 6) Reporte mínimo obligatorio
Entrega un reporte con este formato:

```md
## Resultado ejecución VIVIR
- Preflight: PASS/FAIL
- Telemetría WS: PASS/FAIL
- Overlay: PASS/FAIL
- order_paid: PASS/FAIL
- fitment_critical (TTL): PASS/FAIL
- guardian_alert: PASS/FAIL
- ethics_lock gate: PASS/FAIL
- Riesgos detectados:
- Recomendación siguiente iteración:
```

---

## 7) Restricciones
- No introducir nuevas dependencias backend fuera de `websockets` para esta orden.
- No cambiar semántica del manifiesto sin documentar diff explícito.
- No convertir VIVIR en “chat widget”; debe mantenerse el paradigma de presencia.

