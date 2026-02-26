#!/usr/bin/env python3
"""Servidor de telemetría LIVEODI VIVIR."""

from __future__ import annotations

import asyncio
import json
from typing import Any, Dict, Set

import websockets
from websockets.server import WebSocketServerProtocol

HOST = "0.0.0.0"
PORT = 8765
CLIENTS: Set[WebSocketServerProtocol] = set()


def manifest_allows(payload: Dict[str, Any]) -> bool:
    if not payload.get("ethics_lock", False):
        return False

    if payload.get("event_type") == "guardian_alert":
        return True

    if payload.get("guardian_state") in {"naranja", "rojo"}:
        return payload.get("event_type") == "guardian_alert"

    requires_ui = payload.get("visual", {}).get("type") in {"ephemeral_window", "overlay"}
    if requires_ui:
        risk = payload.get("severity", 0) >= 0.8
        value = payload.get("data", {}).get("amount_cop", 0) > 50000
        audio_insufficient = not payload.get("audio", {}).get("sufficient", False)
        return sum([risk, value, audio_insufficient]) >= 2

    return True


async def emit_event(payload: Dict[str, Any]) -> bool:
    if not manifest_allows(payload):
        print(f"🔇 [Silencio] {payload.get('event_type', '?')} suprimido")
        return False

    message = json.dumps(payload, ensure_ascii=False)
    if CLIENTS:
        await asyncio.gather(*[client.send(message) for client in CLIENTS])
    print(f"📡 [Latido] {payload.get('event_type', '?')} enviado ({len(CLIENTS)} clientes)")
    return True


async def handler(ws: WebSocketServerProtocol):
    CLIENTS.add(ws)
    print(f"🟢 Cliente conectado. Total: {len(CLIENTS)}")
    try:
        async for raw in ws:
            try:
                payload = json.loads(raw)
            except json.JSONDecodeError:
                await ws.send(json.dumps({"error": "invalid_json"}))
                continue

            if payload.get("type") == "emit":
                ok = await emit_event(payload.get("payload", {}))
                await ws.send(json.dumps({"type": "ack", "ok": ok}))
            else:
                await ws.send(json.dumps({"type": "noop"}))
    finally:
        CLIENTS.discard(ws)
        print(f"🔴 Cliente desconectado. Total: {len(CLIENTS)}")


async def main():
    print(f"🧠 VIVIR Telemetry activo en ws://{HOST}:{PORT}")
    async with websockets.serve(handler, HOST, PORT):
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
