import { fetchEcosystemStats, sendChatMessage, speakText } from "./odi-gateway.js";

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
  voiceButton.hidden = false;
}

function renderCards(products = []) {
  cardsContainer.innerHTML = "";
  if (!products.length) return;

  const limited = products.slice(0, 5);
  for (const product of limited) {
    const card = document.createElement("article");
    card.className = "card";

    const price = product.price != null ? `$${Number(product.price).toLocaleString("es-CO")}` : "";
    const store = product.store ? `<p class="meta">${product.store}</p>` : "";

    card.innerHTML = `
      ${product.image ? `<img src="${product.image}" alt="${product.title}" loading="lazy" />` : ""}
      <h3>${product.title}</h3>
      <p class="meta">${product.sku || ""}</p>
      <p class="price">${price}</p>
      ${store}
      ${product.url ? `<a href="${product.url}" target="_blank" rel="noopener">Ver</a>` : ""}
    `;

    cardsContainer.appendChild(card);
  }
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

  revealInput();
  await greetOnIntent();
  if (document.activeElement !== textInput) textInput.value += event.key;
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
  await greetOnIntent();
});

voiceButton.addEventListener("click", async () => {
  state.voiceEnabled = true;
  localStorage.setItem("odi_voice", "true");
  voiceButton.hidden = true;
  await speakText("Ahora puedo hablar contigo.", "ramona");
});

initStats();
setTimeout(revealVoiceOptIn, 2000);
