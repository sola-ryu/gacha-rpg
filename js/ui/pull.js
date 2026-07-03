import { store } from "../state.js";
import {
  STANDARD_BANNER,
  SINGLE_PULL_COST,
  TEN_PULL_COST,
  pullStandardSingle,
  pullStandardTen,
  pullFreePack,
  pullItemBannerSingle,
  canUseFreePack
} from "../gacha.js";
import { el, itemIcon, rarityLabel, toast, imageOrPlaceholder } from "../utils.js";

const RATE_TEXT = "Common 50% · Uncommon 30% · Rare 14% · Epic 5% · Legendary 1%";
const HARD_PITY = 90;
const SOFT_PITY_START = 75;

export function renderPull(container) {
  const state = store.state;
  const gacha = state.gacha.standard;

  const pityProgress = el("div", { class: "progress", style: "max-width:280px" }, [
    el("div", { class: "progress__fill", style: `width:${Math.min(100, (gacha.pity / HARD_PITY) * 100)}%` })
  ]);

  const banner = el("section", { class: "pull-banner" }, [
    el("h2", { class: "pull-banner__title" }, STANDARD_BANNER.name),
    el("p", { class: "text-muted" }, STANDARD_BANNER.description),
    el("p", { class: "pull-banner__rates" }, RATE_TEXT),
    el("div", { class: "pull-actions" }, [
      el("button", {
        class: "btn btn-primary",
        onclick: () => runPull(pullStandardSingle)
      }, `Pull ×1 (${SINGLE_PULL_COST.gems} Gems)`),
      el("button", {
        class: "btn btn-primary",
        onclick: () => runPull(pullStandardTen)
      }, `Pull ×10 (${TEN_PULL_COST.gems} Gems)`),
      el("button", {
        class: "btn btn-ghost",
        disabled: !canUseFreePack(state),
        onclick: () => runPull(pullFreePack)
      }, canUseFreePack(state) ? "Free Pack" : "Free Pack (used today)")
    ]),
    el("div", { class: "pity-tracker" }, [
      el("span", {}, `Pity: ${gacha.pity} / ${HARD_PITY} (soft pity starts at ${SOFT_PITY_START})`),
      pityProgress,
      gacha.guaranteedFeatured ? el("span", { class: "badge badge--rarity-5" }, "Next 5★ guaranteed featured!") : null
    ])
  ]);

  const itemBanner = el("section", { class: "panel", style: "margin-top:1rem" }, [
    el("h3", {}, "Item Banner"),
    el("p", { class: "text-muted" }, "Skews toward materials and lower-rarity gear. 100 Gems per pull."),
    el("div", { class: "pull-actions" }, [
      el("button", {
        class: "btn btn-ghost",
        onclick: () => runPull(pullItemBannerSingle)
      }, "Pull ×1 (100 Gems)")
    ])
  ]);

  container.append(el("div", { class: "screen" }, [
    el("div", { class: "screen__header" }, [
      el("h1", { class: "screen__title" }, "Summon"),
      el("p", { class: "screen__subtitle" }, "Spend Gems to pull characters, outfits, weapons, and materials.")
    ]),
    banner,
    itemBanner
  ]));
}

function runPull(pullFn) {
  const outcome = store.update((s) => pullFn(s));
  if (outcome?.error === "not-enough-gems") {
    toast("Not enough Gems for that pull.", "error");
    return;
  }
  if (outcome?.error === "already-used") {
    toast("Free pack already used today.", "error");
    return;
  }
  playPullSequence(outcome.results);
}

function burstParticles(canvas, palette) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cx = width / 2;
  const cy = height / 2;
  const colors = palette === "gold" ? ["#ffcb47", "#fff2c2", "#ffb703"] : ["#b16bff", "#e0c3ff", "#8b5cf6"];
  const count = palette === "gold" ? 110 : 60;
  const particles = Array.from({ length: count }, () => ({
    x: cx,
    y: cy,
    angle: Math.random() * Math.PI * 2,
    speed: 2.5 + Math.random() * 7,
    size: 2 + Math.random() * 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 1
  }));

  const start = performance.now();
  function frame(t) {
    const elapsed = t - start;
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;
      p.speed *= 0.96;
      p.life -= 0.014;
      if (p.life <= 0) continue;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (elapsed < 1300) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, width, height);
  }
  requestAnimationFrame(frame);
}

function playPullSequence(results) {
  const overlay = el("div", { class: "pull-stage" });
  const flash = el("div", { class: "pull-stage__flash" });
  const canvas = el("canvas", { class: "pull-stage__canvas" });
  const hint = el("div", { class: "pull-stage__hint" });
  const back = el("div", { class: "pull-card__face pull-card__back" });
  const front = el("div", { class: "pull-card__face pull-card__front" }, "✦");
  const card = el("div", { class: "pull-card" }, [front, back]);
  const cardWrap = el("div", { class: "pull-card-wrap" }, card);

  const finish = () => {
    overlay.remove();
    showResultsPanel(results);
  };
  const skipBtn = el("button", { class: "btn btn-ghost pull-stage__skip", onclick: finish }, "Skip");

  overlay.append(flash, canvas, hint, cardWrap, skipBtn);
  document.body.append(overlay);

  let index = 0;

  function showCard(i) {
    const { item } = results[i];
    card.classList.remove("is-flipped");
    back.style.setProperty("--rarity-glow", `var(--rarity-${item.rarity})`);
    back.style.setProperty("--rarity-glow-soft", `var(--rarity-${item.rarity}-glow)`);
    back.replaceChildren(imageOrPlaceholder(item.image, item.name), el("div", { class: "pull-card__label" }, [
      el("div", { class: "pull-card__name" }, item.name),
      el("div", { class: "text-muted" }, rarityLabel(item.rarity))
    ]));
    hint.textContent = `Tap to reveal (${i + 1}/${results.length})`;
  }

  function revealCurrent() {
    const { item } = results[index];
    card.classList.add("is-flipped");
    if (item.rarity >= 4) burstParticles(canvas, item.rarity === 5 ? "gold" : "purple");
    if (item.rarity === 5) {
      flash.classList.add("is-flashing");
      setTimeout(() => flash.classList.remove("is-flashing"), 700);
    }
  }

  showCard(0);
  cardWrap.addEventListener("click", () => {
    if (!card.classList.contains("is-flipped")) {
      revealCurrent();
      return;
    }
    index += 1;
    if (index >= results.length) {
      finish();
      return;
    }
    showCard(index);
  });
}

function showResultsPanel(results) {
  const outlet = document.getElementById("outlet");
  const existing = outlet.querySelector(".pull-results-panel");
  if (existing) existing.remove();

  const panel = el("section", { class: "panel pull-results-panel", style: "margin-top:1rem" }, [
    el("h3", {}, "Pull Results"),
    el("div", { class: "pull-results" },
      results.map(({ item, isNew, goldAwarded }) =>
        el("div", { class: "item-card" }, [
          itemIcon({ image: item.image, name: item.name, rarity: item.rarity }),
          el("div", { class: "item-card__name" }, item.name),
          el("div", { class: "item-card__meta" }, isNew ? "NEW" : `Duplicate · +${goldAwarded} Gold`)
        ])
      )
    )
  ]);

  outlet.querySelector(".screen").append(panel);
}
