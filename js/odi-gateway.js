const DEFAULT_GATEWAY_API = window.ODI_GATEWAY_API || "https://api.liveodi.com/odi/v1";
const DEFAULT_CHAT_API = window.ODI_CHAT_API || "https://api.liveodi.com";

const SPEAK_ENDPOINTS = [
  window.ODI_SPEAK_API,
  "https://chat.liveodi.com/odi/chat/speak",
  "https://api.liveodi.com/odi/speak",
].filter(Boolean);

const GOVERNED_STORES = new Set(["DFG", "ARMOTOS", "VITTON", "IMBRA", "BARA", "KAIQI", "MCLMOTOS"]);

let audioUnlocked = false;

function parseStoreName(store) {
  return String(store?.name || store?.store || store?.code || "").toUpperCase();
}

function countProducts(store) {
  return Number(store?.products_count ?? store?.active ?? store?.total ?? 0);
}

function parsePrice(value) {
  if (value == null || value === "") return null;
  const normalized = Number(String(value).replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(normalized) ? normalized : null;
}

function normalizeProducts(data) {
  const rawProducts = data?.productos || data?.products || data?.product_list || [];
  if (!Array.isArray(rawProducts)) return [];

  return rawProducts
    .map((item) => ({
      sku: item?.sku || item?.code || item?.codigo || item?.id_producto || "",
      title: item?.title || item?.name || item?.nombre || "Producto",
      price: parsePrice(item?.price ?? item?.precio ?? item?.precio_venta),
      image: item?.image || item?.imagen || item?.thumbnail || "",
      url: item?.url || item?.link || item?.permalink || "",
      store: item?.store || item?.tienda || item?.proveedor || "",
    }))
    .filter((item) => item.title || item.sku || item.url);
}

async function playBlob(blob) {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  audio.onerror = () => URL.revokeObjectURL(url);
  await audio.play();
}

async function playFromUrl(url) {
  const audio = new Audio(url);
  await audio.play();
}

export async function unlockAudioPlayback() {
  if (audioUnlocked) return true;
  try {
    const ctx = new AudioContext();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start();
    await ctx.close();
    audioUnlocked = true;
    return true;
  } catch {
    return false;
  }
}

export async function fetchEcosystemStats() {
  try {
    const res = await fetch(`${DEFAULT_GATEWAY_API}/ecosystem/stores`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const stores = Array.isArray(data) ? data : data?.stores || data?.data || [];

    const governedActive = stores.filter((store) => {
      const name = parseStoreName(store);
      const products = countProducts(store);
      return GOVERNED_STORES.has(name) && products > 0;
    });

    if (governedActive.length > 0) {
      return governedActive.reduce(
        (acc, store) => {
          acc.activeStores += 1;
          acc.products += countProducts(store);
          return acc;
        },
        { activeStores: 0, products: 0 }
      );
    }

    const activeFallback = stores.filter((store) => countProducts(store) > 0);
    return activeFallback.reduce(
      (acc, store) => {
        acc.activeStores += 1;
        acc.products += countProducts(store);
        return acc;
      },
      { activeStores: 0, products: 0 }
    );
  } catch {
    return null;
  }
}

export async function sendChatMessage(message, sessionId) {
  const payload = { message, session_id: sessionId };
  const candidates = [`${DEFAULT_CHAT_API}/odi/chat`, `${DEFAULT_GATEWAY_API}/chat`];

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) continue;
      const data = await res.json();

      return {
        response: data.response || data.message || data.narrative || "",
        narrative: data.narrative || data.response || data.message || "",
        voice: data.voice || "ramona",
        sessionId: data.session_id || sessionId,
        products: normalizeProducts(data),
      };
    } catch {
      // intenta siguiente endpoint
    }
  }

  return null;
}

export async function speakText(text, voice = "ramona") {
  if (!text || !SPEAK_ENDPOINTS.length) return false;

  for (const endpoint of SPEAK_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "audio/mpeg, application/json" },
        body: JSON.stringify({ text, voice }),
      });

      if (!res.ok) continue;

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        const remoteAudioUrl = data?.audio_url || data?.url;
        if (remoteAudioUrl) {
          await playFromUrl(remoteAudioUrl);
          return true;
        }
        continue;
      }

      const blob = await res.blob();
      await playBlob(blob);
      return true;
    } catch {
      // intenta siguiente endpoint
    }
  }

  return false;
}
