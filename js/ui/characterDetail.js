import { GAME_DATA } from "../../data.js";
import { store } from "../state.js";
import { navigate } from "../router.js";
import {
  getCharacterDef,
  computeCharacterStats,
  expToNextLevel,
  useExpMaterial,
  equipItem,
  getActiveBonds,
  LEVEL_CAP
} from "../characters.js";
import { el, itemIcon, rarityLabel, rarityStars, findById, toast } from "../utils.js";

export function renderCharacterDetail(container, params) {
  const state = store.state;
  const charId = params.id;
  const def = getCharacterDef(charId);
  const owned = state.characters[charId];

  if (!def || !owned) {
    container.append(el("div", { class: "screen" }, [
      el("div", { class: "empty-state" }, [
        el("div", { class: "empty-state__icon" }, "❓"),
        el("p", {}, "You don't own this character yet."),
        el("button", { class: "btn btn-primary", onclick: () => navigate("roster") }, "Back to Roster")
      ])
    ]));
    return;
  }

  const stats = computeCharacterStats(state, charId);

  const header = el("div", { class: "char-detail__header" }, [
    el("div", { class: "char-detail__portrait" }, itemIcon({ image: def.image, name: def.name, rarity: def.rarity, level: owned.level })),
    el("div", { class: "char-detail__info" }, [
      el("h1", { class: "char-detail__name" }, def.name),
      el("div", { class: "char-detail__class" }, `${rarityStars(def.rarity)} · ${rarityLabel(def.rarity)} · ${def.class}`),
      el("p", { class: "char-detail__desc" }, def.description),
      levelRow()
    ])
  ]);

  function levelRow() {
    const needed = expToNextLevel(owned.level);
    const isMaxed = owned.level >= LEVEL_CAP;
    const expBooks = GAME_DATA.materials.filter((m) => m.effect.type === "exp" && (state.materials[m.id] ?? 0) > 0);

    return el("div", { class: "char-detail__level-row" }, [
      el("span", { class: "badge" }, `Level ${owned.level}${isMaxed ? " (MAX)" : ""}`),
      !isMaxed && el("div", { style: "flex:1; min-width:140px" }, [
        el("div", { class: "progress" }, [
          el("div", { class: "progress__fill progress__fill--exp", style: `width:${(owned.exp / needed) * 100}%` })
        ]),
        el("div", { class: "text-muted", style: "font-size:0.72rem; margin-top:2px" }, `${owned.exp} / ${needed} EXP`)
      ]),
      !isMaxed && expBooks.length > 0
        ? el("div", { style: "display:flex; gap:6px; flex-wrap:wrap" },
            expBooks.map((m) =>
              el("button", {
                class: "btn btn-sm btn-ghost",
                onclick: () => {
                  store.update((s) => useExpMaterial(s, charId, m.id));
                  toast(`Used ${m.name}.`, "success");
                }
              }, `Use ${m.name} (${state.materials[m.id]})`)
            )
          )
        : !isMaxed && el("span", { class: "text-muted", style: "font-size:0.8rem" }, "No EXP books available")
    ]);
  }

  const statList = el("div", { class: "stat-list panel" }, [
    statRow("HP", stats.hp),
    statRow("ATK", stats.atk),
    statRow("DEF", stats.def),
    statRow("SPD", stats.spd),
    statRow("Crit Rate", `${stats.critRate}%`),
    statRow("Crit DMG", `${stats.critDmg}%`)
  ]);

  const skillList = el("div", { class: "skill-list" },
    def.skills.map((s) =>
      el("div", { class: "skill-row" }, [
        el("div", { class: "skill-row__badge" }, s.type === "ultimate" ? "🌟" : s.type === "skill" ? "✨" : "👊"),
        el("div", {}, [
          el("div", { class: "skill-row__name" }, `${s.name} ${s.cost ? `(${s.cost} energy)` : ""}`),
          el("div", { class: "skill-row__desc" }, s.desc)
        ])
      ])
    )
  );

  const equipSlots = el("div", { class: "equip-slots" }, [
    equipSlotCard(
      "Outfit", "outfit",
      owned.outfit && findById(GAME_DATA.outfits, owned.outfit),
      GAME_DATA.outfits.filter((o) => o.characterId === charId && state.outfits[o.id])
    ),
    equipSlotCard(
      "Weapon", "weapon",
      owned.weapon && findById(GAME_DATA.weapons, owned.weapon),
      GAME_DATA.weapons.filter((w) => w.characterId === charId && state.weapons[w.id])
    ),
    equipSlotCard(
      "Accessory", "accessory",
      owned.accessory && findById(GAME_DATA.accessories, owned.accessory),
      GAME_DATA.accessories.filter((a) => state.accessories[a.id])
    )
  ]);

  function equipSlotCard(label, slot, equippedDef, options) {
    return el("div", {
      class: "equip-card",
      onclick: () => openEquipPicker(label, slot, options)
    }, [
      equippedDef
        ? itemIcon({ image: equippedDef.image, name: equippedDef.name, rarity: equippedDef.rarity })
        : el("div", { class: "item-icon item-icon--empty" }, el("span", { class: "equip-card__plus" }, "+")),
      el("div", { class: "equip-card__body" }, [
        el("div", { class: "equip-slot__label" }, label),
        el("div", { class: "equip-card__name" }, equippedDef ? equippedDef.name : "— None —"),
        equippedDef && el("div", { class: "equip-card__bonus text-muted" }, formatBonuses(equippedDef.bonuses))
      ])
    ]);
  }

  function openEquipPicker(label, slot, options) {
    const overlay = el("div", {
      class: "overlay",
      onclick: (e) => { if (e.target === overlay) overlay.remove(); }
    });

    function pick(itemId) {
      store.update((s) => equipItem(s, charId, slot, itemId));
      overlay.remove();
    }

    const noneCard = el("div", { class: "item-card is-clickable", onclick: () => pick("") }, [
      el("div", { class: "item-icon item-icon--empty" }, el("span", { class: "equip-card__plus" }, "✕")),
      el("div", { class: "item-card__name" }, "None")
    ]);

    const optionCards = options.map((o) =>
      el("div", { class: "item-card is-clickable", onclick: () => pick(o.id) }, [
        itemIcon({ image: o.image, name: o.name, rarity: o.rarity }),
        el("div", { class: "item-card__name" }, o.name),
        el("div", { class: "item-card__meta" }, formatBonuses(o.bonuses))
      ])
    );

    const modal = el("div", { class: "modal" }, [
      el("button", { class: "modal__close", onclick: () => overlay.remove() }, "✕"),
      el("h3", {}, `Select ${label}`),
      options.length === 0
        ? el("p", { class: "text-muted", style: "margin-top:1rem" }, "No items owned for this slot.")
        : el("div", { class: "grid", style: "margin-top:1rem" }, [noneCard, ...optionCards])
    ]);

    overlay.append(modal);
    document.body.append(overlay);
  }

  const bonds = getActiveBonds(charId, state.team);
  const bondList = el("div", { class: "bond-list" },
    def.bondBonuses.map((b) => {
      const partner = findById(GAME_DATA.characters, b.with);
      const active = bonds.includes(b);
      return el("div", { class: `bond-row ${active ? "is-active" : ""}` }, [
        el("span", {}, `${b.name} — with ${partner?.name ?? b.with}`),
        el("span", { class: "text-muted" }, active ? "Active" : b.desc)
      ]);
    })
  );

  container.append(
    el("div", { class: "screen" }, [
      el("button", { class: "btn btn-ghost btn-sm", onclick: () => navigate("roster"), style: "margin-bottom:1rem" }, "← Back to Roster"),
      header,
      el("div", { class: "panel", style: "margin-top:1rem" }, [el("h3", {}, "Stats"), statList]),
      el("div", { class: "panel", style: "margin-top:1rem" }, [el("h3", {}, "Skills"), skillList]),
      el("div", { class: "panel", style: "margin-top:1rem" }, [el("h3", {}, "Equipment"), equipSlots]),
      el("div", { class: "panel", style: "margin-top:1rem" }, [el("h3", {}, "Bond Bonuses"), bondList])
    ])
  );
}

const BONUS_LABELS = {
  hpPercent: "HP",
  atkPercent: "ATK",
  defPercent: "DEF",
  spdPercent: "SPD",
  critRateFlat: "Crit Rate",
  critDmgFlat: "Crit DMG"
};

function formatBonuses(bonuses) {
  return Object.entries(bonuses)
    .map(([key, value]) => `+${value}% ${BONUS_LABELS[key] ?? key}`)
    .join(", ");
}

function statRow(label, value) {
  return el("div", { class: "stat-row" }, [
    el("span", { class: "stat-row__label" }, label),
    el("span", { class: "stat-row__value" }, String(value))
  ]);
}
