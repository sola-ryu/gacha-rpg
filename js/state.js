// Player save-state management: defaults, persistence, and mutators.
// A tiny EventTarget-based store — screens subscribe to "change" and re-render.

const STORAGE_KEY = "gacha-rpg-save-v1";
const STAMINA_REGEN_MS = 30 * 60 * 1000; // 1 stamina per 30 min
const BASE_STAMINA_MAX = 20;
const STAMINA_MAX_CAP = 50;

const DUPLICATE_GOLD = { 1: 50, 2: 50, 3: 50, 4: 300, 5: 1000 };

function defaultState() {
  return {
    version: 1,
    gems: 1600,
    gold: 500,
    stamina: BASE_STAMINA_MAX,
    staminaKeys: 0,
    lastStaminaUpdate: Date.now(),
    characters: {
      pip: { level: 1, exp: 0, outfit: null, weapon: null, accessory: null }
    },
    outfits: {},
    weapons: {},
    accessories: {},
    materials: {},
    team: ["pip", null, null, null, null],
    stagesCleared: [],
    gacha: {
      standard: { pullCount: 0, pity: 0, guaranteedFeatured: false, lastFreePackDate: null }
    },
    dailyLogin: { streak: 0, lastClaimDate: null },
    settings: { sound: true, music: true }
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const saved = JSON.parse(raw);
    return { ...defaultState(), ...saved };
  } catch (err) {
    console.warn("Failed to load save, starting fresh.", err);
    return defaultState();
  }
}

class Store extends EventTarget {
  constructor(state) {
    super();
    this.state = state;
  }
  /** Run a mutator against the live state, persist, then notify subscribers. */
  update(mutator) {
    const result = mutator(this.state);
    this.persist();
    this.dispatchEvent(new Event("change"));
    return result;
  }
  persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }
  onChange(fn) {
    this.addEventListener("change", fn);
    return () => this.removeEventListener("change", fn);
  }
}

export const store = new Store(loadState());

// ---------------------------------------------------------------------------
// Stamina
// ---------------------------------------------------------------------------

export function getStaminaMax(state) {
  const bonusFromCharacters = Math.max(0, Object.keys(state.characters).length - 1) * 2;
  const bonusFromKeys = state.staminaKeys * 5;
  return Math.min(STAMINA_MAX_CAP, BASE_STAMINA_MAX + bonusFromCharacters + bonusFromKeys);
}

/** Recomputes current stamina from elapsed time; call before reading/spending. */
export function regenStamina(state) {
  const max = getStaminaMax(state);
  if (state.stamina >= max) {
    state.lastStaminaUpdate = Date.now();
    return;
  }
  const elapsed = Date.now() - state.lastStaminaUpdate;
  const gained = Math.floor(elapsed / STAMINA_REGEN_MS);
  if (gained > 0) {
    state.stamina = Math.min(max, state.stamina + gained);
    state.lastStaminaUpdate += gained * STAMINA_REGEN_MS;
  }
}

export function spendStamina(state, amount) {
  regenStamina(state);
  if (state.stamina < amount) return false;
  state.stamina -= amount;
  return true;
}

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

export function canAfford(state, { gems = 0, gold = 0 }) {
  return state.gems >= gems && state.gold >= gold;
}

export function spendCurrency(state, { gems = 0, gold = 0 }) {
  if (!canAfford(state, { gems, gold })) return false;
  state.gems -= gems;
  state.gold -= gold;
  return true;
}

export function addCurrency(state, { gems = 0, gold = 0 }) {
  state.gems += gems;
  state.gold += gold;
}

// ---------------------------------------------------------------------------
// Inventory grants (used by the gacha system and battle rewards)
// ---------------------------------------------------------------------------

export function grantCharacter(state, charId, rarity) {
  if (state.characters[charId]) {
    const gold = DUPLICATE_GOLD[rarity] ?? 50;
    state.gold += gold;
    return { isNew: false, goldAwarded: gold };
  }
  state.characters[charId] = { level: 1, exp: 0, outfit: null, weapon: null, accessory: null };
  return { isNew: true, goldAwarded: 0 };
}

function grantOwnedFlag(state, bucketName, id, rarity) {
  const bucket = state[bucketName];
  if (bucket[id]) {
    const gold = DUPLICATE_GOLD[rarity] ?? 50;
    state.gold += gold;
    return { isNew: false, goldAwarded: gold };
  }
  bucket[id] = true;
  return { isNew: true, goldAwarded: 0 };
}

export const grantOutfit = (state, id, rarity) => grantOwnedFlag(state, "outfits", id, rarity);
export const grantWeapon = (state, id, rarity) => grantOwnedFlag(state, "weapons", id, rarity);
export const grantAccessory = (state, id, rarity) => grantOwnedFlag(state, "accessories", id, rarity);

export function grantMaterial(state, id, amount = 1) {
  state.materials[id] = (state.materials[id] ?? 0) + amount;
}

export function consumeMaterial(state, id, amount = 1) {
  if ((state.materials[id] ?? 0) < amount) return false;
  state.materials[id] -= amount;
  return true;
}

// ---------------------------------------------------------------------------
// Team management
// ---------------------------------------------------------------------------

export function setTeamSlot(state, slotIndex, charId) {
  if (slotIndex < 0 || slotIndex > 4) return;
  // A character can only occupy one slot at a time.
  state.team = state.team.map((id, i) => (i === slotIndex ? charId : id === charId ? null : id));
}

export function clearTeamSlot(state, slotIndex) {
  if (slotIndex < 0 || slotIndex > 4) return;
  state.team[slotIndex] = null;
}

// ---------------------------------------------------------------------------
// Stages / progression
// ---------------------------------------------------------------------------

export function markStageCleared(state, stageId) {
  if (!state.stagesCleared.includes(stageId)) state.stagesCleared.push(stageId);
}

// ---------------------------------------------------------------------------
// Daily login
// ---------------------------------------------------------------------------

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function canClaimDailyLogin(state) {
  return state.dailyLogin.lastClaimDate !== todayKey();
}

const DAILY_REWARDS = [
  { gems: 50 },
  { gems: 50 },
  { gems: 50 },
  { staminaKeys: 1 },
  { gems: 50 },
  { gems: 50 },
  { gems: 200, staminaKeys: 1 }
];

export function claimDailyLogin(state) {
  if (!canClaimDailyLogin(state)) return null;
  const today = todayKey();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streakBroken = state.dailyLogin.lastClaimDate !== yesterday && state.dailyLogin.lastClaimDate !== null;
  state.dailyLogin.streak = streakBroken ? 1 : state.dailyLogin.streak + 1;
  if (state.dailyLogin.streak > 7) state.dailyLogin.streak = 1;
  state.dailyLogin.lastClaimDate = today;

  const reward = DAILY_REWARDS[state.dailyLogin.streak - 1] ?? DAILY_REWARDS[0];
  if (reward.gems) state.gems += reward.gems;
  if (reward.staminaKeys) state.staminaKeys += reward.staminaKeys;
  return { streak: state.dailyLogin.streak, reward };
}

// ---------------------------------------------------------------------------
// Save reset / export / import
// ---------------------------------------------------------------------------

export function resetProgress() {
  store.state = defaultState();
  store.persist();
  store.dispatchEvent(new Event("change"));
}

export function exportSave() {
  return JSON.stringify(store.state);
}

export function importSave(json) {
  const parsed = JSON.parse(json);
  store.state = { ...defaultState(), ...parsed };
  store.persist();
  store.dispatchEvent(new Event("change"));
}
