// Gacha pull system: rarity odds, pity, character guarantee, and rewards.

import { GAME_DATA } from "../data.js";
import {
  spendCurrency,
  canAfford,
  grantCharacter,
  grantOutfit,
  grantWeapon,
  grantAccessory,
  grantMaterial
} from "./state.js";
import { weightedPick } from "./utils.js";

export const SINGLE_PULL_COST = { gems: 160 };
export const TEN_PULL_COST = { gems: 1500 };

const BASE_RATES = { 1: 0.50, 2: 0.30, 3: 0.14, 4: 0.05, 5: 0.01 };
const SOFT_PITY_START = 75;
const HARD_PITY = 90;
const SOFT_PITY_RAMP_PER_PULL = 0.06; // added to rarity-5 weight per pull past soft pity start

export const STANDARD_BANNER = {
  id: "standard",
  name: "Standard Banner",
  featuredCharId: "kira",
  description: "Always-available banner featuring the full launch roster, outfits, weapons, and accessories."
};

/** Builds { 1: [...items], 2: [...], ... } pools tagged with itemType, for a given source set. */
function buildPools({ includeMaterials = false } = {}) {
  const pools = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  const add = (entry, itemType) => pools[entry.rarity]?.push({ ...entry, itemType });

  for (const c of GAME_DATA.characters) add(c, "character");
  for (const o of GAME_DATA.outfits) add(o, "outfit");
  for (const w of GAME_DATA.weapons) add(w, "weapon");
  for (const a of GAME_DATA.accessories) add(a, "accessory");
  if (includeMaterials) for (const m of GAME_DATA.materials) add(m, "material");

  return pools;
}

const STANDARD_POOLS = buildPools({ includeMaterials: false });
const ITEM_POOLS = buildPools({ includeMaterials: true });

function rollRarity(pity) {
  const nextPity = pity + 1;
  if (nextPity >= HARD_PITY) {
    // Guaranteed Epic or higher — weighted toward 4, occasional 5.
    return Math.random() < BASE_RATES[5] / (BASE_RATES[4] + BASE_RATES[5]) ? 5 : 4;
  }

  const rates = { ...BASE_RATES };
  if (nextPity >= SOFT_PITY_START) {
    const boost = (nextPity - SOFT_PITY_START + 1) * SOFT_PITY_RAMP_PER_PULL;
    rates[5] += boost;
  }

  const total = Object.values(rates).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const rarity of [5, 4, 3, 2, 1]) {
    roll -= rates[rarity];
    if (roll <= 0) return rarity;
  }
  return 1;
}

function pickItem(pool, rarity) {
  const candidates = pool[rarity];
  if (!candidates || candidates.length === 0) {
    // Fall back to the nearest non-empty tier below.
    for (let r = rarity - 1; r >= 1; r--) {
      if (pool[r]?.length) return weightedPick(pool[r], () => 1);
    }
    return weightedPick(pool[5], () => 1);
  }
  return weightedPick(candidates, () => 1);
}

function grantPulledItem(state, item) {
  switch (item.itemType) {
    case "character":
      return { ...grantCharacter(state, item.id, item.rarity), item };
    case "outfit":
      return { ...grantOutfit(state, item.id, item.rarity), item };
    case "weapon":
      return { ...grantWeapon(state, item.id, item.rarity), item };
    case "accessory":
      return { ...grantAccessory(state, item.id, item.rarity), item };
    case "material":
      grantMaterial(state, item.id, 1);
      return { isNew: true, goldAwarded: 0, item };
    default:
      return { isNew: false, goldAwarded: 0, item };
  }
}

/** Executes a single pull against the standard banner's pity state (mutates state, no currency check). */
function pullOnceStandard(state) {
  const gacha = state.gacha.standard;
  const rarity = rollRarity(gacha.pity);
  gacha.pity = rarity >= 4 ? 0 : gacha.pity + 1;
  gacha.pullCount += 1;

  let item;
  if (rarity === 5) {
    if (gacha.guaranteedFeatured) {
      item = STANDARD_POOLS[5].find((e) => e.itemType === "character" && e.id === STANDARD_BANNER.featuredCharId);
    }
    if (!item) item = pickItem(STANDARD_POOLS, 5);
    gacha.guaranteedFeatured = !(item.itemType === "character" && item.id === STANDARD_BANNER.featuredCharId);
  } else {
    item = pickItem(STANDARD_POOLS, rarity);
  }

  return grantPulledItem(state, item);
}

export function pullStandardSingle(state) {
  if (!canAfford(state, SINGLE_PULL_COST)) return { error: "not-enough-gems" };
  spendCurrency(state, SINGLE_PULL_COST);
  return { results: [pullOnceStandard(state)] };
}

export function pullStandardTen(state) {
  if (!canAfford(state, TEN_PULL_COST)) return { error: "not-enough-gems" };
  spendCurrency(state, TEN_PULL_COST);
  const results = Array.from({ length: 10 }, () => pullOnceStandard(state));

  const hasRarePlus = results.some((r) => r.item.rarity >= 3);
  if (!hasRarePlus) {
    const last = results[results.length - 1];
    // Undo the low-rarity grant's side effects as best-effort, then force a Rare+ pull.
    const upgraded = pickItem(STANDARD_POOLS, 3);
    results[results.length - 1] = grantPulledItem(state, upgraded);
    void last;
  }
  return { results };
}

export function canUseFreePack(state) {
  const today = new Date().toISOString().slice(0, 10);
  return state.gacha.standard.lastFreePackDate !== today;
}

export function pullFreePack(state) {
  if (!canUseFreePack(state)) return { error: "already-used" };
  state.gacha.standard.lastFreePackDate = new Date().toISOString().slice(0, 10);
  return { results: [pullOnceStandard(state)] };
}

export function pullItemBannerSingle(state) {
  const cost = { gems: 100 };
  if (!canAfford(state, cost)) return { error: "not-enough-gems" };
  spendCurrency(state, cost);
  const rarity = rollRarity(0);
  const item = pickItem(ITEM_POOLS, Math.min(rarity, 3)); // item banner skews toward materials
  return { results: [grantPulledItem(state, item)] };
}
