"""Contratos de vida de LIVEODI VIVIR v0.1."""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any, Dict


@dataclass
class BasePayload:
    event_type: str
    source: str
    ethics_lock: bool = True
    severity: float = 0.0
    guardian_state: str = "verde"
    ttl_ms: int = 0
    visual: Dict[str, Any] = field(default_factory=dict)
    audio: Dict[str, Any] = field(default_factory=dict)
    data: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def order_paid(
    order_id: str,
    store: str,
    amount_cop: int,
    commission_rate: float,
    session_id: str,
) -> Dict[str, Any]:
    payload = BasePayload(
        event_type="order_paid",
        source="odi-billing",
        severity=0.55,
        guardian_state="verde",
        ttl_ms=6000,
        visual={"type": "flame_pulse", "color": "emerald", "intensity": 0.6},
        audio={
            "voice": "ramona",
            "text": f"Venta confirmada. {amount_cop:,} pesos. Mérito {commission_rate*100:.1f} por ciento.",
            "sufficient": True,
        },
        data={
            "order_id": order_id,
            "store": store,
            "amount_cop": amount_cop,
            "commission_rate": commission_rate,
            "odi_session_id": session_id,
        },
    )
    return payload.to_dict()


def fitment_critical(sku: str, vehicle: str, conflict: str, options: list[dict]) -> Dict[str, Any]:
    payload = BasePayload(
        event_type="fitment_critical",
        source="odi-kb-crunch",
        severity=0.82,
        guardian_state="verde",
        ttl_ms=12000,
        visual={"type": "ephemeral_window", "layout": "compare", "opacity": 0.92, "anchor": "center"},
        audio={"voice": "ramona", "text": "Compatibilidad ambigua detectada. Requiere validación visual.", "sufficient": False},
        data={"sku": sku, "vehicle": vehicle, "conflict": conflict, "options": options, "impact_risk": "logistico"},
    )
    return payload.to_dict()


def guardian_alert(reason: str, signals: Dict[str, Any]) -> Dict[str, Any]:
    payload = BasePayload(
        event_type="guardian_alert",
        source="odi-guardian",
        severity=0.94,
        guardian_state="naranja",
        ttl_ms=0,
        visual={"type": "flame_shield", "color": "amber", "vibration": "low"},
        audio={"voice": "ramona", "text": "He activado el protocolo de cuidado. Confirma con tu santo y seña.", "sufficient": True},
        data={"reason": reason, "signals": signals, "requires": "voice_passphrase"},
    )
    return payload.to_dict()
