// ==UserScript==
// @name         PokePixel Market Tooltip
// @namespace    https://pokepixel.nietore.com/
// @version      1.0.0
// @description  Mostra um card com todos os dados da criatura ao passar o mouse sobre um anuncio do mercado do PokePixel.
// @author       you
// @match        https://pokepixel.nietore.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pokepixel.nietore.com
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  /* ---------------------------------------------------------------- */
  /* CSS injetado (equivalente ao styles.css da extensao)              */
  /* ---------------------------------------------------------------- */
  const PPX_CSS = `
.ppx-tooltip {
  position: fixed;
  z-index: 2147483647;
  top: 0;
  left: 0;
  width: 320px;
  max-width: 90vw;
  pointer-events: none;
  opacity: 0;
  transform: translateY(4px) scale(0.98);
  transition: opacity 120ms ease, transform 120ms ease;
  font-family: "Segoe UI", Roboto, Inter, system-ui, -apple-system, sans-serif;
  font-size: 13px;
  line-height: 1.4;
}

.ppx-tooltip.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.ppx-card {
  background: linear-gradient(160deg, rgba(24, 24, 34, 0.97), rgba(15, 15, 24, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.3);
  color: #e6e6f0;
  backdrop-filter: blur(10px);
}

.ppx-loading {
  background: rgba(20, 20, 30, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px;
  color: #cfcfe0;
  text-align: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}

/* Header */
.ppx-header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.ppx-avatar-wrap {
  flex: 0 0 auto;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.ppx-avatar-wrap.shiny-glow {
  box-shadow: 0 0 0 2px #fde047 inset, 0 0 14px rgba(253, 224, 71, 0.55);
}

.ppx-avatar {
  width: 44px;
  height: 44px;
  image-rendering: pixelated;
  object-fit: contain;
}

.ppx-header-info {
  flex: 1;
  min-width: 0;
}

.ppx-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ppx-name {
  font-weight: 700;
  font-size: 15px;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ppx-gender.male { color: #60a5fa; }
.ppx-gender.female { color: #f472b6; }
.ppx-gender.neutral { color: #9ca3af; }

.ppx-subtitle {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #a1a1b5;
  margin-top: 1px;
}

.ppx-badges-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.ppx-pill {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border: 1px solid transparent;
}

.ppx-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
}

.ppx-badge.shiny {
  background: rgba(253, 224, 71, 0.15);
  color: #fde047;
  border: 1px solid rgba(253, 224, 71, 0.4);
}

.ppx-badge.mega {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.4);
}

/* Types */
.ppx-types-row {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.ppx-type-chip {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.75);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* Sections */
.ppx-section {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.ppx-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8b8ba3;
  margin-bottom: 8px;
}

/* Stats (status atuais) */
.ppx-stat-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.ppx-stat-label {
  color: #b8b8cc;
  font-size: 11px;
}

.ppx-stat-value {
  font-weight: 700;
  color: #ffffff;
  font-size: 12px;
  text-align: right;
}

/* IVs (Individual Values) — seção própria e destacada */
.ppx-iv-section {
  background: rgba(96, 165, 250, 0.06);
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 10px;
  padding: 10px 10px 6px;
}

.ppx-iv-total-badge {
  background: rgba(96, 165, 250, 0.18);
  color: #93c5fd;
  border: 1px solid rgba(96, 165, 250, 0.4);
  border-radius: 999px;
  padding: 1px 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
}

.ppx-iv-row {
  display: grid;
  grid-template-columns: 68px 1fr 56px;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.ppx-iv-label {
  color: #b8b8cc;
  font-size: 11px;
}

.ppx-iv-bar-track {
  height: 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.ppx-iv-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
}

.ppx-iv-value {
  font-size: 11px;
  font-weight: 700;
  color: #dbeafe;
  text-align: right;
}

.ppx-iv-max {
  font-weight: 400;
  color: #8b8ba3;
  font-size: 10px;
}

.ppx-iv-row.perfect .ppx-iv-bar-fill {
  background: linear-gradient(90deg, #fde047, #facc15);
}

.ppx-iv-row.perfect .ppx-iv-value {
  color: #fde047;
}

.ppx-iv-row.perfect .ppx-iv-label {
  color: #fde047;
}

/* Nature */
.ppx-nature {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ppx-nature-name {
  font-weight: 700;
  color: #ffffff;
  font-size: 12.5px;
}

.ppx-nature-neutral {
  font-size: 11px;
  color: #9ca3af;
}

.ppx-nature-mod {
  display: flex;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
}

.ppx-nature-up { color: #4ade80; }
.ppx-nature-down { color: #f87171; }

/* Meta grid */
.ppx-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
}

.ppx-meta-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.ppx-meta-label {
  font-size: 10px;
  color: #8b8ba3;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.ppx-meta-value {
  font-size: 12.5px;
  font-weight: 700;
  color: #ffffff;
}

/* Footer */
.ppx-footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ppx-footer-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #9c9cb5;
}

.ppx-footer-row strong {
  color: #d8d8e8;
  font-weight: 600;
}
`;

  if (typeof GM_addStyle === 'function') {
    GM_addStyle(PPX_CSS);
  } else {
    const styleTag = document.createElement('style');
    styleTag.textContent = PPX_CSS;
    document.head.appendChild(styleTag);
  }

  /* ---------------------------------------------------------------- */
  /* Logica original do content.js (extensao)                          */
  /* ---------------------------------------------------------------- */

