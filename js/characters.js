// Derived character logic: computed stats, leveling, and equipment.

import { GAME_DATA } from "../data.js";
import { findById } from "./utils.js";
import { consumeMaterial } from "./state.js";

const LEVEL_CAP = 60;

export function getCharacterDef(charId) {
  return findById(GAME_DATA.characters, charId);
}

export function getOwnedCharacterIds(state) {
  return Object.keys(state.characters);
}

/** Total exp required to go from `level` to `level + 1`. */
export function expToNextLevel(level) {
  return Math.round(80 * level ** 1.4);
}

/** Applies exp to an owned character, cascading level-ups as thresholds are crossed. */
export function addExp(state, charId, amount) {
  const owned = state.characters[charId];
  if (!owned) return;
  owned.exp += amount;
  while (owned.level < LEVEL_CAP) {
    const needed = expToNextLevel(owned.level);
    if (owned.exp < needed) break;
    owned.exp -= needed;
    owned.level += 1;
  }
  if (owned.level >= LEVEL_CAP) {
    owned.level = LEVEL_CAP;
    owned.exp = 0;
  }
}

export function useExpMaterial(state, charId, materialId) {
  const material = findById(GAME_DATA.materials, materialId);
  if (!material || material.effect.type !== "exp") return false;
  if (!consumeMaterial(state, materialId, 1)) return false;
  addExp(state, charId, material.effect.amount);
  return true;
}

export function equipItem(state, charId, slot, itemId) {
  const owned = state.characters[charId];
  if (!owned) return;
  owned[slot] = itemId || null;
}

function getEquippedBonuses(state, owned) {
  const bonuses = { hpPercent: 0, atkPercent: 0, defPercent: 0, spdPercent: 0, critRateFlat: 0, critDmgFlat: 0 };
  const pieces = [
    owned.outfit && findById(GAME_DATA.outfits, owned.outfit),
    owned.weapon && findById(GAME_DATA.weapons, owned.weapon),
    owned.accessory && findById(GAME_DATA.accessories, owned.accessory)
  ].filter(Boolean);

  for (const piece of pieces) {
    for (const [key, value] of Object.entries(piece.bonuses)) {
      bonuses[key] = (bonuses[key] ?? 0) + value;
    }
  }
  return bonuses;
}

/** Computes final battle-ready stats for an owned character (level + equipment applied). */
export function computeCharacterStats(state, charId) {
  const def = getCharacterDef(charId);
  const owned = state.characters[charId];
  if (!def || !owned) return null;

  const levelBonus = owned.level - 1;
  const base = {
    hp: def.baseStats.hp + def.growth.hpPerLevel * levelBonus,
    atk: def.baseStats.atk + def.growth.atkPerLevel * levelBonus,
    def: def.baseStats.def + def.growth.defPerLevel * levelBonus,
    spd: def.baseStats.spd + def.growth.spdPerLevel * levelBonus,
    critRate: def.baseStats.critRate,
    critDmg: def.baseStats.critDmg
  };

  const bonus = getEquippedBonuses(state, owned);
  return {
    hp: Math.round(base.hp * (1 + bonus.hpPercent / 100)),
    atk: Math.round(base.atk * (1 + bonus.atkPercent / 100)),
    def: Math.round(base.def * (1 + bonus.defPercent / 100)),
    spd: Math.round(base.spd * (1 + bonus.spdPercent / 100)),
    critRate: base.critRate + bonus.critRateFlat,
    critDmg: base.critDmg + bonus.critDmgFlat
  };
}

/** Returns the list of bond bonuses currently active for a character given the team roster. */
export function getActiveBonds(charId, teamIds) {
  const def = getCharacterDef(charId);
  if (!def) return [];
  return def.bondBonuses.filter((bond) => teamIds.includes(bond.with));
}

export { LEVEL_CAP };
