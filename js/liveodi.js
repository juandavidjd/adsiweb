import { fetchEcosystemStats, sendChatMessage, speakText, unlockAudioPlayback } from "./odi-gateway.js";

const presenceStatus = document.getElementById("presenceStatus");
const inputLayer = document.getElementById("inputLayer");
const textInput = document.getElementById("textInput");
const flame = document.getElementById("flame");
const greetingText = document.getElementById("greetingText");
const conversation = document.getElementById("conversation");
const voiceButton = document.getElementById("voiceOptIn");
const cardsContainer = document.getElementById("cards");

const state = {
  sessionId: crypto?.randomUUID?.() || `odi_${Date.now()}`,
  greeted: false,
  voiceEnabled: localStorage.getItem("odi_voice") === "true",
};

function setStatus(stats) {
  if (!stats) {
    presenceStatus.textContent = "vivo";
    return;
  }

  const productsText = stats.products.toLocaleString("es-CO");
  presenceStatus.textContent = `${stats.activeStores} tiendas · ${productsText} productos · vivo`;
}

function pushMessage(content, role = "odi") {
  const box = document.createElement("article");
  box.className = role === "user" ? "msg msg-user" : "msg msg-odi";
  box.textContent = content;
  conversation.prepend(box);
}

async function maybeSpeak(text, voice) {
  if (!state.voiceEnabled) return;
  await speakText(text, voice || "ramona");
}

function revealInput() {
  if (inputLayer.dataset.visible === "true") return;
  inputLayer.dataset.visible = "true";
  textInput.focus();
}

function revealVoiceOptIn() {
  if (!voiceButton || state.voiceEnabled) return;
  voiceButton.hidden = false;
}

function safeText(value) {
  return value == null ? "" : String(value);
}

function createCard(product) {
  const card = document.createElement("article");
  card.className = "card";

  if (product.image) {
    const img = document.createElement("img");
    img.src = safeText(product.image);
    img.alt = safeText(product.title || "Producto");
    img.loading = "lazy";
    card.appendChild(img);
  }

  const title = document.createElement("h3");
  title.textContent = safeText(product.title || "Producto");
  card.appendChild(title);

  if (product.sku) {
    const sku = document.createElement("p");
    sku.className = "meta";
    sku.textContent = safeText(product.sku);
    card.appendChild(sku);
  }

  if (product.price != null) {
    const price = document.createElement("p");
    price.className = "price";
    price.textContent = `$${Number(product.price).toLocaleString("es-CO")}`;
    card.appendChild(price);
  }

  if (product.store) {
    const store = document.createElement("p");
    store.className = "meta";
    store.textContent = safeText(product.store);
    card.appendChild(store);
  }

  if (product.url) {
    const link = document.createElement("a");
    link.href = safeText(product.url);
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Ver";
    card.appendChild(link);
  }

  return card;
}

function renderCards(products = []) {
  cardsContainer.innerHTML = "";
  if (!Array.isArray(products) || products.length === 0) return;

  products.slice(0, 5).forEach((product) => {
    cardsContainer.appendChild(createCard(product));
  });
}

async function greetOnIntent() {
  if (state.greeted) return;
  state.greeted = true;
  const greeting = "Hola.";
  greetingText.textContent = greeting;
  pushMessage(greeting, "odi");
  await maybeSpeak(greeting, "ramona");
}

async function initStats() {
  const stats = await fetchEcosystemStats();
  setStatus(stats);
}

window.addEventListener("keydown", async (event) => {
  const printable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
  if (!printable) return;

  const wasInputVisible = inputLayer.dataset.visible === "true";

  revealInput();
  await unlockAudioPlayback();
  await greetOnIntent();

  // Conserva la primera pulsación cuando el input estaba oculto.
  if (!wasInputVisible && document.activeElement === textInput) {
    textInput.value = `${textInput.value}${event.key}`;
    event.preventDefault();
  }
});

textInput.addEventListener("keydown", async (event) => {
  if (event.key !== "Enter") return;
  const value = textInput.value.trim();
  if (!value) return;

  pushMessage(value, "user");
  textInput.value = "";

  const result = await sendChatMessage(value, state.sessionId);
  const response = result?.response || "No pude conectar con el núcleo ahora.";
  pushMessage(response, "odi");

  state.sessionId = result?.sessionId || state.sessionId;
  renderCards(result?.products || []);
  await maybeSpeak(result?.narrative || response, result?.voice || "ramona");
});

flame.addEventListener("click", async () => {
  revealInput();
  await unlockAudioPlayback();
  await greetOnIntent();
});

if (voiceButton) {
  voiceButton.addEventListener("click", async () => {
    state.voiceEnabled = true;
    localStorage.setItem("odi_voice", "true");
    voiceButton.hidden = true;
    await unlockAudioPlayback();
    await speakText("Ahora puedo hablar contigo.", "ramona");
  });
}

initStats();
setTimeout(revealVoiceOptIn, 2000);