/* =========================================================================
 * PokePixel Market Tooltip
 * Ao passar o mouse sobre <article class="market-listing kind-pokemon"
 * data-listing-id="...">, exibe um card com os dados de `creature`
 * cruzando o data-listing-id com o `id` retornado pela API de listagens.
 * ===========================================================================
 */

const API_URL = "https://pokepixel.nietore.com/api/v1/market/listings";
const REFRESH_INTERVAL_MS = 45_000;
const ARTICLE_SELECTOR = 'article.market-listing.kind-pokemon[data-listing-id]';

/** Cache: listingId -> objeto de listing completo (inclui .creature) */
const listingsCache = new Map();

let currentHoverId = null;
let tooltipEl = null;
let fetchInFlight = null;

/* ------------------------------------------------------------------ */
/* Dados de apoio: naturezas, qualidades e tipos                       */
/* ------------------------------------------------------------------ */

const STAT_LABELS = {
  hp: "HP",
  atk: "Ataque",
  def: "Defesa",
  spa: "Atq. Esp.",
  spd: "Def. Esp.",
  spe: "Velocidade",
};

// Natureza -> status que sobe (+10%) e status que desce (-10%)
const NATURE_STATS = {
  hardy: { plus: null, minus: null },
  lonely: { plus: "atk", minus: "def" },
  brave: { plus: "atk", minus: "spe" },
  adamant: { plus: "atk", minus: "spa" },
  naughty: { plus: "atk", minus: "spd" },
  bold: { plus: "def", minus: "atk" },
  docile: { plus: null, minus: null },
  relaxed: { plus: "def", minus: "spe" },
  impish: { plus: "def", minus: "spa" },
  lax: { plus: "def", minus: "spd" },
  timid: { plus: "spe", minus: "atk" },
  hasty: { plus: "spe", minus: "def" },
  serious: { plus: null, minus: null },
  jolly: { plus: "spe", minus: "spa" },
  naive: { plus: "spe", minus: "spd" },
  modest: { plus: "spa", minus: "atk" },
  mild: { plus: "spa", minus: "def" },
  quiet: { plus: "spa", minus: "spe" },
  bashful: { plus: null, minus: null },
  rash: { plus: "spa", minus: "spd" },
  calm: { plus: "spd", minus: "atk" },
  gentle: { plus: "spd", minus: "def" },
  sassy: { plus: "spd", minus: "spe" },
  careful: { plus: "spd", minus: "spa" },
  quirky: { plus: null, minus: null },
};

const NATURE_LABELS_PT = {
  hardy: "Robusta", lonely: "Solitária", brave: "Corajosa", adamant: "Firme",
  naughty: "Travessa", bold: "Ousada", docile: "Dócil", relaxed: "Serena",
  impish: "Sapeca", lax: "Relaxada", timid: "Tímida", hasty: "Apressada",
  serious: "Séria", jolly: "Divertida", naive: "Ingênua", modest: "Modesta",
  mild: "Amena", quiet: "Quieta", bashful: "Envergonhada", rash: "Precipitada",
  calm: "Calma", gentle: "Gentil", sassy: "Atrevida", careful: "Cautelosa",
  quirky: "Excêntrica",
};

