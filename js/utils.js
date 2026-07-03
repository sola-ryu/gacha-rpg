// Shared helpers used across the app.

export const RARITY_LABELS = {
  1: "Common",
  2: "Uncommon",
  3: "Rare",
  4: "Epic",
  5: "Legendary"
};

export function rarityLabel(rarity) {
  return RARITY_LABELS[rarity] ?? `Rarity ${rarity}`;
}

export function rarityStars(rarity) {
  return "★".repeat(rarity);
}

export function formatNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return Math.floor(n).toLocaleString();
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a weighted-random entry from [{ weight, ...}] */
export function weightedPick(entries, weightFn = (e) => e.weight) {
  const total = entries.reduce((sum, e) => sum + weightFn(e), 0);
  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= weightFn(entry);
    if (roll <= 0) return entry;
  }
  return entries[entries.length - 1];
}

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "html") node.innerHTML = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === "dataset") {
      for (const [dKey, dVal] of Object.entries(value)) node.dataset[dKey] = dVal;
    } else {
      node.setAttribute(key, value);
    }
  }
  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/**
 * Builds an item-icon element that renders the given image, falling back to a
 * rarity-colored placeholder (initial letter) when no image path exists or the
 * asset fails to load. Used for outfits (no art yet) and as a safety net.
 */
export function itemIcon({ image, name, rarity, level, count, extraClass = "" }) {
  const wrap = el("div", {
    class: `item-icon ${extraClass}`,
    style: `--rarity-glow: var(--rarity-${rarity}); --rarity-glow-soft: var(--rarity-${rarity}-glow);`
  });

  if (image) {
    const img = el("img", { src: image.replace(/\.png$/i, ".webp"), alt: name, loading: "lazy" });
    img.addEventListener("error", () => {
      img.replaceWith(placeholderNode(name, rarity));
    });
    wrap.append(img);
  } else {
    wrap.append(placeholderNode(name, rarity));
  }

  wrap.append(
    el("div", { class: "item-icon__rarity" },
      Array.from({ length: rarity }, () => el("span", { class: "item-icon__star" }, "★"))
    )
  );

  if (level != null) wrap.append(el("div", { class: "item-icon__level" }, `Lv${level}`));
  if (count != null && count > 1) wrap.append(el("div", { class: "item-icon__count" }, `×${count}`));

  return wrap;
}

function placeholderNode(name, rarity) {
  return el("div", { class: "item-icon__placeholder" }, (name || "?").charAt(0).toUpperCase());
}

/** Returns an <img> that swaps itself for a lettered placeholder on load failure or missing src. */
export function imageOrPlaceholder(image, name) {
  if (!image) return placeholderNode(name);
  const img = el("img", { src: image.replace(/\.png$/i, ".webp"), alt: name });
  img.addEventListener("error", () => img.replaceWith(placeholderNode(name)));
  return img;
}

export function toast(message, variant = "") {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = el("div", { class: "toast-stack" });
    document.body.append(stack);
  }
  const node = el("div", { class: `toast ${variant ? `toast--${variant}` : ""}` }, message);
  stack.append(node);
  setTimeout(() => {
    node.style.transition = "opacity 200ms ease";
    node.style.opacity = "0";
    setTimeout(() => node.remove(), 220);
  }, 2200);
}

export function findById(list, id) {
  return list.find((item) => item.id === id);
}
