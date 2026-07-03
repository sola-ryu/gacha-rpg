import { GAME_DATA } from "../../data.js";
import { store, spendCurrency, canAfford, grantMaterial, getStaminaMax, regenStamina } from "../state.js";
import { el, itemIcon, toast, formatNumber } from "../utils.js";

const MATERIAL_GOLD_COST = { 1: 80, 2: 150, 3: 320 };
const STAMINA_GEM_COST_PER_POINT = 5;

export function renderShop(container) {
  const state = store.state;
  regenStamina(state);
  const max = getStaminaMax(state);
  const missing = max - state.stamina;
  const refillCost = missing * STAMINA_GEM_COST_PER_POINT;

  const staminaPanel = el("div", { class: "panel shop-section" }, [
    el("h3", {}, "Stamina Refill"),
    el("p", { class: "text-muted" }, `Current: ${state.stamina} / ${max}`),
    el("button", {
      class: "btn btn-primary",
      disabled: missing === 0,
      onclick: () => {
        const ok = store.update((s) => {
          regenStamina(s);
          const need = getStaminaMax(s) - s.stamina;
          const cost = need * STAMINA_GEM_COST_PER_POINT;
          if (need === 0 || !spendCurrency(s, { gems: cost })) return false;
          s.stamina = getStaminaMax(s);
          return true;
        });
        toast(ok ? "Stamina refilled!" : "Not enough Gems.", ok ? "success" : "error");
      }
    }, missing === 0 ? "Full" : `Refill for ${formatNumber(refillCost)} Gems`)
  ]);

  const materialsGrid = el("div", { class: "grid" },
    GAME_DATA.materials.map((m) => {
      const cost = MATERIAL_GOLD_COST[m.rarity] ?? 100;
      return el("div", { class: "shop-item" }, [
        itemIcon({ image: m.image, name: m.name, rarity: m.rarity, count: state.materials[m.id] }),
        el("div", { class: "item-card__name" }, m.name),
        el("div", { class: "shop-item__price" }, `${cost} Gold`),
        el("button", {
          class: "btn btn-sm btn-ghost btn-block",
          onclick: () => {
            const ok = store.update((s) => {
              if (!canAfford(s, { gold: cost })) return false;
              spendCurrency(s, { gold: cost });
              grantMaterial(s, m.id, 1);
              return true;
            });
            toast(ok ? `Bought ${m.name}.` : "Not enough Gold.", ok ? "success" : "error");
          }
        }, "Buy")
      ]);
    })
  );

  container.append(
    el("div", { class: "screen" }, [
      el("div", { class: "screen__header" }, [
        el("h1", { class: "screen__title" }, "Shop"),
        el("p", { class: "screen__subtitle" }, "Spend Gold and Gems on materials and stamina.")
      ]),
      staminaPanel,
      el("div", { class: "shop-section" }, [
        el("h3", { style: "margin-bottom:0.75rem" }, "Materials"),
        materialsGrid
      ])
    ])
  );
}