// Qualidade -> { label em pt-BR, cor da pill, cor do texto }
const QUALITY_MAP = {
  weak: { label: "Fraco", bg: "#f5f5f5", fg: "#3a3a3a", border: "#d4d4d4" },
  poor: { label: "Fraco", bg: "#f5f5f5", fg: "#3a3a3a", border: "#d4d4d4" },
  common: { label: "Comum", bg: "#22c55e", fg: "#052e16", border: "#16a34a" },
  uncommon: { label: "Incomum", bg: "#3b82f6", fg: "#0b1e4a", border: "#2563eb" },
  rare: { label: "Raro", bg: "#a855f7", fg: "#2e0a4d", border: "#9333ea" },
  epic: { label: "Épico", bg: "#eab308", fg: "#3a2a02", border: "#ca8a04" },
  legendary: { label: "Lendário", bg: "#f97316", fg: "#3a1a02", border: "#ea580c" },
  mythic: { label: "Mítico", bg: "#ef4444", fg: "#3a0505", border: "#dc2626" },
  mythical: { label: "Mítico", bg: "#ef4444", fg: "#3a0505", border: "#dc2626" },
};

const TYPE_COLORS = {
  normal: "#a8a878", fire: "#f08030", water: "#6890f0", electric: "#f8d030",
  grass: "#78c850", ice: "#98d8d8", fighting: "#c03028", poison: "#a040a0",
  ground: "#e0c068", flying: "#a890f0", psychic: "#f85888", bug: "#a8b820",
  rock: "#b8a038", ghost: "#705898", dragon: "#7038f8", dark: "#705848",
  steel: "#b8b8d0", fairy: "#ee99ac",
};

const TYPE_LABELS_PT = {
  normal: "Normal", fire: "Fogo", water: "Água", electric: "Elétrico",
  grass: "Planta", ice: "Gelo", fighting: "Lutador", poison: "Veneno",
  ground: "Terra", flying: "Voador", psychic: "Psíquico", bug: "Inseto",
  rock: "Pedra", ghost: "Fantasma", dragon: "Dragão", dark: "Sombrio",
  steel: "Aço", fairy: "Fada",
};

/* ------------------------------------------------------------------ */
/* Fetch / cache das listagens                                         */
/* ------------------------------------------------------------------ */

