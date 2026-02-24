# LIVEODI VIVIR v1.0

> ODI no se usa. ODI se habita.

Implementación base incluida en este repositorio:

- `viver/config/manifest.json`: reglas ejecutables del manifiesto.
- `viver/telemetry/server.py`: WebSocket server con Manifest Gate.
- `viver/telemetry/payloads.py`: contratos `order_paid`, `fitment_critical`, `guardian_alert`.
- `viver/overlay/*`: scaffold Electron (main, preload, renderer, llama canvas y ventana efímera).

## Ejecución rápida

```bash
python3 viver/telemetry/server.py
```

En otra terminal:

```bash
cd viver/overlay
npm install
npm start
```