async function fetchListings() {
  if (fetchInFlight) return fetchInFlight;

  fetchInFlight = (async () => {
    try {
      const res = await fetch(API_URL, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const items = json?.data ?? json?.listings ?? [];
      for (const item of items) {
        if (item?.id) listingsCache.set(item.id, item);
      }
    } catch (err) {
      console.warn("[PokePixel Tooltip] Falha ao buscar listagens:", err);
    } finally {
      fetchInFlight = null;
    }
  })();

  return fetchInFlight;
}

fetchListings();
setInterval(fetchListings, REFRESH_INTERVAL_MS);

/* ------------------------------------------------------------------ */
/* Construção do tooltip (DOM)                                         */
/* ------------------------------------------------------------------ */

function ensureTooltipEl() {
  if (tooltipEl) return tooltipEl;
  tooltipEl = document.createElement("div");
  tooltipEl.className = "ppx-tooltip";
  document.body.appendChild(tooltipEl);
  return tooltipEl;
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function genderSymbol(gender) {
  if (gender === "male") return `<span class="ppx-gender male">♂</span>`;
  if (gender === "female") return `<span class="ppx-gender female">♀</span>`;
  return `<span class="ppx-gender neutral">⚲</span>`;
}

function buildQualityPill(quality) {
  const key = (quality || "").toLowerCase();
  const info = QUALITY_MAP[key] || { label: quality || "Desconhecido", bg: "#9ca3af", fg: "#1f2937", border: "#6b7280" };
  return `<span class="ppx-pill" style="background:${info.bg};color:${info.fg};border-color:${info.border}">${info.label}</span>`;
}

function buildTypeChips(elements) {
  if (!Array.isArray(elements) || elements.length === 0) return "";
  return elements
    .map((el) => {
      const key = (el || "").toLowerCase();
      const color = TYPE_COLORS[key] || "#8a8a8a";
      const label = TYPE_LABELS_PT[key] || (el ? el[0].toUpperCase() + el.slice(1) : "");
      return `<span class="ppx-type-chip" style="background:${color}">${label}</span>`;
    })
    .join("");
}

function buildNatureInfo(nature) {
  const key = (nature || "").toLowerCase();
  const info = NATURE_STATS[key];
  const label = NATURE_LABELS_PT[key] || (nature ? nature[0].toUpperCase() + nature.slice(1) : "—");

  if (!info || (!info.plus && !info.minus)) {
    return `<div class="ppx-nature">
      <span class="ppx-nature-name">${label}</span>
      <span class="ppx-nature-neutral">Natureza neutra — sem bônus ou penalidade</span>
    </div>`;
  }

  const plusLabel = STAT_LABELS[info.plus] || info.plus;
  const minusLabel = STAT_LABELS[info.minus] || info.minus;

  return `<div class="ppx-nature">
    <span class="ppx-nature-name">${label}</span>
    <span class="ppx-nature-mod">
      <span class="ppx-nature-up">▲ ${plusLabel}</span>
      <span class="ppx-nature-down">▼ ${minusLabel}</span>
    </span>
  </div>`;
}

function statRow(key, current) {
  return `
    <div class="ppx-stat-row">
      <span class="ppx-stat-label">${STAT_LABELS[key] || key}</span>
      <span class="ppx-stat-value">${current ?? "—"}</span>
    </div>`;
}

function ivRow(key, iv) {
  const value = typeof iv === "number" ? iv : 0;
  const pct = Math.round((value / 31) * 100);
  const isPerfect = value >= 31;
  return `
    <div class="ppx-iv-row ${isPerfect ? "perfect" : ""}">
      <span class="ppx-iv-label">${STAT_LABELS[key] || key}</span>
      <div class="ppx-iv-bar-track">
        <div class="ppx-iv-bar-fill" style="width:${pct}%"></div>
      </div>
      <span class="ppx-iv-value">${iv ?? "—"}<span class="ppx-iv-max">/31</span>${isPerfect ? " ★" : ""}</span>
    </div>`;
}

function buildTooltipContent(listing) {
  if (!listing) {
    return `<div class="ppx-loading">Carregando dados da criatura…</div>`;
  }

  const c = listing.creature;
  if (!c) {
    return `<div class="ppx-loading">Sem dados de criatura para este anúncio.</div>`;
  }

  const spriteUrl = c.is_shiny ? c.shiny_sprite_url : c.normal_sprite_url;
  const fullSpriteUrl = spriteUrl
    ? new URL(spriteUrl, "https://pokepixel.nietore.com").toString()
    : "";

  const ivTotal = c.ivs
    ? Object.values(c.ivs).reduce((a, b) => a + (b || 0), 0)
    : null;

  const badges = [];
  if (c.is_shiny) badges.push(`<span class="ppx-badge shiny">✨ Shiny</span>`);
  if (c.mega_active) badges.push(`<span class="ppx-badge mega">⚡ Mega Ativo</span>`);

  const statKeys = ["hp", "atk", "def", "spa", "spd", "spe"];
  const currentStats = { hp: c.max_hp ?? c.hp, atk: c.atk, def: c.def, spa: c.spa, spd: c.spd, spe: c.spe };

  return `
    <div class="ppx-card">
      <div class="ppx-header">
        <div class="ppx-avatar-wrap ${c.is_shiny ? "shiny-glow" : ""}">
          ${fullSpriteUrl ? `<img class="ppx-avatar" src="${fullSpriteUrl}" alt="${c.species_name || c.species_id || ""}" />` : ""}
        </div>
        <div class="ppx-header-info">
          <div class="ppx-title-row">
            <span class="ppx-name">${c.nickname && c.nickname !== c.species_name ? c.nickname : (c.species_name || c.species_id || "Criatura")}</span>
            ${genderSymbol(c.gender)}
          </div>
          <div class="ppx-subtitle">
            ${c.species_name && c.nickname && c.nickname !== c.species_name ? `<span class="ppx-species">${c.species_name}</span>` : ""}
            <span class="ppx-level">Nv. ${c.level ?? "?"}</span>
          </div>
          <div class="ppx-badges-row">
            ${buildQualityPill(c.quality)}
            ${badges.join("")}
          </div>
        </div>
      </div>

      <div class="ppx-types-row">${buildTypeChips(c.elements)}</div>

      <div class="ppx-section">
        <div class="ppx-section-title">Estatísticas</div>
        <div class="ppx-stats">
          ${statKeys.map((k) => statRow(k, currentStats[k])).join("")}
        </div>
      </div>

      <div class="ppx-section ppx-iv-section">
        <div class="ppx-section-title">
          IVs (Individual Values)
          ${ivTotal !== null ? `<span class="ppx-iv-total-badge">${ivTotal}/186</span>` : ""}
        </div>
        <div class="ppx-ivs">
          ${statKeys.map((k) => ivRow(k, c.ivs?.[k])).join("")}
        </div>
      </div>

      <div class="ppx-section">
        <div class="ppx-section-title">Natureza</div>
        ${buildNatureInfo(c.nature)}
      </div>

      <div class="ppx-section ppx-meta-grid">
        <div class="ppx-meta-item">
          <span class="ppx-meta-label">Poder</span>
          <span class="ppx-meta-value">${c.power ?? "—"}</span>
        </div>
        <div class="ppx-meta-item">
          <span class="ppx-meta-label">Multiplicador</span>
          <span class="ppx-meta-value">${c.quality_multiplier ? `x${c.quality_multiplier.toFixed(3)}` : "—"}</span>
        </div>
        <div class="ppx-meta-item">
          <span class="ppx-meta-label">Preço</span>
          <span class="ppx-meta-value">${listing.price ?? "—"} ${listing.currency ?? ""}</span>
        </div>
        <div class="ppx-meta-item">
          <span class="ppx-meta-label">Quantidade</span>
          <span class="ppx-meta-value">${listing.remaining_qty ?? listing.qty ?? "—"}</span>
        </div>
      </div>

      <div class="ppx-footer">
        <div class="ppx-footer-row">
          <span>Capturado por</span>
          <strong>${c.captured_by_name || "—"}</strong>
        </div>
        <div class="ppx-footer-row">
          <span>Capturado em</span>
          <strong>${formatDate(c.captured_at)}</strong>
        </div>
        <div class="ppx-footer-row">
          <span>Vendedor</span>
          <strong>${listing.seller_name || "—"}</strong>
        </div>
      </div>
    </div>`;
}

function renderTooltip(listing) {
  const el = ensureTooltipEl();
  el.innerHTML = buildTooltipContent(listing);
}

/* ------------------------------------------------------------------ */
/* Posicionamento                                                      */
/* ------------------------------------------------------------------ */

function positionTooltip(clientX, clientY) {
  if (!tooltipEl) return;
  const OFFSET = 16;
  const rect = tooltipEl.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = clientX + OFFSET;
  let top = clientY + OFFSET;

  if (left + rect.width > vw - 8) left = clientX - rect.width - OFFSET;
  if (left < 8) left = 8;

  if (top + rect.height > vh - 8) top = clientY - rect.height - OFFSET;
  if (top < 8) top = 8;

  tooltipEl.style.left = `${left}px`;
  tooltipEl.style.top = `${top}px`;
}

/* ------------------------------------------------------------------ */
/* Eventos de hover (delegação)                                        */
/* ------------------------------------------------------------------ */

async function showTooltipFor(article, clientX, clientY) {
  const id = article.dataset.listingId;
  if (!id) return;

  currentHoverId = id;
  const el = ensureTooltipEl();
  el.classList.add("visible");

  let listing = listingsCache.get(id);
  renderTooltip(listing);
  positionTooltip(clientX, clientY);

  if (!listing) {
    await fetchListings();
    if (currentHoverId !== id) return; // usuário já saiu / trocou de item
    listing = listingsCache.get(id);
    renderTooltip(listing);
    positionTooltip(clientX, clientY);
  }
}

function hideTooltip() {
  currentHoverId = null;
  if (tooltipEl) tooltipEl.classList.remove("visible");
}

document.addEventListener("mouseover", (e) => {
  const article = e.target.closest(ARTICLE_SELECTOR);
  if (!article) return;
  if (currentHoverId === article.dataset.listingId) return;
  showTooltipFor(article, e.clientX, e.clientY);
});

document.addEventListener("mouseout", (e) => {
  const article = e.target.closest(ARTICLE_SELECTOR);
  if (!article) return;
  const related = e.relatedTarget;
  if (related && article.contains(related)) return;
  hideTooltip();
});

document.addEventListener("mousemove", (e) => {
  if (tooltipEl && tooltipEl.classList.contains("visible") && currentHoverId) {
    positionTooltip(e.clientX, e.clientY);
  }
});

// Esconde o tooltip se a página rolar bruscamente ou o usuário sair da janela
window.addEventListener("scroll", () => hideTooltip(), { passive: true });
document.addEventListener("mouseleave", () => hideTooltip());

})();
